---
name: frontend-development
description: Provides guidance for Next.js/TypeScript frontend development, including component structure, styling with Tailwind CSS, responsive design patterns, mobile-first UI implementation, and adherence to the Pai platform's design system and UI standards.
---

# Frontend Development Skill for Pai Platform

## Overview
This skill guides frontend development work on the Pai Digital Twins Platform, ensuring code quality and adherence to the platform's design system, architectural patterns, and mobile-first development approach.

## When to Use
Claude Code automatically activates this skill when:
- Creating or modifying React components
- Building Next.js pages and layouts
- Implementing responsive designs
- Working with Tailwind CSS styling
- Following mobile-first development patterns
- Using the Pai design system and UI standards
- Debugging frontend layout issues
- Implementing touch interactions

## Critical First Step: Read UI_STANDARDS.md

**MANDATORY: Before making ANY UI changes, you MUST read:**
- `UI_STANDARDS.md` - Complete UI/UX standard operating procedures

This file contains:
- Mobile & desktop layout patterns (NO SCROLL vs SCROLLABLE)
- Responsive sizing with clamp() - REQUIRED for all dimensions
- Background system (5 gradient types, full gradient visibility)
- Typography system (3 font families with complete hierarchy)
- Reusable components from globals.css
- iOS Safari zoom prevention (16px font-size on inputs)
- Testing checklists and common mistakes

## Key Guidelines

### Component Development

1. **Always use TypeScript** for type safety
2. **File structure**:
   - Pages: `src/app/[route]/page.tsx`
   - Components: `src/components/`
   - Utilities: `src/lib/`
   - Styles: Reference `src/app/globals.css` for reusable classes
3. **Mobile-first approach**: Design for iPhone SE (375px) first, then scale up
4. **Responsive design**: Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
5. **Check globals.css first**: Button/component you need likely already exists

### Styling Standards

#### Typography System
- **Merriweather** (serif): All text except chat interfaces and display headings
  - Weights: 300 (Light), 400 (Regular)
  - Font import: `'Merriweather', Georgia, serif`
- **Instrument Serif** (serif): Display headings ONLY
  - Weight: 400 (Regular)
  - Font import: `'Instrument Serif', Georgia, serif`
- **Instrument Sans** (sans-serif): Chat and conversational UI ONLY
  - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
  - Font import: `'Instrument Sans', sans-serif`

#### Font Hierarchy
- **Display Heading**: Instrument Serif Regular, 64pt, Sentence Case (onboarding only)
- **Heading**: Merriweather Regular, 24pt, Sentence Case
- **Body**: Merriweather Light, 20pt (default body font)
- **In-Product Chat**: Instrument Sans, 14pt
- **Button**: Merriweather Light, 14pt
- **Text Boxes**: Merriweather Light, 14pt, COLOR 75%

#### Background System
The platform uses a split-background design with solid beige top and gradient bottom.

**Base Structure**:
- Top 50%: Solid #F3EEE8 (beige)
- Bottom 50%: Gradient overlay (varies by screen)
- Border: 1px solid #000
- Shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25)

**Background Variants** (all responsive gradients):
1. `.split-background` - Default (Peachy-orange → Lavender → Beige)
2. `.preferences-background` - Preferences (Green → Lavender → Beige)
3. `.quickfire-background` - Quick Fire (Peachy-orange → Green → Beige)
4. `.voice-interview-background` - Voice Interview (Gold → Peachy → Lavender → Beige)
5. `.completion-background` - Completion (Gold → Peachy → Lavender → Beige)

All gradients automatically adjust stops based on viewport height via CSS custom properties.

#### Responsive Sizing
- **ALWAYS use clamp()** for automatic scaling across devices
- Examples:
  - Font size: `fontSize: 'clamp(40px, 10vw, 64px)'`
  - Padding: `padding: 'clamp(16px, 4vw, 32px)'`
  - Margin: `marginBottom: 'clamp(24px, 4vh, 32px)'`
- **NEVER use fixed pixel values** for dimensions that need to scale

### Mobile Viewport Patterns (CRITICAL)

#### Pattern 1: Mobile No-Scroll (Onboarding Screens)

