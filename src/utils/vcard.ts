import { CardData } from '../types/card';

export const CARD_DATA: CardData = {
  organization: 'Korean Center Global Network',
  organizationKr: '한국센터글로벌네트워크',
  name: 'PARK, GIHONG',
  nameKr: '박기홍',
  title: 'President Director',
  titleKr: '대표이사 / 이사장',
  phone: '+62-812-2824-9672',
  phoneRaw: '+6281228249672',
  whatsappUrl: 'https://wa.me/6281228249672',
  email: 'mrpark@koreancenter.net',
  website: 'https://mrpark.koreancenter.net',
  websiteDisplay: 'mrpark.koreancenter.net',
  addressLines: [
    '108-803, Yeokgok-ro 19, Wonmi-gu',
    'Bucheon-si, Kyeonggi-do'
  ],
  addressKr: '경기도 부천시 원미구 역곡로 19, 108동 803호',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=19+Yeokgok-ro+Bucheon-si+Gyeonggi-do',
  naverMapsUrl: 'https://map.naver.com/v5/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%Boot%EC%B2%9C%EC%8B%9C%20%EC%9B%90%EB%AF%B8%EA%B5%AC%20%EC%97%AD%EA%B3%A1%EB%A1%9C%2019'
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
