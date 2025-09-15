import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserGroupIcon, PhoneIcon, CalendarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/solid';

const AllFarmerListPage = () => {
  const navigate = useNavigate();
  
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [farmersPerPage] = useState(10);
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Navigation function for Add Farmer
  const handleAddFarmer = () => {
    navigate('/update_farmer');
  };

  // Fetch all farmers from API
  useEffect(() => {
    fetchAllFarmers();
  }, []);

  const fetchAllFarmers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/farmer/all' 
        : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/farmer/all';

      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFarmers(data.data);
        setFilteredFarmers(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch farmers');
      }
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setError('Network error occurred while fetching farmers');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality - only name and phone number
  useEffect(() => {
    const filtered = farmers.filter(farmer => 
      (farmer.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (farmer.farmer_number?.toString().includes(searchTerm))
    );
    setFilteredFarmers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, farmers]);

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedFarmers = [...filteredFarmers].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredFarmers(sortedFarmers);
  };

  // Pagination
  const indexOfLastFarmer = currentPage * farmersPerPage;
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = filteredFarmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(filteredFarmers.length / farmersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Select/Deselect farmers
  const handleSelectFarmer = (farmerId) => {
    setSelectedFarmers(prev => 
      prev.includes(farmerId) 
        ? prev.filter(id => id !== farmerId)
        : [...prev, farmerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFarmers.length === currentFarmers.length) {
      setSelectedFarmers([]);
    } else {
      setSelectedFarmers(currentFarmers.map(farmer => farmer._id));
    }
  };

  // Delete farmer functionality
  const handleDeleteFarmer = async (farmerId, farmerName) => {
    if (!window.confirm(`Are you sure you want to delete farmer "${farmerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
    const baseUrl = process.env.NODE_ENV === 'development' 
  ? `http://localhost:5000/api/farmer/delete/${farmerId}` 
  : `https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/farmer/delete/${farmerId}`;

      const response = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove farmer from local state
        setFarmers(prev => prev.filter(farmer => farmer._id !== farmerId));
        setFilteredFarmers(prev => prev.filter(farmer => farmer._id !== farmerId));
        setSelectedFarmers(prev => prev.filter(id => id !== farmerId));
        alert('Farmer deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete farmer: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
      alert('Network error occurred while deleting farmer');
    }
  };

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    if (selectedFarmers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedFarmers.length} farmers? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/farmer/bulk-delete' 
        : 'https://o52eguwxr47vsj425dq4leipby0kggba.lambda-url.ap-south-1.on.aws/api/farmer/bulk-delete';

      const response = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ farmerIds: selectedFarmers })
      });

      if (response.ok) {
        // Remove deleted farmers from local state
        setFarmers(prev => prev.filter(farmer => !selectedFarmers.includes(farmer._id)));
        setFilteredFarmers(prev => prev.filter(farmer => !selectedFarmers.includes(farmer._id)));
        setSelectedFarmers([]);
        alert('Farmers deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete farmers: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting farmers:', error);
      alert('Network error occurred while deleting farmers');
    }
  };

  // Export functionality - only relevant fields
  const exportToCSV = () => {
    const headers = ['Name', 'Phone Number', 'Total Bills', 'Created Date'];
    const csvData = filteredFarmers.map(farmer => [
      farmer.farmer_name || 'N/A',
      farmer.farmer_number || 'N/A',
      farmer.farmer_billhistory?.length || 0,
      farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `farmers_list_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Farmers</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllFarmers}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Farmers</h1>
              <p className="mt-2 text-gray-600">Manage and view all registered farmers in the system</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
              <button
               onClick={handleAddFarmer}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Add Farmer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{farmers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Farmers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {farmers.filter(f => f.farmer_billhistory?.length > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {farmers.reduce((total, farmer) => total + (farmer.farmer_billhistory?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by farmer name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
          
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredFarmers.length}</span> farmers matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Farmers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Farmers List ({filteredFarmers.length})
              </h2>
              {selectedFarmers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedFarmers.length} selected
                  </span>
                  <button 
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {currentFarmers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first farmer'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedFarmers.length === currentFarmers.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('farmer_name')}
                      >
                        <div className="flex items-center">
                          Farmer Name
                          {sortConfig.key === 'farmer_name' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('farmer_number')}
                      >
                        <div className="flex items-center">
                          Phone Number
                          {sortConfig.key === 'farmer_number' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Bills
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Joined Date
                          {sortConfig.key === 'createdAt' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentFarmers.map((farmer) => (
                      <tr key={farmer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedFarmers.includes(farmer._id)}
                            onChange={() => handleSelectFarmer(farmer._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {(farmer.farmer_name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {farmer.farmer_name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {farmer.farmer_number || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {farmer.farmer_billhistory?.length || 0} bills
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {farmer.createdAt 
                              ? new Date(farmer.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'N/A'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFarmer(farmer._id, farmer.farmer_name)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              title="Delete Farmer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{indexOfFirstFarmer + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastFarmer, filteredFarmers.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{filteredFarmers.length}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = index + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                          } else {
                            pageNumber = currentPage - 2 + index;
                          }
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFarmerListPage;
