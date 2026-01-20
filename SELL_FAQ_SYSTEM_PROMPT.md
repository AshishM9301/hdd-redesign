# Sell FAQ System Implementation Prompt

## Overview
This document contains the complete implementation plan for the FAQ system on the Sell page. The system is designed in phases: MVP (hardcoded) → Database-backed → Advanced features.

---

## PHASE 1: MVP - Hardcoded FAQ System

### *objective*
Create a fully functional FAQ page for the Sell section with search functionality, accordion-based Q&A display, and smooth navigation. All FAQ content will be hardcoded as constants for rapid MVP deployment.

### *context*
- Working in a T3 stack project with Next.js 15 App Router, tRPC, Prisma, Shadcn UI, Tailwind CSS
- Current file: `src/app/sell/_components/listing-boxes.tsx` has "VIEW FAQ" card with `href: "#"` that needs to link to `/sell/faq`
- Existing components available:
  - `src/components/ui/accordion.tsx` - Accordion component (Radix UI)
  - `src/components/ui/input.tsx` - Input component for search
  - `src/components/ui/button.tsx` - Button component
  - `src/components/ui/card.tsx` - Card component
- Project structure: Use `src/app/sell/faq/` for FAQ page, `_components/` for page-specific components

### *instructions*

#### 1.1 Update Listing Boxes Link
- **File**: `src/app/sell/_components/listing-boxes.tsx`
- Change line 37 from `href: "#"` to `href: "/sell/faq"`
- Keep all other properties unchanged

#### 1.2 Create FAQ Data File
- **File**: `src/app/sell/faq/_components/faq-data.ts`
- Create TypeScript file with FAQ data structure:
  ```typescript
  export type FAQSection = {
    id: string;
    title: string;
    slug: string;
    questions: FAQItem[];
  };

  export type FAQItem = {
    id: string;
    question: string;
    answer: string; // Can include HTML/markdown for formatting
    tags?: string[]; // For search functionality
  };

  export const faqSections: FAQSection[] = [
    {
      id: "listing-equipment",
      title: "LISTING YOUR EQUIPMENT",
      slug: "listing-equipment",
      questions: [
        {
          id: "how-to-list",
          question: "How do I list my equipment?",
          answer: "To list your equipment, click on the 'LIST ONLINE' button on the Sell page. You'll be guided through a step-by-step process where you'll provide details about your equipment, upload photos, and set your asking price.",
          tags: ["list", "equipment", "how", "process"]
        },
        {
          id: "listing-cost",
          question: "How much does it cost to list my equipment?",
          answer: "Listing your equipment on our platform is completely free! We add a commission on top of your asking price - this is the price that will appear on the website. You don't pay any fees to sell your equipment with us.",
          tags: ["cost", "price", "fee", "free", "commission"]
        },
        {
          id: "contract-signing",
          question: "Do I have to sign a contract? What if I sell the equipment on my own?",
          answer: "No contract is required to list your equipment. You maintain full control and can sell your equipment independently at any time. If you sell it elsewhere, simply notify us to remove the listing.",
          tags: ["contract", "agreement", "sell", "independent"]
        },
        {
          id: "listing-timeframe",
          question: "Ok, I've listed my equipment. How long until it's on your website?",
          answer: "Please allow up to one business day to process your listing. You will receive a confirmation email when it has been processed and is live on our website.",
          tags: ["time", "process", "approval", "live", "website"]
        },
        {
          id: "update-listing",
          question: "I have changes/more information to add to my listings, how do I do that?",
          answer: "You can update your listing by logging into your account and accessing the 'My Listings' section. From there, you can edit details, add photos, update pricing, or modify any information about your equipment.",
          tags: ["update", "edit", "change", "modify", "information"]
        }
      ]
    },
    {
      id: "how-we-sell",
      title: "HOW WE SELL YOUR EQUIPMENT",
      slug: "how-we-sell",
      questions: [
        {
          id: "advertising-locations",
          question: "Where do you advertise my equipment?",
          answer: "We advertise your equipment on our main website, through our email marketing campaigns to our subscriber base, on relevant industry platforms, and through our network of dealers and buyers. We also optimize listings for search engines to maximize visibility.",
          tags: ["advertise", "marketing", "website", "visibility", "promotion"]
        },
        {
          id: "interest-process",
          question: "What happens when someone is interested in my equipment?",
          answer: "When a potential buyer shows interest, we'll forward their contact information to you. You'll receive an email notification with the buyer's details, and you can then contact them directly to discuss the sale, arrange inspections, and finalize the transaction.",
          tags: ["interest", "buyer", "contact", "notification", "sale"]
        },
        {
          id: "hdd-broker-buy",
          question: "Does HDD Broker buy equipment?",
          answer: "HDD Broker primarily acts as a marketplace connecting sellers with buyers. We don't typically purchase equipment directly, but we do facilitate trade-ins and can connect you with dealers who may be interested in purchasing your equipment outright.",
          tags: ["buy", "purchase", "trade-in", "dealer", "direct"]
        }
      ]
    }
  ];
  ```
