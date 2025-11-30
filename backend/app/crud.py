import uuid
from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Apartment,
    ApartmentCreate,
    ApartmentUpdate,
    ChangeHistory,
    PriceHistory,
    User,
    UserCreate,
    UserUpdate,
)


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_apartment(
    *, session: Session, apartment_in: ApartmentCreate, owner_id: uuid.UUID
) -> Apartment:
    """Create apartment and log initial creation in change history."""
    db_apartment = Apartment.model_validate(
        apartment_in, update={"owner_id": owner_id}
    )
    session.add(db_apartment)
    session.commit()
    session.refresh(db_apartment)

    # Log creation in change history
    for field, value in apartment_in.model_dump().items():
        if value is not None:
            change = ChangeHistory(
                apartment_id=db_apartment.id,
                changed_by_id=owner_id,
                field_name=field,
                old_value=None,
                new_value=str(value),
            )
            session.add(change)

    session.commit()
    return db_apartment


def update_apartment(
    *,
    session: Session,
    db_apartment: Apartment,
    apartment_in: ApartmentUpdate,
    user_id: uuid.UUID,
) -> Apartment:
    """Update apartment and track all changes in history."""
    update_data = apartment_in.model_dump(exclude_unset=True)

    # Track price change separately
    if "current_price" in update_data and update_data["current_price"] != db_apartment.current_price:
        price_history = PriceHistory(
            apartment_id=db_apartment.id,
            old_price=db_apartment.current_price,
            new_price=update_data["current_price"],
            changed_by_id=user_id,
        )
        session.add(price_history)

    # Track all field changes
    for field, new_value in update_data.items():
        old_value = getattr(db_apartment, field)
        if old_value != new_value:
            change = ChangeHistory(
                apartment_id=db_apartment.id,
                changed_by_id=user_id,
                field_name=field,
                old_value=str(old_value) if old_value is not None else None,
                new_value=str(new_value) if new_value is not None else None,
            )
            session.add(change)

    # Update the apartment
    db_apartment.sqlmodel_update(update_data)
    db_apartment.updated_at = datetime.utcnow()
    session.add(db_apartment)
    session.commit()
    session.refresh(db_apartment)
    return db_apartment


def update_apartment_price(
    *,
    session: Session,
    db_apartment: Apartment,
    new_price: float,
    user_id: uuid.UUID,
) -> Apartment:
    """Quick price update with history tracking."""
    if new_price != db_apartment.current_price:
        # Add to price history
        price_history = PriceHistory(
            apartment_id=db_apartment.id,
            old_price=db_apartment.current_price,
            new_price=new_price,
            changed_by_id=user_id,
        )
        session.add(price_history)

        # Add to change history
        change = ChangeHistory(
            apartment_id=db_apartment.id,
            changed_by_id=user_id,
            field_name="current_price",
            old_value=str(db_apartment.current_price),
            new_value=str(new_price),
        )
        session.add(change)

        # Update apartment
        db_apartment.current_price = new_price
        db_apartment.updated_at = datetime.utcnow()
        session.add(db_apartment)
        session.commit()
        session.refresh(db_apartment)

    return db_apartment
