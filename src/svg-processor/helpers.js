import { isSVGElement } from './checkers';

export const serializeSVGNode = (svgNode) => {
  isSVGElement(svgNode);
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgNode);
};

export const optimizeSVG = (svgString) => {
  if (typeof svgString !== 'string') {
    console.error('optimizeSVG: Input is not a string');
    return svgString;
  }
  return svgString.replace(/\s*(<|>)/g, '$1'); // Remove all whitespace
};
