// src/components/common/ProfileSkeleton.tsx
export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse px-6 pt-4">
      {/* 헤더 섹션 스켈레톤 */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
      </div>

      {/* 1. 캘린더 스켈레톤 */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-72 bg-gray-200 rounded-3xl border border-gray-100 shadow-sm" />
      </section>

      {/* 2. 참여 중인 그룹 스켈레톤 */}
      <section className="space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded px-1" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* 3. 내 도전 목록 스켈레톤 */}
      <section className="space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded px-1" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}