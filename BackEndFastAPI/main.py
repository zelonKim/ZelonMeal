from scalar_fastapi import get_scalar_api_reference
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
from openai import OpenAI
from schemas import AIRecommendResponse, DjangoPayload
from dotenv import load_dotenv
from schemas import AnalyzeMenuPayload, NutritionResponse, AIReRecommendPayload

load_dotenv()

app = FastAPI(title="ZelonMeal AI 서버")

origins = [
    "http://localhost:3000",
    "https://zelonmeal.vercel.app",  # 👈  Next.js 배포 주소가 나오면 여기에 추가!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 특정 도메인만 허용 (전체 허용 시 ["*"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "서버 작동 중!"}


@app.get("/scalar", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="Scalar API",
    )


###########################################


@app.post("/ai/v1/recommend", response_model=AIRecommendResponse)
def get_ai_recommendation(data: DjangoPayload):

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 환경 설정 오류: OpenAI API키가 누락되었습니다.",
        )

    try:
        client = OpenAI(api_key=api_key)

        user_info_prompt = f"""
            [유저 정보]:
            - 나이: {data.age}세, 
            - 성별: {data.gender},
            - 현재 체중: {data.current_weight}kg, 
            - 목표 체중: {data.goal_weight}kg
            - 목적: {data.purpose} (LOSS면 체중 감량 및 다이어트, MAINTAIN이면 체중 유지, GAIN이면 체중 증량 및 벌크업, HEALTH이면 지병 및 건강 관리)
            - 선호 식단 스타일: {data.meal_style}
            - 보유 질환: {data.disease}
            - 보유 알레르기: {data.allergies}
            - 어제 섭취한 식단: {", ".join(data.yesterday_meals) if data.yesterday_meals else "없음"}

            [중요 지침]
            1. 선호 식단 스타일이 'KOREAN'이면 하루 모든 끼니를 한식 기반(찌개, 구이, 나물 등)으로 구성해줘.
            2. 선호 식단 스타일이 'WESTERN'이면 하루 모든 끼니를 양식 기반(샐러드, 샌드위치, 오트밀 등)으로 구성해줘.
            3. 선호 식단 스타일이 'MIXED'이면 아침/점심/저녁을 한식과 양식 중에서 유저가 질리지 않게 다채롭게 혼합해서 구성해줘.
            
            위의 유저 정보와 중요 지침을 바탕으로 유저에게 완벽히 최적화된 하루 식단(BREAKFAST, LUNCH, DINNER, SNACK)을 짜줘.
            단, '어제 실제로 섭취한 식단'과 겹치는 메뉴는 가급적 피해서 다채롭게 구성해줘.
            보유 질환에 해롭거나 보유 알레르기를 유발하는 식재료는 절대 포함하지 말아줘.
            각 메뉴마다 초보자도 쉽게 따라할 수 있는 단계별 조리법(recipe)을 반드시 한글로 작성해줘.
            """

        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "너는 임상영양사 자격증이 있는 건강 식단 전문 AI 영양사야.",
                },
                {"role": "user", "content": user_info_prompt},
            ],
            response_format=AIRecommendResponse,
        )

        return completion.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 추천 생성 중 오류 발생: {str(e)}",
        )


###########################################


@app.post("/ai/v1/analyze-nutrition", response_model=NutritionResponse)
def analyze_nutrition(data: AnalyzeMenuPayload):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 환경 설정 오류: OpenAI API키가 누락되었습니다.",
        )

    try:
        client = OpenAI(api_key=api_key)

        nutrition_prompt = f"""
            {data.menu_name} 1인분 분량의 대략적인 칼로리(kcal), 탄수화물(g), 단백질(g), 지방(g) 성분을 추정해서 객관적인 숫자로만 채워줘.
        """

        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "너는 음식의 핵심 영양 성분을 정확하게 추정하는 AI 영양소 분석기야.",
                },
                {"role": "user", "content": nutrition_prompt},
            ],
            response_format=NutritionResponse,
        )
        return completion.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"영양소 분석 중 오류 발생: {str(e)}",
        )


###########################################


@app.post("/ai/v1/rerecommend", response_model=AIRecommendResponse)
def get_ai_rerecommend(data: AIReRecommendPayload):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 환경 설정 오류: OpenAI API키가 누락되었습니다.",
        )

    try:
        client = OpenAI(api_key=api_key)

        existing_menus_context = ""

        for menu in data.current_menu_list:
            existing_menus_context += (
                f"- 식사 타임:[{menu.meal_time}] "
                f"- 음식 이름: {menu.menu_name} "
                f"- 칼로리: ({menu.calories}kcal"
                f"- 탄수화물: {menu.carbohydrates}g"
                f"- 단백질: {menu.protein}g"
                f"- 지방: {menu.fat}g)"
                f"- 요리 레시피: {menu.recipe}\n"
            )

        # 💡 유저가 원한 시간대만 바꾸고, 나머지는 '기존 것 복사'하도록 강제하는 초고도화 프롬프트
        rerecommend_prompt = f"""
            [유저 기본 정보]:
            - 나이: {data.age}세, 
            - 성별: {data.gender}
            - 현재 체중: {data.current_weight}kg, 
            - 목표 체중: {data.goal_weight}kg
            - 목적: {data.purpose}
            - 선호 식단 스타일: {data.meal_style}
            - 보유 질환: {data.disease} 
            - 보유 알레르기: {data.allergies}

            [기존 추천 식단 상세 스펙 (BREAKFAST, LUNCH, DINNER, SNACK)]:
            {existing_menus_context}

            [유저 피드백]:
            - "{data.user_feedback}"

            [재추천 지침 - 중요 🚨]
            1. [유저 피드백]을 꼼꼼히 분석하여, 유저가 수정을 요구하는 '특정 식사 시간대(예: 점심만 혹은 저녁만)'가 어디인지 먼저 파악하세요.
            2. 유저가 수정을 요구한 특정 시간대의 식사만 [유저 피드백]에 맞추어 메뉴 이름, 칼로리, 탄수화물/단백질/지방 수치, 레시피를 새롭게 생성 및 변경하세요.
            3. 유저가 피드백에서 언급하지 않은 '다른 모든 시간대의 식사'는 [기존 추천 식단]에 명시된 menu_name, calories, carbohydrates, protein, fat, recipe 데이터를 그대로 똑같이 복사하여 유지하세요. 마음대로 리뉴얼하거나 미세 조정하지 마세요.
            4. 유저가 칼로리, 탄수화물, 단백질, 지방 수치의 변경을 원할 경우에는 그에 맞춰 새로운 메뉴로 바꾸세요.
            5. 각 메뉴마다 초보자도 쉽게 따라할 수 있는 단계별 조리법(recipe)을 반드시 한글로 작성해주세요. (유지되는 식사는 기존 레시피를 그대로 복사해주세요)
            6. 보유 질환에 해롭거나 보유 알레르기를 유발하는 식재료는 식단에 절대로 포함하지 마세요.
        """
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 유저 피드백을 반영하여 기존 식단을 맞춤형으로 보완하는 전문 AI 영양사야. "
                        "반드시 유저가 수정을 요구한 시간대의 식사만 새롭게 변경하고, 언급되지 않은 나머지 식사들은 "
                        "기존에 제공된 원본 데이터를 그대로 유지해야해"
                    ),
                },
                {"role": "user", "content": rerecommend_prompt},
            ],
            response_format=AIRecommendResponse,
        )
        return completion.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 식단 재추천 중 오류 발생: {str(e)}",
        )
