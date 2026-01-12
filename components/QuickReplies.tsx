"use client";

import { IoMdSend } from "react-icons/io";

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

const quickReplies = [
  "요즘 가장 핫한 밈은?",
  "회사에서 쓰기 좋은 밈 추천해줘",
  "시험 스트레스 받을 때 밈",
  "매끈매끈하다 밈 뜻 알려줘",
  "밈 랜덤 추천",
  "골반춤 밈 유행이야?",
];

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs font-medium text-zinc-500 whitespace-nowrap shrink-0">
          예시:
        </span>
        <div className="flex gap-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onSelect(reply)}
              className="bg-zinc-900/50 hover:bg-zinc-800/50 text-xs text-zinc-300 border border-zinc-800 rounded-full px-4 py-1.5 transition-all cursor-pointer whitespace-nowrap font-medium inline-flex items-center gap-2"
            >
              <IoMdSend className="h-3.5 w-3.5 text-zinc-400" />
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
