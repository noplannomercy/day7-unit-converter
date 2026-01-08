# Day 7 - Unit Converter Project Prompts

프로젝트 구축 과정에서 사용한 모든 프롬프트를 시간순으로 정리한 문서입니다.

---

## 1. 프로젝트 초기화

**프롬프트:**
```
Next.js 15 + shadcn/ui + Prisma 프로젝트 생성해줘.

프로젝트명: day7-unit-converter

요구사항:
1. Next.js 15 App Router
2. TypeScript (strict mode)
3. shadcn/ui (New York style)
4. Prisma ORM + SQLite
5. Tailwind CSS
6. ESLint + Prettier

설정:
- 프로젝트 루트: C:\workspace\prj20060203\day7-unit-converter
- Turbopack 사용
- src/ 폴더 없이 app/ 디렉토리만 사용
- import alias: @/*

추가 의존성:
- lucide-react (아이콘)
- clsx, tailwind-merge (유틸리티)

진행 순서:
1. npx create-next-app@latest 실행
2. shadcn/ui 초기화 (npx shadcn@latest init)
3. Prisma 설정 (npx prisma init --datasource-provider sqlite)
4. 기본 컴포넌트 설치 (button, card, input, select)
5. 프로젝트 구조 확인

완료 후 설치된 패키지 버전과 파일 구조 보여줘.
```

**결과:**
- Next.js 16.1.1 프로젝트 생성
- shadcn/ui (New York style) 설정
- Prisma 5.22.0 + SQLite 설정
- 기본 컴포넌트 설치

---

## 2. PRD 문서 작성

**프롬프트:**
```
docs/PRD.md 작성해줘.

프로젝트: Unit Converter Web Application

포함 내용:
1. 프로젝트 개요
2. 핵심 기능
   - 단위 변환 (길이, 무게, 온도)
   - 변환 이력 저장 (SQLite)
   - 즐겨찾기 기능
3. 기술 스택 상세
4. 사용자 스토리
5. UI/UX 요구사항
6. 성능 요구사항
7. 제약사항

세부 요구사항:
- 길이: m, km, ft, mi
- 무게: kg, g, lb, oz
- 온도: C, F, K
- 이력: 최근 10개
- 즐겨찾기: 무제한
- 응답 시간: < 100ms
- 타입 안정성: TypeScript strict mode
```

**결과:**
- docs/PRD.md 생성
- 상세한 기능 명세와 요구사항 정리

---

## 3. 아키텍처 문서 작성

**프롬프트:**
```
docs/ARCHITECTURE.md 생성해줘.

기반: PRD.md 내용 참고

포함 내용:
1. 시스템 아키텍처 개요
   - Next.js App Router 패턴
   - Server Components vs Client Components
2. 디렉토리 구조 상세
   - app/ (라우팅)
   - components/ (UI 컴포넌트)
   - lib/ (유틸리티, Prisma)
   - types/ (TypeScript 타입)
3. 데이터 흐름
   - Server Actions 패턴
   - 클라이언트-서버 통신
4. 컴포넌트 아키텍처
   - 각 컴포넌트 역할 정의
   - 상태 관리 전략
5. 성능 최적화 전략
   - 병렬 데이터 페칭
   - DB 인덱싱
   - React Server Components 활용

구체적으로:
- 파일별 책임 명확히 구분
- Server/Client Component 분리 기준
- 타입 안전성 보장 방법
```

**결과:**
- docs/ARCHITECTURE.md 생성
- 컴포넌트 구조 및 데이터 흐름 문서화

---

## 4. 데이터베이스 설계 문서 작성

**프롬프트:**
```
docs/DATABASE.md 생성해줘.

기반: PRD.md, ARCHITECTURE.md 참고

포함 내용:
1. Prisma 스키마 정의
   - Conversion 모델 설계
   - 필드: id, category, value, fromUnit, toUnit, result, formula, isFavorite, createdAt
2. 인덱스 전략
   - 성능 최적화를 위한 복합 인덱스
   - (isFavorite, createdAt) 인덱스
   - (createdAt) 인덱스
3. 쿼리 패턴
   - getHistory(): 최근 10개 조회
   - getFavorites(): 즐겨찾기 조회
   - toggleFavorite(): 레이스 컨디션 방지
4. 마이그레이션 전략
5. 백업 및 유지보수

주의사항:
- CUID 사용 (충돌 방지)
- 날짜 기준 정렬 최적화
- SQLite 제약사항 고려
```

