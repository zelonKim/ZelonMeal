# 🌐 ZelonMeal - Next.js Frontend Web (웹 프론트엔드)

> **Dashboard and web application dedicated to personalized meal recommendation and tracking.**  
> Delivers intuitive UI/UX based on Next.js App Router architecture, communicating efficiently with the backend via React Query (`@tanstack/react-query`) and Axios HTTP client.
>
> **식단 추천 및 관리를 위한 대시보드 & 웹 애플리케이션**  
> App Router 구조를 기반으로 UI/UX를 제공하며, React Query (`@tanstack/react-query`)와 Axios 클라이언트를 활용하여 백엔드와 효율적으로 통신합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **State Management & Data Fetching**: `@tanstack/react-query`
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

---

## 📂 Project Architecture & Key Directories (프로젝트 구조 및 핵심 디렉터리)

- **`api/` - API Integration (백엔드 통신 모듈)**
  - Configures the base Axios HTTP client and manages asynchronous API request functions corresponding to backend endpoints. (Axios 기반 HTTP 클라이언트를 정의하고, 백엔드 API 엔드포인트와 대응되는 비동기 API 요청 함수 관리)

- **`app/` - Next.js App Router Pages (페이지 및 레이아웃)**
  - Utilizes Next.js App Router to construct route pages and render responsive UI layouts across URL paths. (Next.js App Router를 적용하여 URL 경로별 화면을 구성하며, 반응형 UI 렌더링)

- **`hooks/` - Custom Hooks & React Query (커스텀 훅)**
  - Encapsulates TanStack React Query's `useQuery` and `useMutation` into custom hooks for declarative data fetching and cache management. (TanStack React Query의 `useQuery` 및 `useMutation`을 캡슐화한 커스텀 훅을 통해 선언적 데이터 페칭 및 캐시 관리)

- **`components/` - UI Components (공통 UI 컴포넌트)**
  - Manages reusable shared components and modal dialogs applied across the web application. (애플리케이션 전체에 공통으로 적용되는 컴포넌트 및 모달 관리)

- **`constants/` - Constants (전역 상수)**
  - Collection of static constants and configuration presets used throughout the project. (프로젝트 전체에서 사용하는 상수 모음)

- **`types/` - TypeScript Types (타입 정의)**
  - Project-wide TypeScript definitions including API response models and essential user profile fields. (API 응답 모델, 프로필 필수 필드 등 전역 타입 모음)

- **`utils/` - Helper Utilities (유틸리티 함수)**
  - Collection of reusable utility functions for date formatting, error message parsing, deep-link handling, etc. (날짜 포맷, 에러 메시지 파싱, 딥링크 처리 등 재사용 가능한 유틸 함수 집합)
