import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaArrowsSpin} from "react-icons/fa6";
import { Link } from "react-router-dom";

const NewReceipt = ({ fetchCustomer, invoiceQuery }) => {
  const [loading, setLoading] = useState(false);
  const imgHostingKey = "5a3d2afa5e59fbed4430f4e438e44623";
  const imgHostingApi = `https://api.imgbb.com/1/upload?key=${imgHostingKey}`;
  const [image, setImage] = useState(fetchCustomer?.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [image2, setImage2] = useState(fetchCustomer?.image2 || null);
  const [imageFile2, setImageFile2] = useState(null);
  const [imageUrl2, setImageUrl2] = useState("");
  const [inputValues, setInputValues] = useState({});
  const [currentTime, setCurrentTime] = useState({ date: "", time: "" });

  const generateUniqueID = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  const [qrValue, setQrValue] = useState(generateUniqueID());

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).split("/").join("-");
      const time = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime({ date, time });
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup
  }, []);

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

    // Collect input values
    const name = event.target.closest("div")?.querySelector("input[type='text']:first-child")?.value || `input_${currentIndex}`;
    setInputValues((prev) => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  // Copy-paste handlers
  const handlePaste = (setter, fileSetter) => (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        fileSetter(file);
        const imageUrl = URL.createObjectURL(file);
        setter(imageUrl);
        break;
      }
    }
  };

  // Delete image handlers
  const handleDeleteImage = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setImageFile(null);
    setImageUrl("");
  };

  const handleDeleteImage2 = () => {
    if (image2) URL.revokeObjectURL(image2);
    setImage2(null);
    setImageFile2(null);
    setImageUrl2("");
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

  useEffect(() => {
    const uploadImage2 = async () => {
      if (!imageFile2) return;

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", imageFile2);
        const response = await axios.post(imgHostingApi, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.data?.url) {
          setImageUrl2(response.data.data.url);
          setLoading(false);
        } else {
          console.error("No image URL found in response:", response.data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    uploadImage2();
  }, [imageFile2]);

  // Handle print and logging
  const handlePrint = () => {
    console.log({
      currentTime: `${currentTime.date} ${currentTime.time}`,
      qrValue: `https://habib-pos-backend.vercel.app/pdf/${qrValue}`,
      imageUrl,
      imageUrl2,
      inputValues,
    });
    window.print();
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
      if (image2) URL.revokeObjectURL(image2);
    };
  }, [image, image2]);

  return (
    <div>
      <style>
        {`
          @media print {
            .hide {
              display: none;
            }
            .image-container {
              position: absolute;
              bottom: 68px;
              right: 8px;
              width: 200px;
            }
            .single-image .image-container img {
              position: absolute;
              z-index: 3000;
              margin-top: 120px;
              margin-left: -30px;
              width: 130px !important;
            }
          }
          .image-wrapper {
            position: relative;
            width: 120px;
            height: 100px;
          }
          .delete-button {
            position: absolute;
            top: 2px;
            right: 2px;
            background-color: rgba(255, 0, 0, 0.7);
            color: white;
            border-radius: 50%;
            padding: 2px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3100;
          }
          .delete-button:hover {
            background-color: rgba(255, 0, 0, 1);
          }
        `}
      </style>
      <div
        className={`bg-white mx-auto relative ${image && !image2 ? "single-image" : ""} ${!image && image2 ? "single-image" : ""}`}
        style={{
          width: "793.8px",
          height: "529.2px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top orange gap */}
        <div className="w-full bg-[#ED7D31]" style={{ height: "96px" }}></div>

        {/* Receipt content area */}
        <div className="flex justify-evenly items-center mt-4">
          <div className="ml-16">
            <div>
              <div className="font-bold flex justify-center items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Customer Name"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[180px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div>
              <div className="font-bold flex justify-center items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Address"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[180px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div>
              <div className="font-bold flex justify-center items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Sample Type"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[180px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div>
              <div className="font-bold flex justify-start items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Sample Weight"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[80px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div>
              <div className="font-bold flex justify-start items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Invoice Number"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[80px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div>
              <div className="font-bold flex justify-start items-center gap-3 h-[20px]">
                <input type="text" defaultValue={"Customer ID"} className="w-[180px] h-[20px]" />:
                <input type="text" className="w-[80px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-start mt-1 w-full">
            <div className="ml-[200px] absolute right-18 top-[130px]">
              <QRCodeCanvas value={`https://habib-pos-backend.vercel.app/pdf/${qrValue}`} size={80} />
            </div>
            {/* Live time */}
            <div className="flex justify-start ml-[-50px] mt-[75px] h-[20px]">
              <span className="font-bold block mr-[28px]">{currentTime.date}</span>
              <span className="font-bold block w-[100px]">{currentTime.time}</span>
            </div>
            {/* Mobile */}
            <div>
              <div className="font-bold flex items-center gap-3 ml-[-50px] h-[20px]">
                <input type="text" defaultValue={"Mobile"} className="w-[80px] h-[20px]" />:
                <input type="text" className="w-[105px] print-input h-[20px]" onKeyDown={handleKeyDown} />
              </div>
            </div>
          </div>
        </div>

        <hr className="w-[90%] mx-auto mt-2 mb-1" />
        <div className="flex justify-between text-xl text-[#ED7D31] text-pm w-[67%] ml-[52px]">
          <div>
            <div className="font-bold flex justify-center items-center gap-3">
              <input type="text" defaultValue={"Gold Purity"} className="w-[130px]" />:
              <input
                type="text"
                defaultValue={"00.00"}
                className="w-[55px] print-input"
                onKeyDown={handleKeyDown}
              />
              <span className="font-bold ml-[-12px]">%</span>
            </div>
          </div>
          <div className="ml-5">
            <div className="font-bold flex justify-center items-center gap-3 h-[25px]">
              <input type="text" defaultValue={"Karat"} className="w-[80px] h-[25px]" />:
              <input
                type="text"
                defaultValue={"00.00"}
                className="w-[55px] print-input h-[25px]"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-2 ml-[50px] flex">
          <div>
            <table className="table-auto border-collapse border border-gray-800 text-sm">
              <tbody>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Silver"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Platinum"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Bismuth"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Copper"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Palladium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Cobalt"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Zink"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Antimony"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Indium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Nickel"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Iron"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Titanium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Cadmium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Tin"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Ruthenium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Iridium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Lead"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Vanadium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Rhodium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[36px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Osmium"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                  <td className="border border-black pl-2 pr-2">
                    <input type="text" defaultValue={"Manganese"} className="w-[80px] font-bold" />
                  </td>
                  <td className="border border-black px-4">
                    <input
                      type="text"
                      defaultValue={"0.00"}
                      className="w-[35px] print-input font-semibold"
                      onKeyDown={handleKeyDown}
                    />
                    <span className="font-bold">%</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <span className="text-xs font-bold ml-[2px]">
              NB: - The report pertains to specific point and not responsible for other point or melting issue
            </span>
          </div>
        </div>

        <div
          className="flex flex-col justify-center items-center image-container w-[200px] gap-2 absolute bottom-[68px] right-2"
          style={{ width: "200px" }}
        >
          <div className="image-wrapper">
            <div
              className="w-[120px] max-w-[120px] h-[100px] p-1 cursor-pointer flex items-center justify-center overflow-hidden"
              onPaste={handlePaste(setImage, setImageFile)}
              tabIndex={0}
              aria-label="Paste first image here"
            >
              {image ? (
                <img src={image} alt="Image 1" className="w-[120px] h-[100px] object-cover object-center" />
              ) : (
                <span className="text-gray-500 text-sm hide">Click and Paste 1</span>
              )}
            </div>
            {image && (
              <button
                className="delete-button hide"
                onClick={handleDeleteImage}
                aria-label="Delete first image"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="image-wrapper">
            <div
              className="w-[120px] max-w-[120px] h-[100px] p-1 cursor-pointer flex items-center justify-center overflow-hidden"
              onPaste={handlePaste(setImage2, setImageFile2)}
              tabIndex={0}
              aria-label="Paste second image here"
            >
              {image2 ? (
                <img src={image2} alt="Image 2" className="w-[120px] h-[100px] object-cover object-center" />
              ) : (
                <span className="text-gray-500 text-sm hide">Click and Paste 2</span>
              )}
            </div>
            {image2 && (
              <button
                className="delete-button hide"
                onClick={handleDeleteImage2}
                aria-label="Delete second image"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Bottom orange gap */}
        <div className="w-full absolute bottom-0 bg-[#ff9f00]" style={{ height: "48px" }}></div>
      </div>
      <div className="flex gap-4 justify-center hide mt-4">
        <button
          disabled={loading}
          onClick={handlePrint}
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white font-bold w-[120px] h-[40px]"
        >
          {loading ? (
            <span className="animate-spin mt-[2px] block mx-auto">
              <FaArrowsSpin />
            </span>
          ) : (
            "Print"
          )}
        </button>
        <Link
          to="/"
          onClick={() => setTimeout(() => window.location.reload(), 1)}
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white font-bold w-[120px] h-[40px] flex items-center justify-center"
        >
          Switch
        </Link>
        <Link
          to="/history"
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white font-bold w-[120px] h-[40px] flex items-center justify-center"
        >
          History
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="mb-4 px-4 py-2 bg-[#FF9F00] rounded-lg text-white font-bold w-[120px] h-[40px]"
        >
          Reload
        </button>
      </div>
    </div>
  );
};

export default NewReceipt;