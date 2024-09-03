import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  setSvgUrl,
  setupCopyButtons,
  setupScrollBasedButtonVisibility,
} from './utils';

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

// Listen for incoming messages from the background script
const initializePage = () => {
  setupDownloadAllButton();
  setupCopyButtons();
  setupScrollBasedButtonVisibility();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.message === 'load_svgs') {
      setSvgUrl(message.data, message.sender, message.pageUrl);
    }
  });
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);
