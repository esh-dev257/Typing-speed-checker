import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Spinner from "./Spinner";  // Import Spinner

const Account = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const scoresQuery = query(
            collection(db, "scores"),
            where("userId", "==", userId)
          );
          const querySnapshot = await getDocs(scoresQuery);
          const userScores = querySnapshot.docs.map((doc) => doc.data());
          userScores.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
          setScores(userScores);
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />  {/* Show Spinner while loading */}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-300 flex items-center justify-center">
      <div className="w-11/12 max-w-3xl bg-white p-8 rounded-md shadow-lg border border-gray-300 z-10 relative mt-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Account Information
        </h2>
        {auth.currentUser ? (
          <>
            <div className="mb-4">
              <p className="text-lg text-gray-700">
                <span className="font-medium">Logged in as:</span>{" "}
                {auth.currentUser.email}
              </p>
            </div>
            <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded mb-4">
              Logout
            </button>
            <h3 className="text-2xl font-medium text-gray-800 mb-4">Your Scores</h3>
            {scores.length === 0 ? (
              <p className="text-gray-600 text-center">No scores saved yet.</p>
            ) : (
              <ul className="space-y-4">
                {scores.map((score, index) => (
                  <li key={index} className="p-4 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800">
                        <span className="font-medium">WPM:</span> {score.wpm}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium">Accuracy:</span> {score.accuracy}%
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      <span className="font-medium">Saved on:</span>{" "}
                      {new Date(score.timestamp.seconds * 1000).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-center text-gray-700">
            Please log in to view your profile.
          </p>
        )}
      </div>
    </div>
  );
};

export default Account;