- Ensure all questions and answers match the image reference provided
- Add relevant tags to each question for better search functionality

#### 1.3 Create FAQ Search Component
- **File**: `src/app/sell/faq/_components/faq-search.tsx`
- Create a search input component with:
  - Input field with search icon (use `Search` from `lucide-react`)
  - Placeholder: "Search questions..."
  - Real-time filtering (use `useState` and `useDebounce` hook)
  - Clear button (X icon) that appears when there's text
  - Debounce search input (300ms delay) for performance
  - Use `Input` component from `@/components/ui/input`
  - Styling: Full width, prominent size, rounded corners
  - Keyboard shortcut support: `Ctrl/Cmd + K` to focus (optional enhancement)

#### 1.4 Create FAQ Accordion Component
- **File**: `src/app/sell/faq/_components/faq-accordion.tsx`
- Create component that:
  - Accepts `faqSections` and `searchQuery` as props
  - Filters questions based on search query (search in both question and answer text)
  - Highlights matching text in questions/answers (use `mark.js` or custom highlighting)
  - Uses `Accordion` component from `@/components/ui/accordion`
  - Allows multiple accordions open (`type="multiple"`)
  - Shows "No results found" message when search yields no results
  - Displays result count: "Found X matching questions"
  - Each question should have a play/triangle icon (use `Play` from `lucide-react`) before the text
  - Smooth animations for expand/collapse

#### 1.5 Create Jump To Navigation Component
- **File**: `src/app/sell/faq/_components/jump-to-nav.tsx`
- Create sticky navigation component:
  - Desktop: Sticky sidebar on the right or top bar
  - Mobile: Dropdown/select menu or horizontal scrollable tabs
  - Links to each FAQ section using smooth scroll
  - Active section highlighting (use `useEffect` with `IntersectionObserver` or scroll position)
  - Use `Button` component styled as links
  - Smooth scroll behavior with offset for sticky header

#### 1.6 Create Main FAQ Page
- **File**: `src/app/sell/faq/page.tsx`
- Create the main FAQ page with:
  - Hero section:
    - Title: "SELLING YOUR EQUIPMENT FAQS" (h1, large, bold)
    - Subtitle: "Click on a question to have its answer displayed." (muted text)
  - Search bar (prominent, full width, with margin)
  - Jump to navigation (positioned appropriately for desktop/mobile)
  - FAQ sections rendered using `FAQAccordion` component
  - Each section should have:
    - Section title (h2, bold, with divider line below)
    - Accordion items for questions
  - Responsive layout:
    - Desktop: Two-column layout (content + sticky nav) or single column with nav on top
    - Mobile: Stacked layout
  - Loading state: Show skeleton while FAQ data loads (if needed)
  - Use max-width container matching other pages (`max-w-7xl mx-auto px-4 py-8`)

