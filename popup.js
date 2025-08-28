// Handle "Help Me" button
document.getElementById("helpBtn").addEventListener("click", () => {
    const feature = document.getElementById("featureInput").value.trim();
    const responseArea = document.getElementById("responseArea");

    if (!feature) {
        responseArea.textContent = "Please enter a feature name.";
        return;
    }

    // Show typing animation
    responseArea.innerHTML = `<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.tabs.sendMessage(tabId, { type: "checkFeature", feature }, (response) => {
            if (chrome.runtime.lastError || !response) {
                responseArea.innerHTML = `<div class="chat-bubble">⚠️ Couldn't check the page. Please try again.</div>`;
                return;
            }

            setTimeout(() => {
                if (response.found) {
                    chrome.tabs.sendMessage(tabId, { type: "highlightFeature", feature }, () => {
                        updateMatchCounter();
                    });
                    responseArea.innerHTML = `<div class="chat-bubble">✅ Found and highlighted "${feature}" on the page.</div>`;
                } else {
                    responseArea.innerHTML = `<div class="chat-bubble">❌ Couldn't find "${feature}" on this page.</div>`;
                    document.getElementById("matchCounter").textContent = "";
                }
            }, 600); // simulate "thinking"
        });
    });
});

// Handle "Clear" button
document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "clearHighlights" }, () => {
            document.getElementById("matchCounter").textContent = "";
            document.getElementById("responseArea").innerHTML =
                `<div class="chat-bubble">🧹 Highlights cleared.</div>`;
        });
    });
});

// Handle "Next" button
document.getElementById("nextBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "nextMatch" }, () => {
            updateMatchCounter();
        });
    });
});

// Handle "Prev" button
document.getElementById("prevBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "prevMatch" }, () => {
            updateMatchCounter();
        });
    });
});

// Update counter display
function updateMatchCounter() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getMatchInfo" }, (response) => {
            if (chrome.runtime.lastError || !response) {
                document.getElementById("matchCounter").textContent = "";
                return;
            }
            if (response.total > 0) {
                document.getElementById("matchCounter").textContent =
                    `Match ${response.current + 1} of ${response.total}`;
            } else {
                document.getElementById("matchCounter").textContent = "";
            }
        });
    });
}
