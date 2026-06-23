from fastapi import APIRouter,Depends,HTTPException, status
from sqlmodel import SQLModel, select, Session
from app.config.database import get_session
from app.models.schemas import User,userResponse, userUpdate

router = APIRouter(prefix = "/users", tags = ["Users"])

@router.get("/{user_id}", response_model = userResponse)
def get_user_profile(user_id : int, session : Session = Depends(get_session)):
   
    user_prof = session.get(User, user_id)
   


    if not user_prof:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"No user with {user_id} found"
        )

    else:
        return user_prof


@router.patch("/{user_id}",response_model = userResponse)
def update_user(user_id : int,updated_user : userUpdate, session:Session=Depends(get_session)):
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

 
