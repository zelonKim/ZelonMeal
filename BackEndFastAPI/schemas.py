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
    yesterday_meals: List[str] | None


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
    
    
    



# 🌟 1. 기존 메뉴의 상세 영양소 스펙을 수신할 서브 파이단틱 모델 선언
class CurrentMenuDetail(BaseModel):
    id: int
    meal_time: str
    menu_name: str
    calories: float | int
    carbohydrates: float | int
    protein: float | int
    fat: float | int
    recipe: str | None = "레시피 없음"


# 🚀 2. 메인 재추천 페이로드 모델 스키마 교정
class AIReRecommendPayload(BaseModel):
    user_id: int
    age: int
    gender: str
    current_weight: float
    goal_weight: float
    purpose: str
    meal_style: str
    disease: str | None = "지병 없음"
    allergies: str | None = "알레르기 없음"
    user_feedback: str    
    current_menu_list: List[CurrentMenuDetail]