from datetime import datetime,timezone,timedelta
from passlib.context import CryptContext
import jwt
from fastapi import HTTPException,status,Depends
from fastapi.security import OAuth2PasswordBearer
from app.config.configEnv import settings



pwd_context  = CryptContext(schemes= ["bcrypt"], deprecated = "auto",bcrypt__backend="bcrypt")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def hashPassword(password : str)->str:
  return pwd_context.hash(password.encode('utf-8'))


def verify_password(plain_password : str, hashed_password : str) :
  return pwd_context.verify(plain_password.encode('utf-8'),hashed_password)


def create_access_token(data : dict):
  
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp":expire})
  return jwt.encode(to_encode,settings.SECRET_KEY, algorithm = settings.ALGORITHM)

# Note :jwt.encode() uses only one algorithm to make a JWT while decoding requires multiple algos list thus jwt.decode() requires algorithms = [ALGORITHM]

def get_current_user_id(token : str = Depends(oauth2_scheme)):
   try:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms = [settings.ALGORITHM])
    user_id = payload.get("user_id")
 
    if user_id is None:
        raise HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "could not verify credentials! Missing ID"
        )
  
    return int(user_id)
   
   except jwt.ExpiredSignatureError:
     raise HTTPException(
       status_code = status.HTTP_401_UNAUTHORIZED,
       detail = "Session expired! Login again"
     )
   
   except jwt.PyJWTError:
     raise HTTPException(
       status_code = status.HTTP_401_UNAUTHORIZED,
       detail = "Invalid security token"
     )




