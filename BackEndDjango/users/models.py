from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    GENDER_CHOICES = [
        ("M", "남성"),
        ("F", "여성"),
    ]

    PURPOSE_CHOICES = [
        ("LOSS", "체중 감량 (다이어트)"),
        ("MAINTAIN", "체중 유지"),
        ("GAIN", "체중 증량 (벌크업)"),
        ("HEALTH", "지병 및 건강 관리"),
    ]

    MEAL_STYLE_CHOICES = [
        ("KOREAN", "한식 중심"),
        ("WESTERN", "양식 중심"),
        ("MIXED", "혼합 (한식+양식)"),
    ]

    email = models.EmailField(unique=True, max_length=255, verbose_name="이메일 주소")

    age = models.PositiveIntegerField(null=True, blank=True, verbose_name="나이")

    gender = models.CharField(
        max_length=2, choices=GENDER_CHOICES, null=True, blank=True, verbose_name="성별"
    )

    current_weight = models.FloatField(
        null=True, blank=True, verbose_name="현재 체중(kg)"
    )

    goal_weight = models.FloatField(null=True, blank=True, verbose_name="목표 체중(kg)")

    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES,
        default="HEALTH",
        verbose_name="식단 관리 목적",
    )

    meal_style = models.CharField(
        max_length=20,
        choices=MEAL_STYLE_CHOICES,
        default="MIXED",
        verbose_name="선호하는 식단 스타일",
    )

    disease = models.TextField(null=True, blank=True, verbose_name="지병")

    allergies = models.TextField(null=True, blank=True, verbose_name="알레르기")

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
