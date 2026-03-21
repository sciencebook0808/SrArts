'use client';

import { FloatingNavbar } from '@/components/floating-navbar';
import { Calendar, Clock, User, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: number;
  category: string;
  featured?: boolean;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Digital Illustration: Techniques & Tools',
    excerpt: 'Discover the essential techniques and tools for creating stunning digital artwork...',
    author: 'SR Arts',
    date: 'March 15, 2024',
    readTime: 8,
    category: 'Tutorial',
    featured: true,
  },
  {
    id: '2',
    title: 'Behind the Scenes: Creating Custom Commissions',
    excerpt: 'Learn about our process for bringing custom artistic visions to life...',
    author: 'SR Arts',
    date: 'March 10, 2024',
    readTime: 6,
    category: 'Process',
  },
  {
    id: '3',
    title: 'Color Theory for Artists: Mastering Harmonies',
    excerpt: 'Understanding color theory is fundamental to creating visually striking artwork...',
    author: 'SR Arts',
    date: 'March 5, 2024',
    readTime: 10,
    category: 'Tutorial',
  },
  {
    id: '4',
    title: 'My Journey as a Professional Artist',
    excerpt: 'Reflecting on 10 years of artistic growth and lessons learned along the way...',
    author: 'SR Arts',
    date: 'February 28, 2024',
    readTime: 12,
    category: 'Personal',
  },
];

const categories = ['All', 'Tutorial', 'Process', 'Personal', 'Updates'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(mockBlogPosts);

  useEffect(() => {
    let posts = mockBlogPosts;

    if (activeCategory !== 'All') {
      posts = posts.filter((post) => post.category === activeCategory);
    }

    if (searchQuery) {
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(posts);
  }, [activeCategory, searchQuery]);

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Articles, tutorials, and insights about art, digital creation, and the creative process
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="sticky top-24 z-40 py-4 px-4 md:px-8 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-accent-subtle text-foreground hover:bg-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {filteredPosts.some((p) => p.featured) && activeCategory === 'All' && !searchQuery && (
        <section className="px-4 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <Link href={`/blog/${mockBlogPosts[0].id}`}>
              <div className="glass rounded-2xl p-8 hover:shadow-lg transition-all group cursor-pointer border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    Featured
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {mockBlogPosts[0].title}
                </h2>
                <p className="text-muted-foreground text-lg mb-6 line-clamp-2">
                  {mockBlogPosts[0].excerpt}
                </p>
                <div className="flex gap-4 items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {mockBlogPosts[0].author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {mockBlogPosts[0].date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {mockBlogPosts[0].readTime} min read
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article
                    className="card-base p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-l-4 border-transparent hover:border-primary"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4 items-start mb-4">
                      <span className="px-3 py-1 bg-accent-subtle text-sm rounded-full text-foreground whitespace-nowrap flex-shrink-0">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex gap-4 items-center text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min read
                      </div>
                      <span className="ml-auto text-primary font-medium group-hover:gap-2 transition-all">
                        Read More →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No articles found</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border bg-accent-subtle/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SR Arts. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
