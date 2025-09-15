import React, { useState, useEffect, useRef } from 'react';
import FarmerBuyingBill from '../components/FarmerBuyingBill'; // Import the bill component
import * as htmlToImage from 'html-to-image';

const AllFarmerPage = () => {
  const [farmerData, setFarmerData] = useState({
    farmer_number: '',
    farmer_name: '',
    bills: []
  });
  const [farmersList, setFarmersList] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [billToPrint, setBillToPrint] = useState(null);
  const [language, setLanguage] = useState('en');
  const [imageGenerating, setImageGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Ref for image generation
  const imagePreviewRef = useRef(null);

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

  // Fetch all farmers when the component mounts
  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
    try {
    const token = localStorage.getItem('authToken');

    // Check the environment and set the appropriate URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/farmer/all' 
      : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/farmer/all'; // Replace with your production URL

    const response = await fetch(baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setFarmersList(data.data || []);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch farmers');
        }
      } catch (error) {
        console.error('Fetch farmers error:', error);
        setError('An error occurred while fetching the farmers.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  // FIXED: Auto-select farmer if coming from bill creation
  useEffect(() => {
    const selectedFarmerNumber = localStorage.getItem('selectedFarmerNumber');
    const selectedFarmerName = localStorage.getItem('selectedFarmerName');
    
    if (selectedFarmerNumber && selectedFarmerName && farmersList.length > 0) {
      console.log('Auto-selecting farmer:', { selectedFarmerNumber, selectedFarmerName });
      
      // Find farmer by number
      const farmer = farmersList.find(f => 
        f.farmer_number?.toString() === selectedFarmerNumber.toString()
      );
      
      if (farmer) {
        console.log('Found farmer for auto-selection:', farmer);
        selectFarmer(farmer);
        
        // Clean up localStorage
        localStorage.removeItem('selectedFarmerNumber');
        localStorage.removeItem('selectedFarmerName');
        
        showFlashMessage(`✅ Showing bills for: ${selectedFarmerName}`, 'success', 3000);
      } else {
        console.log('Farmer not found in list for auto-selection');
        
        // If farmer not found, still set the data manually
        setFarmerData({
          farmer_number: selectedFarmerNumber,
          farmer_name: selectedFarmerName,
          bills: []
        });
        
        // Try to find by name as fallback
        const farmerByName = farmersList.find(f => 
          f.farmer_name?.toLowerCase() === selectedFarmerName.toLowerCase()
        );
        
        if (farmerByName) {
          selectFarmer(farmerByName);
        }
        
        localStorage.removeItem('selectedFarmerNumber');
        localStorage.removeItem('selectedFarmerName');
      }
    }
  }, [farmersList]); // This will run when farmersList is populated

  // Flash message system with unique IDs
  const showFlashMessage = (message, type, duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = { id, message, type };
    
    setFlashMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      setFlashMessages(prev => prev.filter(msg => msg.id !== id));
    }, duration);
  };

  const removeFlashMessage = (id) => {
    setFlashMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // Handler for changes in the farmer number
  const handleFarmerNumberChange = (e) => {
    const { value } = e.target;
    
    setFarmerData((prev) => ({
      ...prev,
      farmer_number: value,
      farmer_name: '',
      bills: []
    }));

    setSelectedFarmerId(null);
    setError(null);

    if (value.length >= 1 && farmersList.length > 0) {
      const filtered = farmersList.filter(farmer => 
        farmer.farmer_number?.toString().includes(value) ||
        farmer.farmer_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFarmers(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredFarmers([]);
      setShowSuggestions(false);
    }

    const exactMatch = farmersList.find(farmer => 
      farmer.farmer_number?.toString() === value
    );
    
    if (exactMatch) {
      selectFarmer(exactMatch);
    }
  };

  // Function to select a farmer
  const selectFarmer = (farmer) => {
    console.log('Selecting farmer:', farmer);
    setFarmerData({
      farmer_number: farmer.farmer_number || '',
      farmer_name: farmer.farmer_name || farmer.name || '', // Try both field names
      bills: []
    });
    setSelectedFarmerId(farmer._id);
    setShowSuggestions(false);
    setError(null);
  };

  // Fetch and display bills for the selected farmer
  useEffect(() => {
    if (selectedFarmerId) {
      const fetchBills = async () => {
        setLoading(true);
        try {
    const token = localStorage.getItem('authToken');

    // Check the environment and set the appropriate URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:5000/api/farmer/${selectedFarmerId}` 
      : `https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/farmer/${selectedFarmerId}`; // Replace with your production URL

    const response = await fetch(baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
          const data = await response.json();

          if (response.ok && data.success) {
            const farmerInfo = data.farmer;
            
            const sortedBills = (farmerInfo.bills || []).sort((a, b) => {
              const dateA = new Date(a.createdAt || a.updatedAt || 0);
              const dateB = new Date(b.createdAt || b.updatedAt || 0);
              return dateB - dateA;
            });

            setFarmerData((prev) => ({
              ...prev,
              farmer_name: farmerInfo.name || farmerInfo.farmer_name || prev.farmer_name,
              farmer_number: farmerInfo.farmer_number || prev.farmer_number,
              bills: sortedBills
            }));
            setError(null);
          } else {
            setError(data.message || 'Failed to fetch farmer bills');
          }
        } catch (error) {
          console.error('Fetch bills error:', error);
          setError('An error occurred while fetching the farmer bills.');
        } finally {
          setLoading(false);
        }
      };

      fetchBills();
    }
  }, [selectedFarmerId]);

  // Prepare weight data for bill printing
  const prepareWeightDataForBill = (bill) => {
    const filledWeight = parseFloat(bill.filled_vehicle_weight) || 0;
    const emptyWeight = parseFloat(bill.empty_vehicle_weight) || 0;
    const bindingMaterial = parseFloat(bill.binding_material) || 0;
    const netWeight = parseFloat(bill.only_sugarcane_weight) || 0;

    // Convert kg to tons (divide by 1000)
    const second_cloumn = [
      (filledWeight / 1000).toFixed(3),
      (emptyWeight / 1000).toFixed(3),
      ((filledWeight - emptyWeight) / 1000).toFixed(3),
      (bindingMaterial / 1000).toFixed(3),
      (netWeight / 1000).toFixed(3)
    ];

    const thrid_column = [
      filledWeight.toFixed(2),
      emptyWeight.toFixed(2),
      (filledWeight - emptyWeight).toFixed(2),
      bindingMaterial.toFixed(2),
      netWeight.toFixed(2)
    ];

    return { second_cloumn, thrid_column };
  };

  // Generate Image from Bill Component 
  const generateImageFromBill = async (bill) => {
    try {
      setImageGenerating(true);
      showFlashMessage('🔄 Generating bill image...', 'info', 2000);

      // Show image preview for rendering in a VISIBLE modal
      setShowImagePreview(true);
      setBillToPrint(bill);

      // Wait for the component to render properly
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!imagePreviewRef.current) {
        throw new Error('Image preview element not found');
      }

      // Enhanced html-to-image options for better quality
      const dataUrl = await htmlToImage.toPng(imagePreviewRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: imagePreviewRef.current.scrollWidth,
        height: imagePreviewRef.current.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        backgroundColor: '#ffffff',
        cacheBust: true,
        useCORS: true
      });

      // Hide image preview
      setShowImagePreview(false);
      setBillToPrint(null);

      return dataUrl;

    } catch (error) {
      console.error('Image generation error:', error);
      setShowImagePreview(false);
      setBillToPrint(null);
      showFlashMessage('❌ Failed to generate image', 'error');
      throw error;
    } finally {
      setImageGenerating(false);
    }
  };

  // Convert DataURL to Blob
  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Upload Image to backend and get Cloudinary URL
  const uploadImageToCloudinary = async (imageBlob, fileName) => {
    try {
      const formData = new FormData();
      formData.append('pdf', imageBlob, fileName);

      const token = localStorage.getItem('authToken');

      // Check the environment and set the appropriate URL
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/upload' 
        : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/upload'; // Replace with the production URL

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.url;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // FIXED: Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    
    // If number starts with 91, use as is
    if (cleanNumber.startsWith('91')) {
      return cleanNumber;
    }
    
    // If number is 10 digits, add India country code
    if (cleanNumber.length === 10) {
      return '91' + cleanNumber;
    }
    
    // If number is 11 digits and starts with 0, remove 0 and add 91
    if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      return '91' + cleanNumber.substring(1);
    }
    
    // Return as is for other cases
    return cleanNumber;
  };

  // RESTORED: Enhanced WhatsApp share with direct mobile app opening
  const handleWhatsAppShare = async (bill) => {
    try {
      setImageGenerating(true);
      showFlashMessage('🔄 Preparing bill for WhatsApp...', 'info');

      // Generate Image
      const imageDataUrl = await generateImageFromBill(bill);
      
      // Convert to blob
      const imageBlob = dataURLToBlob(imageDataUrl);
      
      // Create filename
      const fileName = `bill_${farmerData.farmer_name.replace(/\s+/g, '_')}_${new Date(bill.createdAt).toLocaleDateString('en-IN').replace(/\//g, '-')}.png`;
      
      // Upload to Cloudinary
      showFlashMessage('☁️ Uploading image...', 'info');
      const imageUrl = await uploadImageToCloudinary(imageBlob, fileName);

      // Format phone number for WhatsApp
      const formattedPhone = formatPhoneForWhatsApp(farmerData.farmer_number);
      console.log('Original phone:', farmerData.farmer_number, 'Formatted phone:', formattedPhone);

      // Create WhatsApp message with Image URL
      const message = `🧾 *Farmer Bill Details*

📅 Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}
👨‍🌾 Farmer: ${farmerData.farmer_name}
📱 Mobile: ${farmerData.farmer_number}
🚛 Driver: ${bill.driver_name}
🚗 Vehicle: ${bill.vehicle_type}
🌾 Quality: ${bill.sugarcane_quality}
⚖️ Weight: ${bill.only_sugarcane_weight} kg
💰 Rate: ₹${bill.sugarcane_rate}/kg
💵 Total: ₹${bill.totalBill}
💳 Given: ₹${bill.given_money}
📊 Remaining: ₹${bill.remaining_money}
💸 Payment: ${bill.payment_type}

📄 *View Bill Image:*
${imageUrl}

Thank you for your business! 🙏`;

      const encodedMessage = encodeURIComponent(message);
      
      // FIXED: Direct WhatsApp app opening for mobile devices
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      
      console.log('WhatsApp URL:', whatsappUrl);
      
      showFlashMessage('✅ Image ready! Opening WhatsApp...', 'success');
      
      // FIXED: Direct app opening logic for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile devices - try direct app opening first
        const whatsappAppUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
        
        // Try to open WhatsApp app directly
        window.location.href = whatsappAppUrl;
        
        // Fallback to web version after a short delay if app doesn't open
        setTimeout(() => {
          if (!document.hidden) {
            // If still on the page, open web version
            window.open(whatsappUrl, '_blank');
          }
        }, 2000);
      } else {
        // For desktop - open web WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
      }

    } catch (error) {
      console.error('WhatsApp share error:', error);
      showFlashMessage('❌ Failed to prepare bill for WhatsApp', 'error');
    } finally {
      setImageGenerating(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return;
    }

    try {
    const token = localStorage.getItem('authToken');

    // Check the environment and set the appropriate URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/bill/delete' 
      : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/bill/delete'; // Replace with your production URL

    const response = await fetch(`${baseUrl}/${billId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

      if (response.ok) {
        showFlashMessage('✅ Bill deleted successfully!', 'success');
        const updatedBills = farmerData.bills.filter(bill => bill._id !== billId);
        setFarmerData(prev => ({ ...prev, bills: updatedBills }));
      } else {
        const errorData = await response.json();
        showFlashMessage(`❌ Failed to delete bill: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showFlashMessage('❌ Network error while deleting bill', 'error');
    }
  };

  const handleUpdateBill = (billId) => {
    showFlashMessage('🔄 Update functionality coming soon!', 'info');
  };

  // Fixed Print Bill Function
  const handlePrintBill = (bill) => {
    setBillToPrint(bill);
    setShowPrintPreview(true);
    
    // Delay to ensure the component renders, then print
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Close print preview
  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setBillToPrint(null);
  };

  // Display the farmer's bill history
  const displayBills = () => {
    if (!selectedFarmerId) {
      return <p className="text-gray-500 mt-4">Please select a farmer to view bills.</p>;
    }

    if (loading) {
      return (
        <div className="text-center mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-blue-500">Loading bills...</p>
        </div>
      );
    }

    if (farmerData.bills.length === 0) {
      return <p className="text-gray-500 mt-4">No bills found for this farmer.</p>;
    }

    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Bill History ({farmerData.bills.length} bills) - <span className="text-sm text-green-600">Most Recent First</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold min-w-[160px]">Actions</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Date
                  <span className="text-xs text-green-500 ml-1">(Recent First)</span>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Driver Name</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Vehicle Type</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Sugarcane Quality</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Weight (kg)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Rate (₹/kg)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Total (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Given (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Remaining (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {farmerData.bills.map((bill, index) => {
                const billDate = new Date(bill.createdAt || bill.updatedAt);
                const now = new Date();
                const daysDiff = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));
                const isRecent = daysDiff <= 7;
                
                return (
                  <tr 
                    key={bill._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isRecent ? 'bg-green-50 border-l-4 border-l-green-400' : ''
                    }`}
                  >
                    {/* Actions Column */}
                    <td className="border border-gray-300 px-2 py-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Enhanced WhatsApp Button with Image */}
                        <button
                          onClick={() => handleWhatsAppShare(bill)}
                          disabled={imageGenerating}
                          className={`${
                            imageGenerating 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors`}
                          title="Send Image on WhatsApp"
                        >
                          {imageGenerating ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                          )}
                          {imageGenerating ? 'Generating...' : 'WhatsApp IMG'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteBill(bill._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          title="Delete Bill"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </button>

                        {/* Update Button */}
                        <button
                          onClick={() => handleUpdateBill(bill._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          title="Update Bill"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="m18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Update
                        </button>

                        {/* Enhanced Print Button */}
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                          title="Print Professional Bill"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <polyline points="6,9 6,2 18,2 18,9"/>
                            <path d="M6,18H4a2 2 0 01-2-2v-5a2 2 0 012-2H20a2 2 0 012,2v5a2 2 0 01-2,2H18"/>
                            <rect x="6" y="14" width="12" height="8"/>
                          </svg>
                          Print
                        </button>
                      </div>
                    </td>

                    {/* Rest of the table columns remain the same */}
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {bill.createdAt 
                            ? new Date(bill.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric'
                              })
                            : 'N/A'
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {bill.createdAt 
                            ? new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''
                          }
                        </span>
                        {isRecent && (
                          <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded-full mt-1 text-center">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Other Columns */}
                    <td className="border border-gray-300 px-4 py-3">
                      {bill.driver_name || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {bill.vehicle_type || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {bill.sugarcane_quality || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {bill.only_sugarcane_weight || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      ₹{bill.sugarcane_rate || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-600">
                      ₹{parseFloat(bill.totalBill || 0).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      ₹{bill.given_money || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-red-600">
                      ₹{bill.remaining_money || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {bill.payment_type || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      {/* Bill Summary */}
<div className="mt-6 p-4 bg-blue-50 rounded-lg">
  <h4 className="text-lg font-semibold mb-2 text-blue-800">Bill Summary</h4>
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600">Total Bills</p>
      <p className="text-xl font-bold text-blue-600">{farmerData.bills.length}</p>
    </div>
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600">Recent Bills (7 days)</p>
      <p className="text-xl font-bold text-green-600">
        {farmerData.bills.filter(bill => {
          const billDate = new Date(bill.createdAt || bill.updatedAt);
          const now = new Date();
          const daysDiff = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }).length}
      </p>
    </div>
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600">Total Amount</p>
      <p className="text-xl font-bold text-green-600">
        ₹{farmerData.bills.reduce((sum, bill) => sum + parseFloat(bill.totalBill || 0), 0).toFixed(2)}
      </p>
    </div>
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600">Total Remaining</p>
      <p className="text-xl font-bold text-red-600">
        ₹{farmerData.bills.reduce((sum, bill) => sum + parseFloat(bill.remaining_money || 0), 0).toFixed(2)}
      </p>
    </div>
    {/* NEW: Total Sugarcane Weight Section */}
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600">Total Sugarcane Weight</p>
      <p className="text-xl font-bold text-orange-600">
        {farmerData.bills.reduce((sum, bill) => sum + parseFloat(bill.only_sugarcane_weight || 0), 0).toFixed(2)} kg
      </p>
    </div>
  </div>
</div>
</div>
    );
  };

  // Flash Message Component
  const FlashMessage = ({ message, type, onClose, position }) => (
    <div className={`
      fixed ${position === 'top' ? 'top-4' : 'bottom-4'} left-1/2 transform -translate-x-1/2 
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Flash Messages with unique keys */}
      {flashMessages.slice(0, 2).map((msg) => (
        <FlashMessage 
          key={msg.id} 
          message={msg} 
          type={msg.type}
          onClose={removeFlashMessage} 
          position="top"
        />
      ))}

      {/* RESTORED: Visible Modal for Image Generation */}
      {showImagePreview && billToPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
              <h3 className="text-lg font-semibold flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating Bill Image...
              </h3>
            </div>
            <div 
              ref={imagePreviewRef} 
              className="p-6 max-w-full overflow-hidden"
              style={{ 
                minWidth: '800px',
                backgroundColor: 'white'
              }}
            >
              <FarmerBuyingBill
                language={language}
                date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                farmerName={farmerData.farmer_name}
                farmerNumber={farmerData.farmer_number}
                sugarcaneQuality={billToPrint.sugarcane_quality}
                sugarcaneRate={billToPrint.sugarcane_rate}
                vehicleType={billToPrint.vehicle_type}
                driverName={billToPrint.driver_name}
                cutter={billToPrint.cutter}
                weightData={prepareWeightDataForBill(billToPrint)}
                totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
                givenAmount={billToPrint.given_money}
                remainingAmount={billToPrint.remaining_money}
                paymentType={billToPrint.payment_type}
              />
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Print Content Container - No blank page issue */}
      {showPrintPreview && billToPrint && (
        <div className="print-container">
          <FarmerBuyingBill
            language={language}
            date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
            farmerName={farmerData.farmer_name}
            farmerNumber={farmerData.farmer_number}
            sugarcaneQuality={billToPrint.sugarcane_quality}
            sugarcaneRate={billToPrint.sugarcane_rate}
            vehicleType={billToPrint.vehicle_type}
            driverName={billToPrint.driver_name}
            cutter={billToPrint.cutter}
            weightData={prepareWeightDataForBill(billToPrint)}
            totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
            givenAmount={billToPrint.given_money}
            remainingAmount={billToPrint.remaining_money}
            paymentType={billToPrint.payment_type}
          />
        </div>
      )}

      {/* Print Preview Modal - This is just for preview */}
      {showPrintPreview && billToPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bill Print Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Print Now
                </button>
                <button
                  onClick={closePrintPreview}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
            <div className="p-4">
              <FarmerBuyingBill
                language={language}
                date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                farmerName={farmerData.farmer_name}
                farmerNumber={farmerData.farmer_number}
                sugarcaneQuality={billToPrint.sugarcane_quality}
                sugarcaneRate={billToPrint.sugarcane_rate}
                vehicleType={billToPrint.vehicle_type}
                driverName={billToPrint.driver_name}
                cutter={billToPrint.cutter}
                weightData={prepareWeightDataForBill(billToPrint)}
                totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
                givenAmount={billToPrint.given_money}
                remainingAmount={billToPrint.remaining_money}
                paymentType={billToPrint.payment_type}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 no-print">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Farmer Bill History
        </h2>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-blue-500">Loading...</p>
          </div>
        )}

        {/* Farmer Information */}
        <div className="space-y-6">
          {/* Farmer Number Input */}
          <div className="flex flex-col relative">
            <label htmlFor="farmer_number" className="text-lg font-semibold text-gray-700 mb-2">
              Farmer's Mobile Number:
            </label>
            <input
              type="text"
              id="farmer_number"
              name="farmer_number"
              value={farmerData.farmer_number}
              onChange={handleFarmerNumberChange}
              placeholder="Enter farmer's mobile number"
              className="p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
              required
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                {filteredFarmers.length > 0 ? (
                  <>
                    <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
                      Found {filteredFarmers.length} farmers
                    </div>
                    {filteredFarmers.map((farmer) => (
                      <div
                        key={farmer._id}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200 last:border-b-0"
                        onClick={() => selectFarmer(farmer)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {farmer.farmer_name || farmer.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-600">
                              📱 {farmer.farmer_number || 'No Mobile'}
                            </div>
                          </div>
                          <div className="text-xs text-blue-500 px-2 py-1 bg-blue-100 rounded">
                            Click to select
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    No farmers found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Farmer Name Input (Auto-filled) */}
          <div className="flex flex-col">
            <label htmlFor="farmer_name" className="text-lg font-semibold text-gray-700 mb-2">
              Farmer's Name:
            </label>
            <input
              type="text"
              id="farmer_name"
              name="farmer_name"
              value={farmerData.farmer_name}
              readOnly
              placeholder="Name will appear when farmer is selected"
              className="p-4 border-2 border-gray-300 rounded-xl bg-gray-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success Message when farmer is selected */}
        {selectedFarmerId && !error && !loading && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <strong>Farmer Selected:</strong> {farmerData.farmer_name} ({farmerData.farmer_number})
          </div>
        )}
      </div>

      {/* Display the Farmer's Bills */}
      <div className="bg-white shadow-lg rounded-lg p-6 no-print">
        {displayBills()}
      </div>

      {/* FIXED: Print Styles - No blank page + WhatsApp Restored */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        /* Print container - Hidden by default */
        .print-container {
          position: absolute;
          top: -9999px;
          left: 0;
          width: 21cm;
          background: white;
          padding: 0;
          margin: 0;
        }

        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          /* Hide everything except print content */
          body * {
            visibility: hidden;
          }
          
          /* Hide non-print elements completely */
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Show only print container */
          .print-container,
          .print-container * {
            visibility: visible !important;
          }
          
          /* Position print container properly */
          .print-container {
            position: static !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: avoid !important;
          }
          
          /* Ensure content fits in one page */
          .print-container > * {
            max-height: 100vh !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }
          
          html, body {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Prevent page breaks at the end */
          body:after {
            content: "";
            display: block;
            height: 0;
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllFarmerPage;
