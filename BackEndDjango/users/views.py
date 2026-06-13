# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from rest_framework.permissions import AllowAny
from .serializers import SignUpSerializer


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "회원가입이 성공적으로 완료되었습니다!",
                    "email": serializer.data["email"],
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#########################################


class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        # partial=True 옵션을 주어 유저가 나이만 보내든, 몸무게만 보내든 보낸 것만 쏙 고치게 만듭니다.
        serializer = UserProfileSerializer(user, data=request.data, partial=True)

        # 1. 데이터 유효성 검증 (choices에 없는 값이나 말도 안 되는 데이터가 들어오면 여기서 400 에러 컷)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "유저 정보가 성공적으로 저장되었습니다.",
                    "user_profile": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
