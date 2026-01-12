"use client";

import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">WhatMeme</h1>
          <p className="text-gray-600 dark:text-gray-400">
            한국 밈 트렌드 분석 및 추천 서비스
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  );
}
