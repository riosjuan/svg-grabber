import { checkmarkIcon, copyIcon, downloadIcon } from './icons';
import {
  getSourceLabelFromUrl,
  hideTooltip,
  initTooltip,
  showTooltip,
  toSafeFilename,
} from '../helpers';

const COPY_BUTTON_FEEDBACK_DURATION = 1000;
const COPY_TOOLTIP_TEXT = 'Copy SVG';
const COPY_FEEDBACK_TEXT = 'Copied!';
const COPY_LABEL_FALLBACK_TEXT = 'Copy';
const DOWNLOAD_TOOLTIP_TEXT = 'Download SVG';

const getElements = () => ({
  header: document.getElementById('header'),
  svgCount: document.getElementById('svg-count'),
  senderLink: document.getElementById('sender-url'),
  senderTextSecondary: document.getElementById('sender-url-secondary'),
  svgGallery: document.getElementById('gallery-svg'),
  controls: document.querySelector('.header__controls'),
  downloadAllButton: document.querySelector('.btn--download-all'),
  previewControls: document.querySelector('.slider'),
});

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

const createSvgCard = (svg, sender, index) => {
  const element = document.createElement('div');
  const base64doc = btoa(unescape(encodeURIComponent(svg)));
  element.classList.add('card');
  element.dataset.rawSvg = svg;

  const content = document.createElement('div');
  content.classList.add('card__content');
  content.innerHTML = sanitizeSvgForPreview(svg);

  const actions = document.createElement('div');
  actions.classList.add('card__actions');

  const copyButton = document.createElement('button');
  copyButton.classList.add('btn', 'btn--icon', 'copy');
  copyButton.type = 'button';
  copyButton.setAttribute('aria-label', COPY_TOOLTIP_TEXT);
  copyButton.id = `copy-btn-${index}`;
  copyButton.innerHTML = copyIcon;

  const downloadLink = document.createElement('a');
  downloadLink.classList.add('btn', 'btn--icon');
  downloadLink.download = `${toSafeFilename(sender)}-${index}.svg`;
  downloadLink.href = `data:text/svg;base64,${base64doc}`;
  downloadLink.setAttribute('aria-label', DOWNLOAD_TOOLTIP_TEXT);
  downloadLink.id = `download-btn-${index}`;
  downloadLink.innerHTML = downloadIcon;

  copyButton.dataset.tooltip = COPY_TOOLTIP_TEXT;
  downloadLink.dataset.tooltip = DOWNLOAD_TOOLTIP_TEXT;
  initTooltip(copyButton);
  initTooltip(downloadLink);
  actions.append(downloadLink, copyButton);
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
    hintTooltip.textContent = COPY_FEEDBACK_TEXT;
    hintTooltip.setAttribute('role', 'status');
    hintTooltip.setAttribute('aria-live', 'polite');
    hintTooltip.dataset.locked = 'true';
    showTooltip(hintTooltip, button);
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
      label.textContent = button.dataset.originalText || COPY_LABEL_FALLBACK_TEXT;
      label.hidden = false;
    }

    button.classList.remove('is-success');
    if (hintTooltip) {
      hintTooltip.textContent = hintTooltip.dataset.originalText || COPY_TOOLTIP_TEXT;
      hintTooltip.setAttribute('role', 'tooltip');
      hintTooltip.removeAttribute('aria-live');
      delete hintTooltip.dataset.locked;
      hideTooltip(hintTooltip);
    }
    delete button.dataset.resetTimeoutId;
  }, COPY_BUTTON_FEEDBACK_DURATION);

  button.dataset.resetTimeoutId = String(timeoutId);
};

export const setSvgUrl = (data, sender, pageUrl) => {
  const { senderLink, senderTextSecondary, svgGallery, svgCount, controls } = getElements();
  let sourceLabel = sender;

  if (senderLink) {
    senderLink.textContent = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;
  }
  if (senderTextSecondary) {
    sourceLabel = getSourceLabelFromUrl(pageUrl, pageUrl);
    senderTextSecondary.textContent = sourceLabel;
  }
  if (svgCount) svgCount.textContent = `${data.length} SVGs`;

  if (svgGallery) svgGallery.innerHTML = '';

  if (data.length === 0) {
    if (svgCount) svgCount.textContent = `No SVGs found 🙃`;
  } else {
    data.forEach((svg, index) => {
      if (svgGallery) {
        const card = createSvgCard(svg, sourceLabel, index);
        svgGallery.appendChild(card);
      }
    });

    if (controls) controls.classList.remove('hidden');
  }
};

const copySvg = (event) => {
  const copyButton = event.target.closest('button.copy');
  const svgCard = event.target.closest('.card');
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

export const setupCopyButtons = () => {
  document.addEventListener('click', (event) => {
    if (event.target.closest('button.copy')) {
      copySvg(event);
    }
  });
};
