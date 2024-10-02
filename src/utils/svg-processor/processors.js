import { isSVGElement, hasUseElement, ERROR_NOT_SVG_ELEMENT } from './checkers';
import { serializeSVGNode } from './helpers';
import {
  convertDimensionsToViewBox,
  removeStyleAttribute,
  removeClassAttribute,
  updateSVGFillColors,
} from './modifiers';

export const removeDuplicateSVGs = (svgNodes) => {
  if (!Array.isArray(svgNodes)) {
    console.error('Input is not an array');
    return [];
  }

  const seenSVGs = new Set();

  return svgNodes.reduce((uniqueSVGs, svgNode) => {
    if (!(svgNode instanceof SVGElement)) return uniqueSVGs;

    const serializedSVG = serializeSVGNode(svgNode);
    if (!serializedSVG || seenSVGs.has(serializedSVG)) return uniqueSVGs;

    seenSVGs.add(serializedSVG);
    uniqueSVGs.push(svgNode);
    return uniqueSVGs;
  }, []);
};

const processSVGNode = (node) => {
  try {
    isSVGElement(node);
    if (hasUseElement(node)) {
      return null; // Skip SVGs with <use> elements
    }
    const clonedNode = node.cloneNode(true);
    convertDimensionsToViewBox(clonedNode);
    removeClassAttribute(clonedNode);
    removeStyleAttribute(clonedNode);
    updateSVGFillColors(clonedNode);
    return clonedNode;
  } catch (error) {
    console.error('Error processing SVG node:', error);
    return null;
  }
};

export const processInlineSVGs = () => {
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

export const processExternalSVGs = async () => {
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
    console.error('Error processing external SVGs:', error);
    return [];
  }
};
