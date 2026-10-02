import React from 'react';
import { CardData, CardOrientation } from '../types/card';
import { 
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Edit3,
  Share2,
  RectangleHorizontal,
  RectangleVertical
} from 'lucide-react';

interface ActionButtonsProps {
  data: CardData;
  onOpenEdit?: () => void;
  onOpenShare: () => void;
  isPhotoCard?: boolean;
  orientation?: CardOrientation;
  onToggleOrientation?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  data,
  onOpenEdit,
  onOpenShare,
  orientation = 'landscape',
  onToggleOrientation,
}) => {
  const phoneTarget = data.phoneRaw || data.phone?.replace(/[^0-9+]/g, '');
  const iconButtonClass = "w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-[#C5A880] hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer";

  return (
    <div 
      className="inline-flex items-center bg-white/[0.02] px-3.5 py-1.5 rounded-full"
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

      {/* 5. Orientation Toggle (명함 가로/세로 보기) */}
      {onToggleOrientation && (
        <button
          onClick={onToggleOrientation}
          className={iconButtonClass}
          title={orientation === 'portrait' ? '명함 가로 보기' : '명함 세로 보기'}
          aria-label={orientation === 'portrait' ? '명함 가로 보기' : '명함 세로 보기'}
        >
          {orientation === 'portrait' ? (
            <RectangleHorizontal className="w-4 h-4" />
          ) : (
            <RectangleVertical className="w-4 h-4" />
          )}
        </button>
      )}

      {/* 6. Edit */}
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

      {/* 7. Share */}
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
