import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFacebookEvent } from "@/lib/facebook-capi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, address, city, paymentMethod, items, total } = body;

    if (!customerName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required order fields or empty cart" }, { status: 400 });
    }

    // ১. ডাটাবেজে অর্ডার সেভ করা
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        phone,
        address,
        city,
        paymentMethod: paymentMethod || "Cash on Delivery",
        items: items,
        total: Number(total),
      },
    });

    // ২. ফেসবুক CAPI-তে Purchase ইভেন্ট পাঠানো
    try {
      await sendFacebookEvent(
        "Purchase",
        {
          currency: "BDT",
          value: Number(total),
          content_type: "product",
          contents: items.map((i: any) => ({ id: i.id, quantity: i.quantity || 1 })),
        },
        {
          phone: phone,
          email: "customer@craftiq.store",
        }
      );
    } catch (capiErr) {
      console.error("Facebook CAPI error:", capiErr);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
