import { NextRequest, NextResponse } from 'next/server';
import { generateThumbnail, generateThumbnailWithCustomPrompt } from '@/lib/dalle';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, title, brandColors, style, customPrompt } = body;

    // If custom prompt is provided, use it directly
    if (customPrompt) {
      const result = await generateThumbnailWithCustomPrompt(customPrompt);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        revisedPrompt: result.revisedPrompt,
      });
    }

    // Otherwise, generate from transcript
    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript or customPrompt is required' },
        { status: 400 }
      );
    }

    const result = await generateThumbnail({
      transcript,
      title,
      brandColors,
      style,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
    });
  } catch (error) {
    console.error('Thumbnail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Thumbnail generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Thumbnail Generation API - POST transcript to generate',
    example: {
      transcript: 'Video content description...',
      title: 'Optional title',
      brandColors: { primary: '#ff0000', secondary: '#0000ff' },
      style: 'professional | casual | bold | minimal',
    },
  });
}
