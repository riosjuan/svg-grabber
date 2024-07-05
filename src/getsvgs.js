import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Function to set SVGs and update the page content
const setSvgsUrl = (data, sender, pageUrl) => {
    document.getElementById(
        'header'
    ).innerHTML = `All SVGs from &#8594; ${sender}`;
    const senderLink = document.getElementById('sender-url');
    senderLink.innerHTML = pageUrl.replace(/\/$/, '');
    senderLink.href = pageUrl;

    const svgContainer = document.getElementById('svgcard');
    svgContainer.innerHTML = ''; // Clear any existing SVG cards

    if (data.length === 0) {
        document.getElementById(
            'header'
        ).innerHTML = `No SVGs in &#8594; ${sender}`;
        document.getElementById('download-all').classList.add('hidden');
        const disclaimer = document.getElementsByClassName('disclaimer')[0];
        disclaimer.innerHTML =
            'It seems that this site does not use any SVGs. 🙃';
    } else {
        data.forEach((svg, index) => {
            const element = document.createElement('div');
            const base64doc = btoa(unescape(encodeURIComponent(svg)));
            element.innerHTML = `
        <div>
          ${svg}
        </div>
        <div class="actions">
          <button class='copy'>Copy</button>
          <a download="${sender}-${index}.svg" href='data:text/svg;base64,${base64doc}'>Download</a>
        </div>
      `;
            element.classList.add('svg-card');
            svgContainer.appendChild(element);
        });

        // Show the 'Download All' button if SVGs are present
        document.getElementById('download-all').classList.remove('hidden');
    }

    // Add event listeners for copy buttons
    document.querySelectorAll('button.copy').forEach((btn) => {
        btn.addEventListener('click', copySvg);
    });
};

// Function to copy SVG to clipboard
const copySvg = (event) => {
    const notification = document.querySelector('.notification');
    const svg = event.target.closest('.svg-card').querySelector('svg');

    navigator.clipboard
        .writeText(svg.outerHTML)
        .then(() => {
            notification.classList.remove('notification-off');
            notification.classList.add('notification-on');

            setTimeout(() => {
                notification.classList.remove('notification-on');
                notification.classList.add('notification-off');
            }, 1500);
        })
        .catch((err) => {
            console.error('Failed to copy text: ', err);
        });
};

// Set up 'Download All' button functionality
document.getElementById('download-all').addEventListener('click', () => {
    const zip = new JSZip();
    document.querySelectorAll('.svg-card svg').forEach((svg, index) => {
        zip.file(`svg${index}.svg`, svg.outerHTML);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'svgs_collection.zip');
    });
});

// Listen for incoming messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.message === 'load_svgs') {
        setSvgsUrl(message.data, message.sender, message.pageUrl);
    }
});
