// src/app/page.tsx
import KakaoLogin from '@/components/LoginButton';
import MainHeader from '@/components/Main';
import UploadButton from '@/components/UploadButton';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
        <MainHeader />
        
        {user ? (
          <div className="w-full space-y-6 text-center">
            <h2 className="text-xl font-bold">오늘의 인증을 완료하세요! 🔥</h2>
            <UploadButton />
            
            {/* 그룹 참여 버튼 추가 */}
            <div className="pt-4">
              <Link 
                href="/groups/join" 
                className="text-blue-600 font-semibold underline underline-offset-4"
              >
                초대 코드로 그룹 참여하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-10 text-center">
            <div className="text-6xl animate-bounce">🤔</div>
            <KakaoLogin />
          </div>
        )}
      </main>
    </div>
  );
}