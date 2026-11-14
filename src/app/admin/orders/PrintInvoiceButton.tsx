'use client';

export default function PrintInvoiceButton({ order }: { order: any }) {
  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    const printWindow = window.open('', '_XPRINT', 'height=700,width=800');
    
    const subtotal = order.items?.reduce((sum: number, i: any) => sum + (Number(i.price) * Number(i.quantity)), 0) || order.total;

    printWindow?.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; padding: 40px; margin: 0; font-size: 13px; line-height: 1.4; background: #fff; }
            .invoice-title { font-size: 22px; font-weight: 300; letter-spacing: 0.5px; color: #111; margin: 0; }
            .invoice-num { font-size: 13px; color: #555; margin-top: 2px; margin-bottom: 25px; }
            .brand-section { margin-bottom: 35px; }
            .brand-name { font-size: 20px; font-weight: bold; display: flex; align-items: center; gap: 8px; color: #242424; }
            .brand-logo-icon { width: 16px; height: 16px; background: linear-gradient(135deg, #4338ca, #ec4899); display: inline-block; border-radius: 2px; }
            .brand-details { font-size: 11px; color: #555; margin-top: 6px; line-height: 1.5; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-block div { margin-bottom: 4px; color: #333; }
            .client-title { font-weight: 600; color: #333; font-size: 14px; margin-bottom: 4px; text-align: right; }
            .client-info { text-align: right; color: #555; font-size: 12px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 12px; font-weight: 500; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
            th:last-child, td:last-child { text-align: right; }
            th:nth-child(2), td:nth-child(2), th:nth-child(3), td:nth-child(3) { text-align: center; }
            td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 12px; color: #333; }
            .totals-section { width: 260px; margin-left: auto; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; color: #333; }
            .total-row.final { border-bottom: 1px solid #222; border-top: 1px solid #222; font-weight: bold; margin-top: 4px; padding: 8px 0; color: #111; }
            .footer { margin-top: 70px; font-size: 11px; color: #555; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-num">#${order.id}</div>

          <div class="brand-section">
            <div class="brand-name">
              <span class="brand-logo-icon"></span> Craftiq
            </div>
            <div class="brand-details">
              craftiqbd.store | craftiqbd.info@gmail.com | (880) 134 122 5315<br/>
              22/A, Monesshor Road, Dhanmondi, Dhaka-1209
            </div>
          </div>

          <div class="info-grid">
            <div class="info-block" style="font-size: 12px;">
              <div><strong>Invoice date</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${order.createdAt || '31/07/2026'}</div>
              <div><strong>Invoice time</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4:28</div>
              <div><strong>Currency</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BDT</div>
            </div>
            <div>
              <div class="client-title">Client</div>
              <div class="client-info">
                <strong>${order.customerName}</strong><br/>
                ${order.address || 'Dhaka'}<br/>
                ${order.city || ''}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: center;">Unit Price</th>
                <th style="text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((i: any) => `
                <tr>
                  <td>${i.name} (${i.quantity < 10 ? '0' + i.quantity : i.quantity})</td>
                  <td style="text-align: center;">${i.quantity < 10 ? '0' + i.quantity : i.quantity}</td>
                  <td style="text-align: center;">${i.price}</td>
                  <td style="text-align: right;">BDT ${Number(i.price) * Number(i.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="total-row">
              <span>SUBTOTAL</span>
              <span>${subtotal}</span>
            </div>
            <div class="total-row">
              <span>Delivery Charge</span>
              <span>120</span>
            </div>
            <div class="total-row">
              <span>Discount</span>
              <span>- 150</span>
            </div>
            <div class="total-row final">
              <span>TOTAL</span>
              <span>${order.total}</span>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for choosing Craftiq.</div>
            <div>We hope to be a part of your space again.</div>
            <br/>
            <div>Please inspect the product in the presence of the delivery personnel before accepting it.</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="text-xs uppercase tracking-widest text-[#9B704D] hover:underline font-medium mb-1 bg-transparent border-none cursor-pointer p-0"
    >
      🖨️ Print Invoice
    </button>
  );
}