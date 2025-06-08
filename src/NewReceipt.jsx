import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { FaArrowsSpin } from "react-icons/fa6";
import { Link } from "react-router-dom";

const NewReceipt = ({ fetchCustomer, invoiceQuery }) => {
    const [loading, setLoading] = useState(false);
    const imgHostingKey = "5a3d2afa5e59fbed4430f4e438e44623";
    const imgHostingApi = `https://api.imgbb.com/1/upload?key=${imgHostingKey}`;
    const [image, setImage] = useState(fetchCustomer?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const fileInputRef = useRef(null);
    const [image2, setImage2] = useState(fetchCustomer?.image2 || null);
    const [imageFile2, setImageFile2] = useState(null);
    const [imageUrl2, setImageUrl2] = useState("");
    const fileInputRef2 = useRef(null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange2 = (e) => {
        const file = e.target.files[0];
        setImageFile2(file);
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage2(imageUrl);
        }
    };

    const handleClick2 = () => {
        fileInputRef2.current.click();
    };

    // Drag-and-drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (setter, fileSetter) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            fileSetter(file);
            const imageUrl = URL.createObjectURL(file);
            setter(imageUrl);
        }
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
            <div
                className="bg-white mx-auto relative"
                style={{
                    width: "793.8px",
                    height: "529.2px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Top orange gap */}
                <div className="w-full" style={{ height: "96px" }}></div>

                {/* Receipt content area */}
                <div className="flex justify-evenly items-center mt-1">
                    <div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Customer Name"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Address"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Sample Type"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Sample Weight"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Invoice Number"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold flex justify-center items-center gap-3">
                                <input type="text" defaultValue={"Customer ID"} className="w-[180px]" />:
                                <input type="text" className="w-[180px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center mt-1">
                        <div>
                            <QRCodeCanvas value={`https://habib-pos-backend.vercel.app/pdf/${qrValue}`} size={60} />
                        </div>
                        <span className="font-bold mb-3">Scan to view</span>
                        {/* Live time */}
                        <div className="flex justify-start">
                            <span className="font-bold block mr-[28px]">{currentTime.date}</span>
                            <span className="font-bold block w-[100px]">{currentTime.time}</span>
                        </div>
                        {/* Mobile */}
                        <div>
                            <div className="font-bold flex items-center gap-3">
                                <input type="text" defaultValue={"Mobile"} className="w-[80px]" />:
                                <input type="text" className="w-[105px] print-input" onKeyDown={handleKeyDown} />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="w-[90%] mx-auto my-1" />
                <div className="flex justify-between text-xl text-[#ED7D31] w-[67%] ml-[52px]">
                    <div>
                        <div className="font-bold flex justify-center items-center gap-3 h-[25px]">
                            <input type="text" defaultValue={"Gold Purity"} className="w-[130px] h-[25px]" />:
                            <input
                                type="text"
                                defaultValue={"00.00"}
                                className="w-[55px] print-input h-[25px]"
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Silver"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Platinum"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Bismuth"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Copper"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Palladium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Cobalt"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Zink"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Antimony"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Indium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Nickel"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Iron"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Titanium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Cadmium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Tin"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Ruthenium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Iridium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Lead"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Vanadium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Rhodium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[36px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Osmium"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
                                        <input
                                            type="text"
                                            defaultValue={"0.00"}
                                            className="w-[35px] print-input font-semibold"
                                            onKeyDown={handleKeyDown}
                                        />
                                        <span className="font-bold">%</span>
                                    </td>
                                    <td className="border pl-2 pr-2">
                                        <input type="text" defaultValue={"Manganese"} className="w-[80px] font-bold" />
                                    </td>
                                    <td className="border px-4">
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
                    className="flex flex-col justify-center items-center w-[200px] gap-2 absolute bottom-[60px] right-2"
                    onPaste={handlePaste(setImage, setImageFile)}
                >
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <div
                            className="w-[120px] max-w-[120px] h-[100px] p-1 cursor-pointer flex items-center justify-center overflow-hidden"
                            onClick={handleClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop(setImage, setImageFile)}
                        >
                            {image ? (
                                <img src={image} alt="Uploaded" className="w-[120px] h-[100px] object-cover object-center" />
                            ) : (
                                <span className="text-gray-500 text-xs hide">Click or Drop Image</span>
                            )}
                        </div>
                    </div>
                    <div onPaste={handlePaste(setImage2, setImageFile2)}>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef2}
                            onChange={handleImageChange2}
                            className="hidden"
                        />
                        <div
                            className="w-[120px] max-w-[120px] h-[100px] p-1 cursor-pointer flex items-center justify-center overflow-hidden"
                            onClick={handleClick2}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop(setImage2, setImageFile2)}
                        >
                            {image2 ? (
                                <img src={image2} alt="Uploaded" className="w-[120px] h-[100px] object-cover object-center" />
                            ) : (
                                <span className="text-gray-500 text-xs hide">Click or Drop Image</span>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom orange gap */}
                <div className="w-full absolute bottom-0" style={{ height: "48px" }}></div>
            </div>
            <div className={`flex gap-10 justify-center hide mt-10`}>
                <button
                    disabled={loading}
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


    );
};

export default NewReceipt;