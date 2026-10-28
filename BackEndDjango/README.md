# 💻 ZelonMeal - DRF Main Backend Server (Django REST Framework 메인 백엔드 서버)

> **Main backend server responsible for user management, profile data management, meal history tracking, and data retrieval.**  
> A RESTful API server built on Django REST Framework (DRF) that manages user physical metrics and profile data, handling key platform logic such as AI-recommended meal plans and nutritional analytics.
>
> **회원 관리, 프로필 데이터 관리, 식단 기록 및 데이터 조회를 담당하는 백엔드 메인 서버**
> Django REST Framework(DRF) 기반으로 구축된 RESTful API 서버로, 사용자의 신체 정보 및 프로필 데이터를 관리하며, AI가 추천한 식단 데이터, 영양성분 통계 등 플랫폼의 핵심 데이터 로직을 처리합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: Django, Django REST Framework (DRF)
- **Database & ORM**: PostgreSQL, Django ORM
- **Authentication**: JWT (`djangorestframework-simplejwt`)
- **Language**: Python 3.13+

---

## 📂 Architecture & API Specification (아키텍처 및 API 명세)

### 1. `users` Application (사용자 관리 앱)

Manages user authentication, JWT issuance, and personalized profile data. (사용자 계정 인증, JWT 토큰 발급, 개인화 프로필 데이터를 관리합니다.)

- **Core Model (주요 모델)**: `User` - Integrated profile including body metrics, diet goals, health conditions (신체 정보, 식단 목적, 건강 특이사항 등 통합 프로필)
- **API Endpoints (API 엔드포인트)** `/api/v1/users/`:
  - `POST /signup/`: User registration (신규 회원가입)
  - `POST /login/`: JWT token issuance for authentication (로그인을 위한 JWT 토큰 발급)
  - `GET`, `PATCH /profile/`: Retrieve and update user profile (유저 프로필 조회 및 수정)

---

### 2. `meals` Application (식단 및 영양 통계 관리 앱)

Manages AI meal recommendations, re-generation, calendar history, and nutritional analytics data. (AI 식단 추천, 재추천, 캘린더 기록 및 영양성분 통계 데이터를 관리합니다.)

- **Core Models (주요 모델)**:
  - `DailyMealPlan`: Daily-grouped meal plan record (1일 단위 식단 그룹)
  - `MealItem`: Per-meal detailed menu items and macronutrients (끼니별 상세 메뉴 및 영양성분)
- **API Endpoints (API 엔드포인트)** `/api/v1/meals/`:
  - `GET /today/`: Retrieve today's tailored meal plan (당일 맞춤 식단 플랜 조회)
  - `POST /recommend/`: Recommend and persist new daily meal plan (신규 1일 식단 추천 및 저장)
  - `POST /rerecommend/`: Re-generate and update specific meal item (기존 식단 항목 재추천 및 갱신)
  - `GET /search/`: Query/search meal plans by date for calendar view (캘린더용 일자별 식단 플랜 검색 및 조회)
  - `PATCH /items/<int:item_id>/`: Update individual meal item (개별 식단 항목 수정)
  - `GET /stats/`: Nutritional intake and goal achievement statistics over time (기간별 영양성분 섭취 및 목표 달성 통계)
