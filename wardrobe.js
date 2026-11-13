const sidebar = document.querySelector(".aesthetics");
const collectionTitle = document.querySelector("#collection-title");

if (sidebar) {
  const params = new URLSearchParams(window.location.search);
  const [allLink, ...links] = sidebar.querySelectorAll("li a");
  const selectedLink = links.find(link => link.textContent === params.get("aesthetic"));
  const aesthetic = selectedLink?.textContent ?? "";
  const initial = link => link.textContent.trim()[0].toUpperCase();
  const letterSelect = sidebar.querySelector("#aesthetic-letter");
  const letters = [...new Set(links.map(initial))].sort();

  for (const letter of letters) {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    letterSelect.append(option);
  }
  letterSelect.value = selectedLink ? initial(selectedLink) : letters[0] ?? "";
  function showLetter() {
    for (const link of links) {
      link.closest("li").hidden = Boolean(letterSelect.value && initial(link) !== letterSelect.value);
    }
  }
  letterSelect.addEventListener("change", showLetter);
  letterSelect.closest(".aesthetic-letter").hidden = false;
  showLetter();

  if (collectionTitle) {
    (selectedLink ?? allLink).setAttribute("aria-current", "page");
    if (aesthetic) collectionTitle.textContent = aesthetic;

    const search = sidebar.querySelector("#outfit-search");
    const gender = sidebar.querySelector("#outfit-gender");
    const status = document.querySelector("#search-status");
    const pagination = document.querySelector(".pagination");
    const previous = pagination.querySelector(".previous-page");
    const next = pagination.querySelector(".next-page");
    const pageLabel = pagination.querySelector(".page-label");
    const pageSize = 10;
    const requestedPage = Number(params.get("page"));
    const outfits = [...document.querySelectorAll(".gallery .card")].map(card => ({
      card,
      aesthetics: card.dataset.aesthetics.split(","),
      gender: card.dataset.gender,
      searchable: [card.querySelector("h3").textContent, card.dataset.aesthetics, card.dataset.colors]
        .join(" ").toLowerCase(),
    }));

    search.form.elements.aesthetic.value = aesthetic;
    search.value = params.get("q") ?? "";
    gender.value = ["male", "female"].includes(params.get("gender")) ? params.get("gender") : "";

    function browseUrl(style, page = 1) {
      const url = new URL("browse.html", window.location.href);
      if (style) url.searchParams.set("aesthetic", style);
      if (search.value.trim()) url.searchParams.set("q", search.value.trim());
      if (gender.value) url.searchParams.set("gender", gender.value);
      if (page > 1) url.searchParams.set("page", page);
      return url.href;
    }

    function showResults(requested = 1) {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matches = outfits.filter(outfit =>
        (!aesthetic || outfit.aesthetics.includes(aesthetic))
        && (!gender.value || outfit.gender === gender.value)
        && terms.every(term => outfit.searchable.includes(term))
      );
      const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
      const page = Math.min(pageCount, Math.max(1, requested));
      const offset = (page - 1) * pageSize;
      const visible = new Set(matches.slice(offset, offset + pageSize));
      for (const outfit of outfits) outfit.card.hidden = !visible.has(outfit);

      status.textContent = matches.length
        ? `Showing ${offset + 1}–${offset + visible.size} of ${matches.length} outfits`
        : "No outfits found.";
      pagination.hidden = pageCount <= 1;
      pageLabel.textContent = `Page ${page} of ${pageCount}`;
      previous.hidden = page === 1;
      previous.href = browseUrl(aesthetic, page - 1);
      next.hidden = page === pageCount;
      next.href = browseUrl(aesthetic, page + 1);
      allLink.href = browseUrl("");
      for (const link of links) link.href = browseUrl(link.textContent);
    }

    search.addEventListener("input", () => showResults());
    gender.addEventListener("change", () => showResults());
    showResults(Number.isSafeInteger(requestedPage) ? requestedPage : 1);
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
