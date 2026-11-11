const filters = [...document.querySelectorAll("[data-filter]")];
const outfits = [...document.querySelectorAll("[data-aesthetics]")];
const filterStatus = document.querySelector("#filter-status");

for (const filter of filters) {
  filter.addEventListener("click", () => {
    const aesthetic = filter.dataset.filter;
    for (const button of filters) {
      button.setAttribute("aria-pressed", String(button === filter));
    }
    for (const outfit of outfits) {
      outfit.hidden = aesthetic !== "all" && !outfit.dataset.aesthetics.split(",").includes(aesthetic);
    }
    const count = outfits.filter(outfit => !outfit.hidden).length;
    filterStatus.textContent = count === 1 ? "1 outfit shown." : `${count} outfits shown.`;
  });
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
