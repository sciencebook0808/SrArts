# Appwrite Collections Setup Guide

This guide walks you through setting up all required Appwrite collections for the SR Arts portfolio.

## Database: sr_arts_db

### Collection 1: categories

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | String | Yes | Category name (Anime, Realistic, etc) |
| slug | String | Yes | URL-friendly slug |
| description | String | No | Category description |
| order | Integer | Yes | Display order |

### Collection 2: artworks

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | Yes | Artwork title |
| description | String | Yes | Full description |
| category | String | Yes | Reference to category slug |
| categoryId | String | Yes | Reference to category ID |
| imageUrl | String | Yes | Main image URL from Cloudinary |
| imageId | String | No | Cloudinary image ID |
| gallery | Array | No | Array of additional image URLs |
| price | Decimal | No | Commission price |
| featured | Boolean | Yes | Featured on homepage |
| views | Integer | Yes | View count (default: 0) |
| likes | Integer | Yes | Like count (default: 0) |
| order | Integer | Yes | Display order |
| status | String | Yes | 'draft' or 'published' |
| instagramLink | String | No | Instagram post link |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

### Collection 3: blog_posts

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | Yes | Post title |
| slug | String | Yes | URL-friendly slug |
| content | String | Yes | Rich HTML content from TipTap |
| excerpt | String | Yes | Short summary |
| coverImage | String | No | Cover image URL |
| coverImageId | String | No | Cloudinary image ID |
| author | String | Yes | Author name |
| category | String | Yes | Post category |
| tags | Array | No | Array of tag strings |
| status | String | Yes | 'draft' or 'published' |
| views | Integer | Yes | View count (default: 0) |
| featured | Boolean | Yes | Featured status |
| seoTitle | String | No | SEO title tag |
| seoDescription | String | No | SEO meta description |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

### Collection 4: orders

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| userId | String | Yes | Customer ID or email |
| userEmail | String | Yes | Customer email |
| userName | String | Yes | Customer full name |
| userPhone | String | Yes | Customer phone number |
| artworkId | String | Yes | Reference to artwork |
| artworkTitle | String | Yes | Artwork title snapshot |
| customizations | String | No | Custom requests/notes |
| totalPrice | Decimal | Yes | Total order price |
| status | String | Yes | 'pending', 'confirmed', 'completed', 'cancelled' |
| paymentMethod | String | Yes | 'stripe', 'bank_transfer', 'cash' |
| paymentStatus | String | Yes | 'pending', 'completed', 'failed' |
| notes | String | No | Internal notes |
| createdAt | DateTime | Yes | Order date |
| updatedAt | DateTime | Yes | Last update date |

### Collection 5: support

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | String | Yes | Visitor name |
| email | String | Yes | Visitor email |
| subject | String | Yes | Ticket subject |
| message | String | Yes | Detailed message |
| attachments | Array | No | File URLs from storage |
| status | String | Yes | 'open', 'in-progress', 'resolved', 'closed' |
| priority | String | Yes | 'low', 'medium', 'high' |
| category | String | Yes | 'commission', 'inquiry', 'feedback', 'other' |
| response | String | No | Admin response |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

### Collection 6: profile

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| bio | String | Yes | Artist bio/about |
| instagram | String | No | Instagram handle |
| twitter | String | No | Twitter handle |
| email | String | No | Contact email |
| phone | String | No | Contact phone |
| website | String | No | Personal website |
| profileImage | String | No | Profile pic URL |
| profileImageId | String | No | Cloudinary image ID |
| bannerImage | String | No | Banner image URL |
| bannerImageId | String | No | Cloudinary image ID |
| updatedAt | DateTime | Yes | Last update |

## Storage Buckets

Create 3 storage buckets:

### Bucket: artworks
- **Allowed file types**: jpeg, jpg, png, webp, gif
- **Max file size**: 50MB
- **Permissions**: Public read, Admin write

### Bucket: blog
- **Allowed file types**: jpeg, jpg, png, webp, gif
- **Max file size**: 25MB
- **Permissions**: Public read, Admin write

### Bucket: profile
- **Allowed file types**: jpeg, jpg, png, webp
- **Max file size**: 10MB
- **Permissions**: Public read, Admin write

## Indexes for Performance

Create these indexes for better query performance:

```
categories: [status, order]
artworks: [status, category, featured, order]
blog_posts: [status, featured, category]
orders: [status, userId, createdAt]
support: [status, priority, category]
```

## API Permissions

Set permissions on collections:

- **Public read** on: artworks, blog_posts, categories (for public viewing)
- **Public read/write** on: support (for form submissions)
- **Admin only** on: orders, profile

## Appwrite API Configuration

### Client-side (for fetching)
```typescript
// Configured in lib/appwrite.ts
const databases = new Databases(client);
```

### Server-side (for CRUD operations)
```typescript
// Use getServerClient() for admin operations
const { databases, storage } = getServerClient();
```

## Cloudinary Integration

### Upload Preset Configuration

Create an unsigned upload preset in Cloudinary:

- **Name**: sr-arts-unsigned
- **Signing Mode**: Unsigned
- **Folder**: sr-arts/
- **Resource Type**: Image
- **Eager Transformations**: None (add as needed)
- **Return Delete Token**: Yes

Update `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in .env.local

### Image Transformation Examples

```
// Resize and optimize
https://res.cloudinary.com/[CLOUD_NAME]/image/upload/w_800,h_600,c_fill,f_auto/sr-arts/[ID]

// Thumbnail
https://res.cloudinary.com/[CLOUD_NAME]/image/upload/w_300,h_300,c_thumb,f_auto/sr-arts/[ID]

// High quality for display
https://res.cloudinary.com/[CLOUD_NAME]/image/upload/w_1200,h_900,c_fill,f_webp,q_auto/sr-arts/[ID]
```

## Testing the Setup

After configuration, test by:

1. Creating a test category via admin dashboard
2. Uploading an artwork with Cloudinary integration
3. Creating a blog post with rich text
4. Submitting a support ticket from the form
5. Creating an order through the commission form

## Troubleshooting

- **Connection errors**: Verify Appwrite endpoint and project ID
- **Permission denied**: Check collection permissions are properly set
- **Upload failures**: Ensure Cloudinary credentials are correct
- **Image not showing**: Verify image URL and CORS settings

---

For more information, refer to:
- [Appwrite Documentation](https://appwrite.io/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
