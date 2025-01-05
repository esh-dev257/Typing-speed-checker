import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-br from-[#5D7380] to-[#7E99A3] text-white p-4 flex justify-between items-center shadow-md">
      {/* Left Navigation Links */}
      <div className="flex space-x-10 text-lg font-semibold">
        <Link to="/typing-test" className="hover:underline hover:text-yellow-300">
          Home
        </Link>
        <Link to="/account" className="hover:underline hover:text-yellow-300">
          Profile
        </Link>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
