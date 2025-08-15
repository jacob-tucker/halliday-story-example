"use client";
import { openHallidayPayments } from "@halliday-sdk/payments";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    openHallidayPayments({
      apiKey: process.env.NEXT_PUBLIC_HALLIDAY_PUBLIC_API_KEY as string,
      // $IP on Story
      outputs: ["story:0x"],
      // $USDC.e on Story
      // outputs: ["story:0xf1815bd50389c46847f0bda824ec8da914045d14"],
      sandbox: false,
      windowType: "EMBED",
      targetElementId: "halliday-embed",
    });
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white"
      id="halliday-embed"
    ></div>
  );
}
