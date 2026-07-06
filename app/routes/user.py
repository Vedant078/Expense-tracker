from fastapi import APIRouter,Depends,HTTPException, status
from sqlmodel import SQLModel, select, Session,delete
from app.config.database import get_session
from app.models.schemas import User,UserResponse, UserUpdate,Transaction
from app.utils.security import get_current_user_id

router = APIRouter(prefix = "/users", tags = ["Users"])

@router.get("/{user_id}", response_model = UserResponse)
def get_user_profile(user_id : int, session : Session = Depends(get_session), current_user : int = Depends(get_current_user_id)):
   
    if user_id!=current_user:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "You are not authorised to view this id"
        )


    user_prof = session.get(User, user_id)
   
    if not user_prof:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"No user with {user_id} found"
        )

    else:
        return user_prof


@router.patch("/{user_id}",response_model = UserResponse)
def update_user(user_id : int,updated_user : UserUpdate, session:Session=Depends(get_session), current_user : int = Depends(get_current_user_id)):

    if user_id!=current_user:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "You are not authorised to view this id"
        )

    user = session.get(User,user_id)
    
    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "User not found"
        )
    else:
        updated = updated_user.model_dump(exclude_unset = True)

        for key,value in updated.items():
            setattr(user,key,value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

 
from sqlmodel import select

@router.delete("/{user_id}", status_code = status.HTTP_200_OK)
def delete_user(user_id : int, session : Session = Depends(get_session), current_user : int = Depends(get_current_user_id)):
    if user_id != current_user:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "You are not authorised to view this id"
        )
     
    user = session.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "User not found"
        )
    
    session.exec(delete(Transaction).where(Transaction.user_id == user_id))
    
    session.delete(user)
    session.commit()
    
    return {"message" : f"User with Uid = {user_id} deleted!"}


