import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type LivePlayer } from "@/lib/api";
import { DIRECTIONS, botDirection, changeDirection, createGame, step, type GameState } from "@/lib/snake";
import { Board } from "@/components/Board";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Watch live — Snake" },
      { name: "description", content: "Follow other snake players live." },
      { property: "og:title", content: "Watch live — Snake" },
      { property: "og:description", content: "Follow other snake players live." },
    ],
  }),
  component: Watch,
});

function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function LiveGame({ player, size }: { player: LivePlayer; size: number }) {
  const [game, setGame] = useState<GameState>(() => createGame(player.mode, 20, 20, seeded(player.seed)));
  useEffect(() => {
    const rng = seeded(player.seed + 7);
    const t = setInterval(() => {
      setGame((g) => {
        if (!g.alive) return createGame(player.mode, 20, 20, rng);
        // Occasionally make a "human" mistake so games end eventually.
        const d = rng() < 0.03 ? DIRECTIONS[Math.floor(rng() * 4)]! : botDirection(g);
        return step(changeDirection(g, d), rng);
      });
    }, 120);
    return () => clearInterval(t);
  }, [player]);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span><span className="live-dot" /> @{player.username} <span className="text-muted-foreground">· {player.mode}</span></span>
        <span className="font-display text-primary">{game.score}</span>
      </div>
      <Board state={game} size={size} />
    </div>
  );
}

function Watch() {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { api.getLivePlayers().then(setPlayers); }, []);
  const current = players.find((p) => p.id === selected);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-primary glow">Watch live</h1>
      {current ? (
        <div className="flex flex-col items-center gap-4">
          <button className="btn-ghost self-start" onClick={() => setSelected(null)}>← All players</button>
          <LiveGame player={current} size={20} />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {players.length === 0 && <p className="text-muted-foreground">Loading players…</p>}
          {players.map((p) => (
            <button key={p.id} className="panel p-4 text-left transition hover:border-primary" onClick={() => setSelected(p.id)}>
              <LiveGame player={p} size={12} />
              <p className="mt-2 text-xs text-accent">Click to follow →</p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
