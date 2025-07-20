import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Format angka ke Rupiah IDR
 * @param {number} amount
 */
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

/**
 * Export transaksi ke PDF
 * @param {Array} transactions - Array of array: [Tanggal, Jenis, Tipe Pembayaran, Keterangan, Nama Warga, Status, Jumlah]
 * @param {string} title
 * @param {object} summary
 */
export const exportToPDF = (transactions, title, summary) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Total Pemasukan: ${formatCurrency(summary.totalPemasukan)}`, 14, 32);
  doc.text(`Total Pengeluaran: ${formatCurrency(summary.totalPengeluaran)}`, 14, 38);
  doc.text(`Saldo Akhir: ${formatCurrency(summary.saldoAkhir)}`, 14, 44);

  const tableColumn = [
    "Tanggal",
    "Jenis",
    "Tipe Pembayaran",
    "Keterangan",
    "Nama Warga",
    "Status",
    "Jumlah",
  ];
  const tableRows = transactions;

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    headStyles: { fillColor: [22, 163, 74] },
    styles: { font: "helvetica", fontSize: 10 },
  });

  doc.save(`${title.replace(/ /g, "_")}.pdf`);
};

/**
 * Export transaksi ke CSV
 * @param {Array} transactions - Array of array: [Tanggal, Jenis, Tipe Pembayaran, Keterangan, Nama Warga, Status, Jumlah]
 * @param {string} filename
 */
export const exportToCSV = (transactions, filename) => {
  const headers = [
    "Tanggal",
    "Jenis",
    "Tipe Pembayaran",
    "Keterangan",
    "Nama Warga",
    "Status",
    "Jumlah",
  ];
  const csvRows = [headers.join(",")];

  if (!transactions || transactions.length === 0) {
    // Jika data kosong, tetap hasil hanya header
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  transactions.forEach((row) => {
    if (!Array.isArray(row)) return;
    const csvRow = [
      row[0], // Tanggal
      row[1], // Jenis
      row[2], // Tipe Pembayaran
      `"${row[3] || ""}"`, // Keterangan
      `"${row[4] || ""}"`, // Nama Warga
      row[5], // Status
      row[6], // Jumlah
    ];
    csvRows.push(csvRow.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};