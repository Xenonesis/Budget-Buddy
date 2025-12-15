# Serverless Functions - Quick Start

Get your serverless functions running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (1 min)

```bash
npm install --legacy-peer-deps
```

### 2. Set Environment Variables (2 min)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Start Development Server (1 min)

```bash
npm run dev
```

### 4. Test Your Functions (1 min)

```bash
# Health check
curl http://localhost:3000/api/health

# Or open in browser
open http://localhost:3000/api/health
```

## ✅ Available Endpoints

| Endpoint                 | Description        | Auth Required |
| ------------------------ | ------------------ | ------------- |
| `GET /api`               | API info           | ❌            |
| `GET /api/health`        | Health check       | ❌            |
| `GET /api/transactions`  | List transactions  | ✅            |
| `POST /api/transactions` | Create transaction | ✅            |
| `GET /api/budgets`       | List budgets       | ✅            |
| `GET /api/analytics`     | Get analytics      | ✅            |
| `GET /api/users`         | Get profile        | ✅            |

## 🎯 Quick Examples

### Get Health Status

```bash
curl http://localhost:3000/api/health
```

### Create Transaction (Authenticated)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "type": "expense",
    "description": "Lunch"
  }'
```

### Get Analytics

```bash
curl http://localhost:3000/api/analytics?type=summary \
  -H "Cookie: your-session-cookie"
```

## 🚢 Deploy to Vercel

### Option 1: One Command

```bash
npm install -g vercel
vercel --prod
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy"

Done! 🎉

## 📚 Next Steps

- Read full [API Documentation](./README.md)
- Check [Deployment Guide](../SERVERLESS_DEPLOYMENT_GUIDE.md)
- See [Code Examples](./EXAMPLES.md)

## 🆘 Troubleshooting

### Issue: Cannot connect to Supabase

**Fix**: Check your environment variables

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: CORS errors

**Fix**: CORS is enabled by default. Check your request headers.

### Issue: Authentication fails

**Fix**: Make sure you're sending the session cookie or Authorization header.

## 💡 Tips

- Use `vercel dev` to simulate Vercel environment locally
- Check logs with `vercel logs --follow`
- Test with Postman or Insomnia for easier API testing
- Enable hot reload with `npm run dev`

---

Need help? Check the [full documentation](./README.md) or open an issue!
