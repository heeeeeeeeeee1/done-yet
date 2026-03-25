'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function InviteCodeSection({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="mx-6 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-600">친구 초대하기</span>
        {copied && <span className="text-xs text-blue-600 font-bold">복사 완료!</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200 font-mono text-lg font-bold tracking-wider text-center">
          {inviteCode}
        </div>
        <button
          onClick={handleCopy}
          className={`p-3.5 rounded-xl transition-all shadow-sm ${copied ? 'bg-blue-600 text-white' : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}