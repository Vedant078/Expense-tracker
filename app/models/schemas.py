from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from sqlalchemy import ForeignKey

# ==========================================
# DATABASE MODELS (SQLModel Tables)
# ==========================================

class User(SQLModel, table=True):
    __tablename__ = "user"  # Explicitly naming the table to guarantee FK matching

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True)
    password: str

    # Direct tunnel configurations telling SQLAlchemy how to drop child rows securely
    transactions: List["Transaction"] = Relationship(
        back_populates="owner", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "passive_deletes": "all"}
    )


class Transaction(SQLModel, table=True):
    __tablename__ = "transaction"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    amount: float
    category: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Links directly to our explicit 'user' table name above
    user_id: int = Field(
        default=None, 
        sa_type=ForeignKey("user.id", ondelete="CASCADE")
    )

    owner: Optional["User"] = Relationship(back_populates="transactions")


# ==========================================
# PYDANTIC SCHEMAS (Request/Data Validation)
# ==========================================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class TransactionCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: Optional[datetime] = None
    

# ==========================================
# PYDANTIC SCHEMAS (Response Definitions)
# ==========================================

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[datetime] = None


class TransactionResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: datetime
    user_id: int