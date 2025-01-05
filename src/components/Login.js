import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toastify
import Spinner from "./Spinner";  // Import Spinner component

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);  // Add loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);  // Start loading
    setError(null);  // Reset error
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!"); // Success toast
      setEmail(""); // Clear email input
      setPassword(""); // Clear password input
      navigate("/");  // Redirect after successful login
    } catch (err) {
      setError(err.message);
      toast.error(err.message); // Error toast
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#7E99A3] to-[#5D7380]">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md border border-gray-300">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            disabled={loading}  // Disable button while loading
          >
            {loading ? <Spinner /> : "Login"}  {/* Show spinner or text based on loading */}
          </button>
        </form>
        <p className="text-center text-sm text-gray-700 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Signup here
          </span>
        </p>
      </div>
      {/* ToastContainer is moved to App.js */}
    </div>
  );
};

export default Login;
