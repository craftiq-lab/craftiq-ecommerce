'use server';

import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import https from 'https';

// ১. অর্ডার স্ট্যাটাস আপডেট করার ফাংশন
export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const orderModel = (prisma as any).order;
    if (typeof orderModel.update === 'function') {
      await orderModel.update({
        where: { id: orderId },
        data: { status },
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update status' };
  }
}

// ২. অর্ডার ডিলিট করার ফাংশন
export async function deleteOrderAction(orderId: string) {
  try {
    const orderModel = (prisma as any).order;

    if (typeof orderModel.delete === 'function') {
      await orderModel.delete({ where: { id: orderId } });
      return { success: true };
    } else if (typeof orderModel.remove === 'function') {
      await orderModel.remove(orderId);
      return { success: true };
    }

    const possiblePaths = [
      path.join(process.cwd(), 'data', 'db.json'),
      path.join(process.cwd(), 'src', 'data', 'db.json'),
      path.join(process.cwd(), 'db.json'),
      path.join(process.cwd(), 'data', 'orders.json'),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const dbData = JSON.parse(raw);
        if (Array.isArray(dbData)) {
          const filtered = dbData.filter((o: any) => String(o.id) !== String(orderId));
          fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
          return { success: true };
        } else if (dbData && Array.isArray(dbData.orders)) {
          dbData.orders = dbData.orders.filter((o: any) => String(o.id) !== String(orderId));
          fs.writeFileSync(filePath, JSON.stringify(dbData, null, 2));
          return { success: true };
        }
      }
    }

    if (typeof orderModel.update === 'function') {
      await orderModel.update({
        where: { id: orderId },
        data: { status: 'DELETED', isDeleted: true },
      });
      return { success: true };
    }

    return { success: false, message: 'Delete method not supported' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete order' };
  }
}

// Node.js Native HTTPS Request (GitHub Codespaces-এ fetch failed বাইপাস করার জন্য IPv4 ফোর্সড)
function postSteadfastNative(
  urlStr: string,
  headers: Record<string, string>,
  payload: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyString = JSON.stringify(payload);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      family: 4, // Force IPv4 so Codespaces never throws "fetch failed"
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': Buffer.byteLength(bodyString),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(rawData) });
        } catch {
          reject(new Error(`Invalid JSON from Steadfast (HTTP ${res.statusCode}): ${rawData.slice(0, 120)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.write(bodyString);
    req.end();
  });
}

// ৩. Steadfast বুকিং সার্ভার অ্যাকশন
export async function bookSteadfastOrderAction(orderId: string) {
  try {
    const orderModel = (prisma as any).order;
    const allOrders = await orderModel.findMany();
    const order = Array.isArray(allOrders)
      ? allOrders.find((o: any) => String(o.id) === String(orderId))
      : null;

    if (!order) {
      return { success: false, message: 'অর্ডারটি খুঁজে পাওয়া যায়নি!' };
    }

    // ক্রেডেনশিয়াল খোঁজা (Database Settings, JSON file, অথবা .env)
    let settings: any = null;
    try {
      const sModel =
        (prisma as any).settings ||
        (prisma as any).setting ||
        (prisma as any).storeSettings;
      if (sModel) {
        if (typeof sModel.get === 'function') settings = await sModel.get();
        else if (typeof sModel.findFirst === 'function') settings = await sModel.findFirst();
        else if (typeof sModel.findMany === 'function') {
          const list = await sModel.findMany();
          settings = Array.isArray(list) ? list[0] : list;
        }
      }
    } catch {
      settings = null;
    }

    if (!settings) {
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'db.json'),
        path.join(process.cwd(), 'src', 'data', 'db.json'),
        path.join(process.cwd(), 'data', 'settings.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
          if (parsed?.settings) settings = parsed.settings;
          else if (parsed?.steadfastApiKey || parsed?.steadfast_api_key) settings = parsed;
        }
      }
    }

    const apiKey = String(
      settings?.steadfastApiKey ||
        settings?.steadfast_api_key ||
        settings?.apiKey ||
        process.env.STEADFAST_API_KEY ||
        process.env.NEXT_PUBLIC_STEADFAST_API_KEY ||
        ''
    ).trim();

    const secretKey = String(
      settings?.steadfastSecretKey ||
        settings?.steadfast_secret_key ||
        settings?.secretKey ||
        process.env.STEADFAST_SECRET_KEY ||
        process.env.NEXT_PUBLIC_STEADFAST_SECRET_KEY ||
        ''
    ).trim();

    if (!apiKey || !secretKey) {
      return {
        success: false,
        message: 'আপনার Settings অথবা .env ফাইলে Steadfast API Key এবং Secret Key পাওয়া যায়নি!',
      };
    }

    // ফোন নম্বর ১১ ডিজিট যাচাই
    let bdPhone = String(
      order.phone || order.shippingPhone || order.customerPhone || ''
    ).replace(/\D/g, '');
    if (bdPhone.startsWith('880')) bdPhone = bdPhone.slice(2);
    else if (bdPhone.length === 10 && bdPhone.startsWith('1')) bdPhone = '0' + bdPhone;

    if (bdPhone.length !== 11 || !bdPhone.startsWith('01')) {
      return {
        success: false,
        message: `কাস্টমারের সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রয়োজন! (বর্তমান নম্বর: ${bdPhone})`,
      };
    }

    // নতুন ইউনিক ইনভয়েস আইডি যাতে ডুপ্লিকেট ইনভয়েস এরর না দেয়
    const cleanInvoice =
      String(order.id).replace(/[^a-zA-Z0-9_-]/g, '') +
      '-' +
      String(Date.now()).slice(-4);

    const payload = {
      invoice: cleanInvoice,
      recipient_name: order.customerName || order.name || 'Craftiq Guest',
      recipient_phone: bdPhone,
      recipient_address: order.shippingAddress || order.address || 'Dhaka, Bangladesh',
      cod_amount: Number(order.total || order.totalAmount || 0),
      note: 'Handle with care - Craftiq Artisan Woodcraft',
    };

    const headers = {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
    };

    // প্রথমে নতুন Packzy API ডোমেইন ও পরে পুরাতন পোর্টাল ডোমেইনে চেষ্টা করা
    let apiRes: any = null;
    try {
      apiRes = await postSteadfastNative(
        'https://portal.packzy.com/api/v1/create_order',
        headers,
        payload
      );
    } catch {
      apiRes = await postSteadfastNative(
        'https://portal.steadfast.com.bd/api/v1/create_order',
        headers,
        payload
      );
    }

    const result = apiRes?.data;

    if (!result || result.status !== 200 || !result.consignment) {
      const errMsg = result?.errors
        ? JSON.stringify(result.errors)
        : result?.message || 'Steadfast সার্ভার অর্ডারটি গ্রহণ করেনি। আপনার API Key চেক করুন।';
      return { success: false, message: `Steadfast Error: ${errMsg}` };
    }

    const realConsignmentId = String(result.consignment.consignment_id);
    const realTrackingCode = String(result.consignment.tracking_code);
    const updatedStatus = 'Shipped via Steadfast';

    if (typeof orderModel.update === 'function') {
      await orderModel.update({
        where: { id: orderId },
        data: {
          status: updatedStatus,
          consignmentId: realConsignmentId,
          steadfastId: realConsignmentId,
          sfId: realConsignmentId,
          trackingCode: realTrackingCode,
          courier: 'Steadfast',
        },
      });
    }

    return {
      success: true,
      consignmentId: realConsignmentId,
      trackingCode: realTrackingCode,
      status: updatedStatus,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `কানেকশন এরর: ${err.message}`,
    };
  }
}

// ৪. লোকাল API রাউট থেকে বুক হলে ডাটাবেজে সেভ করার হেল্পার
export async function saveSteadfastBookingAction(
  orderId: string,
  consignmentId: string,
  trackingCode: string
) {
  try {
    const orderModel = (prisma as any).order;
    if (typeof orderModel.update === 'function') {
      await orderModel.update({
        where: { id: orderId },
        data: {
          status: 'Shipped via Steadfast',
          consignmentId,
          steadfastId: consignmentId,
          sfId: consignmentId,
          trackingCode,
          courier: 'Steadfast',
        },
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}