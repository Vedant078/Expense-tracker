from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from app.config.database import get_session, create_db
from contextlib import asynccontextmanager
from app.routes import auth, user, transactions


@asynccontextmanager

async def lifespan(app:FastAPI):
    
    create_db()
    yield

app = FastAPI(
    title = "Secure expense tracker engine",
    description = "Engine for mantaining secured transaction logs",
    lifespan = lifespan

)

origins = [
    "http://localhost:3000",      
    "http://127.0.0.1:3000",
    "http://localhost:5173",     
    "http://127.0.0.1:5173",
   "https://expense-tracker-mu-two-38.vercel.app",
   "https://expense-tracker-rh743x695-vedant-workspace2341.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)



app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transactions.router)
@app.get("/")
def home():
    return {
        "status" : "online",
        "engine" : " Secure expense engine core"
    }