
window.addEventListener("scroll", function () {
    const nav = document.querySelector(".top-nav");

    if (!nav) return;

    if (document.body.classList.contains("playgame-page")) {
        nav.classList.remove("scrolled");
        return;
    }

    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});
