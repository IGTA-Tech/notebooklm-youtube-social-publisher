import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

export interface ThumbnailRequest {
  transcript: string;
  title?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  style?: 'professional' | 'casual' | 'bold' | 'minimal';
}

export interface ThumbnailResponse {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}

export async function generateThumbnail(
  request: ThumbnailRequest
): Promise<ThumbnailResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OPENAI_API_KEY is not configured',
    };
  }

  try {
    // Extract key topics from transcript for the thumbnail
    const transcriptSummary = request.transcript.slice(0, 500);

    // Build the prompt
    const styleDescriptions = {
      professional: 'clean, corporate, modern design with professional lighting',
      casual: 'friendly, approachable, warm colors and inviting atmosphere',
      bold: 'high contrast, eye-catching, dynamic composition with bold typography',
      minimal: 'simple, clean lines, lots of white space, elegant and sophisticated',
    };

    const styleDesc = styleDescriptions[request.style || 'professional'];

    let colorGuidance = '';
    if (request.brandColors?.primary) {
      colorGuidance = `Use ${request.brandColors.primary} as the dominant color. `;
      if (request.brandColors.secondary) {
        colorGuidance += `Accent with ${request.brandColors.secondary}. `;
      }
    }

    const prompt = `Create a YouTube thumbnail image for a video about: "${request.title || transcriptSummary}".
Style: ${styleDesc}. ${colorGuidance}
The thumbnail should be visually striking, suitable for a 16:9 aspect ratio, and designed to attract clicks on social media.
Do not include any text in the image - the text will be added separately.
Focus on compelling imagery that conveys the topic visually.`;

    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024', // Landscape format suitable for thumbnails
      quality: 'standard',
    });

    const imageData = response.data?.[0];
    if (!imageData) {
      return {
        success: false,
        error: 'No image data returned from DALL-E',
      };
    }

    return {
      success: true,
      imageUrl: imageData.url,
      revisedPrompt: imageData.revised_prompt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `DALL-E generation failed: ${errorMessage}`,
    };
  }
}

export async function generateThumbnailWithCustomPrompt(
  customPrompt: string
): Promise<ThumbnailResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OPENAI_API_KEY is not configured',
    };
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: customPrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const imageData = response.data?.[0];
    if (!imageData) {
      return {
        success: false,
        error: 'No image data returned from DALL-E',
      };
    }

    return {
      success: true,
      imageUrl: imageData.url,
      revisedPrompt: imageData.revised_prompt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `DALL-E generation failed: ${errorMessage}`,
    };
  }
}
