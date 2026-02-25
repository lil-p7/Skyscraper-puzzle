import { useState, useEffect, useCallback, useRef } from "react";
import {
  generatePuzzle,
  validateBoard,
  checkWin,
  getHintCell,
  loadScores,
  saveScore,
  getScoreKey,
  formatTime,
  HINT_THRESHOLDS,
  type Board,
  type Errors,
  type Puzzle,
  type Difficulty,
  type GridSize,
  type ScoreEntry,
} from "./generator";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  Normal: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  Hard: "text-red-400 border-red-500/40 bg-red-500/10",
};

const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  Easy: "text-emerald-400",
  Normal: "text-yellow-400",
  Hard: "text-red-400",
};

// ─── Best Scores Screen ───────────────────────────────────────────────────────

function BestScoresScreen({ onBack }: { onBack: () => void }) {
  const sizes: GridSize[] = [4, 5];
  const difficulties: Difficulty[] = ["Easy", "Normal", "Hard"];
  const [, forceUpdate] = useState(0);

  const handleClear = (key: string) => {
    localStorage.removeItem(`skyscraper-scores-${key}`);
    forceUpdate((n) => n + 1);
  };

  const handleClearAll = () => {
    sizes.forEach((size) =>
      difficulties.forEach((diff) =>
        localStorage.removeItem(`skyscraper-scores-${getScoreKey(size, diff)}`)
      )
    );
    forceUpdate((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Best Scores</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Top 5 fastest times per category
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-lg">
        {sizes.map((size) =>
          difficulties.map((diff) => {
            const key = getScoreKey(size, diff);
            const scores = loadScores(key);

            return (
              <div
                key={key}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">
                      {size}×{size}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_STYLES[diff]}`}
                    >
                      {diff}
                    </span>
                  </div>
                  {scores.length > 0 && (
                    <button
                      onClick={() => handleClear(key)}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {scores.length === 0 ? (
                  <p className="text-gray-600 text-sm">No scores yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {scores.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold w-5 ${
                              i === 0 ? "text-yellow-400" : "text-gray-500"
                            }`}
                          >
                            {i === 0 ? "🥇" : `#${i + 1}`}
                          </span>
                          <span className="font-mono font-bold text-white">
                            {formatTime(s.time)}
                          </span>
                        </div>
                        <div className="flex gap-3 text-gray-400 text-xs">
                          <span>💡 {s.hints}</span>
                          <span>❌ {s.mistakes}</span>
                          <span>{new Date(s.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClearAll}
          className="px-5 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/50 border border-red-800 text-red-400 text-sm font-medium transition-colors"
        >
          🗑️ Clear All Scores
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 font-medium transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
// ─── Win Modal ────────────────────────────────────────────────────────────────

function WinModal({
  time,
  hints,
  mistakes,
  difficulty,
  size,
  rank,
  qualified,
  onNewPuzzle,
  onBack,
}: {
  time: number;
  hints: number;
  mistakes: number;
  difficulty: Difficulty;
  size: GridSize;
  rank: number;
  qualified: boolean;
  onNewPuzzle: () => void;
  onBack: () => void;
}) {
  const threshold = HINT_THRESHOLDS[difficulty];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white">Puzzle Solved!</h2>
          <p className="text-gray-400 text-sm mt-1">
            {size}×{size} ·{" "}
            <span className={DIFFICULTY_TEXT[difficulty]}>{difficulty}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { label: "Time", value: formatTime(time), icon: "⏱️" },
            { label: "Hints", value: `${hints}/${threshold}`, icon: "💡" },
            { label: "Mistakes", value: mistakes.toString(), icon: "❌" },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-gray-800 rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <span className="text-lg">{icon}</span>
              <span className="text-white font-bold text-lg">{value}</span>
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Score qualification */}
        {qualified ? (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-semibold text-sm">
              🏆 Ranked #{rank} on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-sm">
              Score not saved — used more than {threshold} hint
              {threshold > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
          >
            ← Menu
          </button>
          <button
            onClick={onNewPuzzle}
            className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-colors"
          >
            New Puzzle
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({
  onStart,
  onViewScores,
}: {
  onStart: (size: GridSize, difficulty: Difficulty) => void;
  onViewScores: () => void;
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

        {/* Buttons */}
        <button
          onClick={() => onStart(size, difficulty)}
          className="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-all duration-150 mt-2"
        >
          Generate Puzzle
        </button>

        <button
          onClick={onViewScores}
          className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
        >
          🏆 Best Scores
        </button>
      </div>

      <div className="text-center text-gray-600 text-xs max-w-xs leading-relaxed">
        Easy — all clues · Normal — some hidden · Hard — many hidden
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
  const { size, solution, clues, difficulty } = puzzle;

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
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [winData, setWinData] = useState<{
    rank: number;
    qualified: boolean;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef<Board>(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Timer
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, won]);

  const handleCellClick = (i: number, j: number) => {
    if (won) return;
    if (!started) setStarted(true);
    setSelected([i, j]);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (won) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (!started) setStarted(true);
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
      if (hinted[row][col]) return;

      const num = parseInt(e.key);

      if (num >= 1 && num <= size) {
        if (!started) setStarted(true);

        const newBoard = boardRef.current.map((r) => [...r]);
        newBoard[row][col] = num;
        const newErrors = validateBoard(newBoard, clues, size);

        const prevErrorCount = errors.flat().filter(Boolean).length;
        const newErrorCount = newErrors.flat().filter(Boolean).length;
        const newMistakes =
          newErrorCount > prevErrorCount ? mistakes + 1 : mistakes;
        if (newErrorCount > prevErrorCount) setMistakes(newMistakes);

        setBoard(newBoard);
        setErrors(newErrors);

        if (checkWin(newBoard, solution)) {
          const qualified = hintCount <= HINT_THRESHOLDS[difficulty];
          let rank = -1;
          if (qualified) {
            const entry: ScoreEntry = {
              time,
              hints: hintCount,
              mistakes: newMistakes,
              date: new Date().toISOString(),
            };
            const result = saveScore(getScoreKey(size, difficulty), entry);
            rank = result.rank;
          }
          setWinData({ rank, qualified });
          setWon(true);
        }
      }

      if (e.key === "Backspace" || e.key === "0") {
        const newBoard = boardRef.current.map((r) => [...r]);
        newBoard[row][col] = 0;
        setBoard(newBoard);
        setErrors(validateBoard(newBoard, clues, size));
      }
    },
    [
      selected,
      won,
      hinted,
      clues,
      solution,
      size,
      started,
      time,
      hintCount,
      mistakes,
      difficulty,
      errors,
    ]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleHint = () => {
    if (won) return;
    if (!started) setStarted(true);
    const cell = getHintCell(board, solution, hinted, size);
    if (!cell) return;

    const [r, c] = cell;
    const newHintCount = hintCount + 1;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];
    const newErrors = validateBoard(newBoard, clues, size);

    setBoard(newBoard);
    setErrors(newErrors);
    setHinted((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = true;
      return next;
    });
    setHintCount(newHintCount);

    if (checkWin(newBoard, solution)) {
      const qualified = newHintCount <= HINT_THRESHOLDS[difficulty];
      let rank = -1;
      if (qualified) {
        const entry: ScoreEntry = {
          time,
          hints: newHintCount,
          mistakes,
          date: new Date().toISOString(),
        };
        const result = saveScore(getScoreKey(size, difficulty), entry);
        rank = result.rank;
      }
      setWinData({ rank, qualified });
      setWon(true);
    }
  };
  const handleReset = () => {
    setBoard(Array.from({ length: size }, () => Array(size).fill(0)));
    setErrors(Array.from({ length: size }, () => Array(size).fill(false)));
    setHinted(Array.from({ length: size }, () => Array(size).fill(false)));
    setSelected(null);
    setWon(false);
    setWinData(null);
    // intentionally NOT resetting hintCount, mistakes, time, started
    // those accumulate across resets for the same puzzle
  };
  const cellSize = size === 4 ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg";
  const clueSize = size === 4 ? "w-14 h-10" : "w-12 h-10";
  const clueLeft = size === 4 ? "w-10 h-14" : "w-10 h-12";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 p-6">
      {/* Win Modal */}
      {won && winData && (
        <WinModal
          time={time}
          hints={hintCount}
          mistakes={mistakes}
          difficulty={difficulty}
          size={size}
          rank={winData.rank}
          qualified={winData.qualified}
          onNewPuzzle={onNewPuzzle}
          onBack={onBack}
        />
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Skyscraper</h1>
        <div className="flex items-center justify-center gap-3 mt-1 text-sm">
          <span className="text-gray-400">
            {size}×{size}
          </span>
          <span className="text-gray-600">·</span>
          <span className={DIFFICULTY_TEXT[difficulty]}>{difficulty}</span>
          <span className="text-gray-600">·</span>
          <span className="font-mono text-white font-bold">
            {formatTime(time)}
          </span>
          {hintCount > 0 && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">💡 {hintCount}</span>
            </>
          )}
          {mistakes > 0 && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">❌ {mistakes}</span>
            </>
          )}
        </div>
      </div>

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

                // build cell style
                const cellStyle = won
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : isHinted
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : isSelected && isError
                  ? "bg-red-500/30 border-sky-400 text-red-300 ring-2 ring-sky-400"
                  : isError
                  ? "bg-red-500/20 border-red-500 text-red-400"
                  : isSelected
                  ? "bg-sky-500/30 border-sky-400 text-white"
                  : isRelated
                  ? "bg-gray-700/60 border-gray-600 text-gray-200"
                  : "bg-gray-800 border-gray-700 text-gray-100 hover:border-gray-500";

                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`
      ${cellSize} flex items-center justify-center rounded-lg cursor-pointer
      font-bold border-2 transition-all duration-150 select-none ${cellStyle}
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

type Screen = "settings" | "game" | "scores";

export default function App() {
  const [screen, setScreen] = useState<Screen>("settings");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [settings, setSettings] = useState<{
    size: GridSize;
    difficulty: Difficulty;
  } | null>(null);

  const handleStart = (size: GridSize, difficulty: Difficulty) => {
    setSettings({ size, difficulty });
    setPuzzle(generatePuzzle(size, difficulty));
    setScreen("game");
  };

  const handleNewPuzzle = () => {
    if (settings) {
      setPuzzle(generatePuzzle(settings.size, settings.difficulty));
    }
  };

  const handleBack = () => {
    setScreen("settings");
    setPuzzle(null);
  };

  if (screen === "scores")
    return <BestScoresScreen onBack={() => setScreen("settings")} />;
  if (screen === "game" && puzzle) {
    return (
      <GameScreen
        key={puzzle.solution.flat().join("-")}
        puzzle={puzzle}
        onNewPuzzle={handleNewPuzzle}
        onBack={handleBack}
      />
    );
  }

  return (
    <SettingsScreen
      onStart={handleStart}
      onViewScores={() => setScreen("scores")}
    />
  );
}
