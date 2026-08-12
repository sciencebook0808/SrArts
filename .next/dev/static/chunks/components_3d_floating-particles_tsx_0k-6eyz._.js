(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/3d/floating-particles.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingParticles",
    ()=>FloatingParticles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/3d/floating-particles.tsx  — v12 redesign (March 2026)
 *
 * PROBLEM FIXED:
 *  Black/dark instanced spheres were rendering with improper lighting and
 *  opacity, visually covering hero text. Canvas had no pointer-events guard.
 *
 * SOLUTION:
 *  1. Canvas: pointer-events: none  → UI fully interactive underneath
 *  2. Particles replaced with soft, very-light ambient sparkles (opacity 0.28)
 *  3. Added procedural 3D artist character (bottom-right, cartoon-style)
 *     - Sitting pose holding paintbrush + palette
 *     - Idle: breathing, head bob, brush painting arc
 *     - Gesture: every ~10s right arm extends toward viewer (CTA hint)
 *  4. MeshToonMaterial throughout → flat-shaded cartoon look, no dark shadows
 *  5. DustField and GlowRing removed (were causing dark rendering artifacts)
 *
 * PERFORMANCE:
 *  - 70 sparkle points vs 1200 instanced spheres (−94% draw calls)
 *  - All materials created once in useMemo
 *  - Character hidden on mobile (< 768px) to avoid text overlap
 *  - DPR capped at 1.5 desktop / 1.0 mobile
 *
 * GLTF SWAP-IN (optional):
 *  To replace the procedural character with a real model from Sketchfab/Poly Pizza:
 *    1. Download a low-poly .glb file, place in /public/models/artist.glb
 *    2. Import { useGLTF, useAnimations } from '@react-three/drei'
 *    3. Swap <ArtistCharacter> with <group><primitive object={scene} /></group>
 *    4. Wire Mixamo animations via useAnimations()
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
'use client';
;
;
;
// ─── Tiny math helper ─────────────────────────────────────────────────────────
const lerp = (a, b, t)=>a + (b - a) * t;
// ─── Toon material factory (creates once, stable ref) ─────────────────────────
function toon(hex) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshToonMaterial"]({
        color: hex
    });
}
function basic(hex, opacity = 1) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
        color: hex,
        transparent: opacity < 1,
        opacity
    });
}
// ─── Ambient sparkles ─────────────────────────────────────────────────────────
// Replaces the heavy instanced particle system. 70 points at 0.28 opacity.
function AmbientSparkles() {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const COUNT = 70;
    const positions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AmbientSparkles.useMemo[positions]": ()=>{
            const arr = new Float32Array(COUNT * 3);
            for(let i = 0; i < COUNT; i++){
                const ang = Math.random() * Math.PI * 2;
                const r = 2.5 + Math.random() * 5.5;
                arr[i * 3] = Math.cos(ang) * r + (Math.random() - 0.5) * 1.5;
                arr[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
                arr[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
            }
            return arr;
        }
    }["AmbientSparkles.useMemo[positions]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "AmbientSparkles.useFrame": ({ clock })=>{
            if (!ref.current) return;
            const t = clock.elapsedTime;
            ref.current.rotation.y = t * 0.006;
            ref.current.position.y = Math.sin(t * 0.12) * 0.07;
        }
    }["AmbientSparkles.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        ref: ref,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferGeometry", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                    attach: "attributes-position",
                    args: [
                        positions,
                        3
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
                size: 0.055,
                color: "#52b788",
                transparent: true,
                opacity: 0.28,
                sizeAttenuation: true,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/floating-particles.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(AmbientSparkles, "0ptl0ffithHPFc/nsupaEfjPmlg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = AmbientSparkles;
// ─── Floating paint drops (decorative accent) ─────────────────────────────────
function PaintDrops() {
    _s1();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const drops = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PaintDrops.useMemo[drops]": ()=>{
            const palette = [
                '#74c69d',
                '#52b788',
                '#95d5b2',
                '#b7e4c7',
                '#40916c',
                '#1b4332'
            ];
            return Array.from({
                length: 9
            }, {
                "PaintDrops.useMemo[drops]": (_, i)=>({
                        pos: [
                            -4.5 + i * 1.1 + (Math.random() - 0.5) * 0.6,
                            -1.5 + (Math.random() - 0.5) * 2.5,
                            -1 + (Math.random() - 0.5) * 1.5
                        ],
                        mat: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshToonMaterial"]({
                            color: palette[i % palette.length],
                            transparent: true,
                            opacity: 0.32 + Math.random() * 0.12
                        }),
                        scale: 0.04 + Math.random() * 0.055,
                        freq: 0.35 + Math.random() * 0.55,
                        phase: Math.random() * Math.PI * 2
                    })
            }["PaintDrops.useMemo[drops]"]);
        }
    }["PaintDrops.useMemo[drops]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "PaintDrops.useFrame": ({ clock })=>{
            if (!ref.current) return;
            const t = clock.elapsedTime;
            ref.current.children.forEach({
                "PaintDrops.useFrame": (child, i)=>{
                    const d = drops[i];
                    if (!d) return;
                    child.position.y = d.pos[1] + Math.sin(t * d.freq + d.phase) * 0.22;
                    child.rotation.z = t * 0.22 * (i % 2 === 0 ? 1 : -1);
                }
            }["PaintDrops.useFrame"]);
        }
    }["PaintDrops.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ref: ref,
        children: drops.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: d.mat,
                position: d.pos,
                scale: d.scale,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        1,
                        7,
                        7
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 140,
                    columnNumber: 11
                }, this)
            }, i, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/3d/floating-particles.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_s1(PaintDrops, "6pNkquEe6DSAUaBdTyaMlJ+BSyQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c1 = PaintDrops;
// ─── Artist character materials (created once via useMemo) ────────────────────
function useArtistMaterials() {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useArtistMaterials.useMemo": ()=>({
                skin: toon('#F5C8A0'),
                hair: toon('#3C1A09'),
                shirt: toon('#2D6A4F'),
                pants: toon('#1B3A4B'),
                shoe: toon('#2C1A0E'),
                brush: toon('#7B3C10'),
                metal: toon('#BDBDBD'),
                bristle: toon('#2A1408'),
                beret: toon('#1B4332'),
                beretBtn: toon('#52B788'),
                palette: toon('#C8963A'),
                eye: basic('#2A1408'),
                eyeShine: basic('#FFFFFF'),
                cheek: basic('#FFB0A0', 0.52),
                smudge0: basic('#E63946', 0.65),
                smudge1: basic('#2A9D8F', 0.65),
                smudge2: basic('#E9C46A', 0.65),
                paint0: basic('#E63946'),
                paint1: basic('#F4A261'),
                paint2: basic('#2A9D8F'),
                paint3: basic('#52B788'),
                thumbHole: basic('#9B6E28'),
                brushTip: basic('#E63946'),
                smile: basic('#B86040')
            })
    }["useArtistMaterials.useMemo"], []);
}
_s2(useArtistMaterials, "nwk+m61qLgjDVUp4IGV/072DDN4=");
// ─── Procedural artist character ──────────────────────────────────────────────
function ArtistCharacter({ isMobile }) {
    _s3();
    const m = useArtistMaterials();
    const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const headGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bodyMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rArmGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lArmGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nextGesture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(8 + Math.random() * 4);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "ArtistCharacter.useFrame": ({ clock })=>{
            const t = clock.elapsedTime;
            // Float
            if (groupRef.current) {
                groupRef.current.position.y = Math.sin(t * 0.50) * 0.048;
            }
            // Breathe
            if (bodyMesh.current) {
                bodyMesh.current.scale.y = 1 + Math.sin(t * 1.85) * 0.012;
            }
            // Head bob + gentle look-around
            if (headGroup.current) {
                headGroup.current.position.y = 0.80 + Math.sin(t * 1.85) * 0.009;
                headGroup.current.rotation.z = Math.sin(t * 0.52) * 0.032;
                headGroup.current.rotation.y = Math.sin(t * 0.38) * 0.048;
            }
            // Right arm — painting arc
            if (rArmGroup.current) {
                const baseX = -0.52 + Math.sin(t * 2.1) * 0.17;
                const baseZ = -0.28 + Math.sin(t * 1.05) * 0.042;
                if (t > nextGesture.current) {
                    const gp = lerp(0, 1, (t - nextGesture.current) / 1.6);
                    if (gp < 1.0) {
                        rArmGroup.current.rotation.x = baseX + Math.sin(gp * Math.PI) * -0.9;
                        rArmGroup.current.rotation.z = baseZ + Math.sin(gp * Math.PI) * -0.3;
                    } else {
                        rArmGroup.current.rotation.x = baseX;
                        rArmGroup.current.rotation.z = baseZ;
                        if (gp > 1.12) nextGesture.current = t + 8 + Math.random() * 7;
                    }
                } else {
                    rArmGroup.current.rotation.x = baseX;
                    rArmGroup.current.rotation.z = baseZ;
                }
            }
            // Left arm — gentle palette sway
            if (lArmGroup.current) {
                lArmGroup.current.rotation.x = -0.26 + Math.sin(t * 0.88) * 0.035;
            }
        }
    }["ArtistCharacter.useFrame"]);
    // Hidden on mobile — would overlap text in portrait layout
    if (isMobile) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ref: groupRef,
        position: [
            3.5,
            -1.9,
            0.3
        ],
        rotation: [
            0,
            -0.38,
            0
        ],
        scale: 0.92,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                ref: bodyMesh,
                material: m.shirt,
                position: [
                    0,
                    0.28,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.18,
                        0.22,
                        0.52,
                        8
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudge0,
                position: [
                    -0.06,
                    0.36,
                    0.21
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.025,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 243,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudge1,
                position: [
                    0.09,
                    0.22,
                    0.21
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.022,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 246,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 245,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudge2,
                position: [
                    -0.11,
                    0.16,
                    0.20
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.020,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 249,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.pants,
                position: [
                    0,
                    0.01,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.20,
                        0.19,
                        0.18,
                        8
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 254,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            [
                -0.12,
                0.12
            ].map((x, li)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                    position: [
                        x,
                        -0.07,
                        0
                    ],
                    rotation: [
                        0.80,
                        0,
                        0
                    ],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.pants,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                args: [
                                    0.085,
                                    0.078,
                                    0.36,
                                    7
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 261,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 260,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                            position: [
                                0,
                                -0.21,
                                0.19
                            ],
                            rotation: [
                                -1.02,
                                0,
                                0
                            ],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.pants,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                        args: [
                                            0.072,
                                            0.066,
                                            0.30,
                                            7
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 265,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 264,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.shoe,
                                    position: [
                                        0,
                                        -0.17,
                                        0.04
                                    ],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            0.125,
                                            0.09,
                                            0.195
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 268,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 267,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 263,
                            columnNumber: 11
                        }, this)
                    ]
                }, li, true, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 259,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: rArmGroup,
                position: [
                    0.22,
                    0.44,
                    0
                ],
                rotation: [
                    -0.52,
                    0,
                    -0.28
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.shirt,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.064,
                                0.056,
                                0.27,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 277,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 276,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.145,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.064,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 280,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 279,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            0.038,
                            -0.235,
                            0.075
                        ],
                        rotation: [
                            0.27,
                            0,
                            0.07
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.053,
                                        0.046,
                                        0.24,
                                        7
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 283,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                position: [
                                    0.018,
                                    -0.14,
                                    0.048
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.059,
                                        8,
                                        8
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 287,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                                position: [
                                    0.018,
                                    -0.235,
                                    0.095
                                ],
                                rotation: [
                                    0.36,
                                    0,
                                    -0.11
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.brush,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.012,
                                                0.010,
                                                0.40,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 292,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.metal,
                                        position: [
                                            0,
                                            0.21,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.015,
                                                0.015,
                                                0.036,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 295,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.bristle,
                                        position: [
                                            0,
                                            0.255,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("coneGeometry", {
                                            args: [
                                                0.019,
                                                0.080,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 298,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 297,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.brushTip,
                                        position: [
                                            0,
                                            0.305,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.010,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 301,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 300,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 275,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: lArmGroup,
                position: [
                    -0.22,
                    0.44,
                    0
                ],
                rotation: [
                    -0.26,
                    0,
                    0.28
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.shirt,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.064,
                                0.056,
                                0.27,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 310,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 309,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.145,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.064,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 313,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 312,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            -0.038,
                            -0.235,
                            0.075
                        ],
                        rotation: [
                            0.23,
                            0,
                            -0.06
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.053,
                                        0.046,
                                        0.24,
                                        7
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 317,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                position: [
                                    -0.018,
                                    -0.14,
                                    0.048
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.059,
                                        8,
                                        8
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 319,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                                position: [
                                    -0.048,
                                    -0.215,
                                    0.095
                                ],
                                rotation: [
                                    0.62,
                                    0.16,
                                    0.07
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.palette,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.12,
                                                0.11,
                                                0.020,
                                                10
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 325,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 324,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint0,
                                        position: [
                                            0.052,
                                            0.013,
                                            0.022
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.022,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 327,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 327,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint1,
                                        position: [
                                            -0.044,
                                            0.013,
                                            0.060
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.020,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 328,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint2,
                                        position: [
                                            0.070,
                                            0.013,
                                            -0.035
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.021,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 329,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 329,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint3,
                                        position: [
                                            -0.034,
                                            0.013,
                                            -0.070
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.020,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 330,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 330,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.thumbHole,
                                        position: [
                                            -0.075,
                                            0.011,
                                            -0.048
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.022,
                                                0.022,
                                                0.022,
                                                8
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/floating-particles.tsx",
                                            lineNumber: 332,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 331,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 315,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 308,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.skin,
                position: [
                    0,
                    0.60,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.070,
                        0.074,
                        0.12,
                        8
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/floating-particles.tsx",
                    lineNumber: 340,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 339,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: headGroup,
                position: [
                    0,
                    0.80,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.245,
                                16,
                                16
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 347,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 346,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.hair,
                        position: [
                            0,
                            0.068,
                            -0.018
                        ],
                        scale: [
                            1.02,
                            0.68,
                            1.02
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.252,
                                16,
                                16
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 351,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 350,
                        columnNumber: 9
                    }, this),
                    [
                        -0.098,
                        0.098
                    ].map((x, ei)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                            position: [
                                x,
                                0.038,
                                0.220
                            ],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.eye,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            0.034,
                                            8,
                                            8
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 357,
                                        columnNumber: 36
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 357,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.eyeShine,
                                    position: [
                                        0.011,
                                        0.012,
                                        0.026
                                    ],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            0.012,
                                            5,
                                            5
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/floating-particles.tsx",
                                        lineNumber: 359,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, ei, true, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 356,
                            columnNumber: 11
                        }, this)),
                    [
                        -0.098,
                        0.098
                    ].map((x, bi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.hair,
                            position: [
                                x,
                                0.108,
                                0.225
                            ],
                            rotation: [
                                0,
                                0,
                                bi === 0 ? 0.18 : -0.18
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    0.085,
                                    0.018,
                                    0.014
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this)
                        }, bi, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.014,
                            0.244
                        ],
                        scale: [
                            0.72,
                            1,
                            0.48
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.032,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 373,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 372,
                        columnNumber: 9
                    }, this),
                    Array.from({
                        length: 5
                    }, (_, i)=>{
                        const tt = i / 4 - 0.5;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.smile,
                            position: [
                                tt * 0.098,
                                -0.086 + tt * tt * 0.028,
                                0.242
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.012,
                                    5,
                                    5
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 381,
                                columnNumber: 15
                            }, this)
                        }, i, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 380,
                            columnNumber: 13
                        }, this);
                    }),
                    [
                        -0.168,
                        0.168
                    ].map((x, ci)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.cheek,
                            position: [
                                x,
                                -0.016,
                                0.190
                            ],
                            scale: [
                                1.12,
                                0.72,
                                0.32
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.042,
                                    6,
                                    6
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 389,
                                columnNumber: 13
                            }, this)
                        }, ci, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 388,
                            columnNumber: 11
                        }, this)),
                    [
                        -0.248,
                        0.248
                    ].map((x, ei)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.skin,
                            position: [
                                x,
                                0,
                                0
                            ],
                            scale: [
                                0.44,
                                0.74,
                                0.44
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.070,
                                    8,
                                    8
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 396,
                                columnNumber: 13
                            }, this)
                        }, ei, false, {
                            fileName: "[project]/components/3d/floating-particles.tsx",
                            lineNumber: 395,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            0.036,
                            0.22,
                            -0.026
                        ],
                        rotation: [
                            0.08,
                            0.16,
                            0.26
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beret,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.224,
                                        0.205,
                                        0.072,
                                        12
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 403,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 402,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beret,
                                position: [
                                    0,
                                    0.028,
                                    0.028
                                ],
                                scale: [
                                    0.90,
                                    0.52,
                                    0.90
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.215,
                                        12,
                                        12
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 406,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 405,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beretBtn,
                                position: [
                                    -0.036,
                                    0.125,
                                    0.052
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.020,
                                        6,
                                        6
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/floating-particles.tsx",
                                    lineNumber: 409,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/floating-particles.tsx",
                                lineNumber: 408,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/floating-particles.tsx",
                        lineNumber: 401,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 344,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/floating-particles.tsx",
        lineNumber: 235,
        columnNumber: 5
    }, this);
}
_s3(ArtistCharacter, "O76AiuCjPEc2xoBZ9GNW7BSq7Ac=", false, function() {
    return [
        useArtistMaterials,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c2 = ArtistCharacter;
// ─── Lighting ─────────────────────────────────────────────────────────────────
function Lights() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 1.05,
                color: "#ffffff"
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 421,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    5,
                    7,
                    6
                ],
                intensity: 1.6,
                color: "#ffe8d0",
                castShadow: false
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 422,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    -4,
                    3,
                    5
                ],
                intensity: 0.70,
                color: "#b7e4c7"
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 428,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    2,
                    -2,
                    4
                ],
                intensity: 0.35,
                color: "#ffffff"
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 429,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c3 = Lights;
// ─── Camera parallax ─────────────────────────────────────────────────────────
function CameraRig({ mouseRef }) {
    _s4();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "CameraRig.useFrame": ({ camera })=>{
            const tx = mouseRef.current.x * 0.22;
            const ty = mouseRef.current.y * 0.16;
            camera.position.x += (tx - camera.position.x) * 0.04;
            camera.position.y += (ty - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);
        }
    }["CameraRig.useFrame"]);
    return null;
}
_s4(CameraRig, "xC67171NPRcCAzsbrenetil66NI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c4 = CameraRig;
// ─── Scene root ───────────────────────────────────────────────────────────────
function Scene({ mouseRef, isMobile }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Lights, {}, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 461,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AmbientSparkles, {}, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 462,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaintDrops, {}, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 463,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ArtistCharacter, {
                isMobile: isMobile
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 464,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraRig, {
                mouseRef: mouseRef
            }, void 0, false, {
                fileName: "[project]/components/3d/floating-particles.tsx",
                lineNumber: 465,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c5 = Scene;
function FloatingParticles() {
    _s5();
    const mouseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const isMobile = ("TURBOPACK compile-time value", "object") !== 'undefined' && window.innerWidth < 768;
    const onMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FloatingParticles.useCallback[onMouseMove]": (e)=>{
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
        }
    }["FloatingParticles.useCallback[onMouseMove]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FloatingParticles.useEffect": ()=>{
            window.addEventListener('mousemove', onMouseMove, {
                passive: true
            });
            return ({
                "FloatingParticles.useEffect": ()=>window.removeEventListener('mousemove', onMouseMove)
            })["FloatingParticles.useEffect"];
        }
    }["FloatingParticles.useEffect"], [
        onMouseMove
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
        className: "absolute inset-0",
        style: {
            pointerEvents: 'none'
        },
        camera: {
            position: [
                0,
                0,
                8
            ],
            fov: 52
        },
        dpr: [
            1,
            isMobile ? 1 : 1.5
        ],
        gl: {
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Scene, {
            mouseRef: mouseRef,
            isMobile: isMobile
        }, void 0, false, {
            fileName: "[project]/components/3d/floating-particles.tsx",
            lineNumber: 500,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/3d/floating-particles.tsx",
        lineNumber: 487,
        columnNumber: 5
    }, this);
}
_s5(FloatingParticles, "dWpwFcwDPNhcStGWPiojDi4bSn0=");
_c6 = FloatingParticles;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "AmbientSparkles");
__turbopack_context__.k.register(_c1, "PaintDrops");
__turbopack_context__.k.register(_c2, "ArtistCharacter");
__turbopack_context__.k.register(_c3, "Lights");
__turbopack_context__.k.register(_c4, "CameraRig");
__turbopack_context__.k.register(_c5, "Scene");
__turbopack_context__.k.register(_c6, "FloatingParticles");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/3d/floating-particles.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/3d/floating-particles.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_3d_floating-particles_tsx_0k-6eyz._.js.map