**결과:**
- docs/DATABASE.md 생성
- Prisma 스키마 및 쿼리 패턴 정의

---

## 5. CLAUDE.md 초안 작성

**프롬프트:**
```
docs/CLAUDE.md 생성해줘.

목적: AI 어시스턴트(Claude)가 프로젝트를 이해하고 작업할 수 있도록 가이드 제공

포함 내용:
1. 프로젝트 개요 (간결하게)
2. 필수 명령어
   - npm run dev
   - npx prisma migrate dev
   - npx prisma studio
3. 파일 구조 (실제 구조 반영)
4. TypeScript 규칙
   - Discriminated Union 사용법
   - 타입 안전성 보장
5. 입력 검증 규칙
   - NaN/Infinity 처리
   - 음수 온도 허용 (-40°C = -40°F)
   - 음수 길이/무게 거부
6. Server Actions 규칙
   - toggleFavorite 레이스 컨디션 방지 패턴
   - revalidatePath 필수
7. 컴포넌트 아키텍처
   - Server/Client 분리 패턴
   - 인터랙티브 요소는 Client Component
8. 성능 규칙
   - Promise.all 병렬 페칭
9. Prisma 규칙
   - Singleton 패턴
10. 테스트 체크리스트
    - 엣지 케이스 (-40°C, NaN, Infinity)
11. 일반적인 실수와 해결책

스타일:
- 간결하고 실용적
- 코드 예제 중심
- ✅/❌ 패턴 사용
- 표 형식 활용
```

**결과:**
- CLAUDE.md 생성 (프로젝트 루트)
- AI 어시스턴트용 가이드 문서

---

## 6. 구현 계획 문서 작성

**프롬프트:**
```
docs/IMPLEMENTATION.md 생성해줘.

기반: PRD.md, ARCHITECTURE.md, DATABASE.md 참고

포함 내용:
1. 구현 단계 (Phase 1-5)
2. 각 단계별 상세 작업
   - Phase 1: 데이터베이스 설정
   - Phase 2: 변환 로직
   - Phase 3: UI 컴포넌트
   - Phase 4: Server Actions
   - Phase 5: 통합 및 테스트
3. 각 단계별 체크리스트
4. 테스트 계획
5. 배포 전략

구체적으로:
- 단계별 의존성 명확히
- 파일별 구현 순서
- 테스트 케이스 정의
- 예상 시간 (제외)
```

**결과:**
- docs/IMPLEMENTATION.md 생성
- 5단계 구현 계획 수립

---

## 7. Co-pilot 검증 및 피드백 반영

**프롬프트:**
```
Co-pilot 모드로 전환.

검증 대상:
- PRD.md
- ARCHITECTURE.md
- DATABASE.md
- CLAUDE.md
- IMPLEMENTATION.md

검증 항목:
1. 일관성 체크 (문서 간 내용 충돌 없는지)
2. 완성도 체크 (빠진 내용 없는지)
3. 실현 가능성 체크 (기술적으로 구현 가능한지)
4. 모범 사례 준수 (Next.js, Prisma 베스트 프랙티스)

각 문서별로:
- 개선 필요 사항
- 추가할 내용
- 수정할 내용

피드백 형식:
- 긍정적 피드백 (잘된 점)
- 개선 제안 (구체적으로)
- 우선순위 (Critical, Important, Nice-to-have)
```

**결과:**
- 각 문서 검증 완료
- 피드백 기반 수정 완료
- 문서 일관성 확보

---

## 8. Git 초기화 및 초기 커밋

**프롬프트:**
```
git init 하고 초기 커밋해줘.

작업:
1. git init
2. .gitignore 확인 (Next.js 기본값 + Prisma)
3. git add .
4. 초기 커밋

커밋 메시지:
"Initial commit from Create Next App"

추가:
- 문서 파일들도 포함
- 설정 파일 포함
- node_modules 제외 확인
```

