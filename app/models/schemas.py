from sqlmodel import SQLModel,Field, Relationship
from typing import Optional , List
from pydantic import BaseModel,EmailStr
from datetime import datetime , timezone
from sqlalchemy import ForeignKey

class User(SQLModel, table = True):
    id : Optional[int] = Field(default = None, primary_key = True)
    username : str = Field(unique = True)
    email : EmailStr =  Field(unique = True)
    password : str

    transactions: List["Transaction"] = Relationship(
    back_populates="owner", 
    sa_relationship_kw={"cascade": "all, delete-orphan", "passive_deletes": True}
)

class Transaction(SQLModel, table = True):
    id : Optional[int] = Field(default = None, primary_key = True)
    title : str
    amount : float
    category : str
    date : datetime = Field(default_factory = lambda : datetime.now(timezone.utc))
    user_id : int = Field(default=None, 
        sa_type=ForeignKey("user.id", ondelete="CASCADE"))

    owner : Optional["User"] = Relationship(back_populates = "transactions")


class UserCreate(BaseModel):
    username : str
    email  : EmailStr
    password : str

class TransactionCreate(BaseModel):
    title : str
    amount : float
    category : str
    date : Optional[datetime] = None
    

#Response models:
class UserResponse(BaseModel):
    id : int
    username : str
    email : EmailStr

class UserUpdate(BaseModel):
    username : Optional[str] = None
    email : Optional[EmailStr] = None


class TransactionUpdate(BaseModel):
    title : Optional[str] = None
    amount : Optional[float] = None
    category : Optional[str] = None
    date : Optional[datetime] = None

class TransactionResponse(BaseModel):
     id : int
     title : str
     amount : float
     category : str
     date : datetime
     user_id : int