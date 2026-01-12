import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// MCP 서버 URL
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "https://sx8ajmutmd.us-east-1.awsapprunner.com/mcp";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SSE 형식 응답 파싱
function parseSSEResponse(text: string): any {
  // SSE 형식: "event: message\ndata: {...}\n\n"
  const lines = text.split('\n');
  let jsonData = null;
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        jsonData = JSON.parse(line.substring(6)); // "data: " 제거
        break;
      } catch (e) {
        // JSON 파싱 실패 시 계속 시도
      }
    }
  }
  
  return jsonData;
}

// MCP 서버에 요청 보내기
async function callMCPServer(method: string, params?: any) {
  const mcpRequest: any = {
    jsonrpc: "2.0",
    method: method,
    id: Date.now(),
  };
  
  // params가 있고 비어있지 않을 때만 추가
  if (params && Object.keys(params).length > 0) {
    mcpRequest.params = params;
  }

  // 개발 환경에서만 상세 로깅
  if (process.env.NODE_ENV === "development") {
    console.log(`MCP 요청 [${method}]:`, JSON.stringify(mcpRequest, null, 2));
  }

  const response = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    },
    body: JSON.stringify(mcpRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`MCP 서버 오류 (${response.status}):`, errorText);
    throw new Error(`MCP 서버 오류 (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  
  // JSON 응답 처리
  if (contentType.includes("application/json")) {
    const data = await response.json();
    
    // result.content가 SSE 형식인 경우 파싱
    if (data.result?.content?.[0]?.text) {
      const textContent = data.result.content[0].text;
      if (textContent.includes('event:') && textContent.includes('data:')) {
        const parsedData = parseSSEResponse(textContent);
        if (parsedData) {
          if (process.env.NODE_ENV === "development") {
            console.log(`MCP 응답 [${method}] (SSE 파싱됨):`, JSON.stringify(parsedData, null, 2));
          }
          return parsedData;
        }
      }
    }
    
    if (process.env.NODE_ENV === "development") {
      console.log(`MCP 응답 [${method}]:`, JSON.stringify(data, null, 2));
    }
    return data;
  }

  // 텍스트 응답 처리 (SSE 형식일 수 있음)
  const text = await response.text();
  
  // SSE 형식인지 확인
  if (text.includes('event:') && text.includes('data:')) {
    const parsedData = parseSSEResponse(text);
    if (parsedData) {
      if (process.env.NODE_ENV === "development") {
        console.log(`MCP 응답 [${method}] (SSE 파싱됨):`, JSON.stringify(parsedData, null, 2));
      }
      return parsedData;
    }
  }
  
  // 일반 JSON 파싱 시도
  try {
    const data = JSON.parse(text);
    if (process.env.NODE_ENV === "development") {
      console.log(`MCP 응답 [${method}]:`, JSON.stringify(data, null, 2));
    }
    return data;
  } catch {
    return {
      jsonrpc: "2.0",
      result: {
        content: [{ type: "text", text: text }],
      },
      id: mcpRequest.id,
    };
  }
}

// MCP 도구 목록 가져오기
async function getMCPTools() {
  try {
    // MCP 프로토콜: tools/list는 params 없이 호출
    const response = await callMCPServer("tools/list");
    
    if (process.env.NODE_ENV === "development") {
      console.log("MCP tools/list 응답:", JSON.stringify(response, null, 2));
    }
    
    // MCP 프로토콜 응답 형식 확인
    if (response.error) {
      console.error("MCP 오류:", response.error);
      return [];
    }
    
    // result.tools 또는 tools 직접 확인
    // SSE 파싱 후에는 result.result.tools 구조일 수 있음
    const tools = response.result?.tools || 
                  response.result?.result?.tools || 
                  response.tools || 
                  [];
    console.log(`MCP 도구 ${tools.length}개 발견`);
    return tools;
  } catch (error) {
    console.error("MCP 도구 목록 가져오기 실패:", error);
    return [];
  }
}

// MCP 도구를 OpenAI Tool 형식으로 변환
function convertMCPToolToOpenAITool(tool: any) {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema || {
        type: "object",
        properties: {},
      },
    },
  };
}

// MCP 도구 실행
async function executeMCPTool(toolName: string, arguments_: any) {
  try {
    const response = await callMCPServer("tools/call", {
      name: toolName,
      arguments: arguments_,
    });

    if (response.error) {
      return `오류: ${response.error.message}`;
    }

    // MCP 응답에서 텍스트 추출
    if (response.result?.content) {
      const content = response.result.content;
      if (Array.isArray(content)) {
        const textContent = content.find((item: any) => item.type === "text");
        if (textContent) {
          return textContent.text;
        }
        return content[0]?.text || JSON.stringify(content[0]);
      }
      return typeof content === "string" ? content : content.text || JSON.stringify(content);
    }

    return JSON.stringify(response.result);
  } catch (error) {
    return `도구 실행 오류: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages 배열이 필요합니다." },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // MCP 도구 목록 가져오기
    const mcpTools = await getMCPTools();
    
    // 도구가 없으면 기본 도구 목록 사용 (폴백)
    if (mcpTools.length === 0) {
      console.warn("MCP 도구를 가져올 수 없어 기본 도구 목록을 사용합니다.");
      // 기본 도구 목록 (하드코딩)
      mcpTools.push(
        {
          name: "check_meme_status",
          description: "밈의 현재 유행/트렌딩 상태를 5단계로 답합니다",
          inputSchema: {
            type: "object",
            properties: {
              keyword: { type: "string", description: "검색할 밈 키워드" },
            },
            required: ["keyword"],
          },
        },
        {
          name: "get_trending_memes",
          description: "현재 트렌딩 TOP 5 밈 목록을 반환합니다",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "recommend_meme_for_context",
          description: "주어진 상황에 맞는 밈을 추천합니다",
          inputSchema: {
            type: "object",
            properties: {
              situation: { type: "string", description: "상황 설명" },
            },
            required: ["situation"],
          },
        },
        {
          name: "search_meme_meaning",
          description: "밈의 뜻/유래/사용예시를 설명합니다",
          inputSchema: {
            type: "object",
            properties: {
              keyword: { type: "string", description: "검색할 밈 키워드" },
            },
            required: ["keyword"],
          },
        },
        {
          name: "get_random_meme",
          description: "랜덤으로 밈 하나를 선택해서 뜻/유래/예시를 보여줍니다",
          inputSchema: { type: "object", properties: {} },
        }
      );
    }
    
    const tools = mcpTools.map(convertMCPToolToOpenAITool);

    console.log(`사용 가능한 MCP 도구: ${tools.length}개`);

    // OpenAI Chat Completion 호출
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국 밈 트렌드 분석 전문가입니다. 사용자의 질문에 답하기 위해 MCP 도구를 사용할 수 있습니다.
          
사용 가능한 도구:
- check_meme_status: 밈의 현재 유행 상태 확인
- get_trending_memes: 현재 트렌딩 TOP 5 밈 목록
- recommend_meme_for_context: 상황에 맞는 밈 추천
- search_meme_meaning: 밈의 뜻/유래/사용예시 검색
- get_random_meme: 랜덤 밈 추천

사용자의 질문을 이해하고, 필요하면 적절한 도구를 사용하여 정확하고 친절하게 답변하세요.`,
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const message = completion.choices[0].message;

    // Tool Calling이 필요한 경우
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments || "{}");

      console.log(`도구 호출: ${functionName}`, functionArgs);

      // MCP 도구 실행
      const toolResult = await executeMCPTool(functionName, functionArgs);

      // 도구 결과를 포함하여 다시 LLM 호출
      const finalCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `당신은 한국 밈 트렌드 분석 전문가입니다. 도구 실행 결과를 바탕으로 사용자에게 친절하고 자연스럽게 답변하세요.`,
          },
          ...messages,
          {
            role: "assistant",
            content: null,
            tool_calls: message.tool_calls,
          },
          {
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: toolResult,
          },
        ],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
      });

      return NextResponse.json({
        role: "assistant",
        content: finalCompletion.choices[0].message.content,
        metadata: {
          toolCall: {
            name: functionName,
            arguments: functionArgs,
          },
          mcpResponse: toolResult,
        },
      });
    }

    // 일반 응답
    return NextResponse.json({
      role: "assistant",
      content: message.content,
      metadata: null,
    });
  } catch (error: any) {
    console.error("Chat API 오류:", error);
    
    // OpenAI 쿼터 오류 처리
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "OpenAI API 쿼터가 초과되었습니다. 계정의 결제 정보와 사용량을 확인해주세요.",
          details: error.message,
        },
        { status: 429 }
      );
    }
    
    // OpenAI 인증 오류
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error: "OpenAI API 키가 유효하지 않습니다. .env.local 파일의 OPENAI_API_KEY를 확인해주세요.",
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
