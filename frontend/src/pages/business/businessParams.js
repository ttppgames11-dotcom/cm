// Query parameters for the business directory list, without the "all" filters. URLSearchParams
// would send an undefined value as the text "undefined", which the server then used as a real
// category or district. Tested with `node --test src/pages/business/businessParams.test.js`.
export function listParams({ cat, district } = {}) {
  const params = {};
  if (cat && cat !== 'all') params.cat = cat;
  if (district && district !== 'सर्व') params.district = district;
  return params;
}
