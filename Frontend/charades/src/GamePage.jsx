import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GamePage = ({ selectedCategory, customCategory, gameDuration, score, setScore }) => {
  const navigate = useNavigate();
  const [word, setWord] = useState("");
  const [preGameCountdown, setPreGameCountdown] = useState(5);
  const [countdown, setCountdown] = useState(gameDuration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const gameActiveRef = useRef(false);
  const preGameIntervalRef = useRef(null);
  const gameIntervalRef = useRef(null);

  useEffect(() => {
    if (selectedCategory) getWordFromStorageOrFetch();
  }, [selectedCategory]);

  useEffect(() => {
    startPreGameCountdown();
  }, []);

  const startPreGameCountdown = () => {
    preGameIntervalRef.current = setInterval(() => {
      setPreGameCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(preGameIntervalRef.current);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = async () => {
    clearInterval(preGameIntervalRef.current);
    clearInterval(gameIntervalRef.current);
    gameActiveRef.current = false;
    setGameStarted(true);
    gameActiveRef.current = true;

    const category = selectedCategory.name === "Custom" ? customCategory : selectedCategory.name;
    const storedWords = getStoredWords(category);

    if (storedWords.length > 0) {
      setWord(storedWords[0]); // ✅ First word is set before timer starts
      localStorage.setItem(category, JSON.stringify(storedWords.slice(1)));
    }

    try {
      await axios.post("http://localhost:8000/start-game", { duration: gameDuration });
      console.log("Game started successfully on backend");
    } catch (error) {
      console.error("Error starting game on backend:", error);
    }

    await fetchWord(category);
    runGameTimer();
  };

  const runGameTimer = () => {
    clearInterval(gameIntervalRef.current);
    const startTime = Date.now();
    localStorage.setItem("gameStartTime", startTime.toString());

    gameIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = Math.max(0, gameDuration - elapsed);
      setCountdown(remainingTime);

      if (remainingTime === 0) {
        clearInterval(gameIntervalRef.current);
        stopGame();
      }
    }, 1000);
  };

  const stopGame = async () => {
    if (!gameActiveRef.current) return;
    gameActiveRef.current = false;

    try {
      await axios.post("http://localhost:8000/stop-game");
      console.log("Game stopped successfully in backend");
    } catch (error) {
      console.error("Error stopping game in backend:", error);
    } finally {
      navigate("/score");
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(preGameIntervalRef.current);
      clearInterval(gameIntervalRef.current);
    };
  }, []);

  const getStoredWords = (category) => {
    try {
      const storedData = localStorage.getItem(category);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error parsing stored words:", error);
      return [];
    }
  };

  const getWordFromStorageOrFetch = async () => {
    const category = selectedCategory.name === "Custom" ? customCategory : selectedCategory.name;
    let storedWords = getStoredWords(category);

    if (storedWords.length > 0) {
      setWord(storedWords[0]);
      localStorage.setItem(category, JSON.stringify(storedWords.slice(1)));
      fetchWordsInBackground(category);
    } else {
      await fetchWord(category);
    }
  };

  const fetchWord = async (category) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/charades", { category });
      if (response.data.words?.length > 0) {
        setWord(response.data.words[0]);
        localStorage.setItem(category, JSON.stringify(response.data.words.slice(1)));
      } else {
        setError("No words available. Try again!");
      }
    } catch (err) {
      setError("Failed to fetch word. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const fetchWordsInBackground = async (category) => {
    try {
      const response = await axios.post("http://localhost:8000/charades", { category });
      const newWords = response.data.words || [];
      if (newWords.length > 0) {
        const storedWords = getStoredWords(category);
        localStorage.setItem(category, JSON.stringify([...storedWords, ...newWords]));
      }
    } catch (err) {
      console.error("Background word fetch failed:", err);
    }
  };

  const handleGesture = (event) => {
    const screenWidth = window.innerWidth;
    const clickX = event.clientX;

    setFeedback(clickX < screenWidth / 2 ? "pass" : "correct");
    if (clickX >= screenWidth / 2) setScore((prevScore) => prevScore + 1);

    setTimeout(() => {
      setFeedback(null);
      getWordFromStorageOrFetch();
    }, 800);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen w-full transition-all ${
        selectedCategory?.color || "bg-gray-100"
      } ${feedback === "correct" ? "bg-green-500" : feedback === "pass" ? "bg-red-500" : ""}`}
      onClick={handleGesture}
    >
      {!gameStarted ? (
        <h1 className="text-6xl font-bold text-white">{preGameCountdown}</h1>
      ) : (
        <>
          <h1 className="text-6xl font-bold text-white">{countdown}</h1>
          <div className="w-full max-w-md bg-gray-300 h-4 rounded-full mt-4">
            <div
              className="h-4 bg-blue-500 rounded-full transition-all"
              style={{ width: `${(countdown / gameDuration) * 100}%` }}
            ></div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-6">🎭 {selectedCategory?.name} Category</h1>
          {loading && <p className="mt-4 text-lg text-gray-200">Loading...</p>}
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {word && (
            <div className="mt-6 p-6 bg-white shadow-md rounded-lg flex flex-col items-center w-72">
              <h2 className="text-2xl font-bold text-gray-700">{word}</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GamePage;
