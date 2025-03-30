'use server';
import { cookies } from 'next/headers';

// For a simple auth system, you can use a fixed password
// In a production app, you'd want to use more secure methods
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

export async function login(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    // In a real app, you'd want to use a JWT or other secure token method
    // This is a simplified example
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    const cookieStore = await cookies();
    cookieStore.set('auth-token', 'authenticated', {
      expires: expiryDate,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get('auth-token');
}
