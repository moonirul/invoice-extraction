"""Thin, typed gateway to the n8n webhooks. All upstream failure modes are mapped to AppErrors."""

import asyncio
import logging
from typing import Any

import httpx

from app.core.config import Settings
from app.core.exceptions import UpstreamError, UpstreamTimeoutError, UpstreamUnavailableError

logger = logging.getLogger(__name__)

_RETRY_BACKOFF_SECONDS = 0.5


class N8NClient:
    def __init__(self, http: httpx.AsyncClient, settings: Settings) -> None:
        self._http = http
        self._settings = settings

    # ── public API ────────────────────────────────────────────────────────────

    async def extract(self, *, filename: str, text: str) -> dict[str, Any]:
        response = await self._request(
            "POST",
            str(self._settings.n8n_extract_webhook_url),
            json={"filename": filename, "extracted_text": text},
            timeout=self._settings.n8n_extract_timeout_seconds,
        )
        payload = self._json(response)
        return self._unwrap_extraction(payload)

    async def save(self, payload: dict[str, Any]) -> None:
        # No retries: a POST that reached n8n may already have appended a row.
        await self._request("POST", str(self._settings.n8n_save_webhook_url), json=payload)

    async def list_rows(self) -> list[dict[str, Any]]:
        response = await self._request("GET", str(self._settings.n8n_list_webhook_url), retries=2)
        payload = self._json(response, allow_empty=True)
        if payload is None:
            return []
        if isinstance(payload, dict):
            inner = payload.get("data", payload)
            payload = inner if isinstance(inner, list) else [inner]
        if not isinstance(payload, list):
            raise UpstreamError("n8n returned an unexpected shape for the invoice list.")
        return [row for row in payload if isinstance(row, dict) and row]

    # ── internals ─────────────────────────────────────────────────────────────

    def _headers(self) -> dict[str, str]:
        token = self._settings.n8n_auth_token
        if token and token.get_secret_value():
            return {self._settings.n8n_auth_header_name: token.get_secret_value()}
        return {}

    async def _request(
        self,
        method: str,
        url: str,
        *,
        json: Any = None,
        timeout: float | None = None,
        retries: int = 0,
    ) -> httpx.Response:
        timeout = timeout or self._settings.n8n_default_timeout_seconds
        attempt = 0
        while True:
            attempt += 1
            try:
                response = await self._http.request(
                    method, url, json=json, headers=self._headers(), timeout=timeout
                )
            except httpx.TimeoutException as exc:
                if attempt <= retries:
                    await asyncio.sleep(_RETRY_BACKOFF_SECONDS * attempt)
                    continue
                raise UpstreamTimeoutError() from exc
            except httpx.RequestError as exc:
                if attempt <= retries:
                    await asyncio.sleep(_RETRY_BACKOFF_SECONDS * attempt)
                    continue
                logger.error("n8n request failed: %s", type(exc).__name__)
                raise UpstreamUnavailableError() from exc

            if response.status_code >= 500 and attempt <= retries:
                await asyncio.sleep(_RETRY_BACKOFF_SECONDS * attempt)
                continue
            if response.status_code >= 400:
                raise self._status_error(response)
            return response

    @staticmethod
    def _status_error(response: httpx.Response) -> UpstreamError:
        hint = ""
        if response.status_code == 404:
            hint = (
                " Check that the workflow is active and that you are using the Production "
                "webhook URL (/webhook/...), not the test URL (/webhook-test/...)."
            )
        logger.error("n8n responded with HTTP %s", response.status_code)
        return UpstreamError(
            f"n8n responded with HTTP {response.status_code}.{hint}",
            details={"upstream_status": response.status_code},
        )

    @staticmethod
    def _json(response: httpx.Response, *, allow_empty: bool = False) -> Any:
        if not response.content.strip():
            if allow_empty:
                return None
            raise UpstreamError("n8n returned an empty response.")
        try:
            return response.json()
        except ValueError as exc:
            raise UpstreamError("n8n returned a response that is not valid JSON.") from exc

    @staticmethod
    def _unwrap_extraction(payload: Any) -> dict[str, Any]:
        """n8n commonly wraps results as ``[{...}]`` or ``{"output": {...}}``; normalise."""
        if isinstance(payload, list):
            payload = payload[0] if payload else None
        if isinstance(payload, dict) and isinstance(payload.get("output"), dict):
            payload = payload["output"]
        if not isinstance(payload, dict) or not payload:
            raise UpstreamError("n8n did not return any extracted invoice data.")
        return payload
