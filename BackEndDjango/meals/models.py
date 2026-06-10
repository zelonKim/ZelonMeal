from django.db import models
from django.conf import settings


class DailyMealPlan(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_meal_plans",
        verbose_name="사용자",
    )
    date = models.DateField(verbose_name="식단 날짜")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="식단 생성 일시")

    def __str__(self):
        return f"{self.user.username}의 {self.date} 하루 식단 추천"




class MealItem(models.Model):
    daily_plan = models.ForeignKey(
        DailyMealPlan,
        on_delete=models.CASCADE,
        related_name="menu_list",
        verbose_name="하루치 식단 리스트",
    )

    MEAL_TIME_CHOICES = [
        ("BREAKFAST", "아침"),
        ("LUNCH", "점심"),
        ("DINNER", "저녁"),
        ("SNACK", "간식"),
    ]

    meal_time = models.CharField(
        max_length=10, choices=MEAL_TIME_CHOICES, verbose_name="끼니 분류"
    )

    menu_name = models.CharField(max_length=100, verbose_name="메뉴 이름")
    calories = models.FloatField(default=0.0, verbose_name="칼로리(kcal)")
    carbohydrates = models.FloatField(default=0.0, verbose_name="탄수화물(g)")
    protein = models.FloatField(default=0.0, verbose_name="단백질(g)")
    fat = models.FloatField(default=0.0, verbose_name="지방(g)")
    recipe = models.TextField(null=True, blank=True, verbose_name="조리법 및 레시피")

    is_eaten = models.BooleanField(default=True, verbose_name="실제 섭취 여부")

    def __str__(self):
        return f"[{self.get_meal_time_display()}] {self.menu_name}"
