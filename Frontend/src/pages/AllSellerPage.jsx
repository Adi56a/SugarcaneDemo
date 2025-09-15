import React, { useState, useEffect, useRef } from 'react';
import SellerBuyingBill from '../components/SellerBuyingBill';
import Header from '../components/Header';
import * as htmlToImage from 'html-to-image';

const AllSellerPage = () => {
  const [sellerData, setSellerData] = useState({
    seller_number: '',
    seller_name: '',
    bills: []
  });
  const [sellersList, setSellersList] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [billToPrint, setBillToPrint] = useState(null);
  const [language, setLanguage] = useState('en');
  const [imageGenerating, setImageGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  const imagePreviewRef = useRef(null);
  const printRef = useRef(null);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

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
    const fetchSellers = async () => {
      setLoading(true);
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
        const data = await response.json();
        
        if (response.ok && data.success) {
          setSellersList(data.data || []);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch sellers');
        }
      } catch (error) {
        setError('An error occurred while fetching the sellers.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  useEffect(() => {
    const selectedSellerNumber = localStorage.getItem('selectedSellerNumber');
    const selectedSellerName = localStorage.getItem('selectedSellerName');
    
    if (selectedSellerNumber && selectedSellerName && sellersList.length > 0) {
      const seller = sellersList.find(s => 
        s.seller_number?.toString() === selectedSellerNumber.toString()
      );
      
      if (seller) {
        selectSeller(seller);
        showFlashMessage(`✅ Showing bills for: ${selectedSellerName}`, 'success', 3000);
      } else {
        setSellerData({
          seller_number: selectedSellerNumber,
          seller_name: selectedSellerName,
          bills: []
        });
        
        const sellerByName = sellersList.find(s => 
          s.seller_name?.toLowerCase() === selectedSellerName.toLowerCase()
        );
        
        if (sellerByName) {
          selectSeller(sellerByName);
        }
      }
      localStorage.removeItem('selectedSellerNumber');
      localStorage.removeItem('selectedSellerName');
    }
  }, [sellersList]);

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

  const handleSellerNumberChange = (e) => {
    const { value } = e.target;
    
    setSellerData((prev) => ({
      ...prev,
      seller_number: value,
      seller_name: '',
      bills: []
    }));

    setSelectedSellerId(null);
    setError(null);

    if (value.length >= 1 && sellersList.length > 0) {
      const filtered = sellersList.filter(seller => 
        seller.seller_number?.toString().includes(value) ||
        seller.seller_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSellers(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSellers([]);
      setShowSuggestions(false);
    }

    const exactMatch = sellersList.find(seller => 
      seller.seller_number?.toString() === value
    );
    
    if (exactMatch) {
      selectSeller(exactMatch);
    }
  };

  const selectSeller = (seller) => {
    setSellerData({
      seller_number: seller.seller_number || '',
      seller_name: seller.seller_name || seller.name || '',
      bills: []
    });
    setSelectedSellerId(seller._id);
    setShowSuggestions(false);
    setError(null);
  };

  useEffect(() => {
    if (selectedSellerId) {
      const fetchBills = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('authToken');
          const baseUrl = process.env.NODE_ENV === 'development' 
            ? `http://localhost:5000/api/seller/${selectedSellerId}` 
            : `https://sugarcanebillingsoftware.onrender.com/api/seller/${selectedSellerId}`;

          const response = await fetch(baseUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();

          if (response.ok && data.success) {
            const sellerInfo = data.seller;
            
            const sortedBills = (sellerInfo.bills || []).sort((a, b) => {
              const dateA = new Date(a.createdAt || a.updatedAt || 0);
              const dateB = new Date(b.createdAt || b.updatedAt || 0);
              return dateB - dateA;
            });

            setSellerData((prev) => ({
              ...prev,
              seller_name: sellerInfo.name || sellerInfo.seller_name || prev.seller_name,
              seller_number: sellerInfo.seller_number || prev.seller_number,
              bills: sortedBills
            }));
            setError(null);
          } else {
            setError(data.message || 'Failed to fetch seller bills');
          }
        } catch (error) {
          setError('An error occurred while fetching the seller bills.');
        } finally {
          setLoading(false);
        }
      };

      fetchBills();
    }
  }, [selectedSellerId]);

  const prepareWeightDataForBill = (bill) => {
    const filledWeight = parseFloat(bill.filled_vehicle_weight) || 0;
    const emptyWeight = parseFloat(bill.empty_vehicle_weight) || 0;
    const bindingMaterial = parseFloat(bill.binding_material) || 0;
    const netWeight = parseFloat(bill.only_sugarcane_weight) || 0;

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

  const generateImageFromBill = async (bill) => {
    try {
      setImageGenerating(true);
      showFlashMessage('🔄 Generating bill image...', 'info', 2000);

      setShowImagePreview(true);
      setBillToPrint(bill);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!imagePreviewRef.current) {
        throw new Error('Image preview element not found');
      }

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

      setShowImagePreview(false);
      setBillToPrint(null);

      return dataUrl;

    } catch (error) {
      setShowImagePreview(false);
      setBillToPrint(null);
      showFlashMessage('❌ Failed to generate image', 'error');
      throw error;
    } finally {
      setImageGenerating(false);
    }
  };

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

  const uploadImageToCloudinary = async (imageBlob, fileName) => {
    try {
      const formData = new FormData();
      formData.append('pdf', imageBlob, fileName);

      const token = localStorage.getItem('authToken');
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/upload' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/upload';

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
      throw error;
    }
  };

  const formatPhoneForWhatsApp = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    
    if (cleanNumber.startsWith('91')) {
      return cleanNumber;
    }
    
    if (cleanNumber.length === 10) {
      return '91' + cleanNumber;
    }
    
    if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      return '91' + cleanNumber.substring(1);
    }
    
    return cleanNumber;
  };

  const handleWhatsAppShare = async (bill) => {
    try {
      setImageGenerating(true);
      showFlashMessage('🔄 Preparing bill for WhatsApp...', 'info');

      const imageDataUrl = await generateImageFromBill(bill);
      const imageBlob = dataURLToBlob(imageDataUrl);
      const fileName = `seller_bill_${sellerData.seller_name.replace(/\s+/g, '_')}_${new Date(bill.createdAt).toLocaleDateString('en-IN').replace(/\//g, '-')}.png`;
      
      showFlashMessage('☁️ Uploading image...', 'info');
      const imageUrl = await uploadImageToCloudinary(imageBlob, fileName);

      const formattedPhone = formatPhoneForWhatsApp(sellerData.seller_number);

      const message = `🧾 *Seller Bill Details*

📅 Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}
🏪 Seller: ${sellerData.seller_name}
📱 Mobile: ${sellerData.seller_number}
🚛 Driver: ${bill.driver_name}
🚗 Vehicle: ${bill.vehicle_type}
🌾 Quality: ${bill.sugarcane_quality}
⚖️ Weight: ${bill.only_sugarcane_weight} kg
💰 Rate: ₹${bill.sugarcane_rate}/kg
💵 Total: ₹${bill.totalBill}
💳 Advance: ₹${bill.taken_money}
📊 Remaining: ₹${bill.remaining_money}
💸 Payment: ${bill.payment_type}

📄 *View Bill Image:*
${imageUrl}

Thank you for your business! 🙏`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      
      showFlashMessage('✅ Image ready! Opening WhatsApp...', 'success');
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        const whatsappAppUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
        window.location.href = whatsappAppUrl;
        
        setTimeout(() => {
          if (!document.hidden) {
            window.open(whatsappUrl, '_blank');
          }
        }, 2000);
      } else {
        window.open(whatsappUrl, '_blank');
      }

    } catch (error) {
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
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/sellerbill/delete' 
        : 'https://sugarcanebillingsoftware.onrender.com/api/sellerbill/delete';

      const response = await fetch(`${baseUrl}/${billId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showFlashMessage('✅ Bill deleted successfully!', 'success');
        const updatedBills = sellerData.bills.filter(bill => bill._id !== billId);
        setSellerData(prev => ({ ...prev, bills: updatedBills }));
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

  const handlePrintBill = (bill) => {
    setBillToPrint(bill);
    setShowPrintPreview(true);
    
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.focus();
      }
      window.print();
    }, 1500);
  };

  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setBillToPrint(null);
  };

  const displayBills = () => {
    if (!selectedSellerId) {
      return <p className="text-gray-500 mt-4">Please select a seller to view bills.</p>;
    }

    if (loading) {
      return (
        <div className="text-center mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-purple-500">Loading bills...</p>
        </div>
      );
    }

    if (sellerData.bills.length === 0) {
      return <p className="text-gray-500 mt-4">No bills found for this seller.</p>;
    }

    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Bill History ({sellerData.bills.length} bills) - <span className="text-sm text-green-600">Most Recent First</span>
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
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Advance (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Remaining (₹)</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {sellerData.bills.map((bill, index) => {
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
                    <td className="border border-gray-300 px-2 py-3">
                      <div className="flex flex-wrap gap-1">
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
                      ₹{bill.taken_money || 0}
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

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 text-purple-800">Bill Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Total Bills</p>
              <p className="text-xl font-bold text-purple-600">{sellerData.bills.length}</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Recent Bills (7 days)</p>
              <p className="text-xl font-bold text-green-600">
                {sellerData.bills.filter(bill => {
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
                ₹{sellerData.bills.reduce((sum, bill) => sum + parseFloat(bill.totalBill || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <p className="text-sm text-gray-600">Total Remaining</p>
              <p className="text-xl font-bold text-red-600">
                ₹{sellerData.bills.reduce((sum, bill) => sum + parseFloat(bill.remaining_money || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Seller Bill History"
        subtitle="Manage and track all seller transactions"
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="max-w-7xl mx-auto p-6">
        {flashMessages.slice(0, 2).map((msg) => (
          <FlashMessage 
            key={msg.id} 
            message={msg} 
            type={msg.type}
            onClose={removeFlashMessage} 
            position="top"
          />
        ))}

        {showImagePreview && billToPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b bg-purple-600 text-white rounded-t-lg">
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
                <SellerBuyingBill
                  language={language}
                  date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                  sellerName={sellerData.seller_name}
                  sellerNumber={sellerData.seller_number}
                  sugarcaneQuality={billToPrint.sugarcane_quality}
                  vehicleType={billToPrint.vehicle_type}
                  driverName={billToPrint.driver_name}
                  cutter={billToPrint.cutter}
                  sugarcaneRate={billToPrint.sugarcane_rate}
                  weightData={prepareWeightDataForBill(billToPrint)}
                  totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
                  advanceAmount={billToPrint.taken_money}
                  remainingAmount={billToPrint.remaining_money}
                  paymentType={billToPrint.payment_type}
                />
              </div>
            </div>
          </div>
        )}

        {showPrintPreview && billToPrint && (
          <div 
            ref={printRef}
            className="print-content"
            style={{ 
              position: 'fixed',
              left: '-9999px',
              top: '0',
              width: '210mm',
              height: '297mm',
              backgroundColor: 'white',
              padding: '10mm',
              boxSizing: 'border-box',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            <SellerBuyingBill
              language={language}
              date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
              sellerName={sellerData.seller_name}
              sellerNumber={sellerData.seller_number}
              sugarcaneQuality={billToPrint.sugarcane_quality}
              vehicleType={billToPrint.vehicle_type}
              driverName={billToPrint.driver_name}
              cutter={billToPrint.cutter}
              sugarcaneRate={billToPrint.sugarcane_rate}
              weightData={prepareWeightDataForBill(billToPrint)}
              totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
              advanceAmount={billToPrint.taken_money}
              remainingAmount={billToPrint.remaining_money}
              paymentType={billToPrint.payment_type}
            />
          </div>
        )}

        {showPrintPreview && billToPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bill Print Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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
                <SellerBuyingBill
                  language={language}
                  date={billToPrint.createdAt ? new Date(billToPrint.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                  sellerName={sellerData.seller_name}
                  sellerNumber={sellerData.seller_number}
                  sugarcaneQuality={billToPrint.sugarcane_quality}
                  vehicleType={billToPrint.vehicle_type}
                  driverName={billToPrint.driver_name}
                  cutter={billToPrint.cutter}
                  sugarcaneRate={billToPrint.sugarcane_rate}
                  weightData={prepareWeightDataForBill(billToPrint)}
                  totalBill={parseFloat(billToPrint.totalBill || 0).toFixed(2)}
                  advanceAmount={billToPrint.taken_money}
                  remainingAmount={billToPrint.remaining_money}
                  paymentType={billToPrint.payment_type}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 no-print">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Seller Bill History
          </h2>

          {loading && (
            <div className="text-center mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-purple-500">Loading...</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col relative">
              <label htmlFor="seller_number" className="text-lg font-semibold text-gray-700 mb-2">
                Seller's Mobile Number:
              </label>
              <input
                type="text"
                id="seller_number"
                name="seller_number"
                value={sellerData.seller_number}
                onChange={handleSellerNumberChange}
                placeholder="Enter seller's mobile number"
                className="p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                required
              />
              
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                  {filteredSellers.length > 0 ? (
                    <>
                      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
                        Found {filteredSellers.length} sellers
                      </div>
                      {filteredSellers.map((seller) => (
                        <div
                          key={seller._id}
                          className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 transition-colors duration-200 last:border-b-0"
                          onClick={() => selectSeller(seller)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {seller.seller_name || seller.name || 'No Name'}
                              </div>
                              <div className="text-sm text-gray-600">
                                📱 {seller.seller_number || 'No Mobile'}
                              </div>
                            </div>
                            <div className="text-xs text-purple-500 px-2 py-1 bg-purple-100 rounded">
                              Click to select
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-3 text-gray-500 text-center">
                      No sellers found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="seller_name" className="text-lg font-semibold text-gray-700 mb-2">
                Seller's Name:
              </label>
              <input
                type="text"
                id="seller_name"
                name="seller_name"
                value={sellerData.seller_name}
                readOnly
                placeholder="Name will appear when seller is selected"
                className="p-4 border-2 border-gray-300 rounded-xl bg-gray-100 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {selectedSellerId && !error && !loading && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <strong>Seller Selected:</strong> {sellerData.seller_name} ({sellerData.seller_number})
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 no-print">
          {displayBills()}
        </div>

        <style jsx global>{`
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

          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-content {
              position: static !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              display: block !important;
              visibility: visible !important;
            }

            .print-content * {
              visibility: visible !important;
            }

            .print-content .max-w-\\[830px\\] {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 15px !important;
              box-sizing: border-box !important;
            }

            .print-content table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 10px 0 !important;
            }

            .print-content .grid {
              display: grid !important;
              width: 100% !important;
            }

            .print-content .grid-cols-2 {
              grid-template-columns: 1fr 1fr !important;
              gap: 15px !important;
            }

            .print-content .grid-cols-3 {
              grid-template-columns: 1fr 1fr 1fr !important;
              gap: 15px !important;
            }

            .print-content .flex {
              display: flex !important;
            }

            .print-content .justify-between {
              justify-content: space-between !important;
            }

            .print-content .text-center {
              text-align: center !important;
            }

            .print-content .mb-3 {
              margin-bottom: 15px !important;
            }

            .print-content .p-2 {
              padding: 8px !important;
            }

            .print-content .p-3 {
              padding: 12px !important;
            }

            html, body {
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AllSellerPage;
