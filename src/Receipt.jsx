import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowsSpin } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Receipt = ({ fetchCustomer }) => {

  const [currentDate, setCurrentDate] = useState("");

  const [currentTime, setCurrentTime] = useState("");
  const [selectedValue, setSelectedValue] = useState("Hallmark");
  const [status, setStatus] = useState("Due");
  const [loading, setLoading] = useState(false)


  const [data, setData] = useState(null);
  const [maxInvoiceNo, setMaxInvoiceNo] = useState("");
  const [nextInvoiceNo, setNextInvoiceNo] = useState("");


  const extractNumber = (invoiceNo) => {

    return parseInt(invoiceNo.replace(/[^\d]/g, ""), 10);
  };


  const findLargestInvoiceNo = (invoices) => {
    let maxInvoice = invoices[0].invoice;
    let maxNumber = extractNumber(maxInvoice);

    invoices.forEach((invoice) => {
      const invoiceNumber = extractNumber(invoice.invoice);
      if (invoiceNumber > maxNumber) {
        maxNumber = invoiceNumber;
        maxInvoice = invoice.invoice;
      }
    });

    return maxInvoice;
  };


  const calculateNextInvoiceNo = (maxInvoice) => {
    const maxNumber = extractNumber(maxInvoice);
    const nextNumber = maxNumber + 1;
    const nextInvoiceNo = `T${String(nextNumber).padStart(6, "0")}`;
    return nextInvoiceNo;
  };


  useEffect(() => {
    // setLoading(true);
    axios
      .get("https://habib-pos-backend.vercel.app/customers")
      .then((response) => {
        console.log("Fetched Data:", response.data);


        const largestInvoiceNo = findLargestInvoiceNo(response.data);
        setMaxInvoiceNo(largestInvoiceNo);
        console.log(largestInvoiceNo);
        const nextInvoiceNo = calculateNextInvoiceNo(largestInvoiceNo);
        setNextInvoiceNo(nextInvoiceNo);

        setData(response.data);
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);




  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString());
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(formattedTime);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);




  const prepareForPrint = () => {
    const inputs = document.querySelectorAll(".print-input");
    const inputValues = {};

    inputs.forEach((input) => {
      inputValues[input.id] = input.value;
    });

    inputValues["selectedOption"] = selectedValue;
    inputValues["paymentStatus"] = status;
    inputValues["date"] = new Date();
    inputValues["invoice"] = nextInvoiceNo;

    if (!inputValues["customerId"] || inputValues["customerId"].trim() === "") {
      alert("❌ Customer ID is required!");
      return;
    }

    // 🔹 Check if invoice already exists in database
    axios.get("https://habib-pos-backend.vercel.app/customers")
      .then((response) => {
        const existingInvoices = response.data.map(item => item.invoice);

        if (existingInvoices.includes(inputValues["invoice"])) {
          alert(`❌ Invoice Number ${inputValues["invoice"]} already exists!`);
          window.print();
          return;
        }

        // ✅ If invoice is unique, proceed with posting data
        console.log("Sending Data to Server:", inputValues);

        setLoading(true);
        axios.post("https://habib-pos-backend.vercel.app/customer", inputValues)
          .then((response) => {
            console.log("✅ Data Saved Successfully:", response.data);
            setLoading(false);
            window.print();
          })
          .catch((error) => {
            console.error("❌ Data Save Failed:", error);
            // setLoading(false);
          });
      })
      .catch((error) => {
        console.error("❌ Error fetching invoices:", error);
      });
  };




  const handleKeyDown = (event) => {
    const inputs = document.querySelectorAll(".print-input");
    const currentIndex = Array.from(inputs).indexOf(event.target);

    if (event.key === "ArrowDown") {
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      }
    } else if (event.key === "ArrowUp") {
      if (currentIndex > 0) {
        inputs[currentIndex - 1].focus();
      }
    }
  };


  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };






  console.log(nextInvoiceNo);



  return (
    <div className="gap-10" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&family=Montserrat:wght@100..900&display=swap');
        .receipt {
          max-width: 80mm;
          background: white;
          padding: 10px 15px 0;
      border: 1px solid rgba(0, 0, 0, 0.5);
          font-size: 12px;
          line-height: 1.4;
          text-align: left;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        }
        .receipt h2 { text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 5px; }
        .receipt p { margin: 1px 0; font-weight: 600; }
        .dashed { border-top: 1px dashed black; margin: 8px 0; }
        .print-btn { margin-top: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer; }
        .print-input { padding: 0 4px; width: 50%; font-weight: 700; }
        .text-center { text-align: center; white-space: nowrap; }
        .add{width: 78%;}
        .text { font-weight: 800; }
        @media print {
          @page { size: 80mm 87mm !important; margin: 0; }
          body, html { margin: 0; padding: 0; background: none; }
          .receipt { max-width: 80mm; max-height: 87mm !important; border: none; box-shadow: none; padding: 0 15px; margin-top: -4px;}
          .print-btn { display: none; }
        }
      `}</style>
      <div className="receipt" id="receipt">
        <h2 className="text-center">ADI GOLD HALLMARK CENTER™</h2>
        <p className="text-center">B-116, Loknath Plaza, Ambag Road, <br /> Konabari, Gazipur</p>
        <p className="text-center"><span className="text">CONTACT NO :</span> 01711-296304, 01711-277194</p>
        <p className="text-center"><span className="text">Date :</span> {currentDate}, [ {currentTime} ]</p>
        <div className="dashed"></div>
        <p><span className="text">INVOICE NO :</span> <span className="font-bold">{nextInvoiceNo}</span></p>
        <p><span className="text">CUSTOMER ID NO :</span> <input type="text" className="print-input" id="customerId" onKeyDown={handleKeyDown} defaultValue={fetchCustomer?.customerId} /></p>
        <p><span className="text">Name :</span> <input type="text" className="print-input add" id="name" onKeyDown={handleKeyDown} defaultValue={fetchCustomer?.name} /></p>
        <p><span className="text">Mob :</span> <input type="text" className="print-input add" id="mobile" onKeyDown={handleKeyDown} defaultValue={fetchCustomer?.mobile} /></p>
        <p><span className="text">Manufacturer :</span> <input type="text" className="print-input" id="manufacturer" onKeyDown={handleKeyDown} /></p>
        <p><span className="text">Address :</span> <input type="text" className="print-input add" id="address" onKeyDown={handleKeyDown} defaultValue={fetchCustomer?.address} /></p>
        <p><span className="text">
          <select
            className={`appearance-none outline-none bg-transparent ${selectedValue == "Tunch" && "max-w-[44px]"}`}
            id="hallmark-select"
            value={selectedValue}
            onChange={handleChange}
          >
            <option value="Hallmark">HALLMARK</option>
            <option value="Tunch">TUNCH</option>
            <option value="Cutting">CUTTING</option>
            <option value="Melting">MELTING</option>
            <option value="Soldering">SOLDERING</option>
          </select> :
        </span> <input type="text" className="print-input" id="hallmark" onKeyDown={handleKeyDown} /></p>
        <p><span className="text">Box No :</span> <input type="text" className="print-input" id="boxNo" onKeyDown={handleKeyDown} /></p>
        <p><span className="text">Weight :</span> <input type="text" className="print-input" id="weight" onKeyDown={handleKeyDown} /></p>
        <div className="dashed"></div>
        <p><span className="text">TOTAL CHARGE :</span> <input type="text" className="print-input" id="bill" onKeyDown={handleKeyDown} /></p>
        <p><span className="text">Payment Status :</span>
          <select
            id="payment-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none outline-none bg-transparent px-1 font-bold"
          >
            <option>Due</option>
            <option>Paid</option>
          </select>
        </p>
        <div className="dashed"></div>
      </div>
      <div className="flex justify-center gap-10 mt-20 print-btn">
        <button disabled={loading} onClick={prepareForPrint} className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center text-xs">{loading ? <span className="animate-spin mt-[2px] inline-block"><FaArrowsSpin /></span> : "Print"}</button>
        <Link to='/new'
          onClick={() => setTimeout(() => window.location.reload(), 1)}
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center text-xs">Switch Receipt</Link>
        <Link
          to="/history"
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center text-xs"
        >
          History
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center text-xs">
          Reload
        </button>
      </div>
    </div>
  );
};

export default Receipt;