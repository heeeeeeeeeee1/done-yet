import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // 유저님이 만든 server.ts 경로

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/'; // 로그인 후 보낼 목적지 (기본값: 메인)

  if (code) {
    const supabase = await createClient();
    
    // 카카오가 준 '코드'를 실제 '유저 세션'으로 교환합니다.
    // 이 과정에서 server.ts에 정의한 setAll 함수가 쿠키를 구워줍니다.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 발생 시 에러 페이지나 메인으로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}