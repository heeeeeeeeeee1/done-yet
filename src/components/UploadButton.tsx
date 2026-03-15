'use client';

import { useRef } from 'react';

const UploadButton = () => {
  // 숨겨진 파일 입력창을 가리킬 '리모컨'입니다.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // 우리가 만든 예쁜 버튼을 누르면, 숨겨진 진짜 버튼이 대신 눌립니다.
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("선택된 파일:", file.name);
      alert(`"${file.name}" 선택 완료! 이제 이 사진을 서버에 올릴 준비를 할게요.`);
    }
  };

  return (
    <div className="py-10">
      {/* 1. 실제 파일 선택창 (못생겨서 숨겨둠) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment" // 이렇게 하면 폰에서 카메라 켜진다고?
      />

      {/* 2. 유저가 보게 될 예쁜 버튼 */}
      <button 
        onClick={handleButtonClick}
        className="w-full bg-black text-white text-xl font-bold py-5 rounded-2xl transition-transform active:scale-95 shadow-xl"
      >
        📷 인증샷 올리기
      </button>
    </div>
  );
};

export default UploadButton;