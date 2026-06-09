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

    age = models.PositiveIntegerField(null=True, blank=True, verbose_name="나이")

    gender = models.CharField(
        max_length=2, choices=GENDER_CHOICES, null=True, blank=True, verbose_name="성별"
    )
    
    current_weight = models.FloatField(
        null=True, blank=True, verbose_name="현재 체중(kg)"
    )
    
    target_weight = models.FloatField(
        null=True, blank=True, verbose_name="목표 체중(kg)"
    )
    
    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES,
        default="HEALTH",
        verbose_name="식단 관리 목적",
    )

    health_conditions = models.TextField(null=True, blank=True, verbose_name="지병")
    
    allergies = models.TextField(null=True, blank=True, verbose_name="알레르기")

    def __str__(self):
        return self.username
