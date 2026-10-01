
import React, { useContext, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { assets } from "../assets/assets";

import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
  } = useContext(ShopContext);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">

      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          className="w-36"
          alt="Logo"
        />
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">

        <NavLink
          to="/"
          className="flex flex-col items-center gap-1"
        >
          <p>Home</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>

        <NavLink
          to="/collection"
          className="flex flex-col items-center gap-1"
        >
          <p>Collection</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>

        <NavLink
          to="/about"
          className="flex flex-col items-center gap-1"
        >
          <p>About</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>

        <NavLink
          to="/contact"
          className="flex flex-col items-center gap-1"
        >
          <p>Contact</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>

      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <img
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* Profile */}
        <div className="group relative">

          <img
            onClick={() => {
              if (!token) {
                navigate("/login");
              }
            }}
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="Profile"
          />

          {/* Dropdown */}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">

              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">

                {/* My Profile */}
                <p
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:text-black"
                >
                  My Profile
                </p>

                {/* Orders */}
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>

                {/* Admin */}
                <p
                  onClick={() =>
                    (window.location.href = import.meta.env.VITE_ADMIN_URL)
                  }
                  className="cursor-pointer hover:text-black"
                >
                  Admin
                </p>

                {/* Logout */}
                <p
                  onClick={logout}
                  className="cursor-pointer hover:text-black"
                >
                  Logout
                </p>

              </div>

            </div>
          )}

        </div>

        {/* Cart */}
        <Link to="/cart" className="relative">

          <img
            src={assets.cart_icon}
            className="w-5 min-w-5"
            alt="Cart"
          />

          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>

        </Link>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />

      </div>

      {/* Mobile Sidebar */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >

        <div className="flex flex-col text-gray-600">

          {/* Back */}
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>

          {/* Home */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>

          {/* Collection */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>

          {/* About */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>

          {/* Contact */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            CONTACT
          </NavLink>

          {/* Admin */}
          <p
            onClick={() => {
              setVisible(false);
              window.location.href = "http://localhost:5174";
            }}
            className="py-2 pl-6 border cursor-pointer"
          >
            ADMIN
          </p>

        </div>

      </div>

    </div>
  );
};

export default Navbar;
