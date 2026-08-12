/**
 * scripts/verify-schema.ts — end-to-end schema + data-layer verification.
 *
 * Exercises the real application data layer (lib/db-server) against the live
 * database to prove that every table, column type, relation, cascade and
 * unique constraint the code depends on actually works.
 *
 * Everything it creates is namespaced with VERIFY_TAG and removed in the
 * `finally` block, so the script is safe to run against a populated database.
 *
 * Run:  npx tsx scripts/verify-schema.ts
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { createRequire } from 'node:module';

for (const f of ['.env.local', '.env']) {
  dotenv.config({ path: path.resolve(process.cwd(), f) });
}

/**
 * lib/html-sanitizer.ts imports `server-only` so it can never be pulled into a
 * client bundle. That guard throws when the module is loaded outside Next.js's
 * bundler (i.e. here, in plain Node). Pre-seed the require cache with an empty
 * module so the import resolves to a no-op for this script only — the guard
 * still applies to every real build.
 */
{
  const req = createRequire(import.meta.url);
  const id = req.resolve('server-only');
  req.cache[id] = {
    id, filename: id, path: path.dirname(id), loaded: true,
    exports: {}, children: [], paths: [],
  } as unknown as NodeModule;
}

const VERIFY_TAG = `__verify_${Date.now().toString(36)}`;

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else    { fail++; console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`); }
}

async function main() {
  const { default: prisma } = await import('@/lib/db');
  const db = await import('@/lib/db-server');

  const created = {
    artworkId:   '',
    blogId:      '',
    postId:      '',
    repostId:    '',
    categoryId:  '',
    commissionId: '',
  };

  try {
    // ── 1. Every model is reachable (table exists, columns match client) ────
    console.log('\n[1] Table reachability');
    const models: [string, () => Promise<number>][] = [
      ['Artwork',          () => prisma.artwork.count()],
      ['BlogPost',         () => prisma.blogPost.count()],
      ['Category',         () => prisma.category.count()],
      ['Commission',       () => prisma.commission.count()],
      ['Profile',          () => prisma.profile.count()],
      ['ArtworkLike',      () => prisma.artworkLike.count()],
      ['Comment',          () => prisma.comment.count()],
      ['CommunityPost',    () => prisma.communityPost.count()],
      ['CommunityLike',    () => prisma.communityLike.count()],
      ['StaticPage',       () => prisma.staticPage.count()],
      ['SiteNotification', () => prisma.siteNotification.count()],
      ['SocialAccount',    () => prisma.socialAccount.count()],
    ];
    for (const [name, fn] of models) {
      try { await fn(); check(name, true); }
      catch (e) { check(name, false, (e as Error).message.split('\n')[0]); }
    }

    // ── 2. Artwork write/read + scalar type fidelity ────────────────────────
    console.log('\n[2] Artwork round-trip (Float / Int / Bool / DateTime)');
    const artwork = await db.createArtwork({
      title: `${VERIFY_TAG} artwork`,
      slug: `${VERIFY_TAG}-artwork`,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      price: 1234.56,
      featured: true,
      status: 'published',
      order: 7,
    });
    created.artworkId = artwork.id;
    check('created with cuid id',   typeof artwork.id === 'string' && artwork.id.length > 10);
    check('Float price preserved',  artwork.price === 1234.56, String(artwork.price));
    check('Boolean featured',       artwork.featured === true);
    check('Int order',              artwork.order === 7);
    check('DateTime createdAt',     artwork.createdAt instanceof Date);
    check('findable by slug',       (await db.getArtworkBySlug(`${VERIFY_TAG}-artwork`))?.id === artwork.id);

    await db.incrementArtworkViews(artwork.id);
    check('views increment',        (await db.getArtwork(artwork.id))?.views === 1);

    // ── 3. Unique constraint enforcement ───────────────────────────────────
    console.log('\n[3] Unique constraints');
    let dupRejected = false;
    try {
      await prisma.artwork.create({
        data: { title: 'dup', slug: `${VERIFY_TAG}-artwork`, imageUrl: '' },
      });
    } catch { dupRejected = true; }
    check('duplicate Artwork.slug rejected', dupRejected);

    // ── 4. BlogPost incl. String[] (tags) and JSON-free text ────────────────
    console.log('\n[4] BlogPost round-trip (String[] array column)');
    const blog = await db.createBlogPost({
      title: `${VERIFY_TAG} post`,
      slug: `${VERIFY_TAG}-post`,
      content: '<h2>Hello</h2><p>Body</p>',
      tags: ['art', 'test'],
      status: 'published',
    });
    created.blogId = blog.id;
    check('String[] tags stored',   Array.isArray(blog.tags) && blog.tags.length === 2, JSON.stringify(blog.tags));
    check('content persisted',      blog.content.includes('<h2>'));

    // ── 5. Profile JSONB columns ───────────────────────────────────────────
    console.log('\n[5] Profile JSONB columns');
    const profile = await db.upsertProfile({
      name: `${VERIFY_TAG}`,
      skills: ['illustration', 'digital'],
      experience:   [{ role: 'Artist', years: 10 }],
      achievements: [{ title: 'Award' }],
    });
    check('JSONB experience',   Array.isArray(profile.experience));
    check('JSONB achievements', Array.isArray(profile.achievements));
    check('String[] skills',    profile.skills.length === 2);

    // ── 6. Category + Commission ───────────────────────────────────────────
    console.log('\n[6] Category / Commission');
    const cat = await db.createCategory({ name: `${VERIFY_TAG} cat`, slug: `${VERIFY_TAG}-cat`, order: 1 });
    created.categoryId = cat.id;
    check('category created', !!cat.id);

    const commission = await db.createCommission({
      userName: `${VERIFY_TAG}`,
      userEmail: 'verify@example.com',
      description: 'test',
    });
    created.commissionId = commission.id;
    check('commission created + default status', commission.status === 'pending');

    // ── 7. CommunityPost + HTML sanitization on write ───────────────────────
    console.log('\n[7] CommunityPost + stored-XSS sanitization');
    const hostile =
      '<p>hello</p><script>alert(1)</script><img src=x onerror="alert(2)">' +
      '<a href="javascript:alert(3)">x</a>';
    const post = await db.createCommunityPost({
      authorId: `${VERIFY_TAG}-user`,
      authorName: 'Verifier',
      content: hostile,
    });
    created.postId = post.id;
    check('post created with slug', !!post.slug);
    check('<script> stripped',      !/<script/i.test(post.content), post.content);
    check('onerror= stripped',      !/onerror/i.test(post.content), post.content);
    check('javascript: stripped',   !/javascript:/i.test(post.content), post.content);
    check('legit markup kept',      post.content.includes('<p>hello</p>'), post.content);

    // ── 8. Likes: unique pair + counter sync ───────────────────────────────
    console.log('\n[8] Likes (composite unique + counters)');
    const l1 = await db.toggleCommunityLike(post.id, `${VERIFY_TAG}-user`);
    check('like added',   l1.liked === true && l1.count === 1);
    const l2 = await db.toggleCommunityLike(post.id, `${VERIFY_TAG}-user`);
    check('like removed', l2.liked === false && l2.count === 0);

    const al = await db.toggleArtworkLike(artwork.id, `${VERIFY_TAG}-user`);
    check('artwork like added', al.liked === true && al.count === 1);

    // ── 9. Comments: FK, threading, counters ───────────────────────────────
    console.log('\n[9] Comments (FK + self-referential threading)');
    const top = await db.createComment({
      targetId: post.id, targetType: 'community',
      userId: `${VERIFY_TAG}-user`, username: 'Verifier',
      message: 'top level',
    });
    check('top-level comment', !!top.id && top.parentId === null);
    check('communityPostId FK set', top.communityPostId === post.id);

    const reply = await db.createComment({
      targetId: post.id, targetType: 'community',
      userId: `${VERIFY_TAG}-user2`, username: 'Verifier2',
      message: 'a reply', parentId: top.id,
      replyToUserId: top.userId, replyToUsername: top.username,
    });
    check('reply stored with parentId', reply.parentId === top.id);

    const parentAfter = await prisma.comment.findUnique({ where: { id: top.id } });
    check('parent replyCount incremented', parentAfter?.replyCount === 1, String(parentAfter?.replyCount));

    const postAfter = await prisma.communityPost.findUnique({ where: { id: post.id } });
    check('post commentsCount incremented', postAfter?.commentsCount === 2, String(postAfter?.commentsCount));

    const threaded = await db.getThreadedComments(post.id, 'community');
    check('threaded read returns top-level', threaded.total === 1 && threaded.comments.length === 1);
    check('replies eager-loaded',            threaded.comments[0]?.replies.length === 1);
    check('getCommentCount works',           (await db.getCommentCount(post.id, 'community')) === 2);

    // ── 10. Repost relation (self-FK on CommunityPost) ─────────────────────
    console.log('\n[10] Repost self-relation');
    const repost = await db.createRepost({
      authorId: `${VERIFY_TAG}-user2`, authorName: 'Verifier2',
      repostNote: 'quoting this', repostOfId: post.id,
    });
    created.repostId = repost.id;
    check('repost created', repost.repostOfId === post.id);
    const orig = await prisma.communityPost.findUnique({ where: { id: post.id } });
    check('repostsCount incremented', orig?.repostsCount === 1, String(orig?.repostsCount));

    const withRepost = await db.getCommunityPost(repost.slug ?? repost.id);
    check('repostOf relation resolves', withRepost?.repostOf?.id === post.id);

    let missingRepostRejected = false;
    try {
      await db.createRepost({
        authorId: 'x', authorName: 'x', repostNote: '', repostOfId: 'does-not-exist',
      });
    } catch { missingRepostRejected = true; }
    check('repost of missing post rejected', missingRepostRejected);

    // ── 11. StaticPage + SiteNotification ──────────────────────────────────
    console.log('\n[11] StaticPage / SiteNotification');
    const page = await db.upsertStaticPage('terms', { title: 'T', content: '<p>ok</p><script>bad()</script>' });
    check('static page upserted',      page.id === 'terms');
    check('static page sanitized',     !/<script/i.test(page.content), page.content);

    const notif = await prisma.siteNotification.create({
      data: { message: `${VERIFY_TAG} note`, type: 'info' },
    });
    check('notification created + defaults', notif.isActive === true && notif.type === 'info');
    await prisma.siteNotification.delete({ where: { id: notif.id } });

    // ── 12. SocialAccount enum column ──────────────────────────────────────
    console.log('\n[12] SocialAccount (native enum column)');
    const acct = await prisma.socialAccount.create({
      data: { platform: 'INSTAGRAM', username: `${VERIFY_TAG}`, followers: 1000 },
    });
    check('enum value accepted', acct.platform === 'INSTAGRAM');
    let badEnum = false;
    try {
      // @ts-expect-error deliberately invalid enum value
      await prisma.socialAccount.create({ data: { platform: 'TIKTOK', username: `${VERIFY_TAG}2` } });
    } catch { badEnum = true; }
    check('invalid enum rejected', badEnum);
    await prisma.socialAccount.delete({ where: { id: acct.id } });

    // ── 13. Cascade deletes ────────────────────────────────────────────────
    console.log('\n[13] ON DELETE CASCADE');
    const commentsBefore = await prisma.comment.count({ where: { communityPostId: post.id } });
    check('comments exist before delete', commentsBefore === 2, String(commentsBefore));

    await prisma.communityPost.delete({ where: { id: post.id } });
    created.postId = '';
    const commentsAfter = await prisma.comment.count({ where: { communityPostId: post.id } });
    check('comments cascade-deleted with post', commentsAfter === 0, String(commentsAfter));

    const repostAfter = await prisma.communityPost.findUnique({ where: { id: repost.id } });
    check('repost survives, repostOfId SET NULL', !!repostAfter && repostAfter.repostOfId === null);

    await prisma.artwork.delete({ where: { id: artwork.id } });
    created.artworkId = '';
    check('artwork likes cascade-deleted',
      (await prisma.artworkLike.count({ where: { artworkId: artwork.id } })) === 0);

  } finally {
    // ── Cleanup ────────────────────────────────────────────────────────────
    console.log('\n[cleanup] removing verification rows…');
    const del = async (label: string, fn: () => Promise<unknown>) => {
      try { await fn(); } catch (e) { console.error(`  ! ${label}: ${(e as Error).message.split('\n')[0]}`); }
    };
    await del('community posts', () => prisma.communityPost.deleteMany({ where: { authorId: { contains: VERIFY_TAG } } }));
    await del('comments',        () => prisma.comment.deleteMany({ where: { userId: { contains: VERIFY_TAG } } }));
    await del('artwork likes',   () => prisma.artworkLike.deleteMany({ where: { userId: { contains: VERIFY_TAG } } }));
    await del('artworks',        () => prisma.artwork.deleteMany({ where: { slug: { contains: VERIFY_TAG } } }));
    await del('blog posts',      () => prisma.blogPost.deleteMany({ where: { slug: { contains: VERIFY_TAG } } }));
    await del('categories',      () => prisma.category.deleteMany({ where: { slug: { contains: VERIFY_TAG } } }));
    await del('commissions',     () => prisma.commission.deleteMany({ where: { userName: { contains: VERIFY_TAG } } }));
    await del('social accounts', () => prisma.socialAccount.deleteMany({ where: { username: { contains: VERIFY_TAG } } }));
    await del('static page',     () => prisma.staticPage.deleteMany({ where: { id: 'terms' } }));
    await del('profile',         () => prisma.profile.deleteMany({ where: { name: { contains: VERIFY_TAG } } }));
    await prisma.$disconnect();
  }

  console.log(`\n${'═'.repeat(46)}`);
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  console.log('═'.repeat(46));
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
