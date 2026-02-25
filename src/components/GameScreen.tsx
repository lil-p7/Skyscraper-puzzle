import { useState, useEffect, useCallback, useRef } from "react";
import {
  validateBoard, checkWin, getHintCell,
  saveScore, getScoreKey, HINT_THRESHOLDS,
  type Board, type Errors, type Puzzle, type ScoreEntry,
} from "../generator";
import {
  playPlace, playError, playHint,
  playClear, playNav, playWin,
} from "../sounds";
import WinModal  from "./WinModal";
import NumberPad from "./NumberPad";

const DIFFICULTY_TEXT = {
  Easy:   "text-emerald-400",
  Normal: "text-yellow-400",
  Hard:   "text-red-400",
};

export default function GameScreen({
  puzzle,
  onNewPuzzle,
  onBack,
}: {
  puzzle:      Puzzle;
  onNewPuzzle: () => void;
  onBack:      () => void;
}) {
  const { size, solution, clues, difficulty } = puzzle;

  const [board,     setBoard]     = useState<Board>(() => Array.from({ length: size }, () => Array(size).fill(0)));
  const [selected,  setSelected]  = useState<[number, number] | null>(null);
  const [errors,    setErrors]    = useState<Errors>(() => Array.from({ length: size }, () => Array(size).fill(false)));
  const [hinted,    setHinted]    = useState<boolean[][]>(() => Array.from({ length: size }, () => Array(size).fill(false)));
  const [won,       setWon]       = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [mistakes,  setMistakes]  = useState(0);
  const [time,      setTime]      = useState(0);
  const [started,   setStarted]   = useState(false);
  const [winData,   setWinData]   = useState<{ rank: number; qualified: boolean } | null>(null);
  const [animating, setAnimating] = useState<Record<string, "pop" | "shake" | "hint" | "win">>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef<Board>(board);
  useEffect(() => { boardRef.current = board; }, [board]);

  const triggerAnim = useCallback((
    cells: [number, number][],
    type: "pop" | "shake" | "hint" | "win",
    delay = 0
  ) => {
    cells.forEach(([r, c], i) => {
      setTimeout(() => {
        const key = `${r}-${c}`;
        setAnimating(prev => ({ ...prev, [key]: type }));
        setTimeout(() => {
          setAnimating(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }, 400);
      }, delay * i);
    });
  }, []);

  // Timer
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, won]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCellClick = (i: number, j: number) => {
    if (won) return;
    if (!started) setStarted(true);
    playNav();
    setSelected([i, j]);
  };

  const handleWin = useCallback((_newBoard: Board, newMistakes: number, newHintCount: number) => {
    const allCells: [number, number][] = [];
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size; j++)
        allCells.push([i, j]);
    allCells.sort(([r1, c1], [r2, c2]) => (r1 + c1) - (r2 + c2));
    triggerAnim(allCells, "win", 60);
    playWin();

    const qualified = newHintCount <= HINT_THRESHOLDS[difficulty];
    let rank = -1;
    if (qualified) {
      const entry: ScoreEntry = {
        time,
        hints:    newHintCount,
        mistakes: newMistakes,
        date:     new Date().toISOString(),
      };
      const result = saveScore(getScoreKey(size, difficulty), entry);
      rank = result.rank;
    }
    setTimeout(() => {
      setWinData({ rank, qualified });
      setWon(true);
    }, allCells.length * 60 + 200);
  }, [size, difficulty, time, triggerAnim]);

  const handleInput = useCallback((key: string) => {
    if (won) return;
    if (!started) setStarted(true);
    if (!selected) return;

    const [row, col] = selected;
    if (hinted[row][col]) return;

    const num = parseInt(key);

    if (num >= 1 && num <= size) {
      const newBoard  = boardRef.current.map(r => [...r]);
      newBoard[row][col] = num;
      const newErrors = validateBoard(newBoard, clues, size);

      const prevErrorCount = errors.flat().filter(Boolean).length;
      const newErrorCount  = newErrors.flat().filter(Boolean).length;
      const newMistakes    = newErrorCount > prevErrorCount ? mistakes + 1 : mistakes;
      if (newErrorCount > prevErrorCount) setMistakes(newMistakes);

      if (newErrorCount > prevErrorCount) {
        const errorCells: [number, number][] = [];
        newErrors.forEach((row, i) =>
          row.forEach((e, j) => { if (e) errorCells.push([i, j]); })
        );
        triggerAnim(errorCells, "shake");
        playError();
      } else {
        triggerAnim([[row, col]], "pop");
        playPlace();
      }

      setBoard(newBoard);
      setErrors(newErrors);

      if (checkWin(newBoard, solution)) {
        handleWin(newBoard, newMistakes, hintCount);
      }
    }

    if (key === "Backspace") {
      const newBoard     = boardRef.current.map(r => [...r]);
      newBoard[row][col] = 0;
      setBoard(newBoard);
      setErrors(validateBoard(newBoard, clues, size));
      playClear();
    }
  }, [selected, won, hinted, clues, solution, size, started, hintCount, mistakes, errors, triggerAnim, handleWin]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (won) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      if (!started) setStarted(true);
      playNav();
      setSelected(prev => {
        if (!prev) return [0, 0];
        let [row, col] = prev;
        if (e.key === "ArrowUp")    row = Math.max(0, row - 1);
        if (e.key === "ArrowDown")  row = Math.min(size - 1, row + 1);
        if (e.key === "ArrowLeft")  col = Math.max(0, col - 1);
        if (e.key === "ArrowRight") col = Math.min(size - 1, col + 1);
        return [row, col];
      });
      return;
    }

    handleInput(e.key);
  }, [won, started, size, handleInput]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleHint = () => {
    if (won) return;
    if (!started) setStarted(true);
    const cell = getHintCell(board, solution, hinted, size);
    if (!cell) return;

    const [r, c]       = cell;
    const newHintCount = hintCount + 1;
    const newBoard     = board.map(row => [...row]);
    newBoard[r][c]     = solution[r][c];
    const newErrors    = validateBoard(newBoard, clues, size);

    setBoard(newBoard);
    setErrors(newErrors);
    setHinted(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = true;
      return next;
    });
    setHintCount(newHintCount);
    triggerAnim([[r, c]], "hint");
    playHint();

    if (checkWin(newBoard, solution)) {
      handleWin(newBoard, mistakes, newHintCount);
    }
  };

  const handleReset = () => {
    setBoard(Array.from({ length: size }, () => Array(size).fill(0)));
    setErrors(Array.from({ length: size }, () => Array(size).fill(false)));
    setHinted(Array.from({ length: size }, () => Array(size).fill(false)));
    setSelected(null);
    setWon(false);
    setWinData(null);
  };

  const cellSize = size === 4 ? "w-14 h-14 text-xl" : size === 5 ? "w-12 h-12 text-lg" : "w-10 h-10 text-base";
  const clueSize = size === 4 ? "w-14 h-10"         : size === 5 ? "w-12 h-10"         : "w-10 h-8";
  const clueLeft = size === 4 ? "w-10 h-14"         : size === 5 ? "w-10 h-12"         : "w-8 h-10";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 p-6">

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
          <span className="text-gray-400">{size}×{size}</span>
          <span className="text-gray-600">·</span>
          <span className={DIFFICULTY_TEXT[difficulty]}>{difficulty}</span>
          <span className="text-gray-600">·</span>
          <span className="font-mono text-white font-bold">{formatTime(time)}</span>
          {hintCount > 0 && <><span className="text-gray-600">·</span><span className="text-gray-400">💡 {hintCount}</span></>}
          {mistakes  > 0 && <><span className="text-gray-600">·</span><span className="text-gray-400">❌ {mistakes}</span></>}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col items-center gap-1">
        {/* Top clues */}
        <div className="flex gap-1 ml-10">
          {clues.top.map((clue, i) => (
            <div key={i} className={`${clueSize} flex items-center justify-center font-bold text-lg ${clue !== null ? "text-sky-400" : "text-gray-700"}`}>
              {clue !== null ? clue : "?"}
            </div>
          ))}
        </div>

        <div className="flex gap-1 items-center">
          {/* Left clues */}
          <div className="flex flex-col gap-1">
            {clues.left.map((clue, i) => (
              <div key={i} className={`${clueLeft} flex items-center justify-center font-bold text-lg ${clue !== null ? "text-sky-400" : "text-gray-700"}`}>
                {clue !== null ? clue : "?"}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {board.map((row, i) =>
              row.map((val, j) => {
                const isSelected = selected?.[0] === i && selected?.[1] === j;
                const isError    = errors[i]?.[j];
                const isHinted   = hinted[i]?.[j];
                const isRelated  = selected !== null && (selected[0] === i || selected[1] === j);
                const animType   = animating[`${i}-${j}`];
                const animClass  =
                  animType === "pop"   ? "animate-cell-pop"   :
                  animType === "shake" ? "animate-cell-shake" :
                  animType === "hint"  ? "animate-hint-pop"   :
                  animType === "win"   ? "animate-win-pop"    : "";

                const cellStyle =
                  won              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                  isHinted         ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                  isSelected && isError ? "bg-red-500/30 border-sky-400 text-red-300 ring-2 ring-sky-400" :
                  isError          ? "bg-red-500/20 border-red-500 text-red-400" :
                  isSelected       ? "bg-sky-500/30 border-sky-400 text-white" :
                  isRelated        ? "bg-gray-700/60 border-gray-600 text-gray-200" :
                                     "bg-gray-800 border-gray-700 text-gray-100 hover:border-gray-500";

                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`${cellSize} flex items-center justify-center rounded-lg cursor-pointer font-bold border-2 transition-colors duration-150 select-none ${cellStyle} ${animClass}`}
                  >
                    {val !== 0 ? val : ""}
                  </div>
                );
              })
            )}
          </div>

          {/* Right clues */}
          <div className="flex flex-col gap-1">
            {clues.right.map((clue, i) => (
              <div key={i} className={`${clueLeft} flex items-center justify-center font-bold text-lg ${clue !== null ? "text-sky-400" : "text-gray-700"}`}>
                {clue !== null ? clue : "?"}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom clues */}
        <div className="flex gap-1 ml-10">
          {clues.bottom.map((clue, i) => (
            <div key={i} className={`${clueSize} flex items-center justify-center font-bold text-lg ${clue !== null ? "text-sky-400" : "text-gray-700"}`}>
              {clue !== null ? clue : "?"}
            </div>
          ))}
        </div>
      </div>

      <NumberPad size={size} onInput={handleInput} disabled={won || !selected} />

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={onBack}    className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors">← Back</button>
        <button onClick={handleReset} className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors">Reset</button>
        <button onClick={handleHint} disabled={won} className="px-5 py-2 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/50 border border-emerald-700 text-emerald-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">💡 Hint</button>
        <button onClick={onNewPuzzle} className="px-5 py-2 rounded-lg bg-sky-800/50 hover:bg-sky-700/50 border border-sky-700 text-sky-400 text-sm font-medium transition-colors">New Puzzle</button>
      </div>

      <p className="text-gray-600 text-xs">Click a cell · Press 1–{size} to fill · Backspace to clear · Arrow keys to navigate</p>
    </div>
  );
}