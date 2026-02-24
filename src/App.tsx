import { useState, useEffect, useCallback } from "react";
import {
  generatePuzzle,
  validateBoard,
  checkWin,
  getHintCell,
  type Board,
  type Errors,
  type Puzzle,
  type Difficulty,
  type GridSize,
} from "./generator";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  Normal: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  Hard: "text-red-400 border-red-500/40 bg-red-500/10",
};

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({
  onStart,
}: {
  onStart: (size: GridSize, difficulty: Difficulty) => void;
}) {
  const [size, setSize] = useState<GridSize>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Skyscraper</h1>
        <p className="text-gray-400 mt-2 text-sm">
          A logic puzzle of city skylines
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Grid Size */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Grid Size
          </label>
          <div className="flex gap-3">
            {([4, 5] as GridSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all duration-150
                  ${
                    size === s
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Difficulty
          </label>
          <div className="flex gap-3">
            {(["Easy", "Normal", "Hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-150
                  ${
                    difficulty === d
                      ? DIFFICULTY_STYLES[d]
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(size, difficulty)}
          className="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-all duration-150 mt-2"
        >
          Generate Puzzle
        </button>
      </div>

      <div className="text-center text-gray-600 text-xs max-w-xs leading-relaxed">
        Easy — all clues shown &nbsp;·&nbsp; Normal — some clues hidden
        &nbsp;·&nbsp; Hard — many clues hidden
      </div>
    </div>
  );
}

// ─── Game Screen ──────────────────────────────────────────────────────────────

function GameScreen({
  puzzle,
  onNewPuzzle,
  onBack,
}: {
  puzzle: Puzzle;
  onNewPuzzle: () => void;
  onBack: () => void;
}) {
  const { size, solution, clues, fullClues } = puzzle;

  const [board, setBoard] = useState<Board>(() =>
    Array.from({ length: size }, () => Array(size).fill(0))
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Errors>(() =>
    Array.from({ length: size }, () => Array(size).fill(false))
  );
  const [hinted, setHinted] = useState<boolean[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill(false))
  );
  const [won, setWon] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (won) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setSelected((prev) => {
          if (!prev) return [0, 0];
          let [row, col] = prev;
          if (e.key === "ArrowUp") row = Math.max(0, row - 1);
          if (e.key === "ArrowDown") row = Math.min(size - 1, row + 1);
          if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
          if (e.key === "ArrowRight") col = Math.min(size - 1, col + 1);
          return [row, col];
        });
        return;
      }

      if (!selected) return;
      const [row, col] = selected;
      if (hinted[row][col]) return; // can't overwrite a hint cell

      const num = parseInt(e.key);
      if (num >= 1 && num <= size) {
        setBoard((prev) => {
          const newBoard = prev.map((r) => [...r]);
          newBoard[row][col] = num;
          setErrors(validateBoard(newBoard, clues, size));
          if (checkWin(newBoard, solution)) setWon(true);
          return newBoard;
        });
      }

      if (e.key === "Backspace" || e.key === "0") {
        setBoard((prev) => {
          const newBoard = prev.map((r) => [...r]);
          newBoard[row][col] = 0;
          setErrors(validateBoard(newBoard, clues, size));
          return newBoard;
        });
      }
    },
    [selected, won, hinted, clues, solution, size]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleHint = () => {
    if (won) return;
    const cell = getHintCell(board, solution, hinted, size);
    if (!cell) return;

    const [r, c] = cell;
    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      newBoard[r][c] = solution[r][c];
      setErrors(validateBoard(newBoard, clues, size));
      if (checkWin(newBoard, solution)) setWon(true);
      return newBoard;
    });
    setHinted((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = true;
      return next;
    });
    setHintCount((n) => n + 1);
  };

  const handleReset = () => {
    setBoard(Array.from({ length: size }, () => Array(size).fill(0)));
    setErrors(Array.from({ length: size }, () => Array(size).fill(false)));
    setHinted(Array.from({ length: size }, () => Array(size).fill(false)));
    setSelected(null);
    setWon(false);
    setHintCount(0);
  };

  const cellSize = size === 4 ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg";
  const clueSize = size === 4 ? "w-14 h-10" : "w-12 h-10";
  const clueLeft = size === 4 ? "w-10 h-14" : "w-10 h-12";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Skyscraper</h1>
        <p className="text-gray-400 mt-1 text-sm">
          {size}×{size} &nbsp;·&nbsp;
          <span className={DIFFICULTY_STYLES[puzzle.difficulty].split(" ")[0]}>
            {puzzle.difficulty}
          </span>
          {hintCount > 0 && (
            <span className="text-gray-500">
              {" "}
              &nbsp;·&nbsp; {hintCount} hint{hintCount > 1 ? "s" : ""} used
            </span>
          )}
        </p>
      </div>

      {/* Win Banner */}
      {won && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-6 py-3 rounded-xl font-semibold text-lg animate-pulse">
          🎉 Puzzle Solved!
        </div>
      )}

      {/* Puzzle Grid */}
      <div className="flex flex-col items-center gap-1">
        {/* Top Clues */}
        <div className="flex gap-1 ml-10">
          {clues.top.map((clue, i) => (
            <div
              key={i}
              className={`${clueSize} flex items-center justify-center font-bold text-lg
              ${clue !== null ? "text-sky-400" : "text-gray-700"}`}
            >
              {clue !== null ? clue : "?"}
            </div>
          ))}
        </div>

        <div className="flex gap-1 items-center">
          {/* Left Clues */}
          <div className="flex flex-col gap-1">
            {clues.left.map((clue, i) => (
              <div
                key={i}
                className={`${clueLeft} flex items-center justify-center font-bold text-lg
                ${clue !== null ? "text-sky-400" : "text-gray-700"}`}
              >
                {clue !== null ? clue : "?"}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {board.map((row, i) =>
              row.map((val, j) => {
                const isSelected = selected?.[0] === i && selected?.[1] === j;
                const isError = errors[i]?.[j];
                const isHinted = hinted[i]?.[j];
                const isRelated =
                  selected !== null && (selected[0] === i || selected[1] === j);

                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => !won && setSelected([i, j])}
                    className={`
                      ${cellSize} flex items-center justify-center rounded-lg cursor-pointer
                      font-bold border-2 transition-all duration-150 select-none
                      ${
                        won
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : isHinted
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
            {clues.right.map((clue, i) => (
              <div
                key={i}
                className={`${clueLeft} flex items-center justify-center font-bold text-lg
                ${clue !== null ? "text-sky-400" : "text-gray-700"}`}
              >
                {clue !== null ? clue : "?"}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Clues */}
        <div className="flex gap-1 ml-10">
          {clues.bottom.map((clue, i) => (
            <div
              key={i}
              className={`${clueSize} flex items-center justify-center font-bold text-lg
              ${clue !== null ? "text-sky-400" : "text-gray-700"}`}
            >
              {clue !== null ? clue : "?"}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleHint}
          disabled={won}
          className="px-5 py-2 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/50 border border-emerald-700 text-emerald-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          💡 Hint
        </button>
        <button
          onClick={onNewPuzzle}
          className="px-5 py-2 rounded-lg bg-sky-800/50 hover:bg-sky-700/50 border border-sky-700 text-sky-400 text-sm font-medium transition-colors"
        >
          New Puzzle
        </button>
      </div>

      <p className="text-gray-600 text-xs">
        Click a cell · Press 1–{size} to fill · Backspace to clear · Arrow keys
        to navigate
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [settings, setSettings] = useState<{
    size: GridSize;
    difficulty: Difficulty;
  } | null>(null);

  const handleStart = (size: GridSize, difficulty: Difficulty) => {
    setSettings({ size, difficulty });
    setPuzzle(generatePuzzle(size, difficulty));
  };

  const handleNewPuzzle = () => {
    if (settings) setPuzzle(generatePuzzle(settings.size, settings.difficulty));
  };

  const handleBack = () => {
    setPuzzle(null);
    setSettings(null);
  };

  if (!puzzle) return <SettingsScreen onStart={handleStart} />;

  return (
    <GameScreen
      key={puzzle.solution.flat().join("-")}
      puzzle={puzzle}
      onNewPuzzle={handleNewPuzzle}
      onBack={handleBack}
    />
  );
}
