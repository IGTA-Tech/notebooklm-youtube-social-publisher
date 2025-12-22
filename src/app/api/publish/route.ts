import { NextRequest, NextResponse } from 'next/server';
import { publishToBlotato, Platform, PLATFORM_CONFIG } from '@/lib/blotato';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platforms, content, mediaUrls, scheduledAt } = body;

    // Validate platforms
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one platform is required' },
        { status: 400 }
      );
    }

    const validPlatforms = Object.keys(PLATFORM_CONFIG);
    const invalidPlatforms = platforms.filter((p: string) => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid platforms: ${invalidPlatforms.join(', ')}. Valid: ${validPlatforms.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check content length for each platform
    const contentTooLong: string[] = [];
    for (const platform of platforms as Platform[]) {
      const config = PLATFORM_CONFIG[platform];
      if (content.length > config.maxChars) {
        contentTooLong.push(`${config.name} (max ${config.maxChars} chars)`);
      }
    }

    if (contentTooLong.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Content exceeds limit for: ${contentTooLong.join(', ')}`,
          currentLength: content.length,
        },
        { status: 400 }
      );
    }

    // Publish to Blotato
    const result = await publishToBlotato({
      platforms: platforms as Platform[],
      content,
      mediaUrls,
      scheduledAt,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      postIds: result.postIds,
      message: `Successfully published to ${platforms.length} platform(s)`,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Publishing failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Social Media Publish API - POST to publish content',
    availablePlatforms: Object.entries(PLATFORM_CONFIG).map(([key, config]) => ({
      id: key,
      name: config.name,
      maxChars: config.maxChars,
      supportsVideo: config.supportsVideo,
      supportsImage: config.supportsImage,
    })),
    example: {
      platforms: ['twitter', 'linkedin'],
      content: 'Post content here...',
      mediaUrls: ['https://example.com/video.mp4'],
      scheduledAt: '2025-01-01T12:00:00Z',
    },
  });
}
