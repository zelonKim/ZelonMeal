# 🤖 ZelonMeal - FastAPI AI Server (FastAPI AI 서버)

> **Asynchronous AI microservice backend server dedicated to AI meal recommendation and re-generation logic.**  
> Communicates with the Django main backend server to receive user physical metrics (age, gender, weight), dietary goals, health conditions, and feedback data to generate and return OpenAI API-driven meal recommendations.
>
> **AI 식단 추천 및 재추천 로직을 전담하는 비동기 AI 전용 백엔드 서버**  
> Django 메인 백엔드 서버와 통신하며, 사용자의 신체 정보(나이, 성별, 체중), 식단 목적, 건강 특이사항, 유저 피드백 데이터를 수신하여 OpenAI API 기반의 추천 데이터를 생성 및 반환합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: FastAPI (Python 3.13+)
- **AI Model Engine**: OpenAI API (`gpt-4o-mini`)
- **Data Validation**: Pydantic v2
- **Environment**: `python-dotenv`

---

## 🔑 Key Features (핵심 기능)

- **LLM Prompt Engineering (프롬프트 엔지니어링)**: Passes role contexts `clinical nutritionist, diet specialist` and concrete constraint guidelines `macronutrient balance, allergen handling, underlying diseases` to ensure structured, safe meal suggestions. (AI의 역할`영양사, 식단 전문가` 및 구체적 제한 지침`영양 밸런스, 알레르기, 보유질환`을 컨텍스트로 전달하여 일관성 있는 식단 제안)
- **Meal Recommendation & Re-generation (식단 추천 및 재추천)**: Supports initial custom daily meal plan creation as well as iterative re-recommendations reflecting user feedback and existing meal records. (신규 맞춤 식단 생성뿐만 아니라, 사용자의 피드백 및 기존 추천 식단 데이터를 반영한 재추천 기능 제공)
- **Pydantic Validation (데이터 검증)**: Enforces strict JSON schema validation for both AI outputs and incoming payloads using Pydantic v2. (AI 응답 및 클라이언트 요청 데이터 구조를 엄격하게 검증하여 일관된 JSON 스키마 보장)
- **High-Performance Async I/O (비동기 처리)**: Leverages FastAPI's async event loop to minimize latency during LLM API communications. (FastAPI의 비동기 특성을 활용해 LLM API 통신 레이턴시를 최소화)

---

## 🏗 Project Structure (프로젝트 구조)

```text
BackEndFastAPI/
├── main.py          # FastAPI endpoints for meal recommendation & re-generation (식단 추천 및 재추천 엔드포인트)
├── schemas.py       # Pydantic models for request/response payload validation (입출력 요청 및 응답 스키마)
├── requirements.txt # Python package dependencies list (의존성 패키지 목록)
└── .env             # Environment variables e.g., OpenAI API Key (환경 변수 설정)
```
