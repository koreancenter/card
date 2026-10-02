import { CardData } from '../types/card';

export const CARD_DATA: CardData = {
  organization: 'VANCE ARCHITECTURAL STUDIO',
  organizationKr: '글로벌 디자인 랩',
  name: 'ALEXANDER VANCE',
  nameKr: '알렉산더 밴스',
  title: 'Principal Architect',
  titleKr: '대표 건축가',
  phone: '+82 10-1234-5678',
  phoneRaw: '+821012345678',
  whatsappUrl: 'https://wa.me/821012345678',
  email: 'alexander@vancestudio.design',
  website: 'https://card.goguma.app/vance',
  websiteDisplay: 'card.goguma.app/vance',
  addressLines: [
    '77 Cheongdam-ro, Gangnam-gu',
    'Seoul 06015, Republic of Korea'
  ],
  addressKr: '서울특별시 강남구 청담로 77',
  googleMapsUrl: 'https://maps.google.com/?q=Gangnam+Seoul',
  naverMapsUrl: 'https://map.naver.com'
};

/**
 * Generates an RFC-compliant vCard 3.0 string
 */
export function generateVCard(data: CardData = CARD_DATA): string {
  const addressJoined = data.addressLines && data.addressLines.length > 0 
    ? data.addressLines.join(', ') 
    : (data.addressKr || '');

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.name.split(' ').reverse().join(';')};;;`,
    `FN:${data.nameKr ? `${data.name} (${data.nameKr})` : data.name}`,
    `ORG:${data.organization}${data.organizationKr ? ` (${data.organizationKr})` : ''}`,
    `TITLE:${data.title}${data.titleKr ? ` (${data.titleKr})` : ''}`,
    `TEL;TYPE=CELL,VOICE,PREF:${data.phoneRaw || data.phone.replace(/[^0-9+]/g, '')}`,
    `EMAIL;TYPE=INTERNET,WORK,PREF:${data.email}`,
    `URL;TYPE=WORK:${data.website}`,
    `ADR;TYPE=WORK:;;${addressJoined};;;;`,
    `NOTE:${data.organization} - ${data.title}`,
    'REV:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    'END:VCARD'
  ].join('\r\n');

  return vcard;
}

/**
 * Triggers a browser download of the .vcf contact card
 */
export function downloadVCard(data: CardData = CARD_DATA): void {
  const vcardContent = generateVCard(data);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (data.name || 'Business_Card').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const safeOrg = (data.organization || 'Card').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${safeName}_${safeOrg}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
