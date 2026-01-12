"use client";

import { useState } from "react";

interface ChannelItem {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  icon: string;
}

export default function Sidebar() {
  const [selectedChannel, setSelectedChannel] = useState("trending");

  const channels: ChannelItem[] = [
    {
      id: "trending",
      name: "🔥 인기 밈 TOP 5",
      preview: "현재 트렌딩 중인 밈 목록을 확인하세요",
      time: "방금 전",
      icon: "🔥",
    },
    {
      id: "random",
      name: "🎲 랜덤 밈 추천",
      preview: "무작위로 밈을 추천받아보세요",
      time: "5분 전",
      icon: "🎲",
    },
    {
      id: "dictionary",
      name: "📚 밈 사전",
      preview: "밈의 뜻과 유래를 검색하세요",
      time: "10분 전",
      icon: "📚",
    },
  ];

  const trendingMemes: ChannelItem[] = [
    {
      id: "meme-1",
      name: "매끈매끈하다",
      preview: "한국어 형용사를 리듬감 있게 랩하듯 말하며 춤추는 챌린지 밈",
      time: "2분 전",
      icon: "🔥",
    },
    {
      id: "meme-2",
      name: "야르",
      preview: "기분이 좋을 때 자동반사적으로 튀어나오는 감탄사",
      time: "15분 전",
      icon: "⚡",
    },
    {
      id: "meme-3",
      name: "골반춤",
      preview: "춤/리듬 타는 상황을 과장해 표현하는 문장 드립",
      time: "1시간 전",
      icon: "⚖️",
    },
  ];

  return (
    <aside className="w-[280px] border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      {/* 사이드바 헤더 */}
      <div className="h-[60px] border-b border-zinc-800 flex items-center px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-600">
            <span className="text-sm font-bold text-white">W</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">WhatMeme</h2>
            <p className="text-xs text-zinc-400">Workspace</p>
          </div>
        </div>
      </div>

      {/* 채널 목록 */}
      <div className="flex-1 overflow-y-auto">
        {/* 주요 채널 */}
        <div className="px-2 py-3">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            주요 기능
          </div>
          <div className="space-y-1 mt-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full flex items-start space-x-3 px-3 py-2 rounded-md transition-colors duration-200 relative ${
                  selectedChannel === channel.id
                    ? "bg-zinc-900/50 text-white"
                    : "text-zinc-300 hover:bg-zinc-900/30"
                }`}
              >
                {selectedChannel === channel.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r"></div>
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900/50 text-base">
                  {channel.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium truncate">
                      {channel.name}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2 shrink-0">
                      {channel.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{channel.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 트렌딩 밈 */}
        <div className="px-2 py-3 border-t border-zinc-800">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            트렌딩
          </div>
          <div className="space-y-1 mt-1">
            {trendingMemes.map((meme) => (
              <button
                key={meme.id}
                onClick={() => setSelectedChannel(meme.id)}
                className={`w-full flex items-start space-x-3 px-3 py-2 rounded-md transition-colors duration-200 relative ${
                  selectedChannel === meme.id
                    ? "bg-zinc-900/50 text-white"
                    : "text-zinc-300 hover:bg-zinc-900/30"
                }`}
              >
                {selectedChannel === meme.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r"></div>
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900/50 text-base">
                  {meme.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium truncate">
                      {meme.name}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2 shrink-0">
                      {meme.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{meme.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
