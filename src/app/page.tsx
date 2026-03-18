import KakaoLogin from '@/components/LoginButton';
import MainHeader from '@/components/MainHeader';
import UploadButton from '@/components/UploadButton';
import { createClient } from '@/lib/supabase/server'; // 유저님이 만든 server.ts

const Home = async () => {
  const supabase = await createClient();
  
  // 현재 로그인한 유저 세션 정보를 가져옵니다.
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <MainHeader />
        
        {/* 로그인 여부에 따른 조건부 렌더링 */}
        {user ? (
          <div className="space-y-4">
            <p className="font-medium text-lg">
              {user.user_metadata?.full_name || '유저'}님, 반가워요! 👋
            </p>
            <UploadButton /> {/* 로그인 되었을 때만 노출 */}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">인증을 하려면 로그인이 필요해요.</p>
            <KakaoLogin />   {/* 로그인 안 되었을 때만 노출 */}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;