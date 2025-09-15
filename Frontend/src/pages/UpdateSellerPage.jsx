import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const UpdateSellerPage = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ seller_number: '', seller_name: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const t = {
    title: '🏪 Seller Management',
    subtitle: 'Update seller information easily',
    searchPlaceholder: '🔍 Search by name or number...',
    sellerName: 'Seller Name',
    sellerNumber: 'Seller Number',
    actions: 'Actions',
    edit: '✏️ Edit',
    noFound: 'No sellers found',
    previous: 'Previous',
    next: 'Next',
    updateDetails: 'Update Seller Details',
    modifyInfo: 'Modify seller info below',
    numberLabel: '📱 Number',
    nameLabel: '🏷️ Name',
    cancel: 'Cancel',
    update: '💾 Update Seller',
    loading: 'Loading sellers...',
    success: 'Seller updated!',
    errorFetch: 'Failed to fetch sellers',
    errorUpdate: 'Failed to update seller'
  };

  const apiBase = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://sugarcanebillingsoftware.onrender.com';

  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/seller/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSellers(data.data.sort((a, b) =>
            (a.seller_name || '').localeCompare(b.seller_name || '')
          ));
        } else {
          setMessage({ text: t.errorFetch, type: 'error' });
        }
      } catch {
        setMessage({ text: t.errorFetch, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const openModal = seller => {
    setSelectedSeller(seller);
    setFormData({ seller_number: seller.seller_number, seller_name: seller.seller_name });
    setIsModalOpen(true);
    setMessage({ text: '', type: '' });
  };
  const closeModal = () => setIsModalOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.seller_number.trim() && !formData.seller_name.trim()) {
      setMessage({ text: 'Provide at least one field', type: 'error' });
      return;
    }
    setUpdating(true);
    const payload = {};
    if (formData.seller_number.trim()) payload.seller_number = formData.seller_number.trim();
    if (formData.seller_name.trim()) payload.seller_name = formData.seller_name.trim();
    try {
      const res = await fetch(`${apiBase}/api/seller/update/${selectedSeller._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSellers(prev => prev.map(s =>
          s._id === selectedSeller._id ? { ...s, ...payload } : s
        ));
        setMessage({ text: t.success, type: 'success' });
        closeModal();
      } else {
        setMessage({ text: t.errorUpdate, type: 'error' });
      }
    } catch {
      setMessage({ text: t.errorUpdate, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = sellers.filter(s =>
    s.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.seller_number.includes(searchTerm)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = filtered.slice(start, start + itemsPerPage);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="mb-6 text-gray-600">{t.subtitle}</p>

          {message.text && (
            <div className={`mb-4 p-4 rounded ${message.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="mb-4 relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left font-medium">{t.sellerName}</th>
                    <th className="p-4 text-left font-medium">{t.sellerNumber}</th>
                    <th className="p-4 text-center font-medium">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length ? pageData.map((s, idx) => (
                    <tr key={s._id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-4">{s.seller_name}</td>
                      <td className="p-4">{s.seller_number}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openModal(s)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition"
                        >
                          {t.edit}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-500">
                        {t.noFound}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 bg-gray-50">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1 rounded disabled:opacity-50"
                  >
                    {t.previous}
                  </button>
                  <span className="text-sm text-gray-700">
                    {t.showing} {start + 1} {t.to} {Math.min(start + itemsPerPage, filtered.length)} {t.of} {filtered.length} {t.results}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 rounded disabled:opacity-50"
                  >
                    {t.next}
                  </button>
                </div>
              )}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 p-4">
                  <h2 className="text-white text-xl font-semibold">{t.updateDetails}</h2>
                  <p className="text-blue-200 text-sm mt-1">{t.modifyInfo}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.numberLabel}</label>
                    <input
                      type="tel"
                      name="seller_number"
                      value={formData.seller_number}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
                      placeholder={t.numberFormat}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
                    <input
                      type="text"
                      name="seller_name"
                      value={formData.seller_name}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
                      placeholder={t.nameLabel}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {updating ? t.update + '...' : t.update}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateSellerPage;