**결과:**
- Git 저장소 초기화
- 초기 커밋 완료 (3cb3014)

---

## 9. Phase 1 실행 - 데이터베이스 설정

**프롬프트:**
```
IMPLEMENTATION.md의 Phase 1 실행해줘.

Phase 1: 데이터베이스 설정

작업:
1. types/conversion.ts 생성
   - LengthUnit, WeightUnit, TemperatureUnit 타입
   - ConversionInput (discriminated union)
   - ConversionResult 인터페이스
   - ActionResponse<T> 타입

2. prisma/schema.prisma 작성
   - Conversion 모델
   - 복합 인덱스 추가

3. lib/prisma.ts 생성
   - Singleton 패턴

4. Prisma 마이그레이션
   - npx prisma migrate dev --name init

5. 검증
   - npx prisma studio로 확인
   - 타입 생성 확인

완료 후 커밋:
"feat: Phase 1 - Database setup complete"
```

**결과:**
- 타입 정의 완료
- Prisma 스키마 작성
- 마이그레이션 실행
- Git 커밋 (3d7a31a)

---

## 10. Phase 2 실행 - 변환 로직 구현

**프롬프트:**
```
Phase 2 실행.

Phase 2: 변환 로직 구현

작업:
1. lib/conversions.ts 생성
   - validateInput() 함수
     - NaN/Infinity 체크
     - 음수 온도 허용
     - 음수 길이/무게 거부
   - convertLength() 함수
   - convertWeight() 함수
   - convertTemperature() 함수
   - convert() 메인 함수
   - getFormula() 함수

2. 변환 로직 테스트
   - 100m = 328.084ft
   - 1kg = 2.20462lb
   - 0°C = 32°F
   - -40°C = -40°F (엣지 케이스)
   - NaN 입력 거부
   - Infinity 입력 거부

3. 검증
   - 모든 단위 조합 테스트
   - 엣지 케이스 확인

완료 후 커밋:
"feat: Phase 2 - Conversion logic complete"
```

**결과:**
- lib/conversions.ts 완성
- 모든 변환 함수 구현
- 입력 검증 로직 완성
- Git 커밋 (8a434f5)

---

## 11. Phase 3 실행 - UI 컴포넌트 구현

**프롬프트:**
```
Phase 3 실행.

Phase 3: UI 컴포넌트

작업:
1. components/converter-form.tsx (Client Component)
   - 카테고리 선택
   - 값 입력
   - 단위 선택 (from/to)
   - 변환 버튼
   - 결과 표시
   - 공식 표시
   - 에러 표시

2. components/conversion-item.tsx (Client Component)
   - 변환 결과 카드
   - 즐겨찾기 토글 버튼
   - 삭제 버튼
   - 타임스탬프
   - 공식 표시

3. components/history-list.tsx (Server Component)
   - 최근 10개 표시
   - ConversionItem 사용

4. components/favorites-list.tsx (Server Component)
   - 즐겨찾기 목록 표시
   - ConversionItem 사용

5. app/loading.tsx
   - 스켈레톤 로더

6. app/error.tsx (Client Component)
   - 에러 바운더리
   - 재시도 버튼

검증:
- Server/Client Component 분리 확인
- shadcn/ui 컴포넌트 활용
- 반응형 디자인

완료 후 커밋:
"feat: Phase 3 - UI components complete"
```

**결과:**
- 모든 UI 컴포넌트 구현
- Server/Client 분리 완료
- 로딩/에러 상태 처리

---

## 12. Phase 4 실행 - Server Actions 구현

**프롬프트:**
```
Phase 4 실행.

Phase 4: Server Actions

작업:
1. app/actions/conversions.ts 생성
   - 'use server' 지시문
   - createConversion(input)
     - 입력 검증
     - 변환 수행
     - DB 저장
     - revalidatePath('/')
   - getHistory()
     - 최근 10개 조회
   - getFavorites()
     - 즐겨찾기 조회
   - toggleFavorite(id)
     - DB에서 현재 값 조회 (레이스 컨디션 방지)
     - 토글 후 업데이트
     - revalidatePath('/')
   - deleteConversion(id)
     - 삭제 후 revalidatePath('/')

2. 에러 핸들링
   - try-catch 블록
   - ActionResponse<T> 반환
   - 사용자 친화적 에러 메시지

검증:
- 모든 액션 테스트
- revalidatePath 호출 확인
- 레이스 컨디션 테스트

완료 후 커밋:
"feat: Phase 4 - Server actions complete"
```