#### 1.7 Create Custom Hooks (if needed)
- **File**: `src/hooks/use-debounce.ts` (if not exists)
- Create debounce hook for search input:
  ```typescript
  export function useDebounce<T>(value: T, delay: number): T {
    // Implementation
  }
  ```
- **File**: `src/hooks/use-scroll-spy.ts` (optional, for active section detection)
- Create hook to detect which section is currently in viewport

#### 1.8 URL Hash Support
- Implement URL hash linking for direct FAQ access:
  - Format: `/sell/faq#listing-equipment-how-to-list`
  - Auto-expand accordion when page loads with hash
  - Update URL hash when accordion is opened
  - Use `useEffect` to handle hash changes on mount and scroll

### *verification*
- Navigate to `/sell` page and click "VIEW FAQ" card
- Verify FAQ page loads with all sections and questions
- Test search functionality:
  - Type "contract" → should show contract-related question
  - Type "cost" → should show pricing question
  - Type "xyz123" → should show "No results found"
- Test accordion:
  - Click questions to expand/collapse
  - Multiple questions can be open simultaneously
  - Smooth animations work
- Test jump to navigation:
  - Click "Listing your equipment" → scrolls to that section
  - Click "How we sell your equipment" → scrolls to that section
  - Active section highlights correctly while scrolling
- Test responsive design:
  - Desktop: Layout looks good
  - Mobile: Stacked layout, touch-friendly
- Test URL hash:
  - Navigate to `/sell/faq#listing-equipment-how-to-list`
  - Verify correct accordion opens automatically
- Verify search highlighting works (matching text is highlighted)

### *preferences*
- Use existing Shadcn UI components
- Follow existing code style and patterns
- Use TypeScript with proper types
- Implement proper error boundaries
- Ensure accessibility (ARIA labels, keyboard navigation)
- Use Tailwind CSS for styling
- Match design system colors and spacing
- Add loading states where necessary
- Use `next/link` for internal navigation

---

## PHASE 2: Database-Backed FAQ System

### *objective*
Migrate the hardcoded FAQ system to a database-backed solution with admin panel for managing FAQs dynamically. This enables content updates without code deployments and provides foundation for analytics and advanced features.

### *context*
- Phase 1 MVP is complete and validated
- FAQ content needs to be manageable by admins
- Need to track FAQ performance (views, helpfulness)
- Future requirements: multi-language support, A/B testing, versioning
- Using Prisma ORM with PostgreSQL
- Admin panel exists at `src/app/admin/`

### *instructions*

#### 2.1 Prisma Schema Updates
- **File**: `prisma/schema.prisma`
- Add new models:
  ```prisma
  model FAQSection {
    id          String   @id @default(cuid())
    title       String
    slug        String   @unique
    description String?  // Optional section description
    order       Int      @default(0) // For custom ordering
    isActive    Boolean  @default(true)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    questions   FAQItem[]
    
    @@index([isActive])
    @@index([order])
  }

  model FAQItem {
    id          String   @id @default(cuid())
    sectionId   String
    section     FAQSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
    question    String
    answer      String   // Store as text, can be markdown/HTML
    order       Int      @default(0) // For custom ordering within section
    isActive    Boolean  @default(true)
    tags        String[] // Array of tags for search/filtering
    viewCount   Int      @default(0) // Track how many times viewed
    helpfulCount Int     @default(0) // Track positive feedback
    notHelpfulCount Int   @default(0) // Track negative feedback
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@index([sectionId])
    @@index([isActive])
    @@index([order])
    @@index([tags]) // For tag-based filtering
  }

  model FAQFeedback {
    id        String   @id @default(cuid())
    faqItemId String
    faqItem   FAQItem  @relation(fields: [faqItemId], references: [id], onDelete: Cascade)
    userId    String?  // Optional - can be anonymous feedback
    user      User?    @relation(fields: [userId], references: [id])
    isHelpful Boolean  // true = helpful, false = not helpful
    comment   String?  // Optional comment
    createdAt DateTime @default(now())
    
    @@index([faqItemId])
    @@index([userId])
  }
  ```
