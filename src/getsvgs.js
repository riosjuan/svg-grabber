import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { setupScrollBasedButtonVisibility } from './ui-utils.js';

// Function to set SVGs and update the page content
const setSvgsUrl = (data, sender, pageUrl) => {
  const header = document.getElementById('header');
  const senderLink = document.getElementById('sender-url');
  const svgGallery = document.getElementById('gallery-svg');
  const downloadAllButtons = document.querySelectorAll('.btn-download-all');
  const disclaimer = document.querySelector('.disclaimer');

  if (header) {
    header.innerHTML = `All SVGs from &#8594; ${sender}`;
  }

  if (senderLink) {
    senderLink.innerHTML = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;
  }

  if (svgGallery) {
    svgGallery.innerHTML = ''; // Clear any existing SVG cards
  }

  if (data.length === 0) {
    if (header) {
      header.innerHTML = `No SVGs in &#8594; ${sender}`;
    }
    downloadAllButtons.forEach((button) => {
      button.classList.add('hidden');
    });
    if (disclaimer) {
      disclaimer.innerHTML =
        'It seems that this site does not use any SVGs. 🙃';
    }
  } else {
    data.forEach((svg, index) => {
      if (svgGallery) {
        const element = document.createElement('div');
        const base64doc = btoa(unescape(encodeURIComponent(svg)));
        element.innerHTML = `
          <div class="svg-card__content">
            ${svg}
          </div>
          <div class="svg-card__actions">
            <button class='copy'>Copy</button>
            <a download="${sender}-${index}.svg" href='data:text/svg;base64,${base64doc}'>Download</a>
          </div>
        `;
        element.classList.add('svg-card');
        svgGallery.appendChild(element);

        // Add event listener for copy button
        const copyButton = element.querySelector('button.copy');
        if (copyButton) {
          copyButton.addEventListener('click', copySvg);
        }
      }
    });

    // Show the 'Download All' buttons if SVGs are present
    downloadAllButtons.forEach((button) => {
      button.classList.remove('hidden');
    });
  }

  // Add event listeners for copy buttons
  document.querySelectorAll('button.copy').forEach((btn) => {
    btn.addEventListener('click', copySvg);
  });
};

// Function to copy SVG to clipboard
const copySvg = (event) => {
  const notification = document.querySelector('.notification');
  const svgCard = event.target.closest('.svg-card');

  if (!svgCard) {
    console.error('SVG card not found');
    return;
  }

  const svg = svgCard.querySelector('svg');

  if (!svg) {
    console.error('SVG element not found');
    return;
  }

  navigator.clipboard
    .writeText(svg.outerHTML)
    .then(() => {
      if (!notification) return;

      notification.classList.add('notification--active');
      setTimeout(() => {
        notification.classList.remove('notification--active');
      }, 1500);
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err);
    });
};

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

// Use event delegation for copy buttons
const setupCopyButtons = () => {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('copy')) {
      copySvg(event);
    }
  });
};

// Listen for incoming messages from the background script
const initializePage = () => {
  setupDownloadAllButton();
  setupCopyButtons();
  setupScrollBasedButtonVisibility();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.message === 'load_svgs') {
      setSvgsUrl(message.data, message.sender, message.pageUrl);
    }
  });
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);
