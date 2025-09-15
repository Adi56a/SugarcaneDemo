import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaUser, FaPhone, FaTruck, FaWeightHanging, FaCalculator, FaMoneyBillWave, FaFileInvoice, FaSearch, FaStore } from 'react-icons/fa';
import { MdSell } from 'react-icons/md';

const SellerBillCreation = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    seller_number: '',
    seller_name: '',
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
    taken_money: '',
    remaining_money: '',
    payment_type: ''
  });

  const [language, setLanguage] = useState('en');
  const [flashMessages, setFlashMessages] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSellers, setIsLoadingSellers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerSelected, setSellerSelected] = useState(false);
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
    fetchAllSellers();
  }, []);

  // Auto-calculation logic
  useEffect(() => {
    const filledWeight = parseFloat(formData.filled_vehicle_weight) || 0;
    const emptyWeight = parseFloat(formData.empty_vehicle_weight) || 0;
    const bindingMaterial = parseFloat(formData.binding_material) || 0;
    const rate = parseFloat(formData.sugarcane_rate) || 0;
    const takenMoney = parseFloat(formData.taken_money) || 0;

    const grossSugarcaneWeight = filledWeight - emptyWeight;
    const netSugarcaneWeight = grossSugarcaneWeight - bindingMaterial;
    const totalBill = netSugarcaneWeight * rate;
    const remainingMoney = totalBill - takenMoney;

    setFormData(prev => ({
      ...prev,
      only_sugarcane_weight: netSugarcaneWeight > 0 ? netSugarcaneWeight.toFixed(2) : '',
      totalBill: totalBill > 0 ? totalBill.toFixed(2) : '',
      remaining_money: remainingMoney !== 0 && !isNaN(remainingMoney) ? remainingMoney.toFixed(2) : ''
    }));
  }, [
    formData.filled_vehicle_weight,
    formData.empty_vehicle_weight,
    formData.binding_material,
    formData.sugarcane_rate,
    formData.taken_money
  ]);

  const fetchAllSellers = async () => {
    setIsLoadingSellers(true);
    try {
      const token = localStorage.getItem('authToken');

      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/seller/all' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/seller/all';

      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSellers(data.data);
        } else {
          setSellers([]);
          showFlashMessage('No sellers found', 'error');
        }
      } else {
        const errorData = await response.json();
        showFlashMessage(errorData.message || 'Failed to load sellers data', 'error');
      }
    } catch (error) {
      showFlashMessage('Network error while loading sellers', 'error');
    } finally {
      setIsLoadingSellers(false);
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

  const handleSellerNumberChange = (e) => {
    const value = e.target.value;
    
    setSellerSelected(false);
    setFormData(prev => ({ ...prev, seller_number: value, seller_name: '' }));
    
    if (value.length >= 2 && sellers.length > 0) {
      const filtered = sellers.filter(seller => {
        const mobileMatch = seller.seller_number && seller.seller_number.toString().includes(value);
        const nameMatch = seller.seller_name && seller.seller_name.toLowerCase().includes(value.toLowerCase());
        return mobileMatch || nameMatch;
      });
      
      setFilteredSellers(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSellers([]);
    }
  };

  const selectSeller = (seller) => {
    setFormData(prev => ({
      ...prev,
      seller_number: seller.seller_number || '',
      seller_name: seller.seller_name || ''
    }));
    
    setSellerSelected(true);
    setShowSuggestions(false);
    setFilteredSellers([]);
    
    showFlashMessage(`✅ Selected: ${seller.seller_name}`, 'success', 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'seller_number') {
      handleSellerNumberChange(e);
    } else {
      if (['only_sugarcane_weight', 'totalBill', 'remaining_money'].includes(name)) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.seller_number || !formData.seller_name) {
      showFlashMessage('Please fill in seller details', 'error');
      return;
    }

    if (!formData.filled_vehicle_weight || !formData.empty_vehicle_weight) {
      showFlashMessage('Please fill in vehicle weights', 'error');
      return;
    }

    if (!formData.sugarcane_rate) {
      showFlashMessage('Please enter sugarcane rate', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');

      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/sellerbill/create-bill' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/sellerbill/create-bill';

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        showFlashMessage('🎉 Seller bill created successfully! Redirecting...', 'success', 3000);
        
        localStorage.setItem('selectedSellerNumber', formData.seller_number);
        localStorage.setItem('selectedSellerName', formData.seller_name);
        
        // Reset all states
        setFormData({
          seller_number: '',
          seller_name: '',
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
          taken_money: '',
          remaining_money: '',
          payment_type: ''
        });
        
        setSellerSelected(false);
        setShowSuggestions(false);
        setFilteredSellers([]);

        setTimeout(() => {
          navigate('/all_seller'); // You can change this to your seller list page
        }, 2000);

      } else {
        const error = await response.json();
        showFlashMessage(`❌ Error: ${error.message || 'Failed to create seller bill'}`, 'error');
      }
    } catch (error) {
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
      billTitle: "Create Seller Bill",
      billSubtitle: "Generate seller billing with automatic calculations",
      sellerNumber: "Seller's Mobile Number",
      sellerName: "Seller's Name",
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
      takenMoney: "Advance Payment (₹)",
      remainingMoney: "Remaining Money (₹)",
      paymentType: "Payment Type",
      submitButton: "Create Seller Bill",
      submittingButton: "Creating Bill...",
      searchPlaceholder: "Enter mobile number or name...",
      loading: "Loading...",
      noSuggestions: "No sellers found",
      selectToFill: "Click to select",
      typeToSearch: "Type at least 2 characters to search...",
      autoCalculated: "Auto-calculated",
      sellerDetails: "Seller Details",
      vehicleDetails: "Vehicle & Transport Details",
      billingDetails: "Billing & Payment Details",
      calculationLogic: "Auto-Calculation Logic",
      sellerSelected: "Seller selected successfully"
    },
    mr: {
      billTitle: "विक्रेता बिल तयार करा",
      billSubtitle: "स्वयंचलित गणनेसह विक्रेता बिलिंग तयार करा",
      sellerNumber: "विक्रेत्याचा मोबाइल नंबर",
      sellerName: "विक्रेत्याचे नाव",
      driverName: "चालकाचे नाव",
      sugarcaneQuality: "ऊसाची गुणवत्ता",
      vehicleType: "वाहन प्रकार",
      cutter: " मुकादमाचे नाव",
      filledVehicleWeight: "भरलेल्या वाहनाचे वजन (कि.ग्रा)",
      emptyVehicleWeight: "रिकाम्या वाहनाचे वजन (कि.ग्रा)",
      bindingMaterial: "बांधणी साहित्याचे वजन (कि.ग्रा)",
      onlySugarcaneWeight: "निव्वळ ऊसाचे वजन (कि.ग्रा)",
      sugarcaneRate: "ऊसाचा दर (₹/कि.ग्रा)",
      totalBill: "एकूण बिल रक्कम (₹)",
      takenMoney: "आगाऊ पेमेंट (₹)",
      remainingMoney: "उर्वरित रक्कम (₹)",
      paymentType: "भुगतान प्रकार",
      submitButton: "विक्रेता बिल तयार करा",
      submittingButton: "बिल तयार करत आहे...",
      searchPlaceholder: "मोबाइल नंबर किंवा नाव टाका...",
      loading: "लोड होत आहे...",
      noSuggestions: "कोणतेही विक्रेते सापडले नाहीत",
      selectToFill: "निवडण्यासाठी क्लिक करा",
      typeToSearch: "शोधण्यासाठी किमान 2 अक्षर टाका...",
      autoCalculated: "स्वयं गणना",
      sellerDetails: "विक्रेता तपशील",
      vehicleDetails: "वाहन आणि वाहतूक तपशील",
      billingDetails: "बिलिंग आणि भुगतान तपशील",
      calculationLogic: "स्वयं-गणना तर्क",
      sellerSelected: "विक्रेता यशस्वीरित्या निवडला गेला"
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
    return ['only_sugarcane_weight', 'totalBill', 'remaining_money'].includes(fieldName);
  };

  const getFieldIcon = (fieldName) => {
    switch(fieldName) {
      case 'seller_number': return <FaPhone className="text-purple-500" />;
      case 'seller_name': return <FaStore className="text-pink-500" />;
      case 'driver_name': return <FaUser className="text-purple-500" />;
      case 'vehicle_type': return <FaTruck className="text-orange-500" />;
      case 'filled_vehicle_weight':
      case 'empty_vehicle_weight':
      case 'only_sugarcane_weight': return <FaWeightHanging className="text-red-500" />;
      case 'sugarcane_rate':
      case 'totalBill':
      case 'taken_money':
      case 'remaining_money': return <FaMoneyBillWave className="text-green-600" />;
      default: return <MdSell className="text-gray-500" />;
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
            <MdSell className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentLang.billTitle}
          </h1>
          <p className="text-lg text-gray-600">
            {currentLang.billSubtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Calculation Info Box */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <FaCalculator className="text-purple-600 text-2xl mr-3" />
            <h3 className="text-xl font-bold text-gray-800">{currentLang.calculationLogic}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800 mb-1">Net Weight Calculation</div>
              <div className="text-blue-700">Filled Weight - Empty Weight - Binding Material</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-semibold text-green-800 mb-1">Total Bill Calculation</div>
              <div className="text-green-700">Net Weight × Sugarcane Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-800 mb-1">Remaining Amount</div>
              <div className="text-purple-700">Total Bill - Advance Payment</div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Seller Details Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FaStore className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{currentLang.sellerDetails}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seller Mobile Number */}
                <div className="flex flex-col relative" ref={suggestionsRef}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {getFieldIcon('seller_number')}
                    {currentLang.sellerNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="seller_number"
                      value={formData.seller_number}
                      onChange={handleChange}
                      placeholder={currentLang.searchPlaceholder}
                      className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 ${
                        sellerSelected ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    {isLoadingSellers && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      </div>
                    )}
                    {sellerSelected ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        ✓
                      </div>
                    ) : (
                      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {!sellerSelected && formData.seller_number.length >= 2 && !isSubmitting && (
                    <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                      {showSuggestions && filteredSellers.length > 0 ? (
                        <>
                          <div className="p-3 bg-gray-50 text-xs text-gray-600 border-b font-medium">
                            Found {filteredSellers.length} sellers
                          </div>
                          {filteredSellers.map((seller, index) => (
                            <div
                              key={seller._id || index}
                              className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 transition-colors duration-200 last:border-b-0"
                              onClick={() => selectSeller(seller)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-800">
                                    {seller.seller_name || 'No Name'}
                                  </div>
                                  <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <FaPhone className="text-xs" />
                                    {seller.seller_number || 'No Mobile'}
                                  </div>
                                </div>
                                <div className="text-xs text-purple-600 px-3 py-1 bg-purple-100 rounded-full">
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

                {/* Seller Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {getFieldIcon('seller_name')}
                    {currentLang.sellerName}
                  </label>
                  <input
                    type="text"
                    name="seller_name"
                    value={formData.seller_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 ${
                      formData.seller_name && formData.seller_number ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
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
                  { name: 'taken_money', label: currentLang.takenMoney, type: 'number', step: '0.01' },
                  { name: 'remaining_money', label: currentLang.remainingMoney, type: 'number', step: '0.01' },
                  { name: 'payment_type', label: currentLang.paymentType, type: 'text' }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      {getFieldIcon(field.name)}
                      {field.label}
                      {isAutoCalculated(field.name) && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 ${
                        isAutoCalculated(field.name)
                          ? 'bg-purple-50 border-purple-300 cursor-not-allowed'
                          : 'border-gray-300'
                      }`}
                      required={!isAutoCalculated(field.name)}
                      disabled={isSubmitting || isAutoCalculated(field.name)}
                      placeholder={isAutoCalculated(field.name) ? 'Auto-calculated' : ''}
                    />
                    {isAutoCalculated(field.name) && (
                      <p className="text-xs text-purple-600 mt-1">
                        This field is automatically calculated
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
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    {currentLang.submittingButton}
                  </>
                ) : (
                  <>
                    <MdSell />
                    {currentLang.submitButton}
                  </>
                )}
              </button>
            </div>

            {/* Navigation hint */}
            {isSubmitting && (
              <div className="mt-6 p-4 bg-purple-100 border border-purple-400 text-purple-700 rounded-lg text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-pulse mr-2">🔄</div>
                  <span>Creating seller bill and preparing to redirect...</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerBillCreation;
