const button = document.getElementById("download");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
  button.disabled = true;
  status.textContent = "Collecting images...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) {
      throw new Error("No active tab found.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectImageSrcs
    });

    const srcs = results?.[0]?.result || [];

    if (srcs.length === 0) {
      status.textContent = "No img src URLs found.";
      return;
    }

    status.textContent = `Downloading ${srcs.length} image(s)...`;

    for (let i = 0; i < srcs.length; i++) {
      const url = srcs[i];

      await chrome.downloads.download({
        url,
        filename: `page-images/image-${String(i + 1).padStart(3, "0")}${guessExtension(url)}`,
        conflictAction: "uniquify",
        saveAs: false
      });
    }

    status.textContent = `Started ${srcs.length} download(s).`;
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

function collectImageSrcs() {
  return [...document.querySelectorAll("img")]
    .map(img => img.src)
    .filter(Boolean)
    .filter(src => src.startsWith("http://") || src.startsWith("https://"))
    .filter((src, index, array) => array.indexOf(src) === index);
}

function guessExtension(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();

    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".webp")) return ".webp";
    if (pathname.endsWith(".gif")) return ".gif";
    if (pathname.endsWith(".svg")) return ".svg";
    if (pathname.endsWith(".avif")) return ".avif";
  } catch {
    // Ignore malformed URLs.
  }

  return ".img";
}