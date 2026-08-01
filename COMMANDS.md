# Quick Commands Reference

## Project Setup

```bash
# Install dependencies
npm install

# Create environment file from template
cp .env.example .env.local

# Edit environment variables with your credentials
# Use your text editor to edit .env.local
```

## Development

```bash
# Start development server
npm run dev
# Open http://localhost:3000

# Run in another terminal while dev server is running:

# Type checking (verify no TypeScript errors)
npm run type-check

# Linting (check code style)
npm run lint

# Run tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

## Production Build

```bash
# Build for production
npm run build

# Start production server (after build)
npm start
```

## Git & Version Control

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: AI dental appointment booking system"

# Add remote repository
git remote add origin https://github.com/yourusername/dental-appointment-ai.git

# Rename branch to main (if on master)
git branch -M main

# Push to GitHub
git push -u origin main

# Push future commits
git push
```

## Database Setup (Supabase)

```bash
# No CLI commands needed - use Supabase web interface:
# 1. Create project at https://supabase.com
# 2. Go to SQL Editor
# 3. Copy contents of migrations/001_create_appointments_table.sql
# 4. Paste into SQL Editor and run
```

## Deployment (Vercel)

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel

# View logs
vercel logs

# Set environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc for each variable
```

## Environment Variables

Create `.env.local` with these variables:

```
ANTHROPIC_API_KEY=your-key-here
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here
GOOGLE_CLIENT_EMAIL=your-email-here
GOOGLE_PRIVATE_KEY=your-key-here
GOOGLE_CALENDAR_ID=your-calendar-id-here
CLINIC_NAME=Your Clinic Name
CLINIC_ADDRESS=Your Address
CLINIC_PHONE=+1-555-123-4567
CLINIC_EMAIL=clinic@email.com
CLINIC_TIMEZONE=America/New_York
CLINIC_OPENING_TIME=09:00
CLINIC_CLOSING_TIME=19:00
CLINIC_BREAK_START=13:00
CLINIC_BREAK_END=14:00
ADMIN_EMAIL=admin@clinic.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Tasks

### Add a New Dental Service

1. Open `lib/clinic-config.ts`
2. Add to `dentalServices` array:

```typescript
{
  id: '13',
  name: 'New Service Name',
  description: 'Service description',
  duration_minutes: 30,
  price: 100,
  category: 'Category',
}
```

3. Save file
4. Restart dev server

### Change Clinic Hours

Edit `.env.local`:

```
CLINIC_OPENING_TIME=08:00
CLINIC_CLOSING_TIME=18:00
CLINIC_BREAK_START=12:00
CLINIC_BREAK_END=13:00
```

Restart dev server.

### Update Clinic Information

Edit `.env.local`:

```
CLINIC_NAME=New Name
CLINIC_ADDRESS=New Address
CLINIC_PHONE=New Phone
CLINIC_EMAIL=new@email.com
```

Restart dev server.

### Modify AI Receptionist Behavior

1. Open `lib/claude-client.ts`
2. Edit `systemPrompt` variable
3. Save file
4. Restart dev server

### Change UI Theme Colors

1. Open `tailwind.config.ts`
2. Modify the color definitions
3. Save file
4. Browser will hot-reload

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test utils.test.ts

# Run tests matching a pattern
npm test availability

# Run tests with coverage
npm test -- --coverage

# Watch mode (reruns on file changes)
npm run test:watch
```

## Code Quality Commands

```bash
# Check TypeScript types
npm run type-check

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# View next.js build analysis
npm run build -- --analyze
```

## Troubleshooting Commands

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js build
rm -rf .next

# Check if port 3000 is in use (Linux/Mac)
lsof -i :3000

# Kill process on port 3000 (Linux/Mac)
kill -9 $(lsof -t -i:3000)

# Check npm version
npm --version

# Check Node version
node --version

# Update npm
npm install -g npm@latest

# View npm logs
npm ls
```

## GitHub Commands

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Describe your changes"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Delete branch
git branch -d feature/old-feature

# View all branches
git branch -a
```

## Vercel Deployment Commands

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# Set environment variable
vercel env add VARIABLE_NAME

# List deployments
vercel list

# Rollback to previous version
vercel rollback
```

## Docker Commands (if using Docker)

```bash
# Build Docker image
docker build -t dental-booking:latest .

# Run Docker container
docker run -p 3000:3000 dental-booking:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  dental-booking:latest

# Stop container
docker stop container_id

# List containers
docker ps

# Remove image
docker rmi dental-booking:latest
```

## Helpful Resources

### View Project Files
```bash
# List files in current directory
ls

# List with details
ls -la

# List only directories
ls -d */

# Find file
find . -name "filename.ts"

# Search in files
grep -r "search-term" .
```

### View Logs
```bash
# Dev server logs (in terminal)
npm run dev

# Build logs
npm run build

# Test logs
npm test
```

## Environment Variables Checklist

Before deploying, verify all these are set:

- [ ] ANTHROPIC_API_KEY
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] GOOGLE_CLIENT_EMAIL
- [ ] GOOGLE_PRIVATE_KEY
- [ ] GOOGLE_CALENDAR_ID
- [ ] CLINIC_NAME
- [ ] CLINIC_ADDRESS
- [ ] CLINIC_PHONE
- [ ] CLINIC_EMAIL
- [ ] CLINIC_TIMEZONE
- [ ] CLINIC_OPENING_TIME
- [ ] CLINIC_CLOSING_TIME
- [ ] CLINIC_BREAK_START
- [ ] CLINIC_BREAK_END
- [ ] ADMIN_EMAIL
- [ ] NEXT_PUBLIC_APP_URL

## Development Workflow

### Starting New Feature

```bash
# Pull latest changes
git pull

# Create feature branch
git checkout -b feature/feature-name

# Make changes
# ... edit files ...

# Check code quality
npm run type-check
npm run lint

# Run tests
npm test

# Commit changes
git add .
git commit -m "Add feature description"

# Push to GitHub
git push

# Create Pull Request on GitHub
```

### Before Deployment

```bash
# Check everything
npm run type-check  # No TypeScript errors?
npm run lint        # No linting issues?
npm test           # Tests passing?
npm run build      # Build succeeds?

# If all pass, ready to deploy!
```

## Quick Tips

- **Hot reload**: Changes to `.ts`, `.tsx`, `.css` files auto-reload
- **Error messages**: Check browser console (F12) and terminal for details
- **Database**: Use Supabase web interface, not CLI
- **API testing**: Use Postman or curl
- **Mobile testing**: Use Chrome DevTools device emulation
- **Performance**: Check Vercel Analytics after deployment

## Still Need Help?

Check these files:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `DEPLOYMENT.md` - Deployment instructions
- `FEATURES.md` - Feature documentation
- `PROJECT_SUMMARY.md` - Project overview

---

**All commands should be run in the project root directory**
