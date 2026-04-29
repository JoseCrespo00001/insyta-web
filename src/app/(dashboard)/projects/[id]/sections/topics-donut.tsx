"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PALETTE = [
  "hsl(207, 100%, 45%)",
  "hsl(180, 60%, 45%)",
  "hsl(280, 50%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(0, 70%, 55%)",
];

type Topic = { topic: string; count: number };

export function TopicsDonut({ topics }: { topics: Topic[] }) {
  if (!topics || topics.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Sin temas detectados aun
      </p>
    );
  }

  const top5 = topics.slice(0, 5);
  const total = top5.reduce((acc, t) => acc + t.count, 0);

  return (
    <div className="space-y-3">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top5}
              dataKey="count"
              nameKey="topic"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {top5.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-xs">
        {top5.map((t, i) => (
          <li key={t.topic} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
                aria-hidden
              />
              <span className="truncate">{t.topic}</span>
            </span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {total > 0 ? Math.round((t.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
