'use client';

import { useRef, useState } from 'react';
// 1. 경로를 server가 아닌 supabase/client로 수정!
import { createClient } from '@/lib/client'; 

const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  // 2. 여기서 리모컨을 직접 생성해줍니다 (화살표 함수 호출)
  const supabase = createClient(); 

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      // 이제 여기서 supabase를 마음껏 쓸 수 있습니다!
      const { data, error } = await supabase.storage
        .from('photos') 
        .upload(filePath, file);

      if (error) throw error;

      alert('크~ 오늘 인증 성공! 사진이 잘 올라갔어요. 🚀');
      console.log('업로드 성공:', data);

    } catch (error: any) {
      alert('에구, 업로드 중에 문제가 생겼어요: ' + error.message);
    } finally {
      setUploading(false);
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
        disabled={uploading}
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