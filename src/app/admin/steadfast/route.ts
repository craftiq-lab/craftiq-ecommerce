import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    const order = await (prisma.order as any).findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Settings বা .env থেকে API Key নেওয়া
    let settings: any = null;
    try {
      settings = await prisma.settings?.get?.();
    } catch (e) {
      settings = null;
    }

    const apiKey = settings?.steadfastApiKey || process.env.STEADFAST_API_KEY;
    const secretKey = settings?.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'Steadfast API Key or Secret Key missing in Settings or .env!' 
      }, { status: 400 });
    }

    // Steadfast API Call
    const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice: order.id,
        recipient_name: order.customerName || order.name || 'Customer',
        recipient_phone: order.phone || order.shippingPhone || '',
        recipient_address: order.shippingAddress || order.address || 'Dhaka',
        cod_amount: Number(order.total || order.totalAmount || 0),
      }),
    });

    const result = await response.json();

    if (response.ok && result.status) {
      // অর্ডার স্ট্যাটাস SHIPPED আপডেট করা
      await (prisma.order as any).update({
        where: { id: orderId },
        data: { status: 'SHIPPED' },
      });

      return NextResponse.json({ success: true, message: 'Order sent to Steadfast successfully!' });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Failed to send order to Steadfast' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Steadfast error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}