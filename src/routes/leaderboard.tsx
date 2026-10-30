import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type ScoreEntry } from "@/lib/api";
import type { Mode } from "@/lib/snake";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Snake" },
      { name: "description", content: "Top snake scores in walls and pass-through modes." },
      { property: "og:title", content: "Leaderboard — Snake" },
      { property: "og:description", content: "Top snake scores." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const [mode, setMode] = useState<Mode | undefined>();
  const [rows, setRows] = useState<ScoreEntry[] | null>(null);
  useEffect(() => { setRows(null); api.getLeaderboard(mode).then(setRows); }, [mode]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-primary glow">Leaderboard</h1>
      <div className="mb-4 flex gap-2">
        {([undefined, "walls", "pass-through"] as (Mode | undefined)[]).map((m) => (
          <button key={m ?? "all"} className={mode === m ? "chip chip-active" : "chip"} onClick={() => setMode(m)}>
            {m ?? "all"}
          </button>
        ))}
      </div>
      <div className="panel">
        {!rows ? <p className="p-4 text-muted-foreground">Loading…</p> : (
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground"><tr><th className="p-3">#</th><th>Player</th><th>Mode</th><th className="pr-3 text-right">Score</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3 font-display text-primary">{i + 1}</td>
                  <td>{r.username}</td>
                  <td className="text-muted-foreground">{r.mode}</td>
                  <td className="pr-3 text-right font-display">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
