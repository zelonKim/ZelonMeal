# 🥗 ZelonMeal - AI-Powered Personalized Meal Recommendation Platform (AI 기반 식단 추천 플랫폼)

> **AI analyzes user physical metrics, health conditions, and dietary goals to deliver optimal daily meal plans.**  
> ZelonMeal makes personalized diet and meal management easier and more convenient.  
> The AI analyzes user body parameters (age, gender, weight), dietary goals, preferred eating styles, and health conditions (allergies, underlying diseases) to generate **tailored daily meal plans**.
>
> **AI가 사용자의 신체 정보, 건강 상태, 식단 목적을 분석하여 최적의 하루 식단을 추천해줍니다.**  
> ZelonMeal은 개인 맞춤형 식단 관리를 더욱 쉽고 편리하게 만들어줍니다. 사용자의 신체 정보(나이, 성별, 체중), 식단 관리 목적, 선호 식단 스타일, 건강 특이사항(알레르기, 보유질환)을 AI가 분석하여 **최적의 하루 맞춤 식단**을 추천해줍니다.

---

## 🛠 Tech Stack (기술 스택)

### **Frontend**

- **Web Client**: Next.js (App Router)
- **Mobile App**: Expo (React Native)

### **Backend**

- **Main API & Admin Server**: Django
- **High-Performance AI Service**: FastAPI

### **Database & AI**

- **Database**: PostgreSQL, NeonDB
- **LLM Engine**: OpenAI API (`gpt-4o-mini`)

---

## 🔑 Key Features (주요 기능)

### 🤖 1. AI Meal Recommendation & Re-generation (AI 맞춤 식단 추천 & 재추천)

- **Personalized Data Integration (개인화 데이터 반영)**: Designs customized meal plans considering age, gender, current/target weight, dietary goals `weight loss, maintenance, muscle gain`, eating styles, underlying health conditions, and food allergies. (나이, 성별, 현재/목표 체중, 식단 목적`체중 감량/유지/증량`, 식단 스타일, 질환 및 알레르기를 종합 고려하여 식단을 설계합니다.)
- **Real-Time AI Re-generation (실시간 AI 재추천)**: Allows users to instantly request newly tailored recommendations with updated conditions if they prefer an alternative meal plan. (추천받은 식단이 마음에 들지 않을 경우, AI에게 원하는 조건에 맞는 새로운 식단을 다시 추천받을 수 있습니다.)

### 📅 2. Meal Calendar & Nutritional Analytics (식단 캘린더 & 영양 통계)

- **Daily Meal Calendar (날짜별 식단 캘린더)**: Provides an interactive calendar view to explore daily meal records generated and recommended by the AI. (AI가 추천해 준 하루 식단 기록을 캘린더를 통해 날짜별로 조회할 수 있습니다.)
- **Nutritional Analytics & Metrics (영양성분 리포트)**: Visualizes daily intake metrics, including total calories and macronutrients carbohydrates, protein, fats into easy-to-read data charts. (일별 섭취 칼로리와 탄수화물·단백질·지방 등 주요 영양 성분 섭취 현황을 데이터 지표로 시각화하여 보여줍니다.)
