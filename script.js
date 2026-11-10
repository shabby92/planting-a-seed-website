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

async function loadCommunityUpdates() {

  const container = document.getElementById("updates-list");

  if (!container) return;

  try {

    const response = await fetch("/updates.json", {

      cache: "no-store"

    });

    if (!response.ok) throw new Error("Updates unavailable");

    const updates = await response.json();

    container.replaceChildren();

    if (!updates.length) {

      container.textContent = "Community updates will appear here.";

      return;

    }

    for (const update of updates) {

      const card = document.createElement("article");

      card.className = "event-card";

      if (update.image) {

        const photo = document.createElement("img");

        photo.src = update.image;

        photo.alt = update.title;

        photo.loading = "lazy";

        photo.style.width = "100%";

        photo.style.maxWidth = "600px";

        photo.style.borderRadius = "12px";

        card.appendChild(photo);

      }

      const heading = document.createElement("h3");

      heading.textContent = update.title;

      card.appendChild(heading);

      const date = document.createElement("p");

      date.textContent = new Date(update.date).toLocaleDateString(

        "en-US",

        { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }

      );

      card.appendChild(date);

      const preview = document.createElement("p");

      const text = update.body || "";

      preview.textContent =

        text.length > 180 ? text.slice(0, 180) + "..." : text;

      card.appendChild(preview);

      const actions = document.createElement("div");

      actions.style.display = "flex";

      actions.style.gap = "12px";

      actions.style.flexWrap = "wrap";

      const readLink = document.createElement("a");

      readLink.href = update.url;

      readLink.textContent = "Read Full Story";

      readLink.className = "btn btn-green";

      actions.appendChild(readLink);

      const shareButton = document.createElement("button");

      shareButton.type = "button";

      shareButton.textContent = "Share Story";

      shareButton.className = "btn btn-outline";

      shareButton.addEventListener("click", async () => {

        const url = new URL(update.url, window.location.origin).href;

        if (navigator.share) {

          try {

            await navigator.share({ title: update.title, url });

          } catch (error) {

            if (error.name !== "AbortError") console.error(error);

          }

        } else {

          try {

            await navigator.clipboard.writeText(url);

            alert("Story link copied!");

          } catch {

            window.prompt("Copy this story link:", url);

          }

        }

      });

      actions.appendChild(shareButton);

      card.appendChild(actions);

      container.appendChild(card);

    }

  } catch (error) {

    console.error("Unable to load community updates:", error);

    container.textContent = "Community updates will appear here.";

  }

}

loadCommunityUpdates();

async function loadPhotoGalleries() {

  const container = document.getElementById("galleries-list");

  if (!container) return;

  try {

    const response = await fetch("/photos.json", {

      cache: "no-store"

    });

    if (!response.ok) throw new Error("Galleries unavailable");

    const galleries = await response.json();

    container.replaceChildren();

    if (!galleries.length) {

      container.textContent = "Photo galleries will appear here.";

      return;

    }

    for (const gallery of galleries) {

      const card = document.createElement("article");

      card.className = "event-card";

      const heading = document.createElement("h3");

      heading.textContent = gallery.title;

      card.appendChild(heading);

      const grid = document.createElement("div");

      grid.className = "gallery-grid";

      grid.style.display = "grid";

      grid.style.gridTemplateColumns =

        "repeat(auto-fit, minmax(160px, 1fr))";

      grid.style.gap = "12px";

      grid.style.marginTop = "16px";

      for (const imageUrl of gallery.images || []) {

        const link = document.createElement("a");

        link.href = imageUrl;

        link.target = "_blank";

        link.rel = "noopener noreferrer";

        const photo = document.createElement("img");

        photo.src = imageUrl;

        photo.alt = gallery.title;

        photo.loading = "lazy";

        photo.style.width = "100%";

        photo.style.height = "180px";

        photo.style.objectFit = "cover";

        photo.style.borderRadius = "12px";

        link.appendChild(photo);

        grid.appendChild(link);

      }

      card.appendChild(grid);

      container.appendChild(card);

    }

  } catch (error) {

    console.error("Unable to load photo galleries:", error);

    container.textContent = "Photo galleries will appear here.";

  }

}

loadPhotoGalleries();

/* PHOTO GALLERY LIGHTBOX */

(function () {

  const lightbox = document.getElementById("photo-lightbox");

  const image = document.getElementById("lightbox-image");

  const closeButton = document.getElementById("lightbox-close");

  const prevButton = document.getElementById("lightbox-prev");

  const nextButton = document.getElementById("lightbox-next");

  const counter = document.getElementById("lightbox-counter");

  const galleries = document.getElementById("galleries-list");

  if (!lightbox || !image || !galleries) return;

  let photos = [];

  let currentIndex = 0;

  let lastFocusedElement = null;

  function showPhoto() {

    if (!photos.length) return;

    image.src = photos[currentIndex].src;

    image.alt = photos[currentIndex].alt || "Gallery photo";

    counter.textContent =

      `${currentIndex + 1} of ${photos.length} photos`;

  }

  function openLightbox(clickedLink) {

    // Only browse photos from the selected gallery.

    const gallery = clickedLink.closest("article");

    if (!gallery) return;

    const links = Array.from(

      gallery.querySelectorAll(".gallery-grid a")

    );

    photos = links.map(link => ({

      src: link.href,

      alt: link.querySelector("img")?.alt || "Gallery photo"

    }));

    currentIndex = links.indexOf(clickedLink);

    if (currentIndex < 0) return;

    lastFocusedElement = document.activeElement;

    showPhoto();

    lightbox.classList.add("is-open");

    lightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    closeButton.focus();

  }

  function closeLightbox() {

    lightbox.classList.remove("is-open");

    lightbox.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    image.removeAttribute("src");

    if (lastFocusedElement?.isConnected) {

      lastFocusedElement.focus();

    }

  }

  function changePhoto(direction) {

    if (!photos.length) return;

    currentIndex =

      (currentIndex + direction + photos.length) %

      photos.length;

    showPhoto();

  }

  // Works with galleries added dynamically.

  galleries.addEventListener("click", function (event) {

    const link = event.target.closest(".gallery-grid a");

    if (!link || !galleries.contains(link)) return;

    event.preventDefault();

    openLightbox(link);

  });

  closeButton.addEventListener("click", closeLightbox);

  prevButton.addEventListener("click", () => changePhoto(-1));

  nextButton.addEventListener("click", () => changePhoto(1));

  lightbox.addEventListener("click", function (event) {

    if (event.target === lightbox) closeLightbox();

  });

  document.addEventListener("keydown", function (event) {

    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();

    if (event.key === "ArrowLeft") changePhoto(-1);

    if (event.key === "ArrowRight") changePhoto(1);

    // Keep keyboard focus inside the viewer.

    if (event.key === "Tab") {

      const buttons = [

        closeButton,

        prevButton,

        nextButton

      ];

      const index = buttons.indexOf(document.activeElement);

      if (event.shiftKey && index <= 0) {

        event.preventDefault();

        nextButton.focus();

      } else if (!event.shiftKey && index === 2) {

        event.preventDefault();

        closeButton.focus();

      }

    }

  });

})();
