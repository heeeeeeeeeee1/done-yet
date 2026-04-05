// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { triggerStrongVibration } from '@/lib/native-bridge'; // ✅ 진동 유틸 추가

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  // ... (기타 함수 유지)

  // ✅ 재촉하기(Nudge) 기능 수정
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
    // 1. 네이티브 앱에 진동 신호 전송 (본인 폰 피드백)
    triggerStrongVibration();

    const channel = supabase.channel(`group-changes-${groupId}`);

    // 1. 실시간 브로드캐스트 전송
    await channel.send({
      type: 'broadcast',
      event: 'nudge_event',
      payload: {
        senderNickname: nickname,
        targetUserId
      },
    });

    // 2. DB 알림 저장 (미접속 시 확인용)
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      group_id: groupId,
      type: 'nudge',
      message: `${nickname}님이 당신을 지켜보고 있습니다... 👀`,
    });

    toast.success(`${targetNickname}님에게 눈치를 줬습니다! 👀`, { icon: '👀' });
  };

  return { handleUpdateChallenge, handleDeleteChallenge, handleNudge };
};