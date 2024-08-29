// Initialize a counter for generating unique IDs for new tabs.
// Starting at 100 to avoid potential conflicts with lower numbers.
let id = 100;

// Listen for clicks on the browser action
chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.sendMessage(tab.id, {
    message: 'clicked_browser_action',
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message.type === 'open_new_tab') {
    (async () => {
      const viewTabUrl = chrome.runtime.getURL(`getsvgs.html?id=${id++}`);
      const data = request.message.data;
      const title = sender.tab.title || sender.tab.url;
      const pageUrl = sender.tab.url;

      try {
        const newTab = await chrome.tabs.create({ url: viewTabUrl });
        const targetId = newTab.id;

        // Wait for the tab to be fully loaded
        await new Promise((resolve) => {
          const listener = (tabId, changeInfo) => {
            if (tabId === targetId && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });

        // Add a small delay to ensure content script is ready
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Retry mechanism for sending message
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
          try {
            await chrome.tabs.sendMessage(targetId, {
              message: 'load_svgs',
              data: data,
              sender: title,
              pageUrl: pageUrl,
            });
            console.log('Message sent successfully');
            sendResponse({ success: true });
            return;
          } catch (error) {
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
          }
        }
      } catch (err) {
        console.error('Failed to open new tab or send message: ', err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // Indicates that the response is asynchronous
  }
  return false; // For other message types, we're not sending a response
});
