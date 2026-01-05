import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { setSvgUrl, setupCopyButtons, setupScrollBasedButtonVisibility } from './utils';

// Set up 'Download All' button functionality
const setupDownloadAllButton = () => {
  document.querySelectorAll('.btn-download-all').forEach((button) => {
    button.addEventListener('click', () => {
      const zip = new JSZip();
      document.querySelectorAll('.svg-card svg').forEach((svg, index) => {
        zip.file(`svg${index}.svg`, svg.outerHTML);
      });

      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'svgs_collection.zip');
      });
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
    const lightness = Number.parseInt(value, 10);
    if (Number.isNaN(lightness)) return;
    document.documentElement.style.setProperty('--svg-preview-bg', `hsl(210, 20%, ${lightness}%)`);
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
  const previewControls = document.querySelector('.preview-controls');
  if (previewControls) previewControls.classList.add('hidden');
  setupDownloadAllButton();
  setupCopyButtons();
  setupScrollBasedButtonVisibility();
  setupPreviewBackgroundControl();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.message === 'load_svgs') {
      setSvgUrl(message.data, message.sender, message.pageUrl);
    }
  });
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);
