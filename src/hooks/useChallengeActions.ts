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

    // 1. DB에서 삭제
    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

    if (!error) {
      // ✅ 2. 삭제 성공 알림 브로드캐스트
      const channel = supabase.channel(`group-changes-${groupId}`);
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'challenge_event',
            payload: {
              nickname,
              action: '삭제',
              title
            },
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

  return { handleUpdateChallenge, handleDeleteChallenge };
};