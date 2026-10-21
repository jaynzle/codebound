window.addEventListener("scroll", function () {
    const nav = document.querySelector(".top-nav");

    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

/* topics dropdown */

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".dropdown");
  if (!dropdown) return;

  const toggle = dropdown.querySelector(".dropdown-toggle");
  const menu = dropdown.querySelector(".dropdown-menu");

  if (!toggle || !menu) return;

  // open or close the dropdown when clicked
  toggle.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // close when clicking anywhere outside
  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });

  // close after selecting a topic
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});