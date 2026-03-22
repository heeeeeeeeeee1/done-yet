'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 반드시 'next/navigation'에서 가져와야 합니다.
import { createClient } from '@/lib/supabase/client';

export default function UploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // 1. 내가 참여 중인 그룹의 모든 도전 목록 불러오기 (그룹명 포함)
  useEffect(() => {
    const fetchMyChallenges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            challenges (id, title)
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('도전 목록 불러오기 실패:', error);
        return;
      }

      const list = data?.flatMap((item: any) => {
        const group = Array.isArray(item.groups) ? item.groups[0] : item.groups;
        if (!group || !group.challenges) return [];
        
        return group.challenges.map((c: any) => ({
          id: c.id,
          title: c.title,
          groupName: group.name || '이름 없음'
        }));
      }) || [];

      setChallenges(list);
    };

    fetchMyChallenges();
  }, [supabase]);

  const handleUpload = async () => {
    if (!file || !selectedChallenge) return alert('사진과 도전을 선택해주세요!');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('로그인이 필요합니다!');

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // 2. Storage에 이미지 업로드
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Verifications 테이블에 기록 저장
      const { error: dbError } = await supabase.from('verifications').insert({
        user_id: user.id,
        challenge_id: selectedChallenge,
        image_url: filePath,
        proof_date: new Date().toISOString().split('T')[0],
      });

      if (dbError) throw dbError;

      alert('오늘의 도전 성공! 🔥');
      
      // 상태 초기화
      setFile(null);
      setSelectedChallenge('');
      
      // 서버 데이터를 새로고침하여 그룹 페이지의 달력과 피드를 업데이트합니다.
      router.refresh(); 

    } catch (error: any) {
      console.error('업로드 실패:', error);
      alert(`업로드 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 border border-gray-100 rounded-[32px] bg-white shadow-sm">
      <div className="space-y-2">
        <select 
          value={selectedChallenge} 
          onChange={(e) => setSelectedChallenge(e.target.value)}
          className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        >
          <option value="">어떤 도전에 성공하셨나요?</option>
          {challenges.map(c => (
            <option key={c.id} value={c.id}>
              [{c.groupName}] {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      <button 
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:bg-gray-300 disabled:shadow-none mt-2"
      >
        {isUploading ? '인증샷 전송 중...' : '도전 완료 인증하기 📸'}
      </button>
    </div>
  );
}