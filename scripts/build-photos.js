const fs = require("node:fs");

const path = require("node:path");

const folder = path.join(process.cwd(), "content", "photos");

const output = path.join(process.cwd(), "photos.json");

const galleries = [];

function parseGallery(source) {

  const match = source.match(

    /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

  );

  if (!match) return null;

  const lines = match[1].split(/\r?\n/);

  let title = "";

  let inImages = false;

  const images = [];

  for (const line of lines) {

    const titleMatch = line.match(/^title:\s*(.*)$/);

    if (titleMatch) {

      title = titleMatch[1].trim().replace(/^["']|["']$/g, "");

      inImages = false;

      continue;

    }

    if (/^images:\s*$/.test(line)) {

      inImages = true;

      continue;

    }

    if (inImages) {

      const imageMatch = line.match(

        /^\s*-\s*(?:image:\s*)?(.+)$/

      );

      if (imageMatch) {

        const image = imageMatch[1]

          .trim()

          .replace(/^["']|["']$/g, "");

        if (image.startsWith("/images/")) {

          images.push(image);

        }

      }

    }

  }

  if (!title) return null;

  return { title, images };

}

if (fs.existsSync(folder)) {

  for (const filename of fs.readdirSync(folder)) {

    if (!filename.endsWith(".md")) continue;

    const source = fs.readFileSync(

      path.join(folder, filename),

      "utf8"

    );

    const gallery = parseGallery(source);

    if (gallery) galleries.push(gallery);

  }

}

fs.writeFileSync(output, JSON.stringify(galleries, null, 2));

console.log(`Generated ${galleries.length} photo galleries.`);