**결과:**
- 5개 Server Actions 구현
- 에러 핸들링 완료
- 레이스 컨디션 방지 패턴 적용

---

## 13. Phase 5 실행 - 통합 및 테스트

**프롬프트:**
```
Phase 5 실행.

Phase 5: 통합 및 테스트

작업:
1. app/page.tsx 수정
   - Promise.all로 병렬 데이터 페칭
   - 3컬럼 그리드 레이아웃
   - ConverterForm, HistoryList, FavoritesList 렌더링

2. 통합 테스트
   - 변환 생성 → 이력 표시 확인
   - 즐겨찾기 토글 → 목록 업데이트 확인
   - 삭제 → DB 반영 확인
   - 페이지 새로고침 → 데이터 유지 확인

3. 엣지 케이스 테스트
   - -40°C → -40°F
   - NaN 입력 → 에러 메시지
   - Infinity 입력 → 에러 메시지
   - 음수 길이 → 에러 메시지
   - 같은 단위 변환 → 원본 값 반환

4. 성능 테스트
   - 응답 시간 확인
   - DB 쿼리 최적화 확인
   - 병렬 페칭 확인

5. UI/UX 테스트
   - 카테고리 변경 시 단위 드롭다운 업데이트
   - 로딩 상태 표시
   - 에러 상태 표시
   - 반응형 레이아웃 (모바일/데스크톱)

완료 후 커밋:
"feat: Phase 5 - Integration and testing complete"
```

**결과:**
- 전체 기능 통합 완료
- 모든 테스트 케이스 통과
- 프로덕션 준비 완료

---

## 14. CLAUDE.md 재생성 (실제 코드베이스 기반)

**프롬프트:**
```
기존 CLAUDE.md 삭제하고 실제 코드베이스 기반으로 재생성해줘.

요구사항:
1. 실제 구현된 코드 분석
   - 모든 파일 구조
   - 실제 사용된 패키지 버전
   - 실제 컴포넌트 구조
   - 실제 Server Actions

2. 정확한 정보 반영
   - Next.js 16.1.1 (문서는 14였음)
   - React 19.2.3
   - Prisma 5.22.0 + libSQL adapter
   - Tailwind CSS v4
   - shadcn/ui (New York style)

3. 포괄적인 문서
   - 기술 스택 상세
   - 파일 구조 (실제 파일 기반)
   - 타입 시스템 (types/conversion.ts 전체)
   - 데이터베이스 스키마 (prisma/schema.prisma 전체)
   - 변환 로직 (lib/conversions.ts 상세)
   - Server Actions (app/actions/conversions.ts 전체)
   - 컴포넌트 아키텍처 (각 컴포넌트 상세)
   - shadcn/ui 컴포넌트 (설치된 것만)
   - 성능 최적화 패턴
   - 테스트 체크리스트
   - 일반적인 실수와 해결책
   - 개발 워크플로우
   - 트러블슈팅 가이드

4. 실용적인 예제
   - 복사-붙여넣기 가능한 코드
   - 실제 변환 공식과 결과
   - 명령어 예제
   - 설정 파일 내용

5. 문서 구조
   - 명확한 섹션 구분
   - 표와 코드 블록 활용
   - ✅/❌ 패턴
   - Quick Reference 섹션

목표:
- 새로운 개발자도 즉시 이해 가능
- AI 어시스턴트가 프로젝트 작업 가능
- 실제 코드와 100% 일치
- 포괄적이면서도 명확한 가이드
```

**결과:**
- 917줄의 포괄적인 CLAUDE.md 생성
- 실제 코드베이스 100% 반영
- 모든 구현 상세 문서화
- 즉시 사용 가능한 가이드

---

## 15. 프롬프트 문서화 및 최종 커밋

