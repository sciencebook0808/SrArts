'use client';
/**
 * components/about/about-client-section.tsx
 *
 * Client boundary for the About page profile section.
 * Renders:
 *  1. PaintedCanvas (artistic portrait) — left col on desktop
 *  2. Profile details (name, headline, stats, CTA) — right col
 *  3. Responsive: canvas stacks above on mobile
 *
 * Framer Motion entrance animations for premium feel.
 */

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Brush, MapPin } from 'lucide-react';
import { PaintedCanvas } from './painted-canvas';

interface Props {
  name:          string;
  headline:      string;
  profileImage:  string | null;
  skills:        string[];
  stats:         { label: string; value: string }[];
  bio:           string;
}

export function AboutClientSection({
  name, headline, profileImage, skills, stats, bio,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">

      {/* ── Painted canvas portrait ─────────────────────────────────────── */}
      <motion.div
        className="w-full md:w-[320px] lg:w-[380px] shrink-0"
        initial={{ opacity: 0, scale: 0.92, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
      >
        <PaintedCanvas
          name={name}
          headline={headline}
          profileImage={profileImage}
          skills={skills}
          stats={stats}
          handle="@sr.arts.official"
          width={640}
          height={440}
          className="w-full"
        />
        {/* Canvas caption */}
        <p className="text-center text-xs text-muted-foreground mt-2 font-medium tracking-wide italic">
          Painted digitally by {name}
        </p>
      </motion.div>

      {/* ── Profile details ─────────────────────────────────────────────── */}
      <motion.div
        className="flex-1 min-w-0 pt-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* Label */}
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-3">
          <Brush className="w-3.5 h-3.5" />
          Artist Profile
        </p>

        {/* Profile image (small circle) + name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg flex-shrink-0 bg-gradient-to-br from-primary to-accent">
            {profileImage
              ? <Image src={profileImage} alt={name} width={64} height={64} className="object-cover w-full h-full" priority />
              : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">{name.charAt(0).toUpperCase()}</div>
            }
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{name}</h1>
            <p className="text-base text-muted-foreground mt-0.5">{headline}</p>
          </div>
        </div>

        {/* Bio snippet */}
        {bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">
            {bio}
          </p>
        )}

        {/* Stats inline */}
        <div className="flex flex-wrap gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="text-center min-w-[60px]">
              <p className="text-xl font-extrabold gradient-text leading-tight">{s.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/commission"
            className="btn-base inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-light shadow-md hover:shadow-lg hover:shadow-primary/25"
          >
            Commission Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/gallery"
            className="btn-base inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold text-sm hover:bg-accent-subtle"
          >
            View Gallery
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
