const wordInput = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const blacklistEl = document.getElementById("blacklist");

// Load blacklist from storage
function loadBlacklist() {
  chrome.storage.local.get({ blacklist: [] }, (data) => {
    blacklistEl.innerHTML = "";

    data.blacklist.forEach((word, index) => {
      const li = document.createElement("li");
      li.textContent = word;

      // Remove word on li click
      li.addEventListener("click", () => removeWord(index));

      blacklistEl.appendChild(li);
    });
  });
}

// Add a new word
function addWord() {
  const newWord = wordInput.value.trim().toLowerCase();
  if (!newWord) return;

  chrome.storage.local.get({ blacklist: [] }, (data) => {
    if (!data.blacklist.includes(newWord)) {
      data.blacklist.push(newWord);
      chrome.storage.local.set({ blacklist: data.blacklist }, loadBlacklist);
    }
  });

  wordInput.value = "";
  wordInput.focus();
}

// Remove a word by index
function removeWord(index) {
  chrome.storage.local.get({ blacklist: [] }, (data) => {
    data.blacklist.splice(index, 1);
    chrome.storage.local.set({ blacklist: data.blacklist }, loadBlacklist);
  });
}

// Event listeners
addBtn.addEventListener("click", addWord);
wordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addWord();
  }
});

// Initial load
loadBlacklist();
