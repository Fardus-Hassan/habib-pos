import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowsSpin } from "react-icons/fa6";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Buffer } from 'buffer';
window.Buffer = Buffer;



const PDFViewer = () => {
  const { qrValue } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://habib-pos-backend.vercel.app/data/${qrValue}`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.status === 404 ? "QR কোডের ডেটা পাওয়া যায়নি" : "সার্ভারে সমস্যা");
        setLoading(false);
        console.error("ডেটা ফেচ ত্রুটি:", err);
      }
    };
    fetchData();
  }, [qrValue]);


  console.log(data);

  useEffect(() => {
    if (data) {
      const generatePDF = async () => {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        const pageWidth = 210;
        const contentWidth = 180;
        const margin = (pageWidth - contentWidth) / 2;

        doc.setFontSize(10);
        doc.text(`${new Date(data.date).toLocaleString()} - ${data.invoice || "No_Invoice"}`, margin + contentWidth - 20, 10, { align: "right" });

        const tableData = [
          ["Sample Type", data.selectedOption || "Hallmark"],
          ["Jeweller's Name", data.name || "N/A"],
          ["Address", data.address || "N/A"],
          ["Customer ID", data.customerId || "N/A"],
          ["Phone Number", data.mobile || "N/A"],
          ["Products Name", data.productsName || "N/A"],
          ["Weight", data.weight || "N/A"],
          ["Bill", data.bill || "N/A"],
          [`Karat: ${data.karat || "00K"}`, `Gold Purity: ${data.goldPurity || "0.00%"}`],
        ];

        let y = 20;
        tableData.forEach(([label, value], index) => {
          doc.setDrawColor(247, 202, 172);
          doc.setLineWidth(0.2);
          doc.rect(margin, y, 60, 8);
          doc.rect(margin + 60, y, 60, 8);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          if (index === 8) {
            doc.setTextColor(237, 125, 49);
            doc.setFont("helvetica", "bold");
          }
          doc.text(label, margin + 2, y + 6, { align: "left" });
          doc.text(value, margin + 62, y + 6, { align: "left" });
          y += 8;
        });

        if (data.image) {
          try {
            const imgResponse = await axios.get(data.image, { responseType: "arraybuffer" });
            const imgBase64 = Buffer.from(imgResponse.data).toString("base64");
            const imgData = `data:image/jpeg;base64,${imgBase64}`;
            doc.addImage(imgData, "JPEG", margin + 120, 20, 60, 40);
            doc.setDrawColor(247, 202, 172);
            doc.rect(margin + 120, 20, 60, 40);
          } catch (error) {
            console.error("ইমেজ যোগ করতে ত্রুটি:", error);
            doc.setDrawColor(247, 202, 172);
            doc.rect(margin + 120, 20, 60, 40);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text("ইমেজ লোড ব্যর্থ", margin + 150, 40, { align: "center" });
          }
        } else {
          doc.setDrawColor(247, 202, 172);
          doc.rect(margin + 120, 20, 60, 40);
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text("কোনো ইমেজ নেই", margin + 150, 40, { align: "center" });
        }

        const qrUrl = `http://localhost:5173/pdf/${qrValue}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { width: 50 });
        doc.addImage(qrCodeDataUrl, "PNG", margin + 155, 60, 15, 15);
        doc.setDrawColor(247, 202, 172);
        doc.rect(margin + 120, 60, 60, 15);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("স্ক্যান করুন", margin + 122, 67, { align: "left" });

        if (data.selectedOption === "Tunch") {
          y += 10;
          const tunchTable1 = [
            ["Element", "Gold", "Copper", "Silver", "Cadmium", "Zink", "Nickel", "Iron", "Platinum"],
            [
              "Value",
              data.gold || "0.00%",
              data.copper || "0.00%",
              data.silver || "0.00%",
              data.cadmium || "0.00%",
              data.zink || "0.00%",
              data.nickel || "0.00%",
              data.iron || "0.00%",
              data.platinum || "0.00%",
            ],
          ];

          const tunchTable2 = [
            ["Element", "Tungsten", "Rhodium", "Rutheniums", "Cobalt", "Osmium", "Iridium", "Palladium", "Ruthenium"],
            [
              "Value",
              data.tungsten || "0.00%",
              data.rhodium || "0.00%",
              data.rutheniums || "0.00%",
              data.cobalt || "0.00%",
              data.osmium || "0.00%",
              data.iridium || "0.00%",
              data.palladium || "0.00%",
              data.ruthenium || "0.00%",
            ],
          ];

          tunchTable1.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              doc.setDrawColor(191, 191, 191);
              doc.setLineWidth(0.2);
              doc.rect(margin + colIndex * 20, y, 20, 5);
              if (rowIndex === 0) {
                doc.setFillColor(255, 217, 102);
                doc.rect(margin + colIndex * 20, y, 20, 5, "F");
              }
              doc.setFontSize(8);
              doc.setTextColor(0, 0, 0);
              doc.setFont("helvetica", rowIndex === 0 ? "bold" : "normal");
              doc.text(cell, margin + colIndex * 20 + 10, y + 4, { align: "center" });
            });
            y += 5;
          });

          tunchTable2.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              doc.setDrawColor(191, 191, 191);
              doc.setLineWidth(0.2);
              doc.rect(margin + colIndex * 20, y, 20, 5);
              if (rowIndex === 0) {
                doc.setFillColor(255, 217, 102);
                doc.rect(margin + colIndex * 20, y, 20, 5, "F");
              }
              doc.setFontSize(8);
              doc.setTextColor(0, 0, 0);
              doc.setFont("helvetica", rowIndex === 0 ? "bold" : "normal");
              doc.text(cell, margin + colIndex * 20 + 10, y + 4, { align: "center" });
            });
            y += 5;
          });
        }

        y += 5;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text("Note: The result is variable (±) 0.30%", margin, y);

        const pdfOutput = doc.output("blob");
        const pdfBlobUrl = URL.createObjectURL(pdfOutput);
        setPdfUrl(pdfBlobUrl);
      };

      generatePDF();
    }
  }, [data]);

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
          <p>QR কোড চেক করুন বা সার্ভার চালু আছে কিনা দেখুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="গ্রাহকের রিসিপ্ট"
          className="w-full h-full"
          frameBorder="0"
          onError={(e) => {
            console.error("Iframe ত্রুটি:", e);
            setError("PDF দেখানো যাচ্ছে না");
          }}
        />
      ) : (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-[#FF9F00] text-4xl animate-spin">
            <FaArrowsSpin />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;