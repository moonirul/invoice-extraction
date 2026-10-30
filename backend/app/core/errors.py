"""Global exception handlers producing one consistent error envelope:

{"error": {"code": "...", "message": "...", "details": ..., "request_id": "..."}}
"""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError

logger = logging.getLogger(__name__)


def _response(
    request: Request, status: int, code: str, message: str, details: Any = None
) -> JSONResponse:
    error: dict[str, Any] = {
        "code": code,
        "message": message,
        "request_id": getattr(request.state, "request_id", None),
    }
    if details is not None:
        error["details"] = details
    return JSONResponse(status_code=status, content={"error": error})


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    level = logging.ERROR if exc.status_code >= 500 else logging.INFO
    logger.log(level, "%s: %s", exc.code, exc.message)
    return _response(request, exc.status_code, exc.code, exc.message, exc.details)


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = [
        {"field": ".".join(str(p) for p in err["loc"] if p != "body"), "message": err["msg"]}
        for err in exc.errors()
    ]
    return _response(request, 422, "validation_error", "Request validation failed.", details)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _response(request, exc.status_code, "http_error", str(exc.detail))


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception")
    return _response(request, 500, "internal_error", "An unexpected error occurred.")


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)
