const fs = require("node:fs");

const path = require("node:path");

const updatesFolder = path.join(process.cwd(), "content", "updates");

const outputFile = path.join(process.cwd(), "updates.json");

const updates = [];

function readUpdate(source) {

  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);

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

  return {

    title: data.title,

    date: data.date,

    image: data.image || "",

    body: source.slice(match[0].length).trim()

  };

}

if (fs.existsSync(updatesFolder)) {

  for (const filename of fs.readdirSync(updatesFolder)) {

    if (!filename.endsWith(".md")) continue;

    const source = fs.readFileSync(

      path.join(updatesFolder, filename),

      "utf8"

    );

    const update = readUpdate(source);

    if (update) updates.push(update);

  }

}

updates.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(updates, null, 2));

console.log(`Generated updates.json with ${updates.length} updates.`);
