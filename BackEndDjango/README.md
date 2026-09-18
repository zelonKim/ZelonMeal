# 💻 ZelonMeal - Django REST Framework API Server
> **회원 관리, 프로필 데이터 관리, 식단 기록 및 데이터 조회를 담당하는 백엔드 메인 서버**

Django REST Framework(DRF) 기반으로 구축된 RESTful API 서버로, 사용자의 신체 정보 및 프로필 데이터를 관리하며, AI가 추천한 식단 데이터, 영양성분 통계 등 플랫폼의 핵심 데이터 로직을 처리합니다.

---

## 🛠 Tech Stack

- **Framework**: Django, Django REST Framework (DRF)
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Language**: Python 3.13+

---

## 📂 Architecture & API Specification

### 1. `users` Application

사용자 계정 인증, JWT 토큰 발급, 개인화 프로필 데이터를 관리합니다.

- **주요 모델**: `User` (신체 정보, 식단 목적, 건강 특이사항 등 통합 프로필)
- **API 엔드포인트** (`/api/v1/users/`):
  - `POST /signup/`: 신규 회원가입 (`SignUpView`)
  - `POST /login/`: 로그인을 위한 JWT 토큰 발급 (`TokenObtainPairView`)
  - `GET`, `PATCH /profile/`: 유저 프로필 수정 (`UserProfileUpdateView`)



### 2. `meals` Application
AI 식단 추천, 재추천, 캘린더 기록 및 영양성분 통계 데이터를 관리합니다.

- **주요 모델**: `DailyMealPlan` (1일 단위 식단 그룹), `MealItem` (끼니별 상세 메뉴 및 영양성분)
- **API 엔드포인트** (`/api/v1/meals/`):
  - `GET /today/`: 당일 맞춤 식단 플랜 조회 (`TodayMealView`)
  - `POST /recommend/`: 신규 1일 식단 추천 및 저장 (`RecommendMealView`)
  - `POST /rerecommend/`: 기존 식단 항목 재추천 및 갱신 (`ReRecommendMealView`)
  - `GET /search/`: 캘린더용 일자별 식단 플랜 검색/조회 (`SearchMealPlanView`)
  - `PATCH /items/<int:item_id>/`: 개별 식단 항목 수정 (`MealItemUpdateView`)
  - `GET /stats/`: 기간별 영양성분 섭취 및 목표 달성 통계 (`DailyStatView`)

---

## 🚀 Getting Started
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```
