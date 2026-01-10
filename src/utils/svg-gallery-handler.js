import { checkmarkIcon, copyIcon, downloadIcon } from './icons';

// Constants
const COPY_BUTTON_FEEDBACK_DURATION = 1500;

// DOM Element Selectors
const getElements = () => ({
  header: document.getElementById('header'),
  svgCount: document.getElementById('svg-count'),
  senderLink: document.getElementById('sender-url'),
  svgGallery: document.getElementById('gallery-svg'),
  controls: document.querySelector('.controls'),
  downloadAllButton: document.querySelector('.btn-download-all'),
  previewControls: document.querySelector('.preview-controls'),
  disclaimerAlert: document.querySelector('.disclaimer-alert'),
  disclaimerDismiss: document.querySelector('.disclaimer-dismiss'),
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

const createTooltip = (id, anchorId, text) => {
  const tooltip = document.createElement('div');
  tooltip.classList.add('svg-tooltip');
  tooltip.id = id;
  tooltip.setAttribute('popover', 'manual');
  tooltip.setAttribute('anchor', anchorId);
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = text;
  return tooltip;
};

const attachTooltipHandlers = (target, tooltip) => {
  if (!target || !tooltip) return;

  const show = () => tooltip.showPopover?.();
  const hide = () => tooltip.hidePopover?.();

  target.addEventListener('pointerenter', show);
  target.addEventListener('pointerleave', hide);
  target.addEventListener('focusin', show);
  target.addEventListener('focusout', hide);
  target.addEventListener('click', hide);
};

const setTooltipAnchor = (anchorEl, tooltipEl, anchorName) => {
  if (!anchorEl || !tooltipEl || !anchorName) return;
  anchorEl.style.setProperty('anchor-name', anchorName);
  tooltipEl.style.setProperty('position-anchor', anchorName);
};

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
  copyButton.classList.add('btn', 'btn-icon', 'copy');
  copyButton.type = 'button';
  copyButton.setAttribute('aria-label', 'Copy SVG');
  copyButton.id = `copy-btn-${index}`;
  copyButton.innerHTML = copyIcon;

  const downloadLink = document.createElement('a');
  downloadLink.classList.add('btn', 'btn-icon');
  downloadLink.download = `${toSafeFilename(sender)}-${index}.svg`;
  downloadLink.href = `data:text/svg;base64,${base64doc}`;
  downloadLink.setAttribute('aria-label', 'Download SVG');
  downloadLink.id = `download-btn-${index}`;
  downloadLink.innerHTML = downloadIcon;

  const copyTooltip = createTooltip(`copy-tooltip-${index}`, copyButton.id, 'Copy SVG');
  const downloadTooltip = createTooltip(
    `download-tooltip-${index}`,
    downloadLink.id,
    'Download SVG'
  );
  setTooltipAnchor(copyButton, copyTooltip, `--copy-anchor-${index}`);
  setTooltipAnchor(downloadLink, downloadTooltip, `--download-anchor-${index}`);

  copyButton.setAttribute('aria-describedby', copyTooltip.id);
  copyButton.dataset.tooltipId = copyTooltip.id;
  downloadLink.setAttribute('aria-describedby', downloadTooltip.id);
  attachTooltipHandlers(copyButton, copyTooltip);
  attachTooltipHandlers(downloadLink, downloadTooltip);

  const copyAnchor = document.createElement('div');
  copyAnchor.classList.add('svg-tooltip-anchor');
  copyAnchor.append(copyButton, copyTooltip);

  const downloadAnchor = document.createElement('div');
  downloadAnchor.classList.add('svg-tooltip-anchor');
  downloadAnchor.append(downloadLink, downloadTooltip);

  actions.append(copyAnchor, downloadAnchor);
  element.append(content, actions);
  return element;
};

const showCopyButtonFeedback = (button) => {
  if (!button) return;
  const hintTooltip = button.dataset.tooltipId
    ? document.getElementById(button.dataset.tooltipId)
    : null;
  const icon = button.querySelector('svg');
  const label = button.querySelector('span');
  if (!button.dataset.originalIcon && icon) {
    button.dataset.originalIcon = icon.outerHTML;
  }

  if (!button.dataset.originalText && label) {
    button.dataset.originalText = label.textContent;
  }

  if (icon) {
    icon.outerHTML = checkmarkIcon;
  }

  button.classList.add('is-success');
  if (hintTooltip) {
    if (!hintTooltip.dataset.originalText) {
      hintTooltip.dataset.originalText = hintTooltip.textContent || 'Copy SVG';
    }
    hintTooltip.textContent = 'Copied!';
    hintTooltip.setAttribute('role', 'status');
    hintTooltip.setAttribute('aria-live', 'polite');
    hintTooltip.showPopover?.();
  }

  if (label) {
    label.textContent = '';
    label.hidden = true;
  }

  const existingTimeoutId = Number(button.dataset.resetTimeoutId);
  if (existingTimeoutId) clearTimeout(existingTimeoutId);

  const timeoutId = window.setTimeout(() => {
    if (button.dataset.originalIcon) {
      const currentIcon = button.querySelector('svg');
      if (currentIcon) {
        currentIcon.outerHTML = button.dataset.originalIcon;
      } else {
        button.insertAdjacentHTML('afterbegin', button.dataset.originalIcon);
      }
    }

    if (label) {
      label.textContent = button.dataset.originalText || 'Copy';
      label.hidden = false;
    }

    button.classList.remove('is-success');
    if (hintTooltip) {
      hintTooltip.textContent = hintTooltip.dataset.originalText || 'Copy SVG';
      hintTooltip.setAttribute('role', 'tooltip');
      hintTooltip.removeAttribute('aria-live');
      hintTooltip.hidePopover?.();
    }
    delete button.dataset.resetTimeoutId;
  }, COPY_BUTTON_FEEDBACK_DURATION);

  button.dataset.resetTimeoutId = String(timeoutId);
};

// Main Functions
export const setSvgUrl = (data, sender, pageUrl) => {
  const { senderLink, svgGallery, svgCount, disclaimerAlert, controls } = getElements();

  if (senderLink) {
    senderLink.textContent = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;
  }
  if (svgCount) svgCount.textContent = `${data.length} SVGs`;

  // Clear existing SVG cards
  if (svgGallery) svgGallery.innerHTML = '';

  if (data.length === 0) {
    // Handle case when no SVGs are found
    if (svgCount) svgCount.textContent = `No SVGs found 🙃`;
    if (disclaimerAlert) disclaimerAlert.classList.add('hidden');
  } else {
    // Create and append SVG cards
    data.forEach((svg, index) => {
      if (svgGallery) {
        const card = createSvgCard(svg, sender, index);
        svgGallery.appendChild(card);
      }
    });

    if (controls) controls.classList.remove('hidden');
    if (disclaimerAlert) disclaimerAlert.classList.remove('hidden');
  }
};

const copySvg = (event) => {
  const copyButton = event.target.closest('button.copy');
  const svgCard = event.target.closest('.svg-card');
  const rawSvg = svgCard?.dataset.rawSvg;

  if (!rawSvg) {
    console.error('SVG content not found');
    return;
  }

  navigator.clipboard
    .writeText(rawSvg)
    .then(() => {
      showCopyButtonFeedback(copyButton);
    })
    .catch((err) => console.error('Failed to copy text: ', err));
};

// Event Listeners
export const setupCopyButtons = () => {
  document.addEventListener('click', (event) => {
    if (event.target.closest('button.copy')) {
      copySvg(event);
    }
  });
};

export const setupDisclaimerAlert = () => {
  const { disclaimerAlert, disclaimerDismiss } = getElements();
  if (!disclaimerAlert || !disclaimerDismiss) return;

  disclaimerDismiss.addEventListener('click', () => {
    disclaimerAlert.classList.add('hidden');
  });
};
