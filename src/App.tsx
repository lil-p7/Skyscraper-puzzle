import { useState } from "react";
import { generatePuzzle, type Puzzle, type Difficulty, type GridSize } from "./generator";
import SettingsScreen   from "./components/SettingsScreen";
import RulesScreen      from "./components/RulesScreen";
import BestScoresScreen from "./components/BestScoresScreen";
import GameScreen       from "./components/GameScreen";

type Screen = "settings" | "game" | "scores" | "rules";

export default function App() {
  const [screen,   setScreen]   = useState<Screen>("settings");
  const [puzzle,   setPuzzle]   = useState<Puzzle | null>(null);
  const [settings, setSettings] = useState<{ size: GridSize; difficulty: Difficulty } | null>(null);

  const handleStart = (size: GridSize, difficulty: Difficulty) => {
    setSettings({ size, difficulty });
    setPuzzle(generatePuzzle(size, difficulty));
    setScreen("game");
  };

  const handleNewPuzzle = () => {
    if (settings) setPuzzle(generatePuzzle(settings.size, settings.difficulty));
  };

  const handleBack = () => {
    setScreen("settings");
    setPuzzle(null);
  };

  if (screen === "rules")  return <RulesScreen      onBack={() => setScreen("settings")} />;
  if (screen === "scores") return <BestScoresScreen  onBack={() => setScreen("settings")} />;
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
      onViewRules={() => setScreen("rules")}
    />
  );
}