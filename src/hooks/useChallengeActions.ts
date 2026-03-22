import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export const useChallengeActions = (nickname: string) => {
  const router = useRouter();
  const supabase = createClient();

  // 1. 수정 버튼 클릭 시 수정 페이지로 이동
  const handleUpdateChallenge = (challenge: any, groupId: string) => {
    // challenge 객체와 groupId를 받아 해당 수정 페이지로 이동합니다.
    router.push(`/groups/${groupId}/challenges/${challenge.id}/edit`);
  };

  // 2. 삭제 로직
  const handleDeleteChallenge = async (challengeId: string, groupId: string, title: string) => {
    if (!confirm(`'${title}' 도전을 삭제하시겠습니까?`)) return;

    const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

    if (!error) {
      // 삭제 성공 후 브로드캐스트 알림 전송
      // 브로드캐스트 완료 대기
      await new Promise<void>((resolve) => {
        const channel = supabase.channel(`group-changes-${groupId}`);
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'challenge_event',
              payload: { nickname, action: '삭제', title },
            });
            supabase.removeChannel(channel);
            resolve();
          }
        });
      });

      toast.success('삭제되었습니다.'); // ✅ error → success로 변경
      router.refresh();
    } else {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  return { handleUpdateChallenge, handleDeleteChallenge };
};