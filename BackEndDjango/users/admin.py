from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# 어드민 상세 화면에서 성진님이 만든 커스텀 필드들도 보이도록 세팅
class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('추가 건강 정보', {'fields': ('age', 'gender', 'current_weight', 'target_weight', 'purpose', 'health_conditions', 'allergies')}),
    )
    list_display = ['username', 'email', 'age', 'gender', 'purpose', 'is_staff']

admin.site.register(User, CustomUserAdmin)