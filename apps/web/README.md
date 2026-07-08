# OpenIngest — Landing Page

The marketing website for [OpenIngest](https://github.com/ManishKudtarkar/OpenIngest), built with Next.js 16.

## Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** — icons
- **Fontsource** — Inter, Space Grotesk, JetBrains Mono

## Development

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Deploy

Deployed on Vercel. Config in `vercel.json`.

Every push to `main` triggers an automatic deployment.

## Structure

```
apps/web/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx             # Animated terminal, headline, stats
│   │   ├── TrustedBy.tsx        # Tech stack strip
│   │   ├── ProblemSolution.tsx  # Before/after comparison
│   │   ├── Features.tsx         # 12 feature cards
│   │   ├── Architecture.tsx     # Clickable pipeline diagram
│   │   ├── CodeExample.tsx      # Real datasets.yaml with syntax highlight
│   │   ├── CLISection.tsx       # Interactive terminal with real output
│   │   ├── AirflowSection.tsx   # Expandable DAG view
│   │   ├── LoadStrategies.tsx   # replace/append/incremental cards
│   │   ├── ConnectorsSection.tsx # v2.0 connector picker
│   │   ├── Stats.tsx            # Animated metrics (174,777 rows, 4.21s…)
│   │   ├── GettingStarted.tsx   # 5-step install walkthrough
│   │   ├── Roadmap.tsx          # v1.0/v2.0/v2.5/v3.0 collapsible cards
│   │   ├── Docs.tsx             # Documentation link cards
│   │   ├── CTA.tsx              # Install command + GitHub CTAs
│   │   └── Footer.tsx
│   ├── globals.css              # Design system — tokens, utilities, section-container
│   ├── layout.tsx
│   └── page.tsx
└── public/
    └── openingest.png           # Logo
```

## Design system

All section containers use the `.section-container` CSS class defined in `globals.css`. This ensures consistent horizontal padding and max-width across every section:

```css
.section-container {
  position: relative;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 1.25rem;          /* mobile */
}
/* sm: 1.5rem | lg: 3rem */
```

**Never** use `max-w-[1380px] mx-auto px-*` directly in components. Use `.section-container` instead.

## Real data policy

Every number on the page comes from actual pipeline runs:
- `174,777` rows — real run output
- `4.21s` — real pipeline duration
- `OI-20260703-3BB09C` — real run ID
- `99.4%` — real average quality score

No fake data.
