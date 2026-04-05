// src/app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileContent from '@/components/profile/ProfileContent';
import { LogoutButton } from '@/components/LogoutButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-center">로그인이 필요합니다.</div>;

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-gray-50 max-w-md mx-auto">
      {/* 헤더 섹션 - 즉시 렌더링 */}
      <header className="flex justify-between items-end p-6 pt-10">
        <div>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">My Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
        </div>
        <LogoutButton />
      </header>

      {/* 무거운 데이터 섹션 - Suspense 스트리밍 */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent userId={user.id} />
      </Suspense>
    </div>
  );
}