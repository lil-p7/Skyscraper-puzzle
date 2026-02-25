import { formatTime, HINT_THRESHOLDS, type Difficulty, type GridSize } from "../generator";

const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  Easy:   "text-emerald-400",
  Normal: "text-yellow-400",
  Hard:   "text-red-400",
};

export default function WinModal({
  time, hints, mistakes, difficulty, size, rank, qualified,
  onNewPuzzle, onBack,
}: {
  time:        number;
  hints:       number;
  mistakes:    number;
  difficulty:  Difficulty;
  size:        GridSize;
  rank:        number;
  qualified:   boolean;
  onNewPuzzle: () => void;
  onBack:      () => void;
}) {
  const threshold = HINT_THRESHOLDS[difficulty];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white">Puzzle Solved!</h2>
          <p className="text-gray-400 text-sm mt-1">
            {size}×{size} · <span className={DIFFICULTY_TEXT[difficulty]}>{difficulty}</span>
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { label: "Time",     value: formatTime(time),       icon: "⏱️" },
            { label: "Hints",    value: `${hints}/${threshold}`, icon: "💡" },
            { label: "Mistakes", value: mistakes.toString(),     icon: "❌" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-800 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className="text-lg">{icon}</span>
              <span className="text-white font-bold text-lg">{value}</span>
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {qualified ? (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-semibold text-sm">
              🏆 Ranked #{rank} on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-sm">
              Score not saved — used more than {threshold} hint{threshold > 1 ? "s" : ""}
            </p>
          </div>
        )}

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