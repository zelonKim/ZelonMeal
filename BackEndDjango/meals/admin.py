
from django.contrib import admin
from .models import DailyMealPlan, MealItem


class MealItemInline(admin.TabularInline):
    model = MealItem
    extra = 0  # 기본으로 보여줄 빈 칸 개수


@admin.register(DailyMealPlan)
class DailyMealPlanAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "date", "created_at"]
    list_filter = ["date", "user"]
    inlines = [
        MealItemInline
    ] 

