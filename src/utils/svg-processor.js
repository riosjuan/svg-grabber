const ERROR_NOT_SVG_ELEMENT = 'Input is not an SVG element';
const ERROR_PROCESSING_EXTERNAL_SVG = 'Error processing external SVGs:';

// Helper functions

const isSVGElement = (node) => {
  if (!(node instanceof SVGElement)) {
    throw new Error(ERROR_NOT_SVG_ELEMENT);
  }
};

const serializeSVGNode = (svgNode) => {
  isSVGElement(svgNode);
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgNode);
};

const optimizeSVG = (svgString) => {
  if (typeof svgString !== 'string') {
    console.error('optimizeSVG: Input is not a string');
    return svgString;
  }
  return svgString.replace(/>\s+</g, '><');
};

// SVG checking functions

const hasUseElement = (svgNode) => {
  try {
    isSVGElement(svgNode);
    return svgNode.querySelector('use') !== null;
  } catch (error) {
    console.error('Error checking for <use> element:', error);
    return false;
  }
};

const checkAndModifyPathSVG = (svgNode) => {
  try {
    isSVGElement(svgNode);
    const pathElements = svgNode.querySelectorAll('path');
    if (pathElements.length === 0) {
      return false; // No path elements found
    }

    let allWhite = true;
    pathElements.forEach((pathElement) => {
      const fillAttribute = pathElement.getAttribute('fill');
      if (
        !fillAttribute ||
        !/^(?:#(?:fff|FFF|ffffff|FFFFFF)|(?:white|White|WHITE))$/i.test(
          fillAttribute
        )
      ) {
        allWhite = false;
      }
    });

    if (allWhite) {
      pathElements.forEach((pathElement) => {
        pathElement.setAttribute('fill', 'currentColor');
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking and modifying path SVG:', error);
    return false;
  }
};

// SVG attribute modification functions

const convertDimensionsToViewBox = (svgNode) => {
  try {
    isSVGElement(svgNode);
    const width = svgNode.getAttribute('width');
    const height = svgNode.getAttribute('height');
    if (width && height && !svgNode.getAttribute('viewBox')) {
      svgNode.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svgNode.removeAttribute('width');
      svgNode.removeAttribute('height');
    }
  } catch (error) {
    console.error('Error converting dimensions to viewBox:', error);
  }
};

const removeClassAttribute = (svgNode) => {
  try {
    isSVGElement(svgNode);
    const removeClass = (node) => node.removeAttribute('class');
    removeClass(svgNode);
    const descendants = svgNode.getElementsByTagName('*');
    Array.from(descendants).forEach(removeClass);
  } catch (error) {
    console.error('Error removing class attributes:', error);
  }
};

// SVG processing functions

const processSVGNode = (node) => {
  try {
    isSVGElement(node);
    if (hasUseElement(node)) {
      return null; // Skip SVGs with <use> elements
    }
    const clonedNode = node.cloneNode(true);
    convertDimensionsToViewBox(clonedNode);
    removeClassAttribute(clonedNode);
    checkAndModifyPathSVG(clonedNode);
    return clonedNode;
  } catch (error) {
    console.error('Error processing SVG node:', error);
    return null;
  }
};

const removeDuplicateSVGs = (svgNodes) => {
  try {
    if (!Array.isArray(svgNodes)) {
      throw new Error('Input is not an array');
    }
    const uniqueSVGs = [];
    const seenSVGs = new Set();
    svgNodes.forEach((svgNode) => {
      if (svgNode && svgNode instanceof SVGElement) {
        const serializedSVG = serializeSVGNode(svgNode);
        if (serializedSVG && !seenSVGs.has(serializedSVG)) {
          seenSVGs.add(serializedSVG);
          uniqueSVGs.push(svgNode);
        }
      }
    });
    return uniqueSVGs;
  } catch (error) {
    console.error('Error removing duplicate SVGs:', error);
    return [];
  }
};

// DOM-related SVG processing functions

const processInlineSVGs = () => {
  try {
    const svgNodes = Array.from(
      document.querySelectorAll('svg'),
      processSVGNode
    ).filter(Boolean);
    return removeDuplicateSVGs(svgNodes);
  } catch (error) {
    console.error('Error processing inline SVGs:', error);
    return [];
  }
};

const processExternalSVGs = async () => {
  try {
    const imgElements = document.querySelectorAll('img[src$=".svg"]');
    const svgPromises = Array.from(imgElements).map(async (img) => {
      try {
        const response = await fetch(img.src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        if (svgDoc.documentElement.tagName === 'parsererror') {
          throw new Error('SVG parsing error');
        }
        return processSVGNode(svgDoc.documentElement);
      } catch (error) {
        console.error(ERROR_NOT_SVG_ELEMENT, error);
        return null;
      }
    });
    const svgNodes = (await Promise.all(svgPromises)).filter(Boolean);
    return removeDuplicateSVGs(svgNodes);
  } catch (error) {
    console.error(ERROR_PROCESSING_EXTERNAL_SVG, error);
    return [];
  }
};

export { optimizeSVG, processInlineSVGs, processExternalSVGs };
