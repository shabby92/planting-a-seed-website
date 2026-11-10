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

async function loadUpcomingEvents() {

  const container = document.getElementById("events-list");

  if (!container) return;

  try {

    const response = await fetch("/events.json", { cache: "no-store" });

    if (!response.ok) throw new Error("Unable to load events");

    const events = await response.json();

    const now = new Date();

    const upcoming = events

      .filter(event => {

        const date = new Date(event.date);

        return !Number.isNaN(date.getTime()) &&

          date >= new Date(now.getFullYear(), now.getMonth(), now.getDate());

      })

      .sort((a, b) => new Date(a.date) - new Date(b.date));

    container.replaceChildren();

    if (upcoming.length === 0) {

      container.textContent = "Upcoming events will be announced here.";

      return;

    }

    for (const event of upcoming) {

      const card = document.createElement("article");

      card.className = "event-card";

      const title = document.createElement("h3");

      title.textContent = event.title;

      card.appendChild(title);

      const date = document.createElement("p");

      date.textContent = new Date(event.date).toLocaleString("en-US", {

        dateStyle: "long",

        timeStyle: "short"

      });

      card.appendChild(date);

      if (event.location) {

        const location = document.createElement("p");

        location.textContent = "Location: " + event.location;

        card.appendChild(location);

      }

      if (event.description) {

        const description = document.createElement("p");

        description.textContent = event.description;

        card.appendChild(description);

      }

      container.appendChild(card);

    }

  } catch (error) {

    console.error("Event loading error:", error);

    container.textContent = "Upcoming events will be announced here.";

  }

}

loadUpcomingEvents();
