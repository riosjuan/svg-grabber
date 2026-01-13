export const getSourceLabelFromUrl = (pageUrl, fallback = '') => {
  if (!pageUrl) return fallback;
  try {
    const host = new URL(pageUrl).hostname;
    return host.replace(/^www\./i, '') || fallback;
  } catch {
    const host = pageUrl.replace(/^https?:\/\//, '').split('/')[0];
    return host.replace(/^www\./i, '') || fallback;
  }
};
