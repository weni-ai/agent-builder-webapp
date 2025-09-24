import i18n from '@/utils/plugins/i18n';

/**
 * Formats an array of items into a human-readable string with proper conjunction
 * @param {Array} items - Array of items to format
 * @returns {String} Formatted string like "item1, item2 and item3"
 */
export function formatListToReadable(items) {
  if (!Array.isArray(items)) {
    return '';
  }

  if (items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  const lastItem = items.at(-1);
  const otherItems = items.slice(0, -1).join(', ');

  return `${otherItems}${i18n.global.t('and')}${lastItem}`;
}

/**
 * Formats a WhatsApp URN into a human-readable phone number format
 * @param {String} urn - The WhatsApp URN to format
 * @returns {String} Formatted phone number or original URN if not a valid WhatsApp URN
 */
export function formatWhatsappUrn(urn) {
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
