/**
 * app/(public)/about/page.tsx
 *
 * Public About page — server component (ISR every 60 s).
 * Shows: banner → profile card → social media cards → stats → bio → skills
 *        → experience timeline → achievements → CTA
 *
 * Social cards display username + follower/subscriber count + post/video count
 * with data fetched from the DB (populated by the daily cron or manual sync).
 */

import type { Metadata }      from 'next';
import Link                    from 'next/link';
import Image                   from 'next/image';
import { FloatingNavbar }      from '@/components/floating-navbar';
import { SectionsAnimator }    from '@/components/sections-animator';
import { AboutClientSection }  from '@/components/about/about-client-section';
import { getProfile, getPublicSocialAccounts } from '@/lib/db-server';
import { parseExperience, parseAchievements }  from '@/lib/types';
import {
  Globe, Mail, MapPin,
  ArrowRight, Star, Briefcase, Award, Zap, Users,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
export const revalidate = 60;

// ─── Platform display config ──────────────────────────────────────────────────

const PLATFORM_CFG = {
  INSTAGRAM: { label:'Instagram',  followerLabel:'Followers',   postLabel:'Posts',   gradient:'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', bg:'bg-gradient-to-br from-pink-50 to-purple-50',  border:'border-pink-200',  text:'text-pink-600'  },
  YOUTUBE:   { label:'YouTube',    followerLabel:'Subscribers', postLabel:'Videos',  gradient:'from-[#ff0000] to-[#cc0000]',                bg:'bg-red-50',                                    border:'border-red-200',   text:'text-red-600'   },
  TWITTER:   { label:'X / Twitter',followerLabel:'Followers',   postLabel:'Posts',   gradient:'from-[#000000] to-[#1d9bf0]',                bg:'bg-sky-50',                                    border:'border-sky-200',   text:'text-sky-600'   },
  FACEBOOK:  { label:'Facebook',   followerLabel:'Followers',   postLabel:'Posts',   gradient:'from-[#1877f2] to-[#0e5fd4]',                bg:'bg-blue-50',                                   border:'border-blue-200',  text:'text-blue-600'  },
} as const;

// ─── Inline SVG platform icons ────────────────────────────────────────────────

function PlatformIcon({ platform, className }: { platform: keyof typeof PLATFORM_CFG; className?: string }) {
  if (platform === 'INSTAGRAM') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
  if (platform === 'YOUTUBE') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
  if (platform === 'TWITTER') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name    = profile?.name ?? 'SR Arts Official';
  const bio     = (profile?.bio ?? '').slice(0, 160);
  return {
    title:       `About ${name}`,
    description: bio || `${name} — ${profile?.headline ?? 'Digital Artist & Illustrator'}`,
    alternates:  { canonical: `${BASE_URL}/about` },
    openGraph: {
      title:       `About ${name} | SR Arts Official`,
      description: bio,
      images:      profile?.profileImage ? [{ url: profile.profileImage }] : undefined,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const [profile, socialAccounts] = await Promise.all([
    getProfile(),
    getPublicSocialAccounts(),
  ]);

  const name       = profile?.name            ?? 'Anubhav Yadav';
  const headline   = profile?.headline        ?? 'Digital Artist & Illustrator';
  const bio        = profile?.bio             ?? '';
  const location   = profile?.location        ?? '';
  const profileImg = profile?.profileImage    ?? null;
  const bannerImg  = profile?.bannerImage     ?? null;
  const email      = profile?.email           ?? '';
  const website    = profile?.website         ?? '';
  const skills     = profile?.skills          ?? [];
  const years      = profile?.yearsExperience ?? null;

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
    sameAs:      website ? [website] : [],
    worksFor:    { '@type': 'Organization', name: 'SR Arts Official', url: BASE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="w-full min-h-screen bg-[#f4f2ef] overflow-x-hidden">
        <FloatingNavbar />
        <div className="pt-14 md:pt-0">

          {/* Banner */}
          <div className="relative w-full h-52 md:h-72 overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.40 0.17 150) 0%, oklch(0.55 0.19 155) 50%, oklch(0.45 0.15 145) 100%)' }}>
            {bannerImg && <Image src={bannerImg} alt="Studio banner" fill className="object-cover opacity-70" priority sizes="100vw" />}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 288" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,120 C120,80 240,160 360,130 C480,100 600,160 800,120 L800,288 L0,288 Z" fill="white" />
              <path d="M0,160 C180,120 300,200 480,170 C620,148 720,200 800,160 L800,288 L0,288 Z" fill="white" opacity="0.5" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-6">

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm -mt-8 md:-mt-12 relative z-10 p-6 md:p-8">
              <AboutClientSection name={name} headline={headline} profileImage={profileImg} skills={skills} stats={stats} bio={bio} />
              {(email || website || location) && (
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
                  {email    && <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Mail className="w-4 h-4" /> {email}</a>}
                  {website  && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Globe className="w-4 h-4" /> {website.replace(/^https?:\/\//, '')}</a>}
                  {location && <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {location}</span>}
                </div>
              )}
            </div>

            {/* ── Social Media Cards ──────────────────────────────────────── */}
            {socialAccounts.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Connect &amp; Follow
                </h2>
                <div className={`grid gap-4 ${
                  socialAccounts.length === 1 ? 'grid-cols-1 max-w-xs' :
                  socialAccounts.length === 2 ? 'grid-cols-2' :
                  socialAccounts.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                  'grid-cols-2 lg:grid-cols-4'
                }`}>
                  {socialAccounts.map((account) => {
                    const cfg = PLATFORM_CFG[account.platform];
                    const effectiveFollowers = account.useManual ? account.manualFollowers : account.followers;
                    const effectivePosts     = account.useManual ? account.manualPosts     : account.posts;
                    const displayName        = account.displayName ?? account.username;

                    return (
                      <div key={account.id} className={`relative rounded-2xl border p-5 ${cfg.bg} ${cfg.border} hover:shadow-lg transition-all duration-200 group`}>
                        {/* Platform gradient icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${cfg.gradient} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                          <PlatformIcon platform={account.platform} className="w-5 h-5 text-white" />
                        </div>

                        {/* Avatar + name row */}
                        <div className="flex items-center gap-2 mb-3">
                          {account.avatarUrl ? (
                            <Image
                              src={account.avatarUrl}
                              alt={displayName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${cfg.gradient}`}>
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground/90 truncate leading-tight">{displayName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">@{account.username}</p>
                          </div>
                        </div>

                        {/* Follower count */}
                        <div className="mb-1">
                          {effectiveFollowers !== null ? (
                            <p className={`text-2xl font-extrabold tracking-tight ${cfg.text}`}>{fmtNum(effectiveFollowers)}</p>
                          ) : (
                            <p className="text-xl font-bold text-muted-foreground/30">—</p>
                          )}
                          <p className="text-xs text-muted-foreground font-medium">{cfg.followerLabel}</p>
                        </div>

                        {/* Post count */}
                        {effectivePosts !== null && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            <span className="font-semibold text-foreground/70">{fmtNum(effectivePosts)}</span>
                            {' '}{cfg.postLabel}
                          </p>
                        )}

                        {/* Platform label bottom */}
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mt-3">{cfg.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <SectionsAnimator>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4" data-stagger="0.10" data-stagger-preset="scale">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {bio && (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="fadeBlur">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" />About</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="fadeUp">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />Skills &amp; Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (<span key={s} className="px-4 py-1.5 bg-accent-subtle text-sm font-medium text-foreground/80 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">{s}</span>))}
                  </div>
                </div>
              )}

              {/* Experience */}
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
                            {exp.role        && <p className="text-sm text-primary font-semibold mt-0.5">{exp.role}</p>}
                            {exp.description && <p className="text-sm text-muted-foreground leading-relaxed mt-2">{exp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4" data-reveal="slideLeft">
                  <h2 className="font-bold text-lg mb-5 flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Achievements &amp; Recognition</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map(a => (
                      <div key={a.id} className="p-4 rounded-xl border border-border bg-accent-subtle/30 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between mb-1.5"><h4 className="font-semibold text-sm">{a.title}</h4><span className="text-xs text-primary font-bold">{a.year}</span></div>
                        {a.description && <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commission CTA */}
              <div className="mt-4 mb-10 rounded-2xl p-8 text-center glass border border-white/60 shadow-sm" data-reveal="scale">
                <h3 className="text-2xl font-extrabold mb-2">Want a custom piece?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">Commission original artwork tailored to your vision. Response within 24 hours.</p>
                <Link href="/commission" className="btn-base inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-light shadow-md hover:shadow-lg hover:shadow-primary/25">
                  Start a Commission <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </SectionsAnimator>
          </div>
        </div>
      </main>
    </>
  );
}
