import { Match } from "@prisma/client";

export type PriceInfo = {
  price: number;
  isEarlyBird: boolean;
  label: string;
  savings: number; // cuánto ahorrás vs precio día del partido
};

export function getTicketPrice(match: Match): PriceInfo {
  const now = new Date();
  const matchDate = new Date(match.date);
  const earlyBirdDeadline = new Date(match.earlyBirdDeadline);

  const isMatchDay =
    now.toDateString() === matchDate.toDateString();
  const isBeforeDeadline = now <= earlyBirdDeadline;
  const isEarlyBird = !isMatchDay && isBeforeDeadline;

  if (isEarlyBird) {
    return {
      price: match.earlyBirdPrice,
      isEarlyBird: true,
      label: `Precio anticipado — hasta el ${formatShortDate(earlyBirdDeadline)}`,
      savings: match.matchDayPrice - match.earlyBirdPrice,
    };
  }

  return {
    price: match.matchDayPrice,
    isEarlyBird: false,
    label: isMatchDay ? "Precio día del partido" : "Precio normal",
    savings: 0,
  };
}

export function isSaleOpen(match: Match): boolean {
  if (match.status !== "UPCOMING") return false;
  if (match.soldTickets >= match.totalCapacity) return false;
  const now = new Date();
  const matchDate = new Date(match.date);
  return now < matchDate;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(ticketId: string): string {
  return `FUT-${ticketId.slice(-8).toUpperCase()}`;
}
