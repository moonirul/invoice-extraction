import httpx
import pytest

from app.core.config import Settings
from app.core.exceptions import UpstreamError, UpstreamTimeoutError, UpstreamUnavailableError
from app.services import n8n_client as module
from app.services.n8n_client import N8NClient


def make_client(handler, **env) -> N8NClient:
    settings = Settings(
        n8n_extract_webhook_url="http://n8n.test/extract",
        n8n_save_webhook_url="http://n8n.test/save",
        n8n_list_webhook_url="http://n8n.test/list",
        **env,
    )
    http = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return N8NClient(http, settings)


@pytest.fixture(autouse=True)
def no_sleep(monkeypatch):
    monkeypatch.setattr(module, "_RETRY_BACKOFF_SECONDS", 0)


async def test_list_retries_on_5xx_then_succeeds():
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] < 3 else httpx.Response(200, json=[{"a": 1}])

    assert await make_client(handler).list_rows() == [{"a": 1}]
    assert calls["n"] == 3


async def test_save_is_never_retried():
    calls = {"n": 0}

    def handler(request):
        calls["n"] += 1
        return httpx.Response(500)

    with pytest.raises(UpstreamError):
        await make_client(handler).save({"x": 1})
    assert calls["n"] == 1


async def test_404_hint_mentions_production_url():
    with pytest.raises(UpstreamError) as info:
        await make_client(lambda r: httpx.Response(404)).extract(filename="a.pdf", text="t")
    assert "Production" in info.value.message


async def test_timeout_and_connect_errors_are_mapped():
    def timeout(request):
        raise httpx.ReadTimeout("slow")

    def refused(request):
        raise httpx.ConnectError("nope")

    with pytest.raises(UpstreamTimeoutError):
        await make_client(timeout).save({})
    with pytest.raises(UpstreamUnavailableError):
        await make_client(refused).save({})


async def test_auth_header_is_sent_and_empty_list_is_ok():
    seen = {}

    def handler(request):
        seen.update(request.headers)
        return httpx.Response(200, content=b"")

    client = make_client(handler, n8n_auth_token="s3cret")
    assert await client.list_rows() == []
    assert seen["x-webhook-secret"] == "s3cret"


async def test_invalid_json_from_extract():
    with pytest.raises(UpstreamError):
        await make_client(lambda r: httpx.Response(200, content=b"<html>")).extract(
            filename="a", text="t"
        )
