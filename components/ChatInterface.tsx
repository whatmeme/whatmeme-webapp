"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    toolCall?: {
      name: string;
      arguments: Record<string, any>;
    };
    mcpResponse?: string;
  } | null;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    // 사용자 메시지 추가
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // LLM 채팅 API 호출 (대화 히스토리 포함)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 특정 오류에 대한 친화적인 메시지
        let errorMessage = errorData.error || `서버 오류 (${response.status})`;
        
        if (response.status === 429) {
          errorMessage = "⚠️ OpenAI API 쿼터가 초과되었습니다.\n\n계정의 결제 정보와 사용량을 확인해주세요:\nhttps://platform.openai.com/usage";
        } else if (response.status === 401) {
          errorMessage = "⚠️ OpenAI API 키가 유효하지 않습니다.\n\n.env.local 파일의 OPENAI_API_KEY를 확인해주세요.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "응답을 받을 수 없습니다.",
        timestamp: new Date(),
        metadata: data.metadata || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ 오류: ${error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-900">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="mb-4">안녕하세요! WhatMeme에 오신 것을 환영합니다.</p>
            <p className="text-sm mb-2">다음과 같은 질문을 해보세요:</p>
            <ul className="text-sm space-y-1 text-left max-w-md mx-auto">
              <li>• "요즘 핫한 밈 뭐야?"</li>
              <li>• "매끈매끈하다 밈 뜻 알려줘"</li>
              <li>• "시험 스트레스 받을 때 밈 추천해줘"</li>
              <li>• "밈 랜덤 추천"</li>
            </ul>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            
            {/* MCP 메타데이터 표시 */}
            {message.role === "assistant" && message.metadata?.toolCall && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm">
                  <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔧 MCP 도구 호출 정보
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      도구:
                    </span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                      {message.metadata.toolCall.name}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Request:
                    </span>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                      {JSON.stringify(
                        {
                          method: "tools/call",
                          params: {
                            name: message.metadata.toolCall.name,
                            arguments: message.metadata.toolCall.arguments,
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      MCP 응답:
                    </span>
                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs whitespace-pre-wrap break-words">
                      {message.metadata.mcpResponse}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-300 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
