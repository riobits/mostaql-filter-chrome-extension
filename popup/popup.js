const wordInput = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const blacklistEl = document.getElementById("blacklist");
const filterToggle = document.getElementById("filterToggle");

// Load blacklist and filter status from storage
function loadSettings() {
  chrome.storage.local.get({ blacklist: [], filterEnabled: true }, (data) => {
    // Load blacklist
    blacklistEl.innerHTML = "";
    data.blacklist.forEach((word, index) => {
      const li = document.createElement("li");
      li.textContent = word;
      li.addEventListener("click", () => removeWord(index));
      blacklistEl.appendChild(li);
    });

    // Load filter status
    filterToggle.checked = data.filterEnabled;
    updateFilterState();
  });
}

// Add a new word
function addWord() {
  const newWord = wordInput.value.trim().toLowerCase();
  if (!newWord) return;

  chrome.storage.local.get({ blacklist: [] }, (data) => {
    if (!data.blacklist.includes(newWord)) {
      data.blacklist.push(newWord);
      chrome.storage.local.set({ blacklist: data.blacklist }, loadSettings);
    }
  });

  wordInput.value = "";
  wordInput.focus();
}

// Remove a word by index
function removeWord(index) {
  chrome.storage.local.get({ blacklist: [] }, (data) => {
    data.blacklist.splice(index, 1);
    chrome.storage.local.set({ blacklist: data.blacklist }, loadSettings);
  });
}

// Update UI and save filter status
function updateFilterState() {
  const enabled = filterToggle.checked;
  // Update label next to the toggle
  filterToggle.parentElement.nextElementSibling.textContent = enabled
    ? "Filter Enabled"
    : "Filter Disabled";

  wordInput.disabled = !enabled;
  addBtn.disabled = !enabled;

  chrome.storage.local.set({ filterEnabled: enabled });
}

// Event listeners
addBtn.addEventListener("click", addWord);
wordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addWord();
  }
});

filterToggle.addEventListener("change", updateFilterState);

// Initial load
loadSettings();
