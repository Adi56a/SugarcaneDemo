import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { FaUser, FaPhone, FaUserPlus, FaLanguage, FaCheck, FaTimes } from 'react-icons/fa';

// Language translations for EN and Marathi
const translations = {
  en: {
    title: "Register New Farmer",
    subtitle: "Add farmers to your sugar mill management system",
    farmer_name: "Farmer Name",
    farmer_number: "Farmer Mobile Number",
    register_button: "Register Farmer",
    registering: "Registering...",
    success_message: "Farmer registered successfully",
    failure_message: "Error registering farmer",
    already_exists_message: "Farmer with this number already exists",
    required_fields: "Farmer name and number both are required",
    token_error: "Authorization failed. Please login again.",
    server_error: "Server error, please try again later.",
    name_placeholder: "Enter farmer's full name",
    number_placeholder: "Enter 10-digit mobile number",
    switchLanguage: "Switch to Marathi",
    secureRegistration: "Secure Registration",
    registrationInfo: "All farmer data is securely stored and encrypted"
  },
  mr: {
    title: "नवीन शेतकरी नोंदणी",
    subtitle: "तुमच्या साखर कारखाना व्यवस्थापन सिस्टममध्ये शेतकरी जोडा",
    farmer_name: "शेतकऱ्याचे नाव",
    farmer_number: "शेतकऱ्याचा मोबाइल नंबर",
    register_button: "शेतकरी नोंदवा",
    registering: "नोंदणी करत आहे...",
    success_message: "शेतकरी यशस्वीरित्या नोंदवला गेला",
    failure_message: "शेतकरी नोंदवताना त्रुटी",
    already_exists_message: "या नंबरसह शेतकरी आधीच अस्तित्वात आहे",
    required_fields: "शेतकऱ्याचे नाव आणि नंबर आवश्यक आहेत",
    token_error: "अधिकार प्रमाणीकरण अयशस्वी. कृपया पुन्हा लॉगिन करा.",
    server_error: "सर्व्हर त्रुटी, कृपया नंतर पुन्हा प्रयत्न करा.",
    name_placeholder: "शेतकऱ्याचे पूर्ण नाव टाका",
    number_placeholder: "10 अंकी मोबाइल नंबर टाका",
    switchLanguage: "इंग्रजीमध्ये बदला",
    secureRegistration: "सुरक्षित नोंदणी",
    registrationInfo: "सर्व शेतकरी डेटा सुरक्षितपणे संग्रहीत आणि एन्क्रिप्ट केला जातो"
  }
};