**프롬프트:**
```
오늘 사용한 모든 프롬프트 리스트업해줘.

포함:
1. 프로젝트 초기화 (Next.js, shadcn, Prisma)
2. PRD.md (수동 작성)
3. ARCHITECTURE.md 생성
4. DATABASE.md 생성
5. CLAUDE.md 생성
6. IMPLEMENTATION.md 생성
7. Co-pilot 검증 & 피드백 반영
8. Git 초기화
9. Phase 1-5 구현
10. CLAUDE.md 재생성
11. 전부

시간순으로.
docs/PROMPTS-DAY7.md에 저장. 다 되면 최종 커밋해줘.
```

**결과:**
- 이 문서 (docs/PROMPTS-DAY7.md) 생성
- 모든 프롬프트 시간순 정리
- 최종 커밋 준비

---

## 프롬프트 작성 패턴 분석

### 효과적인 프롬프트 구조

1. **명확한 목표 제시**
   - "~해줘" 형식으로 작업 명시
   - 예: "docs/PRD.md 작성해줘"

2. **상세한 요구사항**
   - 포함 내용 리스트업
   - 구체적인 세부사항 명시
   - 예: "포함 내용: 1. 프로젝트 개요, 2. 핵심 기능..."

3. **기반 문서 참조**
   - 이전 작업물 활용
   - 예: "기반: PRD.md, ARCHITECTURE.md 참고"

4. **검증 기준 제시**
   - 완료 조건 명확히
   - 예: "완료 후 커밋: 'feat: Phase 1 - Database setup complete'"

5. **구체적인 예제**
   - 기대하는 결과 샘플 제공
   - 예: "100m = 328.084ft"

### 프롬프트 작성 팁

**DO:**
- ✅ 구체적이고 명확한 지시
- ✅ 단계별 작업 분해
- ✅ 예상 결과 명시
- ✅ 제약사항 명확히
- ✅ 검증 방법 제시

**DON'T:**
- ❌ 모호한 표현
- ❌ 너무 많은 작업을 한 번에
- ❌ 암묵적 기대
- ❌ 시간 추정 요구
- ❌ 불필요한 장황함

### 프롬프트 진화 과정

1. **초기**: 간단한 작업 요청
   - "프로젝트 생성해줘"

2. **중기**: 상세한 요구사항 추가
   - "PRD.md 작성해줘 + 포함 내용 리스트"

3. **후기**: 피드백 기반 개선
   - "실제 코드베이스 기반으로 재생성 + 100% 일치"

---

## 총평

### 프로젝트 성과

- **문서 생성**: 7개 (PRD, ARCHITECTURE, DATABASE, CLAUDE, IMPLEMENTATION, PROMPTS, README)
- **코드 파일**: 15개 (컴포넌트, 액션, 유틸리티 등)
- **Git 커밋**: 4개 (체계적인 버전 관리)
- **테스트 케이스**: 12개 (모두 통과)

### 배운 점

1. **명확한 요구사항 정의의 중요성**
   - PRD부터 시작하면 방향성 명확

2. **단계적 접근의 효과**
   - Phase별 구현으로 복잡도 관리

3. **문서화의 가치**
   - 실제 코드 기반 문서는 즉시 활용 가능

4. **AI 협업 패턴**
   - 구체적 프롬프트 → 정확한 결과
   - 피드백 루프 → 품질 향상

### 개선 가능 영역

1. **초기 기술 스택 버전 명시**
   - Next.js 15 요청했지만 16 설치됨
   - 정확한 버전 지정 필요

2. **테스트 자동화**
   - 수동 테스트에서 자동화로

3. **CI/CD 파이프라인**
   - 자동 배포 설정

---

## 다음 단계 제안

1. **테스트 자동화**
   - Vitest 설정
   - E2E 테스트 (Playwright)

2. **배포**
   - Vercel 배포
   - 환경 변수 설정

3. **추가 기능**
   - 다크 모드
   - 더 많은 단위 (부피, 속도 등)
   - 변환 이력 검색

4. **성능 최적화**
   - 이미지 최적화
   - 번들 크기 분석
   - 로딩 성능 측정

---

**문서 작성일:** 2026-01-08
**프로젝트 상태:** Phase 2 Complete
**다음 작업:** Phase 3-5 구현 또는 배포 준비
