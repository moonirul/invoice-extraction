from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    environment: str


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: list | dict | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
