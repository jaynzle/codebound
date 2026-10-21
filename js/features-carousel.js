
const viewport = document.getElementById("featuresViewport");
const track = document.getElementById("featuresTrack");
const indicators = document.getElementById("featuresIndicators");

if (viewport && track && indicators) {
    const originalCards = [...track.children];
    const total = originalCards.length;
    const duration = 7000;
    const transition = "transform 0.65s cubic-bezier(0.22, 0.7, 0.25, 1)";

    let activeIndex = 0;
    let virtualIndex = total;
    let savedElapsed = 0;
    let lastTime = 0;
    let dragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;
    let animationFrame;

    originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
    });

    originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
    });

    const allCards = [...track.children];

    originalCards.forEach((card, index) => {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "feature-indicator";
        indicator.setAttribute("aria-label", `Show feature ${index + 1}`);

        indicator.addEventListener("click", () => {
            activeIndex = index;
            virtualIndex = total + index;
            savedElapsed = 0;
            render(true);
        });

        indicators.appendChild(indicator);
    });

    const indicatorButtons = [...indicators.children];

    function getTargetOffset(index) {
        const card = allCards[index];
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        return viewport.clientWidth / 2 - cardCenter;
    }

    function render(animate = true) {
        const activeCard = allCards[virtualIndex];
        if (!activeCard) return;

        allCards.forEach((card, index) => {
            card.classList.toggle("is-active", index === virtualIndex);
        });

        track.style.transition = animate ? transition : "none";
        track.style.transform =
            `translate3d(${getTargetOffset(virtualIndex)}px, 0, 0)`;

        indicatorButtons.forEach((button, index) => {
            button.classList.toggle("active", index === activeIndex);
            button.replaceChildren();

            if (index === activeIndex) {
                const fill = document.createElement("span");
                fill.className = "feature-indicator-fill";
                fill.style.width =
                    `${Math.min(savedElapsed / duration * 100, 100)}%`;
                button.appendChild(fill);
            }
        });
    }

    function normalizePosition() {
        if (virtualIndex >= total * 2) {
            virtualIndex -= total;
            render(false);
        } else if (virtualIndex < total) {
            virtualIndex += total;
            render(false);
        }
    }

    function advance() {
        activeIndex = (activeIndex + 1) % total;
        virtualIndex += 1;
        savedElapsed = 0;
        render(true);
    }

    track.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "transform" || dragging) return;
        normalizePosition();
    });

    function animate(now) {
        if (!lastTime) lastTime = now;

        const delta = Math.min(now - lastTime, 50);
        lastTime = now;

        if (!dragging) {
            savedElapsed += delta;

            const fill = indicatorButtons[activeIndex]?.querySelector(
                ".feature-indicator-fill"
            );

            if (fill) {
                fill.style.width =
                    `${Math.min(savedElapsed / duration * 100, 100)}%`;
            }

            if (savedElapsed >= duration) {
                advance();
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    function getCurrentTranslate() {
        const transform = getComputedStyle(track).transform;

        if (!transform || transform === "none") return 0;

        return new DOMMatrixReadOnly(transform).m41;
    }

    viewport.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        dragging = true;
        dragMoved = false;
        dragStartX = event.clientX;
        dragStartTranslate = getCurrentTranslate();

        track.style.transition = "none";
        viewport.classList.add("dragging");
        viewport.setPointerCapture(event.pointerId);
        lastTime = performance.now();
    });

    viewport.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const distance = event.clientX - dragStartX;

        if (Math.abs(distance) > 5) {
            dragMoved = true;
        }

        const translate = dragStartTranslate + distance;
        track.style.transform = `translate3d(${translate}px, 0, 0)`;
    });

    function finishDrag() {
        if (!dragging) return;

        dragging = false;
        viewport.classList.remove("dragging");

        if (dragMoved) {
            const viewportCenter =
                viewport.getBoundingClientRect().left + viewport.clientWidth / 2;

            let nearestIndex = virtualIndex;
            let nearestDistance = Infinity;

            allCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const center = rect.left + rect.width / 2;
                const distance = Math.abs(center - viewportCenter);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            virtualIndex = nearestIndex;
            activeIndex = ((virtualIndex % total) + total) % total;
            savedElapsed = 0;
        }

        render(true);
        lastTime = performance.now();
    }

    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);
    viewport.addEventListener("lostpointercapture", finishDrag);

    window.addEventListener("resize", () => render(false));

    render(false);
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
}
