(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/floating-navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingNavbar",
    ()=>FloatingNavbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/floating-navbar.tsx — Awwwards-grade floating navbar
 *
 * Clerk v7 changes applied:
 *  - <SignedIn>  → <Show when="signed-in">
 *  - <SignedOut> → <Show when="signed-out">
 *  - afterSignOutUrl removed from <UserButton> (Clerk v7 reads CLERK_SIGN_OUT_URL env or defaults to /)
 *
 * lucide-react v0.5+ changes applied:
 *  - Brand icons (Twitter, Instagram) removed from lucide-react → inline SVGs used instead
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lenis$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lenis-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-scroll.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__I__as__UserButton$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/hooks-74kNS3WZ.mjs [app-client] (ecmascript) <locals> <export I as UserButton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
    {
        label: 'Gallery',
        href: '/gallery'
    },
    {
        label: 'Community',
        href: '/community',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
    },
    {
        label: 'Blog',
        href: '/blog'
    },
    {
        label: 'About',
        href: '/about'
    }
];
// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgressBar() {
    _s();
    const { scrollYProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScroll"])();
    const scaleX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        restDelta: 0.001
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: "fixed top-0 left-0 right-0 z-[60] h-[2.5px] origin-left",
        style: {
            scaleX,
            background: 'linear-gradient(90deg, oklch(0.50 0.17 150), oklch(0.65 0.20 160), oklch(0.55 0.18 145))'
        }
    }, void 0, false, {
        fileName: "[project]/components/floating-navbar.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(ScrollProgressBar, "UYAOtHxiUth0DU6Git6zGRnUBB4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScroll"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c = ScrollProgressBar;
// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavLink({ href, label, icon: Icon, active }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: "relative flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
        style: {
            color: active ? 'var(--color-primary)' : undefined
        },
        children: [
            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                layoutId: "nav-pill",
                className: "absolute inset-0 rounded-full bg-primary/10",
                transition: {
                    type: 'spring',
                    stiffness: 380,
                    damping: 30
                }
            }, void 0, false, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this),
            Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "w-3.5 h-3.5 relative z-10"
            }, void 0, false, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 67,
                columnNumber: 16
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "relative z-10",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/floating-navbar.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_c1 = NavLink;
function FloatingNavbar() {
    _s1();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const lenis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lenis$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLenis"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FloatingNavbar.useEffect": ()=>{
            if (!lenis) return;
            const handler = {
                "FloatingNavbar.useEffect.handler": ({ scroll })=>setScrolled(scroll > 40)
            }["FloatingNavbar.useEffect.handler"];
            lenis.on('scroll', handler);
            return ({
                "FloatingNavbar.useEffect": ()=>{
                    lenis.off('scroll', handler);
                }
            })["FloatingNavbar.useEffect"];
        }
    }["FloatingNavbar.useEffect"], [
        lenis
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FloatingNavbar.useEffect": ()=>{
            setIsOpen(false);
        }
    }["FloatingNavbar.useEffect"], [
        pathname
    ]);
    const glassBg = scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.72)';
    const glassShadow = scrolled ? '0 8px 36px rgba(0,0,0,0.11), inset 0 1px 0 rgba(255,255,255,0.9)' : '0 4px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollProgressBar, {}, void 0, false, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].nav, {
                className: "hidden md:flex fixed left-1/2 -translate-x-1/2 z-50 items-center gap-1 px-4 py-2 rounded-full",
                style: {
                    // Offset by the site notification banner when one is showing.
                    // --banner-height is published by components/notification-banner.tsx.
                    top: 'calc(1.5rem + var(--banner-height, 0px))',
                    background: glassBg,
                    backdropFilter: 'blur(22px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    boxShadow: glassShadow,
                    transition: 'background 0.3s ease, box-shadow 0.3s ease'
                },
                initial: {
                    opacity: 0,
                    y: -28
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.55,
                    ease: [
                        0.22,
                        1,
                        0.36,
                        1
                    ]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        whileHover: {
                            scale: 1.04
                        },
                        whileTap: {
                            scale: 0.97
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "flex items-center gap-2 shrink-0 px-2 py-1 mr-2",
                            "aria-label": "SR Arts Official",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/icon.svg",
                                    alt: "SR Arts",
                                    width: 32,
                                    height: 32,
                                    className: "w-8 h-8 object-contain rounded-sm"
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg font-extrabold gradient-text",
                                    children: "SR Arts"
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/floating-navbar.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-px bg-border mx-1"
                    }, void 0, false, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    navItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavLink, {
                            href: item.href,
                            label: item.label,
                            icon: item.icon,
                            active: pathname.startsWith(item.href)
                        }, item.href, false, {
                            fileName: "[project]/components/floating-navbar.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-px bg-border mx-1"
                    }, void 0, false, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        whileHover: {
                            scale: 1.06
                        },
                        whileTap: {
                            scale: 0.96
                        },
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                className: "absolute inset-0 rounded-full bg-primary/20",
                                animate: {
                                    scale: [
                                        1,
                                        1.5
                                    ],
                                    opacity: [
                                        0.6,
                                        0
                                    ]
                                },
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeOut'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/commission",
                                className: "relative text-sm font-bold px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-light transition-colors shadow-sm shadow-primary/30",
                                children: "Commission"
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ml-1 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Show"], {
                                when: "signed-out",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SignInButton"], {
                                    mode: "modal",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "text-sm font-medium text-foreground/65 hover:text-primary transition-colors px-2 py-1",
                                        children: "Sign in"
                                    }, void 0, false, {
                                        fileName: "[project]/components/floating-navbar.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 156,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Show"], {
                                when: "signed-in",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__I__as__UserButton$3e$__["UserButton"], {
                                    appearance: {
                                        elements: {
                                            avatarBox: 'w-8 h-8 ring-2 ring-primary/30 hover:ring-primary/70 transition-all rounded-full'
                                        }
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 164,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].header, {
                className: "md:hidden fixed left-0 right-0 z-50 flex items-center justify-between px-4 py-3",
                style: {
                    top: 'var(--banner-height, 0px)',
                    background: isOpen || scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(22px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                    borderBottom: '1px solid rgba(255,255,255,0.52)',
                    boxShadow: '0 2px 18px rgba(0,0,0,0.07)',
                    transition: 'background 0.25s ease'
                },
                initial: {
                    opacity: 0,
                    y: -16
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "flex items-center gap-2",
                        "aria-label": "SR Arts Official",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: "/icon.svg",
                                alt: "SR Arts",
                                width: 28,
                                height: 28,
                                className: "w-7 h-7 object-contain rounded-sm"
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg font-extrabold gradient-text",
                                children: "SR Arts"
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Show"], {
                                when: "signed-in",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$74kNS3WZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__I__as__UserButton$3e$__["UserButton"], {
                                    appearance: {
                                        elements: {
                                            avatarBox: 'w-7 h-7'
                                        }
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 198,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                                onClick: ()=>setIsOpen((v)=>!v),
                                className: "flex items-center justify-center w-9 h-9 rounded-full bg-white/65 border border-white/72 shadow-sm hover:bg-white/95 transition-colors",
                                "aria-label": "Toggle menu",
                                whileTap: {
                                    scale: 0.92
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    mode: "wait",
                                    initial: false,
                                    children: isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                        initial: {
                                            rotate: -90,
                                            opacity: 0
                                        },
                                        animate: {
                                            rotate: 0,
                                            opacity: 1
                                        },
                                        exit: {
                                            rotate: 90,
                                            opacity: 0
                                        },
                                        transition: {
                                            duration: 0.15
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/floating-navbar.tsx",
                                            lineNumber: 209,
                                            columnNumber: 19
                                        }, this)
                                    }, "x", false, {
                                        fileName: "[project]/components/floating-navbar.tsx",
                                        lineNumber: 208,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                        initial: {
                                            rotate: 90,
                                            opacity: 0
                                        },
                                        animate: {
                                            rotate: 0,
                                            opacity: 1
                                        },
                                        exit: {
                                            rotate: -90,
                                            opacity: 0
                                        },
                                        transition: {
                                            duration: 0.15
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/floating-navbar.tsx",
                                            lineNumber: 213,
                                            columnNumber: 19
                                        }, this)
                                    }, "menu", false, {
                                        fileName: "[project]/components/floating-navbar.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/floating-navbar.tsx",
                                    lineNumber: 206,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/floating-navbar.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                            className: "md:hidden fixed inset-0 z-40 bg-black/20",
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            onClick: ()=>setIsOpen(false)
                        }, void 0, false, {
                            fileName: "[project]/components/floating-navbar.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                            className: "md:hidden fixed left-3 right-3 z-50 rounded-2xl overflow-hidden",
                            style: {
                                top: 'calc(58px + var(--banner-height, 0px))',
                                background: 'rgba(255,255,255,0.98)',
                                backdropFilter: 'blur(28px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                                border: '1px solid rgba(255,255,255,0.72)',
                                boxShadow: '0 20px 56px rgba(0,0,0,0.14)'
                            },
                            initial: {
                                opacity: 0,
                                scale: 0.96,
                                y: -10
                            },
                            animate: {
                                opacity: 1,
                                scale: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                scale: 0.96,
                                y: -10
                            },
                            transition: {
                                type: 'spring',
                                stiffness: 380,
                                damping: 30
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pt-3 pb-4 space-y-1",
                                children: [
                                    navItems.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                x: -10
                                            },
                                            animate: {
                                                opacity: 1,
                                                x: 0
                                            },
                                            transition: {
                                                delay: i * 0.045,
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: item.href,
                                                className: [
                                                    'flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors',
                                                    pathname.startsWith(item.href) ? 'bg-primary/10 text-primary' : 'text-foreground/75 hover:text-primary hover:bg-accent-subtle'
                                                ].join(' '),
                                                children: [
                                                    item.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/floating-navbar.tsx",
                                                        lineNumber: 262,
                                                        columnNumber: 37
                                                    }, this),
                                                    item.label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/floating-navbar.tsx",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this)
                                        }, item.href, false, {
                                            fileName: "[project]/components/floating-navbar.tsx",
                                            lineNumber: 247,
                                            columnNumber: 19
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                        className: "pt-2 pb-1 space-y-2.5",
                                        initial: {
                                            opacity: 0,
                                            y: 8
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: 0.18
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/commission",
                                                className: "block w-full text-center py-3 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light transition-colors shadow-sm shadow-primary/25",
                                                children: "Commission Now"
                                            }, void 0, false, {
                                                fileName: "[project]/components/floating-navbar.tsx",
                                                lineNumber: 274,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Show"], {
                                                when: "signed-out",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SignInButton"], {
                                                    mode: "modal",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "w-full text-center py-3 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-accent-subtle transition-colors",
                                                        children: "Sign in"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/floating-navbar.tsx",
                                                        lineNumber: 282,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/floating-navbar.tsx",
                                                    lineNumber: 281,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/floating-navbar.tsx",
                                                lineNumber: 280,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/floating-navbar.tsx",
                                        lineNumber: 268,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/floating-navbar.tsx",
                                lineNumber: 245,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/floating-navbar.tsx",
                            lineNumber: 230,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/floating-navbar.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s1(FloatingNavbar, "tfSFtGaHvhzddBeBtrZJKDCC86Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lenis$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLenis"]
    ];
});
_c2 = FloatingNavbar;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ScrollProgressBar");
__turbopack_context__.k.register(_c1, "NavLink");
__turbopack_context__.k.register(_c2, "FloatingNavbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/hero-section.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroSection",
    ()=>HeroSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/hero-section.tsx
 *
 * Awwwards-grade hero with canvas brush-painting intro.
 *
 * ANIMATION SEQUENCE:
 *  0.0 s – Dark canvas appears, cursor blink
 *  0.2 s – Stroke 1 sweeps (thick main stroke)
 *  0.8 s – Stroke 2 sweeps (counter stroke)
 *  1.3 s – Stroke 3 sweeps (accent stroke)
 *  1.5 s – "Welcome to" fades + scales in
 *  1.9 s – "SR Arts Official" letter-stagger reveal
 *  2.6 s – "By Anubhav Yadav" floats in
 *  3.2 s – Typewriter quotes loop
 *  7.0 s – Auto-transition (or skip click)
 *
 * TOOLS:
 *  Canvas 2D API  → brush stroke accumulation (circle-stamp technique)
 *  GSAP timeline  → precise timing + easing orchestration
 *  Framer Motion  → overlay fade, text spring, CTA buttons
 *  Three.js (lazy)→ interactive particle background
 *
 * PERFORMANCE:
 *  – Circles drawn once only (accumulated, no clear)
 *  – Seeded RNG (reproducible, no hydration mismatch)
 *  – requestAnimationFrame via gsap.ticker
 *  – SSR-safe (canvas only runs client-side)
 *  – Reduced-motion: skips to hero instantly
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-client] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-client] (ecmascript) <export default as SkipForward>");
;
;
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const FloatingParticles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/3d/floating-particles.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>m.FloatingParticles), {
    loadableGenerated: {
        modules: [
            "[project]/components/3d/floating-particles.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = FloatingParticles;
const HeroScene = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/3d/hero-scene.tsx [app-client] (ecmascript, next/dynamic entry, async loader)").then((m)=>m.HeroScene), {
    loadableGenerated: {
        modules: [
            "[project]/components/3d/hero-scene.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c1 = HeroScene;
// ─── Seeded RNG (mulberry32) ──────────────────────────────────────────────────
function makePrng(seed) {
    let s = seed >>> 0;
    return ()=>{
        s = Math.imul(s ^ s >>> 15, 1 | s) + (s + 0x6D2B79F5) | 0;
        const t = Math.imul(s ^ s >>> 7, 61 | s) ^ s;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
// ─── Polyline interpolation ───────────────────────────────────────────────────
function interpolatePath(pts, t) {
    const n = pts.length - 1;
    const scaled = t * n;
    const i = Math.min(Math.floor(scaled), n - 1);
    const f = scaled - i;
    return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f
    ];
}
// ─── Stroke definitions (normalised 0-1 coords) ───────────────────────────────
const STROKE_DEFS = [
    {
        // Wide sweep left→right — covers "SR Arts Official" region
        path: [
            [
                0.00,
                0.50
            ],
            [
                0.18,
                0.46
            ],
            [
                0.38,
                0.50
            ],
            [
                0.60,
                0.46
            ],
            [
                0.82,
                0.50
            ],
            [
                1.00,
                0.47
            ]
        ],
        maxRadius: 0.072,
        color: '#1b4332',
        alpha: 0.90,
        samples: 300,
        duration: 0.70,
        startAt: 0.20,
        seed: 42
    },
    {
        // Counter sweep right→left — "Welcome to" region
        path: [
            [
                1.00,
                0.42
            ],
            [
                0.78,
                0.39
            ],
            [
                0.52,
                0.43
            ],
            [
                0.28,
                0.40
            ],
            [
                0.00,
                0.42
            ]
        ],
        maxRadius: 0.050,
        color: '#2d6a4f',
        alpha: 0.82,
        samples: 240,
        duration: 0.55,
        startAt: 0.72,
        seed: 137
    },
    {
        // Thin accent sweep — "By Anubhav Yadav" region
        path: [
            [
                0.05,
                0.60
            ],
            [
                0.30,
                0.58
            ],
            [
                0.55,
                0.61
            ],
            [
                0.80,
                0.59
            ],
            [
                0.98,
                0.61
            ]
        ],
        maxRadius: 0.032,
        color: '#40916c',
        alpha: 0.75,
        samples: 200,
        duration: 0.48,
        startAt: 1.22,
        seed: 89
    },
    {
        // Top edge whisper stroke
        path: [
            [
                0.00,
                0.35
            ],
            [
                0.25,
                0.33
            ],
            [
                0.55,
                0.36
            ],
            [
                0.85,
                0.34
            ],
            [
                1.02,
                0.35
            ]
        ],
        maxRadius: 0.022,
        color: '#52b788',
        alpha: 0.60,
        samples: 160,
        duration: 0.40,
        startAt: 0.50,
        seed: 55
    }
];
function precomputeStroke(def, W, H) {
    const rng = makePrng(def.seed);
    const { samples, path, maxRadius } = def;
    const circles = [];
    for(let i = 0; i < samples; i++){
        const t = i / (samples - 1);
        const [nx, ny] = interpolatePath(path, t);
        const taper = Math.sin(t * Math.PI); // 0→1→0 (tapered ends)
        const r = maxRadius * H * taper * (0.45 + rng() * 0.55);
        const jx = (rng() - 0.5) * r * 0.50;
        const jy = (rng() - 0.5) * r * 0.28;
        circles.push({
            x: nx * W + jx,
            y: ny * H + jy,
            r: Math.max(r, 0.5)
        });
    }
    return circles;
}
// ─── Typewriter hook ──────────────────────────────────────────────────────────
const QUOTES = [
    'Art enables us to find ourselves and lose ourselves at the same time.',
    'Creativity takes courage.',
    'Every artist was first an amateur.',
    'Art is not what you see, but what you make others see.'
];
function useTypewriter(active) {
    _s();
    const [display, setDisplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [quoteIdx, setQuoteIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('typing');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTypewriter.useEffect": ()=>{
            if (!active) return;
            const quote = QUOTES[quoteIdx % QUOTES.length];
            let t;
            if (phase === 'typing') {
                if (display.length < quote.length) {
                    t = setTimeout({
                        "useTypewriter.useEffect": ()=>setDisplay(quote.slice(0, display.length + 1))
                    }["useTypewriter.useEffect"], 38);
                } else {
                    t = setTimeout({
                        "useTypewriter.useEffect": ()=>setPhase('pause')
                    }["useTypewriter.useEffect"], 2600);
                }
            } else if (phase === 'pause') {
                t = setTimeout({
                    "useTypewriter.useEffect": ()=>setPhase('erasing')
                }["useTypewriter.useEffect"], 200);
            } else {
                if (display.length > 0) {
                    t = setTimeout({
                        "useTypewriter.useEffect": ()=>setDisplay({
                                "useTypewriter.useEffect": (d)=>d.slice(0, -1)
                            }["useTypewriter.useEffect"])
                    }["useTypewriter.useEffect"], 16);
                } else {
                    setQuoteIdx({
                        "useTypewriter.useEffect": (n)=>n + 1
                    }["useTypewriter.useEffect"]);
                    setPhase('typing');
                }
            }
            return ({
                "useTypewriter.useEffect": ()=>clearTimeout(t)
            })["useTypewriter.useEffect"];
        }
    }["useTypewriter.useEffect"], [
        active,
        display,
        phase,
        quoteIdx
    ]);
    return display;
}
_s(useTypewriter, "v5sOcSLSHwhx/yrLEMY1z52ERTk=");
function CanvasIntro({ onComplete }) {
    _s1();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const prevCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(STROKE_DEFS.map({
        "CanvasIntro.useRef[prevCounts]": ()=>0
    }["CanvasIntro.useRef[prevCounts]"]));
    const circlesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const progressObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        s0: 0,
        s1: 0,
        s2: 0,
        s3: 0
    });
    const tlRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tickFn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Text reveal refs (via GSAP)
    const welcomeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const titleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bylineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const skipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [quoteActive, setQuoteActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const quote = useTypewriter(quoteActive);
    const [fading, setFading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Resize handler ──────────────────────────────────────────────────────────
    const resize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasIntro.useCallback[resize]": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Recompute circles for new size
            circlesRef.current = STROKE_DEFS.map({
                "CanvasIntro.useCallback[resize]": (def)=>precomputeStroke(def, canvas.width, canvas.height)
            }["CanvasIntro.useCallback[resize]"]);
            prevCounts.current = STROKE_DEFS.map({
                "CanvasIntro.useCallback[resize]": ()=>0
            }["CanvasIntro.useCallback[resize]"]);
        }
    }["CanvasIntro.useCallback[resize]"], []);
    // ── Draw frame (called by GSAP ticker) ──────────────────────────────────────
    const drawFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasIntro.useCallback[drawFrame]": ()=>{
            const canvas = canvasRef.current;
            if (!canvas || !circlesRef.current) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const prog = progressObj.current;
            const progs = [
                prog.s0,
                prog.s1,
                prog.s2,
                prog.s3
            ];
            STROKE_DEFS.forEach({
                "CanvasIntro.useCallback[drawFrame]": (def, si)=>{
                    const circles = circlesRef.current[si];
                    if (!circles) return;
                    const targetCount = Math.floor(circles.length * progs[si]);
                    const prevCount = prevCounts.current[si];
                    if (targetCount <= prevCount) return;
                    // Batch-draw only NEW circles (canvas accumulates — never cleared)
                    ctx.save();
                    ctx.globalAlpha = def.alpha;
                    ctx.fillStyle = def.color;
                    ctx.beginPath();
                    for(let c = prevCount; c < targetCount; c++){
                        const { x, y, r } = circles[c];
                        ctx.moveTo(x + r, y);
                        ctx.arc(x, y, r, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    ctx.restore();
                    prevCounts.current[si] = targetCount;
                }
            }["CanvasIntro.useCallback[drawFrame]"]);
        }
    }["CanvasIntro.useCallback[drawFrame]"], []);
    // ── Trigger complete ─────────────────────────────────────────────────────────
    const triggerComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasIntro.useCallback[triggerComplete]": ()=>{
            setFading(true);
            setTimeout(onComplete, 700);
        }
    }["CanvasIntro.useCallback[triggerComplete]"], [
        onComplete
    ]);
    // ── GSAP timeline ────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CanvasIntro.useEffect": ()=>{
            resize();
            window.addEventListener('resize', resize, {
                passive: true
            });
            // Fill canvas background
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0d1f16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Register draw tick
            const tick = {
                "CanvasIntro.useEffect.tick": ()=>drawFrame()
            }["CanvasIntro.useEffect.tick"];
            tickFn.current = tick;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].ticker.add(tick);
            const p = progressObj.current;
            const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].timeline();
            tlRef.current = tl;
            // ── Stroke animations ──────────────────────────────────────────────────
            tl.to(p, {
                s3: 1,
                duration: 0.40,
                ease: 'none'
            }, 0.50).to(p, {
                s0: 1,
                duration: 0.70,
                ease: 'none'
            }, 0.20).to(p, {
                s1: 1,
                duration: 0.55,
                ease: 'none'
            }, 0.72).to(p, {
                s2: 1,
                duration: 0.48,
                ease: 'none'
            }, 1.22);
            // ── Text reveals ──────────────────────────────────────────────────────
            if (welcomeRef.current) {
                tl.fromTo(welcomeRef.current, {
                    opacity: 0,
                    y: 18,
                    filter: 'blur(6px)'
                }, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.55,
                    ease: 'power3.out'
                }, 1.55);
            }
            if (titleRef.current) {
                // Split title chars into spans for stagger
                const chars = titleRef.current.querySelectorAll('.char');
                tl.fromTo(chars, {
                    opacity: 0,
                    y: 22,
                    rotateX: 40
                }, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.45,
                    ease: 'power3.out',
                    stagger: 0.028
                }, 1.92);
            }
            if (bylineRef.current) {
                tl.fromTo(bylineRef.current, {
                    opacity: 0,
                    y: 12,
                    filter: 'blur(4px)'
                }, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.50,
                    ease: 'power2.out'
                }, 2.62);
            }
            if (skipRef.current) {
                tl.fromTo(skipRef.current, {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 0.4
                }, 1.20);
            }
            // Start typewriter
            tl.call({
                "CanvasIntro.useEffect": ()=>setQuoteActive(true)
            }["CanvasIntro.useEffect"], [], 3.20);
            // Auto-complete after 7.5s
            tl.call(triggerComplete, [], 7.50);
            return ({
                "CanvasIntro.useEffect": ()=>{
                    tl.kill();
                    if (tickFn.current) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].ticker.remove(tickFn.current);
                    window.removeEventListener('resize', resize);
                }
            })["CanvasIntro.useEffect"];
        }
    }["CanvasIntro.useEffect"], [
        resize,
        drawFrame,
        triggerComplete
    ]);
    // Title characters as spans for stagger
    const TITLE = 'SR Arts Official';
    const titleChars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CanvasIntro.useMemo[titleChars]": ()=>TITLE.split('').map({
                "CanvasIntro.useMemo[titleChars]": (ch, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "char inline-block",
                        style: {
                            transformOrigin: 'bottom center'
                        },
                        children: ch === ' ' ? '\u00a0' : ch
                    }, i, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 343,
                        columnNumber: 7
                    }, this)
            }["CanvasIntro.useMemo[titleChars]"])
    }["CanvasIntro.useMemo[titleChars]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: "fixed inset-0 z-50 overflow-hidden",
        animate: {
            opacity: fading ? 0 : 1
        },
        transition: {
            duration: 0.75,
            ease: 'easeInOut'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "absolute inset-0 w-full h-full"
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 356,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-10 bg-white/70",
                animate: {
                    opacity: [
                        1,
                        0,
                        1
                    ]
                },
                transition: {
                    duration: 0.8,
                    repeat: 2,
                    repeatType: 'loop'
                }
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: welcomeRef,
                        style: {
                            opacity: 0
                        },
                        className: "text-[#95d5b2] text-base sm:text-lg font-medium tracking-[0.2em] uppercase mb-3",
                        children: "Welcome to"
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 368,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: titleRef,
                        className: "text-white text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-center leading-none perspective-[800px]",
                        style: {
                            perspective: '800px'
                        },
                        children: titleChars
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 377,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: bylineRef,
                        style: {
                            opacity: 0
                        },
                        className: "text-[#74c69d] text-base sm:text-xl font-light tracking-[0.12em] mb-8",
                        children: "By Anubhav Yadav"
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 386,
                        columnNumber: 9
                    }, this),
                    quoteActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        className: "max-w-md text-center text-[#d8f3dc]/80 text-sm font-light italic leading-relaxed",
                        children: [
                            "“",
                            quote,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "opacity-70 animate-pulse",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 401,
                                columnNumber: 27
                            }, this),
                            "”"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 396,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 366,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: skipRef,
                style: {
                    opacity: 0
                },
                onClick: triggerComplete,
                className: "absolute bottom-8 right-8 flex items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium tracking-widest uppercase transition-colors duration-200 group pointer-events-auto",
                children: [
                    "Skip",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"], {
                        className: "w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 414,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 407,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 pointer-events-none",
                style: {
                    background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)'
                }
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 418,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/hero-section.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
_s1(CanvasIntro, "VpxTocZgBYjnPsx7pq36rjhSHx8=", false, function() {
    return [
        useTypewriter
    ];
});
_c2 = CanvasIntro;
// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, delay }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        initial: {
            opacity: 0,
            scale: 0.85,
            y: 12
        },
        animate: {
            opacity: 1,
            scale: 1,
            y: 0
        },
        transition: {
            type: 'spring',
            stiffness: 320,
            damping: 26,
            delay
        },
        whileHover: {
            scale: 1.06,
            y: -2
        },
        className: "flex flex-col items-center px-5 py-3 rounded-2xl cursor-default",
        style: {
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl font-extrabold gradient-text",
                children: value
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 445,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[11px] text-muted-foreground font-medium mt-0.5",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/hero-section.tsx",
        lineNumber: 431,
        columnNumber: 5
    }, this);
}
_c3 = StatPill;
// ─── CTA button with magnetic hover ──────────────────────────────────────────
function CTAButton({ href, children, primary = false, delay = 0, onHoverStart, onHoverEnd }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 16
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            delay,
            duration: 0.55,
            ease: [
                0.23,
                1,
                0.32,
                1
            ]
        },
        whileHover: {
            scale: 1.05,
            y: -3
        },
        whileTap: {
            scale: 0.96
        },
        onHoverStart: onHoverStart,
        onHoverEnd: onHoverEnd,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: href,
            className: [
                'inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-shadow duration-300',
                primary ? 'bg-primary text-white shadow-lg hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30' : 'border-2 border-primary text-primary bg-white/60 backdrop-blur hover:bg-white hover:shadow-lg'
            ].join(' '),
            children: children
        }, void 0, false, {
            fileName: "[project]/components/hero-section.tsx",
            lineNumber: 466,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/hero-section.tsx",
        lineNumber: 457,
        columnNumber: 5
    }, this);
}
_c4 = CTAButton;
function HeroSection({ stats }) {
    _s2();
    const prefersReduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    // Session storage: only show intro once per tab session
    const shouldShowIntro = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HeroSection.useMemo[shouldShowIntro]": ()=>{
            if (prefersReduced) return false;
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                return !sessionStorage.getItem('sr-intro-done');
            } catch  {
                return false;
            }
        }
    }["HeroSection.useMemo[shouldShowIntro]"], [
        prefersReduced
    ]);
    const [showIntro, setShowIntro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(shouldShowIntro);
    const [heroReady, setHeroReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!shouldShowIntro);
    const [hoveredCTA, setHoveredCTA] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleIntroComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HeroSection.useCallback[handleIntroComplete]": ()=>{
            setShowIntro(false);
            setHeroReady(true);
            try {
                sessionStorage.setItem('sr-intro-done', '1');
            } catch  {}
        }
    }["HeroSection.useCallback[handleIntroComplete]"], []);
    const displayStats = stats ?? {
        artworks: '500+',
        clients: '1K+',
        followers: '50K+'
    };
    const tagRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const headlineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const subRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // GSAP reveals for hero text
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HeroSection.useEffect": ()=>{
            if (!heroReady) return;
            const els = [
                tagRef.current,
                headlineRef.current,
                subRef.current
            ].filter(Boolean);
            els.forEach({
                "HeroSection.useEffect": (el, i)=>{
                    if (!el) return;
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].fromTo(el, {
                        y: 36,
                        opacity: 0,
                        filter: 'blur(8px)'
                    }, {
                        y: 0,
                        opacity: 1,
                        filter: 'blur(0px)',
                        duration: 0.85,
                        delay: i * 0.18,
                        ease: 'power3.out'
                    });
                }
            }["HeroSection.useEffect"]);
        }
    }["HeroSection.useEffect"], [
        heroReady
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showIntro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CanvasIntro, {
                    onComplete: handleIntroComplete
                }, void 0, false, {
                    fileName: "[project]/components/hero-section.tsx",
                    lineNumber: 528,
                    columnNumber: 23
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 527,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative w-full min-h-screen flex items-center justify-center overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gradient-to-b from-[oklch(0.97_0.04_150)] via-white to-white",
                        children: heroReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                            fallback: null,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FloatingParticles, {}, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 538,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/hero-section.tsx",
                            lineNumber: 537,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 pointer-events-none",
                        style: {
                            background: 'radial-gradient(ellipse 85% 65% at 50% 45%, transparent 25%, rgba(255,255,255,0.60) 100%)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 544,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        className: "relative z-10 text-center px-4 max-w-4xl mx-auto py-24",
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: heroReady ? 1 : 0
                        },
                        transition: {
                            duration: 0.4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: tagRef,
                                style: {
                                    opacity: 0
                                },
                                className: "inline-block mb-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                    whileHover: {
                                        scale: 1.04
                                    },
                                    className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-primary cursor-default",
                                    style: {
                                        background: 'rgba(255,255,255,0.68)',
                                        backdropFilter: 'blur(14px)',
                                        border: '1px solid rgba(82,196,26,0.28)',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "w-3.5 h-3.5 text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/components/hero-section.tsx",
                                            lineNumber: 568,
                                            columnNumber: 15
                                        }, this),
                                        "SR Arts Official"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/hero-section.tsx",
                                    lineNumber: 558,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 557,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                ref: headlineRef,
                                style: {
                                    opacity: 0
                                },
                                className: "text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.04] tracking-tight mb-6",
                                children: [
                                    "Where Art",
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "gradient-text",
                                        children: "Comes to Life"
                                    }, void 0, false, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 580,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 574,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                ref: subRef,
                                style: {
                                    opacity: 0
                                },
                                className: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12",
                                children: "Explore stunning original artwork, commission custom pieces, and connect with a community of art lovers. Every creation tells a story."
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 584,
                                columnNumber: 11
                            }, this),
                            heroReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center justify-center gap-4 mb-14",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CTAButton, {
                                        href: "/gallery",
                                        primary: true,
                                        delay: 0.6,
                                        onHoverStart: ()=>setHoveredCTA('gallery'),
                                        onHoverEnd: ()=>setHoveredCTA(null),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Explore Gallery"
                                            }, void 0, false, {
                                                fileName: "[project]/components/hero-section.tsx",
                                                lineNumber: 603,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-lg leading-none",
                                                children: "→"
                                            }, void 0, false, {
                                                fileName: "[project]/components/hero-section.tsx",
                                                lineNumber: 604,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 596,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CTAButton, {
                                        href: "/commission",
                                        delay: 0.75,
                                        onHoverStart: ()=>setHoveredCTA('commission'),
                                        onHoverEnd: ()=>setHoveredCTA(null),
                                        children: "Commission Now"
                                    }, void 0, false, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 606,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 595,
                                columnNumber: 13
                            }, this),
                            heroReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                className: "flex flex-wrap items-center justify-center gap-3",
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.9
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        value: displayStats.artworks,
                                        label: "Original Artworks",
                                        delay: 0.95
                                    }, void 0, false, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 625,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        value: displayStats.clients,
                                        label: "Happy Clients",
                                        delay: 1.05
                                    }, void 0, false, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 626,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        value: displayStats.followers,
                                        label: "Followers",
                                        delay: 1.15
                                    }, void 0, false, {
                                        fileName: "[project]/components/hero-section.tsx",
                                        lineNumber: 627,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 619,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 550,
                        columnNumber: 9
                    }, this),
                    heroReady && !prefersReduced && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden xl:block absolute right-0 bottom-0 z-0",
                        style: {
                            width: 290,
                            height: 390,
                            pointerEvents: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                            fallback: null,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroScene, {
                                hoveredButton: hoveredCTA
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 639,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/hero-section.tsx",
                            lineNumber: 638,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 634,
                        columnNumber: 11
                    }, this),
                    heroReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                        onClick: ()=>document.getElementById('gallery')?.scrollIntoView({
                                behavior: 'smooth'
                            }),
                        className: "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group",
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 1.4
                        },
                        "aria-label": "Scroll to gallery",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-semibold tracking-[0.2em] uppercase",
                                children: "Scroll"
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 654,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                animate: {
                                    y: [
                                        0,
                                        7,
                                        0
                                    ]
                                },
                                transition: {
                                    repeat: Infinity,
                                    duration: 1.7,
                                    ease: 'easeInOut'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/hero-section.tsx",
                                    lineNumber: 659,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/hero-section.tsx",
                                lineNumber: 655,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/hero-section.tsx",
                        lineNumber: 646,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/hero-section.tsx",
                lineNumber: 532,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s2(HeroSection, "Pd4WfZvUlVmZFjJJI/eJS+5Cp/k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"]
    ];
});
_c5 = HeroSection;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "FloatingParticles");
__turbopack_context__.k.register(_c1, "HeroScene");
__turbopack_context__.k.register(_c2, "CanvasIntro");
__turbopack_context__.k.register(_c3, "StatPill");
__turbopack_context__.k.register(_c4, "CTAButton");
__turbopack_context__.k.register(_c5, "HeroSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ad-slot.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdSlot",
    ()=>AdSlot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * AdSlot — ENV-controlled ad placeholder system.
 *
 * MONETIZATION ARCHITECTURE:
 *  - ENV vars control which ad networks are active (AdSense, custom)
 *  - NEXT_PUBLIC_ADSENSE_CLIENT    → Google AdSense publisher ID (ca-pub-xxx)
 *  - NEXT_PUBLIC_ADSENSE_ENABLED   → "true" to activate AdSense
 *  - Each slot renders nothing if ad network is disabled (zero layout impact)
 *  - Slots are pre-wired in layout-sensitive positions — no UI breaks when enabled
 *
 * Usage:
 *   <AdSlot slot="gallery-between-rows" format="leaderboard" />
 *   <AdSlot slot="blog-post-sidebar" format="rectangle" />
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const ADSENSE_ENABLED = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
const ADSENSE_CLIENT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
const formatSizes = {
    banner: {
        w: 728,
        h: 90
    },
    rectangle: {
        w: 300,
        h: 250
    },
    leaderboard: {
        w: 728,
        h: 90
    },
    skyscraper: {
        w: 160,
        h: 600
    },
    auto: {
        w: 0,
        h: 0
    }
};
function AdSlot({ slot, format = 'auto', className = '' }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdSlot.useEffect": ()=>{
            if (!ADSENSE_ENABLED || !ADSENSE_CLIENT) return;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch  {}
        }
    }["AdSlot.useEffect"], []);
    // No ad network configured — render nothing (zero layout footprint)
    if (!ADSENSE_ENABLED || !ADSENSE_CLIENT) return null;
    const size = formatSizes[format];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `ad-slot overflow-hidden ${className}`,
        "data-ad-slot": slot,
        style: size.w ? {
            minWidth: size.w,
            minHeight: size.h
        } : undefined,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ins", {
            ref: ref,
            className: "adsbygoogle block",
            style: {
                display: 'block',
                ...size.w ? {
                    width: size.w,
                    height: size.h
                } : {}
            },
            "data-ad-client": ADSENSE_CLIENT,
            "data-ad-slot": slot,
            "data-ad-format": format === 'auto' ? 'auto' : undefined,
            "data-full-width-responsive": format === 'auto' ? 'true' : undefined
        }, void 0, false, {
            fileName: "[project]/components/ad-slot.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ad-slot.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(AdSlot, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c = AdSlot;
var _c;
__turbopack_context__.k.register(_c, "AdSlot");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/gsap-utils.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "animateCounter",
    ()=>animateCounter,
    "createHorizontalScroll",
    ()=>createHorizontalScroll,
    "createParallax",
    ()=>createParallax,
    "prefersReducedMotion",
    ()=>prefersReducedMotion,
    "revealElement",
    ()=>revealElement,
    "revealStagger",
    ()=>revealStagger,
    "setupSectionReveals",
    ()=>setupSectionReveals
]);
/**
 * lib/gsap-utils.ts
 *
 * GSAP + ScrollTrigger utilities for section reveals, counters, parallax.
 *
 * DESIGN RULES:
 *  – All functions return their ScrollTrigger instance(s) for cleanup
 *  – Functions are pure (no side effects outside the DOM node passed in)
 *  – Lenis sync is handled in lenis-provider.tsx, not here
 *
 * VERIFIED: gsap ^3.14.2 + gsap/ScrollTrigger (included, no separate install)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
'use client';
;
;
// Register once (idempotent)
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"]);
function prefersReducedMotion() {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
// ─── Reveal preset definitions ────────────────────────────────────────────────
const PRESETS = {
    fadeUp: {
        from: {
            y: 44,
            opacity: 0
        },
        to: {
            y: 0,
            opacity: 1
        }
    },
    fadeIn: {
        from: {
            opacity: 0
        },
        to: {
            opacity: 1
        }
    },
    fadeBlur: {
        from: {
            opacity: 0,
            filter: 'blur(10px)',
            y: 20
        },
        to: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0
        }
    },
    slideLeft: {
        from: {
            x: -55,
            opacity: 0
        },
        to: {
            x: 0,
            opacity: 1
        }
    },
    slideRight: {
        from: {
            x: 55,
            opacity: 0
        },
        to: {
            x: 0,
            opacity: 1
        }
    },
    scale: {
        from: {
            scale: 0.88,
            opacity: 0
        },
        to: {
            scale: 1,
            opacity: 1
        }
    },
    stagger: {
        from: {
            y: 32,
            opacity: 0
        },
        to: {
            y: 0,
            opacity: 1
        }
    }
};
function revealElement(el, options = {}) {
    if (!el) return;
    const { preset = 'fadeUp', delay = 0, duration = 0.75, start = 'top 88%', ease = 'power3.out' } = options;
    const { from, to } = PRESETS[preset];
    // Reduced motion: show the finished state immediately, no travel, no trigger.
    if (prefersReducedMotion()) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].set(el, to);
        return;
    }
    const st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
        trigger: el,
        start,
        toggleActions: 'play none none none',
        onEnter: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].fromTo(el, from, {
                ...to,
                duration,
                delay,
                ease
            });
        }
    });
    return st;
}
function revealStagger(container, options = {}) {
    if (!container) return;
    const { preset = 'stagger', delay = 0, duration = 0.65, start = 'top 88%', stagger = 0.08, ease = 'power3.out' } = options;
    const children = Array.from(container.children);
    if (!children.length) return;
    const { from, to } = PRESETS[preset];
    if (prefersReducedMotion()) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].set(children, to);
        return;
    }
    const st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
        trigger: container,
        start,
        toggleActions: 'play none none none',
        onEnter: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].fromTo(children, from, {
                ...to,
                duration,
                delay,
                ease,
                stagger
            });
        }
    });
    return st;
}
function animateCounter(el, endValue, opts = {}) {
    if (!el) return;
    const { prefix = '', suffix = '', duration = 1.6, start = 'top 85%' } = opts;
    // Counting up is motion too — jump straight to the final number.
    if (prefersReducedMotion()) {
        el.textContent = prefix + endValue.toLocaleString() + suffix;
        return;
    }
    const obj = {
        val: 0
    };
    const st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
        trigger: el,
        start,
        toggleActions: 'play none none none',
        onEnter: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(obj, {
                val: endValue,
                duration,
                ease: 'power2.out',
                onUpdate: ()=>{
                    el.textContent = prefix + Math.round(obj.val).toLocaleString() + suffix;
                }
            });
        }
    });
    return st;
}
function createParallax(el, strength = 0.15) {
    if (!el) return;
    // Parallax is the most nausea-inducing effect here — skip it entirely.
    if (prefersReducedMotion()) return;
    const st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self)=>{
            const y = self.progress * strength * 100;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].set(el, {
                y: `${y}%`
            });
        }
    });
    return st;
}
function createHorizontalScroll(track) {
    if (!track) return;
    const panels = Array.from(track.children);
    if (!panels.length) return;
    const totalWidth = panels.reduce((sum, p)=>sum + p.offsetWidth, 0);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
        trigger: track,
        start: 'top top',
        end: ()=>`+=${totalWidth - window.innerWidth}`,
        pin: true,
        scrub: 1,
        onUpdate: (self)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].set(track, {
                x: -(self.progress * (totalWidth - window.innerWidth))
            });
        }
    });
}
function setupSectionReveals(container) {
    const triggers = [];
    container.querySelectorAll('[data-reveal]').forEach((el)=>{
        const preset = el.dataset.reveal ?? 'fadeUp';
        const delay = parseFloat(el.dataset.revealDelay ?? '0');
        const duration = parseFloat(el.dataset.revealDuration ?? '0.75');
        const st = revealElement(el, {
            preset,
            delay,
            duration
        });
        if (st) triggers.push(st);
    });
    container.querySelectorAll('[data-stagger]').forEach((el)=>{
        const stagger = parseFloat(el.dataset.stagger ?? '0.08');
        const preset = el.dataset.staggerPreset ?? 'stagger';
        const st = revealStagger(el, {
            preset,
            stagger
        });
        if (st) triggers.push(st);
    });
    container.querySelectorAll('[data-parallax]').forEach((el)=>{
        const strength = parseFloat(el.dataset.parallax ?? '0.15');
        const st = createParallax(el, strength);
        if (st) triggers.push(st);
    });
    return triggers;
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/sections-animator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SectionsAnimator",
    ()=>SectionsAnimator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/sections-animator.tsx
 *
 * Thin client boundary that initialises GSAP ScrollTrigger for the entire page.
 *
 * Pattern: Page is a Server Component; this wraps below-fold content in one
 * client boundary. On mount it walks all [data-reveal], [data-stagger], and
 * [data-parallax] elements in its subtree and wires them up.
 *
 * Why not <ScrollReveal> per section?
 *  – One boundary = one React client island = smaller JS bundle.
 *  – Server Components can still pass JSX children into this.
 *
 * Cleanup: all ScrollTrigger instances killed on unmount (React StrictMode safe).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gsap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/gsap-utils.ts [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function SectionsAnimator({ children }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const triggersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SectionsAnimator.useEffect": ()=>{
            const container = containerRef.current;
            if (!container) return;
            // Small delay so layout settles before measuring positions
            const id = requestAnimationFrame({
                "SectionsAnimator.useEffect.id": ()=>{
                    triggersRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gsap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setupSectionReveals"])(container);
                }
            }["SectionsAnimator.useEffect.id"]);
            return ({
                "SectionsAnimator.useEffect": ()=>{
                    cancelAnimationFrame(id);
                    triggersRef.current.forEach({
                        "SectionsAnimator.useEffect": (t)=>t.kill()
                    }["SectionsAnimator.useEffect"]);
                    triggersRef.current = [];
                }
            })["SectionsAnimator.useEffect"];
        }
    }["SectionsAnimator.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/sections-animator.tsx",
        lineNumber: 44,
        columnNumber: 10
    }, this);
}
_s(SectionsAnimator, "Vu2L1k1yrAiuDtN0MMOVrQdDfnE=");
_c = SectionsAnimator;
var _c;
__turbopack_context__.k.register(_c, "SectionsAnimator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/social/platform-config.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * components/social/platform-config.tsx
 *
 * Single source of truth for platform display config + SVG icons.
 * Eliminates the duplication that existed across:
 *   - components/social/social-card.tsx
 *   - components/social/social-stats-inline.tsx
 *   - app/(public)/about/page.tsx
 *
 * Import from here in all social UI components.
 */ // ─── Platform types ───────────────────────────────────────────────────────────
