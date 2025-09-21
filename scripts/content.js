let totalFilteredPosts = 0;
let blacklist = [];
let filterEnabled = true; // default

// Helper function to filter a single element
function filterElement(el) {
  if (!filterEnabled) return; // Do nothing if filter is off
  if (!(el instanceof HTMLElement)) return;

  const content1 = el.querySelector("a")?.textContent.trim() || "";
  const content2 = el.querySelector(".mrg--tt")?.textContent.trim() || "";
  const content = content1 + " " + content2;

  for (let word of blacklist) {
    if (content.toLowerCase().includes(word)) {
      const row = el.closest("tr") || el;
      row.remove();
      totalFilteredPosts++;
      updateCounter();
      break;
    }
  }
}

// Filter all current posts on the page
function filterAllExistingPosts() {
  if (!filterEnabled) return; // skip if filter is off
  const rows = document.querySelectorAll(
    "body > div.wrapper.hsoub-container > div > div.page-body > div > div.row > div.col-md-9.collection-browse--panel > div > table > tbody > tr"
  );
  rows.forEach(filterElement);
}

// Create and update counter
let counterDiv;
function createCounter() {
  const panel = document.querySelector(
    "body > div.wrapper.hsoub-container > div > div.page-body > div > div.row > div.col-md-9.collection-browse--panel"
  );

  if (!panel) return;

  counterDiv = document.createElement("div");
  counterDiv.style.padding = "10px";
  counterDiv.style.marginBottom = "10px";
  counterDiv.style.backgroundColor = "#f8d7da"; // light red
  counterDiv.style.color = "#721c24"; // dark red text
  counterDiv.style.border = "1px solid #f5c6cb";
  counterDiv.style.borderRadius = "5px";
  counterDiv.style.fontWeight = "bold";
  counterDiv.textContent = `Removed posts: 0`;
  counterDiv.setAttribute("dir", "ltr");

  panel.prepend(counterDiv); // Insert at top of panel
}

function updateCounter() {
  if (counterDiv) {
    counterDiv.textContent = `Removed posts: ${totalFilteredPosts}`;
  }
}

// Observe new posts being added
function observeNewPosts() {
  const target = document.querySelector(
    "body > div.wrapper.hsoub-container > div > div.page-body > div > div.row > div.col-md-9.collection-browse--panel > div > table > tbody"
  );

  if (!target) return;

  const observer = new MutationObserver((mutations) => {
    totalFilteredPosts = 0;
    if (!filterEnabled) return; // skip if filter is off
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(filterElement);
    }
  });

  observer.observe(target, { childList: true });
}

// Load blacklist and filter status from storage
function loadSettings(callback) {
  chrome.storage.local.get({ blacklist: [], filterEnabled: true }, (data) => {
    blacklist = data.blacklist;
    filterEnabled = data.filterEnabled;

    // Reset counter when loading settings
    totalFilteredPosts = 0;
    updateCounter();

    if (filterEnabled) {
      filterAllExistingPosts(); // Apply filter immediately if enabled
    }

    if (callback) callback();
  });
}

// Listen for storage changes (real-time updates)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    let shouldReset = false;

    if (changes.blacklist) {
      blacklist = changes.blacklist.newValue;
      if (filterEnabled) shouldReset = true;
    }
    if (changes.filterEnabled) {
      filterEnabled = changes.filterEnabled.newValue;
      shouldReset = true;

      if (!filterEnabled) {
        // Filter turned off → reload page to restore all posts
        window.location.reload();
        return;
      }
    }

    // Reset counter when filter is toggled or list changes
    totalFilteredPosts = 0;
    updateCounter();

    if (filterEnabled && shouldReset) {
      filterAllExistingPosts(); // Apply filter immediately
    }
  }
});

// Initial setup
createCounter();
loadSettings(observeNewPosts);
