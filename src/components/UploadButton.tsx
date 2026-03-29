// src/components/common/UploadButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { ChevronDown, ImagePlus, Loader2 } from 'lucide-react';

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
            challenges!inner (id, title, user_id)
          )
        `)
        .eq('user_id', user.id)
        .eq('groups.challenges.user_id', user.id);

      if (error) return;

      const list = data?.flatMap((item: any) => {
        const group = Array.isArray(item.groups) ? item.groups[0] : item.groups;
        if (!group || !group.challenges) return [];
        return group.challenges.map((c: any) => ({
          id: c.id,
          title: c.title,
          groupName: group.name,
          groupId: group.id
        }));
      }) || [];

      setChallenges(list);
    };
    fetchMyChallenges();
  }, [supabase]);

  const handleUpload = async () => {
    if (!file || !selectedChallenge) return toast.error('도전과 사진을 모두 선택해주세요!');
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인 필요');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(`verifications/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('verifications').insert({
        user_id: user.id,
        challenge_id: selectedChallenge,
        image_url: `verifications/${fileName}`,
        proof_date: new Date().toISOString().split('T')[0],
      });
      if (dbError) throw dbError;

      toast.success('오늘의 도전 인증 성공! 🔥');
      setFile(null);
      setSelectedChallenge('');

      const target = challenges.find(c => c.id === selectedChallenge);
      if (target) router.push(`/groups/${target.groupId}`);
      router.refresh();
    } catch (e: any) {
      toast.error('업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-3 px-6 border border-gray-400 rounded-2xl bg-white shadow-xl shadow-black/5">
      <div className="text-center py-2">
        <p className="text-[17px] font-black text-gray-800 mb-3">
          오늘의 도전을 인증하세요! 🔥
        </p>

        <div className="relative">
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="w-full p-3 rounded-2xl bg-gray-50/50 border border-gray-400 font-bold text-[13px] text-gray-800 outline-none appearance-none transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-100 pr-12 cursor-pointer"
          >
            <option value="" className="text-gray-400">어떤 도전에 성공하셨나요?</option>
            {challenges.map(c => (
              <option key={c.id} value={c.id}>
                [{c.groupName}] {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block space-y-3 cursor-pointer group">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              // file:cursor-pointer 를 추가하여 파란 버튼 위에서도 손가락 모양이 나오게 수정
              className="w-full text-[12px] text-gray-500 font-medium cursor-pointer 
                         file:cursor-pointer file:bg-blue-50 file:text-blue-600 
                         file:border file:border-blue-100 file:rounded-2xl 
                         file:px-4 file:py-2 file:mr-3 file:font-bold 
                         hover:file:bg-blue-100 transition-all"
            />
          </div>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full h-12 mb-3 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 disabled:bg-gray-200 disabled:scale-100 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/10"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            전송 중...
          </>
        ) : (
          <>
            <ImagePlus className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
            도전 완료 인증하기
          </>
        )}
      </button>
    </div >
  );
}