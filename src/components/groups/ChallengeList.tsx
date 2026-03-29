// ChallengeList.tsx
export default function ChallengeList({
  challenges,
  isOwner,
  currentUserId,
  onUpdate,
  onDelete,
  onNudge,
  groupId
}: any) {
  return (
    <div className="space-y-3">
      {challenges.map((c: any) => {
        // 달성률 계산 (0~100)
        const progressPercent = Math.min(Math.round((c.current_count / c.weekly_target) * 100), 100);

        return (
          <div key={c.id} className="p-5 bg-white rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                  {c.user_nickname || '멤버'}
                </span>
                <h4 className="font-bold text-gray-800 truncate">{c.title}</h4>
              </div>

              {/* ✅ 달성 횟수 및 프로그레스 바 추가 */}
              <div className="mt-2 mb-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] font-bold text-gray-400">이번 주 달성</span>
                  <span className="text-xs font-black text-blue-600">
                    {c.current_count} <span className="text-gray-300 font-normal">/ {c.weekly_target}회</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold">
                {(isOwner || c.user_id === currentUserId) && (
                  <div className="flex gap-2">
                    <button onClick={() => onUpdate(c, groupId)} className="text-gray-400 underline">수정</button>
                    <button onClick={() => onDelete(c.id, groupId, c.title)} className="text-red-300 underline">삭제</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {c.user_id !== currentUserId && (
                <button
                  onClick={() => onNudge(c.user_id, c.user_nickname || '멤버', groupId)}
                  className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm text-lg hover:scale-110 active:scale-95 transition-all"
                  title="재촉하기"
                >
                  👀
                </button>
              )}
              <div className="w-10 h-10 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-100 shadow-sm relative overflow-hidden">
                {/* 목표 달성 시 불꽃 활성화 */}
                <span className={`text-lg ${c.current_count >= c.weekly_target ? 'grayscale-0' : 'grayscale opacity-30'}`}>🔥</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}