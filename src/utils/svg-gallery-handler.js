// Constants
const NOTIFICATION_ACTIVE_CLASS = 'notification--active';
const NOTIFICATION_ACTIVE_DURATION = 1500;

// DOM Element Selectors
const getElements = () => ({
  header: document.getElementById('header'),
  senderLink: document.getElementById('sender-url'),
  svgGallery: document.getElementById('gallery-svg'),
  downloadAllButtons: document.querySelectorAll('.btn-download-all'),
  disclaimer: document.querySelector('.disclaimer'),
  notification: document.querySelector('.notification'),
});

// Helper Functions
const sanitizeSvgForPreview = (svg) => {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    if (svgElement.tagName === 'parsererror') {
      return '';
    }

    svgElement.querySelectorAll('script, foreignObject').forEach((node) => {
      node.remove();
    });

    const walker = svgDoc.createTreeWalker(svgElement, NodeFilter.SHOW_ELEMENT);
    let currentNode = walker.currentNode;

    while (currentNode) {
      Array.from(currentNode.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) {
          currentNode.removeAttribute(attribute.name);
          return;
        }

        if (
          (attribute.name === 'href' || attribute.name === 'xlink:href') &&
          /^\s*javascript:/i.test(attribute.value)
        ) {
          currentNode.removeAttribute(attribute.name);
        }
      });

      currentNode = walker.nextNode();
    }

    return svgElement.outerHTML;
  } catch (error) {
    console.error('Failed to sanitize SVG for preview:', error);
    return '';
  }
};

const toSafeFilename = (value) => (value || 'svg').replace(/[^\w.-]+/g, '-');

const createSvgCard = (svg, sender, index) => {
  const element = document.createElement('div');
  const base64doc = btoa(unescape(encodeURIComponent(svg)));
  element.classList.add('svg-card');
  element.dataset.rawSvg = svg;

  const content = document.createElement('div');
  content.classList.add('svg-card__content');
  content.innerHTML = sanitizeSvgForPreview(svg);

  const actions = document.createElement('div');
  actions.classList.add('svg-card__actions');

  const copyButton = document.createElement('button');
  copyButton.classList.add('copy');
  copyButton.type = 'button';
  copyButton.textContent = 'Copy';

  const downloadLink = document.createElement('a');
  downloadLink.download = `${toSafeFilename(sender)}-${index}.svg`;
  downloadLink.href = `data:text/svg;base64,${base64doc}`;
  downloadLink.textContent = 'Download';

  actions.append(copyButton, downloadLink);
  element.append(content, actions);
  return element;
};

const showNotification = (notification) => {
  if (!notification) return;
  notification.classList.add(NOTIFICATION_ACTIVE_CLASS);
  setTimeout(() => {
    notification.classList.remove(NOTIFICATION_ACTIVE_CLASS);
  }, NOTIFICATION_ACTIVE_DURATION);
};

// Main Functions
export const setSvgUrl = (data, sender, pageUrl) => {
  const { header, senderLink, svgGallery, downloadAllButtons, disclaimer } = getElements();

  // Update header and sender link
  if (header) header.textContent = `All SVGs from → ${sender}`;
  if (senderLink) {
    senderLink.textContent = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;
  }

  // Clear existing SVG cards
  if (svgGallery) svgGallery.innerHTML = '';

  if (data.length === 0) {
    // Handle case when no SVGs are found
    if (header) header.textContent = `No SVGs in → ${sender}`;
    downloadAllButtons.forEach((button) => button.classList.add('hidden'));
    if (disclaimer) disclaimer.textContent = 'It seems that this site does not use any SVGs. 🙃';
  } else {
    // Create and append SVG cards
    data.forEach((svg, index) => {
      if (svgGallery) {
        const card = createSvgCard(svg, sender, index);
        svgGallery.appendChild(card);
      }
    });

    // Show 'Download All' buttons
    downloadAllButtons.forEach((button) => button.classList.remove('hidden'));
  }
};

const copySvg = (event) => {
  const { notification } = getElements();
  const svgCard = event.target.closest('.svg-card');
  const rawSvg = svgCard?.dataset.rawSvg;

  if (!rawSvg) {
    console.error('SVG content not found');
    return;
  }

  navigator.clipboard
    .writeText(rawSvg)
    .then(() => showNotification(notification))
    .catch((err) => console.error('Failed to copy text: ', err));
};

// Event Listeners
export const setupCopyButtons = () => {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('copy')) {
      copySvg(event);
    }
  });
};
