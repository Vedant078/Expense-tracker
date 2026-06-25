from fastapi import APIRouter, Depends, HTTPException,status
from sqlmodel import select, Session
from app.config.database import get_session
from app.models.schemas import User,UserCreate,UserResponse
from app.utils.security import hashPassword,verify_password,create_access_token
from fastapi.security import OAuth2PasswordRequestForm



router = APIRouter(prefix = "/auth", tags = ["Authentication"])


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

  
@router.post("/login")
def login_user( form_data : OAuth2PasswordRequestForm = Depends(),  session : Session = Depends(get_session)):

  user = session.exec(
    select(User).where((User.username == form_data.username) | (User.email == form_data.username))
  ).first()

  if not user or not verify_password(form_data.password,user.password):
    raise HTTPException(
      status_code = status.HTTP_401_UNAUTHORIZED,
      detail = "Incorrect username or password",
      headers = {"WWW-Authenticate" : "Bearer"}
    )
  
  token_payload = {"user_id" : user.id,
                   "sub" : user.username}
  
  access_token = create_access_token(token_payload)

  return {
    "access_token" : access_token,
    "token_type" : "bearer"
  }

  