import React from "react";
import { useNavigate } from "react-router-dom";

const ScoreScreen = ({ score, setScore }) => {
  const navigate = useNavigate();

  const handleRestart = () => {
    setScore(0); 
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">🏆 Game Over!</h1>
      <p className="text-2xl mt-4">
        Your Score: <span className="text-blue-500 font-bold">{score}</span>
      </p>

      <button
        onClick={handleRestart}
        className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600"
      >
        🔄 Play Again
      </button>
    </div>
  );
};

export default ScoreScreen;
