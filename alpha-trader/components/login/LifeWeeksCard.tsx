"use client";
import { Sparkles, MapPin } from "lucide-react";
import type { LifeWeeks } from "@/data/login-hero";

export function LifeWeeksCard({
  title,
  weeks,
  sparkline,
}: {
  title: string;
  weeks: LifeWeeks;
  sparkline: number[];
}) {
  const { currentWeek, totalWeeks, weeksRemaining, lifeProgress } = weeks;
  const fmt = (n: number) => n.toLocaleString("en-US");

  const W = 180, H = 38, MAX = Math.max(...sparkline, 1);
  const xs = sparkline.map((_, i) => (i / (sparkline.length - 1)) * W);
  const ys = sparkline.map(p => H - 3 - (p / MAX) * (H - 8));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H}Z`;

  const markerPct = lifeProgress;
  const labelOffset = markerPct > 70 ? "-100%" : "-50%";

  return (
    <div
      className="rounded-[20px] p-5 border border-white/20"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <div className="text-white font-bold text-[13px] mb-4">{title}</div>

      <div className="flex items-end justify-between mb-4 gap-3">
        <div>
          <div className="flex items-center gap-1 text-white/50 text-[10px] font-medium mb-0.5">
            <Sparkles size={10} /> Week
          </div>
          <div className="text-white font-extrabold text-[1.45rem] leading-none stat-num">
            {fmt(currentWeek)}
            <span className="text-white/50 text-[11px] font-medium ml-1">of {fmt(totalWeeks)}</span>
          </div>
          <div className="mt-1">
            <span className="font-bold stat-num" style={{ color: "#6ee7b7", fontSize: "0.95rem" }}>
              {fmt(weeksRemaining)}
            </span>
            <span className="text-white/50 text-[10px] font-medium ml-1">weeks left</span>
          </div>
        </div>

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="lwFill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#lwFill2)" />
          <path d={line} stroke="#c4b5fd" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3.5} fill="#fff" stroke="#a78bfa" strokeWidth={2} />
        </svg>
      </div>

      <div className="mb-1">
        <div className="relative h-4 mb-1">
          <div
            className="absolute flex items-center gap-0.5 whitespace-nowrap"
            style={{ left: `${markerPct}%`, transform: `translateX(${labelOffset})` }}
          >
            <MapPin size={9} style={{ color: "#fbbf24" }} />
            <span className="text-[9px] font-bold" style={{ color: "#fbbf24" }}>You are here</span>
          </div>
        </div>

        <div
          className="relative w-full rounded-full"
          style={{ height: 8, background: "rgba(255,255,255,0.12)" }}
          role="progressbar"
          aria-valuenow={lifeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${markerPct}%`, background: "linear-gradient(90deg,#a78bfa,#6ee7b7)" }}
          />
          <div
            className="absolute top-1/2 rounded-full marker-blink"
            style={{
              left: `${markerPct}%`,
              width: 14, height: 14,
              transform: "translate(-50%, -50%)",
              background: "#fbbf24",
              boxShadow: "0 0 0 3px rgba(251,191,36,0.3), 0 0 10px rgba(251,191,36,0.6)",
              border: "2px solid white",
            }}
          />
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-white/35 text-[9px]">Birth</span>
          <span className="text-white/35 text-[9px]">Week {fmt(totalWeeks)}</span>
        </div>
      </div>

      <div className="text-white/45 text-[10px] mt-2.5">
        {"You've used "}
        <span className="text-white font-bold">{lifeProgress}%</span>
        {" of your "}{fmt(totalWeeks)}{" weeks."}
      </div>
    </div>
  );
}

export default LifeWeeksCard;