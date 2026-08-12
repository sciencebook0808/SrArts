(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/lenis-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LenisProvider",
    ()=>LenisProvider,
    "useLenis",
    ()=>useLenis
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * lib/lenis-provider.tsx
 *
 * Smooth scroll via Lenis ^1.3.x, synced with GSAP ScrollTrigger.
 *
 * INTEGRATION NOTES (verified March 2026):
 *  – gsap.ticker.add() fires at RAF frequency (~60fps)
 *  – lenis.raf(time * 1000) — GSAP gives seconds, Lenis expects ms
 *  – lenis.on('scroll', ScrollTrigger.update) keeps ST positions accurate
 *  – gsap.ticker.lagSmoothing(0) prevents GSAP from skipping frames
 *  – We do NOT use requestAnimationFrame separately (GSAP ticker owns RAF)
 *
 * IMPORTANT: Do NOT mix a separate rAF loop with GSAP ticker + Lenis.
 * The GSAP ticker is the single source of truth for timing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lenis/dist/lenis.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// Register once at module level (safe to call multiple times)
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"]);
const LenisContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    lenis: null
});
function LenisProvider({ children }) {
    _s();
    const [lenis, setLenis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LenisProvider.useEffect": ()=>{
            // Disable smooth scroll on mobile/touch devices:
            // - Lenis adds ~40-60ms INP latency on mobile due to RAF overhead
            // - Native momentum scrolling on iOS is already smooth
            // - Desktop users get smooth wheel scrolling as intended
            const isTouchDevice = ("TURBOPACK compile-time value", "object") !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
            // Hijacking the scroll wheel is itself motion. Users who ask for reduced
            // motion get native, instant scrolling.
            const reduceMotion = ("TURBOPACK compile-time value", "object") !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            const smooth = !isTouchDevice && !reduceMotion;
            const instance = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                duration: smooth ? 1.20 : 0,
                easing: {
                    "LenisProvider.useEffect": (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t))
                }["LenisProvider.useEffect"],
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: smooth,
                wheelMultiplier: 0.95,
                // touchMultiplier disabled: let native iOS/Android handle touch scroll
                infinite: false
            });
            setLenis(instance);
            // ── GSAP ticker drives Lenis (no separate rAF) ──────────────────────────
            const tickerFn = {
                "LenisProvider.useEffect.tickerFn": (time)=>instance.raf(time * 1000)
            }["LenisProvider.useEffect.tickerFn"];
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].ticker.add(tickerFn);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].ticker.lagSmoothing(0);
            // ── Keep ScrollTrigger in sync with Lenis scroll position ───────────────
            instance.on('scroll', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].update);
            // BUG FIX: the refresh handler used to be registered as an inline arrow and
            // then "removed" with a *second, different* arrow. Reference inequality
            // meant removeEventListener never matched, so every mount leaked a handler
            // that kept calling resize() on a destroyed Lenis instance. Hold one ref.
            const onRefresh = {
                "LenisProvider.useEffect.onRefresh": ()=>instance.resize()
            }["LenisProvider.useEffect.onRefresh"];
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].addEventListener('refresh', onRefresh);
            // Initial refresh after layout settles
            const refreshTimeout = setTimeout({
                "LenisProvider.useEffect.refreshTimeout": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].refresh()
            }["LenisProvider.useEffect.refreshTimeout"], 100);
            return ({
                "LenisProvider.useEffect": ()=>{
                    clearTimeout(refreshTimeout);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].ticker.remove(tickerFn);
                    instance.off('scroll', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].update);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].removeEventListener('refresh', onRefresh);
                    instance.destroy();
                }
            })["LenisProvider.useEffect"];
        }
    }["LenisProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LenisContext.Provider, {
        value: {
            lenis
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/lenis-provider.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_s(LenisProvider, "Cr13Dv9rMmehMW6qNzrIzPTpdvc=");
_c = LenisProvider;
function useLenis() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LenisContext).lenis;
}
_s1(useLenis, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "LenisProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/cursor-trail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CursorTrail",
    ()=>CursorTrail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/cursor-trail.tsx
 *
 * Brush-style custom cursor for SR Arts — desktop pointer devices only.
 *
 * WHAT REPLACED WHAT
 *  The previous cursor was a generic glowing ring + dot: the same effect on
 *  every "premium" template, and unrelated to an art brand. This one behaves
 *  like a loaded brush:
 *
 *   • Nib      — a small ink-coloured mark that tracks the pointer exactly.
 *   • Body     — a soft, spring-lagged blob that trails the nib.
 *   • Ink trail— a short tapering stroke drawn behind fast movement, which
 *                fades out when the pointer rests (like paint drying).
 *   • Velocity — the body squashes along the direction of travel, so a quick
 *                flick stretches the brush the way a real one loads and drags.
 *   • Hover    — over links/buttons the brush opens into a soft ring so the
 *                target underneath stays readable; over gallery imagery it
 *                becomes a labelled "view" disc.
 *
 * IMPLEMENTATION NOTES
 *  – One rAF loop drives everything; pointer events only write to refs, so
 *    moving the mouse never triggers a React render. (The old version called
 *    setState on every mousemove via a stale closure.)
 *  – The trail is a single <canvas> sized to the viewport with a capped point
 *    buffer, so cost is bounded regardless of how long the page is open.
 *  – Renders nothing at all on touch/coarse pointers, on small screens, and
 *    when the user prefers reduced motion.
 *  – `pointer-events: none` throughout, and the native cursor is left visible
 *    on interactive elements so accessibility and hit-testing are unaffected.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
/** Ink colour — SR Arts primary, in a canvas-friendly space. */ const INK = 'oklch(0.50 0.17 150)';
/** Max points retained in the stroke buffer. */ const MAX_TRAIL = 18;
/** Interactive selectors that open the brush into a ring. */ const INTERACTIVE = 'a, button, [role="button"], label, input, textarea, select, summary';
/** Artwork/gallery surfaces get the "view" treatment. */ const ARTWORK = '[data-cursor="artwork"], .card-base img, .img-reveal-wrapper';
function CursorTrail() {
    _s();
    // `enabled` is resolved once on mount; it never changes during a session.
    const [enabled, setEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('brush');
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nibRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bodyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // All high-frequency state lives in refs — never in React state.
    const pointer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: -100,
        y: -100,
        down: false,
        seen: false
    });
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: -100,
        y: -100,
        vx: 0,
        vy: 0
    });
    const trail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const modeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('brush');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CursorTrail.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const coarse = window.matchMedia('(pointer: coarse)').matches;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (coarse || reduce || window.innerWidth < 768) return;
            setEnabled(true);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d') ?? null;
            // ── Canvas sizing (DPR-aware) ───────────────────────────────────────────
            let dpr = Math.min(window.devicePixelRatio || 1, 2);
            const resize = {
                "CursorTrail.useEffect.resize": ()=>{
                    if (!canvas || !ctx) return;
                    dpr = Math.min(window.devicePixelRatio || 1, 2);
                    canvas.width = Math.floor(window.innerWidth * dpr);
                    canvas.height = Math.floor(window.innerHeight * dpr);
                    canvas.style.width = `${window.innerWidth}px`;
                    canvas.style.height = `${window.innerHeight}px`;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                }
            }["CursorTrail.useEffect.resize"];
            resize();
            // ── Pointer plumbing (refs only — zero re-renders) ──────────────────────
            const onMove = {
                "CursorTrail.useEffect.onMove": (e)=>{
                    pointer.current.x = e.clientX;
                    pointer.current.y = e.clientY;
                    if (!pointer.current.seen) {
                        pointer.current.seen = true;
                        // Avoid a long streak from the off-screen origin on first movement.
                        body.current.x = e.clientX;
                        body.current.y = e.clientY;
                    }
                }
            }["CursorTrail.useEffect.onMove"];
            const onDown = {
                "CursorTrail.useEffect.onDown": ()=>{
                    pointer.current.down = true;
                }
            }["CursorTrail.useEffect.onDown"];
            const onUp = {
                "CursorTrail.useEffect.onUp": ()=>{
                    pointer.current.down = false;
                }
            }["CursorTrail.useEffect.onUp"];
            const onEnter = {
                "CursorTrail.useEffect.onEnter": ()=>{
                    pointer.current.seen = true;
                }
            }["CursorTrail.useEffect.onEnter"];
            const onLeave = {
                "CursorTrail.useEffect.onLeave": ()=>{
                    pointer.current.seen = false;
                }
            }["CursorTrail.useEffect.onLeave"];
            const onOver = {
                "CursorTrail.useEffect.onOver": (e)=>{
                    const t = e.target;
                    const next = !t ? 'brush' : t.closest(INTERACTIVE) ? 'interactive' : t.closest(ARTWORK) ? 'artwork' : 'brush';
                    if (next !== modeRef.current) {
                        modeRef.current = next;
                        setMode(next); // one render per hover-target change, not per pixel
                    }
                }
            }["CursorTrail.useEffect.onOver"];
            window.addEventListener('pointermove', onMove, {
                passive: true
            });
            window.addEventListener('pointerdown', onDown, {
                passive: true
            });
            window.addEventListener('pointerup', onUp, {
                passive: true
            });
            window.addEventListener('pointerover', onOver, {
                passive: true
            });
            document.addEventListener('pointerenter', onEnter);
            document.addEventListener('pointerleave', onLeave);
            window.addEventListener('resize', resize);
            // ── Single animation loop ───────────────────────────────────────────────
            let raf = 0;
            const frame = {
                "CursorTrail.useEffect.frame": ()=>{
                    raf = requestAnimationFrame(frame);
                    const p = pointer.current;
                    const b = body.current;
                    // Spring the body toward the pointer — this produces the brush lag.
                    const stiffness = 0.22;
                    const damping = 0.72;
                    b.vx = (b.vx + (p.x - b.x) * stiffness) * damping;
                    b.vy = (b.vy + (p.y - b.y) * stiffness) * damping;
                    b.x += b.vx;
                    b.y += b.vy;
                    const speed = Math.hypot(b.vx, b.vy);
                    // ── Nib: exact tracking ───────────────────────────────────────────────
                    if (nibRef.current) {
                        nibRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
                        nibRef.current.style.opacity = p.seen ? '1' : '0';
                    }
                    // ── Body: lagged, squashed along the direction of travel ──────────────
                    if (bodyRef.current) {
                        // Stretch with speed, clamped so a fast flick never looks broken.
                        const stretch = Math.min(speed / 34, 0.5);
                        const angle = Math.atan2(b.vy, b.vx) * 180 / Math.PI;
                        const press = p.down ? 0.78 : 1;
                        bodyRef.current.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%) ` + `rotate(${angle}deg) scale(${(1 + stretch) * press}, ${(1 - stretch * 0.55) * press})`;
                        bodyRef.current.style.opacity = p.seen ? '1' : '0';
                    }
                    // ── Ink trail ─────────────────────────────────────────────────────────
                    if (ctx && canvas) {
                        // Only lay down ink when the brush is actually moving; resting the
                        // pointer should not keep painting a blob.
                        if (p.seen && speed > 0.6) {
                            trail.current.push({
                                x: b.x,
                                y: b.y,
                                age: 0
                            });
                            if (trail.current.length > MAX_TRAIL) trail.current.shift();
                        } else if (trail.current.length) {
                            trail.current.shift();
                        }
                        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
                        const pts = trail.current;
                        if (pts.length > 2 && modeRef.current === 'brush') {
                            ctx.save();
                            ctx.strokeStyle = INK;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';
                            // Draw as tapering segments: older = thinner and more transparent,
                            // which reads as a brush stroke rather than a uniform tube.
                            for(let i = 1; i < pts.length; i++){
                                const t = i / pts.length; // 0 = oldest, 1 = newest
                                ctx.globalAlpha = t * 0.30;
                                ctx.lineWidth = 1 + t * 7;
                                ctx.beginPath();
                                ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                                ctx.lineTo(pts[i].x, pts[i].y);
                                ctx.stroke();
                            }
                            ctx.restore();
                        }
                    }
                }
            }["CursorTrail.useEffect.frame"];
            raf = requestAnimationFrame(frame);
            return ({
                "CursorTrail.useEffect": ()=>{
                    cancelAnimationFrame(raf);
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerdown', onDown);
                    window.removeEventListener('pointerup', onUp);
                    window.removeEventListener('pointerover', onOver);
                    document.removeEventListener('pointerenter', onEnter);
                    document.removeEventListener('pointerleave', onLeave);
                    window.removeEventListener('resize', resize);
                }
            })["CursorTrail.useEffect"];
        }
    }["CursorTrail.useEffect"], []);
    if (!enabled) return null;
    // Body presentation per mode. Sizes are applied via CSS transitions so mode
    // changes ease rather than snap, without touching the rAF loop.
    const bodyStyle = mode === 'interactive' ? {
        width: 44,
        height: 44,
        background: 'transparent',
        border: `1.5px solid ${INK}`,
        opacity: 0.75
    } : mode === 'artwork' ? {
        width: 62,
        height: 62,
        background: 'oklch(0.50 0.17 150 / 0.16)',
        border: `1.5px solid ${INK}`
    } : {
        width: 26,
        height: 26,
        background: 'oklch(0.50 0.17 150 / 0.20)',
        border: '1.5px solid transparent'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                "aria-hidden": "true",
                className: "pointer-events-none fixed inset-0 z-[9997]"
            }, void 0, false, {
                fileName: "[project]/components/cursor-trail.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: bodyRef,
                "aria-hidden": "true",
                className: "pointer-events-none fixed top-0 left-0 z-[9998] rounded-full",
                style: {
                    ...bodyStyle,
                    willChange: 'transform, opacity',
                    transition: 'width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1), background .28s ease, border-color .28s ease, opacity .2s ease'
                }
            }, void 0, false, {
                fileName: "[project]/components/cursor-trail.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: nibRef,
                "aria-hidden": "true",
                className: "pointer-events-none fixed top-0 left-0 z-[9999] rounded-full",
                style: {
                    width: mode === 'brush' ? 5 : 4,
                    height: mode === 'brush' ? 5 : 4,
                    background: INK,
                    willChange: 'transform, opacity',
                    transition: 'width .2s ease, height .2s ease, opacity .2s ease'
                }
            }, void 0, false, {
                fileName: "[project]/components/cursor-trail.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CursorTrail, "HFHoWeYmbQVUYxxt5zZGaJqHT64=");
_c = CursorTrail;
var _c;
__turbopack_context__.k.register(_c, "CursorTrail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/notification-banner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationBanner",
    ()=>NotificationBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/notification-banner.tsx
 *
 * Displays the latest active site notification above the navbar.
 * Fetches from /api/notifications on mount.
 * Dismissal is stored in localStorage keyed by notification id —
 * so the same notification won't re-appear in future sessions either.
 *
 * Types:
 *   info    → blue/teal bar (default)
 *   warning → amber bar
 *   success → green bar
 *   error   → red bar
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
/**
 * The banner is fixed to the top of the viewport, so the fixed navbar has to
 * move down by exactly its height. We publish that height as a CSS custom
 * property on <html> and the navbar offsets itself with
 * `calc(… + var(--banner-height, 0px))` — no prop drilling, and it stays
 * correct if the banner is dismissed mid-session.
 */ const BANNER_HEIGHT_VAR = '--banner-height';
function setBannerHeight(px) {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${px}px`);
}
const DISMISSED_KEY = 'sr_dismissed_notifications';
function getDismissed() {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch  {
        return new Set();
    }
}
function saveDismissed(ids) {
    try {
        // Keep only last 20 dismissed IDs to avoid unbounded localStorage growth
        const arr = [
            ...ids
        ].slice(-20);
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
    } catch  {}
}
const TYPE_STYLES = {
    info: {
        bar: 'bg-gradient-to-r from-primary/90 to-primary text-white',
        icon: 'text-white/80',
        close: 'hover:bg-white/20 text-white',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"]
    },
    warning: {
        bar: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
        icon: 'text-white/80',
        close: 'hover:bg-white/20 text-white',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"]
    },
    success: {
        bar: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
        icon: 'text-white/80',
        close: 'hover:bg-white/20 text-white',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"]
    },
    error: {
        bar: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
        icon: 'text-white/80',
        close: 'hover:bg-white/20 text-white',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"]
    }
};
function NotificationBanner() {
    _s();
    const [notification, setNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const barRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Publish / clear the height the navbar offsets against.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBanner.useEffect": ()=>{
            if (!visible) {
                setBannerHeight(0);
                return;
            }
            const measure = {
                "NotificationBanner.useEffect.measure": ()=>setBannerHeight(barRef.current?.offsetHeight ?? 0)
            }["NotificationBanner.useEffect.measure"];
            measure();
            window.addEventListener('resize', measure);
            return ({
                "NotificationBanner.useEffect": ()=>{
                    window.removeEventListener('resize', measure);
                    setBannerHeight(0);
                }
            })["NotificationBanner.useEffect"];
        }
    }["NotificationBanner.useEffect"], [
        visible,
        notification?.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBanner.useEffect": ()=>{
            void ({
                "NotificationBanner.useEffect": async ()=>{
                    try {
                        const res = await fetch('/api/notifications');
                        const data = await res.json();
                        if (!data.notification) return;
                        const dismissed = getDismissed();
                        if (dismissed.has(data.notification.id)) return;
                        setNotification(data.notification);
                        setVisible(true);
                    } catch  {}
                }
            })["NotificationBanner.useEffect"]();
        }
    }["NotificationBanner.useEffect"], []);
    const dismiss = ()=>{
        setVisible(false);
        if (notification) {
            const dismissed = getDismissed();
            dismissed.add(notification.id);
            saveDismissed(dismissed);
        }
    };
    const cfg = TYPE_STYLES[notification?.type ?? 'info'] ?? TYPE_STYLES.info;
    const { Icon } = cfg;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: visible && notification && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
            initial: {
                height: 0,
                opacity: 0
            },
            animate: {
                height: 'auto',
                opacity: 1
            },
            exit: {
                height: 0,
                opacity: 0
            },
            transition: {
                duration: 0.25,
                ease: [
                    0.22,
                    1,
                    0.36,
                    1
                ]
            },
            /* LAYOUT FIX: this banner sits in normal document flow at the very top
             of <body>, but the navbar is `fixed top-6` (desktop) / `fixed top-0`
             (mobile), so the two overlapped — the banner rendered underneath a
             floating pill. Pinning the banner to the top of the viewport above
             the navbar keeps both readable and stops the late fetch from
             shifting the whole page down (CLS). */ className: "fixed top-0 left-0 right-0 overflow-hidden z-[70]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: barRef,
                className: `flex items-center justify-between px-4 py-2.5 text-sm ${cfg.bar}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5 flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: `w-4 h-4 shrink-0 ${cfg.icon}`
                            }, void 0, false, {
                                fileName: "[project]/components/notification-banner.tsx",
                                lineNumber: 155,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "truncate font-medium leading-snug",
                                children: notification.message
                            }, void 0, false, {
                                fileName: "[project]/components/notification-banner.tsx",
                                lineNumber: 156,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notification-banner.tsx",
                        lineNumber: 154,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: dismiss,
                        "aria-label": "Dismiss notification",
                        className: `ml-3 shrink-0 p-1 rounded-full transition-colors ${cfg.close}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/notification-banner.tsx",
                            lineNumber: 163,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/notification-banner.tsx",
                        lineNumber: 158,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/notification-banner.tsx",
                lineNumber: 153,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/notification-banner.tsx",
            lineNumber: 140,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/notification-banner.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_s(NotificationBanner, "gAlVSXc7VO6spHkTk5Qmw1Qpn6U=");
_c = NotificationBanner;
var _c;
__turbopack_context__.k.register(_c, "NotificationBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0j_2-iv._.js.map