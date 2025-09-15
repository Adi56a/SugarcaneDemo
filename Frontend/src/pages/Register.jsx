import React, { useState } from 'react';
import Header from '../components/Header';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en'); // Default to English

  // Handle language toggle
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'mr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage); // Store language preference in localStorage
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare user data
    const userData = { username, password };

    try {
    // Dynamically set the URL based on the environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/admin/register' 
      : 'https://sugarcanebillingsoftware.onrender.com/api/admin/register'; // Replace with your actual production URL

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

      const result = await response.json(); // Assuming the API returns a JSON response

      // Check if the response is successful
      if (response.ok) {
        setMessage(result.message || (language === 'en' ? 'Registration Successful!' : 'नोंदणी यशस्वी!'));
      } else {
        setMessage(result.error || (language === 'en' ? 'Registration failed!' : 'नोंदणी अयशस्वी!'));
      }

      // Clear form fields after submission (this was missing)
      setUsername('');
      setPassword('');

      setShowMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      // Handle error if the request fails
      setMessage(language === 'en' ? 'Something went wrong. Please try again.' : 'काहीतरी चुकलं, कृपया पुन्हा प्रयत्न करा.');
      setShowMessage(true);

      // Clear the form fields in case of error
      setUsername('');
      setPassword('');

      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  // Content in both languages
  const texts = {
    en: {
      title: 'Create an Account',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      registerButton: 'Register',
      successMessage: 'Registration Successful!',
    },
    mr: {
      title: 'खाते तयार करा',
      usernameLabel: 'वापरकर्ता नाव',
      passwordLabel: 'पासवर्ड',
      registerButton: 'नोंदणी करा',
      successMessage: 'नोंदणी यशस्वी!',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 flex flex-col">
      {/* Include Header */}
      <Header />

      {/* Register Form */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-24"> {/* Padding added for spacing below header */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          {/* Language Toggle Button (placed inside the form) */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLanguage}
              className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition ease-in-out duration-300"
            >
              {language === 'en' ? 'Switch to Marathi' : 'Switch to English'}
            </button>
          </div>

          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            {texts[language].title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {texts[language].usernameLabel}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder={language === 'en' ? 'Enter your username' : 'तुमचं वापरकर्तानाव टाका'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {texts[language].passwordLabel}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={language === 'en' ? 'Enter your password' : 'तुमचा पासवर्ड टाका'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ease-in-out duration-300"
              >
                {texts[language].registerButton}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Message Popup */}
      {showMessage && (
        <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Register;
