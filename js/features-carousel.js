document.addEventListener("DOMContentLoaded", () => {
    const viewport = document.getElementById("featuresViewport");
    const list = document.getElementById("featuresList");
    const previousButton = document.querySelector(".carousel-prev");
    const nextButton = document.querySelector(".carousel-next");
    const progressTrack = document.querySelector(".progress-track");
    const progressFill = document.getElementById("featuresProgressFill");
    const progressThumb = document.getElementById("featuresProgressThumb");

    if (
        !viewport ||
        !list ||
        !previousButton ||
        !nextButton ||
        !progressTrack ||
        !progressFill ||
        !progressThumb
    ) {
        return;
    }

    const items = Array.from(list.querySelectorAll(".feature-item"));

    if (!items.length) {
        return;
    }

    let draggingThumb = false;
    let thumbOffset = 0;
    let draggingCards = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let hasDragged = false;

    function getGap() {
        const style = getComputedStyle(list);
        return parseFloat(style.gap) || 0;
    }

    function getStep() {
        const firstItem = items[0];

        return firstItem.getBoundingClientRect().width + getGap();
    }

    function getMaxScroll() {
        return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function getProgress() {
        const max = getMaxScroll();

        return max > 0
            ? Math.min(1, Math.max(0, viewport.scrollLeft / max))
            : 0;
    }

    function updateProgress() {
        const progress = getProgress();
        const trackWidth = progressTrack.clientWidth;
        const thumbWidth = progressThumb.offsetWidth;
        const travel = Math.max(0, trackWidth - thumbWidth);

        progressFill.style.width = `${progress * 100}%`;
        progressThumb.style.left = `${progress * travel}px`;

        previousButton.disabled = viewport.scrollLeft <= 1;
        nextButton.disabled = viewport.scrollLeft >= getMaxScroll() - 1;

        progressThumb.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        progressThumb.setAttribute("aria-valuemin", "0");
        progressThumb.setAttribute("aria-valuemax", "100");
    }

    function moveByCard(direction) {
        viewport.scrollBy({
            left: getStep() * direction,
            behavior: "smooth"
        });
    }

    previousButton.addEventListener("click", () => moveByCard(-1));
    nextButton.addEventListener("click", () => moveByCard(1));

    /* REAL-TIME SCROLL PROGRESS */

    viewport.addEventListener("scroll", updateProgress, { passive: true });

    /* CLICK THE TRACK TO SEEK */

    progressTrack.addEventListener("pointerdown", (event) => {
        if (event.target === progressThumb) {
            return;
        }

        const rect = progressTrack.getBoundingClientRect();
        const thumbWidth = progressThumb.offsetWidth;
        const travel = Math.max(1, rect.width - thumbWidth);
        const position = Math.max(
            0,
            Math.min(travel, event.clientX - rect.left - thumbWidth / 2)
        );

        viewport.scrollLeft = (position / travel) * getMaxScroll();
    });

    /* DRAG THE PROGRESS HANDLE */

    progressThumb.addEventListener("pointerdown", (event) => {
        draggingThumb = true;

        const rect = progressThumb.getBoundingClientRect();
        thumbOffset = event.clientX - rect.left;

        progressThumb.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    progressThumb.addEventListener("pointermove", (event) => {
        if (!draggingThumb) {
            return;
        }

        const trackRect = progressTrack.getBoundingClientRect();
        const thumbWidth = progressThumb.offsetWidth;
        const travel = Math.max(1, trackRect.width - thumbWidth);

        const position = Math.max(
            0,
            Math.min(
                travel,
                event.clientX - trackRect.left - thumbOffset
            )
        );

        viewport.scrollLeft = (position / travel) * getMaxScroll();
    });

    function endThumbDrag() {
        draggingThumb = false;
        updateProgress();
    }

    progressThumb.addEventListener("pointerup", endThumbDrag);
    progressThumb.addEventListener("pointercancel", endThumbDrag);

    /* MOUSE DRAGGING */

    viewport.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) {
            return;
        }

        draggingCards = true;
        hasDragged = false;
        dragStartX = event.clientX;
        dragStartScroll = viewport.scrollLeft;
    });

    window.addEventListener("pointermove", (event) => {
        if (!draggingCards) {
            return;
        }

        const delta = event.clientX - dragStartX;

        if (Math.abs(delta) > 5) {
            hasDragged = true;
        }

        if (hasDragged) {
            viewport.scrollLeft = dragStartScroll - delta;
        }
    });

    window.addEventListener("pointerup", () => {
        draggingCards = false;

        if (hasDragged) {
            setTimeout(() => {
                hasDragged = false;
            }, 0);
        }
    });

    viewport.addEventListener(
        "click",
        (event) => {
            if (hasDragged) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        true
    );

    /* KEYBOARD CONTROLS */

    viewport.tabIndex = 0;

    viewport.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            moveByCard(1);
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveByCard(-1);
        }
    });

    /* RESIZE SUPPORT */

    window.addEventListener("resize", updateProgress);

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(updateProgress);
        observer.observe(viewport);
        observer.observe(list);
    }

    updateProgress();
});