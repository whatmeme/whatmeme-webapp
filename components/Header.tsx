"use client";

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-[60px] border-b border-zinc-800 backdrop-blur-xl bg-zinc-950/70 flex items-center justify-between px-6">
      {/* 좌측: 현재 대화 정보 */}
      <div className="flex items-center space-x-3">
        {/* 사이드바 토글 버튼 (모바일) */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-md transition-colors duration-200"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* 채널/대화 정보 */}
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">WhatMeme Bot</h1>
            <p className="text-sm text-zinc-400">온라인</p>
          </div>
        </div>
      </div>

      {/* 우측: 유틸리티 버튼 */}
      <div className="flex items-center space-x-1">
        <button className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-md transition-colors duration-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-md transition-colors duration-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
