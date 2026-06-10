from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User



class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        (
            "추가 건강 정보",
            {
                "fields": (
                    "age",
                    "gender",
                    "current_weight",
                    "goal_weight",
                    "purpose",
                    "disease",
                    "allergies",
                )
            },
        ),
    )
    list_display = ["username", "email", "age", "gender", "purpose", "is_staff"]


admin.site.register(User, CustomUserAdmin)
