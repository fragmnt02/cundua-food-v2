import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CITY_COOKIE_KEY = 'selectedCity';

export async function GET() {
  try {
    // Get current selected city from cookie
    const cookieStore = await cookies();
    const city = cookieStore.get(CITY_COOKIE_KEY)?.value || null;

    return NextResponse.json({ city });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json({ error: 'Error fetching city' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { city } = await request.json();

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  const response = NextResponse.json({ city });
  response.cookies.set(CITY_COOKIE_KEY, city, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60 // 1 year
  });

  return response;
}
