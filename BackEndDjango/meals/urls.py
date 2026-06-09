from django.urls import path
from .views import RecommendMealView, MealItemUpdateView  # 👈 방금 만든 MealItemUpdateView 꼭 import!

urlpatterns = [
    # 🌐 1. 오늘 식단 추천 받기 (기존 주소)
    path('recommend/', RecommendMealView.as_view(), name='recommend-meal'),
    
    # 🌐 2. 특정 끼니 수정 및 실제 섭취 체크 (새로 추가)
    path('items/<int:item_id>/', MealItemUpdateView.as_view(), name='meal-item-update'),
]