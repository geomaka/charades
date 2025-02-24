import React, { useState, useEffect } from "react";

const TimerComponent = ({ timeDuration, onTimeSet, mode = "setup", onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(timeDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [customTime, setCustomTime] = useState(timeDuration);

  useEffect(() => {
    if (mode === "game") {
      setTimeLeft(timeDuration); 
      setIsRunning(true);
    }
  }, [timeDuration, mode]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (onTimeEnd) onTimeEnd(); 
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onTimeEnd]);

  const handleStart = () => {
    onTimeSet(customTime); 
    setTimeLeft(customTime);
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md w-72">
      <h2 className="text-lg font-bold mb-2">⏳ Timer</h2>

      {mode === "game" && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / timeDuration) * 100}%` }}
          />
        </div>
      )}

      <p className="text-3xl font-semibold text-blue-600">{timeLeft}s</p>

      {mode === "setup" && (
        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm font-semibold">Set Time:</label>
          <input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(parseInt(e.target.value) || 0)}
            className="w-16 p-1 border border-gray-300 rounded-md text-center"
          />
          <span>sec</span>
          <button
            onClick={handleStart}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerComponent;
