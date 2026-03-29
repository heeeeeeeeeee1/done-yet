// src/hooks/useChallengeActions.ts
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateChallenge = (challenge: any, groupId: string) => {
    router.push(`/groups/${groupId}/challenges/${challenge.id}/edit`);
  };

  const handleDeleteChallenge = async (challengeId: string, groupId: string, title: string) => {
    if (!confirm(`'${title}' 도전을 삭제하시겠습니까?`)) return;

    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

    if (!error) {
      const channel = supabase.channel(`group-changes-${groupId}`);
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'challenge_event',
            payload: { nickname, action: '삭제', title },
          });
          supabase.removeChannel(channel);
        }
      });
      toast.success('삭제되었습니다.');
      router.refresh();
    } else {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 재촉하기(Nudge) 기능 추가
  const handleNudge = async (targetUserId: string, targetNickname: string, groupId: string) => {
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