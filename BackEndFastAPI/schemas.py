from pydantic import BaseModel, Field
from typing import List


class DjangoPayload(BaseModel):
    user_id: int
    age: int
    gender: str
    current_weight: float
    goal_weight: float
    purpose: str
    meal_style: str
    disease: str | None = "없음"
    allergies: str | None = "없음"
    yesterday_meals: List[str]


class MealItemResponse(BaseModel):
    meal_time: str = Field(description="BREAKFAST, LUNCH, DINNER, SNACK 중 하나")
    menu_name: str = Field(description="추천 식단 메뉴 이름")
    recipe: str = Field(
        description="초보자도 쉽게 따라할 수 있는 단계별 조리법 및 레시피"
    )
    calories: float = Field(description="칼로리(kcal)")
    carbohydrates: float = Field(description="탄수화물(g)")
    protein: float = Field(description="단백질(g)")
    fat: float = Field(description="지방(g)")


class AIRecommendResponse(BaseModel):
    menu_list: List[MealItemResponse]



class AnalyzeMenuPayload(BaseModel):
    menu_name: str



class NutritionResponse(BaseModel):
    calories: float = Field(description="칼로리(kcal)")
    carbohydrates: float = Field(description="탄수화물(g)")
    protein: float = Field(description="단백질(g)")
    fat: float = Field(description="지방(g)")
    
    
    

class AIReRecommendPayload(BaseModel):
    user_id: int
    age: int
    gender: str
    current_weight: float
    goal_weight: float
    purpose: str
    meal_style: str
    disease: str | None = "없음"
    allergies: str | None = "없음"
    current_menu_list: List[str]  
    user_feedback: str    