For mobile onboarding screens that must be locked to viewport height, ALWAYS use this exact pattern:

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function YourPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    setViewportHeight()
    checkMobile()

    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <div
      className="split-background"
      style={{
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: 'calc(var(--vh, 1vh) * 100)',
          maxHeight: 'calc(var(--vh, 1vh) * 100)',
          overflow: 'hidden',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        } : {
          minHeight: '100vh'
        })
      }}
    >
      <header style={isMobile ? { flexShrink: 0 } : {}}>
        {/* Header content */}
      </header>

      <main style={isMobile ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'auto',  // allows scrolling if content too tall
        padding: '0 clamp(16px, 4vw, 32px)'
      } : {}}>
        {/* Main content - vertically centered */}
      </main>
    </div>
  )
}
```

**Key Points**:
- ALWAYS use `position: fixed` for mobile
- ALWAYS use `calc(var(--vh, 1vh) * 100)` for height and maxHeight
- ALWAYS use `overflow: hidden` on outer container
- ALWAYS use `flex: 1` on main content area
- ALWAYS use `flexShrink: 0` on header
- ALWAYS use `justifyContent: 'center'` for vertical centering
- Use `overflow: 'auto'` on main if content needs scrolling

**Pages that MUST use this pattern**:
- `/consumer/welcome`
- `/consumer/get-paid`
- `/consumer/value-props`
- `/consumer/signin`
- `/consumer/signup`
- Any onboarding/intro screens

#### Pattern 2: Mobile Image Constraints (CRITICAL FOR IMAGE CONTENT)

**PROBLEM**: Images with `height: '100%'` or `flex: '1 1 auto'` on mobile will expand infinitely and push buttons below the viewport.

**SOLUTION**: Always use explicit vh-based constraints for image containers on mobile.

```typescript
// ❌ WRONG - Image claims all space, button invisible
<div style={{
  height: '100%',  // Takes ALL available space
  display: 'flex',
  flexDirection: 'column'
}}>
  <div style={{ flex: '1 1 auto' }}>  {/* Image expands infinitely */}
    <Image src={url} />
  </div>
  <button>Record</button>  {/* Pushed below viewport! */}
</div>

// ✅ CORRECT - Image constrained, button visible
<div style={{
  height: isMobile ? 'auto' : '100%',  // Don't claim space on mobile
  display: 'flex',
  flexDirection: 'column'
}}>
  <div style={isMobile ? {
    maxHeight: '40vh',  // FIXED constraint on mobile
    minHeight: '200px'
  } : {
    flex: '1 1 auto',  // Flexible on desktop
    minHeight: 0
  }}>
    <Image src={url} style={{ objectFit: 'contain' }} />
  </div>
  <button style={{ flexShrink: 0 }}>Record</button>  {/* Always visible! */}
</div>
```

**Mobile Viewport Budget Formula**:
When designing screens with images, allocate vh like this:
- Header: ~10vh
- Question/Title: ~8vh
- **Image**: 35-40vh (NEVER more than 45vh!)
- Button: ~8vh
- Progress bar: ~5vh
- Gaps/padding: ~4vh
- **Total**: ~70-75vh (safe zone, leaves buffer)

**Critical Rules for Image Screens**:
1. **Outer container**: `height: isMobile ? 'auto' : '100%'` (NOT always '100%')
2. **Image container**: Use `maxHeight: Xvh` on mobile, NOT `flex: 1`
3. **Button container**: ALWAYS `flexShrink: 0` so it never gets compressed
4. **Image element**: ALWAYS `objectFit: 'contain'` to prevent distortion
5. **Test**: After coding, calculate vh budget to ensure < 80vh total

**Example - Calibration with Single Image**:
```typescript
<div style={{
  display: 'flex',
  flexDirection: 'column',
  height: isMobile ? 'auto' : '100%',  // Key fix #1
  gap: '12px'
}}>
  {/* Image container - constrained */}
  <div style={isMobile ? {
    maxHeight: '40vh',  // Key fix #2 - explicit constraint
    minHeight: '200px'
  } : {
    flex: '1 1 auto',
    minHeight: 0
  }}>
    <Image
      src={imageUrl}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  </div>

  {/* Button - always visible */}
  <button style={{ flexShrink: 0 }}>  {/* Key fix #3 */}
    Record your response
  </button>
</div>
```

**Example - Calibration with Image Carousel**:
```typescript
<div style={{
  display: 'flex',
  flexDirection: 'column',
  height: isMobile ? 'auto' : '100%',
  gap: '12px'
}}>
  {/* Carousel wrapper - extra constraint for nav buttons */}
  <div style={isMobile ? {
    maxHeight: '35vh',  // Smaller to fit Previous/Next buttons
    minHeight: '200px'
  } : {
    flex: '1 1 auto',
    minHeight: 0
  }}>
    {/* Image display - even smaller */}
    <div style={isMobile ? {
      maxHeight: '25vh',  // Leave room for nav buttons
      minHeight: '150px'
    } : {
      flex: '1 1 auto',
      minHeight: 0
    }}>
      <Image src={imageUrls[currentIndex]} />
    </div>

    {/* Navigation buttons */}
    <div style={{ marginTop: '12px' }}>
      <button>Previous</button>
      <button>Next</button>
    </div>
  </div>

  {/* Record button - always visible */}
  <button style={{ flexShrink: 0 }}>
    Record your response
  </button>
</div>
```

**When to Use This Pattern**:
- Calibration screens with images (show_and_tell, show_multiple_and_tell)
- Any screen showing product images + requiring user action below
- Profile photo upload screens
- Any content where image + button must both be visible
- Ad preview screens

**Red Flags (Signs You Need This Pattern)**:
- Button is below fold on mobile
- User has to scroll to see action button
- Image takes up entire screen
- Content feels "cramped" on mobile
- Testing reveals missing UI elements

### State Management (CRITICAL)

**NEVER use localStorage** - The entire application is database-driven.

**Correct Pattern**:
- **Always use Supabase**: Query the database for current state
- **Stateless components**: Derive state from database queries
- **No client-side persistence**: All progress tracking comes from the database
- **Multi-device continuity**: Database enables start on phone, finish on desktop

**Examples**:
```typescript
// ❌ WRONG - Never do this
localStorage.setItem('userProgress', JSON.stringify(data))
const progress = localStorage.getItem('userProgress')

