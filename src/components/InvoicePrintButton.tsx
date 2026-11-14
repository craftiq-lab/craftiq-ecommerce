'use client';

export default function InvoicePrintButton({ order }: { order?: any }) {
  const handlePrintInvoice = () => {
    const invoiceElement = document.getElementById('printable-invoice-area');

    if (!invoiceElement) {
      window.print();
      return;
    }

    // শুধুমাত্র ইনভয়েস অংশটুকু প্রিন্ট করার জন্য ডেডিকেটেড প্রিন্ট উইন্ডো
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Craftiq Invoice - ${order?.id || 'Order'}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              color: #242424;
              background: #ffffff;
              padding: 40px;
              line-height: 1.5;
            }
            .invoice-container {
              max-width: 750px;
              margin: 0 auto;
              border: 1px solid #d1ccc0;
              padding: 36px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #242424;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .brand {
              font-size: 28px;
              letter-spacing: 5px;
              font-weight: normal;
            }
            .subtext {
              font-family: sans-serif;
              font-size: 11px;
              color: #666666;
              margin-top: 4px;
            }
            .badge {
              font-family: sans-serif;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #9B704D;
              font-weight: bold;
            }
            .grid {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              border-bottom: 1px solid #e2ddd5;
              padding-bottom: 20px;
              margin-bottom: 24px;
              font-family: sans-serif;
              font-size: 12px;
            }
            .section-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #777777;
              font-weight: bold;
              margin-bottom: 6px;
              display: block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: sans-serif;
              font-size: 13px;
              margin-bottom: 24px;
            }
            th {
              border-bottom: 1px solid #242424;
              padding: 10px 6px;
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #555555;
            }
            td {
              border-bottom: 1px solid #e2ddd5;
              padding: 12px 6px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals {
              width: 260px;
              margin-left: auto;
              font-family: sans-serif;
              font-size: 13px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
            }
            .totals-final {
              border-top: 2px solid #242424;
              font-size: 16px;
              font-weight: bold;
              color: #9B704D;
              padding-top: 10px;
              margin-top: 6px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px dashed #cccccc;
              text-align: center;
              font-family: sans-serif;
              font-size: 11px;
              color: #555555;
            }
            @media print {
              body { padding: 0; }
              .invoice-container { border: none; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      type="button"
      onClick={handlePrintInvoice}
      className="bg-[#242424] text-white px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#9B704D] transition cursor-pointer"
    >
      🖨️ Print / Save Customer Invoice
    </button>
  );
}