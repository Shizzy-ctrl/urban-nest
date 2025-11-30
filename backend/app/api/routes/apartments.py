import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import update_apartment, update_apartment_price
from app.models import (
    Apartment,
    ApartmentCreate,
    ApartmentPublic,
    ApartmentsPublic,
    ApartmentUpdate,
    ApartmentWithHistory,
    ChangeHistory,
    ChangeHistoryPublic,
    Message,
    PriceHistory,
    PriceHistoryPublic,
    PriceUpdate,
)

router = APIRouter(prefix="/apartments", tags=["apartments"])


@router.get("/", response_model=ApartmentsPublic)
def read_apartments(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve apartments.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Apartment)
        count = session.exec(count_statement).one()
        statement = select(Apartment).offset(skip).limit(limit)
        apartments = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Apartment)
            .where(Apartment.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Apartment)
            .where(Apartment.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        apartments = session.exec(statement).all()

    return ApartmentsPublic(data=apartments, count=count)


@router.get("/{id}", response_model=ApartmentPublic)
def read_apartment(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get apartment by ID.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return apartment


@router.get("/{id}/history", response_model=ApartmentWithHistory)
def read_apartment_with_history(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get apartment with full change history.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Get price history
    price_history_statement = (
        select(PriceHistory)
        .where(PriceHistory.apartment_id == id)
        .order_by(PriceHistory.changed_at.desc())
    )
    price_history = session.exec(price_history_statement).all()

    # Get change history
    change_history_statement = (
        select(ChangeHistory)
        .where(ChangeHistory.apartment_id == id)
        .order_by(ChangeHistory.changed_at.desc())
    )
    change_history = session.exec(change_history_statement).all()

    return ApartmentWithHistory(
        **apartment.model_dump(),
        price_history=[PriceHistoryPublic(**ph.model_dump()) for ph in price_history],
        change_history=[ChangeHistoryPublic(**ch.model_dump()) for ch in change_history],
    )


@router.get("/{id}/price-history", response_model=list[PriceHistoryPublic])
def read_price_history(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get price change history for an apartment.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    statement = (
        select(PriceHistory)
        .where(PriceHistory.apartment_id == id)
        .order_by(PriceHistory.changed_at.desc())
    )
    price_history = session.exec(statement).all()
    return price_history


@router.post("/", response_model=ApartmentPublic)
def create_apartment(
    *, session: SessionDep, current_user: CurrentUser, apartment_in: ApartmentCreate
) -> Any:
    """
    Create new apartment.
    """
    apartment = Apartment.model_validate(
        apartment_in, update={"owner_id": current_user.id}
    )
    session.add(apartment)
    session.commit()
    session.refresh(apartment)
    return apartment


@router.put("/{id}", response_model=ApartmentPublic)
def update_apartment_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    apartment_in: ApartmentUpdate,
) -> Any:
    """
    Update an apartment.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    apartment = update_apartment(
        session=session,
        db_apartment=apartment,
        apartment_in=apartment_in,
        user_id=current_user.id,
    )
    return apartment


@router.put("/{id}/price", response_model=ApartmentPublic)
def update_price(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    price_in: PriceUpdate,
) -> Any:
    """
    Quick price update for an apartment.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    apartment = update_apartment_price(
        session=session,
        db_apartment=apartment,
        new_price=price_in.new_price,
        user_id=current_user.id,
    )
    return apartment


@router.delete("/{id}")
def delete_apartment(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an apartment.
    """
    apartment = session.get(Apartment, id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    if not current_user.is_superuser and (apartment.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(apartment)
    session.commit()
    return Message(message="Apartment deleted successfully")
