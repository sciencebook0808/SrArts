import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CreatePostEditor } from '@/components/community/create-post-editor';

export const metadata: Metadata = {
  title: 'Create Post | SR Arts Community',
  description: 'Share your thoughts, artwork discoveries, and creative inspirations with the SR Arts community.',
  robots: { index: false, follow: false },
};

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { mode } = await searchParams;

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef]">
      <FloatingNavbar />
      <div className="pt-24 md:pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <CreatePostEditor defaultMode={mode} />
        </div>
      </div>
    </main>
  );
}
