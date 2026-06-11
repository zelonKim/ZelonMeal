from rest_framework import serializers
from .models import DailyMealPlan, MealItem


class MealItemSerializer(serializers.ModelSerializer):
    meal_time_display = serializers.CharField(
        source="get_meal_time_display", read_only=True
    )

    class Meta:
        model = MealItem
        fields = [
            "id",
            "meal_time",
            "meal_time_display",
            "menu_name",
            "calories",
            "carbohydrates",
            "protein",
            "fat",
            "recipe",
        ]




class DailyMealPlanSerializer(serializers.ModelSerializer):
    menu_list = MealItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = DailyMealPlan
        fields = ["id", "user_username", "date", "menu_list", "created_at"]
