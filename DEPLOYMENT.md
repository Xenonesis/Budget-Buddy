# 🚀 Budget Buddy v22.00 Deployment Guide

## Vercel Deployment Troubleshooting

### Common Issues and Solutions

#### 1. **Vercel Not Updating**
If Vercel is not reflecting your latest changes, try these steps:

```bash
# 1. Clear local build cache
npm run clean

# 2. Force reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Manual deployment
vercel --prod --force
```

#### 2. **Environment Variables**
Ensure these environment variables are set in your Vercel dashboard:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers (at least one required)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 3. **Build Configuration**
The project uses these build settings:
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node.js Version**: 18.x

#### 4. **Force Deployment**
To force a new deployment:

```bash
# Using Vercel CLI
vercel --prod --force

# Or trigger via Git
git commit --allow-empty -m "Force deployment v22.00"
git push origin main
```

#### 5. **Cache Issues**
If experiencing cache issues:

1. **Clear Vercel Cache**: Go to Vercel Dashboard → Project → Settings → Functions → Clear Cache
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. **Clear CDN Cache**: Wait 5-10 minutes for global CDN propagation

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build command set to `npm run vercel-build`
- [ ] Output directory set to `.next`
- [ ] Node.js version set to 18.x
- [ ] All dependencies installed
- [ ] No build errors in local environment

### Version Information

- **Current Version**: v22.00
- **Last Updated**: September 8, 2025
- **Build Target**: Next.js 15.5.0
- **Node.js**: 18.x or higher

### Support

If deployment issues persist:
1. Check Vercel build logs
2. Verify all environment variables
3. Test local build with `npm run build`
4. Contact support with build logs

---

**Made with ❤️ by the Budget Buddy Team**