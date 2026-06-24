from fastapi import APIRouter,Depends,HTTPException,status
from datetime import datetime,timezone
from sqlmodel import select,Session
from app.config.database import get_session
from app.models.schemas import User, Transaction,TransactionCreate,TransactionUpdate,TransactionResponse
from typing import List

router = APIRouter(
    prefix = "/transactions",
    tags = ["Transactions"]
)

@router.post("/", status_code = status.HTTP_201_CREATED, response_model = TransactionResponse)
def create_transaction(payload : TransactionCreate, session : Session = Depends(get_session)):

    user = session.get(User,payload.user_id)

    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"User with ID {payload.user_id} does not exist. Cannot attach transaction."
        )
    
    if payload.date:
        transaction_date = payload.date
    else:
        transaction_date = datetime.now(timezone.utc)

     
    new_transaction = Transaction(
        title = payload.title,
        amount = payload.amount,
        category = payload.category,
        date = payload.date,
        user_id = payload.user_id
    ) 
    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)

    return new_transaction


@router.get("/",response_model = List[TransactionResponse])
def get_all_transactions(user_id : int, session : Session = Depends(get_session)):
    statement = select(Transaction).where(user_id == Transaction.user_id)
    transaction_list = session.exec(statement).all()

    return transaction_list

@router.get("/{transaction_id}", response_model = TransactionResponse)
def get_transaction_by_id(tid : int, session : Session = Depends(get_session)):
    transaction = session.get(Transaction, tid)

    if not transaction:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"Transaction log entry {tid} not found."
        )

    return transaction


@router.patch("/{transaction_id}", response_model = TransactionResponse)
def update_transactions(transaction_id : int , update_data : TransactionUpdate,session : Session = Depends(get_session)):

    old_transaction = session.get(Transaction, transaction_id)

    if not old_transaction:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"Transaction log entry {transaction_id} not found."
        )
    
    updated_transaction = update_data.model_dump(exclude_unset = True)

    for key,val in updated_transaction.items():
        setattr(old_transaction,key,val)
    
    
    session.add(old_transaction)
    session.commit()
    session.refresh(old_transaction)
    return old_transaction


@router.delete("/{transaction_id}", status_code = status.HTTP_200_OK)
def delete_transaction(transaction_id : int , session : Session = Depends(get_session)):

    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"Transaction with transaction_id {transaction_id} not found"
        )
    
    session.delete(transaction)
    session.commit()
    return{
        "message": f"Transaction entry with ID = {transaction_id} successfully deleted!"}
    
