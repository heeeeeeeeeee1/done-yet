// src/components/LoginButton.tsx (또는 필요한 곳)
'use client';

import { createClient } from '@/lib/supabase/client';

export default function KakaoLogin() {
  const handleLogin = async () => {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 로그인이 끝나고 우리 앱으로 돌아올 최종 목적지
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error('로그인 실패:', error.message);
  };

  return (
    <button onClick={handleLogin} className="p-3 bg-yellow-400 rounded-lg">
      카카오로 1초 만에 시작하기
    </button>
  );
}