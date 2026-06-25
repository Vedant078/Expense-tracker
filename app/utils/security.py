from datetime import datetime,timezone,timedelta
from passlib.context import CryptContext
import jwt
from fastapi import HTTPException,status,Depends
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "SUPER_SECRET_COMPETITIVE_CODING_KEY_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  

pwd_context  = CryptContext(schemes= ["bcrypt"], deprecated = "auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def hashPassword(password : str)->str:
  return pwd_context.hash(password)


def verify_password(plain_password : str, hashed_password : str) :
  return pwd_context.verify(plain_password,hashed_password)


def create_access_token(data : dict):
  
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp":expire})
  return jwt.encode(to_encode,SECRET_KEY, algorithm = ALGORITHM)

# Note :jwt.encode() uses only one algorithm to make a JWT while decoding requires multiple algos list thus jwt.decode() requires algorithms = [ALGORITHM]

def get_current_user_id(token : str = Depends(oauth2_scheme)):
   try:
    payload = jwt.decode(token, SECRET_KEY, algorithms = [ALGORITHM])
    user_id = payload.get("user_id")
 
    if not user_id:
        raise HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "could not verify credentials! Missing ID"
        )
  
    return user_id
   
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




