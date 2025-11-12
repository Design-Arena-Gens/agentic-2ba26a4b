# eSports WhatsApp Manager

A lightweight dashboard to manage your eSports group ops and send announcements via WhatsApp Cloud API (1:1). Designed for quick Vercel deployment.

## Features
- Players list with ranks
- Tournament planner with teams and rules
- Announcement composer with quick templates
- WhatsApp Cloud API send endpoint (`/api/whatsapp/send`)
- WhatsApp webhook verify/receive (`/api/whatsapp/webhook`)

Note: WhatsApp Cloud API supports 1:1 messages; group automation is not available.

## Local Setup
```bash
npm install
cp .env.local.example .env.local # fill values if you have API creds
npm run dev
```

## Build
```bash
npm run build && npm start
```

## Environment Variables
- `WHATSAPP_TOKEN`: Permanent token from Meta
- `WHATSAPP_PHONE_NUMBER_ID`: Phone number ID (not the phone number)
- `WHATSAPP_VERIFY_TOKEN`: Arbitrary string to verify webhook

## API
- `POST /api/whatsapp/send` body: `{ "to": "+911234567890", "message": "text" }`
- `GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...` for verification
- `POST /api/whatsapp/webhook` receives inbound events

## Deploy (Vercel)
Set env vars in Vercel project if you plan to send messages. Then deploy.
