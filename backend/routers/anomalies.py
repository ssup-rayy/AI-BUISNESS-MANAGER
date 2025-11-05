from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()

class DataInput(BaseModel):
    numbers: list[float]

@router.post("/anomalies")
def detect_anomalies(data: DataInput):
    values = np.array(data.numbers)
    mean = np.mean(values)
    std = np.std(values)
    z_scores = (values - mean) / std

    results = []
    for i, v in enumerate(values):
        results.append({
            "month": f"Month {i+1}",
            "sales": float(v),
            "z_score": round(float(z_scores[i]), 2),
            "anomaly": abs(z_scores[i]) >= 2
        })

    return {"data": results}
