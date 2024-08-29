// Function to apply stroke to children of SVG elements
const applyStrokeToChildren = (node) => {
  if (!node || !node.children) return;

  const hasFillNone = node.getAttribute('fill') === 'none';
  const hasStrokeAttributes =
    node.hasAttribute('stroke-width') ||
    node.hasAttribute('stroke-linecap') ||
    node.hasAttribute('stroke-linejoin');

  if (hasFillNone && hasStrokeAttributes) {
    for (const child of node.children) {
      if (!child.hasAttribute('stroke')) {
        child.setAttribute('stroke', 'currentColor');
      }
    }
  }

  for (const child of node.children) {
    applyStrokeToChildren(child);
  }
};

// Function to ensure uniform rendering of SVGs
const ensureUniformRendering = (svgNode) => {
  // Remove height and width attributes
  svgNode.removeAttribute('height');
  svgNode.removeAttribute('width');

  // Get the current viewBox or set a default one
  let viewBox = svgNode.getAttribute('viewBox');
  if (!viewBox) {
    viewBox = '0 0 24 24';
  }

  // Parse the viewBox values
  const [minX, minY, width, height] = viewBox.split(' ').map(Number);

  // Adjust viewBox to ensure entire SVG is visible
  const padding = Math.max(width, height) * 0.1; // 10% padding
  const newViewBox = `${minX - padding} ${minY - padding} ${
    width + padding * 2
  } ${height + padding * 2}`;

  // Set attributes using a more efficient method
  const attributes = {
    viewBox: newViewBox,
    width: '100%',
    height: '100%',
    preserveAspectRatio: 'xMidYMid meet',
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'currentColor',
    stroke: 'currentColor',
    'stroke-width': '0',
    style: 'overflow: visible; display: inline-block;',
  };

  Object.entries(attributes).forEach(([key, value]) =>
    svgNode.setAttribute(key, value)
  );

  // Remove unnecessary attributes
  ['height', 'width'].forEach((attr) => svgNode.removeAttribute(attr));
};

// Main function to process SVGs
const processSVGs = async () => {
  try {
    // Process inline and external SVGs concurrently
    const [inlineSVGs, externalSVGs] = await Promise.all([
      processInlineSVGs(),
      processExternalSVGs(),
    ]);

    // Combine, deduplicate, and process all SVGs
    const allSVGs = [...inlineSVGs, ...externalSVGs];
    const uniqueSVGs = deduplicateSVGs(allSVGs);
    const processedSVGs = uniqueSVGs.map(optimizeSVG);

    console.log('Processed SVG codes:', processedSVGs);

    // Send message to background script
    chrome.runtime.sendMessage({
      message: { type: 'open_new_tab', data: processedSVGs },
      url: 'getsvgs.html',
    });
  } catch (error) {
    console.error('Error processing SVGs:', error);
  }
};

// Helper functions
const processInlineSVGs = () => {
  return Array.from(document.querySelectorAll('svg'), processSVGNode);
};

const processExternalSVGs = async () => {
  const svgFiles = Array.from(document.querySelectorAll('img[src*=".svg"]'));
  const parser = new DOMParser();

  return Promise.all(
    svgFiles.map(async (file) => {
      try {
        const response = await fetch(file.src);
        const text = await response.text();
        const svgNode = parser.parseFromString(text, 'image/svg+xml')
          .children[0];
        return processSVGNode(svgNode);
      } catch (error) {
        console.error(`Error fetching SVG ${file.src}:`, error);
        return null;
      }
    })
  ).then((results) => results.filter(Boolean));
};

const processSVGNode = (node) => {
  const clonedNode = node.cloneNode(true);
  applyStrokeToChildren(clonedNode);
  ensureUniformRendering(clonedNode);
  return clonedNode;
};

const deduplicateSVGs = (svgs) => {
  const serializer = new XMLSerializer();
  const uniqueSVGStrings = new Set();

  for (const node of svgs) {
    const svgString = serializer.serializeToString(node);
    uniqueSVGStrings.add(svgString);
  }

  return Array.from(uniqueSVGStrings);
};

const optimizeSVG = (svgString) => {
  return svgString.replace(/>\s+</g, '><');
};

// Message listener
chrome.runtime.onMessage.addListener((request, sendResponse) => {
  const { message } = request;

  if (message === 'clicked_browser_action' || message === 'load_svgs') {
    processSVGs();
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // Allow async response
});
