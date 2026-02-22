Build a Windows 11 OS-style portfolio website (desktop experience) similar to https://praveenyadav-portfolio.netlify.app/ using Next.js (App Router) + Tailwind + Zustand. Implement a desktop wallpaper, desktop icons, taskbar, and app windows (About, Projects, Resume, Contact). The website should be production-ready, responsive (mobile adapts to full-screen windows), accessible, and easy to update via data files.

============================================================
1) OUTPUT EXPECTATION / DEFINITION OF DONE
============================================================
A) Desktop OS experience
- Full-screen desktop with wallpaper.
- Desktop icons arranged in a column/grid.
- Double-click an icon to open an “app” window.
- Windows support: open, close, minimize, restore, focus (z-index), drag (title bar).
- Taskbar shows open windows; clicking an item focuses/restores it.
- Clock shown on taskbar (local time).

B) Apps
- About app: short bio, role, highlights, skills, links.
- Projects app: project list (data-driven), filters/tags, project detail view (modal/within same window).
- Resume app: resume PDF embedded (or view/download buttons).
- Contact app: contact form (client-side) + social links.

C) Responsiveness + a11y
- On mobile (<768px): windows are full-screen sheets; disable dragging; taskbar becomes bottom nav.
- Keyboard: Esc closes active window; Enter activates focused icon; Tab navigation works.
- ARIA labels for controls; focus states visible.

D) Maintainability
- All content in /data (profile, projects, socials). No hard-coded content inside components.
- Simple config list of apps to render icons/windows.

============================================================
2) TECH STACK / LIBS
============================================================
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- classnames or clsx (optional)
- react-hook-form (optional) for contact form
- (Optional later) framer-motion for animations

============================================================
3) REPO SETUP STEPS
============================================================
1. Create app:
   - npx create-next-app@latest portfolio-os --ts --tailwind --eslint --app
2. Install deps:
   - npm i zustand clsx
   - (optional) npm i react-hook-form
