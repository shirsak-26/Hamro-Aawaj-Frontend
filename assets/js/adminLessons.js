console.log("🔥 adminLessons.js loaded");

const API_URL = "https://providers-cylinder-have-cap.trycloudflare.com";

let editingLessonId = null;

// ==========================================
// Page Start
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    checkAdmin();
});

// ==========================================
// Check Admin
// ==========================================

async function checkAdmin() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/protected`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        const data = await response.json();

        if (!response.ok || !data.user || data.user.role !== "admin") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";
            return;
        }

        await loadCategories();
        await loadLessons();

        setupLessonForm();

    } catch (error) {
        console.error("Admin authentication error:", error);
    }
}

// ==========================================
// Load Categories
// ==========================================

async function loadCategories() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/categories`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        const categories = await response.json();

        if (!response.ok) {
            console.error("Failed to load categories:", categories.message);
            return;
        }

        const select = document.getElementById("lessonCategory");

        select.innerHTML = `<option value="">Select category</option>`;

        categories.forEach((category) => {
            const option = document.createElement("option");

            option.value = category._id;
            option.textContent = category.name;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Category loading error:", error);
    }
}

// ==========================================
// Load Lessons
// ==========================================

async function loadLessons() {
    const token = localStorage.getItem("token");

    const tableBody = document.getElementById("lessonTableBody");

    try {
        const response = await fetch(`${API_URL}/api/lessons`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        const lessons = await response.json();

        if (!response.ok) {
            console.error("Failed to load lessons:", lessons.message);
            return;
        }

        tableBody.innerHTML = "";

        if (lessons.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No lessons found.
                    </td>
                </tr>
            `;
            return;
        }

        lessons.forEach((lesson) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(lesson.title)}</td>

                <td>
                    ${
                        lesson.category
                            ? escapeHTML(lesson.category.name)
                            : "No category"
                    }
                </td>

                <td>Beginner</td>

                <td>Published</td>

                <td>
                    <button
                        class="action edit"
                        onclick="editLesson('${lesson._id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="action delete"
                        onclick="deleteLesson('${lesson._id}')"
                    >
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Lesson loading error:", error);
    }
}

// ==========================================
// Setup Form
// ==========================================
// ==========================================
// Photo Inputs
// ==========================================

function setupPhotoInputs() {
    const photoInputs = document.getElementById("photoInputs");

    photoInputs.innerHTML = `
        <div class="photo-input-row">
            <input
                type="url"
                class="lessonPhoto"
                placeholder="https://example.com/photo.jpg"
            />

            <button
                type="button"
                class="btn btn-light add-photo-btn"
            >
                + Add Photo
            </button>
        </div>
    `;

    updatePhotoButtons();
}


function updatePhotoButtons() {
    const rows = document.querySelectorAll(".photo-input-row");

    rows.forEach((row, index) => {

        const button = row.querySelector("button");

        if (index === 0) {
            button.textContent = "+ Add Photo";
            button.className = "btn btn-light add-photo-btn";

            button.onclick = addPhotoInput;

        } else {
            button.textContent = "× Remove";
            button.className = "btn btn-light remove-photo-btn";

            button.onclick = () => {
                row.remove();
                updatePhotoButtons();
            };
        }
    });
}


function addPhotoInput() {
    const photoInputs = document.getElementById("photoInputs");

    const row = document.createElement("div");

    row.className = "photo-input-row";

    row.innerHTML = `
        <input
            type="url"
            class="lessonPhoto"
            placeholder="https://example.com/photo.jpg"
        />

        <button
            type="button"
            class="btn btn-light remove-photo-btn"
        >
            × Remove
        </button>
    `;

    photoInputs.appendChild(row);

    updatePhotoButtons();
}

// ==========================================
// Video Inputs
// ==========================================

function setupVideoInputs() {
    const videoInputs = document.getElementById("videoInputs");

    videoInputs.innerHTML = `
        <div class="video-input-row">
            <input
                type="url"
                class="lessonVideo"
                placeholder="https://youtube.com/watch?v=..."
            />

            <button
                type="button"
                class="btn btn-light add-video-btn"
            >
                + Add Video
            </button>
        </div>
    `;

    updateVideoButtons();
}


function updateVideoButtons() {
    const rows = document.querySelectorAll(".video-input-row");

    rows.forEach((row, index) => {

        const button = row.querySelector("button");

        if (index === 0) {
            button.textContent = "+ Add Video";
            button.className = "btn btn-light add-video-btn";
            button.onclick = addVideoInput;

        } else {
            button.textContent = "× Remove";
            button.className = "btn btn-light remove-video-btn";

            button.onclick = () => {
                row.remove();
                updateVideoButtons();
            };
        }
    });
}


function addVideoInput() {
    const videoInputs = document.getElementById("videoInputs");

    const row = document.createElement("div");

    row.className = "video-input-row";

    row.innerHTML = `
        <input
            type="url"
            class="lessonVideo"
            placeholder="https://youtube.com/watch?v=..."
        />

        <button
            type="button"
            class="btn btn-light remove-video-btn"
        >
            × Remove
        </button>
    `;

    videoInputs.appendChild(row);

    updateVideoButtons();
}

function setupLessonForm() {
      setupPhotoInputs();
      setupVideoInputs();

    const addButton = document.getElementById("addLessonBtn");

    const cancelButton = document.getElementById("cancelLessonBtn");
    const form = document.getElementById("lessonFormElement");

    addButton.addEventListener("click", () => {
        editingLessonId = null;

        document.getElementById("lessonFormTitle").textContent = "Add Lesson";

        form.reset();

        document.getElementById("lessonForm").classList.remove("hidden");
    });

    cancelButton.addEventListener("click", () => {
        editingLessonId = null;

        form.reset();

        document.getElementById("lessonForm").classList.add("hidden");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const category = document.getElementById("lessonCategory").value;

        const title = document
            .getElementById("lessonTitle")
            .value
            .trim();

        const description = document
            .getElementById("lessonDescription")
            .value
            .trim();

const photos = Array.from(
    document.querySelectorAll(".lessonPhoto")
)
    .map(input => input.value.trim())
    .filter(url => url !== "");

        const videoUrls = Array.from(
    document.querySelectorAll(".lessonVideo")
)
    .map(input => input.value.trim())
    .filter(url => url !== "");

        
if (!category || !title || !description || photos.length === 0 || videoUrls.length === 0) {
    showMessage("Please fill in all required fields.");
    return;
}
        

        if (editingLessonId) {
            await updateLesson(
                editingLessonId,
                category,
                title,
                description,
                photos,
                videoUrls
            );
        } else {
            await createLesson(
                category,
                title,
                description,
                photos,
                videoUrls
            );
        }
    });
}

// ==========================================
// Create Lesson
// ==========================================

async function createLesson(
    category,
    title,
    description,
    photos,
    videoUrls
) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/lessons`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },

            body: JSON.stringify({
                category,
                title,
                description,
                photos,
                videoUrls
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to create lesson.");
            return;
        }

        showMessage("Lesson and video created successfully!");

        document.getElementById("lessonFormElement").reset();

        document.getElementById("lessonForm").classList.add("hidden");

        await loadLessons();

    } catch (error) {
        console.error("Create lesson error:", error);

        showMessage("Unable to connect to backend.");
    }
}

// ==========================================
// Edit Lesson
// ==========================================

async function editLesson(id) {
    const token = localStorage.getItem("token");

    try {

        // ------------------------------------------
        // Get lesson
        // ------------------------------------------

        const lessonResponse = await fetch(
            `${API_URL}/api/lessons/${id}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        const lesson = await lessonResponse.json();

        if (!lessonResponse.ok) {
            alert(lesson.message || "Failed to load lesson.");
            return;
        }

        // ------------------------------------------
        // Get videos
        // ------------------------------------------

        const videosResponse = await fetch(
            `${API_URL}/api/videos`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        const videos = await videosResponse.json();

        if (!videosResponse.ok) {
            alert(videos.message || "Failed to load video.");
            return;
        }

        // ------------------------------------------
        // Find video belonging to this lesson
        // ------------------------------------------

        const lessonVideo = videos.find((video) => {

            const videoLessonId =
                video.lesson?._id || video.lesson;

            return String(videoLessonId) === String(id);
        });

        // ------------------------------------------
        // Fill form
        // ------------------------------------------

        editingLessonId = id;

        document.getElementById("lessonFormTitle").textContent =
            "Edit Lesson";

        document.getElementById("lessonTitle").value =
            lesson.title || "";

        document.getElementById("lessonDescription").value =
            lesson.description || "";

       const photoInputs = document.getElementById("photoInputs");

photoInputs.innerHTML = "";

const photos = lesson.photos || [];

if (photos.length === 0) {
    addPhotoInput();
} else {
    photos.forEach((photo) => {
        const row = document.createElement("div");

        row.className = "photo-input-row";

        row.innerHTML = `
            <input
                type="url"
                class="lessonPhoto"
                value="${escapeHTML(photo)}"
                placeholder="https://example.com/photo.jpg"
            />

            <button
                type="button"
                class="btn btn-light remove-photo-btn"
            >
                × Remove
            </button>
        `;

        photoInputs.appendChild(row);
    });

    updatePhotoButtons();
}

        document.getElementById("lessonCategory").value =
            lesson.category
                ? lesson.category._id
                : "";

        // Get video URL from VIDEOS collection
        const videoInputs = document.getElementById("videoInputs");

videoInputs.innerHTML = "";

const lessonVideos = videos.filter((video) => {
    const videoLessonId =
        video.lesson?._id || video.lesson;

    return String(videoLessonId) === String(id);
});

if (lessonVideos.length === 0) {
    addVideoInput();
} else {

    lessonVideos.forEach((video) => {

        const row = document.createElement("div");

        row.className = "video-input-row";

        row.innerHTML = `
            <input
                type="url"
                class="lessonVideo"
                value="${escapeHTML(video.video_url || "")}"
                placeholder="https://youtube.com/watch?v=..."
            />

            <button
                type="button"
                class="btn btn-light remove-video-btn"
            >
                × Remove
            </button>
        `;

        videoInputs.appendChild(row);
    });

    updateVideoButtons();
}
        document.getElementById("lessonForm").classList.remove("hidden");

    } catch (error) {
        console.error("Edit lesson error:", error);
    }
}

// ==========================================
// Update Lesson
// ==========================================

async function updateLesson(
    id,
    category,
    title,
    description,
    photos,
    videoUrls
) {
    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/api/lessons/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },

                body: JSON.stringify({
                    category,
                    title,
                    description,
                    photos,
                    videoUrls
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showMessage(
                data.message || "Failed to update lesson."
            );
            return;
        }

        showMessage("Lesson and video updated successfully!");

        editingLessonId = null;

        document
            .getElementById("lessonFormElement")
            .reset();

        document
            .getElementById("lessonForm")
            .classList.add("hidden");

        await loadLessons();

    } catch (error) {
        console.error("Update lesson error:", error);

        showMessage("Unable to connect to backend.");
    }
}

// ==========================================
// Delete Lesson
// ==========================================

async function deleteLesson(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) {
        return;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/api/lessons/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Failed to delete lesson."
            );
            return;
        }

        alert("Lesson deleted successfully!");

        await loadLessons();

    } catch (error) {
        console.error("Delete lesson error:", error);

        alert("Unable to connect to backend.");
    }
}

// ==========================================
// Message
// ==========================================

function showMessage(message) {

    const box =
        document.getElementById("lessonMessage");

    box.textContent = message;

    box.classList.remove("hidden");

    setTimeout(() => {
        box.classList.add("hidden");
    }, 3000);
}

// ==========================================
// Security
// ==========================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

window.editLesson = editLesson;
window.deleteLesson = deleteLesson;