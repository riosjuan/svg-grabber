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
const createSvgCard = (svg, sender, index) => {
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
  const { header, senderLink, svgGallery, downloadAllButtons, disclaimer } =
    getElements();

  // Update header and sender link
  if (header) header.innerHTML = `All SVGs from &#8594; ${sender}`;
  if (senderLink) {
    senderLink.innerHTML = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;
  }

  // Clear existing SVG cards
  if (svgGallery) svgGallery.innerHTML = '';

  if (data.length === 0) {
    // Handle case when no SVGs are found
    if (header) header.innerHTML = `No SVGs in &#8594; ${sender}`;
    downloadAllButtons.forEach((button) => button.classList.add('hidden'));
    if (disclaimer)
      disclaimer.innerHTML =
        'It seems that this site does not use any SVGs. 🙃';
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
  const svg = svgCard?.querySelector('svg');

  if (!svg) {
    console.error('SVG element not found');
    return;
  }

  navigator.clipboard
    .writeText(svg.outerHTML)
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
