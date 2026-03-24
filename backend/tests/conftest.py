import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.models.database import get_session

# Create an in-memory SQLite database for testing
sqlite_url = "sqlite:///:memory:"
engine = create_engine(
    sqlite_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def session():
    with Session(engine) as session:
        yield session

from sqlmodel import select
from app.models.database import User

@pytest.fixture
def client(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    # Run the startup logic manually since TestClient doesn't always trigger startup events perfectly
    statement = select(User)
    users = session.exec(statement).all()
    if not users:
        seed_users = [
            User(name="Ahmed", eco_points=20),
            User(name="Fatma", eco_points=40),
            User(name="Mohamed Chaari", eco_points=0),
        ]
        session.add_all(seed_users)
        session.commit()

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
