# Serverless Functions Setup Checklist

Use this checklist to ensure your serverless functions are properly set up and deployed.

## 📋 Pre-Deployment Checklist

### 1. Installation & Dependencies

- [ ] Run `npm install --legacy-peer-deps`
- [ ] Verify `@vercel/node` is installed
- [ ] Check `node_modules` folder exists
- [ ] Verify Node.js version >= 18.0.0

```bash
npm install --legacy-peer-deps
node --version  # Should be >= 18.0.0
```

### 2. Environment Variables

- [ ] Copy `.env.serverless.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] (Optional) Set AI API keys if using AI features
- [ ] Verify environment variables are loaded

```bash
cp .env.serverless.example .env.local
# Edit .env.local with your values
```

### 3. TypeScript Configuration

- [ ] Verify `api/tsconfig.json` exists
- [ ] Run TypeScript check (after installing dependencies)
- [ ] Fix any TypeScript errors

```bash
npm run type-check
```

### 4. Local Testing

- [ ] Start development server: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`
- [ ] Test authenticated endpoints (if you have auth token)
- [ ] Run test script: `bash scripts/test-serverless.sh`

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/health
```

### 5. Vercel Configuration

- [ ] Verify `vercel.json` has functions configuration
- [ ] Check function settings (maxDuration, memory, runtime)
- [ ] Ensure `api/.vercelignore` exists
- [ ] Review CORS and security headers

### 6. Documentation Review

- [ ] Read `api/QUICK_START.md`
- [ ] Review `api/README.md` for API details
- [ ] Check `SERVERLESS_DEPLOYMENT_GUIDE.md`
- [ ] Browse `api/EXAMPLES.md` for code patterns

## 🚀 Deployment Checklist

### Option A: Deploy via Vercel CLI

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link` (first time only)
- [ ] Deploy to preview: `vercel`
- [ ] Test preview deployment
- [ ] Deploy to production: `vercel --prod`

```bash
npm install -g vercel
vercel login
vercel link
vercel --prod
```

### Option B: Deploy via GitHub

- [ ] Push code to GitHub
- [ ] Go to vercel.com and import repository
- [ ] Configure build settings
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy

### 7. Post-Deployment Verification

- [ ] Test production health endpoint
- [ ] Verify authentication works
- [ ] Test all CRUD operations
- [ ] Check CORS headers
- [ ] Monitor logs: `vercel logs`
- [ ] Verify rate limiting works

```bash
# Test production
curl https://your-app.vercel.app/api/health
vercel logs --follow
```

## 🔧 Configuration Checklist

### Environment Variables in Vercel

- [ ] Go to Project Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)
- [ ] Add any AI API keys if needed
- [ ] Add optional configuration variables
- [ ] Save and redeploy

### Function Settings

- [ ] Max Duration: 30 seconds (configurable)
- [ ] Memory: 1024 MB (configurable)
- [ ] Runtime: @vercel/node@3
- [ ] Region: Auto (or specify)

## 🧪 Testing Checklist

### Automated Tests

- [ ] Run local test script
- [ ] Test all public endpoints
- [ ] Test authenticated endpoints
- [ ] Test error cases
- [ ] Test rate limiting
- [ ] Test CORS

```bash
# Local testing
bash scripts/test-serverless.sh

# Production testing
BASE_URL="https://your-app.vercel.app" \
AUTH_TOKEN="your-token" \
bash scripts/test-serverless.sh
```

### Manual Testing

- [ ] Test with curl
- [ ] Test with Postman/Insomnia
- [ ] Test in browser (for GET endpoints)
- [ ] Test error responses
- [ ] Test with invalid data
- [ ] Test authentication failures

## 📊 Monitoring Checklist

### Setup Monitoring

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure alerts

### Regular Checks

- [ ] Check function execution times
- [ ] Monitor error rates
- [ ] Review logs regularly
- [ ] Check bandwidth usage
- [ ] Monitor costs

```bash
# View logs
vercel logs --follow

# Check function metrics
vercel inspect <deployment-url>
```

## 🔐 Security Checklist

### Pre-Deployment Security

- [ ] Review authentication implementation
- [ ] Verify rate limiting is enabled
- [ ] Check CORS configuration
- [ ] Review error messages (no sensitive data)
- [ ] Ensure HTTPS only
- [ ] Validate all inputs
- [ ] Sanitize outputs

### Post-Deployment Security

- [ ] Test authentication bypass attempts
- [ ] Test rate limiting
- [ ] Test SQL injection protection
- [ ] Test XSS protection
- [ ] Verify no sensitive data in logs
- [ ] Check security headers

## 📚 Documentation Checklist

- [ ] README updated with serverless info
- [ ] API documentation complete
- [ ] Examples provided
- [ ] Deployment guide available
- [ ] Troubleshooting section complete
- [ ] Code comments adequate

## 🎯 Performance Checklist

### Optimization

- [ ] Enable response caching where appropriate
- [ ] Minimize cold start time
- [ ] Use connection pooling
- [ ] Optimize database queries
- [ ] Reduce bundle size
- [ ] Enable compression

### Monitoring

- [ ] Track cold start times
- [ ] Monitor response times
- [ ] Check memory usage
- [ ] Review function timeouts
- [ ] Analyze traffic patterns

## ✅ Final Pre-Launch Checklist

- [ ] All endpoints tested and working
- [ ] Documentation complete and accurate
- [ ] Environment variables configured
- [ ] Monitoring and logging set up
- [ ] Security review completed
- [ ] Performance optimization done
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Team trained on deployment
- [ ] Support contacts available

## 🆘 Troubleshooting Quick Reference

### Issue: Function won't deploy

- Check TypeScript errors: `npm run type-check`
- Verify dependencies: `npm install`
- Check vercel.json syntax

### Issue: Environment variables not working

- Verify they're set in Vercel dashboard
- Check they're added to all environments
- Pull latest: `vercel env pull`

### Issue: Authentication failing

- Verify Supabase URL and key
- Check session cookie is being sent
- Test with valid token

### Issue: CORS errors

- Verify CORS enabled in handler config
- Check allowed origins
- Test OPTIONS preflight

### Issue: Rate limiting too strict

- Adjust `RATE_LIMIT_MAX_REQUESTS`
- Adjust `RATE_LIMIT_WINDOW_MS`
- Consider Redis for production

## 📞 Support Resources

- **Documentation**: `api/README.md`
- **Examples**: `api/EXAMPLES.md`
- **Deployment**: `SERVERLESS_DEPLOYMENT_GUIDE.md`
- **Quick Start**: `api/QUICK_START.md`
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## Quick Command Reference

```bash
# Development
npm run dev                          # Start dev server
npm run type-check                   # Check TypeScript
bash scripts/test-serverless.sh      # Run tests

# Deployment
vercel                              # Deploy to preview
vercel --prod                       # Deploy to production
vercel logs                         # View logs
vercel env pull                     # Pull environment variables

# Testing
curl http://localhost:3000/api/health
curl https://your-app.vercel.app/api/health
```

---

**Ready to deploy?** Make sure all items are checked! ✅
