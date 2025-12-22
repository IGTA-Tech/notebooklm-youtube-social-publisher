# NotebookLM YouTube & Social Media Publisher

A Next.js web application that takes NotebookLM exports (video, audio, transcript) and distributes them to social media platforms via Blotato API, with AI-generated thumbnails via DALL-E.

## Features

- **Content Upload**: Upload video, audio files, and paste transcripts from NotebookLM
- **Brand Context Crawler**: Analyze websites to extract brand colors, logos, and styling
- **AI Thumbnail Generation**: Create eye-catching thumbnails using DALL-E 3
- **Multi-Platform Publishing**: Post to 9 social media platforms via Blotato API:
  - Twitter/X
  - LinkedIn
  - Instagram
  - TikTok
  - Facebook
  - BlueSky
  - Pinterest
  - YouTube
  - Threads

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (for DALL-E thumbnail generation)
- Blotato API key (for social media posting)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IGTA-Tech/notebooklm-youtube-social-publisher.git
cd notebooklm-youtube-social-publisher
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
BLOTATO_API_KEY=your_blotato_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard with step wizard
│   ├── upload/page.tsx       # Upload page
│   ├── brands/page.tsx       # Brand management
│   ├── publish/page.tsx      # Publishing interface
│   └── api/
│       ├── upload/route.ts   # File upload handler
│       ├── crawl/route.ts    # Website crawler
│       ├── thumbnail/route.ts # DALL-E generation
│       └── publish/route.ts  # Blotato posting
├── lib/
│   ├── blotato.ts           # Blotato API client
│   ├── dalle.ts             # DALL-E API client
│   ├── crawler.ts           # Website crawler
│   └── supabase.ts          # Database types
└── components/
    ├── UploadForm.tsx       # Drag-drop file upload
    ├── BrandCrawler.tsx     # Website analyzer
    ├── ThumbnailGenerator.tsx # DALL-E integration
    └── PublishForm.tsx      # Multi-platform publishing
```

## API Endpoints

### POST /api/upload
Upload video, audio, or transcript files.

### POST /api/crawl
Crawl a website to extract brand information.
```json
{ "url": "https://example.com" }
```

### POST /api/thumbnail
Generate a thumbnail using DALL-E.
```json
{
  "transcript": "Video content...",
  "title": "Optional title",
  "style": "professional | casual | bold | minimal"
}
```

### POST /api/publish
Publish content to social media platforms.
```json
{
  "platforms": ["twitter", "linkedin"],
  "content": "Post content",
  "mediaUrls": ["https://..."]
}
```

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **APIs**: OpenAI (DALL-E 3), Blotato
- **Web Scraping**: Cheerio

## License

MIT
