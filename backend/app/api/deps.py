"""FastAPI dependency providers (the composition root)."""

from typing import Annotated

import httpx
from fastapi import Depends, Request

from app.core.config import Settings, get_settings
from app.services.invoice_service import InvoiceService
from app.services.n8n_client import N8NClient

SettingsDep = Annotated[Settings, Depends(get_settings)]


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_n8n_client(
    http: Annotated[httpx.AsyncClient, Depends(get_http_client)], settings: SettingsDep
) -> N8NClient:
    return N8NClient(http, settings)


def get_invoice_service(
    n8n: Annotated[N8NClient, Depends(get_n8n_client)], settings: SettingsDep
) -> InvoiceService:
    return InvoiceService(n8n, settings)


InvoiceServiceDep = Annotated[InvoiceService, Depends(get_invoice_service)]
