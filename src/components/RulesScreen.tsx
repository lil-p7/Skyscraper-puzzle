const RULES = [
    {
      icon: "🏙️",
      title: "Fill the Grid",
      text: (
        <>
          Fill every cell with numbers 1 to N (where N is the grid size).
          Each number must appear exactly once in every row and column —
          just like Sudoku.
        </>
      ),
    },
    {
      icon: "👁️",
      title: "Visibility Clues",
      text: (
        <>
          The numbers around the edge tell you how many skyscrapers are
          visible from that direction. Taller buildings block shorter ones
          behind them.
        </>
      ),
    },
    {
      icon: "📐",
      title: "Example",
      text: (
        <>
          A row of <span className="text-white font-bold">1 3 2 4</span> seen
          from the left — you see <span className="text-white font-bold">1</span> first
          (visible), then <span className="text-white font-bold">3</span> (visible,
          taller than 1), then <span className="text-white font-bold">2</span> (hidden,
          blocked by 3), then <span className="text-white font-bold">4</span> (visible,
          tallest). So the clue would be{" "}
          <span className="text-sky-400 font-bold">3</span>.
        </>
      ),
    },
    {
      icon: "❓",
      title: "Hidden Clues",
      text: (
        <>
          In Normal and Hard mode, some clues are hidden and shown as{" "}
          <span className="text-gray-500 font-bold">?</span>. Use logic
          to deduce the missing information from the clues you do have.
        </>
      ),
    },
    {
      icon: "💡",
      title: "Hints & Scores",
      text: (
        <>
          You can use hints to reveal a cell, but using too many will
          disqualify your time from the leaderboard. The limit is{" "}
          <span className="text-emerald-400 font-bold">2 hints</span> on Easy,{" "}
          <span className="text-yellow-400 font-bold">3</span> on Normal, and{" "}
          <span className="text-red-400 font-bold">5</span> on Hard.
        </>
      ),
    },
  ];
  
  export default function RulesScreen({ onBack }: { onBack: () => void }) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">How to Play</h1>
          <p className="text-gray-400 mt-1 text-sm">Master the Skyscraper puzzle</p>
        </div>
  
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {RULES.map(({ icon, title, text }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
              <span className="text-2xl mt-1">{icon}</span>
              <div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
  
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 font-medium transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }