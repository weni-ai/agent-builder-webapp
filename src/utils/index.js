export const createDownloadAnchor = ({ name, href }) => {
  const a = document.createElement('a');

  a.setAttribute('download', name);
  a.setAttribute('href', href);

  return a;
};

export const actionGroupIcon = (groupId) => {
  return {
    interactions: 'chat',
    shopping: 'shopping_cart',
    support: 'contact_support',
    media: 'attach_file',
    custom: 'edit_square',
  }[groupId];
};
