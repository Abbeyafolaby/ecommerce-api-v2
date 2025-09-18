// Basic input sanitizer to mitigate NoSQL injection and trim strings
// - Removes keys starting with '$' or containing '.'
// - Removes prototype pollution keys
// - Trims string values

function cleanKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanKeys);

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      // skip dangerous keys
      continue;
    }
    let v = value;
    if (typeof v === 'string') v = v.trim();
    else if (Array.isArray(v)) v = v.map(cleanKeys);
    else if (v && typeof v === 'object') v = cleanKeys(v);
    cleaned[key] = v;
  }
  return cleaned;
}

export default function sanitize() {
  return (req, res, next) => {
    if (req.body) req.body = cleanKeys(req.body);
    if (req.query) req.query = cleanKeys(req.query);
    if (req.params) req.params = cleanKeys(req.params);
    next();
  };
}
