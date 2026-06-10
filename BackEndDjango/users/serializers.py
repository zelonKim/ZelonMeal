from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password


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
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password']

    def validate_email(self, value):
        """이메일 중복 검증"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 가입된 이메일 주소입니다.")
        return value


    def create(self, validated_data):
        """이메일과 패스워드만 가지고 유저 객체 생성"""
        email = validated_data['email']
        validated_data['username'] = email
        validated_data['password'] = make_password(validated_data['password'])
        
        return super().create(validated_data)


##################################################