3. Create folder structure:
   app/
     layout.tsx
     page.tsx
     globals.css
   components/
     desktop/
       Desktop.tsx
       DesktopIcon.tsx
       Taskbar.tsx
       Clock.tsx
       StartButton.tsx (optional)
       StartMenu.tsx (optional v1.1)
     window/
       Window.tsx
       WindowControls.tsx
       WindowFrame.tsx (optional)
     apps/
       AboutApp.tsx
       ProjectsApp.tsx
       ResumeApp.tsx
       ContactApp.tsx
     common/
       Button.tsx
       Badge.tsx
       Input.tsx
   store/
     windows.ts
   data/
     profile.ts
     projects.ts
     socials.ts
   public/
     wallpaper.jpg
     icons/*.svg
     resume.pdf

============================================================
4) VISUAL DESIGN GUIDELINES (WINDOWS 11 FEEL)
============================================================
- Rounded corners: 16–24px for windows/taskbar.
- Acrylic blur: background blur with semi-transparent dark layer.
- Subtle border: white at 10–15% opacity.
- Shadows: large soft shadow for windows.
- Titlebar height: ~44px.
- Taskbar: centered, pill shape, slightly translucent.
- Desktop icons: 80px width, center aligned label, hover highlight.

============================================================
5) DATA MODELS (CONTENT)
============================================================
A) /data/profile.ts
- name, title, shortSummary
- highlights[] (3–6 bullets)
- skills: { category: string; items: string[] }[]
- location, email
- links: { label, href }[]

B) /data/projects.ts
type Project = {
  id: string;
  title: string;
  description: string;
  role?: string;
  stack: string[];
  tags: string[];
  links: { label: string; href: string }[];
  highlights: string[];
  year?: string;
  cover?: string; // optional image path
};

Export:
- projects: Project[]
- projectTags: derived tag list (or derive in component)

C) /data/socials.ts
- socials: { label, href, icon?: string }[]

============================================================
6) WINDOW MANAGER (ZUSTAND) — REQUIRED BEHAVIOR
============================================================
Create store/windows.ts with:
- windows: WindowInstance[]
- activeWindowId: string | null
- zCounter: number

WindowInstance:
{
  windowId: string;
  appId: AppId;
  title: string;
  x: number; y: number;
  w: number; h: number;
  z: number;
  minimized: boolean;
  maximized?: boolean; (optional v1.1)
}

Actions:
- openWindow({appId,title,defaultSize})
- closeWindow(windowId)
- minimizeWindow(windowId)
- restoreWindow(windowId)
- focusWindow(windowId) -> increase z
- moveWindow(windowId, x, y)
- resizeWindow(windowId, w, h) (optional v1.1)
- closeActiveWindow() (for Esc)

Placement:
- On open: stagger position with slight random offset.
- Clamp to viewport bounds (basic clamp OK).

============================================================
7) DESKTOP LAYER IMPLEMENTATION
============================================================
A) app/page.tsx renders <Desktop />

B) Desktop.tsx responsibilities:
- Render wallpaper background.
- Render desktop icons (from APPS config).
- Render windows based on store.windows sorted by z.
- Render Taskbar.

C) APPS config (single source):
const APPS = [
  { appId:"about", title:"About", icon:"/icons/about.svg", defaultSize:{w:520,h:420} },
  { appId:"projects", title:"Projects", icon:"/icons/projects.svg", defaultSize:{w:860,h:560} },
  { appId:"resume", title:"Resume", icon:"/icons/resume.svg", defaultSize:{w:760,h:600} },
  { appId:"contact", title:"Contact", icon:"/icons/contact.svg", defaultSize:{w:520,h:520} },
];

D) DesktopIcon behavior:
- Double-click opens the app window.
- Show tooltip “Double click to open”.
- Keyboard: if focused and Enter pressed -> open.

============================================================
8) WINDOW COMPONENT IMPLEMENTATION
============================================================
Window.tsx responsibilities:
- If minimized, do not render (or render hidden).
- Absolute positioned container with zIndex.
- On mouse down: focusWindow(windowId).
- Titlebar:
  - Shows title
  - WindowControls (minimize/close)
  - Drag to move:
    - Use Pointer Events with setPointerCapture.
    - Track start position and update store.moveWindow.
- Content area:
  - Render app content via AppRenderer switch.

Mobile behavior:
- Detect via CSS breakpoint (Tailwind) or useEffect + matchMedia.
- If mobile: render windows as fixed inset-0, no dragging, no x/y.

Optional v1.1:
- Maximize button (toggle full screen).

============================================================
9) TASKBAR IMPLEMENTATION
============================================================
Taskbar.tsx:
- Pill bar bottom center.
- Shows a Start button placeholder (optional).
- Shows open windows list:
  - Each item indicates active window.
  - Clicking item focuses/restores.
- Right side: Clock component.
- Mobile:
  - Replace with bottom nav icons (About/Projects/Resume/Contact) that open windows.

Clock.tsx:
- Client component
- Updates every 30 seconds
- Displays local time (e.g., 10:32 PM).

============================================================
10) APP CONTENT IMPLEMENTATION DETAILS
============================================================
A) AboutApp.tsx
- Pulls from data/profile.ts
- Sections:
  - Header: name, title, location
  - Summary paragraph
  - Highlights bullets
  - Skills grouped by category
  - Links row (GitHub, LinkedIn, Email)

B) ProjectsApp.tsx
- Pulls from data/projects.ts
- UI:
  - Header row: “Projects” + search input (optional)
  - Filter chips from unique tags
  - Project cards list (scrollable within window)
  - Card includes: title, description, stack badges, links
  - Clicking a project opens a “Project Details” view inside same window (no new window)
- Details view:
  - Title, description, role, highlights
  - Links (Live, GitHub, Case study)
  - Back button

C) ResumeApp.tsx
- Show buttons: View PDF / Download PDF
- Embed PDF in iframe (desktop only)
- On mobile: show “Download resume” + optional Google Drive link

D) ContactApp.tsx
- Contact form: name, email, message
- Validation
- Submit: either
  - Use Formspree endpoint (recommended) OR
  - Use mailto fallback (if no backend)
- Show socials below.

NOTE: For v1, use Formspree (client-side) to avoid building backend.

============================================================
11) ACCESSIBILITY / UX REQUIREMENTS
============================================================
- All buttons have aria-label.
- Focus ring visible (Tailwind ring).
- Esc closes active window (closeActiveWindow action).
- WindowControls are keyboard accessible.
- Desktop icons can be tabbed into and opened with Enter.
- Reduce motion: if prefers-reduced-motion, avoid animations (future).

============================================================
12) PERFORMANCE + QUALITY
============================================================
- Use next/image for icons (or inline svg).
- Lazy load heavy apps (Resume PDF) via dynamic import if needed.
- Ensure no hydration errors: mark interactive components as "use client".
- Use stable keys, avoid random in render (only in openWindow).

============================================================
13) DEPLOYMENT
============================================================
- Ensure production build passes: npm run build
- Deploy on Vercel:
  - Add custom domain later.
- Add SEO basics:
  - app/layout.tsx metadata (title, description, open graph).

============================================================
14) IMPLEMENTATION ORDER (SPRINTS)
============================================================
Sprint 1 (OS skeleton):
- Setup project, folder structure, wallpaper, icons
- Zustand window store
- Desktop + icons open windows
- Window component with close/minimize/focus + drag
- Taskbar restore + clock

Sprint 2 (Apps content):
- Data files
- About app complete
- Projects list + detail view
- Resume PDF view/download
- Contact form + socials

Sprint 3 (Responsive + a11y):
- Mobile full-screen windows
- Keyboard shortcuts (Esc close, Enter open)
- Focus states + aria labels

Sprint 4 (Polish):
- Windows 11 acrylic styling refinements
- Subtle animations (optional)
- Start menu optional
- QA + deploy

============================================================
15) WHAT TO PRODUCE NOW
============================================================
Start coding Sprint 1 immediately:
- Create Next.js app
- Implement /store/windows.ts
- Implement Desktop.tsx, DesktopIcon.tsx
- Implement Window.tsx, WindowControls.tsx
- Implement Taskbar.tsx, Clock.tsx
- Confirm open/close/minimize/restore/focus/drag all working.

Then proceed to Sprint 2 apps and data.

End.