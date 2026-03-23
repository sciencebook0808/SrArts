import type { Metadata } from 'next';
import Link from 'next/link';
import { FloatingNavbar } from '@/components/floating-navbar';
import { SectionsAnimator } from '@/components/sections-animator';
import { AboutClientSection } from '@/components/about/about-client-section';
import { getProfile } from '@/lib/db-server';
import { parseExperience, parseAchievements } from '@/lib/types';
import {
  Instagram, Twitter, Globe, Mail, MapPin,
  ArrowRight, Star, Briefcase, Award, Zap,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name    = profile?.name ?? 'SR Arts Official';
  const bio     = (profile?.bio ?? '').slice(0, 160);
  return {
    title: `About ${name}`,
    description: bio || `${name} — ${profile?.headline ?? 'Digital Artist & Illustrator'}`,
    alternates: { canonical: `${BASE_URL}/about` },
    openGraph: {
      title:       `About ${name} | SR Arts Official`,
      description: bio,
      images:      profile?.profileImage ? [{ url: profile.profileImage }] : undefined,
    },
  };
}

export default async function AboutPage() {
  const profile = await getProfile();

  const name       = profile?.name            ?? 'Anubhav Yadav';
  const headline   = profile?.headline        ?? 'Digital Artist & Illustrator';
  const bio        = profile?.bio             ?? '';
  const location   = profile?.location        ?? '';
  const profileImg = profile?.profileImage    ?? null;
  const bannerImg  = profile?.bannerImage     ?? null;
  const instagram  = profile?.instagram       ?? '';
  const twitter    = profile?.twitter         ?? '';
  const email      = profile?.email           ?? '';
  const website    = profile?.website         ?? '';
  const skills     = profile?.skills          ?? [];
  const years      = profile?.yearsExperience ?? null;

  // Safe JSON parsing — Prisma returns Prisma.JsonValue (unknown structure)
  const experience   = parseExperience(profile?.experience);
  const achievements = parseAchievements(profile?.achievements);

  const stats = [
    { label: 'Artworks',  value: profile?.artworksCount  ?? '500+' },
    { label: 'Clients',   value: profile?.clientsCount   ?? '1K+' },
    { label: 'Followers', value: profile?.followersCount ?? '50K+' },
    ...(years !== null ? [{ label: 'Years Exp.', value: `${years}+` }] : []),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Person',
    name,
    description: bio.slice(0, 300),
    image:       profileImg ?? undefined,
    url:         `${BASE_URL}/about`,
    jobTitle:    headline,
    sameAs: [
      instagram ? `https://instagram.com/${instagram.replace('@', '')}` : null,
      twitter   ? `https://twitter.com/${twitter.replace('@', '')}` : null,
      website   || null,
    ].filter((v): v is string => v !== null && v !== ''),
    worksFor: { '@type': 'Organization', name: 'SR Arts Official', url: BASE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="w-full min-h-screen bg-[#f4f2ef] overflow-x-hidden">
        <FloatingNavbar />
        <div className="pt-14 md:pt-0">
          <div className="relative w-full h-52 md:h-72 overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.40 0.17 150) 0%, oklch(0.55 0.19 155) 50%, oklch(0.45 0.15 145) 100%)' }}>
            {bannerImg && <img src={bannerImg} alt="Studio banner" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 288" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,120 C120,80 240,160 360,130 C480,100 600,160 800,120 L800,288 L0,288 Z" fill="white" />
              <path d="M0,160 C180,120 300,200 480,170 C620,148 720,200 800,160 L800,288 L0,288 Z" fill="white" opacity="0.5" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-2xl shadow-sm -mt-8 md:-mt-12 relative z-10 p-6 md:p-8">
              <AboutClientSection name={name} headline={headline} profileImage={profileImg} skills={skills} stats={stats} bio={bio} />
              {(instagram || twitter || email || website || location) && (
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
                  {instagram && <a href={`https://instagram.com/${instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-4 h-4" /> {instagram}</a>}
                  {twitter   && <a href={`https://twitter.com/${twitter.replace('@','')}`}   target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-4 h-4" /> {twitter}</a>}
                  {email     && <a href={`mailto:${email}`}  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Mail className="w-4 h-4" /> {email}</a>}
                  {website   && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Globe className="w-4 h-4" /> {website.replace(/^https?:\/\//, '')}</a>}
                  {location  && <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {location}</span>}
                </div>
              )}
            </div>
            <SectionsAnimator>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4" data-stagger="0.10" data-stagger-preset="scale">
                {stats.map(s => (<div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"><p className="text-2xl font-extrabold gradient-text">{s.value}</p><p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p></div>))}
              </div>
              {bio && (<div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="fadeBlur"><h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" />About</h2><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p></div>)}
              {skills.length > 0 && (<div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="fadeUp"><h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />Skills &amp; Specialties</h2><div className="flex flex-wrap gap-2">{skills.map(s => (<span key={s} className="px-4 py-1.5 bg-accent-subtle text-sm font-medium text-foreground/80 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">{s}</span>))}</div></div>)}
              {experience.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="fadeBlur">
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-primary" />Experience</h2>
                  <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
                    <div className="space-y-6">
                      {experience.map(exp => (
                        <div key={exp.id} className="flex gap-5 relative">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center z-10"><span className="text-[10px] font-bold text-primary leading-none text-center">{exp.year}</span></div>
                          <div className="flex-1 min-w-0 pb-2">
                            <h3 className="font-bold text-base leading-tight">{exp.title}</h3>
                            {exp.role && <p className="text-sm text-primary font-semibold mt-0.5">{exp.role}</p>}
                            {exp.description && <p className="text-sm text-muted-foreground leading-relaxed mt-2">{exp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {achievements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="slideLeft">
                  <h2 className="font-bold text-lg mb-5 flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Achievements &amp; Recognition</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map(a => (<div key={a.id} className="p-4 rounded-xl border border-border bg-accent-subtle/30 hover:border-primary/40 transition-colors"><div className="flex items-center justify-between mb-1.5"><h4 className="font-semibold text-sm">{a.title}</h4><span className="text-xs text-primary font-bold">{a.year}</span></div>{a.description && <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>}</div>))}
                  </div>
                </div>
              )}
              <div className="mt-4 mb-10 rounded-2xl p-8 text-center glass border border-white/60 shadow-sm" data-reveal="scale">
                <h3 className="text-2xl font-extrabold mb-2">Want a custom piece?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">Commission original artwork tailored to your vision. Response within 24 hours.</p>
                <Link href="/commission" className="btn-base inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-light shadow-md hover:shadow-lg hover:shadow-primary/25">Start a Commission <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </SectionsAnimator>
          </div>
        </div>
      </main>
    </>
  );
}
