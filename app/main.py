from fastapi import FastAPI
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
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transactions.router)
@app.get("/")
def home():
    return {
        "status" : "online",
        "engine" : " Secure expense engine core"
    }