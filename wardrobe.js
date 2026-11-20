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
    const styleSelect = sidebar.querySelector("#prompt-style");
    const color = sidebar.querySelector("#outfit-color");
    const sort = document.querySelector("#outfit-sort");
    const pagePicker = document.querySelector("#outfit-page");
    const gallery = document.querySelector(".collection .gallery");
    const status = document.querySelector("#search-status");
    const pagination = document.querySelector(".pagination");
    const previous = pagination.querySelector(".previous-page");
    const next = pagination.querySelector(".next-page");
    const pageLabel = pagination.querySelector(".page-total");
    const pageSize = 10;
    const requestedPage = Number(params.get("page"));
    const outfits = [...document.querySelectorAll(".gallery .card")].map((card, order) => ({
      order,
      title: card.querySelector("h3").textContent,
      style: card.dataset.promptStyle,
      colors: card.dataset.colors.toLowerCase().split(","),
      card,
      aesthetics: card.dataset.aesthetics.split(","),
      gender: card.dataset.gender,
      searchable: [card.querySelector("h3").textContent, card.dataset.aesthetics, card.dataset.colors]
        .join(" ").toLowerCase(),
    }));

    search.form.elements.aesthetic.value = aesthetic;
    search.value = params.get("q") ?? "";
    gender.value = ["male", "female"].includes(params.get("gender")) ? params.get("gender") : "";

    for (const control of [styleSelect, color, sort]) {
      const value = params.get(control.name);
      if ([...control.options].some(option => option.value === value)) control.value = value;
    }

    const alphabetical = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

    function browseUrl(style, page = 1) {
      const url = new URL("browse.html", window.location.href);
      if (style) url.searchParams.set("aesthetic", style);
      if (search.value.trim()) url.searchParams.set("q", search.value.trim());
      if (gender.value) url.searchParams.set("gender", gender.value);
      if (styleSelect.value) url.searchParams.set("style", styleSelect.value);
      if (color.value) url.searchParams.set("color", color.value);
      if (sort.value !== "oldest") url.searchParams.set("sort", sort.value);
      if (page > 1) url.searchParams.set("page", page);
      return url.href;
    }

    function showResults(requested = 1) {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matches = outfits.filter(outfit =>
        (!aesthetic || outfit.aesthetics.includes(aesthetic))
        && (!gender.value || outfit.gender === gender.value)
        && (!styleSelect.value || outfit.style === styleSelect.value)
        && (!color.value || outfit.colors.includes(color.value))
        && terms.every(term => outfit.searchable.includes(term))
      );
      matches.sort((a, b) => {
        if (sort.value === "alphabetical") return alphabetical.compare(a.title, b.title) || a.order - b.order;
        return sort.value === "newest" ? b.order - a.order : a.order - b.order;
      });
      const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
      const page = Math.min(pageCount, Math.max(1, requested));
      const offset = (page - 1) * pageSize;
      const visible = new Set(matches.slice(offset, offset + pageSize));
      for (const outfit of outfits) outfit.card.hidden = !visible.has(outfit);
      for (const outfit of visible) gallery.append(outfit.card);

      status.textContent = matches.length
        ? `Showing ${offset + 1}–${offset + visible.size} of ${matches.length} outfits`
        : "No outfits found.";
      pagination.hidden = pageCount <= 1;
      pagePicker.replaceChildren();
      for (let index = 1; index <= pageCount; index++) {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = index;
        pagePicker.append(option);
      }
      pagePicker.value = page;
      pageLabel.textContent = "of " + pageCount;
      previous.hidden = page === 1;
      previous.href = browseUrl(aesthetic, page - 1);
      next.hidden = page === pageCount;
      next.href = browseUrl(aesthetic, page + 1);
      allLink.href = browseUrl("");
      for (const link of links) link.href = browseUrl(link.textContent);
    }

    search.addEventListener("input", () => showResults());
    for (const control of [gender, styleSelect, color, sort]) {
      control.addEventListener("change", () => showResults());
    }
    pagePicker.addEventListener("change", () => window.location.assign(browseUrl(aesthetic, Number(pagePicker.value))));
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

