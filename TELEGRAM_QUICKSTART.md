# Telegram Mini App - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Create Telegram Bot
1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts to create your bot
4. **Copy the bot token** (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Configure Environment
Edit `.env` file:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_NAME=your_bot_name
```

### Step 3: Start Development Servers
```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm run dev
```

### Step 4: Setup Bot Web App (BotFather)
1. Open @BotFather again
2. Send `/setmenubutton`
3. Select your bot
4. Choose "Web App"
5. Set URL to: `https://your-domain.com/tg/auth` (or `http://localhost:8080/tg/auth` for local)

### Step 5: Test in Telegram
1. Open Telegram
2. Find your bot
3. Click the menu button to open the Mini App
4. Enter your Teacher ID when prompted
5. Authenticate!

---

## 📱 Available Pages

| Route | Purpose | Features |
|-------|---------|----------|
| `/tg/auth` | Login | Authenticate via Telegram |
| `/tg/overview` | Dashboard | Profile, stats, quick links |
| `/tg/trainings` | Training List | View enrolled & completed trainings |
| `/tg/achievements` | Certificates | View earned certificates & badges |
| `/tg/settings` | Settings | Theme, font, notifications, logout |

---

## 🔐 How Authentication Works

### First Time User
```
User opens Mini App
    ↓
TelegramAuth page loads
    ↓
Backend validates Telegram data
    ↓
No existing record found
    ↓
User enters Teacher ID
    ↓
System links accounts
    ↓
JWT token issued
    ↓
Redirect to /tg/overview
```

### Returning User
```
User opens Mini App
    ↓
TelegramAuth detects existing record
    ↓
Backend validates Telegram data
    ↓
JWT token issued
    ↓
Redirect to /tg/overview
```

---

## 🛠️ Backend Routes

### Telegram Authentication
```bash
POST /api/auth/telegram-login
Content-Type: application/json

{
  "initData": "query_id=...",
  "teacher_id": "TCH-2024-001"  // optional for existing users
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "teacher_id": "TCH-2024-001",
    "name": "សម្ដេច",
    "beneficiary": { ... }
  }
}
```

### Link Account
```bash
POST /api/auth/telegram-link
Content-Type: application/json

{
  "telegram_id": 123456789,
  "teacher_id": "TCH-2024-001"
}
```

---

## 💡 Tips & Tricks

### For Developers

**Access Telegram Context:**
```typescript
import { useTelegram } from '@/contexts/TelegramContext';

function MyComponent() {
  const { hapticFeedback, showMainButton, user } = useTelegram();

  return (
    <button onClick={() => hapticFeedback?.('light')}>
      Click me
    </button>
  );
}
```

**Use Navigation:**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/tg/trainings');
```

**Add Haptic Feedback:**
```typescript
const { hapticFeedback } = useTelegram();

// Light, medium, heavy, rigid, soft
hapticFeedback?.('light');
```

---

## 🐛 Debugging

### Check if running in Telegram
```typescript
const { isRunningInTelegram } = useTelegram();
console.log(isRunningInTelegram); // true or false
```

### Check initData
```typescript
const { initData, user } = useTelegram();
console.log('Init Data:', initData);
console.log('Telegram User:', user);
```

### Check theme
```typescript
const { theme } = useTelegram();
console.log('Theme:', theme);
```

---

## 🔗 Common Links

| Resource | URL |
|----------|-----|
| Telegram Bot API | https://core.telegram.org/bots/api |
| WebApp Docs | https://core.telegram.org/bots/webapps |
| @BotFather | https://t.me/botfather |
| SDK Docs | https://github.com/twa-dev/sdk |

---

## ⚠️ Important Notes

1. **HTTPS Required** - Telegram WebApp only works over HTTPS
   - Use ngrok for local development: `ngrok http 8080`
   - Or deploy to production with HTTPS

2. **Bot Token Secret** - Never expose bot token in frontend
   - Always validate signatures on backend
   - Use environment variables

3. **Teacher ID Required** - New users must provide teacher ID to link accounts
   - Match against existing Beneficiary records
   - Can match by phone or email as fallback

4. **JWT Token** - Issued after successful Telegram validation
   - Valid for 7 days (configurable)
   - Stored in localStorage
   - Sent with all API requests

---

## 📊 Testing Checklist

- [ ] Bot token configured in .env
- [ ] Backend running on port 3000
- [ ] Frontend running on port 8080
- [ ] Can open Mini App in Telegram
- [ ] Can authenticate with teacher ID
- [ ] All 4 pages load without errors
- [ ] Can navigate between pages
- [ ] MainButton works on overview
- [ ] BackButton works on all pages
- [ ] Haptic feedback triggers on click
- [ ] Theme switches correctly
- [ ] Font selection works
- [ ] Can logout

---

## 🎯 Next Steps

1. **Test locally** with ngrok
2. **Deploy frontend** to hosting (Vercel, Netlify, etc.)
3. **Deploy backend** to server (Railway, Heroku, AWS, etc.)
4. **Update Web App URL** in BotFather with production domain
5. **Monitor logs** for errors
6. **Gather feedback** from users

---

## 📞 Support

For issues or questions:
1. Check the implementation guide: `/TELEGRAM_MINIAPP_IMPLEMENTATION.md`
2. Review code comments in `/src/contexts/TelegramContext.tsx`
3. Check Telegram WebApp docs: https://core.telegram.org/bots/webapps
4. File GitHub issues with error logs

---

**Status**: Ready for Testing ✅
**Last Updated**: December 29, 2025
