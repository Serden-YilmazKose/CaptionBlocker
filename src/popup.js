document.getElementById("block").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // TODO: Remove the following line, if possible
  chrome.tabs.sendMessage(tab.id, { action: "block" }, (response) => {
  //   const resultContainer = document.getElementById("results");

  //   if (!response) {
  //     resultContainer.innerText = "Unable to analyze this page.";
  //     return;
  //   }

  //   const { title, description, headings, linkCount, domain } = response;
  //   resultContainer.innerHTML = `
  //     <strong>Domain:</strong> ${domain}<br/>
  //     <strong>Title:</strong> ${title}<br/>
  //     <strong>Description:</strong> ${description}<br/>
  //     <strong>Headings:</strong> ${
  //       headings.length ? headings.join(", ") : "No headings found"
  //     }<br/>
  //     <strong>Links:</strong> ${linkCount}
  //   `;
  });
});

document.getElementById("drawBlocker").addEventListener("click", async () => {
  // TODO: Remove the following line, if possible
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "drawBlocker" }, (response) => {
  });
});

document.getElementById("removeBlocker").addEventListener("click", async () => {
  // TODO: Remove the following line, if possible
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "removeBlocker" }, (response) => {
  });
});
