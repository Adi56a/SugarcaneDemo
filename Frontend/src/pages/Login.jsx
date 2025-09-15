import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSignInAlt, FaLanguage } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const navigate = useNavigate();

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('language') || 'en';
      setLanguage(newLanguage);
    };

    window.addEventListener('storage', handleLanguageChange);
    const languageCheckInterval = setInterval(() => {
      const currentLanguage = localStorage.getItem('language') || 'en';
      if (currentLanguage !== language) {
        setLanguage(currentLanguage);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      clearInterval(languageCheckInterval);
    };
  }, [language]);

  // Handle language toggle
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'mr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { key: 'language', value: newLanguage }
    }));
  };

  // Show message with auto-hide
  const showMessageWithType = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
    
    setTimeout(() => {
      setShowMessage(false);
    }, 4000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showMessageWithType(
        language === 'en' ? 'Please fill in all fields' : 'कृपया सर्व फील्ड भरा',
        'error'
      );
      return;
    }

    setIsLoading(true);
    const userData = { username, password };

     try {
    // Dynamically set the URL based on the environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/admin/login' 
      : 'https://sugarcanebillingsoftware.onrender.com/api/admin/login'; // Replace with your actual production URL

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

      const result = await response.json();

      if (response.ok) {
        showMessageWithType(
          result.message || (language === 'en' ? 'Login Successful! Redirecting...' : 'लॉगिन यशस्वी! रीडायरेक्ट करत आहे...'),
          'success'
        );

        localStorage.setItem('authToken', result.token);
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        showMessageWithType(
          result.error || (language === 'en' ? 'Invalid credentials. Please try again.' : 'चुकीची माहिती. कृपया पुन्हा प्रयत्न करा.'),
          'error'
        );
      }
    } catch (error) {
      showMessageWithType(
        language === 'en' ? 'Network error. Please check your connection.' : 'नेटवर्क एरर. कृपया कनेक्शन तपासा.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const texts = {
    en: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      loginButton: 'Sign In',
      signingIn: 'Signing In...',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      switchLanguage: 'Switch to Marathi',
      secureLogin: 'Secure Login',
      loginDescription: 'Access your sugar mill management dashboard'
    },
    mr: {
      title: 'परत स्वागत आहे',
      subtitle: 'तुमच्या खात्यात साइन इन करा',
      usernameLabel: 'वापरकर्ता नाव',
      passwordLabel: 'पासवर्ड',
      loginButton: 'साइन इन',
      signingIn: 'साइन इन करत आहे...',
      forgotPassword: 'पासवर्ड विसरलात?',
      noAccount: 'खाते नाही आहे?',
      signUp: 'साइन अप',
      usernamePlaceholder: 'तुमचं वापरकर्तानाव टाका',
      passwordPlaceholder: 'तुमचा पासवर्ड टाका',
      switchLanguage: 'इंग्रजीमध्ये बदला',
      secureLogin: 'सुरक्षित लॉगिन',
      loginDescription: 'तुमच्या साखर कारखाना व्यवस्थापन डॅशबोर्डमध्ये प्रवेश करा'
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <FaSignInAlt className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {t.subtitle}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t.loginDescription}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.usernameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {t.forgotPassword}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t.signingIn}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    {t.loginButton}
                  </div>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {t.noAccount}{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  {t.signUp}
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FaLock className="text-green-500" />
              <span>{t.secureLogin}</span>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="text-center">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300"
            >
              <FaLanguage className="text-blue-500" />
              <span className="font-medium">{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {showMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 animate-slideDown ${
          messageType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {messageType === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                ✓
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                ✕
              </div>
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

   
    </div>
  );
};

export default Login;
