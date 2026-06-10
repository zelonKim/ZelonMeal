import os
import requests
from datetime import date, timedelta  # ⭐️ timedelta 추가
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DailyMealPlan, MealItem
from .serializers import DailyMealPlanSerializer
from django.db import transaction


class RecommendMealView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()

        # 1. 오늘 이미 추천받은 식단이 있는지 체크
        if DailyMealPlan.objects.filter(user=user, date=today).exists():
            return Response(
                {"detail": "오늘의 식단이 이미 존재합니다."},
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

        # 3. 유저의 기본 신체 정보 + 어제 먹은 식단 리스트
        payload = {
            "user_id": user.id,
            "age": user.age,
            "gender": user.gender,
            "current_weight": user.current_weight,
            "goal_weight": user.goal_weight,
            "purpose": user.purpose,
            "disease ": user.disease,
            "allergies": user.allergies,
            "meal_style": user.meal_style,
            "yesterday_meals": yesterday_meals,
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
                return Response(
                    {
                        "detail": "AI 서버 내부 오류가 발생했습니다.",
                        "fastapi_error": response.json().get("detail", "Unknown Error"),
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        except requests.exceptions.ConnectionError:
            return Response(
                {
                    "detail": "AI 서버(FastAPI)가 구동 중이지 않거나, 연결할 수 없습니다."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except (requests.RequestException, ValueError) as e:
            return Response(
                {"detail": f"AI 서버 통신 중 예외가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

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
                    recipe=item["recipe"],
                )
            )

        MealItem.objects.bulk_create(meal_items)

        serializer = DailyMealPlanSerializer(daily_plan)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


###################################


class SearchMealPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        search_date_str = request.query_params.get("date", None)

        if search_date_str:
            try:
                # 문자열로 들어온 날짜를 파이썬 date 객체로 파싱
                search_date = date.fromisoformat(search_date_str)
            except ValueError:
                return Response(
                    {
                        "detail": "올바르지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 요청해주세요."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # 쿼리 파라미터가 없으면 기본값은 '오늘' 날짜로 세팅!
            search_date = date.today()

        # 🔍 해당 유저와 날짜에 맞는 식단 플랜이 존재치 않는지 조회
        # 역참조되는 MealItem들까지 쿼리 효율을 높이기 위해 prefetch_related를 써주면 좋습니다. ⭐
        meal_plan = (
            DailyMealPlan.objects.filter(user=user, date=search_date)
            .prefetch_related("menu_list")
            .first()
        )

        # 해당 날짜에 추천받은 식단이 없을 경우
        if not meal_plan:
            return Response(
                {
                    "detail": f"{search_date}에 생성된 식단이 없습니다.",
                    "is_generated": False,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ⭕ 식단이 존재하면 시리얼라이즈해서 반환
        serializer = DailyMealPlanSerializer(meal_plan)

        response_data = serializer.data
        response_data["is_generated"] = True

        return Response(response_data, status=status.HTTP_200_OK)


###################################


class MealItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        user = request.user
        data = request.data

        try:
            meal_item = MealItem.objects.get(id=item_id, daily_plan__user=user)

        except MealItem.DoesNotExist:
            return Response(
                {"detail": "해당 식단 아이템을 찾을 수 없거나 수정 권한이 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if "menu_name" in data:
            new_menu = data["menu_name"]
            meal_item.menu_name = new_menu

            BASE_URL = os.getenv("FASTAPI_URL")
            FASTAPI_ENDPOINT = f"{BASE_URL}/v1/analyze-nutrition"

            try:
                response = requests.post(
                    FASTAPI_ENDPOINT, json={"menu_name": new_menu}, timeout=20
                )

                if response.status_code == 200:
                    nutrition_data = response.json()
                    meal_item.calories = nutrition_data.get("calories", 0.0)
                    meal_item.carbohydrates = nutrition_data.get("carbohydrates", 0.0)
                    meal_item.protein = nutrition_data.get("protein", 0.0)
                    meal_item.fat = nutrition_data.get("fat", 0.0)
                else:
                    raise requests.RequestException

            except (requests.RequestException, ValueError):
                meal_item.calories = 0.0
                meal_item.carbohydrates = 0.0
                meal_item.protein = 0.0
                meal_item.fat = 0.0

            meal_item.recipe = (
                "유저가 직접 변경한 메뉴이므로 조리법을 제공하지 않습니다."
            )
            meal_item.is_eaten = True

        meal_item.save()

        return Response(
            {
                "message": f"'{meal_item.menu_name}'로 메뉴를 변경하고, 영양 성분을 분석하였습니다.",
                "updated_item": {
                    "id": meal_item.id,
                    "meal_time": meal_item.meal_time,
                    "menu_name": meal_item.menu_name,
                    "calories": meal_item.calories,
                    "carbohydrates": meal_item.carbohydrates,
                    "protein": meal_item.protein,
                    "fat": meal_item.fat,
                    "recipe": meal_item.recipe,
                    "is_eaten": meal_item.is_eaten,
                },
            },
            status=status.HTTP_200_OK,
        )


################################


class ReRecommendMealView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()
        user_feedback = request.data.get("user_feedback", None)

        # 1. 유저의 한 줄 피드백이 비어있으면 즉시 컷
        if not user_feedback:
            return Response(
                {"detail": "식단을 보완할 피드백 내용을 입력해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. 오늘 자 기존 식단 플랜이 있는지 확인
        daily_plan = (
            DailyMealPlan.objects.filter(user=user, date=today)
            .prefetch_related("menu_list")
            .first()
        )
        if not daily_plan:
            return Response(
                {
                    "detail": "오늘 생성된 식단 플랜이 없습니다. 먼저 최초 추천을 받아보세요."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. 기존에 추천받았던 메뉴 이름들을 리스트로 싹 수집
        current_menu_list = list(
            daily_plan.menu_list.values_list("menu_name", flat=True)
        )

        # 4. FastAPI로 보낼 패이로드 조립
        payload = {
            "user_id": user.id,
            "age": user.age,
            "gender": user.gender,
            "current_weight": user.current_weight,
            "goal_weight": user.goal_weight,
            "purpose": user.purpose,
            "meal_style": user.meal_style,
            "disease": user.disease,
            "allergies": user.allergies,
            "current_menu_list": current_menu_list,
            "user_feedback": user_feedback,
        }

        BASE_URL = os.getenv("FASTAPI_URL")
        FASTAPI_ENDPOINT = f"{BASE_URL}/v1/rerecommend"

        try:
            response = requests.post(FASTAPI_ENDPOINT, json=payload, timeout=30)
            if response.status_code == 200:
                ai_data = response.json()
            else:
                return Response(
                    {
                        "detail": "AI 서버 내부 오류로 재추천에 실패했습니다.",
                        "fastapi_error": response.json().get("detail"),
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )
        except requests.exceptions.ConnectionError:
            return Response(
                {"detail": "AI 추천 서버(FastAPI)와 연결할 수 없습니다."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            return Response(
                {"detail": f"통신 중 예외 발생: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 5. 기존 자식 식단 아이템 밀어버리고 새 아이템 꽂아넣기 (Atomic 트랜잭션 보장 🔒)
        with transaction.atomic():
            # 기존 오늘자 메인 플랜 밑에 달려있던 아이템 4개 싹 청소 🧹
            daily_plan.menu_list.all().delete()

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
                        recipe=item.get("recipe"),
                    )
                )
            # 신상 메뉴들 대량 적재 🚀
            MealItem.objects.bulk_create(meal_items)

        # 6. 바뀐 최종 하루 식단 이쁘게 반환
        serializer = DailyMealPlanSerializer(daily_plan)
        return Response(
            {
                "message": "유저 피드백을 바탕으로 오늘의 식단이 완벽히 재구성되었습니다. 🔄",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
