if (typeof browser === "undefined") {
  // Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

browser.runtime.onInstalled.addListener(() => {
  // browser.tabs.create({ url: "https://mozilla.org", active: false });
  console.log("onIntalled Listener. ");
});

// navigation.addEventListener("navigate", (event) => {
//   console.log("URL CHANGE");
//   // Exit early if this navigation shouldn't be intercepted,
//   // e.g. if the navigation is cross-origin, or a download request
//   if (shouldNotIntercept(event)) {
//     return;
//   }

//   const url = new URL(event.destination.url);

//   if (url.pathname.startsWith("/articles/")) {
//     event.intercept({
//       async handler() {
//         // The URL has already changed, so show a placeholder while
//         // fetching the new content, such as a spinner or loading page
//         renderArticlePagePlaceholder();

//         // Fetch the new content and display when ready
//         const articleContent = await getArticleContent(url.pathname);
//         renderArticlePage(articleContent);
//       },
//     });
//   }
// });
