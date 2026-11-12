const sidebar = document.querySelector(".aesthetics");
const searchInput = document.querySelector("#outfit-search");
const collectionTitle = document.querySelector("#collection-title");

if (sidebar) {
  const params = new URLSearchParams(window.location.search);
  const allLink = sidebar.querySelector("li:first-child a");
  const links = [...sidebar.querySelectorAll("li + li a")];
  const selectedLink = links.find(link => link.textContent === params.get("aesthetic"));
  const ranges = sidebar.querySelector(".letter-ranges");
  const groups = ["A-D", "E-H", "I-L", "M-P", "Q-T", "U-X", "Y-Z"]
    .map(label => ({
      label,
      links: links.filter(link => {
        const initial = link.textContent.trim()[0].toUpperCase();
        return initial >= label[0] && initial <= label[2];
      }),
    }));

  function showRange(activeGroup) {
    for (const group of groups) {
      const active = group === activeGroup;
      group.button.setAttribute("aria-pressed", String(active));
      for (const link of group.links) {
        link.closest("li").hidden = !active;
      }
    }
  }

  for (const group of groups) {
    group.button = document.createElement("button");
    group.button.type = "button";
    group.button.textContent = group.label.replace("-", "\u2013");
    group.button.disabled = group.links.length === 0;
    group.button.addEventListener("click", () => showRange(group));
    ranges.append(group.button);
  }
  if (links.length) {
    ranges.hidden = false;
    showRange(groups.find(group => group.links.includes(selectedLink)) ?? groups.find(group => group.links.length));
  }

  if (collectionTitle) {
    const aesthetic = selectedLink?.textContent;
    (selectedLink ?? allLink).setAttribute("aria-current", "page");
    if (aesthetic) collectionTitle.textContent = aesthetic;

    const status = document.querySelector("#search-status");
    const outfits = [...document.querySelectorAll("[data-aesthetics]")].map(card => ({
      card,
      aesthetics: card.dataset.aesthetics.split(","),
      searchable: [card.querySelector("h3").textContent, card.dataset.aesthetics, card.dataset.colors]
        .join(" ").toLowerCase(),
    }));
    const form = searchInput.form;
    form.elements.aesthetic.value = aesthetic ?? "";
    searchInput.value = params.get("q") ?? "";

    function showResults() {
      const query = searchInput.value.trim();
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      let visible = 0;
      for (const { card, aesthetics, searchable } of outfits) {
        card.hidden = Boolean(aesthetic && !aesthetics.includes(aesthetic))
          || !terms.every(term => searchable.includes(term));
        if (!card.hidden) visible++;
      }
      status.textContent = visible === 0 ? "No outfits found." : visible + (visible === 1 ? " outfit found" : " outfits found");

      for (const link of [allLink, ...links]) {
        const url = new URL(link.href);
        if (query) url.searchParams.set("q", query);
        else url.searchParams.delete("q");
        link.href = url.href;
      }
    }

    searchInput.addEventListener("input", showResults);
    showResults();
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
