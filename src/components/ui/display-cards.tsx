"use client";

import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  trailing?: React.ReactNode;
  iconWrapClassName?: string;
  titleClassName?: string;
  onClick?: () => void;
}

export function DisplayCard({
  className,
  icon = <MessageCircle className="size-4 text-primary" />,
  title = "Conversación",
  description = "—",
  date = "ahora",
  trailing,
  iconWrapClassName = "bg-primary/15",
  titleClassName = "text-foreground",
  onClick,
}: DisplayCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative flex h-40 w-[23rem] -skew-y-[8deg] cursor-pointer select-none flex-col justify-between rounded-2xl border-2 bg-card/95 px-5 py-4 shadow-md backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-card hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "relative inline-flex items-center justify-center rounded-full p-1.5",
              iconWrapClassName,
            )}
          >
            {icon}
          </span>
          <p className={cn("text-base font-semibold", titleClassName)}>
            {title}
          </p>
        </span>
        {trailing}
      </div>
      <p className="truncate text-sm text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground/70">{date}</p>
    </div>
  );
}

export interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const displayCards = cards ?? [{}, {}, {}];

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
