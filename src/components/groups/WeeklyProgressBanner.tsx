'use client';

interface Props {
  verifications: any[];
  currentUserId: string | undefined;
  weeklyTarget: number;
}

export default function WeeklyProgressBanner({ verifications, currentUserId, weeklyTarget }: Props) {
  // 1. 계산 로직
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
  const progress = Math.min(Math.round((currentCount / weeklyTarget) * 100), 100);

  // 상태별 설정
  const isSuccess = neededCount <= 0;
  const isFail = neededCount > remainingDays;
  const isDanger = neededCount === remainingDays;

  // 배경 및 텍스트 컬러 정의
  const statusConfig = isSuccess
    ? { bg: 'bg-green-50 border-green-100', text: 'text-green-700', icon: '🎉', msg: '목표 달성 완료!' }
    : isFail
      ? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: '💀', msg: '달성 실패... 벌칙 확정' }
      : isDanger
        ? { bg: 'bg-red-50 border-red-100 animate-pulse', text: 'text-red-600', icon: '🚨', msg: '오늘부터 매일 해야 성공!' }
        : { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', icon: '💡', msg: `목표까지 ${neededCount}회 남았어요` };

  return (
    <div className={`mx-1 p-4 rounded-2xl border shadow-sm transition-all ${statusConfig.bg}`}>
      {/* ✅ Flex-wrap과 gap 조정을 통해 좁은 화면 대응 */}
      <div className="flex flex-wrap items-center justify-between gap-2">

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl shrink-0">{statusConfig.icon}</span>
          <div className="min-w-0">
            {/* ✅ break-keep과 truncate로 텍스트 깨짐 방지 */}
            <h4 className={`text-sm font-black break-keep ${statusConfig.text}`}>
              {statusConfig.msg}
            </h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
              성공 {currentCount} / {weeklyTarget} (남은 일수: {remainingDays}일)
            </p>
          </div>
        </div>

        {/* ✅ 진행률 표시 부분 (우측 고정) */}
        <div className="shrink-0 text-right bg-white/50 px-2 py-1 rounded-lg border border-black/5">
          <p className={`text-xs font-black ${isDanger ? 'text-red-600' : 'text-blue-600'}`}>
            {progress}%
          </p>
        </div>

      </div>
    </div>
  );
}