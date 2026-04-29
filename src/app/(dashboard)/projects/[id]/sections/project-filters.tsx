"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/api/schemas";

type Filters = {
  from?: string;
  to?: string;
  agent_id?: string;
};

type Props = {
  agents: Agent[];
  value: Filters;
  onChange: (next: Filters) => void;
};

const ALL_AGENTS = "__all__";

function toIso(date: Date | undefined): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function fromIso(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatRange(filters: Filters): string {
  if (filters.from && filters.to) return `${filters.from} → ${filters.to}`;
  if (filters.from) return `Desde ${filters.from}`;
  if (filters.to) return `Hasta ${filters.to}`;
  return "Ultimos 30 dias";
}

export function ProjectFilters({ agents, value, onChange }: Props) {
  const hasFilters = Boolean(value.from || value.to || value.agent_id);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2",
              !value.from && !value.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: fromIso(value.from),
              to: fromIso(value.to),
            }}
            onSelect={(range) =>
              onChange({
                ...value,
                from: toIso(range?.from),
                to: toIso(range?.to),
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Select
        value={value.agent_id ?? ALL_AGENTS}
        onValueChange={(next) =>
          onChange({
            ...value,
            agent_id: next === ALL_AGENTS ? undefined : next,
          })
        }
      >
        <SelectTrigger className="h-9 w-[200px]">
          <SelectValue placeholder="Todos los agentes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_AGENTS}>Todos los agentes</SelectItem>
          {agents.map((a) => (
            <SelectItem key={a.public_id} value={a.public_id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange({})}
          className="gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      ) : null}
    </div>
  );
}
