import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from sqlalchemy.exc import OperationalError

DEFAULT_SQLITE_URL = "sqlite:///./viznova.db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"Database: Using SQLite ({DATABASE_URL}).")
else:
    try:
        # Attempt PostgreSQL only when explicitly configured.
        engine = create_engine(DATABASE_URL)
        with engine.connect():
            pass
        print("Database: Connected to PostgreSQL.")
    except (OperationalError, Exception) as e:
        print(f"Database: PostgreSQL connection failed ({e}). Falling back to SQLite.")
        DATABASE_URL = DEFAULT_SQLITE_URL
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
