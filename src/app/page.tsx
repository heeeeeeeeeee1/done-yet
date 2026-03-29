// src/app/page.tsx
import KakaoLogin from '@/components/LoginButton';
import MainHeader from '@/components/Main';
import UploadButton from '@/components/UploadButton'; // 경로 확인 필요
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">

        {user ? (
          <div className="w-full space-y-8 flex flex-col items-center">
            {/* 문구가 포함된 헤더 */}
            <MainHeader />

            <div className="w-full">
              <UploadButton />
            </div>

            <div className="pt-4">
              <Link
                href="/groups/join"
                className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-800 transition-colors"
              >
                초대 코드로 그룹 참여하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-10 text-center">
            <div className="space-y-2 mb-12">
              <h1 className="text-5xl font-black tracking-tighter text-black">오늘 했어?</h1>
              <p className="text-lg text-gray-500 font-medium">거짓말 금지, 지금 바로 인증샷.</p>
            </div>
            <div className="text-7xl animate-bounce mb-8">🤔</div>
            <KakaoLogin />
          </div>
        )}
      </main>
    </div>
  );
}