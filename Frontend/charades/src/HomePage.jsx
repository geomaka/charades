import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TimerComponent from "./time";

const categories = [
  { name: "Disney Princess", color: "bg-pink-400" },
  { name: "Sports", color: "bg-blue-400" },
  { name: "Music", color: "bg-purple-400" },
  { name: "Bible", color: "bg-green-400" },
  { name: "Movies", color: "bg-yellow-400" },
  { name: "Animals", color: "bg-red-400" },
  { name: "Fun Random", color: "bg-indigo-400" },
  { name: "Custom", color: "bg-gray-400" },
];

const HomePage = ({ setCategory, setCustomCategory, setGameDuration }) => {
  const navigate = useNavigate();
  const [customInput, setCustomInput] = useState("");
  const [customTime, setCustomTime] = useState(60);

  const handleCategoryClick = (category) => {
    if (category.name === "Custom") {
      if (!customInput.trim()) return;
      setCustomCategory(customInput);
      setCategory({ name: customInput, color: "bg-gray-500" });
    } else {
      setCategory(category);
    }
    navigate("/game");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🎭 Charades Game</h1>
      <TimerComponent timeDuration={customTime} onTimeSet={setGameDuration} mode="setup" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-6xl px-4 m-6">
        {categories.map(({ name, color }) => (
          <button
            key={name}
            onClick={() => handleCategoryClick({ name, color })}
            className={`${color} text-white font-semibold p-6 rounded-2xl shadow-md hover:scale-105 transition transform flex items-center justify-center h-32 w-full`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center">
        <input
          type="text"
          placeholder="Enter custom category"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleCategoryClick({ name: "Custom", color: "bg-gray-500" })}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default HomePage;
