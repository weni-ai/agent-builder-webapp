import i18n from '@/utils/plugins/i18n';

import { format, subDays } from 'date-fns';
import { enUS, es as esLocale, ptBR, ro as roLocale } from 'date-fns/locale';

const DATE_FNS_LOCALE_MAP = {
  en: enUS,
  es: esLocale,
  'pt-br': ptBR,
  ro: roLocale,
};

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

/**
 * Formats a timestamp using a locale-specific date-fns pattern.
 * Parses and guards the timestamp, then resolves the pattern and locale for
 * the active language, falling back to the provided pattern and enUS.
 * @param {String} timestamp - The timestamp to format
 * @param {Object} patternMap - Map of locale to date-fns pattern
 * @param {String} fallbackPattern - Pattern used for unmapped locales
 * @returns {String} Formatted timestamp or empty string for invalid dates
 */
function formatWithLocalePattern(
  timestamp: string,
  patternMap: Record<string, string>,
  fallbackPattern: string,
): string {
  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) return '';

  const { locale } = i18n.global;
  const dateLocale = DATE_FNS_LOCALE_MAP[locale.value] || enUS;
  const displayPattern = patternMap[locale.value] || fallbackPattern;

  return format(parsedDate, displayPattern, { locale: dateLocale });
}

export function formatTimestamp(timestamp: string) {
  const FALLBACK_PATTERN = 'MM/dd/yy HH:mm';

  return formatWithLocalePattern(
    timestamp,
    {
      en: FALLBACK_PATTERN,
      es: 'dd/MM/yy HH:mm',
      'pt-br': 'dd/MM/yy HH:mm',
      ro: 'dd/MM/yy HH:mm',
    },
    FALLBACK_PATTERN,
  );
}

export function formatConversationDate(timestamp: string) {
  return formatWithLocalePattern(
    timestamp,
    {
      en: 'MM/dd/yy',
      es: 'dd/MM/yy',
      'pt-br': 'dd/MM/yy',
      ro: 'dd/MM/yy',
    },
    'MM/dd/yy',
  );
}

export function formatConversationTime(timestamp: string) {
  return formatWithLocalePattern(
    timestamp,
    {
      en: 'HH:mm',
      es: 'HH:mm',
      'pt-br': 'HH:mm',
      ro: 'HH:mm',
    },
    'HH:mm',
  );
}

export function formatLongDate(timestamp: string) {
  const FALLBACK_PATTERN = 'MMMM d, yyyy';

  return formatWithLocalePattern(
    timestamp,
    {
      en: FALLBACK_PATTERN,
      es: "d 'de' MMMM 'de' yyyy",
      'pt-br': "d 'de' MMMM 'de' yyyy",
      ro: 'd MMMM yyyy',
    },
    FALLBACK_PATTERN,
  );
}

export function getYesterdayFormattedDate() {
  return formatMonthDayDate(subDays(new Date(), 1).toISOString());
}

export function formatMonthDayDate(timestamp: string) {
  const FALLBACK_PATTERN = 'MMMM d';

  return formatWithLocalePattern(
    timestamp,
    {
      en: FALLBACK_PATTERN,
      es: "d 'de' MMMM",
      'pt-br': "d 'de' MMMM",
      ro: 'd MMMM',
    },
    FALLBACK_PATTERN,
  );
}

export function formatTime(timestamp: string) {
  const FALLBACK_PATTERN = 'h:mm aaaa';

  return formatWithLocalePattern(
    timestamp,
    {
      en: FALLBACK_PATTERN,
      es: 'HH:mm',
      'pt-br': "HH'h'mm",
      ro: 'HH:mm',
    },
    FALLBACK_PATTERN,
  );
}
