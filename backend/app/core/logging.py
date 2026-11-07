import logging
import time
from logging.handlers import RotatingFileHandler
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings

def setup_logging():
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers on reloads
    if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        file_handler = RotatingFileHandler(
            settings.logs_dir / "app.log",
            maxBytes=5 * 1024 * 1024,  # 5 MB
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    if not any(isinstance(h, logging.StreamHandler) and not isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        # NEVER log request body, headers with credentials, or user content
        try:
            response: Response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000.0

            # Log method, path, status, and duration only
            client_ip = request.client.host if request.client else "unknown"
            logging.getLogger("app.access").info(
                f'{client_ip} - "{request.method} {request.url.path}" {response.status_code} ({duration_ms:.2f}ms)'
            )
            return response
        except Exception:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            client_ip = request.client.host if request.client else "unknown"
            logging.getLogger("app.access").error(
                f'{client_ip} - "{request.method} {request.url.path}" 500 ERROR ({duration_ms:.2f}ms)'
            )
            raise

