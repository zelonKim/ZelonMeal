
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
    ]  # ⭐️ 하루치 식단 아래에 끼니 리스트가 주르륵 포함되어 보임!


# MealItem 단독으로도 보고 싶다면 아래 주석을 해제하세요
# admin.site.register(MealItem)
