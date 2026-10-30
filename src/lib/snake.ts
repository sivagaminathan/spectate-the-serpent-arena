export type Mode = "walls" | "pass-through";
export type Direction = "up" | "down" | "left" | "right";
export type Point = { x: number; y: number };

export interface GameState {
  width: number;
  height: number;
  mode: Mode;
  snake: Point[]; // head first
  direction: Direction;
  pendingDirection: Direction;
  food: Point;
  score: number;
  alive: boolean;
}

export type Rng = () => number;

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export function placeFood(snake: Point[], width: number, height: number, rng: Rng): Point {
  const free: Point[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  if (free.length === 0) return { x: -1, y: -1 };
  return free[Math.floor(rng() * free.length)]!;
}

export function createGame(
  mode: Mode,
  width = 20,
  height = 20,
  rng: Rng = Math.random,
): GameState {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const snake = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  return {
    width,
    height,
    mode,
    snake,
    direction: "right",
    pendingDirection: "right",
    food: placeFood(snake, width, height, rng),
    score: 0,
    alive: true,
  };
}

export function changeDirection(state: GameState, dir: Direction): GameState {
  if (!state.alive) return state;
  if (dir === OPPOSITE[state.direction]) return state;
  return { ...state, pendingDirection: dir };
}

/** Next head position, or null if it hits a wall in walls mode. */
export function nextHead(state: GameState, dir: Direction): Point | null {
  const head = state.snake[0]!;
  const v = VECTORS[dir];
  let x = head.x + v.x;
  let y = head.y + v.y;
  if (state.mode === "pass-through") {
    x = (x + state.width) % state.width;
    y = (y + state.height) % state.height;
  } else if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return null;
  }
  return { x, y };
}

export function step(state: GameState, rng: Rng = Math.random): GameState {
  if (!state.alive) return state;
  const direction = state.pendingDirection;
  const head = nextHead(state, direction);
  if (!head) return { ...state, direction, alive: false };

  const eats = samePoint(head, state.food);
  // Tail moves away this tick unless we grow, so it's not an obstacle.
  const body = eats ? state.snake : state.snake.slice(0, -1);
  if (body.some((p) => samePoint(p, head))) return { ...state, direction, alive: false };

  const snake = [head, ...body];
  return {
    ...state,
    direction,
    snake,
    food: eats ? placeFood(snake, state.width, state.height, rng) : state.food,
    score: eats ? state.score + 10 : state.score,
  };
}

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export function isSafe(state: GameState, dir: Direction): boolean {
  if (dir === OPPOSITE[state.direction]) return false;
  const head = nextHead(state, dir);
  if (!head) return false;
  const body = samePoint(head, state.food) ? state.snake : state.snake.slice(0, -1);
  return !body.some((p) => samePoint(p, head));
}

/** Simple bot: pick a safe direction that minimises distance to food. */
export function botDirection(state: GameState): Direction {
  const dist = (p: Point) => {
    let dx = Math.abs(p.x - state.food.x);
    let dy = Math.abs(p.y - state.food.y);
    if (state.mode === "pass-through") {
      dx = Math.min(dx, state.width - dx);
      dy = Math.min(dy, state.height - dy);
    }
    return dx + dy;
  };
  const safe = DIRECTIONS.filter((d) => isSafe(state, d));
  if (safe.length === 0) return state.direction;
  return safe.sort((a, b) => dist(nextHead(state, a)!) - dist(nextHead(state, b)!))[0]!;
}
