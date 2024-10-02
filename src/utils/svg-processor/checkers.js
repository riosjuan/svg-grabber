export const ERROR_NOT_SVG_ELEMENT = 'Input is not an SVG element';

export const isSVGElement = (node) => {
  if (!(node instanceof SVGElement)) {
    throw new Error(ERROR_NOT_SVG_ELEMENT);
  }
};

export const hasUseElement = (node) => {
  try {
    isSVGElement(node);
    return node.querySelector('use') !== null;
  } catch (error) {
    console.warn('Input is not a valid SVG element:', error.message);
    return false;
  }
};
