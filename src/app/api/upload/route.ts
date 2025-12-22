import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'video' | 'audio' | 'transcript'
    const transcript = formData.get('transcript') as string | null;

    // Handle transcript text upload
    if (type === 'transcript' && transcript) {
      const id = uuidv4();
      const filename = `${id}-transcript.txt`;
      const filepath = path.join(UPLOAD_DIR, filename);

      await writeFile(filepath, transcript);

      return NextResponse.json({
        success: true,
        id,
        filename,
        path: `/uploads/${filename}`,
        type: 'transcript',
      });
    }

    // Handle file upload
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const id = uuidv4();
    const ext = path.extname(file.name);
    const filename = `${id}-${type}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      id,
      filename,
      originalName: file.name,
      path: `/uploads/${filename}`,
      type,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload API - POST a file to upload',
    supportedTypes: ['video', 'audio', 'transcript'],
    maxSize: '100MB',
  });
}
