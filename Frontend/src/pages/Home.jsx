import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLanguage, FaUsers, FaFileInvoice, FaUserPlus, FaUserEdit } from 'react-icons/fa';
import { MdSell, MdHistory, MdDashboard, MdPersonAdd, MdGroup, MdReceipt } from 'react-icons/md';
import { BsPerson, BsPersonCheck, BsReceipt } from 'react-icons/bs';
import Header from '../components/Header';

const Home = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [isLoaded, setIsLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem('language') || 'en';
      if (savedLanguage !== language) {
        setLanguage(savedLanguage);
      }
    };

    const interval = setInterval(handleLanguageChange, 500);
    return () => clearInterval(interval);
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'mr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const translations = {
    en: {
      welcome: 'Varad Gaggery factory',
      subtitle: 'Streamline your billing and farmer management processes',
      selectOption: 'Choose Your Action',
      
      // Farmer Activities
      farmerActivities: 'Farmer Activities',
      farmerActivitiesDesc: 'Manage all farmer-related operations',
      farmerBilling: 'Create Farmer Bill',
      farmerBillingDesc: 'Generate farmer buying bills and manage transactions',
      farmerRegister: 'Register Farmer',
      farmerRegisterDesc: 'Register new farmers in the system',
      allFarmers: 'All Farmers',
      allFarmersDesc: 'View and manage all registered farmers',
      updateFarmer: 'Update Farmer',
      updateFarmerDesc: 'Update farmer information and details',
      allFarmerList : "All Farmer List",
      allFarmerListDesc: "All Farmer List and Actions",
      
      // Seller Activities
      sellerActivities: 'Seller Activities',
      sellerActivitiesDesc: 'Manage all seller-related operations',
      sellerRegister: 'Register Seller',
      sellerRegisterDesc: 'Register new sellers in the system',
      allSellers: 'All Sellers',
      allSellersDesc: 'View and manage all registered sellers',
      sellerBilling: 'Create Seller Bill',
      sellerBillingDesc: 'Generate seller buying bills and manage transactions',
      
      sellingBilling: 'Selling Bills',
      sellingBillingDesc: 'Manage selling transactions and invoices',
      switchLanguage: 'Switch to Marathi',
      billing: 'Billing',
      management: 'Management',
      quickActions: 'Quick Actions'
    },
    mr: {
      welcome: 'वरद गुळ कारखाना',
      subtitle: 'आपले बिलिंग आणि शेतकरी व्यवस्थापन प्रक्रिया सुव्यवस्थित करा',
      selectOption: 'आपली कृती निवडा',
      
      // Farmer Activities
      farmerActivities: 'शेतकरी क्रियाकलाप',
      farmerActivitiesDesc: 'सर्व शेतकरी-संबंधित कामकाज व्यवस्थापित करा',
      farmerBilling: 'शेतकरी बिल तयार करा',
      farmerBillingDesc: 'शेतकरी खरेदी बिले तयार करा आणि व्यवहार व्यवस्थापित करा',
      farmerRegister: 'शेतकरी नोंदणी',
      farmerRegisterDesc: 'सिस्टममध्ये नवीन शेतकरी नोंदवा',
      allFarmers: 'सर्व शेतकरी',
      allFarmersDesc: 'सर्व नोंदणीकृत शेतकरी पहा आणि व्यवस्थापित करा',
      updateFarmer: 'शेतकरी अद्यतनित करा',
      updateFarmerDesc: 'शेतकरी माहिती आणि तपशील अद्यतनित करा',
      allFarmerList : "सर्व शेतकऱ्यांची यादी",
      allFarmerListDesc: "संपूर्ण शेतकऱ्यांची माहिती असलेली यादी.",

      
      // Seller Activities
      sellerActivities: 'विक्रेता क्रियाकलाप',
      sellerActivitiesDesc: 'सर्व विक्रेता-संबंधित कामकाज व्यवस्थापित करा',
      sellerRegister: 'विक्रेता नोंदणी',
      sellerRegisterDesc: 'सिस्टममध्ये नवीन विक्रेते नोंदवा',
      allSellers: 'सर्व विक्रेते',
      allSellersDesc: 'सर्व नोंदणीकृत विक्रेते पहा आणि व्यवस्थापित करा',
      sellerBilling: 'विक्रेता बिल तयार करा',
      sellerBillingDesc: 'विक्रेता खरेदी बिले तयार करा आणि व्यवहार व्यवस्थापित करा',
      
      sellingBilling: 'विक्री बिले',
      sellingBillingDesc: 'विक्री व्यवहार आणि बीजक व्यवस्थापित करा',
      switchLanguage: 'इंग्रजीमध्ये बदला',
      billing: 'बिलिंग',
      management: 'व्यवस्थापन',
      quickActions: 'त्वरित क्रिया'
    }
  };

  const t = translations[language];

  const farmerItems = [
    {
      title: t.farmerBilling,
      description: t.farmerBillingDesc,
      link: '/farmer_billing',
      IconComponent: FaFileInvoice,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      category: 'billing',
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t.farmerRegister,
      description: t.farmerRegisterDesc,
      link: '/farmer_register',
      IconComponent: FaUserPlus,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      category: 'management',
      accentColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t.allFarmers,
      description: t.allFarmersDesc,
      link: '/all_farmer',
      IconComponent: FaUsers,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      category: 'management',
      accentColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: t.updateFarmer,
      description: t.updateFarmerDesc,
      link: '/update_farmer',
      IconComponent: FaUserEdit,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      category: 'management',
      accentColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: t.allFarmerList,
      description: t.allFarmerListDesc,
      link: '/all_farmer_list',
      IconComponent: FaUserEdit,
      color: 'from-blue-300 to-blue-500',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      category: 'management',
      accentColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }

  ];

  const sellerItems = [
    {
      title: t.sellerBilling,
      description: t.sellerBillingDesc,
      link: '/sellerbill_creation',
      IconComponent: MdReceipt,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      category: 'billing',
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: t.sellerRegister,
      description: t.sellerRegisterDesc,
      link: '/register_seller',
      IconComponent: MdPersonAdd,
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      category: 'management',
      accentColor: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: t.allSellers,
      description: t.allSellersDesc,
      link: '/all_seller',
      IconComponent: MdGroup,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      category: 'management',
      accentColor: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
    title: 'Update Seller',
    description: 'Modify existing seller details',
    link: '/update_seller',
    IconComponent: FaUserEdit,
    color: 'from-yellow-500 to-yellow-600',
    hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
    category: 'management',
    accentColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  }
  ];

  const ActivitySection = ({ title, description, items, sectionColor, icon }) => (
    <div className="mb-16">
      <div className={`text-center mb-8 p-6 rounded-3xl bg-gradient-to-r ${sectionColor} text-white shadow-xl`}>
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
            {icon}
          </div>
        </div>
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        <p className="text-lg opacity-90">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((item, index) => {
          const { IconComponent } = item;
          return (
            <Link
              key={index}
              to={item.link}
              className="group block"
            >
              <div className={`
                relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 
                transform hover:scale-105 hover:shadow-2xl hover:-translate-y-3
                bg-gradient-to-br ${item.color} ${item.hoverColor}
                text-white p-8 min-h-[280px] flex flex-col justify-between
                border border-white border-opacity-20 backdrop-blur-sm
              `}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white animate-pulse"></div>
                  <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white opacity-5"></div>
                </div>
                
                <div className="relative z-20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <div className="p-4 bg-white bg-opacity-25 rounded-2xl backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-35 group-hover:rotate-3">
                        {IconComponent && <IconComponent className="text-4xl text-blue-300 drop-shadow-lg" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-opacity-95 transition-all duration-300 leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-white text-opacity-90 leading-relaxed text-sm font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="absolute top-4 right-4 z-30">
                  <div className="relative">
                    <div className="px-4 py-2 bg-slate-400 bg-opacity-25 rounded-full text-xs font-bold backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                      {item.category === 'billing' ? `💳 ${t.billing}` : `⚙️ ${t.management}`}
                    </div>
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-25 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            style={{
              animation: 'float 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            style={{
              animation: 'float 8s ease-in-out infinite',
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            style={{
              animation: 'float 8s ease-in-out infinite',
              animationDelay: '4s'
            }}
          />
        </div>

        <div className="relative z-10 pt-12 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="relative w-60 h-50 bg-white rounded-3xl shadow-2xl p-4 transform hover:rotate-6 transition-transform duration-500 border border-white border-opacity-50 backdrop-blur-sm">
                    {!logoError ? (
                      <img
                        src={`/logo5.png`}
                        alt="Company Logo"
                        className="w-full h-full object-contain rounded-2xl"
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                        <FaFileInvoice className="text-4xl text-white" />
                      </div>
                    )}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 animate-pulse"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t.welcome}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
                {t.subtitle}
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
                  <div className="absolute inset-0 w-40 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center space-x-3 bg-white bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white border-opacity-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">Fast & Secure</span>
                </div>
                <div className="flex items-center space-x-3 bg-white bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white border-opacity-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm font-semibold text-gray-700">Professional Grade</span>
                </div>
                <div className="flex items-center space-x-3 bg-white bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white border-opacity-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-sm font-semibold text-gray-700">Easy to Use</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {t.selectOption}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 font-medium">
              Manage your sugarcane business with our comprehensive suite of tools
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <ActivitySection
            title={t.farmerActivities}
            description={t.farmerActivitiesDesc}
            items={farmerItems}
            sectionColor="from-emerald-500 to-teal-600"
            icon={<BsPerson className="text-4xl text-blue-300" />}
          />

          <ActivitySection
            title={t.sellerActivities}
            description={t.sellerActivitiesDesc}
            items={sellerItems}
            sectionColor="from-violet-500 to-purple-600"
            icon={<BsPersonCheck className="text-4xl text-blue-300" />}
          />
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={toggleLanguage}
          className="group flex items-center space-x-3 bg-white text-gray-800 py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 hover:border-blue-300 transform hover:scale-110 backdrop-blur-sm"
        >
          <div className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
            <FaLanguage className="text-white text-lg" />
            <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <span className="font-semibold text-lg">{t.switchLanguage}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>

      <div className="fixed bottom-8 left-8 z-50">
        <div className="mb-4 text-xs font-semibold text-gray-600 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
          {t.quickActions}
        </div>
        <div className="flex flex-col space-y-3">
          <Link
            to="/farmer_billing"
            className="group relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-110"
            title={t.farmerBilling}
          >
            <FaFileInvoice className="text-xl relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform -translate-y-1/2 group-hover:translate-x-2">
              📋 {t.farmerBilling}
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </Link>
          
          <Link
            to="/sellerbill_creation"
            className="group relative p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-purple-600 hover:to-pink-500 transition-all duration-300 transform hover:scale-110"
            title={t.sellerBilling}
          >
            <MdReceipt className="text-xl relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform -translate-y-1/2 group-hover:translate-x-2">
              🧾 {t.sellerBilling}
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </Link>

          <Link
            to="/all_farmer"
            className="group relative p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-green-600 hover:to-emerald-500 transition-all duration-300 transform hover:scale-110"
            title={t.allFarmers}
          >
            <FaUsers className="text-xl relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform -translate-y-1/2 group-hover:translate-x-2">
              👥 {t.allFarmers}
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </Link>

          <Link
            to="/all_seller"
            className="group relative p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-pink-600 hover:to-rose-500 transition-all duration-300 transform hover:scale-110"
            title={t.allSellers}
          >
            <MdGroup className="text-xl relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform -translate-y-1/2 group-hover:translate-x-2">
              🏪 {t.allSellers}
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-20px) scale(1.02);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 0.1;
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .animate-spin {
            animation: spin 1s linear infinite;
          }

          .shadow-3xl {
            box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
          }

          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6, #8b5cf6);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb, #7c3aed);
          }
        `}
      </style>
    </>
  );
};

export default Home;