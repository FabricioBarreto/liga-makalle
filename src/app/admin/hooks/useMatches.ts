import { useCallback, useState } from "react";

export type MatchStatus = "UPCOMING" | "SOLD_OUT" | "FINISHED" | "CANCELLED";

export type Match = {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  round: string;
  isHome: boolean;
  status: MatchStatus;
  earlyBirdPrice: number;
  matchDayPrice: number;
  earlyBirdDeadline: string;
  totalCapacity: number;
  soldTickets: number;
};

export const emptyForm = {
  opponent: "",
  date: "",
  time: "17:00",
  venue: "Cancha del Club Social",
  round: "",
  isHome: true,
  earlyBirdPrice: "",
  matchDayPrice: "",
  earlyBirdDeadline: "",
  earlyBirdDeadlineTime: "23:59",
  totalCapacity: "300",
};

export type MatchForm = typeof emptyForm;

export function useMatches(secret: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/matches", {
        headers: { "x-admin-secret": secret },
      });
      if (!r.ok) throw new Error();
      setMatches(await r.json());
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const saveMatch = async (form: MatchForm, editId: string | null) => {
    const payload = {
      ...(editId && { id: editId }),
      opponent: form.opponent,
      date: `${form.date}T${form.time}:00`,
      venue: form.venue,
      round: form.round,
      isHome: form.isHome,
      earlyBirdPrice: Number(form.earlyBirdPrice),
      matchDayPrice: Number(form.matchDayPrice),
      earlyBirdDeadline: `${form.earlyBirdDeadline}T${form.earlyBirdDeadlineTime}:00`,
      totalCapacity: Number(form.totalCapacity),
    };
    const r = await fetch("/api/admin/matches", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error();
  };

  const changeStatus = async (id: string, status: MatchStatus) => {
    const r = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ id, status }),
    });
    if (!r.ok) throw new Error();
    await fetchMatches();
  };

  return { matches, loading, fetchMatches, saveMatch, changeStatus };
}
