from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from fastapi import FastAPI, HTTPException, status
import os
from openai import OpenAI
from schemas import AIRecommendResponse, DjangoPayload
from dotenv import load_dotenv
from schemas import AnalyzeMenuPayload, NutritionResponse, AIReRecommendPayload

load_dotenv()

app = FastAPI(title="ZelonMeal AI 서버")


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
def get_ai_rerecommendation(data: AIReRecommendPayload):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 환경 설정 오류: OpenAI API키가 누락되었습니다.",
        )

    try:
        client = OpenAI(api_key=api_key)

        # 💡 기존 식단을 어떻게 보완해야 하는지 인지시키는 고도화된 재추천 프롬프트
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

            [기존 추천 식단]:
            - {", ".join(data.current_menu_list)}

            [유저의 피드백]:
            - "{data.user_feedback}"

            [재추천 지침]
            1. [유저의 피드백]을 최우선적으로 반영하여 하루 식단(BREAKFAST, LUNCH, DINNER, SNACK)을 '새롭게' 리뉴얼해줘.
            2. [기존 추천 식단] 중에서 유저가 불만을 가지거나 변경을 원하는 카테고리는 확실하게 다른 메뉴로 교체해줘.
            3. 선호 식단 스타일과 유저의 식단 목적에 맞는 칼로리/탄수화물/단백질/지방 밸런스는 무너지지 않도록 계산해줘.
            4. 각 메뉴마다 초보자도 쉽게 따라할 수 있는 단계별 조리법(recipe)을 반드시 한글로 작성해줘.
        """

        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "너는 유저의 피드백을 적극 수용하여 기존의 짜여진 식단을 보완해주는 일대일 맞춤형 AI 영양사야.",
                },
                {"role": "user", "content": rerecommend_prompt},
            ],
            response_format=AIRecommendResponse,
        )
        return completion.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 재추천 식단 생성 중 오류 발생: {str(e)}",
        )
