export interface Category {
  $id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface Artwork {
  $id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  imageUrl: string;
  imageId?: string;
  gallery?: string[];
  price?: number;
  featured: boolean;
  views: number;
  likes: number;
  order: number;
  status: 'draft' | 'published';
  instagramLink?: string;
  createdAt: string;
  updatedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  coverImageId?: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  views: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Order {
  $id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  artworkId: string;
  artworkTitle: string;
  customizations?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: 'stripe' | 'bank_transfer' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface SupportTicket {
  $id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments?: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: 'commission' | 'inquiry' | 'feedback' | 'other';
  response?: string;
  createdAt: string;
  updatedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Profile {
  $id: string;
  bio: string;
  instagram?: string;
  twitter?: string;
  email?: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  profileImageId?: string;
  bannerImage?: string;
  bannerImageId?: string;
  updatedAt: string;
  $updatedAt: string;
}
