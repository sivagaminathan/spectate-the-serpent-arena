import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { changeDirection, createGame, step, type Direction, type Mode } from "@/lib/snake";
import { Board } from "@/components/Board";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Snake — Play walls or pass-through" },
      { name: "description", content: "Classic snake with walls and pass-through modes, leaderboard and live spectating." },
      { property: "og:title", content: "Snake — Play walls or pass-through" },
      { property: "og:description", content: "Classic snake with walls and pass-through modes." },
    ],
  }),
  component: Play,
});

const KEYS: Record<string, Direction> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};

function Play() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("walls");
  const [game, setGame] = useState(() => createGame("walls"));
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("");
  const submitted = useRef(false);

  const restart = useCallback((m: Mode) => {
    setGame(createGame(m));
    setRunning(true);
    setMsg("");
    submitted.current = false;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key];
      if (d) { e.preventDefault(); setGame((g) => changeDirection(g, d)); }
      if (e.key === " ") { e.preventDefault(); setRunning((r) => !r); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!running || !game.alive) return;
    const t = setInterval(() => setGame((g) => step(g)), 110);
    return () => clearInterval(t);
  }, [running, game.alive]);

  useEffect(() => {
    if (game.alive || submitted.current) return;
    submitted.current = true;
    setRunning(false);
    if (user && game.score > 0)
      api.submitScore(game.score, game.mode).then(() => setMsg("Score saved to leaderboard!"));
    else if (!user) setMsg("Log in to save your score.");
  }, [game.alive, game.score, game.mode, user]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-10">
      <div className="flex gap-2">
        {(["walls", "pass-through"] as Mode[]).map((m) => (
          <button key={m} className={mode === m ? "chip chip-active" : "chip"}
            onClick={() => { setMode(m); setGame(createGame(m)); setRunning(false); setMsg(""); }}>
            {m}
          </button>
        ))}
      </div>
      <div className="flex w-full max-w-[400px] justify-between font-display text-sm">
        <span>SCORE <span className="text-primary">{game.score}</span></span>
        <span className="text-muted-foreground">{user ? `@${user.username}` : "guest"}</span>
      </div>
      <div className="relative">
        <Board state={game} />
        {(!running || !game.alive) && (
          <div className="overlay">
            <p className="font-display text-2xl text-primary glow">
              {!game.alive ? "GAME OVER" : "READY?"}
            </p>
            {msg && <p className="text-sm text-accent">{msg} {!user && <Link to="/login" className="underline">Log in</Link>}</p>}
            <button className="btn-primary" onClick={() => (game.alive ? setRunning(true) : restart(mode))}>
              {!game.alive ? "Play again" : "Start"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Arrows / WASD to move · Space to pause</p>
    </main>
  );
}
