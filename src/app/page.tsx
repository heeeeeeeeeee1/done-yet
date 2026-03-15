import MainHeader from '@/components/MainHeader';
import UploadButton from '@/components/UploadButton';

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <MainHeader />
        <UploadButton />
        
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            현재 <span className="font-bold text-black">12명</span>이 목표를 달성했어요!
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;