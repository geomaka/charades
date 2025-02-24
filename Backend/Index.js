const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const wordsCache = {};
let gameStartTime = null;
let gameDuration = 0;
let gameActive = false;
let gameTimer = null;

async function generateWords(category) {
    try {
        if (!gameActive) return null;

        console.log(`📝 Generating words for category: ${category}...`);

        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [{ role: "user", content: `Give me unique words related to: ${category}. Separate each word with a comma. Words only.` }],
                max_tokens: 100
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const words = response.data.choices?.[0]?.message?.content.trim().split(",").map(word => word.trim()) || [];

        if (words.length > 0) {
            console.log(`✅ Words generated for ${category}:`, words);
            return words;
        } else {
            console.log(`⚠️ No words received for ${category}`);
            return [];
        }
    } catch (error) {
        console.error(`❌ Error generating words for ${category}:`, error.response?.data || error.message);
        return [];
    }
}

async function refillWords(category) {
    if (!wordsCache[category]) wordsCache[category] = [];

    console.log(`♻️ Refilling words for category: ${category}... Current cache size: ${wordsCache[category].length}`);

    while (wordsCache[category].length < 10 && gameActive) {
        const newWords = await generateWords(category);
        if (newWords.length > 0) {
            wordsCache[category] = [...wordsCache[category], ...newWords];
            console.log(`📦 Updated cache for ${category}:`, wordsCache[category]);
        }
    }
}

app.post("/charades", async (req, res) => {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: "Please provide a category." });

    if (!gameActive) return res.status(403).json({ error: "Game is not active. Start a game first." });

    if (!wordsCache[category] || wordsCache[category].length === 0) {
        console.log(`🔍 No words found in cache for ${category}, fetching new words...`);
        await refillWords(category);
    }

    if (wordsCache[category].length === 0) {
        return res.status(500).json({ error: "Failed to fetch words. Please try again." });
    }

    const words = wordsCache[category].splice(0, 5);
    console.log(`🚀 Sending words to client for ${category}:`, words);

    refillWords(category);
    res.json({ words });
});

app.post("/start-game", (req, res) => {
    const { duration } = req.body; 

    if (!duration || isNaN(duration) || duration <= 0) {
        return res.status(400).json({ error: "Invalid game duration" });
    }

    gameStartTime = Date.now();
    gameDuration = duration;
    gameActive = true;

    console.log(`🎮 Game started for ${duration} seconds.`);

    if (gameTimer) clearTimeout(gameTimer);
    gameTimer = setTimeout(() => {
        gameActive = false;
        console.log("⏳ Game ended.");
    }, duration * 1000);

    res.json({ message: `Game started for ${duration} seconds.`, startTime: gameStartTime });
});

app.get("/game-status", (req, res) => {
    if (!gameActive || !gameStartTime) {
        console.log("⏸️ Game is not active.");
        return res.json({ running: false, remainingTime: 0 });
    }

    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const remainingTime = Math.max(0, gameDuration - elapsedTime);

    if (remainingTime === 0) {
        gameActive = false;
    }

    console.log(`⏲️ Game is active. Remaining time: ${remainingTime}s`);
    res.json({ running: remainingTime > 0, remainingTime });
});

app.post("/stop-game", (req, res) => {
    gameActive = false;
    if (gameTimer) clearTimeout(gameTimer);
    console.log("🛑 Game manually stopped.");

    res.json({ message: "Game stopped! No more words will be generated." });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
