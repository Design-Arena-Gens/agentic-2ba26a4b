import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Minimal logging payload skeleton; do not echo PII back
    const entry = Array.isArray(body?.entry) ? body.entry[0] : undefined;
    const change = Array.isArray(entry?.changes) ? entry.changes[0] : undefined;
    const messages = change?.value?.messages;

    // Optional: basic auto-reply to recognized keywords
    // Note: Group conversations are not supported by Cloud API; this handles 1:1 messages only.

    return NextResponse.json({ received: !!messages }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
