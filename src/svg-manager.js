import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { setSvgUrl, setupCopyButtons } from './utils';

const DEFAULT_NAME = 'collection';
let lastSourceLabel = DEFAULT_NAME;

const getSourceLabel = (pageUrl) => {
  if (!pageUrl) return DEFAULT_NAME;
  try {
    return new URL(pageUrl).hostname;
  } catch {
    return pageUrl.replace(/^https?:\/\//, '').split('/')[0] || DEFAULT_NAME;
  }
};

const getZipName = (label) => {
  const baseName = label || DEFAULT_NAME;
  return `svgs-${baseName}.zip`;
};

// Set up 'Download All' button functionality
const setupDownloadAllButton = () => {
  document.querySelector('.btn-download-all').addEventListener('click', () => {
    const zip = new JSZip();
    document.querySelectorAll('.svg-card svg').forEach((svg, index) => {
      zip.file(`${lastSourceLabel || DEFAULT_NAME}-${index}.svg`, svg.outerHTML);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, getZipName(lastSourceLabel));
    });
  });
};

const setupPreviewBackgroundControl = () => {
  const slider = document.getElementById('preview-bg');
  if (!slider) return;

  const storedValue = window.localStorage.getItem('preview-bg-lightness');
  const initialValue = storedValue || '100';
  slider.value = initialValue;

  const applyPreviewBackground = (value) => {
    const lightness = 100 - Number.parseInt(value, 10);
    if (Number.isNaN(lightness)) return;
    document.documentElement.style.setProperty('--svg-preview-bg', `oklch(${lightness}% 0% 0)`);
  };

  applyPreviewBackground(slider.value);

  slider.addEventListener('input', (event) => {
    const { value } = event.target;
    applyPreviewBackground(value);
    window.localStorage.setItem('preview-bg-lightness', value);
  });
};

// Listen for incoming messages from the background script
const initializePage = () => {
  setupDownloadAllButton();
  setupCopyButtons();
  setupPreviewBackgroundControl();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.message === 'load_svgs') {
      lastSourceLabel = getSourceLabel(message.pageUrl);
      setSvgUrl(message.data, message.sender, message.pageUrl);
    }
  });
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);
