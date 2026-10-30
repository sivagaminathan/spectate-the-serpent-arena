import type { GameState } from "@/lib/snake";

export function Board({ state, size = 20 }: { state: GameState; size?: number }) {
  return (
    <div
      className={`board ${state.mode === "walls" ? "board-walls" : "board-pass"}`}
      style={{
        gridTemplateColumns: `repeat(${state.width}, ${size}px)`,
        gridTemplateRows: `repeat(${state.height}, ${size}px)`,
      }}
    >
      {state.snake.map((p, i) => (
        <div
          key={i}
          className={i === 0 ? "cell-head" : "cell-snake"}
          style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }}
        />
      ))}
      {state.food.x >= 0 && (
        <div className="cell-food" style={{ gridColumn: state.food.x + 1, gridRow: state.food.y + 1 }} />
      )}
    </div>
  );
}
