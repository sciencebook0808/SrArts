# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Create .env.local
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_id
APPWRITE_API_KEY=your_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
ADMIN_PASSWORD=SecurePassword123
NEXTAUTH_SECRET=random_secret_key
```

### 3. Run Development Server
```bash
pnpm dev
```

Visit http://localhost:3000

### 4. Access Admin
1. Go to http://localhost:3000/admin/login
2. Enter your ADMIN_PASSWORD
3. Access dashboard at http://localhost:3000/admin/dashboard

## Key URLs

### Public Pages
- Homepage: http://localhost:3000
- Gallery: http://localhost:3000/gallery
- Blog: http://localhost:3000/blog
- Commission: http://localhost:3000/commission

### Admin
- Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin/dashboard

## Project Structure

```
app/              # Next.js app pages
components/       # React components
lib/             # Utilities and config
public/          # Static assets
```

## Available Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Initial Data Setup

The project comes with mock data. To use real data:

1. Set up Appwrite collections (see APPWRITE_SETUP.md)
2. Populate the database with initial content
3. Update component files to fetch from Appwrite
4. Configure Cloudinary upload preset

## Design System

- **Primary Color**: Light Green (#52c41a)
- **Background**: Off-white (#f9f8f6)
- **Font**: Geist (sans) + Geist Mono
- **Rounded**: 12px borders
- **Smooth Scroll**: Enabled by default

## Animation Libraries

- **Lenis**: Smooth scrolling
- **GSAP**: Advanced animations
- **Motion**: UI transitions
- **Three.js**: 3D graphics

## Form Validation

All forms use Zod schemas:
- Commission form: Required fields, email validation
- Support form: Email, priority validation
- Login form: Password validation

## Next Steps

1. Read README.md for full documentation
2. Follow APPWRITE_SETUP.md for database config
3. Review BUILD_SUMMARY.md for architecture details
4. Deploy to Vercel when ready

## Troubleshooting

**Port 3000 already in use?**
```bash
pnpm dev -- -p 3001
```

**Dependencies not installing?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Appwrite connection error?**
- Check endpoint URL is correct
- Verify project ID matches
- Ensure API key is valid

**3D hero not loading?**
- Check browser console for errors
- Verify Three.js is installed
- Try reloading the page

---

For detailed setup instructions, see README.md
