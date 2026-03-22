'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast'; // toast 추가

export default function UploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

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
      
      if (error) return;

      const list = data?.flatMap((item: any) => {
        const group = Array.isArray(item.groups) ? item.groups[0] : item.groups;
        if (!group || !group.challenges) return [];
        
        return group.challenges.map((c: any) => ({
          id: c.id,
          title: c.title,
          groupName: group.name || '이름 없음',
          groupId: group.id // 이동을 위해 그룹 ID 저장
        }));
      }) || [];

      setChallenges(list);
    };

    fetchMyChallenges();
  }, [supabase]);

  const handleUpload = async () => {
    if (!file || !selectedChallenge) return toast.error('사진과 도전을 선택해주세요!');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('로그인이 필요합니다!');

    setIsUploading(true);

    try {
      // 현재 선택된 챌린지가 속한 그룹 ID 찾기
      const targetChallenge = challenges.find(c => c.id === selectedChallenge);
      const targetGroupId = targetChallenge?.groupId;

      const fileExt = file.name.split('.').pop();
      // 파일명에 시간 추가하여 중복 방지
      const fileName = `${user.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // 1. Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. DB 저장(하루에 여러번 insert 가능)
      const { error: dbError } = await supabase.from('verifications').insert({
        user_id: user.id,
        challenge_id: selectedChallenge,
        image_url: filePath,
        // ISO 형식이 아닌 로컬 날짜 기준으로 저장하거나 DB 설정을 확인
        proof_date: new Date().toISOString().split('T')[0],
      });

      if (dbError) throw dbError;

      toast.success('오늘의 도전 성공! 🔥');
      
      // 상태 초기화
      setFile(null);
      setSelectedChallenge('');
      
      // 3. 해당 그룹 상세 페이지로 이동 및 새로고침
      if (targetGroupId) {
        router.push(`/groups/${targetGroupId}`);
        router.refresh(); 
      }

    } catch (error: any) {
      toast.error(`업로드 실패: ${error.message}`);
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
          className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold text-sm outline-none"
        >
          <option value="">어떤 도전에 성공하셨나요?</option>
          {challenges.map(c => (
            <option key={c.id} value={c.id}>
              [{c.groupName}] {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 px-1">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 cursor-pointer"
        />
      </div>

      <button 
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all disabled:bg-gray-300 mt-2"
      >
        {isUploading ? '인증샷 전송 중...' : '도전 완료 인증하기 📸'}
      </button>
    </div>
  );
}