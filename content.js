chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const removeColor = (node) => {
        if (node.hasAttribute && node.hasAttribute('fill')) {
            node.setAttribute('fill', 'currentColor')
        }
        if (node.hasChildNodes()) {
            node.childNodes.forEach((child) => removeColor(child))
        }
        return node
    }

    const removeColorIfNecessary = (node) => {
        const colors = getColors(node)
        if (colors.length === 1) {
            console.log('REMOVING COLOR', colors[0])
            removeColor(node)
        } else {
            console.log('FOUND COLORS', colors)
        }
        return node
    }

    const getColors = (node) => {
        const colors = []
        if (node.hasAttribute && node.hasAttribute('fill')) {
            const color = node.getAttribute('fill').toLowerCase()
            if (color !== 'none' && color !== 'currentcolor') {
                colors.push(color)
            }
        }
        if (node.hasChildNodes()) {
            node.childNodes.forEach((child) => {
                const childColors = getColors(child)
                childColors.forEach((color) => {
                    if (!colors.includes(color)) {
                        colors.push(color)
                    }
                })
            })
        }
        return colors
    }

    const removeDimensions = (node) => {
        if (node.hasAttribute && node.hasAttribute('height')) {
            node.removeAttribute('height')
        }
        if (node.hasAttribute && node.hasAttribute('width')) {
            node.removeAttribute('width')
        }
        return node
    }

    if (request.message === 'clicked_browser_action') {
        const svgInlineCodes = Array.from(
            document.querySelectorAll('svg'),
            (e) => {
                const node = e.cloneNode(true)
                removeColorIfNecessary(node) // Check if there is stroke
                // removeDimensions(node);
                if (!node.hasAttribute('viewBox')) {
                    // const { width, height } = node.getBBox();
                    node.setAttribute('viewBox', `0 0 24 24`)
                }

                node.removeAttribute('style')
                node.childNodes.forEach((child) => {
                    child.removeAttribute('style')
                })
                return node
            }
        )

        // External SVG
        const svgFiles = Array.from(
            document.querySelectorAll('img[src*=".svg"]')
        )
        console.log(svgFiles)
        const parser = new DOMParser()

        const svgFilePromises = svgFiles.map((file) => {
            return fetch(file.src)
                .then((response) => response.text())
                .then(
                    (text) =>
                        parser.parseFromString(text, 'image/svg+xml')
                            .children[0]
                )
        })

        Promise.all(svgFilePromises).then((svgFileCodes) => {
            let svgCodes = svgInlineCodes.concat(svgFileCodes)
            const serializer = new XMLSerializer()
            svgCodes = svgCodes.map((node) => {
                // removeColorIfNecessary(node);
                return serializer.serializeToString(removeDimensions(node))
            })
            console.log(svgCodes)

            // Removes spaces
            svgCodes = svgCodes.map((item) => item.replace(/>\s+</g, '><'))

            // Removes duplicated svg's
            const svgCodesFinal = svgCodes.filter(
                (item, pos) => svgCodes.indexOf(item) === pos
            )

            chrome.runtime.sendMessage({
                message: { type: 'open_new_tab', data: svgCodesFinal },
                url: 'getsvgs.html',
            })
        })
    }

    // Allow async response
    return true
})
