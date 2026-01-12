"use client";

import { IoMdSend } from "react-icons/io";

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

const quickReplies = [
  "매끈매끈하다 밈 핫해?",
  "최신 밈 알려줘",
  "시험 스트레스 받을 때 밈",
  "매끈매끈하다 밈 알아?",
  "밈 아무거나 알려줘",
  "골반춤 밈 유행이야?",
  "요즘 핫한 밈 뭐야?",
  "신날 때 쓰는 밈 뭐있어?",
  "골반춤 밈이 뭐야?",
  "밈 하나 추천해줘",
  "요즘 럭키비키 밈 식었어?",
  "지금 유행하는 밈 뭐 있어?",
  "합의 없이 결론을 멋대로 지을 때 밈 추천해줘",
  "럭키비키 밈 알려줘",
  "밈 랜덤 추천",
];

export default function QuickReplies({ onSelect, disabled = false }: QuickRepliesProps) {
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
              disabled={disabled}
              className={`bg-zinc-900/50 text-xs text-zinc-300 border border-zinc-800 rounded-full px-4 py-1.5 transition-all whitespace-nowrap font-medium inline-flex items-center gap-2 ${
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-zinc-800/50 cursor-pointer"
              }`}
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
