import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite } from '@/lib/crawler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await crawlWebsite(url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: result.brand,
    });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Crawl failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Brand Crawler API - POST a URL to crawl',
    example: { url: 'https://example.com' },
  });
}
