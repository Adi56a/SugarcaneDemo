import React, { useState, useEffect } from 'react';

const UpdateFarmerPage = () => {
  // State variables
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [formData, setFormData] = useState({
    farmer_number: '',
    farmer_name: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [language, setLanguage] = useState('en');
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', message: '', type: '' });

  // Language translations
  const translations = {
    en: {
      title: '👨‍🌾 Farmer Management',
      subtitle: 'Update farmer information easily and efficiently',
      searchPlaceholder: '🔍 Search by name or phone number...',
      total: 'Total',
      found: 'Found',
      loading: 'Loading farmers...',
      farmerName: 'Farmer Name',
      phoneNumber: 'Phone Number',
      actions: 'Actions',
      edit: '✏️ Edit',
      noFarmersFound: 'No farmers found',
      tryAdjusting: 'Try adjusting your search criteria',
      noFarmersAvailable: 'No farmers available in the system',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      results: 'results',
      previous: 'Previous',
      next: 'Next',
      updateFarmerDetails: 'Update Farmer Details',
      modifyInfo: 'Modify farmer information below',
      phoneNumberLabel: '📱 Phone Number',
      phoneNumberPlaceholder: 'Enter 10-15 digit phone number',
      phoneNumberFormat: 'Format: 10-15 digits only',
      fullNameLabel: '👤 Full Name',
      fullNamePlaceholder: 'Enter full name',
      fullNameFormat: 'Minimum 2 characters required',
      note: 'Note: You can update either field or both. At least one field must be provided.',
      cancel: 'Cancel',
      updateFarmer: '💾 Update Farmer',
      updating: 'Updating...',
      loadedFarmers: 'Loaded farmers',
      failedToFetch: 'Failed to fetch farmers',
      networkError: 'Network error while fetching farmers',
      provideAtLeastOne: 'Please provide at least one field to update',
      validPhoneNumber: 'Please enter a valid phone number (10-15 digits)',
      farmerNameLength: 'Farmer name must be at least 2 characters long',
      farmerUpdatedSuccess: 'Farmer updated successfully!',
      failedToUpdate: 'Failed to update farmer',
      networkUpdateError: 'Network error while updating farmer',
      numberAlreadyExists: 'Phone number already exists',
      duplicateNumberError: 'This phone number is already registered with another farmer',
      success: 'Success',
      error: 'Error',
      ok: 'OK'
    },
    mr: {
      title: '👨‍🌾 शेतकरी व्यवस्थापन',
      subtitle: 'शेतकरी माहिती सहज आणि कार्यक्षमतेने अद्यतनित करा',
      searchPlaceholder: '🔍 नाव किंवा फोन नंबरने शोधा...',
      total: 'एकूण',
      found: 'सापडले',
      loading: 'शेतकरी लोड होत आहेत...',
      farmerName: 'शेतकरीचे नाव',
      phoneNumber: 'फोन नंबर',
      actions: 'क्रिया',
      edit: '✏️ संपादित करा',
      noFarmersFound: 'कोणतेही शेतकरी सापडले नाहीत',
      tryAdjusting: 'आपले शोध निकष समायोजित करण्याचा प्रयत्न करा',
      noFarmersAvailable: 'सिस्टममध्ये कोणतेही शेतकरी उपलब्ध नाहीत',
      showing: 'दाखवत आहे',
      to: 'ते',
      of: 'पैकी',
      results: 'परिणाम',
      previous: 'मागील',
      next: 'पुढील',
      updateFarmerDetails: 'शेतकरी तपशील अद्यतनित करा',
      modifyInfo: 'खालील शेतकरी माहिती सुधारा',
      phoneNumberLabel: '📱 फोन नंबर',
      phoneNumberPlaceholder: '10-15 अंकी फोन नंबर प्रविष्ट करा',
      phoneNumberFormat: 'स्वरूप: फक्त 10-15 अंक',
      fullNameLabel: '👤 संपूर्ण नाव',
      fullNamePlaceholder: 'संपूर्ण नाव प्रविष्ट करा',
      fullNameFormat: 'किमान 2 अक्षरे आवश्यक',
      note: 'टीप: तुम्ही एकतर फील्ड किंवा दोन्ही अद्यतनित करू शकता. किमान एक फील्ड प्रदान करणे आवश्यक आहे.',
      cancel: 'रद्द करा',
      updateFarmer: '💾 शेतकरी अद्यतनित करा',
      updating: 'अद्यतनित करत आहे...',
      loadedFarmers: 'शेतकरी लोड झाले',
      failedToFetch: 'शेतकरी आणण्यात अयशस्वी',
      networkError: 'शेतकरी आणताना नेटवर्क त्रुटी',
      provideAtLeastOne: 'कृपया अद्यतनित करण्यासाठी किमान एक फील्ड प्रदान करा',
      validPhoneNumber: 'कृपया वैध फोन नंबर प्रविष्ट करा (10-15 अंक)',
      farmerNameLength: 'शेतकरीचे नाव किमान 2 अक्षरे असावे',
      farmerUpdatedSuccess: 'शेतकरी यशस्वीरित्या अद्यतनित झाले!',
      failedToUpdate: 'शेतकरी अद्यतनित करण्यात अयशस्वी',
      networkUpdateError: 'शेतकरी अद्यतनित करताना नेटवर्क त्रुटी',
      numberAlreadyExists: 'फोन नंबर आधीच अस्तित्वात आहे',
      duplicateNumberError: 'हा फोन नंबर आधीच दुसऱ्या शेतकऱ्याकडे नोंदणीकृत आहे',
      success: 'यश',
      error: 'त्रुटी',
      ok: 'ठीक आहे'
    }
  };

  // Get current translations
  const t = translations[language] || translations.en;

  // Environment-aware API URLs
  const getApiUrl = (endpoint) => {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws';
    return `${baseUrl}${endpoint}`;
  };

  // Language detection from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'mr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Language change listener
  useEffect(() => {
    const checkLanguage = () => {
      const currentLang = localStorage.getItem('language') || 'en';
      if (currentLang !== language && (currentLang === 'en' || currentLang === 'mr')) {
        setLanguage(currentLang);
      }
    };

    const interval = setInterval(checkLanguage, 500);
    return () => clearInterval(interval);
  }, [language]);

  // Flash message system
  const showMessage = (text, type = 'info', duration = 5000) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, duration);
  };

  // Popup system
  const showPopupMessage = (title, message, type = 'info') => {
    setPopupData({ title, message, type });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupData({ title: '', message: '', type: '' });
  };

  // Check for duplicate phone number
  const checkDuplicateNumber = (phoneNumber, excludeId = null) => {
    return farmers.some(farmer => 
      farmer.farmer_number === phoneNumber && farmer._id !== excludeId
    );
  };

  // Fetch all farmers from the API
  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl('/api/farmer/all'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Sort farmers by name for better UX
          const sortedFarmers = (data.data || []).sort((a, b) => 
            (a.farmer_name || a.name || '').localeCompare(b.farmer_name || b.name || '')
          );
          setFarmers(sortedFarmers);
          showMessage(`✅ ${t.loadedFarmers}: ${sortedFarmers.length}`, 'success', 3000);
        } else {
          setFarmers([]);
          showMessage(data.message || t.failedToFetch, 'error');
        }
      } catch (error) {
        console.error('Fetch farmers error:', error);
        setFarmers([]);
        showMessage(t.networkError, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [language]);

  // Open the modal to edit farmer details
  const openModal = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      farmer_number: farmer.farmer_number || '',
      farmer_name: farmer.farmer_name || farmer.name || ''
    });
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
    setFormData({
      farmer_number: '',
      farmer_name: ''
    });
    setMessage({ text: '', type: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission to update farmer details
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.farmer_number.trim() && !formData.farmer_name.trim()) {
      showMessage(t.provideAtLeastOne, 'error');
      return;
    }

    if (formData.farmer_number.trim() && !/^\d{10,15}$/.test(formData.farmer_number.trim())) {
      showMessage(t.validPhoneNumber, 'error');
      return;
    }

    if (formData.farmer_name.trim() && formData.farmer_name.trim().length < 2) {
      showMessage(t.farmerNameLength, 'error');
      return;
    }

    // Check for duplicate phone number
    if (formData.farmer_number.trim() && 
        checkDuplicateNumber(formData.farmer_number.trim(), selectedFarmer._id)) {
      showPopupMessage(
        t.error,
        t.duplicateNumberError,
        'error'
      );
      return;
    }

    setUpdating(true);

    // Only send fields that have values
    const updatedFarmer = {};
    if (formData.farmer_number.trim()) {
      updatedFarmer.farmer_number = formData.farmer_number.trim();
    }
    if (formData.farmer_name.trim()) {
      updatedFarmer.farmer_name = formData.farmer_name.trim();
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(getApiUrl(`/api/farmer/update/${selectedFarmer._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFarmer)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the farmers list in the UI
        setFarmers(prevFarmers => 
          prevFarmers.map(farmer => 
            farmer._id === selectedFarmer._id 
              ? { ...farmer, ...updatedFarmer }
              : farmer
          )
        );
        
        // Show success popup
        showPopupMessage(
          t.success,
          t.farmerUpdatedSuccess,
          'success'
        );
        
        closeModal();
        
      } else {
        console.error('Update failed:', data);
        if (data.message && data.message.includes('duplicate')) {
          showPopupMessage(
            t.error,
            t.duplicateNumberError,
            'error'
          );
        } else {
          showMessage(data.message || t.failedToUpdate, 'error');
        }
      }
    } catch (error) {
      console.error('Update farmer error:', error);
      showMessage(t.networkUpdateError, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Filter farmers based on search term
  const filteredFarmers = farmers.filter(farmer =>
    (farmer.farmer_name || farmer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farmer.farmer_number || '').includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFarmers = filteredFarmers.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {t.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {t.subtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Flash Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-md border-l-4 animate-slideIn ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : message.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-center">
              <span className="font-medium">{message.text}</span>
              <button 
                onClick={() => setMessage({ text: '', type: '' })}
                className="ml-auto text-xl font-bold hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search and Stats Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                📊 {t.total}: {farmers.length}
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                🔍 {t.found}: {filteredFarmers.length}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">{t.loading}</p>
          </div>
        ) : (
          <>
            {/* Farmers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">{t.farmerName}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t.phoneNumber}</th>
                      <th className="px-6 py-4 text-center font-semibold">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedFarmers.length > 0 ? (
                      paginatedFarmers.map((farmer, index) => (
                        <tr 
                          key={farmer._id} 
                          className={`hover:bg-blue-50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {(farmer.farmer_name || farmer.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {farmer.farmer_name || farmer.name || 'Unknown'}
                                </div>
                                <div className="text-gray-500 text-sm">ID: {farmer._id?.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="font-mono text-gray-700">
                                {farmer.farmer_number || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openModal(farmer)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              {t.edit}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                            <p className="text-xl font-semibold mb-2">{t.noFarmersFound}</p>
                            <p className="text-gray-500">
                              {searchTerm ? t.tryAdjusting : t.noFarmersAvailable}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {t.showing} {startIndex + 1} {t.to} {Math.min(startIndex + itemsPerPage, filteredFarmers.length)} {t.of} {filteredFarmers.length} {t.results}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.previous}
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.next}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideIn">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t.updateFarmerDetails}
                </h2>
                <p className="text-blue-100 text-sm mt-1">{t.modifyInfo}</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="farmer_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneNumberLabel}
                  </label>
                  <input
                    type="tel"
                    id="farmer_number"
                    name="farmer_number"
                    value={formData.farmer_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                    placeholder={t.phoneNumberPlaceholder}
                    pattern="[0-9]{10,15}"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.phoneNumberFormat}</p>
                </div>

                <div>
                  <label htmlFor="farmer_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    id="farmer_name"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                    placeholder={t.fullNamePlaceholder}
                    minLength="2"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.fullNameFormat}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    💡 <strong>{t.note}</strong>
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={updating}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        {t.updating}
                      </>
                    ) : (
                      t.updateFarmer
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success/Error Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all animate-slideIn">
              <div className={`px-6 py-4 rounded-t-2xl ${
                popupData.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              } text-white`}>
                <h3 className="text-lg font-bold flex items-center">
                  {popupData.type === 'success' ? (
                    <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {popupData.title}
                </h3>
              </div>
              
              <div className="p-6 text-center">
                <p className="text-gray-700 mb-6">{popupData.message}</p>
                <button
                  onClick={closePopup}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                    popupData.type === 'success' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {t.ok}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UpdateFarmerPage;
