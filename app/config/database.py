from sqlmodel import SQLModel,create_engine, Session

URL = "postgresql://localhost:5432/expense_db"

engine = create_engine(URL, echo = True)

def create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

        