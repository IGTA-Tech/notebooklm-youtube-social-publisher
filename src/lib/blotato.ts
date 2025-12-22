const BLOTATO_API_URL = 'https://backend.blotato.com/v2/posts';

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'pinterest'
  | 'tiktok'
  | 'threads'
  | 'bluesky'
  | 'youtube';

export interface BlotataPostRequest {
  platforms: Platform[];
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

export interface BlotataPostResponse {
  success: boolean;
  postIds?: Record<Platform, string>;
  error?: string;
}

export async function publishToBlotato(
  request: BlotataPostRequest
): Promise<BlotataPostResponse> {
  const apiKey = process.env.BLOTATO_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'BLOTATO_API_KEY is not configured'
    };
  }

  try {
    const response = await fetch(BLOTATO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platforms: request.platforms,
        content: request.content,
        mediaUrls: request.mediaUrls || [],
        ...(request.scheduledAt && { scheduledAt: request.scheduledAt }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Blotato API error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      postIds: data.postIds
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export const PLATFORM_CONFIG: Record<Platform, {
  name: string;
  maxChars: number;
  supportsVideo: boolean;
  supportsImage: boolean;
}> = {
  twitter: { name: 'Twitter/X', maxChars: 280, supportsVideo: true, supportsImage: true },
  linkedin: { name: 'LinkedIn', maxChars: 3000, supportsVideo: true, supportsImage: true },
  facebook: { name: 'Facebook', maxChars: 63206, supportsVideo: true, supportsImage: true },
  instagram: { name: 'Instagram', maxChars: 2200, supportsVideo: true, supportsImage: true },
  pinterest: { name: 'Pinterest', maxChars: 500, supportsVideo: true, supportsImage: true },
  tiktok: { name: 'TikTok', maxChars: 2200, supportsVideo: true, supportsImage: false },
  threads: { name: 'Threads', maxChars: 500, supportsVideo: true, supportsImage: true },
  bluesky: { name: 'BlueSky', maxChars: 300, supportsVideo: false, supportsImage: true },
  youtube: { name: 'YouTube', maxChars: 5000, supportsVideo: true, supportsImage: true },
};
