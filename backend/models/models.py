from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    columns_metadata = Column(JSON)  # stores {col_name: type}
    summary_stats = Column(JSON)
    file_path = Column(String)

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    layout = Column(JSON)  # Stores chart configurations
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dataset_id = Column(Integer, nullable=True)
    dataset_name = Column(String, nullable=True)
    charts = Column(JSON)
    results_panel = Column(JSON, nullable=True)
    columns_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
