import { isSVGElement } from './checkers';

export const updateSVGFillColors = (svgNode) => {
  try {
    isSVGElement(svgNode);
    const pathElements = svgNode.querySelectorAll('path');
    if (pathElements.length === 0) {
      return false; // No path elements found
    }

    let allWhite = true;

    const isWhite = (color) => {
      return /^(#fff(?:fff)?|white)$/i.test(color);
    };

    pathElements.forEach((pathElement) => {
      const fillAttribute = pathElement.getAttribute('fill');

      if (!fillAttribute || !isWhite(fillAttribute)) {
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

export const convertDimensionsToViewBox = (svgNode) => {
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

export const removeClassAttribute = (svgNode) => {
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

export const removeStyleAttribute = (svgNode) => {
  try {
    isSVGElement(svgNode);
    svgNode.removeAttribute('style');
  } catch (error) {
    console.error('Error removing style attribute:', error);
  }
};