__turbopack_context__.s([
    "FacebookIcon",
    ()=>FacebookIcon,
    "InstagramIcon",
    ()=>InstagramIcon,
    "PLATFORM_CONFIG",
    ()=>PLATFORM_CONFIG,
    "XIcon",
    ()=>XIcon,
    "YouTubeIcon",
    ()=>YouTubeIcon,
    "fmtCount",
    ()=>fmtCount,
    "fmtCountPlus",
    ()=>fmtCountPlus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function InstagramIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.75",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: className,
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                width: "20",
                height: "20",
                x: "2",
                y: "2",
                rx: "5",
                ry: "5"
            }, void 0, false, {
                fileName: "[project]/components/social/platform-config.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
            }, void 0, false, {
                fileName: "[project]/components/social/platform-config.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "17.5",
                x2: "17.51",
                y1: "6.5",
                y2: "6.5"
            }, void 0, false, {
                fileName: "[project]/components/social/platform-config.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/social/platform-config.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = InstagramIcon;
function YouTubeIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        className: className,
        "aria-hidden": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"
            }, void 0, false, {
                fileName: "[project]/components/social/platform-config.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                fill: "white",
                points: "9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
            }, void 0, false, {
                fileName: "[project]/components/social/platform-config.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/social/platform-config.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c1 = YouTubeIcon;
function XIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        className: className,
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
        }, void 0, false, {
            fileName: "[project]/components/social/platform-config.tsx",
            lineNumber: 42,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/social/platform-config.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_c2 = XIcon;
function FacebookIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        className: className,
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        }, void 0, false, {
            fileName: "[project]/components/social/platform-config.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/social/platform-config.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_c3 = FacebookIcon;
const PLATFORM_CONFIG = {
    INSTAGRAM: {
        label: 'Instagram',
        followerLabel: 'Followers',
        postLabel: 'Posts',
        gradient: 'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
        ringColor: 'ring-pink-300/60',
        textColor: 'text-pink-600',
        bgLight: 'bg-pink-50/60',
        borderColor: 'border-pink-200',
        hoverShadow: 'hover:shadow-pink-100',
        profileBaseUrl: 'https://instagram.com/',
        Icon: InstagramIcon
    },
    YOUTUBE: {
        label: 'YouTube',
        followerLabel: 'Subscribers',
        postLabel: 'Videos',
        gradient: 'from-[#ff0000] to-[#cc0000]',
        ringColor: 'ring-red-300/60',
        textColor: 'text-red-600',
        bgLight: 'bg-red-50/60',
        borderColor: 'border-red-200',
        hoverShadow: 'hover:shadow-red-100',
        profileBaseUrl: 'https://youtube.com/',
        Icon: YouTubeIcon
    },
    TWITTER: {
        label: 'X / Twitter',
        followerLabel: 'Followers',
        postLabel: 'Posts',
        gradient: 'from-[#000000] to-[#1d9bf0]',
        ringColor: 'ring-sky-300/60',
        textColor: 'text-sky-600',
        bgLight: 'bg-sky-50/60',
        borderColor: 'border-sky-200',
        hoverShadow: 'hover:shadow-sky-100',
        profileBaseUrl: 'https://twitter.com/',
        Icon: XIcon
    },
    FACEBOOK: {
        label: 'Facebook',
        followerLabel: 'Followers',
        postLabel: 'Posts',
        gradient: 'from-[#1877f2] to-[#0e5fd4]',
        ringColor: 'ring-blue-300/60',
        textColor: 'text-blue-600',
        bgLight: 'bg-blue-50/60',
        borderColor: 'border-blue-200',
        hoverShadow: 'hover:shadow-blue-100',
        profileBaseUrl: 'https://facebook.com/',
        Icon: FacebookIcon
    }
};
function fmtCount(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return n.toLocaleString();
}
function fmtCountPlus(n) {
    return `${fmtCount(n)}+`;
}
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "InstagramIcon");
__turbopack_context__.k.register(_c1, "YouTubeIcon");
__turbopack_context__.k.register(_c2, "XIcon");
__turbopack_context__.k.register(_c3, "FacebookIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/social/social-stats-inline.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialStatsInline",
    ()=>SocialStatsInline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/social/social-stats-inline.tsx
 *
 * Compact pill-badge row for the homepage hero bar.
 * Shows followers per platform. Reads pre-fetched DB data — zero client API calls.
 * Icons and config pulled from shared platform-config.tsx.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/social/platform-config.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function SocialStatsInline({ stats, maxShow = 3 }) {
    const visible = stats.filter((s)=>s.followers > 0).slice(0, maxShow);
    if (visible.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        transition: {
            duration: 0.3,
            delay: 0.15
        },
        className: "flex flex-wrap items-center gap-2",
        children: visible.map((stat, i)=>{
            const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PLATFORM_CONFIG"][stat.platform];
            const { Icon } = cfg;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: 8
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.35,
                    delay: 0.2 + i * 0.08,
                    ease: [
                        0.22,
                        1,
                        0.36,
                        1
                    ]
                },
                className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: `w-3.5 h-3.5 shrink-0 ${cfg.textColor}`
                    }, void 0, false, {
                        fileName: "[project]/components/social/social-stats-inline.tsx",
                        lineNumber: 45,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-bold text-foreground/90 tracking-tight",
                        children: [
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCount"])(stat.followers),
                            "+"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-stats-inline.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted-foreground font-medium hidden sm:inline",
                        children: cfg.followerLabel
                    }, void 0, false, {
                        fileName: "[project]/components/social/social-stats-inline.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this)
                ]
            }, stat.platform, true, {
                fileName: "[project]/components/social/social-stats-inline.tsx",
                lineNumber: 35,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/social/social-stats-inline.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = SocialStatsInline;
var _c;
__turbopack_context__.k.register(_c, "SocialStatsInline");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/social/social-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SocialCard",
    ()=>SocialCard,
    "SocialCardsGrid",
    ()=>SocialCardsGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/social/social-card.tsx
 *
 * Glassmorphic social stats card (compact).
 * Used on the homepage "Follow the Journey" section.
 * Shows: avatar, display name, username, platform, follower count, post count, sync badge.
 *
 * For the full enriched about-page cards (bio, following, external link), use SocialProfileCard.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/formatDistanceToNow.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/social/platform-config.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
// ─── Fetch method badge ───────────────────────────────────────────────────────
const METHOD_BADGE = {
    clerk_oauth: {
        label: '⚡ OAuth',
        className: 'bg-green-100 text-green-700'
    },
    youtube_api: {
        label: '📡 API',
        className: 'bg-blue-100 text-blue-700'
    },
    rapidapi: {
        label: '🔌 RapidAPI',
        className: 'bg-violet-100 text-violet-700'
    },
    manual: {
        label: '✏️ Manual',
        className: 'bg-amber-100 text-amber-700'
    },
    failed: {
        label: '⚠️ Failed',
        className: 'bg-red-100 text-red-700'
    }
};
function MethodBadge({ method }) {
    if (!method) return null;
    const cfg = METHOD_BADGE[method];
    if (!cfg) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`,
        children: cfg.label
    }, void 0, false, {
        fileName: "[project]/components/social/social-card.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = MethodBadge;
function SocialCard({ account, index = 0 }) {
    const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PLATFORM_CONFIG"][account.platform];
    const { Icon } = cfg;
    const effectiveFollowers = account.useManual ? account.manualFollowers : account.followers;
    const displayName = account.displayName ?? account.username;
    const lastUpdated = account.lastFetchedAt ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistanceToNow"])(new Date(account.lastFetchedAt), {
        addSuffix: true
    }) : 'Not synced yet';
    const isFailed = account.fetchStatus === 'failed';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 20,
            scale: 0.97
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1
        },
        transition: {
            duration: 0.4,
            delay: index * 0.07,
            ease: [
                0.22,
                1,
                0.36,
                1
            ]
        },
        whileHover: {
            scale: 1.025,
            y: -4,
            transition: {
                duration: 0.2
            }
        },
        className: "relative group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute -inset-[1.5px] rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient}`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/components/social/social-card.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative rounded-2xl border border-border bg-white/85
        backdrop-blur-sm p-5 shadow-sm group-hover:shadow-lg transition-shadow duration-300
        ${isFailed ? 'border-red-200' : ''}`,
                children: [
                    isFailed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-2 right-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-red-400 font-medium",
                            children: "⚠ Sync failed"
                        }, void 0, false, {
                            fileName: "[project]/components/social/social-card.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative w-12 h-12 shrink-0",
                                children: [
                                    account.avatarUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: account.avatarUrl,
                                        alt: displayName,
                                        fill: true,
                                        sizes: "48px",
                                        className: `rounded-full object-cover ring-2 ring-white shadow-sm ring-offset-1 ${cfg.ringColor}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/social/social-card.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-12 h-12 rounded-full ring-2 ring-white shadow-sm
                bg-gradient-to-br ${cfg.gradient} flex items-center justify-center
                text-white font-bold text-lg`,
                                        children: displayName.charAt(0).toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/components/social/social-card.tsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this),
                                    account.oauthConnected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white flex items-center justify-center",
                                        title: "Connected via OAuth",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 12 12",
                                            fill: "white",
                                            className: "w-2.5 h-2.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M2 6l3 3 5-5",
                                                stroke: "white",
                                                strokeWidth: "1.5",
                                                strokeLinecap: "round",
                                                fill: "none"
                                            }, void 0, false, {
                                                fileName: "[project]/components/social/social-card.tsx",
                                                lineNumber: 119,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/social/social-card.tsx",
                                            lineNumber: 118,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/social/social-card.tsx",
                                        lineNumber: 113,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            bg-gradient-to-br ${cfg.gradient} shadow-sm`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "w-[18px] h-[18px] text-white"
                                }, void 0, false, {
                                    fileName: "[project]/components/social/social-card.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-semibold text-sm text-foreground/90 truncate mb-0.5",
                        children: displayName
                    }, void 0, false, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground truncate mb-3",
                        children: [
                            "@",
                            account.username,
                            " · ",
                            cfg.label
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-1",
                        children: [
                            effectiveFollowers !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-3xl font-extrabold tracking-tight ${cfg.textColor}`,
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCount"])(effectiveFollowers)
                            }, void 0, false, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-2xl font-bold text-muted-foreground/30",
                                children: "—"
                            }, void 0, false, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 mt-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground font-medium",
                                        children: cfg.followerLabel
                                    }, void 0, false, {
                                        fileName: "[project]/components/social/social-card.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MethodBadge, {
                                        method: account.useManual ? 'manual' : account.lastFetchMethod
                                    }, void 0, false, {
                                        fileName: "[project]/components/social/social-card.tsx",
                                        lineNumber: 146,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    account.posts !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-foreground/70",
                                children: account.posts.toLocaleString()
                            }, void 0, false, {
                                fileName: "[project]/components/social/social-card.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            ' ',
                            cfg.postLabel.toLowerCase()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-px bg-border/50 mt-3 mb-2.5"
                    }, void 0, false, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 158,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-muted-foreground/60 font-medium",
                        children: [
                            "Updated ",
                            lastUpdated
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/social/social-card.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/social/social-card.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/social/social-card.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_c1 = SocialCard;
function SocialCardsGrid({ accounts }) {
    if (accounts.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-muted-foreground text-sm",
            children: "No social accounts configured yet."
        }, void 0, false, {
            fileName: "[project]/components/social/social-card.tsx",
            lineNumber: 170,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        children: accounts.map((account, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SocialCard, {
                account: account,
                index: i
            }, account.id, false, {
                fileName: "[project]/components/social/social-card.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/social/social-card.tsx",
        lineNumber: 177,
        columnNumber: 5
    }, this);
}
_c2 = SocialCardsGrid;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MethodBadge");
__turbopack_context__.k.register(_c1, "SocialCard");
__turbopack_context__.k.register(_c2, "SocialCardsGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/social/platform-stats-cards.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlatformStatsCards",
    ()=>PlatformStatsCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/social/platform-stats-cards.tsx
 *
 * Platform-specific stats cards for the homepage.
 * Each card shows: platform icon + colour, follower count, platform label.
 * More prominent than the pill badges but lighter than the full SocialProfileCard.
 *
 * Data: pre-fetched server-side from DB — zero client API calls.
 * Reads data from DB exclusively. API is never called from UI.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/social/platform-config.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function PlatformStatCard({ item, index }) {
    const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PLATFORM_CONFIG"][item.platform];
    const { Icon } = cfg;
    const href = item.profileUrl ?? `${cfg.profileBaseUrl}${item.username.replace(/^@/, '')}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].a, {
        href: href,
        target: "_blank",
        rel: "noopener noreferrer",
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            duration: 0.4,
            delay: index * 0.08,
            ease: [
                0.22,
                1,
                0.36,
                1
            ]
        },
        whileHover: {
            scale: 1.04,
            y: -3,
            transition: {
                duration: 0.18
            }
        },
        className: "group relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-transparent transition-all duration-200 overflow-hidden text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 opacity-0 group-hover:opacity-[0.06]
          transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient}`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/components/social/platform-stats-cards.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-10 h-10 rounded-xl flex items-center justify-center
        bg-gradient-to-br ${cfg.gradient} shadow-sm
        group-hover:scale-110 transition-transform duration-200`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: "w-5 h-5 text-white"
                }, void 0, false, {
                    fileName: "[project]/components/social/platform-stats-cards.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/social/platform-stats-cards.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-2xl font-extrabold tracking-tight leading-none ${cfg.textColor}`,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$social$2f$platform$2d$config$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtCount"])(item.followers)
                    }, void 0, false, {
                        fileName: "[project]/components/social/platform-stats-cards.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground font-medium mt-0.5",
                        children: cfg.followerLabel
                    }, void 0, false, {
                        fileName: "[project]/components/social/platform-stats-cards.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/social/platform-stats-cards.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest",
                children: cfg.label
            }, void 0, false, {
                fileName: "[project]/components/social/platform-stats-cards.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/social/platform-stats-cards.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = PlatformStatCard;
function PlatformStatsCards({ items }) {
    const visible = items.filter((i)=>i.followers > 0);
    if (visible.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `grid gap-4 ${visible.length <= 2 ? 'grid-cols-2 max-w-sm mx-auto' : visible.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`,
        children: visible.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlatformStatCard, {
                item: item,
                index: i
            }, item.platform, false, {
                fileName: "[project]/components/social/platform-stats-cards.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/social/platform-stats-cards.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_c1 = PlatformStatsCards;
var _c, _c1;
__turbopack_context__.k.register(_c, "PlatformStatCard");
__turbopack_context__.k.register(_c1, "PlatformStatsCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0mxyk4v._.js.map