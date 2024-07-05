let id = 100;

// Listen for clicks on the browser action
chrome.action.onClicked.addListener(async (tab) => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  chrome.tabs.sendMessage(activeTab.id, {
    message: 'clicked_browser_action',
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message.type === 'open_new_tab') {
    const viewTabUrl = chrome.runtime.getURL(`getsvgs.html?id=${id++}`);
    let targetId = null;

    const data = request.message.data;
    const title = sender.tab.title || sender.tab.url;
    const pageUrl = sender.tab.url;

    chrome.tabs.create({ url: viewTabUrl }, (tab) => {
      targetId = tab.id;

      // Listener to send message to the newly created tab
      const listener = async (tabId, changeInfo) => {
        if (tabId === targetId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);

          try {
            await chrome.tabs.sendMessage(targetId, {
              message: 'load_svgs',
              data: data,
              sender: title,
              pageUrl: pageUrl,
            });
            sendResponse({ success: true }); // Ensure sendResponse is called
          } catch (err) {
            console.error('Failed to send message: ', err);
            sendResponse({ error: err.message });
          }
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });

    // Indicate that we'll respond asynchronously
    setTimeout(() => {}, 1000); // Delay to keep the message channel open
    return true;
  }

  // For other cases where no async response is needed, call sendResponse immediately
  sendResponse();
});
