// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // To link back to the home page

const NotFound = () => {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col justify-center items-center text-center px-4">
      <div className="max-w-xl">
        <img
          src="https://images.pexels.com/photos/11466855/pexels-photo-11466855.jpeg"
          alt="Not Found"
          className="rounded-lg mb-8"
        />
        <h1 className="text-6xl font-bold mb-4">Oops! Page Not Found</h1>
        <p className="text-xl mb-6">
          Sorry, we couldn’t find the page you were looking for.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 px-8 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
