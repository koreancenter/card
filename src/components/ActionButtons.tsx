import React from 'react';
import { CardData } from '../types/card';
import { 
  Share2,
  Edit3,
  Globe,
  Mail,
  MessageSquare,
  Phone
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
  // Uniform minimal button style with original translucent hover effect
  const buttonClass = "w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer";

  return (
    <div 
      className="inline-flex items-center gap-1 sm:gap-1.5"
      role="toolbar" 
      aria-label="명함 빠른 작업"
    >
      {/* 1. 공유 (Share) - Uniform icon-only button with original hover effect */}
      <button
        onClick={onOpenShare}
        className={buttonClass}
        title="명함 공유 (QR, 링크, 연락처)"
        aria-label="명함 공유"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      {/* 2. 편집 (Edit) */}
      {onOpenEdit && (
        <button
          onClick={onOpenEdit}
          className={buttonClass}
          title="명함 편집"
          aria-label="명함 편집"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Subtle Hairline Divider */}
      <span className="w-px h-3.5 bg-white/10 mx-0.5 self-center" />

      {/* 3. 온라인 명함 보기 (Website) */}
      {data.website && (
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          title="온라인 명함 보기"
          aria-label="온라인 명함 보기"
        >
          <Globe className="w-3.5 h-3.5" />
        </a>
      )}

      {/* 4. 이메일 (Email) */}
      {data.email && (
        <a
          href={`mailto:${data.email}`}
          className={buttonClass}
          title={`이메일 작성 (${data.email})`}
          aria-label="이메일 작성"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
      )}

      {/* 5. 문자 (Message / WhatsApp) */}
      <a
        href={data.whatsappUrl || `sms:${data.phoneRaw || data.phone}`}
        target={data.whatsappUrl ? '_blank' : undefined}
        rel={data.whatsappUrl ? 'noopener noreferrer' : undefined}
        className={buttonClass}
        title="문자 / 메시지 보내기"
        aria-label="문자 보내기"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </a>

      {/* 6. 전화 (Phone) */}
      {data.phone && (
        <a
          href={`tel:${data.phoneRaw || data.phone}`}
          className={buttonClass}
          title={`전화 통화 (${data.phone})`}
          aria-label="전화 통화"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