- Update User model to include FAQFeedback relation:
  ```prisma
  model User {
    // ... existing fields
    faqFeedback FAQFeedback[]
  }
  ```
- Run migration: `bunx prisma migrate dev --name add_faq_system`

#### 2.2 Create FAQ Types
- **File**: `src/types/faq.ts`
- Create TypeScript types matching Prisma schema:
  ```typescript
  import type { FAQSection, FAQItem, FAQFeedback } from "@prisma/client";

  export type FAQSectionWithQuestions = FAQSection & {
    questions: FAQItem[];
  };

  export type FAQItemWithSection = FAQItem & {
    section: FAQSection;
  };

  export type FAQItemWithFeedback = FAQItem & {
    _count?: {
      feedback: number;
    };
  };
  ```

#### 2.3 Create FAQ tRPC Router
- **File**: `src/server/api/routers/faq.ts`
- Create new router with procedures:
  - `getAll`: Public procedure returning all active FAQs grouped by section
    - Filter by `isActive: true` on both sections and items
    - Order by `order` field, then by `createdAt`
    - Return sections with nested questions
  - `getBySection`: Public procedure to get FAQs for a specific section slug
  - `search`: Public procedure for server-side search (optional, can keep client-side)
    - Input: `z.object({ query: z.string().min(1) })`
    - Search in question, answer, and tags
    - Return matching FAQs with relevance score
  - `incrementViewCount`: Public procedure to track FAQ views
    - Input: `z.object({ faqItemId: z.string() })`
    - Increment `viewCount` atomically
  - `submitFeedback`: Public procedure (can be protected if needed)
    - Input: `z.object({ faqItemId: z.string(), isHelpful: z.boolean(), comment: z.string().optional(), userId: z.string().optional() })`
    - Create FAQFeedback record
    - Update helpfulCount/notHelpfulCount on FAQItem
  - `getPopular`: Public procedure returning most viewed FAQs
    - Order by `viewCount` DESC
    - Limit to top 5-10
- Export router

#### 2.4 Add FAQ Router to Root Router
- **File**: `src/server/api/root.ts`
- Import FAQ router: `import { faqRouter } from "./routers/faq";`
- Add to router object: `faq: faqRouter,`

#### 2.5 Create Admin FAQ Management Pages
- **File**: `src/app/admin/faqs/page.tsx`
- Create admin dashboard for FAQ management:
  - List all FAQ sections with question counts
  - Add/Edit/Delete sections
  - Reorder sections (drag and drop or up/down buttons)
  - Toggle active/inactive status
  - Use DataTable component if available, or create custom table
  - Link to individual section management

- **File**: `src/app/admin/faqs/[sectionId]/page.tsx`
- Create section detail page:
  - List all questions in section
  - Add/Edit/Delete questions
  - Reorder questions
  - Toggle active/inactive
  - Edit tags
  - View analytics (view count, feedback)

- **File**: `src/app/admin/faqs/[sectionId]/[questionId]/page.tsx` (optional)
- Create question edit page with rich text editor for answers

#### 2.6 Update FAQ Page to Use Database
- **File**: `src/app/sell/faq/page.tsx`
- Replace hardcoded data import with tRPC query:
  - Use `api.faq.getAll.useQuery()` to fetch FAQs
  - Handle loading state (skeleton)
  - Handle error state
  - Keep same UI/UX as Phase 1

#### 2.7 Migrate Hardcoded Data to Database
- **File**: `prisma/seed.ts` or create migration script
- Create seed script to migrate Phase 1 FAQ data:
  - Read from `faq-data.ts` (or keep as reference)
  - Create FAQSection records
  - Create FAQItem records with proper relations
  - Set appropriate order values
  - Run: `bunx prisma db seed` or create manual migration

#### 2.8 Add Feedback Component
- **File**: `src/app/sell/faq/_components/faq-feedback.tsx`
- Create feedback component:
  - "Was this helpful?" section below each answer
  - Thumbs up / Thumbs down buttons
  - Optional comment field
  - Submit feedback via tRPC mutation
  - Show thank you message after submission
  - Track if user already submitted feedback (disable buttons)

