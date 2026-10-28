# 📱 ZelonMeal - FrontEnd Mobile App (모바일 앱 클라이언트)

> **Mobile application client dedicated to personalized meal recommendation and tracking.**  
> **식단 추천 및 관리를 위한 모바일 전용 앱**

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **State Management & Data Fetching**: `@tanstack/react-query`

---

## 📂 Directory Details (디렉터리 상세)

- **`api/` - API Integration (백엔드 통신 모듈)**
  - Configures the base Axios HTTP client for backend communication and manages API request functions for each feature endpoint. (Axios를 활용해 백엔드 서버와 통신하는 기본 HTTP 클라이언트를 설정하고, 각 기능 및 엔드포인트별 API 요청 함수들을 관리함.)

- **`app/` - Screen Routing & Layouts (화면 및 레이아웃)**
  - Renders user interfaces and layout structures for each page according to user authentication states and conditional flows. (사용자 인증 상태나 조건 분기에 맞춰 각 페이지별 UI 및 레이아웃을 렌더링함.)

- **`constants/` - Constants & UI Configs (상수 및 설정)**
  - Defines shared constants across the application, including screen dimensions, UI labels, and configuration presets. (화면 크기 상수를 비롯해 앱 내에서 공통으로 사용되는 UI 라벨 및 설정값들을 정의함.)

- **`hooks/` - Custom Hooks & React Query (커스텀 훅)**
  - Defines custom hooks integrated with `@tanstack/react-query` to handle server data caching and async state management. (`@tanstack/react-query`를 기반으로 API 함수와 연동하여 서버 데이터 캐싱, 비동기 상태를 관리하는 커스텀 훅들을 정의함.)

- **`types/` - TypeScript Types (타입 정의)**
  - Manages project-wide shared TypeScript definitions including API response objects, user profiles, and component props. (API 응답 객체, 사용자 프로필, 컴포넌트 Props 등 프로젝트 전체에서 공유되는 타입들을 관리함.)

- **`utils/` - Helper Utilities (유틸리티 함수)**
  - Defines global utility functions such as date/time formatting and numerical transformations. (날짜/시간 포맷팅, 숫자 변환 등 앱 전반에서 사용되는 유틸리티 함수들을 정의함.)
