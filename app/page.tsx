"use client";

import ChatInterface from "@/components/ChatInterface";
import { IoChevronUpCircleSharp } from "react-icons/io5";

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
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-[#20160f]">
                <img
                  src="/newwhatmemeappicon.png"
                  alt="whatmeme"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="leading-tight">
                <p className="text-xs tracking-[0.15em] text-[#d2c5b6]">
                  whatmeme
                </p>
                <p className="text-[11px] text-[#8e8377]">최신 밈 트렌드 & 재미있는 밈</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                MCP Server: Online
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)]">
            <ChatInterface />
          </div>
        </section>
      </div>

      <section className="mx-auto flex min-h-[100svh] max-w-5xl flex-col justify-center gap-12 px-6 py-16 sm:gap-16 sm:py-24">
        <div className="rounded-[28px] border border-white/10 bg-[#14110e] p-10 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9b8f80]">PlayMCP</p>
          <h2 className="mt-4 text-2xl text-white sm:text-3xl">
            Kakao PlayMCP에서도 이용하실 수 있습니다.
          </h2>
          <p className="mt-4 text-sm text-[#cfc4b6]">
            카카오 생태계에서 바로 whatmeme을 경험해보세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-[#e2d8cc] transition-colors hover:border-white/40 hover:text-white">
              PlayMCP에서 사용해 보기
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#14110e] p-10 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9b8f80]">Contact</p>
          <h2 className="mt-4 text-2xl text-white sm:text-3xl">문의하기</h2>
          <p className="mt-4 text-sm text-[#cfc4b6]">
            요청 사항 또는 피드백이 있으면 메일로 문의해주세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:woongaaaaa1@gmail.com"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-[#e2d8cc] transition-colors hover:border-white/40 hover:text-white"
            >
              woongaaaaaa1@gmail.com
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 text-sm text-[#cfc4b6] transition-colors hover:text-white"
          >
            <IoChevronUpCircleSharp className="h-8 w-8" />
            맨 위로
          </button>
        </div>
      </section>
    </div>
  );
}
