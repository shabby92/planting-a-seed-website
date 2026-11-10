const fs = require("node:fs");

const path = require("node:path");

const root = process.cwd();

const updatesFolder = path.join(root, "content", "updates");

const outputFile = path.join(root, "updates.json");

const pagesFolder = path.join(root, "updates");

const siteUrl = "https://paslompoc.org";

const updates = [];

function escapeHtml(value) {

  return String(value ?? "").replace(/[&<>"']/g, char => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#39;"

  })[char]);

}

function readUpdate(source, filename) {

  const match = source.match(

    /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/

  );

  if (!match) return null;

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {

    const item = line.match(/^([a-zA-Z_]+):\s*(.*)$/);

    if (!item) continue;

    let value = item[2].trim();

    if (

      (value.startsWith('"') && value.endsWith('"')) ||

      (value.startsWith("'") && value.endsWith("'"))

    ) {

      value = value.slice(1, -1);

    }

    data[item[1]] = value;

  }

  if (!data.title || !data.date) return null;

  const slug = path.basename(filename, ".md")

    .toLowerCase()

    .replace(/[^a-z0-9-]/g, "-");

  if (!slug || slug === "." || slug === "..") return null;

  const body = source.slice(match[0].length).trim();

  return {

    title: data.title,

    date: data.date,

    image: data.image || "",

    body,

    slug,

    url: `/updates/${slug}/`

  };

}

function createStoryPage(update) {

  const directory = path.join(pagesFolder, update.slug);

  fs.mkdirSync(directory, { recursive: true });

  const fullUrl = siteUrl + update.url;

  const imageUrl = update.image

    ? new URL(update.image, siteUrl).href

    : "";

  const description = update.body

    .replace(/[#*_`[\]]/g, "")

    .replace(/\s+/g, " ")

    .slice(0, 155);

  const page = `<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${escapeHtml(update.title)} | Planting a Seed</title>

<meta name="description" content="${escapeHtml(description)}">

<link rel="canonical" href="${escapeHtml(fullUrl)}">

<meta property="og:type" content="article">

<meta property="og:title" content="${escapeHtml(update.title)}">

<meta property="og:description" content="${escapeHtml(description)}">

<meta property="og:url" content="${escapeHtml(fullUrl)}">

${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ""}

<link rel="stylesheet" href="/styles.css">

<style>

.story-page {max-width:800px;margin:0 auto;padding:50px 20px}

.story-page img {max-width:100%;height:auto;border-radius:12px}

.story-body {white-space:pre-wrap;line-height:1.8}

.story-actions {display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}

.story-actions a,.story-actions button {padding:12px 20px;cursor:pointer}

</style>

</head>

<body>

<main class="story-page">

<a href="/#updates">← Back to Community Updates</a>

<p>PLANTING A SEED · COMMUNITY UPDATE</p>

<h1>${escapeHtml(update.title)}</h1>

<p>${escapeHtml(new Date(update.date).toLocaleDateString("en-US", {

    year: "numeric",

    month: "long",

    day: "numeric",

    timeZone: "UTC"

  }))}</p>

${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(update.title)}">` : ""}

<div class="story-body">${escapeHtml(update.body)}</div>

<div class="story-actions">

<a href="/#updates">More Community Stories</a>

<button id="share-story" type="button">Share Story</button>

</div>

</main>

<script>

document.getElementById("share-story").addEventListener("click", async () => {

  const url = window.location.href;

  if (navigator.share) {

    try {

      await navigator.share({ title: document.title, url });

    } catch (error) {

      if (error.name !== "AbortError") console.error(error);

    }

  } else {

    try {

      await navigator.clipboard.writeText(url);

      alert("Story link copied!");

    } catch {

      prompt("Copy this story link:", url);

    }

  }

});

</script>

</body>

</html>`;

  fs.writeFileSync(path.join(directory, "index.html"), page);

}

if (fs.existsSync(updatesFolder)) {

  for (const filename of fs.readdirSync(updatesFolder)) {

    if (!filename.endsWith(".md")) continue;

    const source = fs.readFileSync(

      path.join(updatesFolder, filename),

      "utf8"

    );

    const update = readUpdate(source, filename);

    if (update) updates.push(update);

  }

}

updates.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.mkdirSync(pagesFolder, { recursive: true });

for (const update of updates) {

  createStoryPage(update);

}

fs.writeFileSync(outputFile, JSON.stringify(updates, null, 2));

console.log(`Generated ${updates.length} shareable Community Updates.`);

