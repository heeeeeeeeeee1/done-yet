// src/app/page.tsx
import KakaoLogin from '@/components/LoginButton';
import MainHeader from '@/components/MainHeader';
import UploadButton from '@/components/UploadButton';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* min-h-screen을 주어 콘텐츠가 화면 중앙에 위치하게 함 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
        <MainHeader />
        
        {user ? (
          <div className="w-full space-y-6 text-center">
            <h2 className="text-xl font-bold">오늘의 인증을 완료하세요! 🔥</h2>
            <UploadButton />
          </div>
        ) : (
          <div className="w-full space-y-10 text-center">
            <div className="text-6xl animate-bounce">🤔</div>
            <KakaoLogin />
          </div>
        )}
      </main>

      {user && <Footer />}
    </div>
  );
}