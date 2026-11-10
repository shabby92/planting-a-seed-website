const fs = require("node:fs");

const path = require("node:path");

const eventsFolder = path.join(process.cwd(), "content", "events");

const outputFile = path.join(process.cwd(), "events.json");

const events = [];

function readFrontmatter(source) {

  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);

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

    location: data.location || "",

    description: data.description || data.body || ""

  };

}

if (fs.existsSync(eventsFolder)) {

  for (const filename of fs.readdirSync(eventsFolder)) {

    if (!filename.endsWith(".md")) continue;

    const source = fs.readFileSync(

      path.join(eventsFolder, filename),

      "utf8"

    );

    const event = readFrontmatter(source);

    if (event) events.push(event);

  }

}

events.sort((a, b) => new Date(a.date) - new Date(b.date));

fs.writeFileSync(outputFile, JSON.stringify(events, null, 2));

console.log(`Generated events.json with ${events.length} events.`);

