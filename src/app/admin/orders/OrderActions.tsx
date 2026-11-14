'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  updateOrderStatusAction,
  deleteOrderAction,
  bookSteadfastOrderAction,
  saveSteadfastBookingAction,
} from './actions';

export default function OrderActions({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status || 'Processing');
  const [sfId, setSfId] = useState(
    order.consignmentId || order.steadfastId || order.sfId || ''
  );
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [loadingSteadfast, setLoadingSteadfast] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const rawPhone = order.phone || order.shippingPhone || order.customerPhone || '';
  let formattedPhone = String(rawPhone).replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '88' + formattedPhone;
  } else if (formattedPhone && !formattedPhone.startsWith('88')) {
    formattedPhone = '880' + formattedPhone;
  }

  const totalAmount = Number(order.total || order.totalAmount || 0);
  const customerName = order.customerName || order.name || 'প্রিয় গ্রাহক';

  const courierSection =
    sfId || trackingCode
      ? `\n🚚 *কুরিয়ার ও ট্র্যাকিং তথ্য (Steadfast):*\n` +
        (sfId ? `• Consignment ID: ${sfId}\n` : '') +
        (trackingCode
          ? `• Tracking Code: ${trackingCode}\n• লাইভ ট্র্যাকিং: https://steadfast.com.bd/t/${trackingCode}\n`
          : '')
      : '';

  const waMessage =
    `আসসালামু আলাইকুম, ${customerName}! 🪵\n\n` +
    `Craftiq-এ অর্ডার করার জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে!\n\n` +
    `📦 *ইনভয়েস ও অর্ডার বিবরণী:*\n` +
    `• অর্ডার আইডি: #${order.id}\n` +
    `• অর্ডার স্ট্যাটাস: ${status}\n` +
    `• মোট মূল্য (COD): ৳${totalAmount.toLocaleString()}\n` +
    courierSection +
    `\n🔍 আমাদের ওয়েবসাইটে অর্ডার ট্র্যাক করুন:\n` +
    `https://craftiqbd.store/track?orderId=${encodeURIComponent(order.id)}\n\n` +
    `যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করতে পারেন। ধন্যবাদ! ✨`;

  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMessage)}`;

  const handleSteadfast = async () => {
    setLoadingSteadfast(true);
    try {
      // ১. প্রথমে আমাদের IPv4 Native Server Action দিয়ে চেষ্টা করা
      const res = await bookSteadfastOrderAction(order.id);

      if (res.success) {
        setSfId(res.consignmentId || '');
        setTrackingCode(res.trackingCode || '');
        setStatus('Shipped via Steadfast');
        alert(
          `সফলভাবে Steadfast পোর্টালে বুক হয়েছে!\nConsignment ID: ${res.consignmentId}\nTracking Code: ${res.trackingCode}`
        );
        return;
      }

      // ২. যদি প্রজেক্টে আগের কোনো লোকাল route.ts (/api/steadfast) থেকে থাকে তবে সেটিও চেষ্টা করা
      try {
        const localRes = await fetch('/api/steadfast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, order }),
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          const cId =
            localData.consignmentId ||
            localData.consignment?.consignment_id ||
            localData.sfId ||
            '';
          const tCode =
            localData.trackingCode ||
            localData.consignment?.tracking_code ||
            '';
          if (cId) {
            await saveSteadfastBookingAction(order.id, String(cId), String(tCode));
            setSfId(String(cId));
            setTrackingCode(String(tCode));
            setStatus('Shipped via Steadfast');
            alert(`সফলভাবে Steadfast-এ বুক হয়েছে! ID: ${cId}`);
            return;
          }
        }
      } catch {
        // ignore fallback route error
      }

      alert(res.message || 'Steadfast বুকিং সম্পন্ন হয়নি।');
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setLoadingSteadfast(false);
    }
  };

  const handleStatusUpdate = async () => {
    setLoadingStatus(true);
    try {
      const res = await updateOrderStatusAction(order.id, status);
      if (!res.success) {
        alert(res.message || 'আপডেট হয়নি');
      } else if (status === 'Processing') {
        setSfId('');
        setTrackingCode('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে Order #${order.id} ডিলিট করতে চান?`)) return;
    setLoadingDelete(true);
    try {
      const res = await deleteOrderAction(order.id);
      if (res.success) {
        setIsDeleted(true);
      } else {
        alert(res.message || 'ডিলিট করা যায়নি');
      }
    } catch {
      alert('ডিলিট করতে সমস্যা হয়েছে');
    } finally {
      setLoadingDelete(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs text-center uppercase tracking-widest">
        🗑️ Order #{order.id} মুছে ফেলা হয়েছে।
      </div>
    );
  }

  const isFakeId = String(sfId).startsWith('SF-');
  const isReallyBooked = Boolean(sfId) && !isFakeId;

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleSteadfast}
          disabled={loadingSteadfast || isReallyBooked}
          className={`w-full py-3.5 text-xs uppercase tracking-widest font-medium transition shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
            isReallyBooked
              ? 'bg-emerald-800 text-white cursor-default'
              : 'bg-[#242424] hover:bg-black text-white'
          }`}
        >
          <span>
            {loadingSteadfast
              ? '⏳ BOOKING IN STEADFAST PORTAL...'
              : isReallyBooked
              ? `✓ BOOKED IN STEADFAST • CONSIGNMENT ID: ${sfId}`
              : isFakeId
              ? '🚀 CLICK TO RE-BOOK REAL ORDER IN STEADFAST'
              : '🚀 SEND TO STEADFAST COURIER'}
          </span>
        </button>

        {(sfId || trackingCode) && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-950 flex flex-wrap justify-between items-center gap-2 font-mono">
            <div className="flex items-center gap-4">
              {sfId && (
                <span>
                  📦 <strong>Consignment ID:</strong> {sfId} {isFakeId && '(Test/Dummy)'}
                </span>
              )}
              {trackingCode && (
                <span>
                  🔍 <strong>Tracking:</strong> {trackingCode}
                </span>
              )}
            </div>
            {trackingCode && !isFakeId && (
              <a
                href={`https://steadfast.com.bd/t/${trackingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-sans transition"
              >
                Track on Steadfast ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 pt-2">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={status.startsWith('Shipped via Steadfast') ? 'Shipped via Steadfast' : status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-[#E2DDD5] px-4 py-2.5 text-xs focus:outline-none flex-1 lg:w-56"
          >
            <option value="Processing">Processing</option>
            <option value="Shipped via Steadfast">Shipped via Steadfast</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={loadingStatus}
            className="bg-white border border-[#242424] hover:bg-[#242424] hover:text-white px-5 py-2.5 text-xs uppercase tracking-widest font-medium transition cursor-pointer"
          >
            {loadingStatus ? '...' : 'UPDATE'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <span>💬 WHATSAPP INVOICE</span>
          </a>

          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="bg-[#9B704D] hover:bg-amber-800 text-white px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition text-center"
          >
            🖨️ PRINT INVOICE
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loadingDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition cursor-pointer shadow-sm"
          >
            {loadingDelete ? '...' : '🗑️ DELETE'}
          </button>
        </div>
      </div>
    </div>
  );
}