const RegisterFarmer = () => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [farmerName, setFarmerName] = useState("");
  const [farmerNumber, setFarmerNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  const [numberValid, setNumberValid] = useState(false);
  
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  
  // Listen for language changes
  useEffect(() => {
    const checkLanguage = () => {
      const currentLang = localStorage.getItem('language') || 'en';
      if (currentLang !== language) {
        setLanguage(currentLang);
      }
    };

    checkLanguage();
    const interval = setInterval(checkLanguage, 500);
    return () => clearInterval(interval);
  }, [language]);

  // Validation effects
  useEffect(() => {
    setNameValid(farmerName.trim().length >= 2);
  }, [farmerName]);

  useEffect(() => {
    const phoneRegex = /^[6-9]\d{9}$/;
    setNumberValid(phoneRegex.test(farmerNumber));
  }, [farmerNumber]);
  
  const t = translations[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { key: 'language', value: lang }
    }));
  };

  const showMessageWithType = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
    
    setTimeout(() => {
      setShowMessage(false);
    }, 4000);
  };

  const validateForm = () => {
    if (!farmerName.trim()) {
      showMessageWithType(t.required_fields, "error");
      return false;
    }

    if (farmerName.trim().length < 2) {
      showMessageWithType(
        language === 'en' ? 'Farmer name must be at least 2 characters' : 'शेतकऱ्याचे नाव किमान 2 अक्षरांचे असावे',
        "error"
      );
      return false;
    }

    if (!farmerNumber.trim()) {
      showMessageWithType(t.required_fields, "error");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(farmerNumber)) {
      showMessageWithType(
        language === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया वैध 10 अंकी मोबाइल नंबर टाका',
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      showMessageWithType(t.token_error, "error");
      return;
    }

    setIsLoading(true);

    try {
    const token = localStorage.getItem('authToken');

    // Dynamically set the URL based on the environment
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/farmer/register' 
      : 'https://sugarcanebillingsoftware.onrender.com/api/farmer/register'; // Replace with your actual production URL

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ farmer_name: farmerName, farmer_number: farmerNumber })
    });

      const data = await response.json();

      if (response.status === 201) {
        showMessageWithType(data.message || t.success_message, "success");
        setFarmerName("");
        setFarmerNumber("");
      } else if (response.status === 401) {
        showMessageWithType(t.token_error, "error");
      } else if (response.status === 500) {
        showMessageWithType(t.server_error, "error");
      } else {
        showMessageWithType(data.message || t.failure_message, "error");
      }

    } catch (error) {
      showMessageWithType(t.server_error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Flash Message Component
  const FlashMessage = ({ message, type, onClose }) => (
    <div className={`
      fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 animate-slideDown max-w-md w-full mx-4
      ${type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
      }
    `}>
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          {type === 'success' ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
        </div>
        <span className="font-medium flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 font-bold text-lg ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Flash Message */}
      {showMessage && (
        <FlashMessage 
          message={message} 
          type={messageType}
          onClose={() => setShowMessage(false)} 
        />
      )}

      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FaUserPlus className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {t.subtitle}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t.registrationInfo}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Farmer Name Field */}
              <div>
                <label htmlFor="farmer_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.farmer_name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="farmer_name"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={t.name_placeholder}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 ${
                      farmerName ? (nameValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {farmerName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {nameValid ? 
                        <FaCheck className="h-5 w-5 text-green-500" /> : 
                        <FaTimes className="h-5 w-5 text-red-500" />
                      }
                    </div>
                  )}
                </div>
                {farmerName && !nameValid && (
                  <p className="text-xs text-red-600 mt-1">
                    {language === 'en' ? 'Name must be at least 2 characters' : 'नाव किमान 2 अक्षरांचे असावे'}
                  </p>
                )}
              </div>

              {/* Farmer Number Field */}
              <div>
                <label htmlFor="farmer_number" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.farmer_number}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="farmer_number"
                    value={farmerNumber}
                    onChange={(e) => setFarmerNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t.number_placeholder}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 ${
                      farmerNumber ? (numberValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                    disabled={isLoading}
                    maxLength={10}
                  />
                  {farmerNumber && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {numberValid ? 
                        <FaCheck className="h-5 w-5 text-green-500" /> : 
                        <FaTimes className="h-5 w-5 text-red-500" />
                      }
                    </div>
                  )}
                </div>
                {farmerNumber && !numberValid && (
                  <p className="text-xs text-red-600 mt-1">
                    {language === 'en' ? 'Enter valid 10-digit mobile number starting with 6-9' : '6-9 ने सुरू होणारा वैध 10 अंकी मोबाइल नंबर टाका'}
                  </p>
                )}
                {farmerNumber && numberValid && (
                  <p className="text-xs text-green-600 mt-1">
                    {language === 'en' ? 'Valid mobile number' : 'वैध मोबाइल नंबर'}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !nameValid || !numberValid}
                className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isLoading || !nameValid || !numberValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t.registering}
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    {t.register_button}
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FaCheck className="text-green-500" />
              <span>{t.secureRegistration}</span>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="text-center">
            <button
              onClick={() => handleLanguageChange(language === "en" ? "mr" : "en")}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300"
            >
              <FaLanguage className="text-blue-500" />
              <span className="font-medium">{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default RegisterFarmer;
