import KakaoLogin from '@/components/LoginButton';
import MainHeader from '@/components/MainHeader';
import UploadButton from '@/components/UploadButton';

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <MainHeader />
        <UploadButton />
        <KakaoLogin />
      </div>
    </main>
  );
};

export default Home;