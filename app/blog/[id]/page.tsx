'use client';

import { FloatingNavbar } from '@/components/floating-navbar';
import { Calendar, Clock, User, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface BlogPostDetail {
  id: string;
  title: string;
  author: string;
  date: string;
  readTime: number;
  category: string;
  content: string;
  excerpt: string;
}

const mockPost: BlogPostDetail = {
  id: '1',
  title: 'The Art of Digital Illustration: Techniques & Tools',
  author: 'SR Arts',
  date: 'March 15, 2024',
  readTime: 8,
  category: 'Tutorial',
  excerpt: 'Discover the essential techniques and tools for creating stunning digital artwork. This comprehensive guide covers everything from basics to advanced techniques.',
  content: `
# The Art of Digital Illustration: Techniques & Tools

Digital illustration has revolutionized the way artists create and share their work. In this comprehensive guide, we'll explore the essential techniques and tools that modern artists use to create stunning digital artwork.

## Getting Started with Digital Art

Before diving into complex techniques, it's important to understand the fundamentals. Digital art combines traditional artistic principles with modern technology to create works that are both timeless and contemporary.

### Essential Tools

When starting your digital art journey, you'll need:

1. **A Graphics Tablet** - This is your primary input device for drawing
2. **Software** - Industry-standard programs like Photoshop, Clip Studio Paint, or Procreate
3. **A Computer** - A capable system with enough RAM and processing power
4. **Learning Resources** - Books, tutorials, and courses to develop your skills

## Core Techniques

### Color Theory

Understanding color is fundamental to creating visually striking artwork. Colors interact with each other in specific ways, and understanding these relationships will improve your work immediately.

**Complementary Colors**: Colors opposite each other on the color wheel create high contrast and visual interest.

**Analogous Colors**: Colors adjacent on the color wheel create harmony and cohesion.

### Lighting and Shadow

Proper lighting can make or break a piece. Always consider:

- Light source direction
- Shadow depth and softness
- Reflected light
- Atmospheric perspective

### Anatomy and Proportion

Whether drawing realistic or stylized characters, understanding basic anatomy is crucial. Study figure drawing, bone structure, and muscle composition.

## Advanced Techniques

### Layering

Professional digital artists use multiple layers to organize their work:
- Line art layer
- Base color layer
- Shadow and highlight layers
- Details and effects layers

### Blending Modes

Experiment with different blending modes in your software to achieve various effects and create depth.

### Custom Brushes

Create or download custom brushes to achieve unique textures and effects in your artwork.

## Practice and Improvement

The most important tool is practice. Set aside dedicated time each day to draw and experiment. Keep a sketchbook, both digital and physical, to record your ideas and progress.

Remember: every professional artist started as a beginner. The key to improvement is consistent practice and a willingness to learn from mistakes.

## Conclusion

Digital illustration is both an art and a skill. By mastering the tools, understanding fundamental techniques, and dedicating yourself to continuous practice, you can create artwork that rivals traditional mediums. The possibilities are endless, and your unique style will develop through experimentation and dedication.

Happy creating!
  `,
};

const relatedPosts = [
  {
    id: '2',
    title: 'Color Theory for Artists: Mastering Harmonies',
    date: 'March 10, 2024',
  },
  {
    id: '3',
    title: 'Behind the Scenes: Creating Custom Commissions',
    date: 'March 5, 2024',
  },
];

export default function BlogPostPage() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      {/* Header */}
      <article className="pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-accent-subtle rounded-full">
              {mockPost.category}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {mockPost.title}
          </h1>

          <div className="flex gap-6 items-center text-muted-foreground flex-wrap border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              By {mockPost.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {mockPost.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {mockPost.readTime} min read
            </div>
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-lg transition-all ${
                  isLiked
                    ? 'bg-primary text-white'
                    : 'bg-accent-subtle text-foreground hover:bg-border'
                }`}
              >
                <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 rounded-lg bg-accent-subtle text-foreground hover:bg-border transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Content */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-3xl mx-auto prose prose-invert max-w-none">
          <div
            className="text-foreground leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: mockPost.content }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-12 bg-accent-subtle/50">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Interested in a Custom Commission?</h3>
            <p className="text-muted-foreground mb-6">
              Apply the techniques from this article to your own commission project
            </p>
            <Link
              href="/commission"
              className="btn-base bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light inline-block font-medium"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="card-base p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border bg-accent-subtle/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SR Arts. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
