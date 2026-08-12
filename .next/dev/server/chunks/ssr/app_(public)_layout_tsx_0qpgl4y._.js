module.exports = [
"[project]/app/(public)/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * app/(public)/layout.tsx  — Public route group layout
 *
 * Wraps every public-facing URL:
 *   /            /about         /gallery      /gallery/[slug]
 *   /blog        /blog/[slug]   /commission   /community
 *   /community/[slug]           /terms        /privacy
 *   /[username]  /[username]/community/[slug]
 *   /sign-in     /sign-up       /admin/access-denied
 *
 * RESPONSIBILITIES:
 *  ✅ SEO-optimised default metadata (overridden per-page via generateMetadata)
 *  ✅ OpenGraph + Twitter cards base defaults
 *  ✅ Canonical base URL
 *  ✅ Theme color + viewport
 *  ❌ NO auth guard  — public routes need zero friction
 *  ❌ NO dashboard chrome
 *
 * SEO STRATEGY:
 *  This layout exports `metadata` that acts as a sensible fallback for any
 *  page that does not export its own generateMetadata(). Every real page
 *  DOES export its own metadata, so this is a safety net only.
 *  robots: index + follow for all public pages.
 */ __turbopack_context__.s([
    "default",
    ()=>PublicLayout,
    "metadata",
    ()=>metadata,
    "viewport",
    ()=>viewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
const metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: 'SR Arts Official — Premium Artist Portfolio',
        template: '%s | SR Arts Official'
    },
    description: 'Explore stunning original artwork by Anubhav Yadav. Commission custom pieces and connect with a creative community of art lovers worldwide.',
    keywords: [
        'art',
        'artist',
        'portfolio',
        'commission',
        'digital art',
        'anime art',
        'gallery',
        'illustration',
        'SR Arts'
    ],
    authors: [
        {
            name: 'Anubhav Yadav',
            url: BASE_URL
        }
    ],
    creator: 'SR Arts Official',
    publisher: 'SR Arts Official',
    // Open Graph defaults
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: BASE_URL,
        siteName: 'SR Arts Official',
        title: 'SR Arts Official — Premium Artist Portfolio',
        description: 'Explore stunning original artwork and commission custom pieces.',
        images: [
            {
                url: `${BASE_URL}/android-chrome-512x512.png`,
                width: 512,
                height: 512,
                alt: 'SR Arts Official logo'
            }
        ]
    },
    // Twitter / X card defaults
    twitter: {
        card: 'summary_large_image',
        site: '@sr_arts',
        creator: '@sr_arts',
        title: 'SR Arts Official — Premium Artist Portfolio',
        description: 'Explore original artwork, commission custom pieces, connect with the art community.',
        images: [
            `${BASE_URL}/android-chrome-512x512.png`
        ]
    },
    // Canonical alternates base
    alternates: {
        canonical: BASE_URL
    },
    // ✅ Public pages ARE indexed
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1
        }
    },
    // Verification tokens (add yours to .env.local)
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
        other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? {
            'msvalidate.01': [
                process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ]
        } : undefined
    }
};
const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        {
            media: '(prefers-color-scheme: light)',
            color: '#f9f8f6'
        },
        {
            media: '(prefers-color-scheme: dark)',
            color: '#0a0a0a'
        }
    ]
};
function PublicLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/app/(public)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(public)/layout.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=app_%28public%29_layout_tsx_0qpgl4y._.js.map