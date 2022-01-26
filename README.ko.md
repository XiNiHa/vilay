# vite-ssr-relay-template

[English](README.md) | 한국어

## 주요 특징

- Vite, vite-plugin-ssr 기반
- React 18 및 Suspense 기반 SSR 스트리밍 사용
- Relay 연동 (Render-as-you-fetch 지원)
- 커스터마이징 용이

## 기타 구성요소

- Yarn Berry (PNPM 링커)
- TypeScript
- Prettier & ESLint
- UnoCSS

## 작업이 필요한 부분

- Cloudflare Workers 등 환경에 대한 서버 런타임 구현
- 이미지 최적화 구현
- 사용성 향상

## 사용 준비하기

다음 프로그램들이 설치되어 있어야 합니다:

- Node.js
- Yarn

1. 이 저장소를 클론하세요.
2. `yarn`을 실행해 의존성을 다운받으세요.

## NPM 스크립트 목록

- `dev`: 로컬에서 개발 서버를 실행합니다. 해당 스크립트는 `server/index.ts`에 존재하며, Node.js 환경에서 실행됩니다.
- `prod`: `build` 스크립트를 실행하고, `server:prod` 스크립트를 실행합니다.
- `build`: Vite를 사용해 클라이언트와 서버 파일을 빌드합니다. 프로덕션 서버 실행에 필요합니다.
- `server:prod`: 프로덕션 서버를 실행합니다. 실행 전 빌드가 필요합니다.
- `relay`: Relay 컴파일러를 실행합니다. `-w` 옵션을 활용하면 파일 변경 시 자동으로 재실행시키는 방식으로 사용할 수 있습니다.
- `lint`: 사용자 코드를 대상으로 ESLint를 실행합니다.
- `format`: JS/TS 코드를 대상으로 Prettier를 실행합니다.

## 데모 앱 실행해 보기

1. [GitHub Personal Access Token을 생성](https://github.com/settings/tokens/new?scopes=repo)하세요.
2. `.env.example` 파일을 참고하여 위 토큰이 담긴 `.env.local` 파일을 생성하세요.
3. 터미널 두 개를 열어, 각각 `yarn dev`과 `yarn relay -w`를 실행합니다.
4. 첫 터미널에 출력된 URL을 열면 데모 엡이 나타납니다.

## 파일 구조

```sh
components/        # 데모 앱에서 사용되는 컴포넌트들
  issues/
    IssueList.tsx  # 이슈 목록 컴포넌트, Relay를 활용한 Pagination 예제 포함
    Issue.tsx      # 각 이슈 항목을 나타내는 컴포넌트, Fragment 사용
  Button.tsx       # 공통 버튼 컴포넌트
pages/                        # 데모 앱에서 사용되는 페이지들
  index.page.tsx              # Relay를 활용한 기본적인 데이터 가져오기 예제 페이지
  issues.page.route.tsx       # /repo/:owner/:name/issues 페이지를 위한 경로 정의 파일
  issues.page.tsx             # 경로 파라미터를 사용한 데이터 가져오기 등이 포함된 예제 페이지
  createIssue.page.route.tsx  # /repo/:owner/:name/issues/create 페이지를 위한 경로 정의 파일
  createIssue.page.tsx        # 간단한 Mutation 사용이 포함된 예제 페이지
renderer/                   # 앱의 기반으로써 사용되는 파일들
  _default.page.client.tsx  # 클라이언트에서 최초 로딩되는 스크립트, Hydration 등 수행
  _default.page.server.tsx  # 서버에서 매 요청마다 실행되는 스크립트, SSR 등 수행
  _error.page.tsx           # 에러 시 나타나는 페이지
  ErrorFallback.tsx         # React ErrorBoundary에서 사용하는 Fallback 컴포넌트
  PageShell.tsx             # 각종 Provider들을 포함하는 최상단 컴포넌트
  ReactDOMServer.d.ts       # React 18의 Streaming SSR API에 대한 타입 정의
  RelayEnvironment.tsx      # Relay의 Environment 구성 스크립트
  types.ts                  # 각종 공통 타입 정의
  usePageContext.tsx        # vite-plugin-ssr의 PageContext를 위한 Provider와 Hook
server/
  index.ts        # 서버 실행 스크립트
config.ts         # 템플릿 내에서 사용하는 각종 설정들
relay.config.js   # Relay 설정
schema.graphql    # Relay에서 사용하는 GraphQL Schema, 기본적으로 GitHub API Schema가 들어가 있음
vite.config.ts    # Vite 설정
```

각 파일 내에 추가적인 주석이 삽입되어 있습니다.
