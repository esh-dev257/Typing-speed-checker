import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { saveTypingScore } from "./saveTypingScore"; // Utility function to save score
import { toast } from "react-toastify";  // Import toast
import 'react-toastify/dist/ReactToastify.css';  // Import Toastify styles

const TypingSpeedChecker = () => {
  const [currentSentence, setCurrentSentence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [savedResults, setSavedResults] = useState([]);
  const [toastShown, setToastShown] = useState(false); // To prevent showing toast multiple times

  const intervalRef = useRef(null); // Use a ref to store the interval ID

  const sentences = {
    easy: [
      "Canada is south of Detroit .",
      "Bats are the only mammals that can actually fly.",
      "The earth's circumference is 24,901 miles.",
      "Whatever you are , be a good one.",
      "The capital of the United States is Washington D.C.",
      "React is fun to learn.",
      " We shake hands to show we're unarmed. "
    ],
    medium: [
      "It's impossible to hum while holding your nose",
      "A tiger's skin is actually striped, just like their fur. Also, no two fur patterns are alike.",
      "JavaScript is used to create dynamic web pages.",
      "It takes 570 gallons to paint the exterior of the White House.",
      "Practice makes typing faster and more accurate.",
      "The average lifespan of a human is around 80 years.",
      "The average human height is around 1.78 meters.",
      "The average human weight is around 70 kg.",
      "The oldest person to ever walk on the moon was Stephen Hawking in 1969.",
      "The smallest planet in our solar system is Mercury.",
      "React allows developers to build user interfaces efficiently.",
      "Technology is constantly evolving, bringing new opportunities and challenges.",
      "The ability to learn new skills quickly is a valuable asset in today's fast-paced world."
    ],
    hard: [
      "My favorite coding languages are JavaScript, Python, and C++, and I love solving algorithm challenges while working on projects with friends and teammates.",
      "On 25th December, we celebrated Christmas with our family and friends, exchanged gifts, and enjoyed delicious food while playing board games and watching movies.",
      "The new software update includes several bug fixes, improved performance, and enhanced security features, making it more reliable and user-friendly.",
      "She ran 5 kilometers in the morning, then had a healthy breakfast with avocado toast and a smoothie before heading to the office for a busy day of meetings.",
      "Please enter the code 1aT7B9p2 to proceed.",
      "The wedding of Princess Diana and Prince Charles was watched by 750 million people worldwide in 1981; sadly, 2.5 billion watched her funeral in 1997.",
    ],
  };

  useEffect(() => {
    setCurrentSentence(getRandomSentence());
  }, []);

  const getRandomSentence = () => {
    if (timer === 15) return getRandomFromArray(sentences.easy);
    if (timer === 30) return getRandomFromArray(sentences.medium);
    if (timer === 60) return getRandomFromArray(sentences.hard);
    return "";
  };

  const getRandomFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const startTest = () => {
    if (timer === 0) {
      toast.error("Please select a timer duration.");
      return;
    }

    setStartTime(Date.now());
    setInputValue("");
    setWordCount(0);
    setAccuracy(0);
    setIsTestActive(true);
    setTimeRemaining(timer);

    setCurrentSentence(getRandomSentence());

    // Clear the previous interval if any
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
  
    let correctChars = 0;
  
    // Count matching characters
    for (let i = 0; i < sentenceChars.length; i++) {
      if (inputChars[i] === sentenceChars[i]) {
        correctChars++;
      }
    }
  
    // Ensure 100% if lengths match and all characters are correct
    if (input.trim() === sentence.trim()) {
      return 100;
    }
  
    // Calculate percentage based on the sentence length
    return (correctChars / sentenceChars.length) * 100;
  };
  

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);

    // Check if the user has entered a full stop
    if (input.endsWith(".")) {
      finishTest();  // Calculate the result when the full stop is entered
    }
  };

  const refreshTest = () => {
    if (timer === 0 && !toastShown) {
      toast.error("Please select a timer duration.");
      setToastShown(true); // Ensure the toast is shown only once
    }

    setIsTestActive(false);
    setInputValue("");
    setWordCount(0);
    setAccuracy(0);
    setStartTime(null);
    setTimeRemaining(timer);
    setCurrentSentence(getRandomSentence());

    // Clear the previous interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const saveResults = async () => {
    const userId = auth.currentUser.uid;
    const newResult = {
      wpm: wordCount,
      accuracy: accuracy.toFixed(2),
      timestamp: new Date(),
    };

    // Use the saveTypingScore function to save the score in Firestore
    const resultSaved = await saveTypingScore(wordCount, accuracy.toFixed(2));
    if (resultSaved) {
      toast.success("Results saved successfully!");
    }
  };

  useEffect(() => {
    const fetchSavedResults = async () => {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setSavedResults(userDoc.data().scores || []);
      }
    };

    if (auth.currentUser) {
      fetchSavedResults();
    }
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
            <p className="text-lg">Accuracy: {accuracy.toFixed(2)}%</p>
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
