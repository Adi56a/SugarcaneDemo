import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaUser, FaPhone, FaTruck, FaWeightHanging, FaCalculator, FaMoneyBillWave, FaFileInvoice, FaSearch, FaChartBar } from 'react-icons/fa';

const FarmerBillingPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    farmer_number: '',
    farmer_name: '',
    driver_name: '',
    sugarcane_quality: '',
    vehicle_type: '',
    cutter: '',
    filled_vehicle_weight: '',
    empty_vehicle_weight: '',
    binding_material: '',
    only_sugarcane_weight: '',
    sugarcane_rate: '',
    totalBill: '',
    given_money: '',
    remaining_money: '',
    payment_type: ''
  });

  const [language, setLanguage] = useState('en');
  const [flashMessages, setFlashMessages] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmerSelected, setFarmerSelected] = useState(false);
  const [totalSugarcaneWeight, setTotalSugarcaneWeight] = useState(0); // New state for total sugarcane weight
  const suggestionsRef = useRef(null);

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

  useEffect(() => {
    fetchAllFarmers();
    fetchTotalSugarcaneWeight(); // Fetch total sugarcane weight on component mount
  }, []);

  // Updated auto-calculation logic
  useEffect(() => {
    const filledWeight = parseFloat(formData.filled_vehicle_weight) || 0;
    const emptyWeight = parseFloat(formData.empty_vehicle_weight) || 0;
    const rate = parseFloat(formData.sugarcane_rate) || 0;
    const givenMoney = parseFloat(formData.given_money) || 0;

    // Calculate gross sugarcane weight
    const grossSugarcaneWeight = filledWeight - emptyWeight;
    
    // Auto-calculate binding material as 10% of gross sugarcane weight
    const autoBindingMaterial = grossSugarcaneWeight > 0 ? grossSugarcaneWeight * 0.1 : 0;
    
    // Calculate net sugarcane weight
    const netSugarcaneWeight = grossSugarcaneWeight - autoBindingMaterial;
    const totalBill = netSugarcaneWeight > 0 ? netSugarcaneWeight * rate : 0;
    const remainingMoney = totalBill > 0 ? totalBill - givenMoney : 0;

    setFormData(prev => ({
      ...prev,
      binding_material: autoBindingMaterial > 0 ? autoBindingMaterial.toFixed(2) : '0', // Send zero if no value
      only_sugarcane_weight: netSugarcaneWeight > 0 ? netSugarcaneWeight.toFixed(2) : '0', // Send zero if no value
      totalBill: totalBill > 0 ? totalBill.toFixed(2) : '0', // Send zero if no value
      remaining_money: !isNaN(remainingMoney) ? remainingMoney.toFixed(2) : '0' // Send zero if no value
    }));
  }, [
    formData.filled_vehicle_weight,
    formData.empty_vehicle_weight,
    formData.sugarcane_rate,
    formData.given_money
  ]);

  // New function to fetch total sugarcane weight
  const fetchTotalSugarcaneWeight = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/bill/total-sugarcane-weight' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/bill/total-sugarcane-weight';

      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalSugarcaneWeight(data.totalWeight || 0);
      }
    } catch (error) {
      console.error('Error fetching total sugarcane weight:', error);
    }
  };

  const fetchAllFarmers = async () => {
    setIsLoadingFarmers(true);
    try {
      const token = localStorage.getItem('authToken');

      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/farmer/all' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/farmer/all';

      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFarmers(data.data);
        } else {
          setFarmers([]);
          showFlashMessage('No farmers found', 'error');
        }
      } else {
        const errorData = await response.json();
        showFlashMessage(errorData.message || 'Failed to load farmers data', 'error');
      }
    } catch (error) {
      showFlashMessage('Network error while loading farmers', 'error');
    } finally {
      setIsLoadingFarmers(false);
    }
  };

  const showFlashMessage = (message, type, duration = 5000) => {
    const id = Date.now();
    const newMessage = { id, message, type };
    
    setFlashMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      setFlashMessages(prev => prev.filter(msg => msg.id !== id));
    }, duration);
  };

  const removeFlashMessage = (id) => {
    setFlashMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleFarmerNumberChange = (e) => {
    const value = e.target.value;
    
    setFarmerSelected(false);
    setFormData(prev => ({ ...prev, farmer_number: value, farmer_name: '' }));
    
    if (value.length >= 2 && farmers.length > 0) {
      const filtered = farmers.filter(farmer => {
        const mobileMatch = farmer.farmer_number && farmer.farmer_number.toString().includes(value);
        const nameMatch = farmer.farmer_name && farmer.farmer_name.toLowerCase().includes(value.toLowerCase());
        return mobileMatch || nameMatch;
      });
      
      setFilteredFarmers(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredFarmers([]);
    }
  };

  const selectFarmer = (farmer) => {
    setFormData(prev => ({
      ...prev,
      farmer_number: farmer.farmer_number || '',
      farmer_name: farmer.farmer_name || ''
    }));
    
    setFarmerSelected(true);
    setShowSuggestions(false);
    setFilteredFarmers([]);
    
    showFlashMessage(`✅ Selected: ${farmer.farmer_name}`, 'success', 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'farmer_number') {
      handleFarmerNumberChange(e);
    } else {
      // Updated to include binding_material as auto-calculated
      if (['binding_material', 'only_sugarcane_weight', 'totalBill', 'remaining_money'].includes(name)) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 🛡️ COMPREHENSIVE VALIDATION - Prevent Backend Crash
  const validationErrors = [];
  
  // Required field validations
  if (!formData.farmer_number?.trim()) {
    validationErrors.push('Farmer mobile number is required');
  }
  
  if (!formData.farmer_name?.trim()) {
    validationErrors.push('Farmer name is required');
  }
  
  if (!formData.driver_name?.trim()) {
    validationErrors.push('Driver name is required');
  }
  
  if (!formData.vehicle_type?.trim()) {
    validationErrors.push('Vehicle type is required');
  }
  
  if (!formData.sugarcane_quality?.trim()) {
    validationErrors.push('Sugarcane quality is required');
  }
  
  if (!formData.cutter?.trim()) {
    validationErrors.push('Cutter name is required');
  }
  
  // Numeric field validations
  const filledWeight = parseFloat(formData.filled_vehicle_weight);
  if (!formData.filled_vehicle_weight || isNaN(filledWeight) || filledWeight <= 0) {
    validationErrors.push('Filled vehicle weight must be a positive number');
  }
  
  const emptyWeight = parseFloat(formData.empty_vehicle_weight);
  if (!formData.empty_vehicle_weight || isNaN(emptyWeight) || emptyWeight < 0) {
    validationErrors.push('Empty vehicle weight must be a valid number');
  }
  
  const sugarcaneRate = parseFloat(formData.sugarcane_rate);
  if (!formData.sugarcane_rate || isNaN(sugarcaneRate) || sugarcaneRate < 0) {
    validationErrors.push('Sugarcane rate must be a positive number');
  }
  
  // Logical validations
  if (filledWeight && emptyWeight && filledWeight <= emptyWeight) {
    validationErrors.push('Filled vehicle weight must be greater than empty vehicle weight');
  }
  
  // Given money validation (if provided, should be a valid number)
  if (formData.given_money && (isNaN(parseFloat(formData.given_money)) || parseFloat(formData.given_money) < 0)) {
    validationErrors.push('Given money must be a valid positive number');
  }
  
  // If validation errors exist, show them and stop submission
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors.join('\n• ');
    showFlashMessage(`❌ Please fix the following errors:\n• ${errorMessage}`, 'error', 8000);
    return;
  }

  // 🔒 SANITIZE DATA before sending to backend
  const sanitizedData = {
    farmer_number: formData.farmer_number.trim(),
    farmer_name: formData.farmer_name.trim(),
    driver_name: formData.driver_name.trim(),
    sugarcane_quality: formData.sugarcane_quality.trim(),
    vehicle_type: formData.vehicle_type.trim(),
    cutter: formData.cutter.trim(),
    filled_vehicle_weight: parseFloat(formData.filled_vehicle_weight).toString(),
    empty_vehicle_weight: parseFloat(formData.empty_vehicle_weight).toString(),
    binding_material: formData.binding_material || '0',
    only_sugarcane_weight: formData.only_sugarcane_weight || '0',
    sugarcane_rate: parseFloat(formData.sugarcane_rate).toString(),
    totalBill: formData.totalBill || '0',
    given_money: formData.given_money ? parseFloat(formData.given_money).toString() : '0',
    remaining_money: formData.remaining_money || '0',
    payment_type: formData.payment_type?.trim() || ''
  };

  console.log('📦 Sanitized data being sent to backend:', sanitizedData);

  setIsSubmitting(true);
  const token = localStorage.getItem('authToken');
  
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/bill/create' 
      : 'https://sugarcanebillingsoftware.onrender.com/api/bill/create';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sanitizedData),
    });

    if (response.ok) {
      const result = await response.json();
      showFlashMessage('🎉 Bill created successfully! Redirecting...', 'success', 3000);
      
      localStorage.setItem('selectedFarmerNumber', formData.farmer_number);
      localStorage.setItem('selectedFarmerName', formData.farmer_name);
      
      // Update total sugarcane weight after successful bill creation
      fetchTotalSugarcaneWeight();
      
      // Reset all states
      setFormData({
        farmer_number: '',
        farmer_name: '',
        driver_name: '',
        sugarcane_quality: '',
        vehicle_type: '',
        cutter: '',
        filled_vehicle_weight: '',
        empty_vehicle_weight: '',
        binding_material: '',
        only_sugarcane_weight: '',
        sugarcane_rate: '',
        totalBill: '',
        given_money: '',
        remaining_money: '',
        payment_type: ''
      });
      
      setFarmerSelected(false);
      setShowSuggestions(false);
      setFilteredFarmers([]);

      setTimeout(() => {
        navigate('/all_farmer');
      }, 2000);

    } else {
      const error = await response.json();
      showFlashMessage(`❌ Error: ${error.message || 'Failed to create bill'}`, 'error');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    showFlashMessage('🌐 Network error. Please check your connection and try again.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const translations = {
    en: {
      billTitle: "Create New Bill",
      billSubtitle: "Generate farmer billing with automatic calculations",
      farmerNumber: "Farmer's Mobile Number",
      farmerName: "Farmer's Name",
      driverName: "Driver's Name",
      sugarcaneQuality: "Sugarcane Quality",
      vehicleType: "Vehicle Type",
      cutter: "Cutter",
      filledVehicleWeight: "Filled Vehicle Weight (kg)",
      emptyVehicleWeight: "Empty Vehicle Weight (kg)",
      bindingMaterial: "Binding Material Weight (kg)",
      onlySugarcaneWeight: "Net Sugarcane Weight (kg)",
      sugarcaneRate: "Sugarcane Rate (₹/kg)",
      totalBill: "Total Bill Amount (₹)",
      givenMoney: "Given Money (₹)",
      remainingMoney: "Remaining Money (₹)",
      paymentType: "Payment Type",
      submitButton: "Create Bill",
      submittingButton: "Creating Bill...",
      searchPlaceholder: "Enter mobile number or name...",
      loading: "Loading...",
      noSuggestions: "No farmers found",
      selectToFill: "Click to select",
      typeToSearch: "Type at least 2 characters to search...",
      autoCalculated: "Auto-calculated",
      farmerDetails: "Farmer Details",
      vehicleDetails: "Vehicle & Transport Details",
      billingDetails: "Billing & Payment Details",
      calculationLogic: "Auto-Calculation Logic",
      farmerSelected: "Farmer selected successfully",
      totalSugarcaneWeight: "Total Sugarcane Weight Processed"
    },
    mr: {
      billTitle: "नवीन बिल तयार करा",
      billSubtitle: "स्वयंचलित गणनेसह शेतकरी बिलिंग तयार करा",
      farmerNumber: "शेतकऱ्याचा मोबाइल नंबर",
      farmerName: "शेतकऱ्याचे नाव",
      driverName: "चालकाचे नाव",
      sugarcaneQuality: "उस्साची गुणवत्ता",
      vehicleType: "वाहन प्रकार",
      cutter: " मुकादमाचे नाव",
      filledVehicleWeight: "भरलेल्या वाहनाचे वजन (कि.ग्रा)",
      emptyVehicleWeight: "रिकाम्या वाहनाचे वजन (कि.ग्रा)",
      bindingMaterial: "बांधणी साहित्याचे वजन (कि.ग्रा)",
      onlySugarcaneWeight: "निव्वळ उस्साचे वजन (कि.ग्रा)",
      sugarcaneRate: "उस्साची दर (₹/कि.ग्रा)",
      totalBill: "एकूण बिल रक्कम (₹)",
      givenMoney: "दिलेली रक्कम (₹)",
      remainingMoney: "उर्वरित रक्कम (₹)",
      paymentType: "भुगतान प्रकार",
      submitButton: "बिल तयार करा",
      submittingButton: "बिल तयार करत आहे...",
      searchPlaceholder: "मोबाइल नंबर किंवा नाव टाका...",
      loading: "लोड होत आहे...",
      noSuggestions: "कोणतेही शेतकरी सापडले नाहीत",
      selectToFill: "निवडण्यासाठी क्लिक करा",
      typeToSearch: "शोधण्यासाठी किमान 2 अक्षर टाका...",
      autoCalculated: "स्वयं गणना",
      farmerDetails: "शेतकरी तपशील",
      vehicleDetails: "वाहन आणि वाहतूक तपशील",
      billingDetails: "बिलिंग आणि भुगतान तपशील",
      calculationLogic: "स्वयं-गणना तर्क",
      farmerSelected: "शेतकरी यशस्वीरित्या निवडला गेला",
      totalSugarcaneWeight: "एकूण प्रक्रिया केलेले उसाचे वजन"
    }
  };

  const currentLang = translations[language];

  const FlashMessage = ({ message, type, onClose, position }) => (
    <div className={`
      fixed ${position === 'top' ? 'top-20' : 'bottom-4'} left-1/2 transform -translate-x-1/2 
      z-50 max-w-md w-full mx-4 p-4 rounded-lg shadow-lg animate-slideIn
      ${type === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
        : type === 'info'
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      }
    `}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message.message}</span>
        <button 
          onClick={() => onClose(message.id)}
          className="ml-4 text-white hover:text-gray-200 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );

  const isAutoCalculated = (fieldName) => {
    return ['binding_material', 'only_sugarcane_weight', 'totalBill', 'remaining_money'].includes(fieldName);
  };

  const getFieldIcon = (fieldName) => {
    switch(fieldName) {
      case 'farmer_number': return <FaPhone className="text-blue-500" />;
      case 'farmer_name': return <FaUser className="text-green-500" />;
      case 'driver_name': return <FaUser className="text-purple-500" />;
      case 'vehicle_type': return <FaTruck className="text-orange-500" />;
      case 'filled_vehicle_weight':
      case 'empty_vehicle_weight':
      case 'binding_material':
      case 'only_sugarcane_weight': return <FaWeightHanging className="text-red-500" />;
      case 'sugarcane_rate':
      case 'totalBill':
      case 'given_money':
      case 'remaining_money': return <FaMoneyBillWave className="text-green-600" />;
      default: return <FaFileInvoice className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Flash Messages */}
      {flashMessages.slice(0, 2).map((msg) => (
        <FlashMessage 
          key={msg.id} 
          message={msg} 
          type={msg.type}
          onClose={removeFlashMessage} 
          position="top"
        />
      ))}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <FaFileInvoice className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentLang.billTitle}
          </h1>
          <p className="text-lg text-gray-600">
            {currentLang.billSubtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Total Sugarcane Weight Display */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaChartBar className="text-3xl mr-4" />
              <div>
                <h3 className="text-xl font-bold">{currentLang.totalSugarcaneWeight}</h3>
                <p className="text-green-100">Across all farmers and bills</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{totalSugarcaneWeight.toLocaleString()}</div>
              <div className="text-green-100">kg</div>
            </div>
          </div>
        </div>

        {/* Updated Calculation Info Box */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <FaCalculator className="text-blue-600 text-2xl mr-3" />
            <h3 className="text-xl font-bold text-gray-800">{currentLang.calculationLogic}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="font-semibold text-orange-800 mb-1">Binding Material</div>
              <div className="text-orange-700">10% of (Filled - Empty) Weight</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800 mb-1">Net Weight Calculation</div>
              <div className="text-blue-700">Gross Weight - Binding Material</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-semibold text-green-800 mb-1">Total Bill Calculation</div>
              <div className="text-green-700">Net Weight × Sugarcane Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-800 mb-1">Remaining Amount</div>
              <div className="text-purple-700">Total Bill - Given Money</div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Farmer Details Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FaUser className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{currentLang.farmerDetails}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Farmer Mobile Number */}
                <div className="flex flex-col relative" ref={suggestionsRef}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {getFieldIcon('farmer_number')}
                    {currentLang.farmerNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="farmer_number"
                      value={formData.farmer_number}
                      onChange={handleChange}
                      placeholder={currentLang.searchPlaceholder}
                      className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                        farmerSelected ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    {isLoadingFarmers && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    {farmerSelected ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        ✓
                      </div>
                    ) : (
                      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {!farmerSelected && formData.farmer_number.length >= 2 && !isSubmitting && (
                    <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                      {showSuggestions && filteredFarmers.length > 0 ? (
                        <>
                          <div className="p-3 bg-gray-50 text-xs text-gray-600 border-b font-medium">
                            Found {filteredFarmers.length} farmers
                          </div>
                          {filteredFarmers.map((farmer, index) => (
                            <div
                              key={farmer._id || index}
                              className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200 last:border-b-0"
                              onClick={() => selectFarmer(farmer)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-800">
                                    {farmer.farmer_name || 'No Name'}
                                  </div>
                                  <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <FaPhone className="text-xs" />
                                    {farmer.farmer_number || 'No Mobile'}
                                  </div>
                                </div>
                                <div className="text-xs text-blue-600 px-3 py-1 bg-blue-100 rounded-full">
                                  {currentLang.selectToFill}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-gray-500 text-center">
                          {currentLang.noSuggestions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Farmer Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {getFieldIcon('farmer_name')}
                    {currentLang.farmerName}
                  </label>
                  <input
                    type="text"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                      formData.farmer_name && formData.farmer_number ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                    }`}
                    required
                    placeholder="Name will auto-fill when you select from suggestions"
                    disabled={isSubmitting}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Vehicle & Transport Details */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <FaTruck className="text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{currentLang.vehicleDetails}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'driver_name', label: currentLang.driverName, type: 'text' },
                  { name: 'vehicle_type', label: currentLang.vehicleType, type: 'text' },
                  { name: 'sugarcane_quality', label: currentLang.sugarcaneQuality, type: 'text' },
                  { name: 'cutter', label: currentLang.cutter, type: 'text' },
                  { name: 'filled_vehicle_weight', label: currentLang.filledVehicleWeight, type: 'number', step: '0.01' },
                  { name: 'empty_vehicle_weight', label: currentLang.emptyVehicleWeight, type: 'number', step: '0.01' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      {getFieldIcon(field.name)}
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Billing & Payment Details */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FaMoneyBillWave className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{currentLang.billingDetails}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'binding_material', label: currentLang.bindingMaterial, type: 'number', step: '0.01' },
                  { name: 'only_sugarcane_weight', label: currentLang.onlySugarcaneWeight, type: 'number', step: '0.01' },
                  { name: 'sugarcane_rate', label: currentLang.sugarcaneRate, type: 'number', step: '0.01' },
                  { name: 'totalBill', label: currentLang.totalBill, type: 'number', step: '0.01' },
                  { name: 'given_money', label: currentLang.givenMoney, type: 'number', step: '0.01' },
                  { name: 'remaining_money', label: currentLang.remainingMoney, type: 'number', step: '0.01' },
                  { name: 'payment_type', label: currentLang.paymentType, type: 'text' }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      {getFieldIcon(field.name)}
                      {field.label}
                      {isAutoCalculated(field.name) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🔢 {currentLang.autoCalculated}
                        </span>
                      )}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 ${
                        isAutoCalculated(field.name)
                          ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                          : 'border-gray-300'
                      }`}
                      required={!isAutoCalculated(field.name) && field.name !== 'payment_type'}
                      disabled={isSubmitting || isAutoCalculated(field.name)}
                      placeholder={isAutoCalculated(field.name) ? 'Auto-calculated' : ''}
                    />
                    {isAutoCalculated(field.name) && (
                      <p className="text-xs text-blue-600 mt-1">
                        This field is automatically calculated
                        {field.name === 'binding_material' && ' (10% of gross weight)'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300 flex items-center gap-3 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    {currentLang.submittingButton}
                  </>
                ) : (
                  <>
                    <FaFileInvoice />
                    {currentLang.submitButton}
                  </>
                )}
              </button>
            </div>

            {/* Navigation hint */}
            {isSubmitting && (
              <div className="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-pulse mr-2">🔄</div>
                  <span>Creating bill and preparing to redirect to farmer history...</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerBillingPage;
