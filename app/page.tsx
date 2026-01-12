"use client";

import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f6f1ea]">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-200px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,187,122,0.18),transparent_60%)] blur-3xl animate-floaty-slow" />
          <div className="absolute right-[-120px] top-[120px] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_center,rgba(134,164,255,0.14),transparent_60%)] blur-3xl animate-floaty" />
          <div className="absolute left-[30%] top-[520px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,150,114,0.12),transparent_60%)] blur-3xl" />
        </div>

        <section className="relative mx-auto flex h-[100svh] max-w-5xl min-h-0 flex-col px-6 pb-10 pt-10">
          <div className="mb-6 flex items-center justify-between text-sm text-[#cfc4b6]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2b46b] via-[#c8764a] to-[#5c3627] text-[#1b0f0a]">
                <span className="text-xs font-semibold">WM</span>
              </div>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d2c5b6]">
                  WhatMeme chat
                </p>
                <p className="text-[11px] text-[#8e8377]">Realtime meme concierge</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                Live
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)]">
            <ChatInterface />
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-[28px] border border-white/10 bg-[#14110e] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9b8f80]">Contact</p>
          <h2 className="font-display mt-4 text-3xl text-white">문의하기</h2>
          <p className="mt-4 text-sm text-[#cfc4b6]">
            필요한 밈 리서치나 협업 요청이 있으면 바로 연락주세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="rounded-full bg-[#f6f1ea] px-6 py-3 text-sm font-semibold text-[#1b0f0a] transition-transform hover:-translate-y-0.5">
              hello@whatmeme.ai
            </button>
            <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-[#e2d8cc] transition-colors hover:border-white/40 hover:text-white">
              상담 예약
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
