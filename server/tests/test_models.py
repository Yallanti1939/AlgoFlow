import uuid

import pytest
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import (
    Achievement,
    Base,
    Bookmark,
    LearningProgress,
    Problem,
    Submission,
    User,
    UserProfile,
)


@pytest.fixture
def session():
    engine = create_engine("sqlite+pysqlite:///:memory:")

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _record) -> None:
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    with Session(engine) as db_session:
        yield db_session
    engine.dispose()


def test_expected_tables_use_uuid_primary_keys() -> None:
    expected_tables = {
        "users",
        "user_profiles",
        "learning_progress",
        "problems",
        "submissions",
        "bookmarks",
        "achievements",
    }

    assert set(Base.metadata.tables) == expected_tables
    for table in Base.metadata.tables.values():
        primary_key = next(iter(table.primary_key.columns))
        assert primary_key.type.python_type is uuid.UUID


def test_user_relationships_and_timezone_aware_timestamps(session: Session) -> None:
    user = User(
        full_name="Learner",
        username="learner",
        email="learner@example.test",
        password_hash="stored-hash",
        profile=UserProfile(display_name="Learner"),
        learning_progress=[
            LearningProgress(
                content_type="algorithm",
                content_key="bfs",
                status="in_progress",
                progress_percent=25,
            )
        ],
        achievements=[
            Achievement(achievement_key="first-step", title="First step")
        ],
    )
    session.add(user)
    session.commit()

    assert isinstance(user.id, uuid.UUID)
    assert user.profile.user_id == user.id
    assert user.learning_progress[0].user_id == user.id
    assert user.achievements[0].user_id == user.id
    assert User.__table__.c.created_at.type.timezone is True
    assert User.__table__.c.updated_at.type.timezone is True


def test_case_insensitive_user_identity_is_unique(session: Session) -> None:
    session.add(
        User(
            full_name="One",
            username="Learner",
            email="learner@example.test",
            password_hash="hash",
        )
    )
    session.commit()
    session.add(
        User(
            full_name="Two",
            username="learner",
            email="other@example.test",
            password_hash="hash",
        )
    )

    with pytest.raises(IntegrityError):
        session.commit()


def test_bookmarks_enforce_unique_user_problem_pair(session: Session) -> None:
    user = User(
        full_name="Learner",
        username="learner",
        email="learner@example.test",
        password_hash="hash",
    )
    problem = Problem(
        slug="two-sum",
        title="Two Sum",
        description="Find two values.",
        difficulty="easy",
    )
    user.bookmarks.append(Bookmark(problem=problem))
    user.bookmarks.append(Bookmark(problem=problem))
    session.add(user)

    with pytest.raises(IntegrityError):
        session.commit()


def test_submissions_link_user_and_problem(session: Session) -> None:
    user = User(
        full_name="Learner",
        username="learner",
        email="learner@example.test",
        password_hash="hash",
    )
    problem = Problem(
        slug="two-sum",
        title="Two Sum",
        description="Find two values.",
        difficulty="easy",
    )
    submission = Submission(
        problem=problem,
        language="javascript",
        source_code="function solve() {}",
        status="accepted",
    )
    user.submissions.append(submission)
    session.add(user)
    session.commit()

    assert submission.user_id == user.id
    assert submission.problem_id == problem.id


def test_user_delete_cascades_to_related_records(session: Session) -> None:
    user = User(
        full_name="Learner",
        username="learner",
        email="learner@example.test",
        password_hash="hash",
        profile=UserProfile(),
        achievements=[Achievement(achievement_key="one", title="One")],
    )
    session.add(user)
    session.commit()
    user_id = user.id

    session.delete(user)
    session.commit()

    assert session.query(UserProfile).count() == 0
    assert session.query(Achievement).filter_by(user_id=user_id).count() == 0


def test_foreign_keys_and_required_indexes_are_defined() -> None:
    bookmark_foreign_keys = inspect(Bookmark).local_table.foreign_keys
    assert {foreign_key.target_fullname for foreign_key in bookmark_foreign_keys} == {
        "users.id",
        "problems.id",
    }
    bookmark_constraints = {
        constraint.name: constraint
        for constraint in Bookmark.__table__.constraints
    }
    assert "uq_bookmarks_user_problem" in bookmark_constraints
    assert {
        index.name for index in User.__table__.indexes
    } >= {"uq_users_email_lower", "uq_users_username_lower"}
