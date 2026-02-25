export default function NumberPad({
    size,
    onInput,
    disabled,
  }: {
    size:     number;
    onInput:  (key: string) => void;
    disabled: boolean;
  }) {
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
  
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {numbers.map(n => (
            <button
              key={n}
              onClick={() => onInput(n.toString())}
              disabled={disabled}
              className={`
                w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all duration-150
                ${disabled
                  ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                  : "bg-gray-800 border-gray-700 text-white hover:bg-sky-500/20 hover:border-sky-400 hover:text-sky-300 active:scale-95"}
              `}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => onInput("Backspace")}
            disabled={disabled}
            className={`
              w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all duration-150
              ${disabled
                ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 active:scale-95"}
            `}
          >
            ⌫
          </button>
        </div>
      </div>
    );
  }