import { prisma } from './prisma';

export async function sendFacebookEvent(eventName: string, eventData: any, userData: { phone?: string, email?: string, clientIp?: string, clientUserAgent?: string }) {
  try {
    const settings = await prisma.settings.get();
    const pixelId = settings?.fbPixelId;
    const accessToken = settings?.fbAccessToken;

    if (!pixelId || !accessToken) {
      console.log('FB Pixel or Access Token not configured yet.');
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const payload = {
      data: [
        {
          event_name: eventName, // যেমন: 'Purchase'
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: 'https://craftiq.store',
          user_data: {
            em: userData.email ? [Buffer.from(userData.email.trim().toLowerCase()).toString('hex')] : undefined,
            ph: userData.phone ? [Buffer.from(userData.phone.replace(/[^0-9]/g, '')).toString('hex')] : undefined,
            client_ip_address: userData.clientIp || '0.0.0.0',
            client_user_agent: userData.clientUserAgent || 'Mozilla/5.0',
          },
          custom_data: eventData,
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('Facebook CAPI Response:', result);
  } catch (err) {
    console.error('Facebook CAPI Error:', err);
  }
}