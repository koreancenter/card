import React from 'react';
import { CardData } from '../types/card';
import { 
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Edit3,
  Share2
} from 'lucide-react';

interface ActionButtonsProps {
  data: CardData;
  onOpenEdit?: () => void;
  onOpenShare: () => void;
  isPhotoCard?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  data,
  onOpenEdit,
  onOpenShare,
}) => {
  const phoneTarget = data.phoneRaw || data.phone?.replace(/[^0-9+]/g, '');
  const iconButtonClass = "w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-[#C5A880] hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer";

  return (
    <div 
      className="inline-flex items-center bg-[#16181D]/80 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-xl"
      role="toolbar" 
      aria-label="명함 빠른 작업"
    >
      {/* 1. Phone */}
      {phoneTarget && (
        <a
          href={`tel:${phoneTarget}`}
          className={iconButtonClass}
          title={`전화 걸기 (${data.phone})`}
          aria-label="전화 걸기"
        >
          <Phone className="w-4 h-4" />
        </a>
      )}

      {/* 2. Message / SMS */}
      {phoneTarget && (
        <a
          href={`sms:${phoneTarget}`}
          className={iconButtonClass}
          title={`문자 보내기 (${data.phone})`}
          aria-label="문자 보내기"
        >
          <MessageSquare className="w-4 h-4" />
        </a>
      )}

      {/* 3. Mail */}
      {data.email && (
        <a
          href={`mailto:${data.email}`}
          className={iconButtonClass}
          title={`이메일 작성 (${data.email})`}
          aria-label="이메일 작성"
        >
          <Mail className="w-4 h-4" />
        </a>
      )}

      {/* 4. Globe Website */}
      {data.website && (
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
          title="온라인 웹사이트 보기"
          aria-label="온라인 웹사이트"
        >
          <Globe className="w-4 h-4" />
        </a>
      )}

      {/* 1px Vertical Divider */}
      <span className="border-r border-white/10 h-4 mx-2 self-center" />

      {/* 5. Edit */}
      {onOpenEdit && (
        <button
          onClick={onOpenEdit}
          className={iconButtonClass}
          title="명함 편집"
          aria-label="명함 편집"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}

      {/* 6. Share */}
      <button
        onClick={onOpenShare}
        className={iconButtonClass}
        title="명함 공유 (QR, 링크, 연락처)"
        aria-label="명함 공유"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
};
