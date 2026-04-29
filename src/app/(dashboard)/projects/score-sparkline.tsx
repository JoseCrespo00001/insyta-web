"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

type Point = { date: string; score: number };

export function ScoreSparkline({ data }: { data: Point[] }) {
  if (!data || data.length < 2) {
    return (
      <div
        className="h-8 w-24 rounded border border-dashed text-[10px] leading-8 text-muted-foreground"
        style={{ textAlign: "center" }}
        aria-label="Sin tendencia disponible aun"
      >
        sin datos
      </div>
    );
  }

  return (
    <div className="h-8 w-24" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
        >
          <YAxis hide domain={[0, 100]} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
