// import { db } from "./firebaseConfig"; // Import Firestore instance
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Adjust the path to your firebaseConfig.js
 // Import Firebase auth to access user details

// Function to save typing score with user details to Firestore
export const saveTypingScore = async (wpm, accuracy) => {
  try {
    // Get the current logged-in user's details
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return false;
    }

    // Get user details
    const userId = user.uid;
    const userName = user.displayName || "Anonymous";
    const userEmail = user.email;

    // Access the scores collection in Firestore
    const scoresCollectionRef = collection(db, "scores");

    // Add a new document with the score data and user details
    await addDoc(scoresCollectionRef, {
      userId,
      userName,
      userEmail,
      wpm,
      accuracy,
      timestamp: new Date(),
    });

    console.log("Score saved successfully!");
    return true;
  } catch (error) {
    console.error("Error saving score: ", error);
    return false;
  }
};
