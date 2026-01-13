export const ERROR_NOT_SVG_ELEMENT = 'Input is not an SVG element';

export const isSVGElement = (node) => {
  const isSvgElement =
    node instanceof SVGElement ||
    (node && node.nodeType === 1 && node.namespaceURI === 'http://www.w3.org/2000/svg');
  if (!isSvgElement) {
    throw new Error(ERROR_NOT_SVG_ELEMENT);
  }
};

export const hasUseElement = (node) => {
  try {
    isSVGElement(node);
    const useElement = node.querySelector('use');
    return useElement !== null;
  } catch (error) {
    console.warn('Input is not a valid SVG element:', error.message);
    return false;
  }
};
