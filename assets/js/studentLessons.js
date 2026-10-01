const API_URL ="https://providers-cylinder-have-cap.trycloudflare.com";

document.addEventListener("DOMContentLoaded", () => {
    loadLessons();
});


// ==========================================
// Load Lessons
// ==========================================

async function loadLessons() {

    const container =
        document.getElementById("lessonsContainer");

    if (!container) return;

     const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

    if (!token) {
        container.innerHTML = `
            <p>Please log in to view lessons.</p>
        `;
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/lessons`,
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const lessons = await response.json();

        if (!response.ok) {
            console.error(
                "Failed to load lessons:",
                lessons.message
            );

            container.innerHTML = `
                <p>Unable to load lessons.</p>
            `;

            return;
        }

        container.innerHTML = "";

        if (lessons.length === 0) {

            container.innerHTML = `
                <p>No lessons available yet.</p>
            `;

            return;
        }


        lessons.forEach(lesson => {

            const card =
                document.createElement("div");

            card.className =
                "card lesson-card";

            card.setAttribute(
                "data-search-item",
                ""
            );


            // ------------------------------
            // Lesson Image
            // ------------------------------

            let thumbnail;

            if (lesson.photos) {

                thumbnail = `
                    <img
                        src="${escapeHTML(lesson.photos)}"
                        alt="${escapeHTML(lesson.title)}"
                        style="
                            width:100%;
                            height:180px;
                            object-fit:cover;
                        "
                    >
                `;

            } else {

                thumbnail = `
                    <div class="lesson-thumb">
                        🤟
                    </div>
                `;
            }


            // ------------------------------
            // Lesson Card
            // ------------------------------

            card.innerHTML = `

                ${thumbnail}

                <div class="lesson-body">

                    <span class="tag">
                        Beginner
                    </span>

                    <h3>
                        ${escapeHTML(lesson.title)}
                    </h3>

                    <p>
                        ${escapeHTML(lesson.description)}
                    </p>

                    <br>

                    <a
                        class="btn btn-light"
                        href="lesson-details.html?id=${lesson._id}"
                    >
                        View lesson
                    </a>

                </div>
            `;

            container.appendChild(card);
        });


        // Enable search after cards are created
        setupLessonSearch();

    } catch (error) {

        console.error(
            "Lesson loading error:",
            error
        );

        container.innerHTML = `
            <p>Unable to connect to the backend.</p>
        `;
    }
}


// ==========================================
// Search Lessons
// ==========================================

function setupLessonSearch() {

    const searchInput =
        document.querySelector("[data-search]");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        document
            .querySelectorAll("[data-search-item]")
            .forEach(item => {

                item.style.display =
                    item.textContent
                        .toLowerCase()
                        .includes(query)
                        ? ""
                        : "none";
            });
    });
}


// ==========================================
// Escape HTML
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}