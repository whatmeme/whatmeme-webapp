import { NextRequest, NextResponse } from "next/server";

// MCP 서버 URL (환경 변수에서 가져오거나 기본값 사용)
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "https://sx8ajmutmd.us-east-1.awsapprunner.com/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params } = body;

    // MCP 프로토콜 형식으로 요청 구성
    const mcpRequest = {
      jsonrpc: "2.0",
      method: method,
      ...(params && { params }),
      id: Date.now(),
    };

    console.log("MCP 요청:", JSON.stringify(mcpRequest, null, 2));

    // MCP 서버에 요청 전송
    // StreamableHTTPServerTransport는 application/json과 text/event-stream 둘 다 Accept 헤더에 필요
    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      },
      body: JSON.stringify(mcpRequest),
    });

    console.log("MCP 응답 상태:", response.status);
    console.log("MCP 응답 헤더:", Object.fromEntries(response.headers.entries()));

    // 응답 상태 확인
    if (!response.ok) {
      const errorText = await response.text();
      console.error("MCP 서버 오류 응답:", response.status, errorText);
      throw new Error(`MCP 서버 오류 (${response.status}): ${errorText}`);
    }

    // Content-Type 확인
    const contentType = response.headers.get("content-type") || "";
    
    // JSON 응답 처리
    if (contentType.includes("application/json")) {
      const data = await response.json();
      console.log("MCP JSON 응답:", JSON.stringify(data, null, 2));
      
      // MCP 응답 형식 확인
      if (data.error) {
        return NextResponse.json(data, { status: 200 }); // MCP는 오류도 200으로 반환
      }

      return NextResponse.json(data);
    }
    
    // 텍스트 응답 처리 (SSE 스트림이 아닌 경우)
    if (contentType.includes("text/")) {
      const text = await response.text();
      try {
        // JSON으로 파싱 시도
        const data = JSON.parse(text);
        return NextResponse.json(data);
      } catch {
        // JSON이 아니면 텍스트로 반환
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            content: [
              {
                type: "text",
                text: text,
              },
            ],
          },
          id: mcpRequest.id,
        });
      }
    }

    // 기본: 텍스트로 읽고 JSON 파싱 시도
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      // 파싱 실패 시 원본 텍스트 반환
      return NextResponse.json({
        jsonrpc: "2.0",
        result: {
          content: [
            {
              type: "text",
              text: text,
            },
          ],
        },
        id: mcpRequest.id,
      });
    }
  } catch (error) {
    console.error("MCP API 오류:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
        id: null,
      },
      { status: 500 }
    );
  }
}
