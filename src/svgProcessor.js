// SVG processing functions

// Attribute modification functions
const convertDimensionsToViewBox = (svgNode) => {
  const width = svgNode.getAttribute('width');
  const height = svgNode.getAttribute('height');

  if (width && height && !svgNode.getAttribute('viewBox')) {
    svgNode.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgNode.removeAttribute('width');
    svgNode.removeAttribute('height');
  }
};

const removeClassAttribute = (svgNode) => {
  // Helper function to remove class attribute from a node
  const removeClass = (node) => node.removeAttribute('class');

  // Remove class attribute from the svgNode itself
  removeClass(svgNode);

  // Remove class attribute from all descendant nodes
  const descendants = svgNode.getElementsByTagName('*');
  Array.from(descendants).forEach(removeClass);
};

// SVG processing function
export const processSVGNode = (node) => {
  const clonedNode = node.cloneNode(true);
  convertDimensionsToViewBox(clonedNode);
  removeClassAttribute(clonedNode);
  return clonedNode;
};

// SVG optimization function
export const optimizeSVG = (svgString) => {
  return svgString.replace(/>\s+</g, '><');
};

// DOM-related SVG processing functions
export const processInlineSVGs = () => {
  try {
    const svgNodes = Array.from(
      document.querySelectorAll('svg'),
      processSVGNode
    );
    return removeDuplicateSVGs(svgNodes);
  } catch (error) {
    console.error('Error processing inline SVGs:', error);
    return [];
  }
};

export const processExternalSVGs = async () => {
  const imgElements = document.querySelectorAll('img[src$=".svg"]');
  const svgPromises = Array.from(imgElements).map(async (img) => {
    try {
      const response = await fetch(img.src);
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      return processSVGNode(svgDoc.documentElement);
    } catch (error) {
      console.error('Error processing external SVG:', error);
      return null;
    }
  });
  const svgNodes = (await Promise.all(svgPromises)).filter(Boolean);
  return removeDuplicateSVGs(svgNodes);
};

// Function to serialize an SVG node to a string
const serializeSVGNode = (svgNode) => {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgNode);
};

// Function to remove duplicate SVG nodes
const removeDuplicateSVGs = (svgNodes) => {
  const uniqueSVGs = [];
  const seenSVGs = new Set();

  svgNodes.forEach((svgNode) => {
    const serializedSVG = serializeSVGNode(svgNode);
    if (!seenSVGs.has(serializedSVG)) {
      seenSVGs.add(serializedSVG);
      uniqueSVGs.push(svgNode);
    }
  });

  return uniqueSVGs;
};
