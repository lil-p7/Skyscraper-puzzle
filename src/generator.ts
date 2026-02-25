// ─── Types ────────────────────────────────────────────────────────────────────

export type Board = number[][];
export type Errors = boolean[][];

export type Clues = {
  top: (number | null)[];
  bottom: (number | null)[];
  left: (number | null)[];
  right: (number | null)[];
};

export type Difficulty = "Easy" | "Normal" | "Hard";
export type GridSize = 4 | 5;

export type Puzzle = {
  size: GridSize;
  board: Board; // player's current board (starts empty)
  solution: Board; // full solution
  clues: Clues; // clues with some hidden depending on difficulty
  fullClues: Clues; // all clues always visible (for hint checking)
  difficulty: Difficulty;
};

// ─── Latin Square Generator ───────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLatinSquare(size: number): Board {
  const base = Array.from({ length: size }, (_, i) => i + 1);
  const board: Board = [];

  for (let i = 0; i < size; i++) {
    // shift base row by i to guarantee no column duplicates
    const row = [...base.slice(i), ...base.slice(0, i)];
    board.push(row);
  }

  // Shuffle rows, then shuffle columns to randomize
  const shuffledRows = shuffle(board);
  const colOrder = shuffle(Array.from({ length: size }, (_, i) => i));
  return shuffledRows.map((row) => colOrder.map((c) => row[c]));
}

// ─── Clue Computation ─────────────────────────────────────────────────────────

export function countVisible(line: number[]): number {
  let max = 0,
    visible = 0;
  for (const h of line) {
    if (h > max) {
      visible++;
      max = h;
    }
  }
  return visible;
}

function computeClues(solution: Board, size: number): Clues {
  const top: number[] = [];
  const bottom: number[] = [];
  const left: number[] = [];
  const right: number[] = [];

  for (let i = 0; i < size; i++) {
    const row = solution[i];
    const col = solution.map((r) => r[i]);

    left.push(countVisible(row));
    right.push(countVisible([...row].reverse()));
    top.push(countVisible(col));
    bottom.push(countVisible([...col].reverse()));
  }

  return { top, bottom, left, right };
}

// ─── Clue Hiding ──────────────────────────────────────────────────────────────

function hideClues(clues: Clues, difficulty: Difficulty, size: number): Clues {
  const total = size * 4;
  const hideRate =
    difficulty === "Easy" ? 0 : difficulty === "Normal" ? 0.3 : 0.55;
  const hideCount = Math.round(total * hideRate);

  // Build list of all clue positions
  type CluePos = { side: keyof Clues; index: number };
  const allPositions: CluePos[] = [];
  (["top", "bottom", "left", "right"] as (keyof Clues)[]).forEach((side) => {
    for (let i = 0; i < size; i++) allPositions.push({ side, index: i });
  });

  const toHide = shuffle(allPositions).slice(0, hideCount);

  // Deep clone clues
  const result: Clues = {
    top: [...clues.top],
    bottom: [...clues.bottom],
    left: [...clues.left],
    right: [...clues.right],
  };

  toHide.forEach(({ side, index }) => {
    (result[side] as (number | null)[])[index] = null;
  });

  return result;
}

// ─── Puzzle Generator ─────────────────────────────────────────────────────────

export function generatePuzzle(size: GridSize, difficulty: Difficulty): Puzzle {
  const solution = generateLatinSquare(size);
  const fullClues = computeClues(solution, size);
  const clues = hideClues(fullClues, difficulty, size);

  return {
    size,
    board: Array.from({ length: size }, () => Array(size).fill(0)),
    solution,
    clues,
    fullClues,
    difficulty,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateBoard(
  board: Board,
  clues: Clues,
  size: number
): Errors {
  const errors: Errors = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const boardFull = board.every((row) => row.every((val) => val !== 0));

  for (let i = 0; i < size; i++) {
    const row = board[i];
    const col = board.map((r) => r[i]);

    const rowNums = row.filter((n) => n !== 0);
    if (new Set(rowNums).size !== rowNums.length)
      row.forEach((_, j) => (errors[i][j] = true));

    const colNums = col.filter((n) => n !== 0);
    if (new Set(colNums).size !== colNums.length)
      col.forEach((_, j) => (errors[j][i] = true));

    if (boardFull) {
      if (clues.left[i] != null && countVisible(row) !== clues.left[i])
        row.forEach((_, j) => (errors[i][j] = true));
      if (
        clues.right[i] != null &&
        countVisible([...row].reverse()) !== clues.right[i]
      )
        row.forEach((_, j) => (errors[i][j] = true));
      if (clues.top[i] != null && countVisible(col) !== clues.top[i])
        col.forEach((_, j) => (errors[j][i] = true));
      if (
        clues.bottom[i] != null &&
        countVisible([...col].reverse()) !== clues.bottom[i]
      )
        col.forEach((_, j) => (errors[j][i] = true));
    }
  }

  return errors;
}

// ─── Win Check ────────────────────────────────────────────────────────────────

export function checkWin(board: Board, solution: Board): boolean {
  return solution.every((row, i) => row.every((val, j) => board[i][j] === val));
}

// ─── Hint ─────────────────────────────────────────────────────────────────────

export function getHintCell(
  board: Board,
  solution: Board,
  hinted: boolean[][],
  size: number
): [number, number] | null {
  const candidates: [number, number][] = [];

  for (let i = 0; i < size; i++)
    for (let j = 0; j < size; j++)
      if (board[i][j] !== solution[i][j] && !hinted[i][j])
        candidates.push([i, j]);

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Scores ───────────────────────────────────────────────────────────────────

export type ScoreEntry = {
    time:     number;   // in seconds
    hints:    number;
    mistakes: number;
    date:     string;   // ISO string
  };
  
  export type ScoreKey = string; // e.g. "4-Easy", "5-Hard"
  
  export function getScoreKey(size: GridSize, difficulty: Difficulty): ScoreKey {
    return `${size}-${difficulty}`;
  }
  
  export const HINT_THRESHOLDS: Record<Difficulty, number> = {
    Easy:   2,
    Normal: 3,
    Hard:   4,
  };
  
  const MAX_SCORES = 5;
  
  export function loadScores(key: ScoreKey): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(`skyscraper-scores-${key}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  
  export function saveScore(key: ScoreKey, entry: ScoreEntry): { saved: boolean; rank: number } {
    const scores = loadScores(key);
    scores.push(entry);
    scores.sort((a, b) => a.time - b.time);
    const rank = scores.findIndex(s => s === entry);
    const trimmed = scores.slice(0, MAX_SCORES);
    const saved = trimmed.includes(entry);
    if (saved) localStorage.setItem(`skyscraper-scores-${key}`, JSON.stringify(trimmed));
    return { saved, rank: saved ? rank + 1 : -1 };
  }
  
  export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }