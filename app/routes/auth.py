from fastapi import APIRouter, Depends, HTTPException,status
from sqlmodel import select, Session
from passlib.context import CryptContext
from app.config.database import get_session
from app.models.schemas import User,UserCreate,UserResponse

router = APIRouter(prefix = "/auth", tags = ["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashPassword(password : str)->str:
  return pwd_context.hash(password)


@router.post("/register", status_code = status.HTTP_201_CREATED ,response_model = UserResponse)
def register_user(userdata : UserCreate, session : Session = Depends(get_session)):
  
  Dup_User = session.exec(
    select(User).where((User.username == userdata.username) | (User.email == userdata.email)) 
  ).first()

  if Dup_User:
    raise HTTPException(
      status_code = status.HTTP_400_BAD_REQUEST,
      detail = "Username or email already registered"
    )
  
  secured_hash = hashPassword(userdata.password)

  newUser = User(
      username = userdata.username,
      email = userdata.email,
      password = secured_hash
  )

  session.add(newUser)
  session.commit()
  session.refresh(newUser)
  return newUser

  

  