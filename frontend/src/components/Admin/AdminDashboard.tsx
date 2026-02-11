import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">My Real Estate App</h1>
      <ul className="flex space-x-4">
        <li><a href="/" className="text-gray-600 hover:text-gray-900">Home</a></li>
        <li><a href="/buy" className="text-gray-600 hover:text-gray-900">Buy</a></li>
        <li><a href="/sell" className="text-gray-600 hover:text-gray-900">Sell</a></li>
        <li><a href="/login" className="text-gray-600 hover:text-gray-900">Login</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
