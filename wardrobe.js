const collectionTitle = document.querySelector("#collection-title");

if (collectionTitle) {
  const requested = new URLSearchParams(window.location.search).get("aesthetic");
  const links = [...document.querySelectorAll(".aesthetics a")];
  const selectedLink = links.find(link => link.textContent === requested);
  const aesthetic = selectedLink?.textContent;

  (selectedLink ?? links[0]).setAttribute("aria-current", "page");
  if (aesthetic) {
    collectionTitle.textContent = aesthetic;
    for (const outfit of document.querySelectorAll("[data-aesthetics]")) {
      outfit.hidden = !outfit.dataset.aesthetics.split(",").includes(aesthetic);
    }
  }
}


const copyButton = document.querySelector("#copy-prompt");
copyButton?.addEventListener("click", async () => {
  const prompt = document.querySelector("#prompt-text");
  const status = document.querySelector("#copy-status");
  const text = [...prompt.querySelectorAll("p")].map(paragraph => paragraph.textContent).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Prompt copied.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(prompt);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Prompt selected. Use your device’s copy command.";
  }
});
