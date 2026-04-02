# SR Arts — Editor System v2 · Install Guide

## 1 · Install new packages

```bash
npm install \
  @tiptap/extension-character-count \
  @tiptap/extension-code-block-lowlight \
  @tiptap/extension-color \
  @tiptap/extension-focus \
  @tiptap/extension-font-family \
  @tiptap/extension-highlight \
  @tiptap/extension-list-keymap \
  @tiptap/extension-placeholder \
  @tiptap/extension-subscript \
  @tiptap/extension-superscript \
  @tiptap/extension-table \
  @tiptap/extension-table-cell \
  @tiptap/extension-table-header \
  @tiptap/extension-table-row \
  @tiptap/extension-task-item \
  @tiptap/extension-task-list \
  @tiptap/extension-text-style \
  @tiptap/extension-typography \
  @tiptap/suggestion \
  @google/genai \
  lowlight \
  tippy.js
```

## 2 · Add environment variables

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your key at: https://aistudio.google.com/app/apikey

## 3 · What changed

### New files
| Path | Purpose |
|---|---|
| `components/editor/` | Entire unified editor system |
| `components/editor/unified-editor.tsx` | Main editor component |
| `components/editor/config/types.ts` | Shared TypeScript types |
| `components/editor/config/extensions.ts` | Extension bundle config |
| `components/editor/extensions/font-size.ts` | Custom FontSize extension |
| `components/editor/extensions/line-height.ts` | Custom LineHeight extension |
| `components/editor/extensions/background-color.ts` | Custom BackgroundColor |
| `components/editor/extensions/custom-image.tsx` | Resizable image node |
| `components/editor/extensions/social-block.tsx` | YT/IG/FB planning blocks |
| `components/editor/extensions/slash-command.ts` | Slash command engine |
| `components/editor/components/ribbon/` | Word-style ribbon tabs |
| `components/editor/components/bubble-menu.tsx` | Floating selection menu |
| `components/editor/components/slash-menu.tsx` | Slash command UI |
| `components/editor/components/color-picker.tsx` | Color swatchpad |
| `components/editor/components/ai-panel.tsx` | Gemini AI sidebar |
| `components/editor/hooks/use-gemini.ts` | AI hook |
| `components/prose-content.tsx` | Shared HTML renderer |
| `components/community/inline-post-composer.tsx` | Persistent composer |
| `components/community/filter-bar.tsx` | Feed filter controls |
| `app/api/ai/generate/route.ts` | Gemini API route |

### Updated files
| Path | Change |
|---|---|
| `components/admin/tiptap-editor.tsx` | Now wraps UnifiedEditor |
| `components/community/create-post-editor.tsx` | Uses UnifiedEditor |
| `components/community/universal-repost-client.tsx` | Uses UnifiedEditor |
| `components/community/feed.tsx` | Persistent composer + filters |
| `components/community/page-header.tsx` | Write post CTA |
| `components/community/post-card.tsx` | Uses ProseContent |
| `components/community/post-detail.tsx` | Uses ProseContent |
| `app/(public)/blog/[slug]/page.tsx` | ProseContent + reading time |
| `app/(public)/terms/page.tsx` | ProseContent + default content |
| `app/(public)/privacy/page.tsx` | ProseContent + full default |
| `app/(public)/community/page.tsx` | New layout |
| `app/api/community/route.ts` | search/sort/filter params |
| `lib/db-server.ts` | getCommunityPosts search+sort |
| `app/globals.css` | Editor CSS |
| `next.config.mjs` | CSP updated |
| `package.json` | All new deps |

## 4 · Editor usage

```tsx
// Blog post admin (full ribbon + AI + social blocks)
<UnifiedEditor
  content={html}
  onChange={setHtml}
  mode="blog"
  uploadFolder="sr_arts/admin"
  enableAI={true}
/>

// Community post (ribbon + bubble menu, no social blocks)
<UnifiedEditor
  content={html}
  onChange={setHtml}
  mode="community"
  uploadFolder="sr_arts/community"
/>

// Minimal (repost note, lightweight)
<UnifiedEditor
  content={html}
  onChange={setHtml}
  mode="minimal"
  showRibbon={true}
  enableAI={false}
/>
```

## 5 · Render editor HTML

```tsx
import { ProseContent } from '@/components/prose-content';

// Blog post — large
<ProseContent html={post.content} size="lg" />

// Community card — small, clamped
<ProseContent html={post.content} size="sm" clampLines={8} />

// Post detail — medium
<ProseContent html={post.content} size="base" />
```
