// src/components/groups/WeeklyProgressBanner.tsx
'use client';

interface Props {
  verifications: any[];
  currentUserId: string | undefined;
  challenges: any[]; // ✅ weeklyTarget 대신 challenges를 받도록 수정
}

export default function WeeklyProgressBanner({ verifications, currentUserId, challenges }: Props) {
  // 1. 로그인한 사용자의 도전들만 필터링
  const myChallenges = challenges.filter(c => c.user_id === currentUserId);

  if (myChallenges.length === 0) return null;

  const now = new Date();
  const day = now.getDay();
  const krDay = day === 0 ? 7 : day; // 월(1)~일(7)
  const remainingDays = 7 - krDay + 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - (krDay - 1));
  monday.setHours(0, 0, 0, 0);

  // 2. 모든 도전의 목표치와 현재 달성치를 합산
  let totalTarget = 0;
  let totalAchieved = 0;
  let hasDanger = false;

  myChallenges.forEach(challenge => {
    const count = verifications.filter(v =>
      v.user_id === currentUserId &&
      v.challenge_id === challenge.id &&
      new Date(v.created_at || v.proof_date) >= monday
    ).length;

    totalTarget += challenge.weekly_target;
    totalAchieved += Math.min(count, challenge.weekly_target); // 목표 초과 달성은 합계에서 제외

    // 남은 일수와 남은 횟수가 같으면 위험 상태 (오늘부터 쉬면 안됨)
    if (challenge.weekly_target - count === remainingDays && count < challenge.weekly_target) {
      hasDanger = true;
    }
  });

  const progress = totalTarget > 0 ? Math.min(Math.round((totalAchieved / totalTarget) * 100), 100) : 0;
  const isSuccess = totalAchieved >= totalTarget;

  // 하나라도 달성이 불가능해진 도전이 있는지 확인
  const isFail = myChallenges.some(c => {
    const count = verifications.filter(v =>
      v.user_id === currentUserId &&
      v.challenge_id === c.id &&
      new Date(v.created_at || v.proof_date) >= monday
    ).length;
    return (c.weekly_target - count) > remainingDays;
  });

  const statusConfig = isSuccess
    ? { bg: 'bg-green-50 border-green-100', text: 'text-green-700', icon: '🎉', msg: '이번 주 모든 목표 달성!' }
    : isFail
      ? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: '💀', msg: '미달성 도전 발생... 벌칙 확정' }
      : hasDanger
        ? { bg: 'bg-red-50 border-red-100 animate-pulse', text: 'text-red-600', icon: '🚨', msg: '위험! 오늘부터 쉬면 안 돼요' }
        : { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', icon: '💡', msg: `전체 목표의 ${progress}%를 완료했어요` };

  return (
    <div className={`mx-1 p-4 rounded-2xl border shadow-sm transition-all ${statusConfig.bg}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl shrink-0">{statusConfig.icon}</span>
          <div className="min-w-0">
            <h4 className={`text-sm font-black break-keep ${statusConfig.text}`}>
              {statusConfig.msg}
            </h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
              내 도전 {myChallenges.length}개 요약: {totalAchieved} / {totalTarget}회 완료
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right bg-white/50 px-2 py-1 rounded-lg border border-black/5">
          <p className={`text-xs font-black ${hasDanger ? 'text-red-600' : 'text-blue-600'}`}>
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}