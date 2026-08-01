# Deployment Guide

This guide covers deploying the AI Dental Appointment Booking System to production.

## Quick Start - Vercel Deployment (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications.

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI dental appointment booking system"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/dental-appointment-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and create an account (or login)
3. Click "New Project"
4. Click "Import Git Repository"
5. Authorize Vercel to access your GitHub account
6. Select your `dental-appointment-ai` repository
7. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to "Settings" > "Environment Variables"
2. Add all variables from your `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
GOOGLE_CLIENT_EMAIL=dental-clinic-bot@xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
CLINIC_NAME=Smile Dental Clinic
CLINIC_ADDRESS=123 Main Street
CLINIC_PHONE=+1-555-123-4567
CLINIC_EMAIL=contact@smiledentalclinic.com
CLINIC_TIMEZONE=America/New_York
CLINIC_OPENING_TIME=09:00
CLINIC_CLOSING_TIME=19:00
CLINIC_BREAK_START=13:00
CLINIC_BREAK_END=14:00
ADMIN_EMAIL=admin@smiledentalclinic.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

3. For `GOOGLE_PRIVATE_KEY`, make sure newlines are actual newlines, not `\n` strings

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a live URL

Vercel will automatically redeploy whenever you push to the `main` branch.

## Alternative Deployments

### AWS Lambda + API Gateway

```bash
# Install AWS CLI
npm install -g @aws-amplify/cli

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### Google Cloud Run

```bash
# Install Google Cloud SDK
# Then authenticate
gcloud auth login

# Create a Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./. next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and deploy
gcloud run deploy dental-booking --source .
```

### Digital Ocean App Platform

1. Go to [digitalocean.com](https://digitalocean.com)
2. Click "Create" > "Apps"
3. Connect your GitHub repository
4. Set environment variables
5. Choose "Node.js" as runtime
6. Deploy

### Docker Deployment (General)

```bash
# Create Dockerfile (if not present)
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build image
docker build -t dental-booking:latest .

# Run container
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -e GOOGLE_CLIENT_EMAIL=$GOOGLE_CLIENT_EMAIL \
  -e GOOGLE_PRIVATE_KEY=$GOOGLE_PRIVATE_KEY \
  -e GOOGLE_CALENDAR_ID=$GOOGLE_CALENDAR_ID \
  dental-booking:latest
```

## Post-Deployment Checklist

- [ ] Test the chat interface
- [ ] Verify appointment booking flow
- [ ] Check Google Calendar sync
- [ ] Test admin dashboard
- [ ] Verify all API endpoints
- [ ] Check error handling
- [ ] Test on mobile devices
- [ ] Verify environment variables are set
- [ ] Check logs for any errors
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure custom domain
- [ ] Set up email notifications (optional)
- [ ] Enable HTTPS (automatic on Vercel)

## Monitoring & Debugging

### Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

### Custom Monitoring

Add error tracking:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig({
  // ... rest of Next.js config
});
```

### Performance Monitoring

1. Use Vercel Analytics (built-in)
2. Add Google Analytics
3. Monitor API response times
4. Check database query performance

## Scaling Considerations

As your clinic grows:

### Database
- Supabase automatically scales PostgreSQL
- Keep indexes optimized
- Archive old appointments
- Monitor query performance

### API Rate Limiting
Consider adding rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

### Caching
Add Redis caching for:
- Clinic configuration
- Dental services list
- Availability calculations

### Load Balancing
Vercel handles this automatically, but for self-hosted:
- Use Nginx or HAProxy
- Enable sticky sessions
- Monitor server health

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database:

1. Go to Supabase dashboard
2. Project Settings > Backups
3. Manual backups available anytime

To restore:
1. Go to Backups tab
2. Click "Restore" on desired backup
3. Confirm (this overwrites current data)

### Code Backups

Your GitHub repository is your code backup. To restore:

```bash
git clone https://github.com/yourusername/dental-appointment-ai.git
cd dental-appointment-ai
npm install
npm run build
```

### Environment Variable Backup

Store your `.env.local` securely:
- Use a password manager
- Store in a secure location
- Never commit to version control
- Document which service each key is for

## Troubleshooting Deployment

### Build Fails on Vercel

Check these:
- All dependencies installed: `npm install`
- Build passes locally: `npm run build`
- TypeScript errors: `npm run type-check`
- ESLint issues: `npm run lint`

### Environment Variables Not Working

- Verify variable names match exactly
- Check for typos (they're case-sensitive)
- Ensure newlines in keys are actual newlines
- Restart deployment after adding variables

### Database Connection Issues

- Verify Supabase URL is correct
- Check that keys are from correct project
- Ensure database tables exist (run migration)
- Check if RLS policies are blocking access

### Google Calendar Not Syncing

- Verify service account has Editor access to calendar
- Check that Calendar API is enabled
- Verify calendar ID is correct
- Check Google Cloud project permissions

### Slow Performance

- Check database query times
- Review Vercel Analytics
- Optimize images
- Add caching where appropriate
- Consider upgrading Supabase plan

## Security in Production

### Environment Variables
- ✅ Never log secrets
- ✅ Use Vercel's secure storage
- ✅ Rotate keys periodically
- ✅ Use different keys per environment

### HTTPS
- ✅ Automatic on Vercel
- ✅ Redirect HTTP to HTTPS
- ✅ Add security headers

### Database
- ✅ Enable row-level security
- ✅ Backup regularly
- ✅ Monitor access logs
- ✅ Use strong passwords

### API Security
- ✅ Validate all input
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Request logging

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor API response times
- Verify calendar sync is working

**Monthly:**
- Review usage statistics
- Check for dependency updates
- Test admin dashboard

**Quarterly:**
- Security audit
- Performance optimization
- Update dependencies

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update major versions (be careful)
npm install next@latest

# Test everything
npm run build
npm run test
npm run lint
```

## Rollback Plan

If something goes wrong:

```bash
# Check Vercel deployments
vercel list

# Revert to previous version
vercel rollback <deployment-id>

# Or manually redeploy from git
git revert <commit-hash>
git push
# Vercel will auto-redeploy
```

## Cost Estimation

### Vercel
- **Free plan**: Perfect for development
- **Pro plan**: $20/month for production
- **Enterprise**: Custom pricing

### Supabase
- **Free tier**: Up to 500MB storage, fine for small clinics
- **Pro plan**: $25/month, up to 8GB storage
- **Team plan**: $599+/month for enterprise

### Google Cloud
- **Calendar API**: Free tier includes 1 million reads/month
- **Additional**: $0.10 per 1000 reads

### Anthropic
- **Pay-as-you-go**: $0.80 per 1M input tokens, $2.40 per 1M output tokens
- **Typical usage**: ~$5-20/month for small clinic

**Total Monthly Cost**: ~$30-60 for small clinic (including credits)

## Support & Monitoring

### Error Tracking
- Set up Sentry or similar
- Get alerts for production errors
- Track user impact

### Analytics
- Vercel Analytics (built-in)
- Google Analytics (optional)
- Custom metrics

### Uptime Monitoring
- Uptimerobot.com (free)
- Datadog (paid)
- Custom health checks

---

**Need help?** Check the troubleshooting section or review the README.md for more information.
