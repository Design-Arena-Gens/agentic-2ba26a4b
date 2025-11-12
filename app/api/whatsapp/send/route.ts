import { NextRequest, NextResponse } from 'next/server';

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

export async function POST(req: NextRequest) {
  try {
    const { to, message } = (await req.json()) as { to?: string; message?: string };
    if (!to || !message) {
      return NextResponse.json({ error: 'to and message are required' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        { error: 'WhatsApp API not configured on server' },
        { status: 500 }
      );
    }

    const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Failed to send' }, { status: res.status });
    }

    return NextResponse.json({ ok: true, id: data?.messages?.[0]?.id ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
