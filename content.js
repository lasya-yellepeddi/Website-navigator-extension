let matches = [];
let currentIndex = -1;

// Function to highlight all matches
function highlightFeature(feature) {
    clearHighlights();

    const regex = new RegExp(feature, "gi");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (regex.test(node.nodeValue)) {
            const span = document.createElement("span");
            span.innerHTML = node.nodeValue.replace(regex, (match) => {
                return `<mark class="navigator-highlight">${match}</mark>`;
            });
            node.parentNode.replaceChild(span, node);
        }
    }

    matches = Array.from(document.querySelectorAll(".navigator-highlight"));
    if (matches.length > 0) {
        currentIndex = 0;
        focusMatch(currentIndex);
    }
}

// Function to clear all highlights
function clearHighlights() {
    matches.forEach((el) => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
    matches = [];
    currentIndex = -1;
}

// Function to focus a specific match
function focusMatch(index) {
    matches.forEach((el, i) => {
        el.style.backgroundColor = i === index ? "orange" : "yellow";
    });
    matches[index].scrollIntoView({ behavior: "smooth", block: "center" });
}

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "checkFeature") {
        const regex = new RegExp(req.feature, "i");
        const found = regex.test(document.body.innerText);
        sendResponse({ found });
    }

    if (req.type === "highlightFeature") {
        highlightFeature(req.feature);
        sendResponse({ done: true });
    }

    if (req.type === "clearHighlights") {
        clearHighlights();
        sendResponse({ cleared: true });
    }

    if (req.type === "nextMatch") {
        if (matches.length > 0) {
            currentIndex = (currentIndex + 1) % matches.length;
            focusMatch(currentIndex);
        }
    }

    if (req.type === "prevMatch") {
        if (matches.length > 0) {
            currentIndex = (currentIndex - 1 + matches.length) % matches.length;
            focusMatch(currentIndex);
        }
    }

    if (req.type === "getMatchInfo") {
        sendResponse({
            current: currentIndex,
            total: matches.length
        });
    }
});
