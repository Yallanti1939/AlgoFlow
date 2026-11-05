from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from pwdlib import PasswordHash

from app.core.security import create_access_token, hash_password, verify_password
from app.models import User, UserProfile
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class DuplicateAccountError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


dummy_password_hash = PasswordHash.recommended().hash("invalid-account-password")


def register_user(payload: RegisterRequest, session: Session) -> User:
    email = str(payload.email).lower()
    username = payload.username.lower()
    existing_user = session.scalar(
        select(User.id).where(
            or_(
                func.lower(User.email) == email,
                func.lower(User.username) == username,
            )
        )
    )
    if existing_user is not None:
        raise DuplicateAccountError

    user = User(
        full_name=payload.full_name,
        username=username,
        email=email,
        password_hash=hash_password(payload.password),
        profile=UserProfile(display_name=payload.full_name),
    )
    session.add(user)
    try:
        session.commit()
        session.refresh(user)
    except IntegrityError as error:
        session.rollback()
        raise DuplicateAccountError from error
    return user


def authenticate_user(payload: LoginRequest, session: Session) -> tuple[User, TokenResponse]:
    identifier = payload.identifier.lower()
    user = session.scalar(
        select(User).where(
            or_(
                func.lower(User.email) == identifier,
                func.lower(User.username) == identifier,
            )
        )
    )
    if user is None:
        verify_password(payload.password, dummy_password_hash)
        raise InvalidCredentialsError
    if not verify_password(payload.password, user.password_hash):
        raise InvalidCredentialsError
    if not user.is_active:
        raise InvalidCredentialsError

    access_token, expires_in = create_access_token(user.id)
    return user, TokenResponse(access_token=access_token, expires_in=expires_in)
