import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Spinner from "./Spinner";  // Import Spinner component

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);  // Add loading state
  const [error, setError] = useState("");  // Add error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");  // Reset error state before each request
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (error) {
      setError(error.message);  // Set error message if authentication fails
    } finally {
      setLoading(false);  // Set loading to false once the process is done
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}  // Disable button while loading
        >
          {loading ? (
            <Spinner />  // Show spinner while loading
          ) : (
            isLogin ? "Login" : "Sign Up"
          )}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}  {/* Display error message */}
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 cursor-pointer"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

export default Auth;
