'use client';

interface Props {
  verifications: any[];
  currentUserId: string | undefined;
  weeklyTarget: number;
}

export default function WeeklyProgressBanner({ verifications, currentUserId, weeklyTarget }: Props) {
  // 1. 계산 로직 분리
  const now = new Date();
  const day = now.getDay();
  const krDay = day === 0 ? 7 : day;
  const remainingDays = 7 - krDay + 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - (krDay - 1));
  monday.setHours(0, 0, 0, 0);

  // 이번 주 내 인증샷 필터링 (중복 날짜 제거)
  const myCurrentWeekVerifications = verifications.filter(v =>
    v.user_id === currentUserId &&
    new Date(v.proof_date) >= monday
  );
  const currentCount = new Set(myCurrentWeekVerifications.map(v => v.proof_date)).size;
  const neededCount = weeklyTarget - currentCount;

  // 2. 상태별 UI 정의
  const isSuccess = neededCount <= 0;
  const isFail = neededCount > remainingDays;
  const isDanger = neededCount === remainingDays;

  return (
    <div className={`mx-1 p-5 rounded-3xl border shadow-sm transition-all ${isSuccess ? 'bg-green-50 border-green-100' :
      isFail ? 'bg-gray-50 border-gray-200' :
        isDanger ? 'bg-red-50 border-red-100 animate-pulse' :
          'bg-blue-50 border-blue-100'
      }`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {isSuccess ? '🎉' : isFail ? '💀' : isDanger ? '🚨' : '💡'}
        </span>
        <div>
          <p className={`text-lg font-black ${isDanger ? 'text-red-600' : 'text-gray-800'}`}>
            {isSuccess ? '이번 주 목표 달성 완료!' :
              isFail ? '목표 달성 실패... 벌칙 확정!' :
                isDanger ? `오늘부터 일요일까지 매일 해야 성공해요!` :
                  `이번 주 목표까지 ${neededCount}회 남았어요!`}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            이번 주 성공: {currentCount} / {weeklyTarget} (남은 일수: {remainingDays}일)
          </p>
        </div>
      </div>
    </div>
  );
}