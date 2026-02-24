import { useState, useEffect, useCallback } from "react";
import {
  PUZZLE,
  validateBoard,
  checkWin,
  type Board,
  type Errors,
} from "./puzzle";

const SIZE = PUZZLE.size;

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export default function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Errors>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
  );
  const [won, setWon] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Arrow key navigation
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setSelected((prev) => {
          if (!prev) return [0, 0];
          let [row, col] = prev;
          if (e.key === "ArrowUp") row = Math.max(0, row - 1);
          if (e.key === "ArrowDown") row = Math.min(SIZE - 1, row + 1);
          if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
          if (e.key === "ArrowRight") col = Math.min(SIZE - 1, col + 1);
          return [row, col];
        });
        return;
      }

      if (!selected) return;
      const [row, col] = selected;
      const num = parseInt(e.key);

      if (num >= 1 && num <= SIZE) {
        setBoard((prev) => {
          const newBoard = prev.map((r) => [...r]);
          newBoard[row][col] = num;
          const newErrors = validateBoard(newBoard, PUZZLE.clues, SIZE);
          setErrors(newErrors);
          if (checkWin(newBoard, PUZZLE.solution)) setWon(true);
          return newBoard;
        });
      }

      if (e.key === "Backspace" || e.key === "0") {
        setBoard((prev) => {
          const newBoard = prev.map((r) => [...r]);
          newBoard[row][col] = 0;
          setErrors(validateBoard(newBoard, PUZZLE.clues, SIZE));
          return newBoard;
        });
      }
    },
    [selected]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setErrors(Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
    setSelected(null);
    setWon(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Skyscraper
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Fill the grid so each row & column has 1–4. Match the clues.
        </p>
      </div>

      {won && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-6 py-3 rounded-xl font-semibold text-lg animate-pulse">
          🎉 Puzzle Solved!
        </div>
      )}

      {/* Puzzle Grid with Clues */}
      <div className="flex flex-col items-center gap-1">
        {/* Top Clues */}
        <div className="flex gap-1 ml-10">
          {PUZZLE.clues.top.map((clue, i) => (
            <div
              key={i}
              className="w-14 h-10 flex items-center justify-center text-sky-400 font-bold text-lg"
            >
              {clue}
            </div>
          ))}
        </div>

        <div className="flex gap-1 items-center">
          {/* Left Clues */}
          <div className="flex flex-col gap-1">
            {PUZZLE.clues.left.map((clue, i) => (
              <div
                key={i}
                className="w-10 h-14 flex items-center justify-center text-sky-400 font-bold text-lg"
              >
                {clue}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 3.5rem)` }}
          >
            {board.map((row, i) =>
              row.map((val, j) => {
                const isSelected = selected?.[0] === i && selected?.[1] === j;
                const isError = errors[i][j];
                const isRelated =
                  selected !== null && (selected[0] === i || selected[1] === j);
                const isCorrect = won;

                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => setSelected([i, j])}
                    className={`
      w-14 h-14 flex items-center justify-center rounded-lg cursor-pointer
      text-xl font-bold border-2 transition-all duration-150 select-none
      ${
        isCorrect
          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
          : isError
          ? "bg-red-500/20 border-red-500 text-red-400"
          : isSelected
          ? "bg-sky-500/30 border-sky-400 text-white"
          : isRelated
          ? "bg-gray-700/60 border-gray-600 text-gray-200"
          : "bg-gray-800 border-gray-700 text-gray-100 hover:border-gray-500"
      }
    `}
                  >
                    {val !== 0 ? val : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Clues */}
          <div className="flex flex-col gap-1">
            {PUZZLE.clues.right.map((clue, i) => (
              <div
                key={i}
                className="w-10 h-14 flex items-center justify-center text-sky-400 font-bold text-lg"
              >
                {clue}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Clues */}
        <div className="flex gap-1 ml-10">
          {PUZZLE.clues.bottom.map((clue, i) => (
            <div
              key={i}
              className="w-14 h-10 flex items-center justify-center text-sky-400 font-bold text-lg"
            >
              {clue}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-gray-600 text-xs">
        Click a cell, then press 1–4 to fill. Backspace to clear.
      </p>
    </div>
  );
}