#### 2.9 Update FAQ Accordion for Analytics
- **File**: `src/app/sell/faq/_components/faq-accordion.tsx`
- Track view count when accordion opens:
  - Use `onValueChange` callback from Accordion
  - Call `api.faq.incrementViewCount.mutate()` when item opens
  - Debounce to avoid multiple calls

### *verification*
- Run Prisma migration successfully
- Seed database with FAQ data
- Verify FAQ page loads data from database (same UI as Phase 1)
- Test admin panel:
  - Create new FAQ section
  - Add questions to section
  - Edit existing questions
  - Delete questions
  - Toggle active/inactive
  - Reorder sections/questions
- Test feedback system:
  - Submit helpful feedback
  - Submit not helpful feedback
  - Verify counts update
- Test analytics:
  - Open FAQs and verify view counts increment
  - Check popular FAQs display correctly
- Verify search still works with database data
- Test URL hash linking still works

### *preferences*
- Use Prisma for all database operations
- Use tRPC for API calls
- Follow existing admin panel patterns
- Use Shadcn components for admin UI
- Add proper error handling and validation
- Use React Hook Form for admin forms
- Add confirmation dialogs for deletions
- Implement optimistic updates where appropriate

---

## PHASE 3: Advanced FAQ Features

### *objective*
Enhance the FAQ system with advanced features including related questions, search improvements, analytics dashboard, SEO optimization, and user experience enhancements.

### *context*
- Phase 2 is complete - FAQ system is database-backed with admin panel
- Need to improve discoverability and user experience
- Want to track and analyze FAQ performance
- SEO optimization needed for better search engine visibility

### *instructions*

#### 3.1 Related Questions Feature
- **File**: `prisma/schema.prisma`
- Add relation field to FAQItem:
  ```prisma
  model FAQItem {
    // ... existing fields
    relatedItems FAQItem[] @relation("RelatedFAQs")
    relatedTo    FAQItem[] @relation("RelatedFAQs")
  }
  ```
- Or use a junction table for many-to-many:
  ```prisma
  model FAQRelation {
    id          String   @id @default(cuid())
    sourceId    String
    targetId    String
    source      FAQItem  @relation("SourceFAQ", fields: [sourceId], references: [id])
    target      FAQItem  @relation("TargetFAQ", fields: [targetId], references: [id])
    createdAt   DateTime @default(now())
    
    @@unique([sourceId, targetId])
    @@index([sourceId])
    @@index([targetId])
  }
  ```

- **File**: `src/app/sell/faq/_components/related-questions.tsx`
- Create component to show related questions:
  - Display below FAQ answer
  - Show 3-5 related questions
  - Link to related questions (with smooth scroll and auto-expand)
  - Use tags similarity or manual relations

- **File**: `src/server/api/routers/faq.ts`
- Add `getRelated` procedure:
  - Find FAQs with similar tags
  - Exclude current FAQ
  - Limit to 5 results
  - Order by relevance (tag overlap, view count)

#### 3.2 Enhanced Search
- **File**: `src/app/sell/faq/_components/faq-search.tsx`
- Enhance search with:
  - Search suggestions/autocomplete dropdown
  - Recent searches (localStorage)
  - Popular searches display
  - Search history
  - Fuzzy search using library like `fuse.js` or `match-sorter`
  - Search in tags with higher weight
  - Search result snippets with highlighted text

- **File**: `src/server/api/routers/faq.ts`
- Enhance `search` procedure:
  - Use full-text search if PostgreSQL supports it
  - Weight question matches higher than answer matches
  - Return relevance scores
  - Support tag-based filtering

#### 3.3 Analytics Dashboard
- **File**: `src/app/admin/faqs/analytics/page.tsx`
- Create analytics dashboard:
  - Total FAQ views over time (chart)
  - Most viewed FAQs
  - Most helpful FAQs (helpfulCount / total feedback)
  - Least helpful FAQs (need improvement)
  - Search query analytics (if tracking searches)
  - FAQ performance by section
  - User feedback trends
  - Use chart library like `recharts` or `chart.js`

