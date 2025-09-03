// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    nav("/login");
  };

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="font-bold text-lg text-sky-600 hover:text-sky-700"
        >
          SalonApp
        </Link>

        {auth.user?.role === "salon_owner" ? (
          <>
            <Link
              to="/owner"
              className="text-sm text-slate-600 hover:text-sky-600"
            >
              Dashboard
            </Link>
            <Link
              to="/owner/bookings"
              className="text-sm text-slate-600 hover:text-sky-600"
            >
              Bookings
            </Link>
            <Link
              to="/owner/earnings"
              className="text-sm text-slate-600 hover:text-sky-600"
            >
              Earnings
            </Link>
            <Link
              to="/owner/salons/new"
              className="text-sm text-slate-600 hover:text-sky-600"
            >
              Create Salon
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/salons"
              className="text-sm text-slate-600 hover:text-sky-600"
            >
              Browse Salons
            </Link>
            {auth.user && (
              <Link
                to="/my-bookings"
                className="text-sm text-slate-600 hover:text-sky-600"
              >
                My Bookings
              </Link>
            )}
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="relative">
        {auth.user ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-1 focus:outline-none"
            >
              <FaUserCircle className="text-2xl text-sky-600" />
              <span className="text-sm text-slate-700">
                {auth.user.username}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 rounded-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-3">
            <Link
              to="/login"
              className="px-4 py-1 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1 rounded-lg bg-gray-200 text-slate-800 text-sm hover:bg-gray-300 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