const characterData = [{"name": "Asher", "gender": "male", "species": "Half-Dragon/Half-Human", "variants": [["Season 1", "Asher Season 1.png", "Red", "Blue", "The man with short dark red hair with dark red sideburns muttonchops in a low ponytail. He has blue eyes, gold dragon horns, and pointy ears. He has muscles. He has a red dragon scales on his body.", "He wears a black undershirt, black pants, black boots, and red jacket with gold shoulder armor."], ["Season 2", "Asher Season 2.png", "Red", "Blue", "The man with short dark red hair with dark red sideburns muttonchops in a low ponytail. He has blue eyes, gold dragon horns, and pointy ears. He has muscles.", "He wears a black undershirt with gold trim, black pants, black boots, and aristocrat red jacket with gold trim and gold shoulder armor."], ["After Season 2", "Asher after Season 2.png", "Red", "Blue", "The man with short dark red hair with dark red sideburns muttonchops in a low ponytail. He has blue eyes, gold dragon horns, and pointy ears. He has muscles and wears glasses.", "He wears a black button down shirt, black pants, black boots, and aristocrat red jacket with gold trim."]]}, {"name": "Clara", "gender": "female", "species": "Half-Fairy/Half-Human", "variants": [["Season 1 Part 1", "Clara season 1 part 1.png", "Blue", "Blue", "The long blue hair woman has big, cute blue eyes and large breasts. Her hair is half up with a big hair bun and her bangs cover her forehead.", "She\u2019s wearing a light blue princess dress with white frill. She is wearing 3/4 sleeves. She is wearing a silver tiara with blue diamond gems."], ["Season 1 Disguise", "Clara season 1 disguise.png", "Black", "Blue", "The long black hair woman has big, cute blue eyes and large breasts. Her bangs cover her forehead.", "She wears a plain long sleeve navy dress."], ["Season 1 Part 2", "Clara season 1 part 2.png", "Blue", "Blue", "The long blue hair woman has big, cute blue eyes and large breasts. Her bangs cover her forehead.", "She wears a long sleeve navy dress with black trim, her sleeves are transparent navy color. She wears a black corset."], ["Season 2", "Clara season 2.png", "Blue", "Blue", "The long blue hair woman has her hair in a high ponytail and has big, cute blue eyes and large breasts. Her bangs cover her forehead.", "She wears a sleeveless navy princess dress with black frill trim. The sleeves have black frill trim and black corset. She is wearing a black tiara with blue diamond gems."], ["After Season 2", "Clara after season 2.png", "Blue", "Blue", "The long blue hair woman wears her hair in a single loose side braid and has big, cute blue eyes and large breasts. Her bangs cover her forehead.", "She is wearing a navy dress with black lace trim. The long sleeves are black lace with black lace high neck."]]}, {"name": "Grace", "gender": "female", "species": "True Hybrid (Fairy/Dragon/Human)", "variants": [["Toddler Grace", "Toddler Grace.png", "Red", "Blue", "The toddler girl has big cute blue eyes, medium red hair, and small gold horns.", "She is wearing a cream tank top with frill trim and cream color puffy shorts with frill trim."], ["Child Grace", "Child Grace.png", "Red", "Yellow", "The child girl has big cute yellow eyes, her red hair in a high ponytail, she has gold horns.", "She is wearing a blue dress with white frill trim."], ["Teen Grace", "Teen Grace.png", "Red", "Gold", "The teen girl is pouting, her red hair in a high bun. She has fang bangs, big cute gold eyes, and gold horns. She has medium breasts.", "She is wearing a short sleeve blue dress with white frill trim."], ["Grace", "Grace.png", "Red", "Gold", "The red hair woman with a high ponytail with long fang bangs. She has big, cute gold eyes with long eyelashes, pink lips, large breasts, and gold horns.", "She is wearing a blue dress, red belt, navy leggings. She is wearing a red crop jacket with gold shoulder armor."]]}, {"name": "Charlotte", "gender": "female", "species": "Human", "variants": [["Season 1", "Charlotte Season 1.png", "White", "Pink", "A princess with long white hair, arched bangs, pink eyes, and medium-sized breasts. She has a frowning, pouting expression.", "A detailed princess blue dress with flowing puffy long skirt with pink trim. She wears a pink heart gem silver tiara."], ["Season 2", "Charlotte Season 2.png", "White", "Pink", "A princess with long white hair, arched bangs, pink eyes, and medium-sized breasts. She has a frowning, pouting expression.", "A detailed princess pink and blue ensemble featuring a fitted light blue V-neck top with long sleeves, cut-out details, and a ribbon-laced corset. A short, multilayered skirt is paired with white leggings, light blue heels, and light blue gloves. Accessories include a heart-shaped tiara decorated with pink gemstones and a hair ribbon."], ["Time-skip", "Charlotte Timeskip.png", "White", "Pink", "a woman with white hair, she has arched bangs, her hair is a short bob. She has pink eyes with long eyelashes. She has pink lips, pink eye shadow, and eyeliner. She has medium size breasts. She is pouting, blushing bright red.", "She is wearing a blue collar jacket dress, pink belt, white button under shirt. She is wearing pink wrist gloves, and a blue sunhat on her head with pink ribbon."]]}, {"name": "Henry", "gender": "male", "species": "Human", "variants": [["Season 1", "Henry Season 1.png", "White", "Blue", "A prince with short, softly tousled white hair, side-swept bangs, and blue eyes.", "An elegant red princely tailcoat with gold trim, decorative gold buttons, structured shoulders, and gold shoulder epaulettes. The coat has broad lapels with black inset panels, ornate gold embroidery, and long split tails. Black cuffs feature matching gold embroidery. Beneath it, he wears a black high-collared shirt and a black cravat secured with a red gemstone brooch and delicate gold chains. A neatly folded white pocket square and tailored black trousers complete the ensemble."], ["Season 2", "Henry Season 2.png", "White", "Blue", "The man has short white hair with asymmetrical bangs and blue eyes.", "He is wearing a white long vest with gold trim and gold buttons, a long open red jacket with gold trim,  black pants, utility belt, black undershirt. He has a messenger bag. He is wearing black boots,  green heart charm jewel necklace, blue heart jewel pin, and gold belt buckle with gold belt chains."], ["Cross-dressing", "Henry Crossdressing.png", "White", "Blue", "The man has long white hair with layers and v-bangs. He looks beautiful. He has sharp blue eyes with long eyelashes. He has red lips, red make-up, light red eyeshadow.", "He is cross-dressing with a red dress with black lace trim, black underskirt, and a long skirt slit showing off his leg. He is wearing black heels, holding a red fan with black trim. He has black and red drop earrings."], ["Time-skip", "Henry Timeskip.png", "White", "Blue", "An adult prince with short, softly tousled white hair, side-swept bangs, and blue eyes. He is wearing an orange feather drop earring on his left ear.", "He is wearing a black under shirt, black pants, and open red jacket. He has a fantasy utility belt on."]]}, {"name": "Sabine", "subtitle": "Vampire of Lust", "gender": "female", "species": "Human \u2192 Vampire", "variants": [["Sabine", "Sabine.png", "Burgundy,Purple", "Red", "Beautiful adult female vampire with an extremely voluptuous hourglass figure, large breasts, very wide curvy hips, a large round butt, a narrow waist, pale skin, pointed vampire ears, sharp red eyes, long dramatic eyelashes, and small sharp vampire fangs. She has elegant mature facial features and glamorous makeup, with sharp eyeliner, smoky eye shadow, and rich burgundy lipstick.\n\nHer hair is extremely long, thick, fluffy burgundy with permanent purple streaks, cascading almost to her thighs in enormous soft cloudlike waves. It has tremendous volume and a soft, airy texture. The purple sections curl naturally through the burgundy hair in swirling, spiral-like streaks, like purple swirls painted through clouds. She has elegant curled bangs and long curled side locks framing her face.", "A luxurious fitted floor-length burgundy velvet evening dress with a structured sweetheart neckline, exposed shoulders, delicate black lace accents, and a sharply fitted waist. A dramatic high slit opens along one thigh, revealing a sheer black thigh-high stocking held up by an elegant black thigh garter with a clearly visible polished metal heart-shaped clasp.\n\nLong sheer black opera gloves, pointed black high heels with subtle burgundy details, a fitted black velvet choker with a dark-purple gemstone, dangling earrings, elegant rings, and delicate jewelry complete the ensemble. An enormous luxurious fluffy faux-fur jacket is worn over the dress, left open in front.", "Vampire"], ["Past Sabine", "Sabine Past.png", "Purple", "Brown", "The woman has extremely long, thick, fluffy purple hair, cascading almost to her thighs in enormous soft cloudlike waves. It has tremendous volume and a soft, airy texture. The hair curl naturally in swirling, spiral-like streaks, like purple swirls painted through clouds. She has elegant curled bangs and long curled side locks framing her face. She has sharp brown eyes with long eyelashes. She has an extremely voluptuous hourglass figure, large breasts, very wide curvy hips, a large round butt, a narrow waist. She has elegant mature facial features.", "She is wearing a light pink sweater and brown with white plaid skirt with white lace trim. She is wearing transparent brown tights, white legwarmers with pink trim, chunky black shoes. She is wearing a brown trucker jacket and pink wool scarf that slightly covers her mouth.", "Human"]]}];
const characterForm = document.querySelector(".character-form");
if (characterForm && document.querySelector(".character-gallery")) {
  const params = new URLSearchParams(window.location.search);
  const fields = ["q", "hair", "eyes", "gender", "species"];
  for (const field of fields) {
    const control = characterForm.elements[field];
    const value = params.get(field) ?? "";
    if (field === "q" || [...control.options].some(option => option.value === value)) control.value = value;
  }
  function filterCharacters() {
    const terms = characterForm.elements.q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const value = field => characterForm.elements[field].value;
    let count = 0;
    for (const character of characterData) {
      const searchable = [character.name, character.species, ...character.variants.flat()].join(" ").toLowerCase();
      const hasVariant = character.variants.some(variant =>
        (!value("hair") || variant[2].toLowerCase().split(",").includes(value("hair"))) &&
        (!value("eyes") || variant[3].toLowerCase() === value("eyes")) &&
        (!value("species") || (variant[6] ?? character.species).toLowerCase() === value("species") || character.species.toLowerCase() === value("species"))
      );
      const matches = hasVariant && (!value("gender") || character.gender === value("gender")) &&
        terms.every(term => searchable.includes(term));
      document.querySelector('[data-character="' + character.name.toLowerCase() + '"]').hidden = !matches;
      if (matches) count++;
    }
    document.querySelector("#character-status").textContent = count ? count + (count === 1 ? " character found" : " characters found") : "No characters found.";
  }
  characterForm.addEventListener("input", filterCharacters);
  characterForm.addEventListener("change", filterCharacters);
  filterCharacters();
}
for (const button of document.querySelectorAll("[data-copy-target]")) {
  button.addEventListener("click", async () => {
    const nodes = button.dataset.copyTarget.split(",").map(id => document.getElementById(id));
    const text = nodes.map(node => node.textContent).join("\n\n");
    const status = button.parentElement.querySelector(".copy-feedback");
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Prompt copied.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartBefore(nodes[0]);
      range.setEndAfter(nodes[nodes.length - 1]);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Text selected. Use your device’s copy command.";
    }
  });
}
