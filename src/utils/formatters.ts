import i18n from '@/utils/plugins/i18n';

import { format } from 'date-fns';
import { enUS, es as esLocale, ptBR } from 'date-fns/locale';

/**
 * Formats an array of items into a human-readable string with proper conjunction
 * @param {Array} items - Array of items to format
 * @returns {String} Formatted string like "item1, item2 and item3"
 */
export function formatListToReadable(items: string[]): string {
  if (!Array.isArray(items)) {
    return '';
  }

  if (items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1).join(', ');

  return `${otherItems}${i18n.global.t('and')}${lastItem}`;
}

/**
 * Formats a WhatsApp URN into a human-readable phone number format
 * @param {String} urn - The WhatsApp URN to format
 * @returns {String} Formatted phone number or original URN if not a valid WhatsApp URN
 */
export function formatWhatsappUrn(urn: string): string {
  const WHATSAPP_PREFIX = 'whatsapp:';

  if (!urn?.startsWith(WHATSAPP_PREFIX)) {
    return urn;
  }

  const phoneNumber = urn.replace(WHATSAPP_PREFIX, '');

  if (phoneNumber.length < 12) {
    return urn;
  }

  const ddi = phoneNumber.substring(0, 2);
  const ddd = phoneNumber.substring(2, 4);
  const number = phoneNumber.substring(4);

  const formattedNumber =
    number.length === 9
      ? number.replace(/(\d{5})(\d{4})/, '$1-$2') // 99999-9999
      : number.replace(/(\d{4})(\d{4})/, '$1-$2'); // 9999-9999

  return `+${ddi} (${ddd}) ${formattedNumber}`;
}

export function formatTimestamp(timestamp: string) {
  const { locale } = i18n.global;
  const FALLBACK_PATTERN = 'MM/dd/yy HH:mm';
  const DATE_LOCALE_MAP = {
    en: enUS,
    es: esLocale,
    'pt-br': ptBR,
  };
  const DATE_PATTERN_MAP = {
    en: FALLBACK_PATTERN,
    es: 'dd/MM/yy HH:mm',
    'pt-br': 'dd/MM/yy HH:mm',
  };

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) return '';

  const dateLocale = DATE_LOCALE_MAP[locale] || enUS;
  const displayPattern = DATE_PATTERN_MAP[locale] || FALLBACK_PATTERN;

  return format(parsedDate, displayPattern, { locale: dateLocale });
}
