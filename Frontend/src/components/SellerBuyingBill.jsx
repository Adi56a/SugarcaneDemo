import React from 'react';

const translations = {
  en: {
    companyName: "Growaro Infotech",
    address: "Wadgaw Rasai, District Pune, pin - 412211",
    contact: "Contact:  +91 70289 56076",
    title: "Seller Sales Bill Sugarcane Weight Bill",
    date: "Date",
    sellerName: "Seller Name",
    sellerNumber: "Seller Number",
    sugarcaneQuality: "Quality of Sugarcane",
    vehicleType: "Vehicle Type",
    driverName: "Driver Name",
    cutter: "Cutter",
    sugarcaneRate: "Sugarcane Rate",
    first_column: [
      "Weight of Vehicle with Filled Sugarcane",
      "Weight of Empty Vehicle",
      "Sugarcane Weight",
      "Binding material",
      "Only Sugarcane Weight",
    ],
    second_column: [0, 0, 0, 0, 0],
    third_column: [0, 0, 0, 0, 0],
    totalBill: "Total Bill",
    advanceAmount: "Advance Amount",
    remainingAmount: "Remaining Amount",
    paymentType: "Type of Payment",
    signature: "Authorized Signature",
    currency: "₹"
  },
  mr: {
    companyName: "Growaro Infotech",
    address: "वडगाव रासाई, जिल्हा पुणे, पिन - ४१२२११",
    contact: "संपर्क: +९१ ७०२८९ ५६०७६",
    title: "विक्रेता विक्री बिल ऊस वजन बिल",
    date: "तारीख",
    sellerName: "विक्रेत्याचे नाव",
    sellerNumber: "विक्रेत्याचा नंबर",
    sugarcaneQuality: "ऊसाची गुणवत्ता",
    vehicleType: "वाहन प्रकार",
    driverName: "चालकाचे नाव",
    cutter: "कटर",
    sugarcaneRate: "ऊसाचा दर",
    first_column: [
      "भरलेल्या ऊसासह वाहनाचे वजन",
      "रिकाम्या वाहनाचे वजन",
      "ऊसाचे वजन",
      "बांधणी साहित्य",
      "फक्त ऊसाचे वजन",
    ],
    second_column: [0, 0, 0, 0, 0],
    third_column: [0, 0, 0, 0, 0],
    totalBill: "एकूण बिल",
    advanceAmount: "अगाऊ रक्कम",
    remainingAmount: "शिल्लक रक्कम",
    paymentType: "पेमेंट प्रकार",
    signature: "अधिकृत स्वाक्षरी",
    currency: "₹"
  },
};

const SellerBuyingBill = ({
  language = "en",
  date,
  sellerName,
  sellerNumber,
  sugarcaneQuality,
  vehicleType,
  driverName,
  cutter,
  sugarcaneRate,
  weightData,
  totalBill,
  advanceAmount,
  remainingAmount,
  paymentType,
}) => {
  const t = translations[language];
  const second_column = weightData?.second_cloumn || t.second_column;
  const third_column = weightData?.thrid_column || t.third_column;
  const logoSrc = "/bill_logo.jpg";

  return (
    <div
      className="max-w-[830px] mx-auto bg-white"
      style={{
        width: "21cm",
        height: "29.7cm",
        margin: "0 auto",
        boxSizing: "border-box",
        padding: "15px 20px",
        fontFamily: "'Arial', sans-serif",
        fontSize: "13px",
        lineHeight: "1.3"
      }}
    >
      <style>{`
        @media print {
          body { 
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          img.print-logo {
            display: block !important;
            max-height: 50px !important;
            width: auto !important;
            margin: 0 auto 8px auto;
          }
        }
      `}</style>

      <div className="text-center mb-3 pb-3 border-b-2 border-orange-600">
        <img
          src={logoSrc}
          alt="Logo"
          className="print-logo mx-auto mb-2"
          style={{ maxHeight: 50, width: "auto" }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <h1 className="text-lg font-bold text-orange-800 mb-1">{t.companyName}</h1>
        <p className="text-xs text-gray-700 mb-1">{t.address}</p>
        <p className="text-xs text-gray-600 mb-2">{t.contact}</p>
        <div className="bg-orange-600 text-white py-1 px-4 rounded-full inline-block">
          <span className="font-semibold text-sm">{t.title}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded">
        <div className="text-xs">
          <span className="font-semibold">{t.date}: </span>{date}
        </div>
        <div className="text-right">
          <div className="bg-purple-600 text-white px-3 py-1 rounded font-bold">
            {t.currency}{totalBill}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        <div className="bg-orange-50 p-2 rounded border-l-3 border-orange-500">
          <div className="space-y-1">
            <div><strong>{t.sellerName}:</strong> {sellerName}</div>
            <div><strong>{t.sellerNumber}:</strong> {sellerNumber}</div>
            <div><strong>{t.driverName}:</strong> {driverName}</div>
          </div>
        </div>
        <div className="bg-purple-50 p-2 rounded border-l-3 border-purple-500">
          <div className="space-y-1">
            <div><strong>{t.sugarcaneQuality}:</strong> {sugarcaneQuality}</div>
            <div><strong>{t.vehicleType}:</strong> {vehicleType}</div>
            <div><strong>{t.cutter}:</strong> {cutter}</div>
          </div>
        </div>
        <div className="bg-green-50 p-2 rounded border-l-3 border-green-500">
          <div className="space-y-1">
            <div><strong>{t.sugarcaneRate}:</strong></div>
            <div className="text-center">
              <span className="text-lg font-bold text-green-600">{t.currency}{sugarcaneRate || 0}/kg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 w-full">
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Description</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Weight in Ton</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Weight in Kg</th>
            </tr>
          </thead>
          <tbody>
            {t.first_column.map((row, index) => (
              <tr 
                key={index} 
                className={`${index === t.first_column.length - 1 ? 'bg-yellow-100 font-semibold' : 'bg-white'}`}
              >
                <td className="border border-gray-300 px-2 py-1.5">{row}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">
                  {second_column[index] ?? 0}
                </td>
                <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">
                  {third_column[index] ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3 bg-orange-50 p-3 rounded border border-orange-200 w-full">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between bg-white p-1.5 rounded">
              <span className="font-semibold">{t.totalBill}:</span>
              <span className="font-bold text-green-600">{t.currency}{totalBill}</span>
            </div>
            <div className="flex justify-between bg-white p-1.5 rounded">
              <span className="font-semibold">{t.advanceAmount}:</span>
              <span className="font-bold text-blue-600">{t.currency}{advanceAmount}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between bg-white p-1.5 rounded">
              <span className="font-semibold">{t.remainingAmount}:</span>
              <span className="font-bold text-red-600">{t.currency}{remainingAmount}</span>
            </div>
            <div className="flex justify-between bg-white p-1.5 rounded">
              <span className="font-semibold">{t.paymentType}:</span>
              <span className="font-semibold">{paymentType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end pt-3 border-t border-gray-300">
        <div className="text-center">
          <div className="w-32 h-8 border-b border-dashed border-gray-400 mb-1"></div>
          <p className="text-xs font-semibold">{t.signature}</p>
        </div>
        <div className="text-right text-xs text-gray-600">
          <p className="font-semibold">{t.companyName}</p>
          <p>© 2024 - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default SellerBuyingBill;
