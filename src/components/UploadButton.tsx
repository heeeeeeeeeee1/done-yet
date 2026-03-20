'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  // 1. 내가 참여 중인 활성 챌린지 목록 불러오기
  useEffect(() => {
    const fetchMyChallenges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            challenges (id, title)
          )
        `)
        .eq('user_id', user.id);
      
      // 데이터 플래튼(flatten) 작업
      const list = data?.flatMap(item => (item.groups as any).challenges) || [];
      setChallenges(list);
    };
    fetchMyChallenges();
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedChallenge) return alert('사진과 챌린지를 선택해주세요!');
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // 2. Storage에 이미지 업로드
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Verifications 테이블에 기록 저장
      const { error: dbError } = await supabase.from('verifications').insert({
        user_id: user?.id,
        challenge_id: selectedChallenge,
        image_url: filePath,
      });

      if (dbError) throw dbError;
      alert('인증 완료! 🔥');
      window.location.reload(); // 성공 시 새로고침
    } catch (error) {
      console.error(error);
      alert('업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-3xl bg-gray-50">
      <select 
        value={selectedChallenge} 
        onChange={(e) => setSelectedChallenge(e.target.value)}
        className="p-3 rounded-xl border bg-white font-bold text-sm"
      >
        <option value="">어떤 숙제인가요?</option>
        {challenges.map(c => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button 
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
      >
        {isUploading ? '인증 중...' : '지금 바로 인증샷 올리기 📸'}
      </button>
    </div>
  );
}