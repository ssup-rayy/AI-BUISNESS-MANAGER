from fastapi import APIRouter

router = APIRouter()

@router.get("/sales")
def get_sales_recommendation():
    return {
        "recommendation": "Customers who bought Product A also showed interest in Product B."
    }
