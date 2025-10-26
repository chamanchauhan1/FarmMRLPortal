# Farm MRL Portal - Design Guidelines

## Design Approach

**System-Based Approach**: Modern SaaS Dashboard Pattern
Drawing inspiration from Linear, Notion, and enterprise agricultural platforms, this design prioritizes data clarity, efficient workflows, and role-based interfaces. The agri-tech theme will be implemented through thoughtful component design and visual hierarchy rather than decorative elements.

## Core Design Principles

1. **Data-First Design**: Information hierarchy optimized for quick scanning and decision-making
2. **Role Clarity**: Distinct visual patterns for Farmer vs Inspector workflows
3. **Efficiency Over Decoration**: Every element serves a functional purpose
4. **Agricultural Context**: Professional yet approachable tone suitable for farm operations

## Typography System

**Font Stack**:
- Primary: 'Inter' from Google Fonts (weights: 400, 500, 600, 700)
- Monospace: 'JetBrains Mono' for data fields, timestamps, and ID numbers

**Hierarchy**:
- Page Titles: text-3xl font-bold (Dashboard, Farm Records, etc.)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Data Labels: text-sm font-medium uppercase tracking-wide
- Table Headers: text-xs font-semibold uppercase
- Metadata/Timestamps: text-sm font-normal in monospace

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8, etc.)

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Dashboard layout: Sidebar (fixed w-64) + Main content area (flex-1)
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Form layouts: max-w-2xl for single column forms
- Table containers: Full width with horizontal scroll on mobile

**Vertical Rhythm**:
- Page padding: py-6 md:py-8
- Section spacing: mb-8
- Card padding: p-6
- Form field spacing: gap-4

## Component Library

### Navigation Structure

**Sidebar Navigation** (Desktop):
- Fixed left sidebar with logo at top
- Navigation items with icons (Heroicons)
- Active state with indicator bar and subtle background
- Role badge displayed below logo (Farmer/Inspector)
- Collapse functionality for more screen space

**Mobile Navigation**:
- Bottom tab bar with 4-5 key sections
- Hamburger menu for additional options
- Fixed header with page title and user avatar

### Dashboard Components

**Hero Section** (Dashboard Landing):
- Welcome banner with farm name and last sync time
- Quick stats grid (4 cards): Total Animals, Active Treatments, Compliance Rate, Pending Reports
- Each stat card: Large number, label, trend indicator (up/down arrow with percentage)
- No large hero image - focus on actionable data immediately

**Data Visualization**:
- Chart cards with headers (title + time range selector dropdown)
- Recharts implementation: Line charts for trends, Bar charts for comparisons, Pie charts for distribution
- Chart height: h-64 md:h-80
- Legend positioned below charts
- Interactive tooltips on hover
- Grid lines subtle and minimal

**Tables**:
- Compact row design with hover states
- Alternating row backgrounds for readability
- Sticky header on scroll
- Action column (right-aligned) with icon buttons
- Pagination at bottom: Previous/Next + page numbers
- Per-page selector (10, 25, 50, 100 rows)
- Search/filter bar above table

### Form Design

**Input Fields**:
- Labels above inputs (font-medium text-sm)
- Input height: h-10 for text inputs, h-32 for textareas
- Border radius: rounded-md
- Focus states with ring effect
- Error states with icon and message below input
- Required field indicator (asterisk)

**Form Layout**:
- Vertical stacking for all fields
- Related fields grouped with section headers
- File upload: Drag-and-drop zone with file type icons
- Submit buttons: Full width on mobile, auto width on desktop (aligned right)

**Multi-step Forms** (for complex data entry):
- Progress indicator at top (steps with connecting lines)
- Current step highlighted
- Previous/Next navigation at bottom
- Save as draft option

### Card Components

**Standard Card**:
- Border with subtle shadow
- Rounded corners: rounded-lg
- Header section with title and action button
- Content area with consistent padding
- Footer for metadata or actions (if needed)

**Stat Card**:
- Prominent number display (text-4xl font-bold)
- Label below (text-sm)
- Icon in top-right corner
- Trend indicator with small chart or percentage change
- Hover: Slight lift effect

**Animal/Farm Record Card**:
- Thumbnail/icon on left
- Title and ID in header
- Key details in grid format
- Status badge (Compliant/Warning/Violation)
- Actions dropdown (three-dot menu)

### Data Display

**Status Badges**:
- Rounded-full px-3 py-1 text-xs font-semibold
- Visual states: Compliant, Warning, Violation, Pending, Active
- Icon prefix for critical states

**Data Lists**:
- Label-value pairs in grid (grid-cols-2 gap-4)
- Labels: text-sm with reduced opacity
- Values: text-base font-medium

**File Display**:
- File type icon + filename
- File size and upload date
- Download/preview actions
- Thumbnail preview for PDFs

### Notifications & Alerts

**Toast Notifications**:
- Fixed top-right position
- Slide-in animation from right
- Auto-dismiss after 5 seconds
- Close button
- Icon based on type (success/error/warning/info)

**Alert Banners** (for threshold violations):
- Full-width banner at top of content area
- Icon on left, message, action button on right
- Dismissible with close icon
- Stackable for multiple alerts

**Empty States**:
- Icon (large, centered)
- Descriptive message
- Call-to-action button
- Illustration or iconography relevant to context

### Authentication Pages

**Login/Register**:
- Centered card layout (max-w-md)
- Logo at top
- Form fields with social login options (if applicable)
- Role selection during registration (Farmer/Inspector)
- "Remember me" checkbox
- Forgot password link

### Loading States

**Full Page Loader**:
- Centered spinner with farm-related iconography
- Animated rotation
- Loading text below ("Loading your farm data...")

**Skeleton Screens**:
- For tables: Row skeletons with pulsing animation
- For cards: Block skeletons matching card structure
- For charts: Simple geometric shapes

## Mobile Responsiveness

**Breakpoints**:
- Mobile: < 768px (stack all elements, bottom navigation)
- Tablet: 768px - 1024px (collapsible sidebar, 2-column grids)
- Desktop: > 1024px (full sidebar, 3-column grids)

**Mobile Optimizations**:
- Tables convert to card view on mobile
- Charts maintain aspect ratio, scroll horizontally if needed
- Forms become full-width single column
- Bottom navigation replaces sidebar
- Larger touch targets (min h-12 for buttons)

## Interaction Patterns

**Minimal Animations**:
- Hover states: Subtle background change, no scale transforms
- Page transitions: None (instant navigation for performance)
- Loading: Simple spinner rotation
- Success actions: Brief success message fade-in
- Avoid: Parallax, scroll-triggered animations, elaborate transitions

**Button Interactions**:
- Primary buttons: Solid fill
- Secondary buttons: Outline style
- Disabled state: Reduced opacity
- Loading state: Spinner inside button

## Images

**Icon Usage**:
- Heroicons throughout (outline style for navigation, solid for emphasis)
- Consistent size: w-5 h-5 for inline, w-6 h-6 for prominent
- Farm/animal type icons in record cards

**No Large Hero Images**: Dashboard is data-focused, no decorative hero section needed

**Illustrations** (Optional enhancements):
- Empty state illustrations (simple, line-art style)
- Error page illustrations
- Onboarding walkthrough illustrations

## Accessibility

- Minimum touch target: 44x44px
- Form labels always visible (no placeholder-only)
- Error messages descriptive and linked to inputs
- Skip navigation link for keyboard users
- Adequate contrast ratios for all text
- Focus indicators clearly visible
- Screen reader labels for icon-only buttons