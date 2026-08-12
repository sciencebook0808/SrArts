(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/3d/boy-model.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BoyModel",
    ()=>BoyModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/3d/boy-model.tsx
 *
 * Procedural low-poly cartoon artist boy.
 *
 * IDLE:      Gentle float + left arm slow wave (loops forever)
 * GALLERY:   Only ambient particles react — boy stays neutral
 * COMMISSION: Boy rotates slightly toward canvas, right arm paints arc
 *
 * All geometry: pure Three.js primitives, zero external model loading.
 * Toon shading via MeshToonMaterial for a hand-drawn illustration feel.
 *
 * GSAP handles state transitions (rotation, arm angles).
 * useFrame handles continuous idle oscillation.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ─── Stable material factory ────────────────────────────────────────────────
function toon(hex, opts = {}) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshToonMaterial"]({
        color: hex,
        ...opts
    });
}
function basic(hex, opacity = 1) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshBasicMaterial"]({
        color: hex,
        transparent: opacity < 1,
        opacity,
        depthWrite: opacity < 1 ? false : true
    });
}
function useMaterials() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useMaterials.useMemo": ()=>({
                skin: toon('#FFCBA4'),
                hair: toon('#3B1A08'),
                shirt: toon('#2D6A4F'),
                pants: toon('#1B3A4B'),
                shoe: toon('#2C1810'),
                brush: toon('#6B3410'),
                metal: toon('#CCCCCC'),
                bristle: toon('#1A0C04'),
                beret: toon('#1B4332'),
                beretBtn: toon('#52B788'),
                palette: toon('#C8963A'),
                eye: basic('#1A0C04'),
                eyeWhite: basic('#FFFFFF'),
                eyeShine: basic('#FFFFFF', 0.9),
                cheek: basic('#FFB0A0', 0.45),
                smile: basic('#9B5030'),
                smudgeR: basic('#E63946', 0.6),
                smudgeT: basic('#2A9D8F', 0.6),
                smudgeY: basic('#F4A261', 0.6),
                paint0: basic('#E63946'),
                paint1: basic('#F4A261'),
                paint2: basic('#2A9D8F'),
                paint3: basic('#52B788'),
                brushTip: basic('#CC2233')
            })
    }["useMaterials.useMemo"], []);
}
_s(useMaterials, "nwk+m61qLgjDVUp4IGV/072DDN4=");
function BoyModel({ hovered }) {
    _s1();
    const m = useMaterials();
    // Refs for animated parts
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bodyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const headRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lArmRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null); // waving arm
    const rArmRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null); // painting arm
    const rForeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null); // forearm for paint arc
    // Continuous idle rotation state (not affected by GSAP)
    const idleYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    // GSAP: respond to hovered changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BoyModel.useEffect": ()=>{
            const root = rootRef.current;
            const rArm = rArmRef.current;
            const rFore = rForeRef.current;
            if (!root || !rArm || !rFore) return;
            if (hovered === 'commission') {
                // Boy turns slightly toward canvas (canvas is to his left)
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(idleYRef, {
                    current: -0.42,
                    duration: 0.7,
                    ease: 'power2.out'
                });
                // Right arm lifts to paint
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(rArm.rotation, {
                    x: -0.9,
                    z: -0.2,
                    duration: 0.65,
                    ease: 'power2.out'
                });
            } else {
                // Back to default
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(idleYRef, {
                    current: 0,
                    duration: 0.7,
                    ease: 'power2.out'
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(rArm.rotation, {
                    x: -0.38,
                    z: -0.25,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        }
    }["BoyModel.useEffect"], [
        hovered
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "BoyModel.useFrame": ({ clock })=>{
            const t = clock.elapsedTime;
            // Float
            if (rootRef.current) {
                rootRef.current.position.y = Math.sin(t * 0.55) * 0.055;
                rootRef.current.rotation.y = idleYRef.current;
            }
            // Breathe
            if (bodyRef.current) {
                bodyRef.current.scale.y = 1 + Math.sin(t * 1.9) * 0.011;
            }
            // Head gentle bob
            if (headRef.current) {
                headRef.current.position.y = 0.82 + Math.sin(t * 1.9) * 0.009;
                headRef.current.rotation.z = Math.sin(t * 0.55) * 0.028;
                headRef.current.rotation.y = Math.sin(t * 0.42) * 0.042;
            }
            // LEFT arm: idle wave
            if (lArmRef.current && hovered !== 'commission') {
                lArmRef.current.rotation.z = 0.32 + Math.sin(t * 2.2) * 0.38;
                lArmRef.current.rotation.x = -0.18 + Math.sin(t * 1.1) * 0.06;
            }
            // RIGHT arm: paint arc when commissions hovered
            if (rForeRef.current && hovered === 'commission') {
                rForeRef.current.rotation.x = Math.sin(t * 2.8) * 0.28;
            }
            // RIGHT arm idle bob
            if (rArmRef.current && hovered !== 'commission') {
                rArmRef.current.rotation.x += (-0.38 - rArmRef.current.rotation.x) * 0.04 + Math.sin(t * 2.0) * 0.006;
            }
        }
    }["BoyModel.useFrame"]);
    // Title chars for visual interest
    const SMILE_DOTS = Array.from({
        length: 5
    }, (_, i)=>{
        const tt = i / 4 - 0.5;
        return [
            tt * 0.096,
            -0.088 + tt * tt * 0.025,
            0.243
        ];
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ref: rootRef,
        position: [
            0,
            0,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                ref: bodyRef,
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
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudgeR,
                position: [
                    -0.06,
                    0.37,
                    0.21
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.024,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 160,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudgeT,
                position: [
                    0.09,
                    0.23,
                    0.21
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.022,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 163,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.smudgeY,
                position: [
                    -0.10,
                    0.16,
                    0.20
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                    args: [
                        0.019,
                        5,
                        5
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 166,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 165,
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
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            [
                -0.115,
                0.115
            ].map((x, li)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                    position: [
                        x,
                        -0.08,
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
                                    0.082,
                                    0.076,
                                    0.34,
                                    7
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                            position: [
                                0,
                                -0.20,
                                0.18
                            ],
                            rotation: [
                                -1.04,
                                0,
                                0
                            ],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.pants,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                        args: [
                                            0.070,
                                            0.064,
                                            0.28,
                                            7
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 182,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 181,
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
                                            0.122,
                                            0.088,
                                            0.190
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 185,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 184,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, this)
                    ]
                }, li, true, {
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 176,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: lArmRef,
                position: [
                    -0.22,
                    0.44,
                    0
                ],
                rotation: [
                    -0.18,
                    0,
                    0.32
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.shirt,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.062,
                                0.055,
                                0.26,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.14,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.062,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 197,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            -0.032,
                            -0.22,
                            0.07
                        ],
                        rotation: [
                            0.22,
                            0,
                            -0.06
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.052,
                                        0.046,
                                        0.22,
                                        7
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 201,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                position: [
                                    -0.016,
                                    -0.132,
                                    0.045
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.058,
                                        8,
                                        8
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                                position: [
                                    -0.045,
                                    -0.20,
                                    0.088
                                ],
                                rotation: [
                                    0.58,
                                    0.14,
                                    0.06
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.palette,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.110,
                                                0.100,
                                                0.018,
                                                10
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 209,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 208,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint0,
                                        position: [
                                            0.048,
                                            0.012,
                                            0.020
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.020,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 211,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 211,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint1,
                                        position: [
                                            -0.040,
                                            0.012,
                                            0.055
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.018,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 212,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 212,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint2,
                                        position: [
                                            0.065,
                                            0.012,
                                            -0.032
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.019,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 213,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 213,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.paint3,
                                        position: [
                                            -0.030,
                                            0.012,
                                            -0.063
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.018,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 214,
                                            columnNumber: 74
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 214,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: rArmRef,
                position: [
                    0.22,
                    0.44,
                    0
                ],
                rotation: [
                    -0.38,
                    0,
                    -0.25
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.shirt,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                            args: [
                                0.062,
                                0.055,
                                0.26,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 222,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.14,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.062,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 225,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        ref: rForeRef,
                        position: [
                            0.032,
                            -0.22,
                            0.07
                        ],
                        rotation: [
                            0.25,
                            0,
                            0.06
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.052,
                                        0.046,
                                        0.22,
                                        7
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 229,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.skin,
                                position: [
                                    0.016,
                                    -0.132,
                                    0.045
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.058,
                                        8,
                                        8
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 232,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 231,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                                position: [
                                    0.016,
                                    -0.22,
                                    0.088
                                ],
                                rotation: [
                                    0.32,
                                    0,
                                    -0.10
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.brush,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.011,
                                                0.010,
                                                0.38,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.metal,
                                        position: [
                                            0,
                                            0.20,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                            args: [
                                                0.014,
                                                0.014,
                                                0.034,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 240,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.bristle,
                                        position: [
                                            0,
                                            0.245,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("coneGeometry", {
                                            args: [
                                                0.018,
                                                0.076,
                                                6
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 243,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 242,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        material: m.brushTip,
                                        position: [
                                            0,
                                            0.292,
                                            0
                                        ],
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                            args: [
                                                0.010,
                                                5,
                                                5
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/3d/boy-model.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 245,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: m.skin,
                position: [
                    0,
                    0.61,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.068,
                        0.072,
                        0.11,
                        8
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/boy-model.tsx",
                    lineNumber: 254,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: headRef,
                position: [
                    0,
                    0.82,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.240,
                                16,
                                16
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 262,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.hair,
                        position: [
                            0,
                            0.065,
                            -0.016
                        ],
                        scale: [
                            1.02,
                            0.66,
                            1.02
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.248,
                                16,
                                16
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    [
                        -0.096,
                        0.096
                    ].map((x, ei)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                            position: [
                                x,
                                0.038,
                                0.218
                            ],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.eyeWhite,
                                    scale: [
                                        1.2,
                                        1.1,
                                        0.8
                                    ],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            0.034,
                                            8,
                                            8
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 274,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 273,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.eye,
                                    position: [
                                        0,
                                        0,
                                        0.016
                                    ],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            0.026,
                                            8,
                                            8
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 277,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 276,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                    material: m.eyeShine,
                                    position: [
                                        0.010,
                                        0.011,
                                        0.040
                                    ],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            0.011,
                                            5,
                                            5
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/components/3d/boy-model.tsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, ei, true, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)),
                    [
                        -0.094,
                        0.094
                    ].map((x, bi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.hair,
                            position: [
                                x,
                                0.108,
                                0.222
                            ],
                            rotation: [
                                0,
                                0,
                                bi === 0 ? 0.20 : -0.20
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    0.080,
                                    0.017,
                                    0.013
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 288,
                                columnNumber: 13
                            }, this)
                        }, bi, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 287,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: m.skin,
                        position: [
                            0,
                            -0.014,
                            0.242
                        ],
                        scale: [
                            0.70,
                            1,
                            0.48
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.031,
                                7,
                                7
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 294,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this),
                    SMILE_DOTS.map(([x, y, z], i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.smile,
                            position: [
                                x,
                                y,
                                z
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.011,
                                    5,
                                    5
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 300,
                                columnNumber: 13
                            }, this)
                        }, i, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 299,
                            columnNumber: 11
                        }, this)),
                    [
                        -0.164,
                        0.164
                    ].map((x, ci)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.cheek,
                            position: [
                                x,
                                -0.014,
                                0.188
                            ],
                            scale: [
                                1.10,
                                0.70,
                                0.30
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.040,
                                    6,
                                    6
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this)
                        }, ci, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 306,
                            columnNumber: 11
                        }, this)),
                    [
                        -0.244,
                        0.244
                    ].map((x, ei)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            material: m.skin,
                            position: [
                                x,
                                0,
                                0
                            ],
                            scale: [
                                0.42,
                                0.72,
                                0.42
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                args: [
                                    0.068,
                                    8,
                                    8
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, this)
                        }, ei, false, {
                            fileName: "[project]/components/3d/boy-model.tsx",
                            lineNumber: 313,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        position: [
                            0.034,
                            0.220,
                            -0.022
                        ],
                        rotation: [
                            0.07,
                            0.15,
                            0.25
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beret,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                    args: [
                                        0.220,
                                        0.202,
                                        0.068,
                                        12
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 321,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 320,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beret,
                                position: [
                                    0,
                                    0.026,
                                    0.026
                                ],
                                scale: [
                                    0.89,
                                    0.50,
                                    0.89
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.210,
                                        12,
                                        12
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 324,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: m.beretBtn,
                                position: [
                                    -0.034,
                                    0.118,
                                    0.048
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.019,
                                        6,
                                        6
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/boy-model.tsx",
                                    lineNumber: 327,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/3d/boy-model.tsx",
                                lineNumber: 326,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/boy-model.tsx",
                        lineNumber: 319,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/boy-model.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/boy-model.tsx",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
_s1(BoyModel, "Sh1CVOhZrSGbYGaRXc4s3ymBVgg=", false, function() {
    return [
        useMaterials,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = BoyModel;
var _c;
__turbopack_context__.k.register(_c, "BoyModel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/3d/canvas-model.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CanvasModel",
    ()=>CanvasModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/3d/canvas-model.tsx
 *
 * Artist easel + canvas board.
 *
 * DEFAULT:   Canvas faces slightly sideways (angled away from camera)
 *            Board shows a colourful abstract painting in progress.
 *
 * GALLERY:   Canvas rotates smoothly to face the viewer,
 *            board texture updates to show "View Artworks →" with a green theme.
 *            A soft green glow pulse highlights the canvas rim.
 *
 * COMMISSION: Canvas stays in place while boy turns to paint on it.
 *
 * Texture technique: a 2D HTML Canvas is created client-side and used as a
 * THREE.CanvasTexture applied to the canvas board mesh. The texture is
 * re-drawn and marked needsUpdate whenever the hovered state changes.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ─── Canvas texture drawing ───────────────────────────────────────────────────
function drawDefaultArt(ctx, w, h) {
    // Warm cream base
    ctx.fillStyle = '#F8F3EB';
    ctx.fillRect(0, 0, w, h);
    // Subtle texture grain
    for(let i = 0; i < 120; i++){
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        ctx.fillStyle = `rgba(180,150,110,${0.03 + Math.random() * 0.04})`;
        ctx.fillRect(gx, gy, 2, 2);
    }
    // Paint palette – greens + warm accents
    const splashes = [
        [
            0.22,
            0.30,
            38,
            '#52B788'
        ],
        [
            0.55,
            0.20,
            24,
            '#40916C'
        ],
        [
            0.75,
            0.50,
            31,
            '#74C69D'
        ],
        [
            0.35,
            0.65,
            28,
            '#2D6A4F'
        ],
        [
            0.68,
            0.75,
            22,
            '#B7E4C7'
        ],
        [
            0.15,
            0.58,
            18,
            '#E63946AA'
        ],
        [
            0.82,
            0.28,
            16,
            '#F4A261AA'
        ],
        [
            0.48,
            0.82,
            20,
            '#2A9D8FAA'
        ]
    ];
    splashes.forEach(([nx, ny, r, color])=>{
        ctx.beginPath();
        ctx.arc(nx * w, ny * h, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });
    // Expressive brush strokes
    ctx.lineCap = 'round';
    const strokes = [
        [
            0.05,
            0.35,
            0.32,
            0.18,
            0.55,
            0.42,
            0.80,
            0.28,
            '#1B4332',
            6
        ],
        [
            0.10,
            0.60,
            0.28,
            0.45,
            0.52,
            0.72,
            0.85,
            0.55,
            '#2D6A4F',
            4
        ],
        [
            0.18,
            0.80,
            0.40,
            0.62,
            0.62,
            0.88,
            0.88,
            0.78,
            '#40916C',
            3
        ],
        [
            0.60,
            0.10,
            0.72,
            0.30,
            0.50,
            0.25,
            0.38,
            0.45,
            '#52B788',
            5
        ]
    ];
    strokes.forEach(([x1, y1, cx1, cy1, cx2, cy2, x2, y2, color, lw])=>{
        ctx.beginPath();
        ctx.moveTo(x1 * w, y1 * h);
        ctx.bezierCurveTo(cx1 * w, cy1 * h, cx2 * w, cy2 * h, x2 * w, y2 * h);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.globalAlpha = 0.82;
        ctx.stroke();
        ctx.globalAlpha = 1;
    });
    // Golden frame
    ctx.strokeStyle = '#C8963A';
    ctx.lineWidth = 5;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = '#E8B86088';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);
}
function drawGalleryText(ctx, w, h) {
    // Dark forest green background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1B4332');
    bg.addColorStop(1, '#2D6A4F');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Texture noise
    for(let i = 0; i < 80; i++){
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    // Borders
    ctx.strokeStyle = '#52B788';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = '#74C69D40';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    // Brush icon
    const cx = w / 2;
    const midY = h / 2;
    ctx.save();
    ctx.translate(cx, midY - 56);
    ctx.fillStyle = '#74C69D';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D8F3DC';
    ctx.fillRect(-3, 12, 6, 28);
    ctx.beginPath();
    ctx.moveTo(-8, 38);
    ctx.lineTo(8, 38);
    ctx.lineTo(3, 50);
    ctx.lineTo(-3, 50);
    ctx.closePath();
    ctx.fillStyle = '#95D5B2';
    ctx.fill();
    ctx.restore();
    // "View" text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#D8F3DC';
    ctx.font = `bold ${Math.round(w * 0.13)}px Georgia, serif`;
    ctx.fillText('View', cx, midY + 8);
    // "Artworks" text
    ctx.fillStyle = '#95D5B2';
    ctx.font = `bold ${Math.round(w * 0.11)}px Georgia, serif`;
    ctx.fillText('Artworks', cx, midY + 40);
    // Arrow
    ctx.fillStyle = '#52B788';
    ctx.font = `${Math.round(w * 0.10)}px sans-serif`;
    ctx.fillText('→', cx, midY + 68);
    // Corner accents
    const cornerLen = 18;
    ctx.strokeStyle = '#52B78888';
    ctx.lineWidth = 2;
    const corners = [
        [
            22,
            22,
            1,
            1
        ],
        [
            w - 22,
            22,
            -1,
            1
        ],
        [
            22,
            h - 22,
            1,
            -1
        ],
        [
            w - 22,
            h - 22,
            -1,
            -1
        ]
    ];
    corners.forEach(([x, y, sx, sy])=>{
        ctx.beginPath();
        ctx.moveTo(x, y + sy * cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + sx * cornerLen, y);
        ctx.stroke();
    });
}
function CanvasModel({ hovered }) {
    _s();
    // Canvas board refs
    const boardGroupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const boardMeshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const glowRingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Texture state
    const canvasElRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textureRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Helpers
    const redraw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasModel.useCallback[redraw]": (showGallery)=>{
            const el = canvasElRef.current;
            const tex = textureRef.current;
            if (!el || !tex) return;
            const ctx = el.getContext('2d');
            if (!ctx) return;
            if (showGallery) {
                drawGalleryText(ctx, el.width, el.height);
            } else {
                drawDefaultArt(ctx, el.width, el.height);
            }
            tex.needsUpdate = true;
        }
    }["CanvasModel.useCallback[redraw]"], []);
    // Create canvas texture client-side
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CanvasModel.useEffect": ()=>{
            const el = document.createElement('canvas');
            el.width = 512;
            el.height = 384;
            canvasElRef.current = el;
            const tex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CanvasTexture"](el);
            textureRef.current = tex;
            // Draw default art immediately
            const ctx = el.getContext('2d');
            if (ctx) drawDefaultArt(ctx, el.width, el.height);
            tex.needsUpdate = true;
            // Apply to board mesh
            const mesh = boardMeshRef.current;
            if (mesh) {
                const mat = mesh.material;
                mat.map = tex;
                mat.needsUpdate = true;
            }
            return ({
                "CanvasModel.useEffect": ()=>{
                    tex.dispose();
                }
            })["CanvasModel.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CanvasModel.useEffect"], []);
    // Update on hover change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CanvasModel.useEffect": ()=>{
            const board = boardGroupRef.current;
            const glow = glowRingRef.current;
            if (!board) return;
            if (hovered === 'gallery') {
                // Rotate canvas to face camera
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(board.rotation, {
                    y: 0,
                    duration: 0.75,
                    ease: 'power3.out'
                });
                // Glow ring fades in
                if (glow) {
                    const mat = glow.material;
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(mat, {
                        emissiveIntensity: 1.8,
                        opacity: 0.72,
                        duration: 0.5
                    });
                }
                // Redraw texture with text
                redraw(true);
            } else {
                // Return to default tilt
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(board.rotation, {
                    y: -0.72,
                    duration: 0.70,
                    ease: 'power2.out'
                });
                if (glow) {
                    const mat = glow.material;
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["gsap"].to(mat, {
                        emissiveIntensity: 0.2,
                        opacity: 0.22,
                        duration: 0.5
                    });
                }
                redraw(false);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CanvasModel.useEffect"], [
        hovered
    ]);
    // Glow pulse
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "CanvasModel.useFrame": ({ clock })=>{
            const ring = glowRingRef.current;
            if (!ring) return;
            if (hovered === 'gallery') {
                const mat = ring.material;
                const base = 1.8;
                mat.emissiveIntensity = base + Math.sin(clock.elapsedTime * 3.2) * 0.5;
            }
        }
    }["CanvasModel.useFrame"]);
    // ── Easel geometry ──────────────────────────────────────────────────────────
    const { easelMat, screwMat, boardMat } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CanvasModel.useMemo": ()=>({
                easelMat: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshToonMaterial"]({
                    color: '#6B3C18'
                }),
                screwMat: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: '#AAAAAA',
                    metalness: 0.8,
                    roughness: 0.3
                }),
                boardMat: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: '#F5ECD8',
                    roughness: 0.7
                })
            })
    }["CanvasModel.useMemo"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: [
            -1.2,
            -0.5,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    -0.20,
                    -0.10,
                    0.10
                ],
                rotation: [
                    0.22,
                    0,
                    -0.18
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.028,
                        0.024,
                        1.40,
                        7
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 275,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    0.20,
                    -0.10,
                    0.10
                ],
                rotation: [
                    0.22,
                    0,
                    0.18
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.028,
                        0.024,
                        1.40,
                        7
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 280,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    0,
                    -0.10,
                    -0.20
                ],
                rotation: [
                    -0.25,
                    0,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.024,
                        0.020,
                        1.35,
                        7
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 284,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    0,
                    -0.55,
                    0.10
                ],
                rotation: [
                    0,
                    0,
                    Math.PI / 2
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.016,
                        0.016,
                        0.50,
                        6
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 289,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    0,
                    -0.42,
                    -0.08
                ],
                rotation: [
                    0.40,
                    0,
                    Math.PI / 2
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.014,
                        0.014,
                        0.46,
                        6
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 293,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                material: easelMat,
                position: [
                    0,
                    -0.12,
                    0.05
                ],
                rotation: [
                    0.22,
                    0,
                    Math.PI / 2
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                    args: [
                        0.020,
                        0.020,
                        0.56,
                        7
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 298,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 297,
                columnNumber: 7
            }, this),
            [
                -0.22,
                0.22
            ].map((x, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    material: screwMat,
                    position: [
                        x,
                        0.22,
                        0.10
                    ],
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                        args: [
                            0.025,
                            7,
                            7
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 304,
                        columnNumber: 11
                    }, this)
                }, i, false, {
                    fileName: "[project]/components/3d/canvas-model.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: boardGroupRef,
                position: [
                    0,
                    0.40,
                    0.05
                ],
                rotation: [
                    0,
                    -0.72,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: easelMat,
                        position: [
                            0,
                            0.37,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                0.72,
                                0.040,
                                0.030
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/canvas-model.tsx",
                            lineNumber: 314,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: easelMat,
                        position: [
                            0,
                            -0.37,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                0.72,
                                0.040,
                                0.030
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/canvas-model.tsx",
                            lineNumber: 318,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 317,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: easelMat,
                        position: [
                            -0.34,
                            0,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                0.040,
                                0.78,
                                0.030
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/canvas-model.tsx",
                            lineNumber: 322,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        material: easelMat,
                        position: [
                            0.34,
                            0,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                0.040,
                                0.78,
                                0.030
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/canvas-model.tsx",
                            lineNumber: 326,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 325,
                        columnNumber: 9
                    }, this),
                    [
                        -0.34,
                        0.34
                    ].flatMap((x)=>[
                            -0.37,
                            0.37
                        ].map((y, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                material: screwMat,
                                position: [
                                    x,
                                    y,
                                    0.018
                                ],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                    args: [
                                        0.022,
                                        6,
                                        6
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/3d/canvas-model.tsx",
                                    lineNumber: 333,
                                    columnNumber: 15
                                }, this)
                            }, `${x}${y}`, false, {
                                fileName: "[project]/components/3d/canvas-model.tsx",
                                lineNumber: 332,
                                columnNumber: 13
                            }, this))),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        ref: boardMeshRef,
                        position: [
                            0,
                            0,
                            -0.005
                        ],
                        material: boardMat,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                            args: [
                                0.64,
                                0.70
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/3d/canvas-model.tsx",
                            lineNumber: 340,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 339,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        ref: glowRingRef,
                        position: [
                            0,
                            0,
                            0.002
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    0.70,
                                    0.76
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/3d/canvas-model.tsx",
                                lineNumber: 345,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                color: "#52B788",
                                emissive: "#52B788",
                                emissiveIntensity: 0.2,
                                transparent: true,
                                opacity: 0.22,
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/components/3d/canvas-model.tsx",
                                lineNumber: 346,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/3d/canvas-model.tsx",
                        lineNumber: 344,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/3d/canvas-model.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/canvas-model.tsx",
        lineNumber: 271,
        columnNumber: 5
    }, this);
}
_s(CanvasModel, "y5ZmUx5P1mBH90UyMvSOkJPP52Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = CanvasModel;
var _c;
__turbopack_context__.k.register(_c, "CanvasModel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/3d/hero-scene.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroScene",
    ()=>HeroScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/3d/hero-scene.tsx
 *
 * Interactive 3D hero scene — boy artist + easel.
 *
 * POSITIONING:
 *   Rendered in a fixed-size div (280 × 380px) positioned absolutely in the
 *   hero section's bottom-right quadrant. Only shown on xl+ screens.
 *   Canvas has pointer-events: none so it never intercepts UI interactions.
 *
 * HOVER STATES (driven by parent component state):
 *   'gallery'    → easel canvas rotates to face viewer, "View Artworks" text appears
 *   'commission' → boy rotates toward canvas, right arm paints
 *   null         → idle: boy waves, canvas angled sideways
 *
 * PERFORMANCE:
 *   - 280 × 380 canvas — tiny GPU footprint
 *   - DPR capped at 1.5 desktop
 *   - alpha: true transparent background
 *   - Low-poly geometry throughout
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$3d$2f$boy$2d$model$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/3d/boy-model.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$3d$2f$canvas$2d$model$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/3d/canvas-model.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// ─── Lights ──────────────────────────────────────────────────────────────────
function SceneLights() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 1.10,
                color: "#ffffff"
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    4,
                    6,
                    5
                ],
                intensity: 1.55,
                color: "#FFF3E0"
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    -4,
                    3,
                    4
                ],
                intensity: 0.80,
                color: "#B7E4C7"
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    0,
                    -3,
                    3
                ],
                intensity: 0.30,
                color: "#FFFFFF"
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = SceneLights;
// ─── Ground shadow disc ───────────────────────────────────────────────────────
function GroundDisc() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        position: [
            0.5,
            -1.62,
            0
        ],
        rotation: [
            -Math.PI / 2,
            0,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circleGeometry", {
                args: [
                    0.9,
                    32
                ]
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                color: "#2D6A4F",
                transparent: true,
                opacity: 0.10,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/hero-scene.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c1 = GroundDisc;
// ─── Ambient sparkles (lightweight points) ───────────────────────────────────
function Sparkles() {
    _s();
    const COUNT = 28;
    const positions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Sparkles.useMemo[positions]": ()=>{
            const arr = new Float32Array(COUNT * 3);
            for(let i = 0; i < COUNT; i++){
                arr[i * 3] = (Math.random() - 0.5) * 5;
                arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
                arr[i * 3 + 2] = (Math.random() - 0.5) * 2 - 1;
            }
            return arr;
        }
    }["Sparkles.useMemo[positions]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferGeometry", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                    attach: "attributes-position",
                    args: [
                        positions,
                        3
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/3d/hero-scene.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
                size: 0.06,
                color: "#74C69D",
                transparent: true,
                opacity: 0.30,
                sizeAttenuation: true,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/3d/hero-scene.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(Sparkles, "I+b6tccrQaP/02ry3fdPeTMKx2g=");
_c2 = Sparkles;
// ─── Scene root ───────────────────────────────────────────────────────────────
function Scene({ hoveredButton }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SceneLights, {}, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sparkles, {}, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GroundDisc, {}, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                position: [
                    1.05,
                    -0.20,
                    0
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$3d$2f$boy$2d$model$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoyModel"], {
                    hovered: hoveredButton
                }, void 0, false, {
                    fileName: "[project]/components/3d/hero-scene.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$3d$2f$canvas$2d$model$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CanvasModel"], {
                hovered: hoveredButton
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c3 = Scene;
function HeroScene({ hoveredButton }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
        style: {
            pointerEvents: 'none',
            background: 'transparent'
        },
        camera: {
            position: [
                0,
                0,
                5.2
            ],
            fov: 48,
            near: 0.1,
            far: 100
        },
        dpr: [
            1,
            1.5
        ],
        gl: {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            toneMapping: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACESFilmicToneMapping"],
            toneMappingExposure: 1.1
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: null,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Scene, {
                hoveredButton: hoveredButton
            }, void 0, false, {
                fileName: "[project]/components/3d/hero-scene.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/3d/hero-scene.tsx",
            lineNumber: 135,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/3d/hero-scene.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_c4 = HeroScene;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "SceneLights");
__turbopack_context__.k.register(_c1, "GroundDisc");
__turbopack_context__.k.register(_c2, "Sparkles");
__turbopack_context__.k.register(_c3, "Scene");
__turbopack_context__.k.register(_c4, "HeroScene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/3d/hero-scene.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/3d/hero-scene.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_3d_0~28.mj._.js.map