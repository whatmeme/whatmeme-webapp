"use client";

import { useRef, useState, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { TiMessages } from "react-icons/ti";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hoverScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
    // hover 스크롤 중지
    if (hoverScrollIntervalRef.current) {
      clearInterval(hoverScrollIntervalRef.current);
      hoverScrollIntervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "auto";
    }
    // hover 스크롤 중지
    if (hoverScrollIntervalRef.current) {
      clearInterval(hoverScrollIntervalRef.current);
      hoverScrollIntervalRef.current = null;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    // 드래그 중일 때
    if (isDragging) {
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // 스크롤 속도 조절
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      return;
    }

    // hover 스크롤 처리
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;
    const scrollZoneWidth = containerWidth * 0.2; // 좌우 20% 영역

    // 기존 hover 스크롤 중지
    if (hoverScrollIntervalRef.current) {
      clearInterval(hoverScrollIntervalRef.current);
      hoverScrollIntervalRef.current = null;
    }

    // 왼쪽 영역 (0 ~ 20%)
    if (mouseX < scrollZoneWidth) {
      const scrollSpeed = ((scrollZoneWidth - mouseX) / scrollZoneWidth) * 7.5; // 최대 7.5px
      hoverScrollIntervalRef.current = setInterval(() => {
        if (container.scrollLeft > 0) {
          container.scrollLeft -= scrollSpeed;
        } else {
          if (hoverScrollIntervalRef.current) {
            clearInterval(hoverScrollIntervalRef.current);
            hoverScrollIntervalRef.current = null;
          }
        }
      }, 16); // 약 60fps
    }
    // 오른쪽 영역 (80% ~ 100%)
    else if (mouseX > containerWidth - scrollZoneWidth) {
      const scrollSpeed = ((mouseX - (containerWidth - scrollZoneWidth)) / scrollZoneWidth) * 7.5; // 최대 7.5px
      hoverScrollIntervalRef.current = setInterval(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft < maxScroll) {
          container.scrollLeft += scrollSpeed;
        } else {
          if (hoverScrollIntervalRef.current) {
            clearInterval(hoverScrollIntervalRef.current);
            hoverScrollIntervalRef.current = null;
          }
        }
      }, 16); // 약 60fps
    }
  };

  // 컴포넌트 언마운트 시 interval 정리
  useEffect(() => {
    return () => {
      if (hoverScrollIntervalRef.current) {
        clearInterval(hoverScrollIntervalRef.current);
      }
    };
  }, []);

  // 터치 이벤트 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center space-x-2">
        {/* 아이콘 */}
        <div className="shrink-0 flex items-center">
          <TiMessages className="h-4 w-4 text-zinc-500" />
        </div>

        {/* 스크롤 가능한 컨테이너 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={(e) => {
                  // 드래그 중일 때는 클릭 이벤트 방지
                  if (isDragging) {
                    e.preventDefault();
                    return;
                  }
                  onSelect(reply);
                }}
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
    </div>
  );
}
