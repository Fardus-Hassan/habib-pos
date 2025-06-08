import { useRef, useEffect, useState } from "react";
import Receipt from "./Receipt";
import { Link } from "react-router-dom";
import QrScanner from "qr-scanner";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { FaArrowsSpin } from "react-icons/fa6";

const App = ({ fetchCustomer, invoiceQuery }) => {
  function LiveTime() {
    const formatDateTime = () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";

      return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
    };

    const [currentTime, setCurrentTime] = useState(formatDateTime());

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(formatDateTime());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return <span>{currentTime}</span>;
  }

  const [loading, setLoading] = useState(false);
  const imgHostingKey = "5a3d2afa5e59fbed4430f4e438e44623";
  const imgHostingApi = `https://api.imgbb.com/1/upload?key=${imgHostingKey}`;
  const [selectedOption, setSelectedOption] = useState("Hallmark");
  const [image, setImage] = useState(fetchCustomer?.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const generateUniqueID = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  const [qrValue, setQrValue] = useState(generateUniqueID());

  useEffect(() => {
    if (fetchCustomer) {
      setSelectedOption(fetchCustomer?.selectedOption || "Hallmark");
      setImage(fetchCustomer?.image || null);
      setQrValue(fetchCustomer?.qrValue || generateUniqueID());
    }
  }, [fetchCustomer]);

  console.log(fetchCustomer);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (!imageFile) return;

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await axios.post(imgHostingApi, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.data?.url) {
          setImageUrl(response.data.data.url);
          setLoading(false);
        } else {
          console.error("No image URL found in response:", response.data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    uploadImage();
  }, [imageFile]);

  const handlePrint = async () => {
    printContent();
    const inputs = document.querySelectorAll(".print-input");
    const inputValues = {};

    inputs.forEach((input) => {
      inputValues[input.id] = input.value;
    });

    inputValues["selectedOption"] = selectedOption;
    inputValues["qrValue"] = qrValue;
    inputValues["image"] = imageUrl;
    inputValues["date"] = new Date();
    inputValues["invoice"] = fetchCustomer?.invoice || "No_Invoice";

    console.log("All Input Values:", inputValues);

    if (!inputValues["customerId"] || inputValues["customerId"].trim() === "") {
      alert("❌ Customer ID is required!");
      return;
    }

    try {
      const response = await axios.get("https://habib-pos-backend.vercel.app/customersData");
      const existingInvoices = response.data.map((item) => item.invoice);

      if (existingInvoices.includes(inputValues["invoice"])) {
        alert(`❌ Invoice Number ${inputValues["invoice"]} already exists!`);
        printContent();
        return;
      }

      console.log("Sending Data to Server:", inputValues);
      setLoading(true);

      const postResponse = await axios.post("https://habib-pos-backend.vercel.app/customersData", inputValues);
      console.log("✅ Data Saved Successfully:", postResponse.data);
      setLoading(false);

      printContent();
    } catch (error) {
      console.error("❌ Error:", error);
      setLoading(false);
      return;
    }
  };

  const printContent = () => {
    const printStyle = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body, html {
          margin: 0;
          padding: 0;
        }
        body * {
          visibility: hidden;
          margin: 0;
          padding: 0;
        }
        #printableContent, #printableContent * {
          visibility: visible;
        }
        #printableContent {
          padding-top: 1.2in !important;
          width: 180mm;
          height: auto;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-inside: avoid;
        }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyle;
    document.head.appendChild(styleSheet);

    window.print();
  };

  console.log(invoiceQuery);

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

  console.log(selectedOption);

  return (
    <>
      <div className="max-w-[900px] mx-auto text-xs relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            <div className="animate-spin text-[#FF9F00] text-4xl">
              <FaArrowsSpin />
            </div>
          </div>
        )}

        <div id="printableContent" className={`w-[75%] ${selectedOption === "Hallmark" && " h-[475px]"} mx-auto overflow-x-auto`}>
          <div className="">
            <p className="text-right mb-2 font-medium">
              <LiveTime /> - {invoiceQuery}
            </p>

            <div className="flex justify-center">
              <table>
                <tbody className="">
                  <tr className="border border-[#F7CAAC] text-[13px]">
                    <th className="px-1 w-[226.8px] pl-2 text-left border-r border-[#F7CAAC]">Sample Type</th>
                    <td className="pl-1 font-bold w-[226.8px]">
                      <select
                        className="px-1 appearance-none outline-none bg-transparent font-bold"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                      >
                        <option value="Hallmark" className="px-3">
                          Hallmark
                        </option>
                        <option value="Tunch" className="px-3">
                          Tunch
                        </option>
                      </select>
                    </td>
                  </tr>

                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Jeweller's Name</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        onKeyDown={handleKeyDown}
                        id="name"
                        value={fetchCustomer?.name}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Address</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="address"
                        onKeyDown={handleKeyDown}
                        id="address"
                        value={fetchCustomer?.address}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Customer ID</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        id="customerId"
                        value={fetchCustomer?.customerId}
                        onKeyDown={handleKeyDown}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Phone Number</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        id="mobile"
                        value={fetchCustomer?.mobile}
                        onKeyDown={handleKeyDown}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Products Name</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        onKeyDown={handleKeyDown}
                        id="productsName"
                        value={fetchCustomer?.productsName}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Weight</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        onKeyDown={handleKeyDown}
                        value={fetchCustomer?.weight}
                        id="weight"
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-medium w-[226.8px]">Bill</th>
                    <td className="px-1 pl-2 font-medium w-[226.8px]">
                      <input
                        type="text"
                        id="bill"
                        value={fetchCustomer?.bill}
                        onKeyDown={handleKeyDown}
                        className={"w-[100%] print-input"}
                      />
                    </td>
                  </tr>
                  <tr className="border border-[#F7CAAC] text-[13px]">
                    <th className="px-1 pl-2 text-left border-r border-[#F7CAAC] font-bold text-[#ED7D31] w-[226.8px]">
                      Karat:{" "}
                      <input
                        type="text"
                        id="karat"
                        value={fetchCustomer?.karat}
                        onKeyDown={handleKeyDown}
                        defaultValue={"00K"}
                        className={"w-[50%] print-input"}
                      />
                    </th>
                    <td className="px-1 pl-2 font-bold text-[#ED7D31] w-[226.8px]">
                      Gold Purity:{" "}
                      <input
                        type="text"
                        id="goldPurity"
                        onKeyDown={handleKeyDown}
                        defaultValue={"0.00%"}
                        value={fetchCustomer?.goldPurity}
                        className={"w-[50%] print-input"}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-col justify-between items-center">
                <div
                  className="w-[226.8px] max-w-[226.8px] h-[150px] border-t border-r border-[#F7CAAC] p-1 cursor-pointer flex items-center justify-center overflow-hidden"
                  onClick={handleClick}
                >
                  {image ? (
                    <img src={image} alt="Uploaded" className="w-[226.8px] h-full object-cover object-center" />
                  ) : (
                    <span className="text-gray-500">Click to Upload!</span>
                  )}
                </div>
                <div className="flex flex-row-reverse items-center justify-evenly text-center border-b border-r border-[#F7CAAC] px-1 w-full py-1">
                  <QRCodeCanvas value={`https://habib-pos-backend.vercel.app/pdf/${fetchCustomer?.qrValue || qrValue}`} size={50} />
                  <h2 className="font-bold">Scan to view</h2>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <table className={`w-full mx-auto mt-4 ${selectedOption === "Hallmark" && "hidden"}`}>
              <tbody>
                <tr className="border border-[#BFBFBF] bg-[#FFD966]">
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Element</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Gold</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Copper</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Silver</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Cadmium</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Zink</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Nickel</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Iron</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Platinum</th>
                </tr>
                <tr className="border border-[#BFBFBF]">
                  <th className="p-[2px] text-center border-r border-[#BFBFBF] font-semibold">Value</th>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="gold"
                      value={fetchCustomer?.gold}
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="copper"
                      value={fetchCustomer?.copper}
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="silver"
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      value={fetchCustomer?.silver}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="cadmium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.cadmium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="zink"
                      value={fetchCustomer?.zink}
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="nickel"
                      value={fetchCustomer?.nickel}
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="iron"
                      onKeyDown={handleKeyDown}
                      defaultValue={"0.00%"}
                      value={fetchCustomer?.iron}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="platinum"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.platinum}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                </tr>
              </tbody>
              <tbody>
                <tr className="border border-[#BFBFBF] bg-[#FFD966]">
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Element</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Tungsten</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Rhodium</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Rutheniums</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Cobalt</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Osmium</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Iridium</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Palladium</th>
                  <th className="p-[2px] text-center border-r border-[#BFBFBF]">Ruthenium</th>
                </tr>
                <tr className="border border-[#BFBFBF]">
                  <th className="p-[2px] text-center border-r border-[#BFBFBF] font-semibold">Value</th>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="tungsten"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.tungsten}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-semibold">
                    <input
                      type="text"
                      id="rhodium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.rhodium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="rutheniums"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.rutheniums}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="cobalt"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.cobalt}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="osmium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.osmium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="iridium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.iridium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="palladium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.palladium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                  <td className="p-[2px] text-center border-r border-[#BFBFBF] font-medium">
                    <input
                      type="text"
                      id="ruthenium"
                      onKeyDown={handleKeyDown}
                      value={fetchCustomer?.ruthenium}
                      defaultValue={"0.00%"}
                      className={"w-full font-semibold print-input text-center"}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-between">
              <p className="font-medium mt-2">
                <strong>Note:</strong> The result is variable (±) 0.30%
              </p>
            </div>
          </div>
        </div>

        <div className={`flex gap-10 justify-center hide mt-10 ${selectedOption === "Hallmark" && "mt-[-150px]"}`}>
          <button
            // disabled={loading}
            onClick={handlePrint}
            className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center"
          >
            {loading ? (
              <span className="animate-spin mt-[2px] inline-block">
                <FaArrowsSpin />
              </span>
            ) : (
              "Print"
            )}
          </button>
          <Link
            to="/"
            onClick={() => setTimeout(() => window.location.reload(), 1)}
            className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center"
          >
            Switch Receipt
          </Link>
          <Link
            to="/history"
            className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center"
          >
            History
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white w-[140px] text-center"
          >
            Reload
          </button>
        </div>
      </div>
    </>
  );
};

export default App;