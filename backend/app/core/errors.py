import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger("app.errors")

def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        error_messages = []
        for err in exc.errors():
            loc = err.get("loc", [])
            field_name = loc[-1] if loc else "field"
            msg = err.get("msg", "Invalid value")
            # If msg is already clean custom message, use it
            if msg.startswith("Value error, "):
                msg = msg[len("Value error, "):]
            error_messages.append(f"{field_name}: {msg}")

        detail_message = "; ".join(error_messages) if error_messages else "Validation failed."
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": detail_message,
                "code": "VALIDATION_ERROR",
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.warning(f"IntegrityError on {request.method} {request.url.path}: {exc}")
        message = "A database integrity conflict occurred."
        error_str = str(exc.orig) if hasattr(exc, "orig") else str(exc)
        if "UNIQUE constraint failed" in error_str:
            message = "A record with this unique value already exists."

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "detail": message,
                "code": "CONFLICT",
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY",
        }
        code = code_map.get(exc.status_code, "HTTP_ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": detail,
                "code": code,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled server error on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An unexpected server error occurred.",
                "code": "INTERNAL_SERVER_ERROR",
            },
        )

