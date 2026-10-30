from typing import Annotated

from fastapi import APIRouter, File, Query, UploadFile, status

from app.api.deps import InvoiceServiceDep
from app.schemas.common import ErrorResponse
from app.schemas.invoice import (
    ExtractionResponse,
    InvoiceData,
    InvoiceListResponse,
    SaveInvoiceResponse,
)

router = APIRouter(prefix="/invoices", tags=["invoices"])

_UPSTREAM_ERRORS = {
    502: {"model": ErrorResponse, "description": "n8n returned an error or invalid data"},
    504: {"model": ErrorResponse, "description": "n8n timed out"},
}


@router.post(
    "/extract",
    response_model=ExtractionResponse,
    summary="Extract structured data from a PDF invoice (does not persist anything)",
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        **_UPSTREAM_ERRORS,
    },
)
async def extract_invoice(
    service: InvoiceServiceDep, file: Annotated[UploadFile, File(description="PDF invoice")]
) -> ExtractionResponse:
    return await service.extract(file)


@router.post(
    "",
    response_model=SaveInvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm a reviewed invoice and log it to Google Sheets",
    responses={422: {"model": ErrorResponse}, **_UPSTREAM_ERRORS},
)
async def save_invoice(invoice: InvoiceData, service: InvoiceServiceDep) -> SaveInvoiceResponse:
    await service.save(invoice)
    return SaveInvoiceResponse()


@router.get(
    "",
    response_model=InvoiceListResponse,
    summary="List saved invoices (newest first, paginated, searchable)",
    responses=_UPSTREAM_ERRORS,
)
async def list_invoices(
    service: InvoiceServiceDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    q: Annotated[
        str | None, Query(max_length=100, description="Search number/supplier/customer")
    ] = None,
) -> InvoiceListResponse:
    return await service.list_saved(page=page, page_size=page_size, query=q)
