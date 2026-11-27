/**
 * Reads a pasted ThriveCart embed code into safe, validated settings.
 * We never inject the pasted HTML: we rebuild ThriveCart's markup ourselves and
 * only load ThriveCart's own script (from a *.thrivecart.com https URL).
 */
export type ThriveCartEmbed = {
  mode: 'embedded' | 'popup';
  account: string;
  product: string;
  template: string;
  /** Embeddable id (embedded checkouts), e.g. tc-myaccount-3-ABC123 */
  embeddable: string | null;
  /** Class names ThriveCart's script looks for, taken from the pasted code (safe characters only) */
  className: string;
  scriptSrc: string;
};

const DEFAULT_SCRIPT = '//tinder.thrivecart.com/embed/v1/thrivecart.js';

const attr = (code: string, name: string) => code.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1]?.trim() ?? null;

/** The class on the pasted checkout element (e.g. "thrivecart-embeddable"), so the script can find it. */
const targetClass = (html: string, isPopup: boolean) => {
  const tag = html.match(/<(?:div|a)\b[^>]*data-thrivecart-account[^>]*>/i)?.[0] || '';
  const classes = (attr(tag, 'class') || '')
    .split(/\s+/)
    .filter((c) => /^[a-z0-9_-]{1,60}$/i.test(c));
  if (classes.length) return classes.join(' ');
  return isPopup ? 'thrivecart-button' : 'thrivecart-embeddable';
};

export function parseThriveCartEmbed(code: string | null | undefined): ThriveCartEmbed | null {
  const html = String(code || '');
  if (!html.trim()) return null;

  const account = attr(html, 'data-thrivecart-account');
  const product = attr(html, 'data-thrivecart-product');
  if (!account || !/^[a-z0-9-]{1,64}$/i.test(account)) return null;
  if (!product || !/^\d{1,10}$/.test(product)) return null;

  const template = attr(html, 'data-thrivecart-tpl') || 'v2';
  const embeddableRaw = attr(html, 'data-thrivecart-embeddable');
  const embeddable = embeddableRaw && /^tc-[a-z0-9_-]{1,120}$/i.test(embeddableRaw) ? embeddableRaw : null;

  // Only ever load a script hosted on thrivecart.com, over https
  let scriptSrc = DEFAULT_SCRIPT;
  const src = html.match(/<script[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (src) {
    try {
      const url = new URL(src.startsWith('//') ? `https:${src}` : src);
      if ((url.hostname === 'thrivecart.com' || url.hostname.endsWith('.thrivecart.com')) && url.pathname.endsWith('.js')) {
        url.protocol = 'https:';
        scriptSrc = url.toString();
      }
    } catch {
      /* keep default */
      console.log('parseThriveCartEmbed: invalid script src', src);
    }
  }

  const isPopup = /thrivecart-button/i.test(html) && !embeddable;
  // An embedded checkout can't render without its embeddable id
  if (!isPopup && !embeddable) return null;
  return {
    mode: isPopup ? 'popup' : 'embedded',
    account,
    product,
    template: /^[a-z0-9]{1,10}$/i.test(template) ? template : 'v2',
    embeddable,
    className: targetClass(html, isPopup),
    scriptSrc,
  };
}
