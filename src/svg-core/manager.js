import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { getSourceLabelFromUrl, sanitizeFilename, setupThemeToggle } from '../helpers';
import { setSvgUrl, setupCopyButtons } from './gallery-handler';

const DEFAULT_NAME = 'collection';
let lastSourceLabel = DEFAULT_NAME;

const getSourceLabel = (pageUrl) => {
  const rawLabel = getSourceLabelFromUrl(pageUrl, DEFAULT_NAME);
  return sanitizeFilename(rawLabel) || DEFAULT_NAME;
};

const getZipName = (label) => {
  const baseName = sanitizeFilename(label) || DEFAULT_NAME;
  return `svgs-${baseName}.zip`;
};

// Set up 'Download All' button functionality
const setupDownloadAllButton = () => {
  const downloadAllButton = document.querySelector('.btn-download-all');
  if (!downloadAllButton) return;

  downloadAllButton.addEventListener('click', () => {
    const zip = new JSZip();
    document.querySelectorAll('.svg-card').forEach((card, index) => {
      const safeLabel = sanitizeFilename(lastSourceLabel) || DEFAULT_NAME;
      const rawSvg = card.dataset.rawSvg;
      if (rawSvg) {
        zip.file(`${safeLabel}-${index}.svg`, rawSvg);
        return;
      }
      const fallbackSvg = card.querySelector('svg')?.outerHTML;
      if (fallbackSvg) {
        zip.file(`${safeLabel}-${index}.svg`, fallbackSvg);
      }
    });

    zip
      .generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, getZipName(lastSourceLabel));
      })
      .catch((error) => {
        console.error('Failed to generate SVG zip.', error);
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
  setupThemeToggle();
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
