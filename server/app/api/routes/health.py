import logging
from typing import Literal

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database.connection import get_engine

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    backend_status: Literal["healthy", "degraded"]
    api_status: Literal["healthy"]
    database_status: Literal["connected", "unavailable"]


def is_database_connected() -> bool:
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except (RuntimeError, SQLAlchemyError):
        logger.warning("Database health check failed")
        return False


@router.get(
    "/health",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse, "description": "Database unavailable"}},
)
def health_check() -> JSONResponse | HealthResponse:
    database_connected = is_database_connected()
    response = HealthResponse(
        backend_status="healthy" if database_connected else "degraded",
        api_status="healthy",
        database_status="connected" if database_connected else "unavailable",
    )
    if not database_connected:
        return JSONResponse(status_code=503, content=response.model_dump())
    return response
