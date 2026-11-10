const toggle = document.querySelector(".menu-toggle");

const nav = document.querySelector("#nav");

if (toggle && nav) {

  toggle.addEventListener("click", () => {

    const open = nav.classList.toggle("open");

    toggle.setAttribute("aria-expanded", String(open));

  });

  nav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      nav.classList.remove("open");

      toggle.setAttribute("aria-expanded", "false");

    });

  });

}

const volunteerForm = document.querySelector("#volunteer-form");

if (volunteerForm) {

  volunteerForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!volunteerForm.reportValidity()) return;

    const fields = new FormData(volunteerForm);

    const details = [...fields.entries()]

      .map(([key, value]) => `${key}: ${value}`)

      .join("\n");

    const subject = "Volunteer interest - Planting a Seed, Lompoc";

    const body = "Hello Planting a Seed,\n\n" +

      "I am interested in volunteering.\n\n" +

      details;

    window.location.href =

      "mailto:plantingaseed@verizon.net?subject=" +

      encodeURIComponent(subject) +

      "&body=" +

      encodeURIComponent(body);

  });

}

async function loadUpcomingEvents() {

  const container = document.getElementById("events-list");

  if (!container) return;

  try {

    const response = await fetch("/events.json", {

      cache: "no-store"

    });

    if (!response.ok) throw new Error("Events unavailable");

    const events = await response.json();

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const upcoming = events

      .filter(event => {

        const date = new Date(event.date);

        return !Number.isNaN(date.getTime()) && date >= today;

      })

      .sort((a, b) => new Date(a.date) - new Date(b.date));

    container.replaceChildren();

    if (!upcoming.length) {

      container.textContent =

        "Upcoming events will be announced here.";

      return;

    }

    for (const event of upcoming) {

      const card = document.createElement("article");

      card.className = "event-card";

      const heading = document.createElement("h3");

      heading.textContent = event.title;

      card.appendChild(heading);

      const date = document.createElement("p");

      date.textContent = new Date(event.date).toLocaleString(

        "en-US",

        { dateStyle: "long", timeStyle: "short" }

      );

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

    console.error("Unable to load events:", error);

    container.textContent =

      "Upcoming events will be announced here.";

  }

}

loadUpcomingEvents();
