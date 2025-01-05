import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import Spinner from "./Spinner"; // Assuming you have a Spinner component for loading state

const Scores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const userId = auth.currentUser.uid;

        // Query to fetch the scores for the current user
        const q = query(collection(db, "scores"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        // Map through the documents and fetch the data
        const fetchedScores = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id, // Include the document ID for debugging or future use
        }));

        // Sort scores by timestamp, most recent first
        fetchedScores.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setScores(fetchedScores);
      } catch (err) {
        setError("Failed to fetch scores. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <Spinner />; // Show the spinner while loading
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Typing Scores</h2>
      <ul>
        {scores.length === 0 ? (
          <p>No scores available. Start a typing test to save your scores!</p>
        ) : (
          scores.map((score, index) => (
            <li key={index} className="border p-2 mb-2 rounded">
              <p><strong>WPM:</strong> {score.wpm}</p>
              <p><strong>Accuracy:</strong> {score.accuracy}%</p>
              <p><strong>Date:</strong> {score.timestamp.toDate().toLocaleString()}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Scores;