- **File**: `src/server/api/routers/faq.ts`
- Add analytics procedures:
  - `getAnalytics`: Return aggregated stats
  - `getViewStats`: Time-series view data
  - `getFeedbackStats`: Feedback distribution

#### 3.4 SEO Optimization
- **File**: `src/app/sell/faq/page.tsx`
- Add SEO metadata:
  - Dynamic meta title and description
  - Open Graph tags
  - Structured data (JSON-LD) for FAQPage schema
  - Canonical URL
  - Sitemap entry

- **File**: `src/app/sell/faq/_components/faq-structured-data.tsx`
- Create component for FAQPage structured data:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Question text",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Answer text"
        }
      }
    ]
  }
  ```

#### 3.5 Print Functionality
- **File**: `src/app/sell/faq/_components/print-faq.tsx`
- Add print button and print styles:
  - Print button in header
  - CSS `@media print` styles
  - Hide navigation, search, buttons
  - Show all expanded FAQs
  - Clean formatting for printing
  - Include URL and date printed

#### 3.6 Share Functionality
- **File**: `src/app/sell/faq/_components/share-faq.tsx`
- Add share button for individual FAQs:
  - Copy link to clipboard
  - Share to social media (optional)
  - Generate shareable URL with hash
  - Show toast notification on copy

#### 3.7 Keyboard Shortcuts
- **File**: `src/app/sell/faq/_components/keyboard-shortcuts.tsx`
- Implement keyboard shortcuts:
  - `Ctrl/Cmd + K`: Focus search
  - `Esc`: Clear search / Close accordion
  - `Arrow Up/Down`: Navigate between FAQs
  - `Enter`: Toggle accordion
  - Show shortcuts help modal (`?` key)

#### 3.8 FAQ Categories/Filtering
- **File**: `src/app/sell/faq/_components/faq-filters.tsx`
- Add filter by tags:
  - Tag cloud or filter chips
  - Filter FAQs by selected tags
  - Multiple tag selection
  - Clear filters button
  - Show active filter count

#### 3.9 Email Support Integration
- **File**: `src/app/sell/faq/_components/contact-support.tsx`
- Add "Can't find your answer?" section:
  - Contact form or email link
  - Pre-fill with current FAQ context
  - Link to contact page
  - Show contact information prominently

#### 3.10 Performance Optimizations
- Implement:
  - Lazy load accordion content (load on expand)
  - Virtual scrolling for long FAQ lists
  - Memoization of filtered results
  - Debounced search (already in Phase 1)
  - Code splitting for FAQ page
  - Image optimization if FAQs include images

#### 3.11 A/B Testing Support (Future)
- **File**: `prisma/schema.prisma`
- Add fields for A/B testing:
  ```prisma
  model FAQItem {
    // ... existing fields
    variantA    String?  // Alternative answer version
    variantB    String?  // Alternative answer version
    testActive  Boolean  @default(false)
  }
  ```

#### 3.12 Multi-language Support (Future)
- **File**: `prisma/schema.prisma`
- Add translation support:
  ```prisma
  model FAQItemTranslation {
    id          String   @id @default(cuid())
    faqItemId   String
    faqItem     FAQItem  @relation(fields: [faqItemId], references: [id])
    language    String   // ISO language code
    question    String
    answer      String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@unique([faqItemId, language])
  }
  ```

### *verification*
- Related questions display correctly and link properly
- Enhanced search works with autocomplete and suggestions
- Analytics dashboard shows accurate data
- SEO structured data validates in Google Rich Results Test
- Print functionality produces clean output
- Share links work and auto-expand correct FAQ
- Keyboard shortcuts function properly
- Tag filtering works correctly
- Contact support integration functions
- Performance is optimized (check Lighthouse scores)

### *preferences*
- Use existing UI components and patterns
- Follow accessibility best practices
- Optimize for performance
- Use TypeScript strictly
- Add proper error handling
- Implement loading states
- Use analytics library if needed (e.g., PostHog, Plausible)
- Follow SEO best practices
- Test on multiple devices and browsers

---

## Migration Guide: Phase 1 → Phase 2

### Step 1: Backup Current FAQ Data
- Export `faq-data.ts` content as reference
- Document current structure

### Step 2: Database Setup
- Run Prisma migration for FAQ models
- Seed database with Phase 1 data

### Step 3: Update Code
- Create tRPC router
- Update FAQ page to use queries
- Create admin panel
- Test thoroughly

### Step 4: Deploy
- Deploy database migration
- Deploy code updates
- Verify production FAQ page works
- Train admins on new panel

### Step 5: Cleanup
- Remove hardcoded `faq-data.ts` (or keep as backup)
- Update documentation

---

## Future Enhancements (Post-Phase 3)

1. **AI-Powered FAQ Suggestions**: Use AI to suggest related FAQs based on user query
2. **FAQ Chatbot**: Integrate chatbot that uses FAQ content to answer questions
3. **Video FAQs**: Support video answers in addition to text
4. **FAQ Versioning**: Track changes to FAQs over time
5. **User-Generated FAQs**: Allow users to submit questions for admin review
6. **FAQ Ratings**: More granular rating system (1-5 stars)
7. **FAQ Comments**: Allow users to comment on FAQs (moderated)
8. **Export FAQs**: Export FAQs as PDF, CSV, or JSON
9. **FAQ Templates**: Create FAQ templates for common equipment types
10. **Integration**: Integrate FAQ system with help desk/ticketing system

---

## Notes

- **MVP Priority**: Focus on Phase 1 first - get it working and validated before moving to Phase 2
- **Content Management**: Phase 1 allows quick content updates via code, Phase 2 enables non-technical updates
- **Analytics**: Start tracking early (even in Phase 1) to gather data for Phase 2-3 decisions
- **User Feedback**: Collect user feedback on Phase 1 to inform Phase 2-3 features
- **Performance**: Monitor FAQ page performance and optimize as needed
- **Accessibility**: Ensure all phases maintain WCAG compliance
- **Mobile First**: Design with mobile experience as priority

---

## Quick Reference: File Structure

```
src/
├── app/
│   └── sell/
│       ├── faq/
│       │   ├── page.tsx                    # Main FAQ page (Phase 1)
│       │   └── _components/
│       │       ├── faq-data.ts             # Hardcoded data (Phase 1)
│       │       ├── faq-search.tsx          # Search component (Phase 1)
│       │       ├── faq-accordion.tsx       # Accordion component (Phase 1)
│       │       ├── jump-to-nav.tsx         # Navigation (Phase 1)
│       │       ├── faq-feedback.tsx        # Feedback (Phase 2)
│       │       ├── related-questions.tsx   # Related FAQs (Phase 3)
│       │       ├── faq-filters.tsx         # Tag filters (Phase 3)
│       │       ├── contact-support.tsx     # Contact form (Phase 3)
│       │       └── print-faq.tsx           # Print component (Phase 3)
│       └── _components/
│           └── listing-boxes.tsx           # Update href (Phase 1)
├── server/
│   └── api/
│       └── routers/
│           └── faq.ts                      # tRPC router (Phase 2)
├── app/
│   └── admin/
│       └── faqs/
│           ├── page.tsx                    # Admin dashboard (Phase 2)
│           ├── [sectionId]/
│           │   └── page.tsx                # Section management (Phase 2)
│           └── analytics/
│               └── page.tsx                # Analytics (Phase 3)
├── types/
│   └── faq.ts                              # TypeScript types (Phase 2)
└── hooks/
    ├── use-debounce.ts                     # Debounce hook (Phase 1)
    └── use-scroll-spy.ts                   # Scroll spy (Phase 1, optional)

prisma/
└── schema.prisma                            # Add FAQ models (Phase 2)
```

---

**End of Document**

