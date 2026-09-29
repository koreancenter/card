import React from 'react';
import { CardData } from '../types/card';
import { downloadVCard } from '../utils/vcard';
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  UserPlus, 
  Printer, 
  QrCode, 
  Share2, 
  MapPin,
  Navigation,
  Edit3,
  Download
} from 'lucide-react';

interface ActionButtonsProps {
  data: CardData;
  onOpenQr: () => void;
  onOpenPrint: () => void;
  onShare: () => void;
  onOpenEdit?: () => void;
  onOpenExport?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  data,
  onOpenQr,
  onOpenPrint,
  onShare,
  onOpenEdit,
  onOpenExport,
}) => {
  return (
    <div className="w-full flex items-center justify-center flex-wrap gap-1 sm:gap-1.5 py-1 text-neutral-400">
      {/* 1. DIRECT COMMUNICATION CHANNELS */}
      <div className="flex items-center gap-0.5">
        {/* Contact Save (.vcf) */}
        <button
          onClick={() => downloadVCard(data)}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="연락처 주소록에 저장 (vCard .vcf)"
          aria-label="연락처 주소록에 저장"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        {/* Phone Call */}
        <a
          href={`tel:${data.phoneRaw}`}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={`전화 걸기 (${data.phone})`}
          aria-label="전화 걸기"
        >
          <Phone className="w-4 h-4" />
        </a>

        {/* WhatsApp Message */}
        <a
          href={data.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="WhatsApp 메시지 보내기"
          aria-label="WhatsApp"
        >
          <MessageSquare className="w-4 h-4" />
        </a>

        {/* Email */}
        <a
          href={`mailto:${data.email}`}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={`이메일 작성 (${data.email})`}
          aria-label="이메일 보내기"
        >
          <Mail className="w-4 h-4" />
        </a>

        {/* Website */}
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={`공식 웹사이트 (${data.websiteDisplay})`}
          aria-label="공식 웹사이트 방문"
        >
          <Globe className="w-4 h-4" />
        </a>
      </div>

      {/* Subtle Divider Hairline */}
      <span className="w-px h-3.5 bg-neutral-800 mx-0.5" />

      {/* 2. CARD UTILITIES */}
      <div className="flex items-center gap-0.5">
        {/* Edit Card */}
        {onOpenEdit && (
          <button
            onClick={onOpenEdit}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="명함 정보 수정"
            aria-label="명함 정보 수정"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        {/* Download Standalone HTML */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="단일 HTML 다운로드 / 배포"
            aria-label="단일 HTML 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* QR Code Modal */}
        <button
          onClick={onOpenQr}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="QR 코드 전체화면 보기"
          aria-label="QR 코드"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* High-Resolution Print / PDF */}
        <button
          onClick={onOpenPrint}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="인쇄용 고품질 PDF 출력"
          aria-label="인쇄 / PDF 출력"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Share Digital Card */}
        <button
          onClick={onShare}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="명함 링크 공유"
          aria-label="명함 공유"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Divider Hairline */}
      <span className="w-px h-3.5 bg-neutral-800 mx-0.5" />

      {/* 3. MAP DIRECTIONS */}
      <div className="flex items-center gap-0.5">
        {/* Google Maps */}
        <a
          href={data.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Google 지도에서 위치 보기"
          aria-label="Google 지도"
        >
          <MapPin className="w-4 h-4" />
        </a>

        {/* Naver Maps */}
        <a
          href={data.naverMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="네이버 지도에서 위치 보기"
          aria-label="네이버 지도"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
