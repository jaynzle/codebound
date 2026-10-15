document.addEventListener("DOMContentLoaded", () => {
    const topicButtons = document.querySelectorAll(".topic-button");
    const topicDescription = document.getElementById("topic-description");
    const topicCode = document.getElementById("topic-code");
    const topicPanels = document.getElementById("topic-panels");

    const topics = {
        variables: {
            description: "Learn how to create variables, assign values, and store different types of data. Discover how programs use variables to remember and manage information.",
            code: 'player_name = "Hero"\nlevel = 1'
        },
        sequences: {
            description: "Understand how the order of instructions affects program execution. Learn how to arrange commands step by step to achieve the desired outcome.",
            code: 'print("Enter the forest")\nprint("Find the key")\nprint("Open the gate")'
        },
        conditionals: {
            description: "Explore how programs make decisions using conditions. Learn how if and else statements allow programs to perform different actions depending on whether a condition is true or false.",
            code: 'has_key = True\n\nif has_key:\n    print("Gate unlocked!")\nelse:\n    print("Find the key!")'
        },
        loops: {
            description: "Discover how to repeat instructions using loops. Learn the basics of for and while loops and how they help make repetitive tasks easier and more efficient.",
            code: 'for step in range(3):\n    print("Moving forward...")'
        }
    };

    function selectTopic(topicName) {
        const topic = topics[topicName];

        if (!topic) {
            return;
        }

        topicButtons.forEach((button) => {
            const isActive = button.dataset.topic === topicName;

            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", String(isActive));
            button.tabIndex = isActive ? 0 : -1;
        });

        topicDescription.textContent = topic.description;
        topicCode.textContent = topic.code;

        const activeButton = document.querySelector(
            `.topic-button[data-topic="${topicName}"]`
        );

        if (activeButton) {
            topicPanels.setAttribute("aria-labelledby", activeButton.id);
        }
    }

    topicButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            selectTopic(button.dataset.topic);
        });

        button.addEventListener("keydown", (event) => {
            let nextIndex = index;

            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                nextIndex = (index + 1) % topicButtons.length;
            } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                nextIndex = (index - 1 + topicButtons.length) % topicButtons.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = topicButtons.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            topicButtons[nextIndex].focus();
            selectTopic(topicButtons[nextIndex].dataset.topic);
        });
    });

    selectTopic("variables");
});