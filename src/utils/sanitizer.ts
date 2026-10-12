import DOMPurify from 'dompurify';

/**
 * Strict Zero-Trust Sanitization Configuration for User-Provided Card HTML
 * Defends against XSS, script injection, malicious event handlers, and data URI exfiltration.
 */
export const ZERO_TRUST_HTML_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'b', 'strong', 'i', 'em', 'u', 'small', 'sub', 'sup',
    'ul', 'ol', 'li', 'br', 'hr', 'blockquote', 'code', 'pre',
    'svg', 'g', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline',
    'text', 'defs', 'linearGradient', 'radialGradient', 'stop',
    'img'
  ],
  ALLOWED_ATTR: [
    'class', 'style', 'id',
    // SVG attributes
    'viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
    'stroke-linejoin', 'd', 'r', 'cx', 'cy', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
    'points', 'offset', 'stop-color', 'stop-opacity', 'width', 'height',
    'transform', 'opacity',
    // Safe Image attributes
    'src', 'alt', 'loading'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'link', 'meta', 'base',
    'form', 'input', 'button', 'textarea', 'select', 'option',
    'applet', 'frameset', 'frame'
  ],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'ondblclick', 'onmouseover', 'onmouseout',
    'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onkeydown', 'onkeypress', 'onkeyup', 'formaction',
    'href' // Enforce no interactive external href hijacking inside card face
  ],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: { html: true, svg: true }
};

/**
 * Sanitizes user-provided HTML markup for business card faces.
 * Guarantees zero executable scripts, event handlers, or hostile DOM sinks.
 */
export function sanitizeCardHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return String(DOMPurify.sanitize(dirty.trim(), ZERO_TRUST_HTML_CONFIG));
}

/**
 * Sanitizes standalone SVG strings (e.g. QR codes, vector monograms).
 */
export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') return '';
  return String(DOMPurify.sanitize(svgContent.trim(), {
    USE_PROFILES: { svg: true, svgFilters: true }
  }));
}

/**
 * Detects whether dirty HTML contained unsafe active elements or event handlers.
 * Useful for authoring feedback in CustomHtmlEditor.
 */
export function detectUnsafePatterns(html: string): string[] {
  if (!html) return [];
  const findings: string[] = [];
  const lower = html.toLowerCase();

  if (/<script\b/i.test(lower)) findings.push('<script> 태그');
  if (/<iframe\b/i.test(lower)) findings.push('<iframe> 태그');
  if (/<object\b|<embed\b/i.test(lower)) findings.push('<object>/<embed> 태그');
  if (/\bon\w+\s*=/i.test(lower)) findings.push('인라인 이벤트 핸들러 (onerror, onclick 등)');
  if (/javascript:/i.test(lower)) findings.push('javascript: URL 스키마');
  if (/<form\b|<input\b/i.test(lower)) findings.push('양식(form/input) 요소');

  return findings;
}
