/**
 * Single entry point for every backend call. Currently mocked in memory;
 * swap the implementations for real HTTP calls later without touching the UI.
 */
import type { Mode } from "./snake";

export interface User {
  username: string;
}
export interface ScoreEntry {
  username: string;
  score: number;
  mode: Mode;
  date: string;
}
export interface LivePlayer {
  id: string;
  username: string;
  mode: Mode;
  seed: number;
}

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const SEED_SCORES: ScoreEntry[] = [
  { username: "viper", score: 420, mode: "walls", date: "2026-10-20" },
  { username: "nokia3310", score: 380, mode: "pass-through", date: "2026-10-22" },
  { username: "pixelfang", score: 310, mode: "walls", date: "2026-10-25" },
  { username: "boa", score: 260, mode: "pass-through", date: "2026-10-26" },
  { username: "slytherin", score: 190, mode: "walls", date: "2026-10-27" },
];

export function createMockBackend(latency = 150) {
  const users = new Map<string, string>([
    ["viper", "password"],
    ["demo", "demo123"],
  ]);
  let scores: ScoreEntry[] = [...SEED_SCORES];
  let current: User | null = null;
  const wait = () => delay(latency);

  return {
    async signup(username: string, password: string): Promise<User> {
      await wait();
      const u = username.trim();
      if (u.length < 3) throw new Error("Username must be at least 3 characters");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      if (users.has(u)) throw new Error("Username already taken");
      users.set(u, password);
      current = { username: u };
      return current;
    },
    async login(username: string, password: string): Promise<User> {
      await wait();
      if (users.get(username.trim()) !== password) throw new Error("Invalid username or password");
      current = { username: username.trim() };
      return current;
    },
    async logout(): Promise<void> {
      await wait();
      current = null;
    },
    async getCurrentUser(): Promise<User | null> {
      await wait();
      return current;
    },
    async getLeaderboard(mode?: Mode): Promise<ScoreEntry[]> {
      await wait();
      return scores
        .filter((s) => !mode || s.mode === mode)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },
    async submitScore(score: number, mode: Mode): Promise<ScoreEntry> {
      await wait();
      if (!current) throw new Error("You must be logged in to submit a score");
      const entry: ScoreEntry = {
        username: current.username,
        score,
        mode,
        date: new Date().toISOString().slice(0, 10),
      };
      scores = [...scores, entry];
      return entry;
    },
    async getLivePlayers(): Promise<LivePlayer[]> {
      await wait();
      return [
        { id: "p1", username: "viper", mode: "walls", seed: 1 },
        { id: "p2", username: "nokia3310", mode: "pass-through", seed: 2 },
        { id: "p3", username: "pixelfang", mode: "walls", seed: 3 },
      ];
    },
  };
}

export type Api = ReturnType<typeof createMockBackend>;
export const api: Api = createMockBackend();
