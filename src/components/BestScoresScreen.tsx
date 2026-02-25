// import { useState } from "react";
import {
  loadScores, getScoreKey, formatTime,
  type Difficulty, type GridSize,
} from "../generator";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy:   "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  Normal: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  Hard:   "text-red-400 border-red-500/40 bg-red-500/10",
};

export default function BestScoresScreen({ onBack }: { onBack: () => void }) {
  const sizes: GridSize[]          = [4, 5, 6];
  const difficulties: Difficulty[] = ["Easy", "Normal", "Hard"];
 // const [, forceUpdate] = useState(0);

//   const handleClearAll = () => {
//     sizes.forEach(size =>
//       difficulties.forEach(diff =>
//         localStorage.removeItem(`skyscraper-scores-${getScoreKey(size, diff)}`)
//       )
//     );
//     forceUpdate(n => n + 1);
//   };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Best Scores</h1>
        <p className="text-gray-400 mt-1 text-sm">Top 5 fastest times per category</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-lg">
        {sizes.map(size =>
          difficulties.map(diff => {
            const key    = getScoreKey(size, diff);
            const scores = loadScores(key);

            return (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{size}×{size}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_STYLES[diff]}`}>
                      {diff}
                    </span>
                  </div>
                </div>

                {scores.length === 0 ? (
                  <p className="text-gray-600 text-sm">No scores yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {scores.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold w-5 ${i === 0 ? "text-yellow-400" : "text-gray-500"}`}>
                            {i === 0 ? "🥇" : `#${i + 1}`}
                          </span>
                          <span className="font-mono font-bold text-white">{formatTime(s.time)}</span>
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

      <div className="flex justify-center">
        {/* <button
          onClick={handleClearAll}
          className="px-5 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/50 border border-red-800 text-red-400 text-sm font-medium transition-colors"
        >
          🗑️ Clear All Scores
        </button> */}
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