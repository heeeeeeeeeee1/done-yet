'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase'; // 아까 만든 설정 파일 가져오기

const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false); // 업로드 중인지 상태 확인

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true); // 로딩 시작!

      // 1. 파일 이름 중복 방지를 위해 유니크한 이름 만들기 (예: 1712345678-photo.jpg)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      // 2. Supabase Storage에 업로드 ('photos'는 유저님이 만든 버킷 이름)
      const { data, error } = await supabase.storage
        .from('photos') 
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      alert('크~ 오늘 인증 성공! 사진이 잘 올라갔어요. 🚀');
      console.log('업로드 성공:', data);

    } catch (error: any) {
      alert('에구, 업로드 중에 문제가 생겼어요: ' + error.message);
    } finally {
      setUploading(false); // 로딩 끝!
    }
  };

  return (
    <div className="py-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={uploading} // 업로드 중에는 클릭 못하게!
      />

      <button 
        onClick={handleButtonClick}
        disabled={uploading}
        className={`w-full text-white text-xl font-bold py-5 rounded-2xl transition-transform active:scale-95 shadow-xl ${
          uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'
        }`}
      >
        {uploading ? '⏳ 업로드 중...' : '📷 인증샷 올리기'}
      </button>
    </div>
  );
};

export default UploadButton;