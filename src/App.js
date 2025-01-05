import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
// import { useState } from "react";
import Navbar from "./components/Navbar";
import TypingSpeedChecker from "./components/TypingSpeedChecker";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Account from "./components/Account";
import { auth } from "./firebaseConfig";
import { ToastContainer } from "react-toastify";  // Move ToastContainer here
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toastify

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <Router>
      <ToastContainer /> {/* Toast container moved here */}
      {user && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/typing-test" /> : <Navigate to="/login" />}
        />
        <Route
          path="/typing-test"
          element={user ? <TypingSpeedChecker /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/typing-test" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/typing-test" />} />
        <Route path="/account" element={user ? <Account /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
