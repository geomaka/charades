import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import GamePage from "./GamePage";
import ScoreScreen from "./ScoreScreen";

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [gameDuration, setGameDuration] = useState(60);
  const [score, setScore] = useState(0); 

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Routes>
          <Route path="/" element={<HomePage setCategory={setSelectedCategory} setCustomCategory={setCustomCategory} setGameDuration={setGameDuration} />} />
          <Route path="/game" element={<GamePage selectedCategory={selectedCategory} customCategory={customCategory} gameDuration={gameDuration}  score={score} setScore={setScore}/>} />
          <Route path="/score" element={<ScoreScreen score={score} setScore={setScore} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
