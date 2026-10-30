import { describe, expect, it } from "vitest";
import { botDirection, changeDirection, createGame, isSafe, placeFood, step, type GameState } from "@/lib/snake";

const fixed = () => 0;
const game = (over: Partial<GameState> = {}): GameState => ({ ...createGame("walls", 10, 10, fixed), ...over });

describe("snake logic", () => {
  it("starts alive with length 3 moving right", () => {
    const g = createGame("walls", 10, 10, fixed);
    expect(g.snake).toHaveLength(3);
    expect(g.direction).toBe("right");
    expect(g.alive).toBe(true);
  });

  it("moves one cell per step", () => {
    const g = step(game({ food: { x: 0, y: 0 } }));
    expect(g.snake[0]).toEqual({ x: 6, y: 5 });
    expect(g.snake).toHaveLength(3);
  });

  it("ignores reversing direction", () => {
    expect(changeDirection(game(), "left").pendingDirection).toBe("right");
    expect(changeDirection(game(), "up").pendingDirection).toBe("up");
  });

  it("grows and scores 10 when eating", () => {
    const g = step(game({ food: { x: 6, y: 5 } }), fixed);
    expect(g.snake).toHaveLength(4);
    expect(g.score).toBe(10);
    expect(g.snake.some((p) => p.x === g.food.x && p.y === g.food.y)).toBe(false);
  });

  it("dies on wall in walls mode", () => {
    const g = step(game({ snake: [{ x: 9, y: 0 }, { x: 8, y: 0 }], food: { x: 0, y: 5 } }));
    expect(g.alive).toBe(false);
  });

  it("wraps around in pass-through mode", () => {
    const g = step(game({ mode: "pass-through", snake: [{ x: 9, y: 0 }, { x: 8, y: 0 }], food: { x: 0, y: 5 } }));
    expect(g.alive).toBe(true);
    expect(g.snake[0]).toEqual({ x: 0, y: 0 });
  });

  it("dies when hitting itself", () => {
    const snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
    const g = step(game({ snake, direction: "up", pendingDirection: "down", food: { x: 0, y: 0 } }));
    expect(g.alive).toBe(false);
  });

  it("can move into the cell the tail is leaving", () => {
    const snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
    const g = step(game({ snake, direction: "left", pendingDirection: "down", food: { x: 0, y: 0 } }));
    expect(g.alive).toBe(true);
  });

  it("does nothing once dead", () => {
    const dead = game({ alive: false });
    expect(step(dead)).toBe(dead);
    expect(changeDirection(dead, "up")).toBe(dead);
  });

  it("places food only on free cells", () => {
    const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    expect(placeFood(snake, 2, 2, fixed)).toEqual({ x: 0, y: 1 });
    expect(placeFood([{ x: 0, y: 0 }], 1, 1, fixed)).toEqual({ x: -1, y: -1 });
  });

  it("bot heads toward food and avoids walls", () => {
    expect(botDirection(game({ food: { x: 5, y: 0 } }))).toBe("up");
    const g = game({ snake: [{ x: 9, y: 5 }, { x: 8, y: 5 }], food: { x: 9, y: 9 } });
    expect(isSafe(g, "right")).toBe(false);
    expect(botDirection(g)).toBe("down");
  });

  it("bot survives many steps", () => {
    let g = createGame("pass-through", 15, 15, fixed);
    for (let i = 0; i < 200 && g.alive; i++) g = step(changeDirection(g, botDirection(g)), Math.random);
    expect(g.score).toBeGreaterThan(0);
  });
});
