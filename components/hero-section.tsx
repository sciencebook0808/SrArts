'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FloatingParticles = dynamic(() =>
  import('./3d/floating-particles').then((mod) => mod.FloatingParticles),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-accent-subtle via-white to-background" />}>
        <FloatingParticles />
      </Suspense>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Premium <span className="gradient-text">Artistic</span> Experience
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore stunning artwork and commission custom pieces. Each creation is crafted with precision and passion.
          </p>

          <div className="flex gap-4 justify-center pt-8 flex-wrap">
            <a
              href="#gallery"
              className="btn-base bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-light text-base md:text-lg font-medium"
            >
              Explore Gallery
            </a>
            <a
              href="#commission"
              className="btn-base border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-accent-subtle text-base md:text-lg font-medium"
            >
              Commission Now
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-12 flex justify-center">
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
