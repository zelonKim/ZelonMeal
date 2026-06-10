from django.urls import path
from .views import (
    RecommendMealView,
    MealItemUpdateView,
    SearchMealPlanView,
    ReRecommendMealView,
)


# api/v1/meals/
urlpatterns = [
    path("recommend/", RecommendMealView.as_view(), name="recommend-meal"),
    path("search/", SearchMealPlanView.as_view(), name="daily-meal-plan"),
    path("items/<int:item_id>/", MealItemUpdateView.as_view(), name="meal-item-update"),
    path("rerecommend/", ReRecommendMealView.as_view(), name="meal-rerecommend"),
]
