import { useState } from "react";
import { type Difficulty, type GridSize } from "../generator";
import CityAnimation from "./CityAnimation";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy:   "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  Normal: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  Hard:   "text-red-400 border-red-500/40 bg-red-500/10",
};

export default function SettingsScreen({
  onStart,
  onViewScores,
  onViewRules,
}: {
  onStart:      (size: GridSize, difficulty: Difficulty) => void;
  onViewScores: () => void;
  onViewRules:  () => void;
}) {
  const [size,       setSize]       = useState<GridSize>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Skyscraper</h1>
        <p className="text-gray-400 mt-2 text-sm">A logic puzzle of city skylines</p>
      </div>

      <CityAnimation />

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Grid Size */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Grid Size
          </label>
          <div className="flex gap-3">
            {([4, 5, 6] as GridSize[]).map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all duration-150
                  ${size === s
                    ? "bg-sky-500/20 border-sky-400 text-sky-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}
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
            {(["Easy", "Normal", "Hard"] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-150
                  ${difficulty === d
                    ? DIFFICULTY_STYLES[d]
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

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

        <button
          onClick={onViewRules}
          className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-colors"
        >
          📖 How to Play
        </button>
      </div>

      <div className="text-center text-gray-600 text-xs max-w-xs leading-relaxed">
        Easy — all clues · Normal — some hidden · Hard — many hidden
      </div>
    </div>
  );
}