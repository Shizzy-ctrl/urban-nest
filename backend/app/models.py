import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    apartments: list["Apartment"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Apartment models
# Shared properties
class ApartmentBase(SQLModel):
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    area_sqm: float | None = Field(default=None, gt=0)
    rooms: int | None = Field(default=None, gt=0)
    floor: int | None = None
    building_year: int | None = Field(default=None, gt=1800, lt=2100)
    current_price: float = Field(gt=0)
    description: str | None = Field(default=None, max_length=1000)


# Properties to receive on apartment creation
class ApartmentCreate(ApartmentBase):
    pass


# Properties to receive on apartment update
class ApartmentUpdate(SQLModel):
    address: str | None = Field(default=None, min_length=1, max_length=500)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    area_sqm: float | None = Field(default=None, gt=0)
    rooms: int | None = Field(default=None, gt=0)
    floor: int | None = None
    building_year: int | None = Field(default=None, gt=1800, lt=2100)
    current_price: float | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, max_length=1000)


# Database model, database table inferred from class name
class Apartment(ApartmentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    owner: User | None = Relationship(back_populates="apartments")
    price_history: list["PriceHistory"] = Relationship(
        back_populates="apartment", cascade_delete=True
    )
    change_history: list["ChangeHistory"] = Relationship(
        back_populates="apartment", cascade_delete=True
    )


# Properties to return via API, id is always required
class ApartmentPublic(ApartmentBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ApartmentsPublic(SQLModel):
    data: list[ApartmentPublic]
    count: int


# Price History models
class PriceHistoryBase(SQLModel):
    old_price: float = Field(gt=0)
    new_price: float = Field(gt=0)


class PriceHistory(PriceHistoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    apartment_id: uuid.UUID = Field(
        foreign_key="apartment.id", nullable=False, ondelete="CASCADE"
    )
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    changed_by_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    apartment: Apartment | None = Relationship(back_populates="price_history")


class PriceHistoryPublic(PriceHistoryBase):
    id: uuid.UUID
    apartment_id: uuid.UUID
    changed_at: datetime
    changed_by_id: uuid.UUID


# Change History models
class ChangeHistoryBase(SQLModel):
    field_name: str = Field(max_length=100)
    old_value: str | None = Field(default=None, max_length=1000)
    new_value: str | None = Field(default=None, max_length=1000)


class ChangeHistory(ChangeHistoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    apartment_id: uuid.UUID = Field(
        foreign_key="apartment.id", nullable=False, ondelete="CASCADE"
    )
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    changed_by_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    apartment: Apartment | None = Relationship(back_populates="change_history")


class ChangeHistoryPublic(ChangeHistoryBase):
    id: uuid.UUID
    apartment_id: uuid.UUID
    changed_at: datetime
    changed_by_id: uuid.UUID


# Extended apartment response with history
class ApartmentWithHistory(ApartmentPublic):
    price_history: list[PriceHistoryPublic]
    change_history: list[ChangeHistoryPublic]


# Quick price update schema
class PriceUpdate(SQLModel):
    new_price: float = Field(gt=0)


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
