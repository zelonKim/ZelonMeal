from django.urls import path
from .views import (
    RecommendMealView,
    MealItemUpdateView,
    SearchMealPlanView,
    ReRecommendMealView,
    TodayMealView,
    DailyStatView,
)


# api/v1/meals/
urlpatterns = [
    path("today/", TodayMealView.as_view(), name="today-meal"),
    path("recommend/", RecommendMealView.as_view(), name="recommend-meal"),
    path("search/", SearchMealPlanView.as_view(), name="daily-meal-plan"),
    path("items/<int:item_id>/", MealItemUpdateView.as_view(), name="meal-item-update"),
    path("rerecommend/", ReRecommendMealView.as_view(), name="meal-rerecommend"),
    path("stats/", DailyStatView.as_view(), name="daily-stats"),
]
