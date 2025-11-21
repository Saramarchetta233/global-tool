import { NextRequest, NextResponse } from 'next/server';
import { demoAuth, isDemoMode } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode not enabled' },
      { status: 404 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await demoAuth.login(email, password);
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}