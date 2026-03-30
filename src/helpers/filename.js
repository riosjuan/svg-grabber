const DEFAULT_FILENAME = 'svg';

export const sanitizeFilename = (input, fallback = DEFAULT_FILENAME) => {
  if (!input) return fallback;
  return (
    input
      .toString()
      .trim()
      // eslint-disable-next-line no-control-regex
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^[-.]+|[-.]+$)/g, '')
      .slice(0, 80) || fallback
  );
};

export const toSafeFilename = (value, fallback = DEFAULT_FILENAME) =>
  sanitizeFilename(value, fallback);
