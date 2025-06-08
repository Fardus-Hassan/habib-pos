import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import App from "./App";
import Receipt from "./Receipt";
import { Search } from "lucide-react";
import PDFViewer from "./PDFViewer";
import History from "./History";
import Login from "./Login";
import NewReceipt from "./NewReceipt";

const Layout = () => {
  const [fetchCustomer, setFetchCustomer] = useState(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();

  const handleCustomerSearch = async () => {
    setSearchTerm(customerQuery);
    try {
      const response = await fetch(
        `https://habib-pos-backend.vercel.app/customer?customerId=${customerQuery}`
      );
      const data = await response.json();
      setFetchCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const handleInvoiceSearch = async () => {
    setSearchTerm(invoiceQuery);
    try {
      const response = await fetch(
        `https://habib-pos-backend.vercel.app/invoice?invoiceNo=${invoiceQuery}`
      );
      const data = await response.json();
      setFetchCustomer(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  // Hide search bar on /pdf and /history routes
  const isPDFOrHistoryRoute =
    location.pathname.startsWith("/pdf") || location.pathname === "/history";

  return (
    <div>
      {!isPDFOrHistoryRoute && (
        <div className="relative w-full mx-auto p-4 hide">
          <div className="flex justify-center items-center w-full gap-4">
            {/* Customer Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Customer"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                className="w-full pl-10 pr-14 py-2 border border-[#F7CAAC] rounded-lg focus:ring-1 focus:ring-[#cf5f14] outline-none text-xs"
              />
              <button
                onClick={handleCustomerSearch}
                className="absolute right-1 top-1 bottom-1 px-4 bg-[#cf5f14] text-white rounded-md hover:bg-[#b94d10] transition text-xs"
              >
                Search
              </button>
            </div>

            {/* Invoice Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Invoice"
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
                className="w-full pl-10 pr-14 py-2 border border-[#ACF7F1] rounded-lg focus:ring-1 focus:ring-[#1473cf] outline-none text-xs"
              />
              <button
                onClick={handleInvoiceSearch}
                className="absolute right-1 top-1 bottom-1 px-4 bg-[#1473cf] text-white rounded-md hover:bg-[#1057b9] transition text-xs"
              >
                Search
              </button>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-2 text-gray-600 text-center text-xs">
              🔍 You are searching: <strong>{searchTerm}</strong>
            </div>
          )}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
           
              <Receipt fetchCustomer={fetchCustomer} invoiceQuery={invoiceQuery} />
           
          }
        />
        <Route
          path="/receipt"
          element={
            
              <App fetchCustomer={fetchCustomer} invoiceQuery={invoiceQuery} />
          
          }
        />
        <Route
        path="/new"
        element={<NewReceipt></NewReceipt>}
        ></Route>
        <Route path="/pdf/:qrValue" element={<PDFViewer />} />
        <Route path="/history" element={<Login><History /></Login>} />
      </Routes>
    </div>
  );
};

export default Layout;
