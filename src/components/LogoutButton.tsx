'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      alert('로그아웃 중 오류가 발생했습니다.');
      return;
    }

    // 세션이 완전히 정리되도록 페이지를 새로고침하며 메인으로 이동
    window.location.href = '/'; 
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
    >
      로그아웃
    </button>
  );
}