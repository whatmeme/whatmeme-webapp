"use client";

import Script from "next/script";

/**
 * 설정: .env.local에 NEXT_PUBLIC_GOATCOUNTER_SITE=사이트코드 추가
 */
export function GoatCounter() {
  const site = process.env.NEXT_PUBLIC_GOATCOUNTER_SITE;
  if (!site) return null;

  return (
    <Script
      data-goatcounter={`https://${site}.goatcounter.com/count`}
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
      async
    />
  );
}
