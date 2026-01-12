"use client";

import { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import QuickReplies from "./QuickReplies";

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
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoScrollRef = useRef(true);

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) {
      return;
    }
    if (!autoScrollRef.current) {
      return;
    }
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
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
        let errorMessage = errorData.error || `서버 오류 (${response.status})`;

        if (response.status === 429) {
          errorMessage = "⚠️ OpenAI API 쿼터가 초과되었습니다.\n\n계정의 결제 정보와 사용량을 확인해주세요:\nhttps://platform.openai.com/usage";
        } else if (response.status === 401) {
          errorMessage = "⚠️ OpenAI API 키가 유효하지 않습니다.\n\n.env.local 파일의 OPENAI_API_KEY를 확인해주세요.";
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && response.body) {
        setIsStreaming(true);
        const assistantId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            metadata: null,
          },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part
              .split("\n")
              .find((item) => item.startsWith("data: "));
            if (!line) continue;

            const json = line.replace("data: ", "").trim();
            if (!json) continue;

            const payload = JSON.parse(json);

            if (payload.type === "delta") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + (payload.content || "") }
                    : msg
                )
              );
            } else if (payload.type === "meta") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, metadata: payload.metadata || null }
                    : msg
                )
              );
            } else if (payload.type === "error") {
              throw new Error(payload.error || "알 수 없는 오류가 발생했습니다.");
            }
          }
        }

        setIsStreaming(false);
      } else {
        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content || "응답을 받을 수 없습니다.",
          timestamp: new Date(),
          metadata: data.metadata || null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ 오류: ${error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
    textareaRef.current?.focus();
  };

  const handleQuickReply = (text: string) => {
    if (isLoading) {
      return;
    }
    void sendMessage(text);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지 그룹화: 같은 발신자의 연속된 메시지는 그룹화
  const shouldShowAvatar = (current: Message, previous: Message | null) => {
    if (!previous) return true;
    if (current.role !== previous.role) return true;
    const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
    return timeDiff > 5 * 60 * 1000; // 5분 이상 차이나면 새 그룹
  };

  // 아바타 컴포넌트
  const Avatar = ({ role, show }: { role: "user" | "assistant"; show: boolean }) => {
    if (!show) {
      return <div className="w-8 shrink-0" />;
    }

    if (role === "assistant") {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600">
          <span className="text-xs font-bold text-white">W</span>
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
        <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950">
      {/* 채팅 메시지 영역 */}
      <div
        className="relative flex-1 min-h-0 overflow-y-auto"
        ref={messagesContainerRef}
        onScroll={() => {
          const container = messagesContainerRef.current;
          if (!container) return;
          const threshold = 80;
          const atBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
          autoScrollRef.current = atBottom;
        }}
      >
        {messages.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900/50">
                  <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-400">메시지를 입력하여 대화를 시작하세요</p>
            </div>
          </div>
        )}
        <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-6 py-6">
          {messages.length > 0 && (
            <div className="space-y-1">
              {messages.map((message, index) => {
                const previous = index > 0 ? messages[index - 1] : null;
                const showAvatar = shouldShowAvatar(message, previous);
                const isGrouped = !showAvatar && message.role === previous?.role;

                return (
                  <div key={message.id} className="space-y-1">
                    {/* MCP 메타데이터 */}
                    {message.role === "assistant" && message.metadata?.toolCall && (
                      <div className="ml-11 mr-2 mb-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs">
                          <div className="mb-3 flex items-center space-x-2">
                            <span className="text-zinc-400">🔧</span>
                            <span className="font-bold text-zinc-300">MCP 도구 호출</span>
                          </div>
                          <div className="space-y-2 text-zinc-400">
                            <div>
                              <span className="font-medium">도구:</span>
                              <span className="ml-2 text-zinc-300">{message.metadata.toolCall.name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Request:</span>
                              <pre className="mt-1 rounded-lg bg-zinc-950 p-2 text-xs border border-zinc-800 whitespace-pre-wrap break-words">
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
                              <span className="font-medium">MCP 응답:</span>
                              <div className="mt-1 rounded-lg bg-zinc-950 p-2 text-xs whitespace-pre-wrap break-words text-zinc-300 border border-zinc-800">
                                {message.metadata.mcpResponse}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex items-start space-x-3 px-2 py-1.5 hover:bg-zinc-900/30 rounded-md transition-colors duration-200 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                    >
                      <Avatar role={message.role} show={showAvatar} />

                      <div
                        className={`flex flex-col min-w-0 flex-1 ${message.role === "user" ? "items-end" : "items-start"
                          }`}
                      >
                        {/* 발신자 이름 (그룹의 첫 메시지에만) */}
                        {showAvatar && message.role === "assistant" && (
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="text-xs font-bold text-zinc-200">whatmeme Bot</span>
                          </div>
                        )}

                        {/* 메시지 버블 - shadcn/ui 스타일 */}
                        <div
                          className={`max-w-[75%] px-5 py-3 text-[15px] leading-relaxed shadow-sm ${message.role === "user"
                            ? "bg-[#f2ede4] text-[#1b0f0a] font-medium rounded-2xl rounded-tr-sm"
                            : "bg-zinc-800/50 text-zinc-200 border border-white/5 rounded-2xl rounded-tl-sm"
                            } ${isGrouped ? "mt-0.5" : ""}`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        </div>

                        {/* 타임스탬프 (그룹의 첫 메시지에만) */}
                        {showAvatar && (
                          <span className="mt-1 text-xs font-normal text-zinc-500">
                            {message.timestamp.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* 로딩 인디케이터 */}
              {isLoading && !isStreaming && (
                <div className="flex items-start space-x-3 px-2 py-1.5">
                  <Avatar role="assistant" show={true} />
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-bold text-zinc-200">WhatMeme Bot</span>
                    <div className="bg-zinc-800/50 text-zinc-200 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 퀵 리플라이 (입력창 위 경계선) */}
      <QuickReplies onSelect={handleQuickReply} disabled={isLoading} />

      {/* 입력 영역 (Full-width 에디터 스타일) - Glassmorphism */}
      <div className="shrink-0 border-t border-zinc-800 backdrop-blur-xl bg-zinc-950/70">
        <div className="p-5">
          <div className="mx-auto max-w-4xl">
            <div className="w-full bg-zinc-900/50 border border-zinc-800 focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/20 rounded-xl transition-all duration-300 shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)]">
              <div className="flex items-center space-x-3 p-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지 입력... (Enter 전송, Shift+Enter 줄바꿈)"
                  className="flex-1 resize-none border-0 bg-transparent py-2 text-sm font-medium leading-6 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0"
                  rows={1}
                  disabled={isLoading}
                  style={{ maxHeight: "200px" }}
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200 ${input.trim() && !isLoading
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  type="button"
                >
                  <IoIosSend className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
