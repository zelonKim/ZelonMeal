# 🤖 ZelonMeal - FastAPI AI Server

> **AI 식단 추천 및 재추천 로직을 전담하는 비동기 AI 전용 백엔드 서버**

Django 메인 백엔드 서버와 통신하며, 사용자의 신체 정보(나이, 성별, 체중), 식단 목적, 건강 특이사항, 유저 피드백 데이터를 수신하여 OpenAI API 기반의 추천 데이터를 생성 및 반환합니다.

---

## 🛠 Tech Stack
* **Framework**: FastAPI
* **AI Model Engine**: OpenAI API (`gpt-4o-mini`)
* **Data Validation**: Pydantic v2
* **Language**: Python 3.13+

---

## 🔑 Key Features
* **LLM Prompt Engineering**: AI의 역할(영양사, 식단 전문가) 및 구체적 제한 지침(영양 밸런스, 알레르기, 보유질환)을 컨텍스트로 전달하여 일관성 있는 식단 제안
* **식단 추천 & 재추천 지원**: 신규 맞춤 식단 생성뿐만 아니라, 사용자의 피드백 및 기존 추천 식단 데이터를 반영한 재추천 기능 제공
* **Pydantic 기반 검증**: AI 응답 및 클라이언트 요청 데이터 구조를 엄격하게 검증하여 일관된 JSON 스키마 보장
* **고성능 비동기 처리**: FastAPI의 비동기 특성을 활용해 LLM API 통신 레이턴시를 최소화

---

## 🏗 Project Structure
```text
BackEndFastAPI/
├── main.py          # FastAPI 식단 추천/재추천 엔드포인트 정의
├── schemas.py       # Pydantic 모델 (입출력 요청/응답 스키마 정의)
├── requirements.txt # 의존성 패키지 목록
└── .env             # 환경 변수 (OpenAI API Key 등)
```
