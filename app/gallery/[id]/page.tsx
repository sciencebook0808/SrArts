'use client';

import { FloatingNavbar } from '@/components/floating-navbar';
import { Heart, Share2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ArtworkDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  views: number;
  likes: number;
  price?: number;
  created: string;
  tools?: string[];
  commission?: boolean;
}

const mockArtwork: ArtworkDetail = {
  id: '1',
  title: 'Anime Character Study',
  category: 'Anime',
  description: 'A beautifully detailed anime character study showcasing expressive eyes and intricate clothing details. This artwork demonstrates advanced understanding of proportion, lighting, and color theory.',
  image: 'artwork-detail',
  views: 2540,
  likes: 342,
  price: 150,
  created: 'March 2024',
  tools: ['Digital Painting', 'Photoshop', 'Clip Studio Paint'],
  commission: true,
};

const relatedWorks = [
  { id: '2', title: 'Related Work 1', image: 'related-1' },
  { id: '3', title: 'Related Work 2', image: 'related-2' },
  { id: '4', title: 'Related Work 3', image: 'related-3' },
];

export default function ArtworkDetailPage() {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mockArtwork.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      {/* Breadcrumb */}
      <div className="pt-32 px-4 md:px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/gallery" className="hover:text-primary transition-colors">
              Gallery
            </Link>
            <span>/</span>
            <span>{mockArtwork.category}</span>
            <span>/</span>
            <span className="text-foreground">{mockArtwork.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Image */}
          <div className="lg:col-span-2">
            <div className="card-base overflow-hidden">
              <div className="w-full h-96 md:h-[600px] bg-accent-subtle flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="relative z-10 text-center">
                  <div className="text-6xl font-bold text-muted-foreground/50 mb-4">🎨</div>
                  <p className="text-muted-foreground font-medium">{mockArtwork.title}</p>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-lg transition-all ${
                      isLiked
                        ? 'bg-primary text-white'
                        : 'bg-white/70 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white'
                    }`}
                    title="Like this artwork"
                  >
                    <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Gallery Grid (if available) */}
              <div className="grid grid-cols-3 gap-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-accent-subtle rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    View {i}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                <h1 className="text-4xl font-bold mb-2">{mockArtwork.title}</h1>
                <p className="text-muted-foreground capitalize">{mockArtwork.category} • {mockArtwork.created}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockArtwork.views}</div>
                  <p className="text-xs text-muted-foreground mt-1">Views</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{likeCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Likes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Comments</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold mb-2">About This Artwork</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {mockArtwork.description}
                </p>
              </div>

              {/* Tools */}
              {mockArtwork.tools && (
                <div>
                  <h3 className="font-bold mb-3">Tools & Techniques</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockArtwork.tools.map((tool) => (
                      <span key={tool} className="px-3 py-1 bg-accent-subtle text-sm rounded-lg">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Commission */}
              {mockArtwork.price && (
                <div className="card-base border-2 border-accent p-6">
                  <div className="text-3xl font-bold text-primary mb-4">
                    ${mockArtwork.price}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Available for commission
                  </p>
                  <Link
                    href="/commission"
                    className="btn-base w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-light font-medium"
                  >
                    Request Commission
                  </Link>
                </div>
              )}

              {/* Comment Section */}
              <div className="card-base p-4">
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-2">Comments</h4>
                    <textarea
                      placeholder="Share your thoughts..."
                      className="w-full p-2 border border-border rounded-lg bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <button className="mt-2 btn-base bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light">
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Works */}
      <section className="px-4 md:px-8 py-16 bg-accent-subtle/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Related Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedWorks.map((work) => (
              <Link key={work.id} href={`/gallery/${work.id}`}>
                <div className="card-base overflow-hidden group cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  <div className="w-full h-64 bg-accent-subtle flex items-center justify-center">
                    <p className="text-muted-foreground">{work.title}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{work.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SR Arts. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
