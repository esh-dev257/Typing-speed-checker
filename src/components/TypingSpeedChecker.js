import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { saveTypingScore } from "./saveTypingScore"; // Utility function to save score
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

const TypingSpeedChecker = () => {
  const [currentSentence, setCurrentSentence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const intervalRef = useRef(null);

  const sentences = useMemo(() => ({
    easy: [
      "Canada is south of Detroit.",
      "Bats are the only mammals that can actually fly.",
      "The earth's circumference is 24,901 miles.",
      "React is fun to learn.",
      "The capital of the United States is Washington D.C.",
    ],
    medium: [
      "JavaScript is used to create dynamic web pages.",
      "It takes 570 gallons to paint the exterior of the White House.",
      "Practice makes typing faster and more accurate.",
      "The average lifespan of a human is around 80 years.",
      "Technology is constantly evolving.",
    ],
    hard: [
      "On 25th December, we celebrated Christmas with our family and friends.",
      "The new software update includes several bug fixes and improved performance.",
      "React allows developers to build user interfaces efficiently.",
    ],
  }), []); // Memoize the sentences object

  // Function to get a random sentence based on difficulty
  const getRandomSentence = useCallback(() => {
    if (timer === 15) return getRandomFromArray(sentences.easy);
    if (timer === 30) return getRandomFromArray(sentences.medium);
    if (timer === 60) return getRandomFromArray(sentences.hard);
    return "";
  }, [timer, sentences]);

  const getRandomFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  useEffect(() => {
    if (!isTestActive) setCurrentSentence(getRandomSentence());
  }, [getRandomSentence, isTestActive]);

  const startTest = () => {
    if (timer === 0) {
      toast.error("Please select a timer duration.");
      return;
    }

    setInputValue("");
    setWordCount(0);
    setAccuracy(0);
    setIsTestActive(true);
    setTimeRemaining(timer);

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          finishTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const finishTest = () => {
    if (!isTestActive) return;

    setIsTestActive(false);

    const words = inputValue.trim().split(/\s+/).length;
    const timeElapsed = Math.max(1, timer - timeRemaining);
    const wpm = Math.round((words / timeElapsed) * 60);

    const accuracyPercentage = calculateAccuracy(inputValue, currentSentence);

    setWordCount(wpm);
    setAccuracy(accuracyPercentage);
  };

  const calculateAccuracy = (input, sentence) => {
    const inputChars = input.trim().split("");
    const sentenceChars = sentence.trim().split("");

    const correctChars = inputChars.reduce(
      (count, char, i) => count + (char === sentenceChars[i] ? 1 : 0),
      0
    );

    return ((correctChars / sentenceChars.length) * 100).toFixed(2);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const refreshTest = () => {
    setIsTestActive(false);
    setInputValue("");
    setWordCount(0);
    setAccuracy(0);
    setTimeRemaining(timer);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentSentence(getRandomSentence());
  };

  const saveResults = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("Please log in to save your results.");
      return;
    }

    const resultSaved = await saveTypingScore(wordCount, accuracy);
    if (resultSaved) {
      toast.success("Results saved successfully!");
    } else {
      toast.error("Failed to save results.");
    }
  };

  useEffect(() => {
    const fetchSavedResults = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setSavedResults(userDoc.data().scores || []);
      }
    };

    fetchSavedResults();
  }, []);

  return (
    <div className="relative p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Typing Speed Checker</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="mb-6">
          <label htmlFor="timer" className="text-xl">Select Timer:</label>
          <select
            id="timer"
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
            className="ml-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="0">Select Timer</option>
            <option value="15">15 Seconds (Easy)</option>
            <option value="30">30 Seconds (Medium)</option>
            <option value="60">60 Seconds (Hard)</option>
          </select>
        </div>

        <p className="text-lg mb-4">{currentSentence}</p>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Start typing here..."
          disabled={!isTestActive}
        />

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={startTest}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {isTestActive ? "Restart Test" : "Start Test"}
          </button>
          <button
            onClick={refreshTest}
            className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
          >
            Refresh Test
          </button>
        </div>

        {isTestActive && (
          <div className="mt-4 text-xl text-center">
            Time Remaining: {timeRemaining}s
          </div>
        )}

        {!isTestActive && wordCount > 0 && (
          <div className="mt-4">
            <p className="text-lg">Words Per Minute: {wordCount}</p>
            <p className="text-lg">Accuracy: {accuracy}%</p>
            <button
              onClick={saveResults}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Save Results
            </button>
          </div>
        )}
      </div>
      <toast />
    </div>
  );
};

export default TypingSpeedChecker;
