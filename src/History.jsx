import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrash, FaFilePdf } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaArrowsSpin } from "react-icons/fa6";

const History = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ count: 0, totalBill: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [dateWarning, setDateWarning] = useState(null);

  const limit = 20;

  // Format ISO date to DD-MM-YYYY, h:mm AM/PM
  const formatDate = (isoDate) => {
    if (!isoDate || isNaN(new Date(isoDate))) return "Invalid Date";
    const date = new Date(isoDate);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    }).replace(/,/, ", ");
  };

  // Format date for table header (DD-MM-YYYY)
  const formatDateHeader = (isoDate) => {
    if (!isoDate) return "Unknown Date";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
  };

  // Group data by date (YYYY-MM-DD) and calculate total bill
  const groupByDate = (records) => {
    if (!Array.isArray(records)) return {};
    const grouped = {};
    records.forEach((item) => {
      if (!item.date || isNaN(new Date(item.date))) return;
      const date = new Date(item.date);
      const localDate = date.toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).split("/").reverse().join("-");
      if (!grouped[localDate]) {
        grouped[localDate] = { records: [], totalBill: 0 };
      }
      grouped[localDate].records.push(item);
      const bill = parseFloat(item.bill?.replace(/[^0-9.-]+/g, "") || 0);
      grouped[localDate].totalBill += bill;
    });
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((acc, date) => {
        acc[date] = {
          records: grouped[date].records.sort((a, b) => new Date(b.date) - new Date(a.date)),
          totalBill: grouped[date].totalBill,
        };
        return acc;
      }, {});
  };

  // Check for nearby dates to show a warning
  const checkNearbyDates = async (date) => {
    try {
      const prevDay = new Date(date);
      prevDay.setDate(date.getDate() - 1);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const prevDateStr = prevDay.toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).split("/").reverse().join("-");
      const nextDateStr = nextDay.toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).split("/").reverse().join("-");

      const [prevResponse, nextResponse] = await Promise.all([
        axios.get(`https://habib-pos-backend.vercel.app/data/by-date?date=${prevDateStr}&page=1&limit=1`),
        axios.get(`https://habib-pos-backend.vercel.app/data/by-date?date=${nextDateStr}&page=1&limit=1`),
      ]);

      const prevCount = prevResponse.data.total || 0;
      const nextCount = nextResponse.data.total || 0;

      if (prevCount > 0 || nextCount > 0) {
        let warning = "কোনো ডেটা পাওয়া যায়নি। নিকটবর্তী তারিখে ডেটা রয়েছে: ";
        if (prevCount > 0) warning += `পূর্ববর্তী দিন (${formatDateHeader(prevDay)}) `;
        if (nextCount > 0) warning += `পরবর্তী দিন (${formatDateHeader(nextDay)})`;
        setDateWarning(warning);
      } else {
        setDateWarning(null);
      }
    } catch (err) {
      console.error("Nearby date check error:", err);
      setDateWarning(null);
    }
  };

  const fetchData = async (date, pageNum, showAllData) => {
    setLoading(true);
    setError(null);
    setDateWarning(null);
    try {
      let response;
      let statsResponse;

      if (showAllData) {
        response = await axios.get(
          `https://habib-pos-backend.vercel.app/data/all?page=${pageNum}&limit=${limit}`
        );
        statsResponse = await axios.get(`https://habib-pos-backend.vercel.app/data/stats/all`);
      } else if (date) {
        const formattedDate = date.toLocaleDateString("en-GB", {
          timeZone: "Asia/Dhaka",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).split("/").reverse().join("-");
        console.log("Selected Date for Filter:", formattedDate);
        response = await axios.get(
          `https://habib-pos-backend.vercel.app/data/by-date?date=${formattedDate}&page=${pageNum}&limit=${limit}`
        );
        statsResponse = await axios.get(
          `https://habib-pos-backend.vercel.app/data/stats?date=${formattedDate}`
        );

        // Check nearby dates if no data found
        if (response.data.data.length === 0) {
          await checkNearbyDates(date);
        }
      } else {
        throw new Error("No date provided for filtered mode");
      }

      const responseData = response.data.data || [];
      const fetchedTotalPages = response.data.totalPages || 1;
      console.log("Fetched Data:", responseData);
      console.log("Total Pages:", fetchedTotalPages);
      console.log("Stats:", statsResponse.data);

      setData(responseData);
      setTotalPages(Math.max(1, fetchedTotalPages));
      setStats(statsResponse.data || { count: 0, totalBill: 0 });

      if (pageNum > fetchedTotalPages) {
        setPage(1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("ডেটা ফেচ করতে ব্যর্থ। আবার চেষ্টা করুন।");
      setData([]);
      setTotalPages(1);
      setStats({ count: 0, totalBill: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching data for page:", page, "showAll:", showAll);
    fetchData(selectedDate, page, showAll);
  }, [selectedDate, page, showAll]);

  const handleDelete = async (qrValue) => {
    if (window.confirm("আপনি কি এই এন্ট্রি মুছতে চান?")) {
      try {
        await axios.delete(`https://habib-pos-backend.vercel.app/data/${qrValue}`);
        fetchData(selectedDate, page, showAll);
      } catch (err) {
        setError("ডেটা মুছতে ব্যর্থ");
        console.error("Delete error:", err);
      }
    }
  };

  const handleDeleteAll = async (date) => {
    if (window.confirm(`আপনি কি ${formatDateHeader(date)} এর সব ডেটা মুছতে চান?`)) {
      try {
        await axios.delete(`https://habib-pos-backend.vercel.app/data/by-date?date=${date}`);
        setPage(1);
        fetchData(selectedDate, 1, showAll);
      } catch (err) {
        setError("সব ডেটা মুছতে ব্যর্থ");
        console.error("Delete all error:", err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log("Changing page to:", newPage);
      setPage(newPage);
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 1) return buttons;

    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-[#FF9F00] text-white rounded disabled:bg-gray-300"
      >
        পূর্ববর্তী
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 bg-[#FF9F00] text-white rounded hover:bg-[#e68a00]"
        >
          ১
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-3 py-1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            i === page
              ? "bg-[#FF9F00] text-white"
              : "bg-gray-200 text-[#FF9F00] hover:bg-[#e68a00] hover:text-white"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-3 py-1">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 bg-[#FF9F00] text-white rounded hover:bg-[#e68a00]"
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 bg-[#FF9F00] text-white rounded disabled:bg-gray-300"
      >
        পরবর্তী
      </button>
    );

    return buttons;
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-[#FF9F00] text-4xl animate-spin">
          <FaArrowsSpin />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500 text-center">
        <div>
          <p>ত্রুটি: {error}</p>
          <button
            onClick={() => fetchData(selectedDate, page, showAll)}
            className="mt-4 px-4 py-2 bg-[#FF9F00] text-white rounded"
          >
            পুনরায় চেষ্টা
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#FF9F00]">
          History
        </h1>
      </Link>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <label className="mr-2 text-[#FF9F00]">Select Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setShowAll(false);
                setPage(1);
              }}
              dateFormat="yyyy-MM-dd"
              className="border border-[#F7CAAC] rounded p-2"
              placeholderText="Select Date"
            />
          </div>
          <button
            onClick={() => {
              setSelectedDate(null);
              setShowAll(true);
              setPage(1);
            }}
            className="bg-[#FF9F00] text-white px-4 py-2 rounded hover:bg-[#e68a00]"
          >
            Shoe All
          </button>
        </div>
      </div>
      <div className="mb-4 text-[#FF9F00]">
        <p>Total Record: {stats.count}</p>
        <p>Total Bill: {stats.totalBill.toFixed(2)}/-</p>
      </div>
      {data.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>কোনো ডেটা পাওয়া যায়নি</p>
          {dateWarning && <p className="text-yellow-500 mt-2">{dateWarning}</p>}
        </div>
      ) : (
        <>
          {showAll ? (
            <>
              {Object.entries(groupByDate(data)).map(([date, { records, totalBill }]) => (
                <div key={date} className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#FF9F00]">
                      {formatDateHeader(date)}
                    </h2>
                    <button
                      onClick={() => handleDeleteAll(date)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                      disabled={records.length === 0}
                    >
                      <FaTrash className="mr-2" /> Delete All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-[#F7CAAC]">
                      <thead>
                      <tr className="bg-[#FFD966]">
                      <th className="border border-[#F7CAAC] p-2">Name</th>
                      <th className="border border-[#F7CAAC] p-2">Customer Id</th>
                      <th className="border border-[#F7CAAC] p-2">Invoice</th>
                      <th className="border border-[#F7CAAC] p-2">Product Name</th>
                      <th className="border border-[#F7CAAC] p-2">Weight</th>
                      <th className="border border-[#F7CAAC] p-2">ill</th>
                      <th className="border border-[#F7CAAC] p-2">Sample Type</th>
                      <th className="border border-[#F7CAAC] p-2">Date</th>
                      <th className="border border-[#F7CAAC] p-2">Action</th>
                    </tr>
                      </thead>
                      <tbody>
                        {records.map((item) => (
                          <tr key={item.qrValue}>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.name || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.customerId || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.invoice || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.productsName || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.weight || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.bill || "0"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {item.selectedOption || "N/A"}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 text-center">
                              {formatDate(item.date)}
                            </td>
                            <td className="border border-[#F7CAAC] p-2 flex space-x-2 justify-center">
                              <Link
                                to={`/pdf/${item.qrValue}`}
                                target="_blank"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaFilePdf size={20} />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.qrValue)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-[#FF9F00]">
                    <p>Total bill for this date: {totalBill.toFixed(2)}/-</p>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {getPaginationButtons()}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#FF9F00]">
                  {selectedDate
                    ? formatDateHeader(selectedDate.toISOString())
                    : "নির্বাচিত তারিখ"}
                </h2>
                <button
                  onClick={() =>
                    handleDeleteAll(
                      selectedDate.toLocaleDateString("en-GB", {
                        timeZone: "Asia/Dhaka",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }).split("/").reverse().join("-")
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                  disabled={data.length === 0}
                >
                  <FaTrash className="mr-2" /> Delete All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#F7CAAC]">
                  <thead>
                    <tr className="bg-[#FFD966]">
                      <th className="border border-[#F7CAAC] p-2">Name</th>
                      <th className="border border-[#F7CAAC] p-2">Customer Id</th>
                      <th className="border border-[#F7CAAC] p-2">Invoice</th>
                      <th className="border border-[#F7CAAC] p-2">Product Name</th>
                      <th className="border border-[#F7CAAC] p-2">Weight</th>
                      <th className="border border-[#F7CAAC] p-2">ill</th>
                      <th className="border border-[#F7CAAC] p-2">Sample Type</th>
                      <th className="border border-[#F7CAAC] p-2">Date</th>
                      <th className="border border-[#F7CAAC] p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.qrValue}>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.name || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.customerId || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.invoice || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.productsName || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.weight || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.bill || "0"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {item.selectedOption || "N/A"}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 text-center">
                          {formatDate(item.date)}
                        </td>
                        <td className="border border-[#F7CAAC] p-2 flex space-x-2 justify-center">
                          <Link
                            to={`/pdf/${item.qrValue}`}
                            target="_blank"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaFilePdf size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.qrValue)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {getPaginationButtons()}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default History;