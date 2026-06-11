from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password
import re
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import (
    validate_password as django_validate_password,
)
from django.core.exceptions import ValidationError as DjangoValidationError


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "age",
            "gender",
            "current_weight",
            "goal_weight",
            "purpose",
            "meal_style",
            "disease",
            "allergies",
        ]
        read_only_fields = ["id", "username", "email"]

    def validate_age(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("나이는 0세 이상이어야 합니다.")
        return value


##################################################


class SignUpSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="이미 가입한 이메일입니다.",  # 👈 중복 시 뱉을 한글 문구
            )
        ],
        error_messages={
            "invalid": "올바른 이메일 형식이 아닙니다."  # 👈 형식 오류 시 뱉을 한글 문구
        },
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_password(self, value):
        """🔒 비밀번호 복잡도 검증 및 장고 내장 영어 에러 가로채기"""
        # 1. 프론트와 싱크를 맞춘 영문/숫자 조합 8자 이상 정규식 검사
        password_regex = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
        if not re.match(password_regex, value):
            raise serializers.ValidationError(
                "비밀번호는 영문과 숫자를 조합하여 8자리 이상 입력해주세요."
            )

        # 2. create_user 단계에서 터질 장고 내장 영어 검증기를 여기서 가로채 한글화
        try:
            django_validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                "보안 기준에 맞지 않는 비밀번호입니다. (너무 흔하거나 예측하기 쉬운 조합)"
            )

        return value

    def create(self, validated_data):
        """안전하게 유저 객체 생성"""
        email = validated_data["email"]
        password = validated_data["password"]
        username = email.split("@")[0]

        user = User.objects.create_user(
            email=email, username=username, password=password
        )
        return user


##################################################
