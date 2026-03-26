'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

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

      // 내 그룹과 그 그룹에 속한 챌린지들을 한 번에 가져옴
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
        // 데이터 구조가 배열로 올 경우를 대비한 처리
        const group = Array.isArray(item.groups) ? item.groups[0] : item.groups;
        if (!group || !group.challenges) return [];

        return group.challenges.map((c: any) => ({
          id: c.id,
          title: c.title,
          groupName: group.name || '이름 없음',
          groupId: group.id
        }));
      }) || [];

      setChallenges(list);
    };

    fetchMyChallenges();
  }, [supabase]);

  const handleUpload = async () => {
    // 1. 유효성 검사
    if (!file) return toast.error('인증할 사진을 선택해주세요!');
    if (!selectedChallenge) return toast.error('어떤 도전에 성공했는지 선택해주세요!');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error('로그인이 필요합니다!');

    setIsUploading(true);

    try {
      // 이동할 타겟 그룹 ID 찾기
      const targetChallenge = challenges.find(c => c.id === selectedChallenge);
      const targetGroupId = targetChallenge?.groupId;

      // 파일명 최적화 (중복 방지 및 경로 설정)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // 2. Supabase Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. DB 저장 (오늘 날짜 기준으로 저장)
      const { error: dbError } = await supabase.from('verifications').insert({
        user_id: user.id,
        challenge_id: selectedChallenge,
        image_url: filePath,
        proof_date: new Date().toISOString().split('T')[0],
      });

      if (dbError) throw dbError;

      // 성공 피드백
      toast.success('오늘의 도전 성공! 🔥', {
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });

      // 상태 초기화
      setFile(null);
      setSelectedChallenge('');

      // 4. 해당 그룹 상세 페이지로 즉시 이동 및 데이터 갱신
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
    <div className="flex flex-col gap-4 p-5 border border-gray-100 rounded-[24px] bg-white shadow-sm mx-1">
      <div className="space-y-2">
        <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-wider">Step 1. 도전 선택</label>
        <select
          value={selectedChallenge}
          onChange={(e) => setSelectedChallenge(e.target.value)}
          // 모바일에서 글자가 잘리지 않도록 padding과 text-size 조정
          className="w-full p-4 rounded-xl border-none bg-gray-50 font-bold text-[13px] text-gray-800 outline-none appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
        <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-wider">Step 2. 사진 인증</label>
        <div className="relative cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-[11px] text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-blue-600 file:text-white cursor-pointer hover:file:bg-blue-700 transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        // 갤럭시 S23 등 하단바가 있는 폰에서도 누르기 편하도록 높이 및 둥글기 조정
        className="w-full py-4.5 bg-gray-900 text-white rounded-xl font-black text-sm shadow-xl active:scale-[0.97] transition-all disabled:bg-gray-200 mt-2 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            전송 중...
          </>
        ) : (
          '도전 완료 인증하기 📸'
        )}
      </button>
    </div>
  );
}