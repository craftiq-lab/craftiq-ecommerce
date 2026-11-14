import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import InvoicePrintButton from '@/components/InvoicePrintButton';

export default async function PrintableInvoicePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const orderId = decodeURIComponent(resolvedParams.id);

  const allOrders = await prisma.order.findMany();
  const order = allOrders.find((o: any) => String(o.id) === String(orderId));

  if (!order) {
    notFound();
  }

  const itemsSubtotal = Array.isArray(order.items)
    ? order.items.reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity || 1), 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-6 md:p-12">
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-[#777777] hover:text-[#242424]">
          &larr; Back to Orders
        </Link>
        <InvoicePrintButton order={order} />
      </div>

      <div
        id="printable-invoice-area"
        className="max-w-3xl mx-auto bg-white border border-[#E2DDD5] p-8 md:p-12 shadow-sm"
      >
        <div className="header flex justify-between items-start border-b-2 border-[#242424] pb-6 mb-6">
          <div>
            <h1 className="brand font-serif text-3xl tracking-widest font-light text-[#242424]">
              CRAFTIQ
            </h1>
            <p className="subtext text-xs text-[#666666] mt-1">
              Artisan Handcrafted Wooden Masterpieces
            </p>
            <p className="subtext text-xs text-[#666666]">
              Website: craftiqbd.store • Dhaka, Bangladesh
            </p>
          </div>
          <div className="text-right">
            <span className="badge text-xs uppercase tracking-[0.2em] text-[#9B704D] font-bold block">
              OFFICIAL INVOICE
            </span>
            <p className="text-sm font-mono font-bold mt-1">Invoice: #{order.id}</p>
            {order.customerId && (
              <p className="text-xs font-mono text-[#555555]">Customer ID: {order.customerId}</p>
            )}
            <p className="text-xs text-[#777777] mt-0.5">
              Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 mb-6 border-b border-[#E2DDD5] text-xs">
          <div className="space-y-1">
            <span className="section-label text-[10px] uppercase tracking-widest text-[#777777] font-bold block">
              Billed & Shipped To (Customer):
            </span>
            <p className="text-sm font-bold text-[#242424]">{order.customerName}</p>
            <p className="text-[#242424] font-medium">Phone: {order.phone}</p>
            <p className="text-[#444444]">Address: {order.address}</p>
            <p className="text-[#444444]">District: {order.city}</p>
            {order.orderNote && <p className="text-[#666666] italic">Note: {order.orderNote}</p>}
          </div>
          <div className="space-y-1 sm:text-right">
            <span className="section-label text-[10px] uppercase tracking-widest text-[#777777] font-bold block">
              Courier & Payment Info:
            </span>
            <p>Payment: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong></p>
            <p>Courier: <strong>Steadfast Courier</strong></p>
            {order.consignmentId && <p>Consignment ID: <strong>{order.consignmentId}</strong></p>}
            <p className="text-sm font-bold text-[#9B704D] pt-1">
              Collectable COD: ৳{Number(order.total).toLocaleString()}
            </p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs mb-6">
          <thead>
            <tr className="border-b border-[#242424] text-[10px] uppercase tracking-widest text-[#555555]">
              <th className="py-2.5">Item Description</th>
              <th className="py-2.5 text-center">Qty</th>
              <th className="py-2.5 text-right">Unit Price</th>
              <th className="py-2.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DDD5]">
            {Array.isArray(order.items) &&
              order.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-[#242424]">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity || 1}</td>
                  <td className="py-3 text-right">৳{Number(item.price).toLocaleString()}</td>
                  <td className="py-3 text-right font-medium">
                    ৳{(Number(item.price) * Number(item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="totals w-64 ml-auto space-y-2 text-xs">
          <div className="totals-row flex justify-between text-[#555555]">
            <span>Subtotal:</span>
            <span>৳{itemsSubtotal.toLocaleString()}</span>
          </div>
          <div className="totals-row flex justify-between text-[#555555]">
            <span>Delivery Charge:</span>
            <span>৳{order.deliveryCharge || 70}</span>
          </div>
          <div className="totals-row totals-final flex justify-between text-base font-bold text-[#9B704D] border-t-2 border-[#242424] pt-2">
            <span>Total Payable (COD):</span>
            <span>৳{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="footer mt-10 pt-4 border-t border-dashed border-[#CCCCCC] text-center space-y-1 text-xs text-[#555555]">
          <p className="font-bold text-[#242424]">
            ★ 5-Year Structural Wood Warranty Included ★
          </p>
          <p>Thank you for choosing Craftiq. Every piece is handcrafted from solid timber in Bangladesh.</p>
        </div>
      </div>
    </div>
  );
}