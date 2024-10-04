import { optimizeSVG, processExternalSVGs, processInlineSVGs } from './utils';

// Main function to process SVGs
const processSVGs = async () => {
  try {
    // Process inline and external SVGs concurrently
    const [inlineSVGs, externalSVGs] = await Promise.all([
      processInlineSVGs(),
      processExternalSVGs(),
    ]);

    // Combine and process all SVGs
    const allSVGs = [...inlineSVGs, ...externalSVGs];
    const processedSVGs = allSVGs.map((svg) => optimizeSVG(svg.outerHTML));

    console.log('Processed SVG codes:', processedSVGs);

    // Send message to background script
    chrome.runtime.sendMessage({
      message: { type: 'open_new_tab', data: processedSVGs },
      url: 'svg-grabber.html',
    });
  } catch (error) {
    console.error('Error processing SVGs:', error);
  }
};

// Call processSVGs immediately when the script is injected
processSVGs();
