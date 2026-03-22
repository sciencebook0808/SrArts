import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FloatingNavbar } from '@/components/floating-navbar';
import { getProfile } from '@/lib/db-server';
import { Instagram, Twitter, Globe, Mail, MapPin, Briefcase, Star, ArrowRight } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? 'SR Arts';
  const bio = (profile?.bio ?? '').slice(0, 160);
  return {
    title: `About ${name}`,
    description: bio || `${name} — ${profile?.headline ?? 'Digital Artist & Illustrator'}`,
    alternates: { canonical: `${BASE_URL}/about` },
    openGraph: { title: `About ${name} | SR Arts`, description: bio, images: profile?.profileImage ? [{ url: profile.profileImage }] : undefined },
  };
}

export default async function AboutPage() {
  const profile = await getProfile();
  const name = profile?.name ?? 'SR Arts';
  const headline = profile?.headline ?? 'Digital Artist & Illustrator';
  const bio = profile?.bio ?? '';
  const location = profile?.location ?? '';
  const profileImg = profile?.profileImage ?? null;
  const bannerImg = profile?.bannerImage ?? null;
  const instagram = profile?.instagram ?? '';
  const twitter = profile?.twitter ?? '';
  const email = profile?.email ?? '';
  const website = profile?.website ?? '';
  const skills: string[] = profile?.skills ?? [];
  const stats = [
    { label: 'Artworks', value: profile?.artworksCount ?? '500+' },
    { label: 'Clients', value: profile?.clientsCount ?? '1K+' },
    { label: 'Followers', value: profile?.followersCount ?? '50K+' },
    ...(profile?.yearsExperience ? [{ label: 'Years', value: `${profile.yearsExperience}+` }] : []),
  ];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person', name,
    description: bio.slice(0, 300), image: profileImg ?? undefined,
    url: `${BASE_URL}/about`, jobTitle: headline,
    sameAs: [instagram ? `https://instagram.com/${instagram.replace('@', '')}` : '', twitter ? `https://twitter.com/${twitter.replace('@', '')}` : '', website].filter(Boolean),
    worksFor: { '@type': 'Organization', name: 'SR Arts', url: BASE_URL },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="w-full min-h-screen bg-[#f4f2ef]">
        <FloatingNavbar />
        <div className="pt-14 md:pt-0">
          <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-primary/30 via-accent/20 to-primary-lighter/30 overflow-hidden">
            {bannerImg && <Image src={bannerImg} alt="Cover" fill className="object-cover" sizes="100vw" priority />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-2xl shadow-sm -mt-6 md:-mt-8 relative z-10 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-accent-subtle -mt-16 md:-mt-20">
                    {profileImg ? <Image src={profileImg} alt={name} fill className="object-cover" sizes="128px" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white text-3xl font-bold">{name.charAt(0).toUpperCase()}</div>}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{name}</h1>
                  <p className="text-base md:text-lg text-muted-foreground mt-1">{headline}</p>
                  {location && <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {location}</p>}
                </div>
                <Link href="/commission" className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-light transition-colors shadow-sm">Commission <ArrowRight className="w-4 h-4" /></Link>
              </div>
              {(instagram || twitter || email || website) && (
                <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-border">
                  {instagram && <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-4 h-4" /> {instagram}</a>}
                  {twitter && <a href={`https://twitter.com/${twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-4 h-4" /> {twitter}</a>}
                  {email && <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Mail className="w-4 h-4" /> {email}</a>}
                  {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><Globe className="w-4 h-4" /> {website.replace(/^https?:\/\//, '')}</a>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {stats.map(s => <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="text-2xl font-extrabold text-primary">{s.value}</p><p className="text-xs text-muted-foreground mt-0.5">{s.label}</p></div>)}
            </div>
            {bio && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
              </div>
            )}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mt-4">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Skills & Specialties</h2>
                <div className="flex flex-wrap gap-2">{skills.map(skill => <span key={skill} className="px-4 py-1.5 bg-accent-subtle text-sm font-medium text-foreground/80 rounded-full border border-border">{skill}</span>)}</div>
              </div>
            )}
            <div className="mt-4 mb-8 rounded-2xl p-8 text-center bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm">
              <h3 className="text-2xl font-extrabold mb-2">Want a custom piece?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Commission original artwork tailored to your vision. Response within 24 hours.</p>
              <Link href="/commission" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-light transition-colors shadow-md">Start a Commission <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
