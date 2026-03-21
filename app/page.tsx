'use client';

import { FloatingNavbar } from '@/components/floating-navbar';
import { HeroSection } from '@/components/hero-section';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add('lenis');
  }, []);

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />
      <HeroSection />

      {/* Featured Section */}
      <section id="gallery" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our curated collection of premium artwork
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-base overflow-hidden group cursor-pointer">
                <div className="relative w-full h-64 bg-accent-subtle overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">
                    Featured Artwork {i}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Artwork Title</h3>
                  <p className="text-muted-foreground text-sm mb-4">Category • 2024</p>
                  <button className="text-primary hover:text-primary-light font-medium text-sm transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/gallery"
              className="btn-base border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-accent-subtle inline-block font-medium"
            >
              View Full Gallery
            </a>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section id="about" className="py-20 px-4 md:px-8 bg-accent-subtle/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">About SR Arts</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            With over a decade of experience in creating stunning artwork, SR Arts specializes in bringing imagination to life. Each piece is crafted with meticulous attention to detail and a passion for excellence.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Artworks Created</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Instagram Followers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section id="commission" className="py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Commission?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Let's create something extraordinary together. Send us your details and we'll get back to you within 24 hours.
          </p>
          <a
            href="/commission"
            className="btn-base bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-light inline-block font-medium"
          >
            Start Your Commission
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border bg-accent-subtle/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4">SR Arts</h3>
              <p className="text-muted-foreground text-sm">Premium artistic experience with custom commissions.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Gallery</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/gallery" className="hover:text-primary transition-colors">All Works</a></li>
                <li><a href="/gallery?category=anime" className="hover:text-primary transition-colors">Anime</a></li>
                <li><a href="/gallery?category=realistic" className="hover:text-primary transition-colors">Realistic</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 SR Arts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
