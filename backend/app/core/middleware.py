"""Request-context middleware: correlation id + access log."""

import logging
import re
import time
import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

from app.core.logging import request_id_ctx

logger = logging.getLogger("app.access")
_SAFE_ID = re.compile(r"[A-Za-z0-9_\-]{1,64}")


async def request_context_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    incoming = request.headers.get("X-Request-ID", "")
    request_id = incoming if _SAFE_ID.fullmatch(incoming) else uuid.uuid4().hex[:12]
    request.state.request_id = request_id
    token = request_id_ctx.set(request_id)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info("%s %s (%.0f ms)", request.method, request.url.path, elapsed_ms)
        request_id_ctx.reset(token)
    response.headers["X-Request-ID"] = request_id
    return response
