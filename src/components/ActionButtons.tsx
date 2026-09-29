import React from 'react';
import { CardData } from '../types/card';
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit3, 
  Share2 
} from 'lucide-react';

interface ActionButtonsProps {
  data: CardData;
  onOpenEdit?: () => void;
  onOpenShare: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  data,
  onOpenEdit,
  onOpenShare,
}) => {
  return (
    <div className="flex items-center justify-center py-1.5 px-3 rounded-full bg-[#121318]/90 border border-white/10 backdrop-blur-xl shadow-xl">
      {/* Group A: Contact Channels (Primary Communication) */}
      <div className="flex items-center gap-1 sm:gap-1.5" role="group" aria-label="연락 수단">
        {/* 1. Phone Call */}
        {data.phone && (
          <a
            href={`tel:${data.phoneRaw || data.phone}`}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title={`전화 통화 (${data.phone})`}
            aria-label="전화 통화"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}

        {/* 2. Message (WhatsApp or SMS) */}
        <a
          href={data.whatsappUrl || `sms:${data.phoneRaw || data.phone}`}
          target={data.whatsappUrl ? '_blank' : undefined}
          rel={data.whatsappUrl ? 'noopener noreferrer' : undefined}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="문자 / 메시지 보내기"
          aria-label="문자 보내기"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </a>

        {/* 3. Email */}
        {data.email && (
          <a
            href={`mailto:${data.email}`}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title={`이메일 작성 (${data.email})`}
            aria-label="이메일 작성"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}

        {/* 4. Website / Digital Location */}
        {data.website && (
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title={`웹사이트 방문 (${data.websiteDisplay || data.website})`}
            aria-label="웹사이트 방문"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Subtle 1px Divider */}
      <span className="border-r border-white/10 mx-2.5 sm:mx-3 h-4 self-center" />

      {/* Group B: Studio Actions (Secondary Refined Buttons) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Edit Button */}
        {onOpenEdit && (
          <button
            onClick={onOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
            title="명함 정보 및 테마 편집"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>편집</span>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-950 bg-[#C5A880] hover:bg-[#d4b78f] transition-all cursor-pointer shadow-sm active:scale-95"
          title="QR 코드, 링크 복사, 연락처 저장, 인쇄"
        >
          <Share2 className="w-3.5 h-3.5 text-neutral-950" />
          <span>공유</span>
        </button>
      </div>
    </div>
  );
};
