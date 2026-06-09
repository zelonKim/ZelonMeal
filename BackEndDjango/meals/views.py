import os
import requests
from datetime import date, timedelta  # ⭐️ timedelta 추가
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DailyMealPlan, MealItem
from .serializers import DailyMealPlanSerializer
from rest_framework.generics import UpdateAPIView



class RecommendMealView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()

        # 1. 오늘 이미 추천받은 식단이 있는지 체크
        if DailyMealPlan.objects.filter(user=user, date=today).exists():
            return Response(
                {"detail": "오늘의 식단 추천이 이미 존재합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ⭐️ 2. 어제 날짜 계산 및 실제 먹은 식단(is_eaten=True) 조회 로직 추가
        yesterday = today - timedelta(days=1)
        yesterday_plan = DailyMealPlan.objects.filter(user=user, date=yesterday).first()

        yesterday_meals = []

        if yesterday_plan:
            # 역참조(menu_list)를 활용해 어제 계획 중 실제로 유저가 섭취한 메뉴 이름만 리스트로 추출
            yesterday_meals = list(
                yesterday_plan.menu_list.filter(is_eaten=True).values_list(
                    "menu_name", flat=True
                )
            )

        # 3. 유저의 기본 신체 정보 + 어제 먹은 진짜 식단 리스트 패키징
        payload = {
            "user_id": user.id,
            "age": user.age,
            "gender": user.gender,
            "current_weight": user.current_weight,
            "target_weight": user.target_weight,
            "purpose": user.purpose,
            "health_conditions": user.health_conditions,
            "allergies": user.allergies,
            "yesterday_meals": yesterday_meals,  # 👈 FastAPI(AI)로 전송될 핵심 피드백 데이터!
        }

        BASE_URL = os.getenv("FASTAPI_URL")
        FASTAPI_ENDPOINT = f"{BASE_URL}/v1/recommend"

        try:
            response = requests.post(FASTAPI_ENDPOINT, json=payload, timeout=30)

            if response.status_code == 200:
                ai_data = (
                    response.json()
                )  # FastAPI가 준 아침, 점심, 저녁, 간식 데이터 리스트
            else:
                raise requests.RequestException

        except (requests.RequestException, ValueError):
            # FastAPI가 안 켜져 있거나 에러 나면 동작할 대피소(Mock) 데이터
            ai_data = {
                "menu_list": [
                    {
                        "meal_time": "BREAKFAST",
                        "menu_name": "[Mock] 닭가슴살 샐러드 & 사과",
                        "calories": 350,
                        "carbohydrates": 30,
                        "protein": 25,
                        "fat": 7,
                    },
                    {
                        "meal_time": "LUNCH",
                        "menu_name": "[Mock] 현미밥 & 고등어구이",
                        "calories": 550,
                        "carbohydrates": 65,
                        "protein": 35,
                        "fat": 12,
                    },
                    {
                        "meal_time": "DINNER",
                        "menu_name": "[Mock] 소고기 야채볶음",
                        "calories": 450,
                        "carbohydrates": 15,
                        "protein": 40,
                        "fat": 14,
                    },
                    {
                        "meal_time": "SNACK",
                        "menu_name": "[Mock] 아몬드 10알",
                        "calories": 100,
                        "carbohydrates": 5,
                        "protein": 3,
                        "fat": 8,
                    },
                ]
            }

        # 4. 오늘 자 새로운 하루 식단 플랜 생성
        daily_plan = DailyMealPlan.objects.create(user=user, date=today)

        meal_items = []
        for item in ai_data.get("menu_list", []):
            meal_items.append(
                MealItem(
                    daily_plan=daily_plan,
                    meal_time=item["meal_time"],
                    menu_name=item["menu_name"],
                    calories=item["calories"],
                    carbohydrates=item["carbohydrates"],
                    protein=item["protein"],
                    fat=item["fat"],
                )
            )

        # 5. 성능 최적화를 위한 대량 저장
        MealItem.objects.bulk_create(meal_items)

        serializer = DailyMealPlanSerializer(daily_plan)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


###################################



class MealItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def _fetch_nutrition_from_kfda(self, menu_name):
        """
        [도우미 함수] 식품의약품안전처 공공 DB에서 영양 정보를 조회하는 로직 (Mock 기능 포함)
        """
        # 💡 [나중 단계] 여기에 진짜 식약처 API requests.get() 코드가 들어올 자리입니다!
        # 지금은 테스트를 위해 유저가 많이 검색할 법한 외식 메뉴 샘플 데이터를 내장해 둡니다.
        kfda_mock_db = {
            "짜장면": {"calories": 864.0, "carbohydrates": 130.0, "protein": 20.0, "fat": 28.0},
            "짬뽕": {"calories": 688.0, "carbohydrates": 95.0, "protein": 29.0, "fat": 21.0},
            "떡볶이": {"calories": 350.0, "carbohydrates": 70.0, "protein": 7.0, "fat": 4.0},
            "치킨": {"calories": 280.0, "carbohydrates": 15.0, "protein": 24.0, "fat": 14.0},  # 100g 기준
            "피자": {"calories": 250.0, "carbohydrates": 30.0, "protein": 12.0, "fat": 9.0},   # 1조각 기준
        }

        # 유저가 입력한 메뉴명이 식약처 DB(Mock)에 있으면 영양소를 반환, 없으면 기본값 0.0 처리
        return kfda_mock_db.get(menu_name, {"calories": 0.0, "carbohydrates": 0.0, "protein": 0.0, "fat": 0.0})


    def patch(self, request, item_id):
        """
        유저가 음식 이름(menu_name)만 입력하면, 식약처 DB에서 영양소를 추적하여 업데이트하는 API
        """
        user = request.user
        data = request.data

        try:
            # 1. 내 식단 아이템이 맞는지 철저하게 검증
            meal_item = MealItem.objects.get(id=item_id, daily_plan__user=user)
            
        except MealItem.DoesNotExist:
            return Response(
                {"detail": "해당 식단 아이템을 찾을 수 없거나 수정 권한이 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2. 유저가 메뉴 이름을 변경했는지 체크
        if "menu_name" in data:
            new_menu = data["menu_name"]
            meal_item.menu_name = new_menu

            # 🚀 [핵심] 식약처 DB 검색 함수를 호출하여 칼로리와 탄단지 자동 추출!
            nutrition = self._fetch_nutrition_from_kfda(new_menu)
            
            meal_item.calories = nutrition["calories"]
            meal_item.carbohydrates = nutrition["carbohydrates"]
            meal_item.protein = nutrition["protein"]
            meal_item.fat = nutrition["fat"]
        
        if "is_eaten" in data:
            meal_item.is_eaten = data["is_eaten"]
        else:
            meal_item.is_eaten = True

        # 4. DB에 최종 저장
        meal_item.save()

        # 5. 영양소가 정말 알아서 자동으로 잘 채워졌는지 예쁘게 리턴해서 확인
        return Response(
            {
                "message": f"식약처 DB 데이터를 기반으로 '{meal_item.menu_name}' 식단이 동기화되었습니다.",
                "updated_item": {
                    "id": meal_item.id,
                    "meal_time": meal_item.meal_time,
                    "menu_name": meal_item.menu_name,
                    "calories": meal_item.calories,
                    "carbohydrates": meal_item.carbohydrates,
                    "protein": meal_item.protein,
                    "fat": meal_item.fat,
                    "is_eaten": meal_item.is_eaten,
                },
            },
            status=status.HTTP_200_OK,
        )