import { NextRequest, NextResponse } from 'next/server';

export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
  const validApiKey = process.env.SECRET_PRIVATE_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized: Invalid or missing API key',
      },
      { status: 401 }
    );
  }

  return null;
}
