import anyio
import httpx

from app.api.routes import health
from app.main import app

transport = httpx.ASGITransport(app=app)


def request(method: str, url: str, **kwargs) -> httpx.Response:
    async def send_request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            return await client.request(method, url, **kwargs)

    return anyio.run(send_request)


def test_health_returns_connected_status(monkeypatch) -> None:
    monkeypatch.setattr(health, "is_database_connected", lambda: True)

    response = request("GET", "/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "backend_status": "healthy",
        "api_status": "healthy",
        "database_status": "connected",
    }


def test_health_reports_database_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(health, "is_database_connected", lambda: False)

    response = request("GET", "/api/v1/health")

    assert response.status_code == 503
    assert response.json() == {
        "backend_status": "degraded",
        "api_status": "healthy",
        "database_status": "unavailable",
    }
    assert "DATABASE_URL" not in response.text


def test_swagger_docs_and_health_schema_are_available() -> None:
    docs_response = request("GET", "/docs")
    openapi_response = request("GET", "/openapi.json")

    assert docs_response.status_code == 200
    assert openapi_response.status_code == 200
    operation = openapi_response.json()["paths"]["/api/v1/health"]["get"]
    assert "200" in operation["responses"]
    assert "503" in operation["responses"]


def test_cors_is_limited_to_configured_frontend_origin() -> None:
    allowed_response = request(
        "OPTIONS",
        "/api/v1/health",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    rejected_response = request(
        "OPTIONS",
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert allowed_response.headers.get("access-control-allow-origin") == "http://127.0.0.1:5173"
    assert "POST" in allowed_response.headers.get("access-control-allow-methods", "")
    assert "access-control-allow-origin" not in rejected_response.headers
