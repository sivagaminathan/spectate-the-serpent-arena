import { beforeEach, describe, expect, it } from "vitest";
import { createMockBackend, type Api } from "@/lib/api";

let api: Api;
beforeEach(() => { api = createMockBackend(0); });

describe("mock backend", () => {
  it("logs in with valid credentials and exposes the user", async () => {
    expect(await api.getCurrentUser()).toBeNull();
    await api.login("demo", "demo123");
    expect(await api.getCurrentUser()).toEqual({ username: "demo" });
  });

  it("rejects wrong password", async () => {
    await expect(api.login("demo", "nope")).rejects.toThrow("Invalid");
  });

  it("signs up new users and validates input", async () => {
    await expect(api.signup("ab", "123456")).rejects.toThrow("3 characters");
    await expect(api.signup("newbie", "123")).rejects.toThrow("6 characters");
    await expect(api.signup("demo", "123456")).rejects.toThrow("taken");
    expect(await api.signup("newbie", "123456")).toEqual({ username: "newbie" });
    await api.logout();
    await api.login("newbie", "123456");
    expect((await api.getCurrentUser())?.username).toBe("newbie");
  });

  it("logs out", async () => {
    await api.login("demo", "demo123");
    await api.logout();
    expect(await api.getCurrentUser()).toBeNull();
  });

  it("leaderboard is sorted and filterable by mode", async () => {
    const all = await api.getLeaderboard();
    expect(all.map((s) => s.score)).toEqual([...all.map((s) => s.score)].sort((a, b) => b - a));
    const walls = await api.getLeaderboard("walls");
    expect(walls.every((s) => s.mode === "walls")).toBe(true);
  });

  it("submitting a score requires login and appears on the leaderboard", async () => {
    await expect(api.submitScore(999, "walls")).rejects.toThrow("logged in");
    await api.login("demo", "demo123");
    await api.submitScore(999, "walls");
    expect((await api.getLeaderboard())[0]).toMatchObject({ username: "demo", score: 999 });
  });

  it("lists live players", async () => {
    const players = await api.getLivePlayers();
    expect(players.length).toBeGreaterThan(0);
  });
});
