// Pure helpers for the /leads page's requirement list and its live updates (no React here,
// so they are tested with `node --test src/pages/business/enquiryList.test.js`).

export const STATUS_LABELS = { open: 'सक्रिय (Open)', closed: 'पूर्ण (Closed)' };

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? STATUS_LABELS.open;
}

// 'सर्व' (all), '' or no value means "any".
function isAll(value) {
  return value === undefined || value === null || value === '' || value === 'सर्व';
}

export function matchesFilters(card, { district, category } = {}) {
  return (isAll(district) || card.district === district) && (isAll(category) || card.category === category);
}

// Query parameters for the list, without the "all" filters (URLSearchParams would send
// an undefined value as the text "undefined").
export function listParams({ district, category } = {}) {
  const params = {};
  if (!isAll(district)) params.district = district;
  if (!isAll(category)) params.category = category;
  return params;
}

// A live "enquiry.created": prepend it, unless it is already listed or outside the current filters.
export function addEnquiry(list, card, filters) {
  if (list.some((item) => item.id === card.id) || !matchesFilters(card, filters)) return list;
  return [card, ...list];
}

// A live "enquiry.updated": only status and quotesCount change.
export function updateEnquiry(list, update) {
  if (!list.some((item) => item.id === update.id)) return list;
  return list.map((item) => (item.id === update.id
    ? { ...item, status: update.status, quotesCount: update.quotesCount }
    : item));
}

// Use with the list as it was BEFORE applying the update.
export function concernsMe(list, update) {
  const card = list.find((item) => item.id === update.id);
  return Boolean(card && card.isMine);
}

export function isNewQuoteForMe(list, update) {
  const card = list.find((item) => item.id === update.id);
  return Boolean(card && card.isMine && update.quotesCount > (card.quotesCount ?? 0));
}
