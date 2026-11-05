import anyio
from datetime import datetime, timedelta, timezone

import httpx
import jwt
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.core import security
from app.database.connection import get_database_session
from app.main import app
from app.models import Base, User

TEST_SECRET = "test-only-signing-secret-with-adequate-length"
REGISTER_BODY = {
    "full_name": "Algo Learner",
    "username": "algo_learner",
    "email": "algo@example.com",
    "password": "a-very-long-password-123",
}


@pytest.fixture
def api(monkeypatch):
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)

    def override_session():
        with session_factory() as session:
            yield session

    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: Settings(
            jwt_secret_key=TEST_SECRET,
            jwt_algorithm="HS256",
            access_token_expire_minutes=30,
        ),
    )
    app.dependency_overrides[get_database_session] = override_session

    async def request(method: str, url: str, **kwargs) -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            return await client.request(method, url, **kwargs)

    yield request, session_factory
    app.dependency_overrides.clear()
    engine.dispose()


def send(api, method: str, url: str, **kwargs) -> httpx.Response:
    request, _ = api

    async def perform_request() -> httpx.Response:
        return await request(method, url, **kwargs)

    return anyio.run(perform_request)


def register(api) -> httpx.Response:
    return send(api, "POST", "/api/v1/auth/register", json=REGISTER_BODY)


def login(api, identifier: str, password: str = REGISTER_BODY["password"]) -> httpx.Response:
    return send(
        api,
        "POST",
        "/api/v1/auth/login",
        json={"identifier": identifier, "password": password},
    )


def test_registration_creates_user_and_profile_without_password_hash(api) -> None:
    response = register(api)
    _, session_factory = api

    assert response.status_code == 201, response.text
    assert response.json()["email"] == REGISTER_BODY["email"]
    assert "password_hash" not in response.json()
    assert "password" not in response.json()
    with session_factory() as session:
        user = session.query(User).one()
        assert user.password_hash != REGISTER_BODY["password"]
        assert user.password_hash.startswith("$argon2")
        assert user.profile.display_name == REGISTER_BODY["full_name"]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("email", "not-an-email"),
        ("password", "short"),
        ("username", "invalid username"),
        ("full_name", "  "),
    ],
)
def test_registration_rejects_invalid_fields(api, field: str, value: str) -> None:
    payload = {**REGISTER_BODY, field: value}

    response = send(api, "POST", "/api/v1/auth/register", json=payload)

    assert response.status_code == 422


def test_registration_rejects_duplicate_email_case_insensitively(api) -> None:
    assert register(api).status_code == 201
    payload = {**REGISTER_BODY, "username": "another_user", "email": "ALGO@example.com"}

    response = send(api, "POST", "/api/v1/auth/register", json=payload)

    assert response.status_code == 409


def test_registration_rejects_duplicate_username_case_insensitively(api) -> None:
    assert register(api).status_code == 201
    payload = {**REGISTER_BODY, "username": "ALGO_LEARNER", "email": "other@example.com"}

    response = send(api, "POST", "/api/v1/auth/register", json=payload)

    assert response.status_code == 409


@pytest.mark.parametrize("identifier", [REGISTER_BODY["email"], REGISTER_BODY["username"]])
def test_login_accepts_email_or_username_and_returns_access_token(api, identifier: str) -> None:
    assert register(api).status_code == 201

    response = login(api, identifier)

    assert response.status_code == 200
    token_data = response.json()
    assert token_data["token_type"] == "bearer"
    assert token_data["expires_in"] == 1800
    assert security.decode_access_token(token_data["access_token"]) is not None


@pytest.mark.parametrize(
    ("identifier", "password"),
    [
        (REGISTER_BODY["email"], "wrong-password"),
        ("missing@example.com", "wrong-password"),
    ],
)
def test_login_returns_generic_failure_for_bad_credentials(api, identifier, password) -> None:
    assert register(api).status_code == 201

    response = login(api, identifier, password)

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username/email or password"


def test_login_rejects_nonexistent_account(api) -> None:
    response = login(api, "missing@example.com", "a-very-long-password-123")

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username/email or password"


def test_login_rejects_inactive_user(api) -> None:
    assert register(api).status_code == 201
    _, session_factory = api
    with session_factory() as session:
        user = session.query(User).one()
        user.is_active = False
        session.commit()

    response = login(api, REGISTER_BODY["email"])

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username/email or password"


def test_jwt_decoder_rejects_invalid_and_expired_tokens(api) -> None:
    invalid_token = "not.a.valid.jwt"
    expired_token = jwt.encode(
        {
            "sub": "be626610-59c4-48f4-93ca-cd00cfe7788f",
            "iat": datetime.now(timezone.utc) - timedelta(minutes=2),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            "type": "access",
        },
        TEST_SECRET,
        algorithm="HS256",
    )

    assert security.decode_access_token(invalid_token) is None
    assert security.decode_access_token(expired_token) is None


def test_me_requires_token_and_returns_current_user(api) -> None:
    registration = register(api)
    token = login(api, REGISTER_BODY["username"]).json()["access_token"]

    response = send(
        api,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert registration.status_code == 201
    assert response.status_code == 200
    assert response.json()["id"] == registration.json()["id"]
    assert "password_hash" not in response.json()

    missing_response = send(api, "GET", "/api/v1/auth/me")
    invalid_response = send(
        api,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert missing_response.status_code == 401
    assert invalid_response.status_code == 401


def test_me_rejects_expired_token(api) -> None:
    expired_token = jwt.encode(
        {
            "sub": "be626610-59c4-48f4-93ca-cd00cfe7788f",
            "iat": datetime.now(timezone.utc) - timedelta(minutes=2),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            "type": "access",
        },
        TEST_SECRET,
        algorithm="HS256",
    )

    response = send(
        api,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401
