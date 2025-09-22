import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaFileInvoice, FaUserPlus, FaSignOutAlt, FaUser, FaBars, FaTimes, FaUserEdit } from 'react-icons/fa';
import { MdSell, MdReceipt, MdPersonAdd, MdGroup } from 'react-icons/md';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('language') || 'en');
    };
    
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedFarmerNumber');
    localStorage.removeItem('selectedFarmerName');
    localStorage.removeItem('selectedSellerNumber');
    localStorage.removeItem('selectedSellerName');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const isLoggedIn = localStorage.getItem('authToken') !== null;

  const translations = {
    en: {
      brandName: "Varda SugarCane",
      home: "Home",
      
      // Farmer Section
      farmerSection: "Farmer Management",
      farmerBill: "Farmer Bill",
      farmerRegister: "Register Farmer",
      allFarmers: "All Farmers",
      updateFarmer: "Update Farmer",
      
      // Seller Section
      sellerSection: "Seller Management", 
      sellerBill: "Seller Bill",
      sellerRegister: "Register Seller",
      allSellers: "All Sellers",
      
      // Other
      sellingBills: "Selling Bills",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      profile: "Profile"
    },
    mr: {
      brandName: "वरद गुळ उद्योग",
      home: "होम",
      
      // Farmer Section
      farmerSection: "शेतकरी व्यवस्थापन",
      farmerBill: "शेतकरी बिल",
      farmerRegister: "शेतकरी नोंदणी",
      allFarmers: "सर्व शेतकरी",
      updateFarmer: "शेतकरी अद्यतनित करा",
      
      // Seller Section
      sellerSection: "विक्रेता व्यवस्थापन",
      sellerBill: "विक्रेता बिल",
      sellerRegister: "विक्रेता नोंदणी", 
      allSellers: "सर्व विक्रेते",
      
      // Other
      sellingBills: "विक्री बिले",
      login: "लॉगिन",
      signup: "साइन अप",
      logout: "लॉगआउट",
      profile: "प्रोफाइल"
    }
  };

  const t = translations[language];

  const farmerItems = [
    { name: t.farmerBill, path: '/farmer_billing', icon: <FaFileInvoice /> },
    { name: t.farmerRegister, path: '/farmer_register', icon: <FaUserPlus /> },
    { name: t.allFarmers, path: '/all_farmer', icon: <FaUsers /> },
    { name: t.updateFarmer, path: '/update_farmer', icon: <FaUserEdit /> }
  ];

  const sellerItems = [
    { name: t.sellerBill, path: '/sellerbill_creation', icon: <MdReceipt /> },
    { name: t.sellerRegister, path: '/register_seller', icon: <MdPersonAdd /> },
    { name: t.allSellers, path: '/all_seller', icon: <MdGroup /> }
  ];

  const otherItems = [
    { name: t.sellingBills, path: '/selling-billing', icon: <MdSell /> }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavDropdown = ({ title, items, isDesktop = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className={`relative ${isDesktop ? 'group' : ''}`}>
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            items.some(item => isActivePath(item.path))
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => !isDesktop && setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen && !isDesktop ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Desktop Dropdown */}
        {isDesktop && (
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                    isActivePath(item.path) ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Dropdown */}
        {!isDesktop && isOpen && (
          <div className="ml-4 mt-2 space-y-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                    {t.brandName}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isLoggedIn && (
              <nav className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath('/')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FaHome className="text-lg" />
                  <span>{t.home}</span>
                </Link>

                <NavDropdown title={t.farmerSection} items={farmerItems} />
                <NavDropdown title={t.sellerSection} items={sellerItems} />

                {otherItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            )}

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t.signup}
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <FaUser className="text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">Welcome</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <FaSignOutAlt />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActivePath('/')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FaHome className="text-lg" />
                    <span>{t.home}</span>
                  </Link>

                  <div className="py-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                      {t.farmerSection}
                    </div>
                    <NavDropdown title="👨‍🌾 Farmer Options" items={farmerItems} isDesktop={false} />
                  </div>

                  <div className="py-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                      {t.sellerSection}
                    </div>
                    <NavDropdown title="🏪 Seller Options" items={sellerItems} isDesktop={false} />
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {otherItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-base font-medium transition-all duration-200 w-full"
                  >
                    <FaSignOutAlt />
                    <span>{t.logout}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-base font-medium transition-colors duration-200"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-center"
                  >
                    {t.signup}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;
