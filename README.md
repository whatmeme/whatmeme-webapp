# WhatMeme WebApp

한국 밈 트렌드 분석 및 추천을 위한 AI 기반 Next.js 웹 애플리케이션

## 기능

- 🤖 **AI 기반 자연어 대화**: LLM이 사용자 질문을 이해하고 적절한 MCP 도구를 자동으로 선택
- 🔥 실시간 밈 트렌드 조회
- 📖 밈 의미 및 유래 검색
- 💡 상황별 밈 추천
- 📊 밈 유행 상태 확인
- 🎲 랜덤 밈 추천

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **OpenAI GPT** (LLM)
- **MCP (Model Context Protocol)** - 밈 데이터 서버
- **Vercel** (배포)

## 시작하기

### 개발 환경 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음을 추가하세요:
```
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-your-openai-api-key-here

# OpenAI 모델 (선택사항, 기본값: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# MCP 서버 URL (선택사항, 기본값 사용 가능)
MCP_SERVER_URL=https://sx8ajmutmd.us-east-1.awsapprunner.com/mcp
```

**중요**: OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

3. 개발 서버 실행:
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

### Vercel 배포

1. Vercel에 프로젝트를 연결합니다.
2. 환경 변수를 설정합니다:
   - `OPENAI_API_KEY` (필수): OpenAI API 키
   - `OPENAI_MODEL` (선택사항): 사용할 모델 (기본값: gpt-4o-mini)
   - `MCP_SERVER_URL` (선택사항): MCP 서버 URL
3. 배포가 자동으로 진행됩니다.

### 도메인 연결

Vercel 대시보드에서 `whatmeme.site` 도메인을 프로젝트에 연결하세요.

## 사용 예시

AI가 자연스럽게 대화하며 적절한 도구를 자동으로 선택합니다:

- "요즘 핫한 밈 뭐야?"
- "매끈매끈하다 밈 뜻 알려줘"
- "시험 스트레스 받을 때 밈 추천해줘"
- "밈 랜덤 추천"
- "골반춤 밈이 유행이야?"
- "럭키비키 밈에 대해 설명해줘"

## 아키텍처

```
사용자 입력
    ↓
ChatInterface (프론트엔드)
    ↓
/api/chat (Next.js API Route)
    ↓
OpenAI GPT (LLM)
    ↓
Function Calling → MCP 도구 선택
    ↓
MCP 서버 (도구 실행)
    ↓
LLM이 결과를 자연어로 변환
    ↓
사용자에게 응답
```

## 주요 특징

- **자동 도구 선택**: LLM이 사용자 의도를 파악하여 적절한 MCP 도구를 자동으로 선택
- **대화 컨텍스트 유지**: 이전 대화 내용을 기억하여 자연스러운 대화 가능
- **Function Calling**: OpenAI의 Function Calling 기능을 활용하여 MCP 도구와 통합