// ✅ CORRECT - Always query database
const { data: session } = await supabase
  .from('interview_sessions')
  .select('*')
  .eq('user_id', userId)
  .single()
```

### Database Integration

All frontend state should come from Supabase:
- Use `lib/supabase.ts` for client-side queries
- Respect Row Level Security (RLS) policies
- Query database on component mount to determine state
- Never store sensitive data in browser storage

### iOS Safari Zoom Prevention

**CRITICAL**: All input fields must have minimum 16px font-size to prevent iOS Safari auto-zoom.

```typescript
<input
  type="text"
  style={{
    fontSize: '16px',  // REQUIRED for iOS
    fontFamily: "'Merriweather', Georgia, serif",
    fontWeight: 300
  }}
/>
```

### Testing Checklist

Before considering work complete:

**Mobile Testing**:
- [ ] Test on iPhone SE (375px width)
- [ ] Verify full gradient visibility without scrolling
- [ ] Check responsive breakpoints (768px threshold)
- [ ] Test touch interactions
- [ ] Verify no horizontal scrolling
- [ ] Test landscape orientation

**Desktop Testing**:
- [ ] Test at 1024px, 1440px, 1920px widths
- [ ] Verify layouts scale properly
- [ ] Check hover states work

**Database Testing**:
- [ ] Verify state persists to Supabase
- [ ] Check no localStorage usage
- [ ] Test multi-device continuity

**Build Testing**:
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run lint` - passes
- [ ] Check console for warnings

### Common Mistakes to Avoid

**Layout Mistakes**:
- ❌ Using `min-h-screen` and `overflow-hidden` without `position: fixed` on mobile
- ❌ Using `100vh` instead of `calc(var(--vh, 1vh) * 100)`
- ❌ Forgetting `maxHeight` in addition to `height`
- ❌ Not using `flex: 1` on content areas
- ❌ Missing `justifyContent: 'center'` for vertical centering

**Styling Mistakes**:
- ❌ Using fixed pixel values instead of clamp()
- ❌ Creating new styles without checking globals.css first
- ❌ Not reading UI_STANDARDS.md before UI changes
- ❌ Using wrong font families (check hierarchy)
- ❌ Input font-size < 16px (causes iOS zoom)

**State Mistakes**:
- ❌ Storing state in localStorage
- ❌ Not querying Supabase for current state
- ❌ Assuming client-side state persists
- ❌ Hardcoding user data instead of querying

**Architecture Mistakes**:
- ❌ Putting API routes in `src/app/api/` (they go in root `/api/`)
- ❌ Using relative imports instead of absolute paths
- ❌ Modifying critical config files (package.json, tsconfig.json, vercel.json)

### File Structure Reference

```
/Users/rachita/Projects/Pai/
├── src/app/
│   ├── consumer/
│   │   ├── dashboard/page.tsx
│   │   ├── interview/page.tsx
│   │   └── calibration/page.tsx
│   ├── create-profile/page.tsx
│   └── globals.css              # Check for existing styles/components
├── src/components/
│   └── [components here]
├── src/lib/
│   ├── supabase.ts             # Supabase client for frontend
│   └── [utilities here]
├── api/                         # Python serverless (NOT in src/)
│   └── interview.py
├── UI_STANDARDS.md             # READ THIS FIRST for UI changes
└── CLAUDE.md                   # Architecture reference
```

### Useful Commands

```bash
npm run dev              # Start development server
npm run build           # Check TypeScript errors
npm run lint            # Lint code
```

### Design System Quick Reference

**Colors**:
- Base beige: `#F3EEE8`
- Peachy-orange: `#EFB79C`
- Lavender: `#CBD4E4`
- Green: `#BECFA4`
- Gold: `#EBB261`
- Coral: `#E49B77`

**Breakpoints**:
- Mobile: ≤ 768px
- Desktop: > 768px

**Typography Weights**:
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600

## Important Notes

- **Never modify or delete critical files**: `package.json`, `tsconfig.json`, `vercel.json`, `next.config.ts`, `tailwind.config.js`
- **API routes location**: All API routes are in `/api/` directory at root, NOT in `src/`
- **Python backend**: Designed for Vercel serverless functions
- **Database-driven**: Components should query Supabase for state, never use localStorage
- **Testing environment**: VAPI integration doesn't work on localhost - deploy to Vercel for testing

## Reference Documents

- `UI_STANDARDS.md` - Complete UI/UX patterns and standards (READ FIRST)
- `CLAUDE.md` - Architecture and project overview
- `DATABASE_SCHEMA.md` - Database structure and tables
- `src/app/globals.css` - Reusable component styles

---

This skill works well alongside:
- **claude-code-guide**: For Claude Code feature questions
- **general-purpose**: For complex multi-step tasks
- **Explore**: For codebase exploration and understanding
