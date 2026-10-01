// =====================================================
// HAMRO AAWAJ - VIDEO MANAGEMENT
// =====================================================
console.log("🔥🔥🔥 VIDEOS.JS CURRENT FILE IS RUNNING 🔥🔥🔥");

const API_BASE_URL =
    "https://providers-cylinder-have-cap.trycloudflare.com/api";

// =====================================================
// ELEMENTS
// =====================================================

const videoForm =
    document.getElementById("videoForm");

const videoUploadForm =
    document.getElementById("videoUploadForm");

const addVideoBtn =
    document.getElementById("addVideoBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const videoTableBody =
    document.getElementById("videoTableBody");

const videoId =
    document.getElementById("videoId");

const videoTitle =
    document.getElementById("videoTitle");

const videoLesson =
    document.getElementById("videoLesson");

const videoUrl =
    document.getElementById("videoUrl");

const formTitle =
    document.getElementById("formTitle");

const saveVideoBtn =
    document.getElementById("saveVideoBtn");

const messageBox =
    document.getElementById("message");


// =====================================================
// TOKEN
// =====================================================

function getToken() {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message, type = "success") {

    messageBox.textContent = message;

    messageBox.classList.remove("hidden");

    if (type === "success") {

        messageBox.style.background = "#d1fae5";
        messageBox.style.color = "#065f46";

    } else {

        messageBox.style.background = "#fee2e2";
        messageBox.style.color = "#991b1b";
    }

    setTimeout(() => {

        messageBox.classList.add("hidden");

    }, 4000);
}


// =====================================================
// OPEN ADD FORM
// =====================================================

addVideoBtn.addEventListener("click", () => {

    resetForm();

    formTitle.textContent = "Add Video";

    saveVideoBtn.textContent = "Save Video";

    videoForm.classList.remove("hidden");
});


// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener("click", () => {

    videoForm.classList.add("hidden");

    resetForm();
});


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    videoUploadForm.reset();

    videoId.value = "";

    formTitle.textContent = "Add Video";

    saveVideoBtn.textContent = "Save Video";
}


// =====================================================
// LOAD LESSONS
// =====================================================

async function loadLessons() {

    const token = getToken();

    if (!token) {

        showMessage(
            "Please log in as admin.",
            "error"
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/lessons`,
            {
                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load lessons"
            );
        }

        const lessons =
            Array.isArray(data)
                ? data
                : data.lessons || [];

        videoLesson.innerHTML = `
            <option value="">
                Select lesson
            </option>
        `;

        lessons.forEach(lesson => {

            const option =
                document.createElement("option");

            option.value =
                lesson._id;

            option.textContent =
                lesson.title;

            videoLesson.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Lesson loading error:",
            error
        );

        showMessage(
            "Unable to load lessons.",
            "error"
        );
    }
}


// =====================================================
// LOAD VIDEOS
// =====================================================

async function loadVideos() {

//     row.innerHTML = `
//     <td>
//         🎥 ${escapeHTML(
//             video.title || "Untitled"
//         )}
//     </td>

//     <td>
//         ${escapeHTML(lessonName)}
//     </td>

//     <td>
//         <a
//             href="${escapeHTML(video.video_url || "#")}"
//             target="_blank"
//             rel="noopener noreferrer"
//         >
//             View Video
//         </a>
//     </td>

//     <td>

//         <button
//             type="button"
//             class="action edit"
//             data-id="${video._id}"
//         >
//             Edit
//         </button>

//         <button
//             type="button"
//             class="action delete"
//             data-id="${video._id}"
//         >
//             Delete
//         </button>

//     </td>
// `;

    const token = getToken();

    if (!token) {

        videoTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Please log in.
                </td>
            </tr>
        `;

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/videos`,
            {
                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load videos"
            );
        }

        const videos =
            Array.isArray(data)
                ? data
                : data.videos || [];

        videoTableBody.innerHTML = "";

        if (videos.length === 0) {

            videoTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No videos found.
                    </td>
                </tr>
            `;

            return;
        }

        videos.forEach(video => {

            const row =
                document.createElement("tr");

            const lessonName =
                video.lesson?.title ||
                "N/A";

            row.innerHTML = `
                <td>
                    🎥 ${escapeHTML(
                        video.title || "Untitled"
                    )}
                </td>

                <td>
                    ${escapeHTML(lessonName)}
                </td>

                <td>
                    -
                </td>

                <td>
                    Published
                </td>

                <td>

                    <button
                        type="button"
                        class="action edit"
                        data-id="${video._id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="action delete"
                        data-id="${video._id}"
                    >
                        Delete
                    </button>

                </td>
            `;

            videoTableBody.appendChild(row);
        });


        // EDIT BUTTONS

        document
            .querySelectorAll(".edit")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editVideo(
                            button.dataset.id
                        );
                    }
                );
            });


        // DELETE BUTTONS

        document
            .querySelectorAll(".delete")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteVideo(
                            button.dataset.id
                        );
                    }
                );
            });

    } catch (error) {

        console.error(
            "Video loading error:",
            error
        );

        videoTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load videos.
                </td>
            </tr>
        `;

        showMessage(
            "Unable to load videos from the server.",
            "error"
        );
    }
}


// =====================================================
// ADD / UPDATE VIDEO
// =====================================================

videoUploadForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

console.log("🔥 FORM SUBMITTED");

console.log("🔥 VIDEO ID:", videoId.value);

console.log("🔥 VIDEO URL:", videoUrl.value);
        const title =
            videoTitle.value.trim();

        const lessonId =
            videoLesson.value;

        const videoURL =
            videoUrl.value.trim();

        const editingId =
            videoId.value;


        // Validation

        if (!title) {

            showMessage(
                "Please enter a video title.",
                "error"
            );

            return;
        }

        if (!lessonId) {

            showMessage(
                "Please select a lesson.",
                "error"
            );

            return;
        }

        if (!videoURL) {

            showMessage(
                "Please enter a video URL.",
                "error"
            );

            return;
        }


        const token = getToken();

        if (!token) {

            showMessage(
                "Please log in as admin.",
                "error"
            );

            return;
        }


        try {

            saveVideoBtn.disabled = true;

            saveVideoBtn.textContent =
                "Saving...";


            const body = {

                lesson: lessonId,

                title: title,

                video_url: videoURL
            };


            // =================================================
            // UPDATE
            // =================================================

            if (editingId) {
console.log("🔥 UPDATING VIDEO WITH:", body);
                const response =
                    await fetch(
                        `${API_BASE_URL}/videos/${editingId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify(body)
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update video"
                    );
                }

                showMessage(
                    "Video updated successfully!"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                const response =
                    await fetch(
                        `${API_BASE_URL}/videos`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify(body)
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create video"
                    );
                }

                showMessage(
                    "Video added successfully!"
                );
            }


            resetForm();

            videoForm.classList.add(
                "hidden"
            );

            await loadVideos();

        } catch (error) {

            console.error(
                "Save video error:",
                error
            );

            showMessage(
                error.message ||
                "Failed to save video.",
                "error"
            );

        } finally {

            saveVideoBtn.disabled =
                false;

            saveVideoBtn.textContent =
                "Save Video";
        }
    }
);


// =====================================================
// EDIT VIDEO
// =====================================================

async function editVideo(id) {

    const token = getToken();

    if (!token) {

        showMessage(
            "Please log in as admin.",
            "error"
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/videos/${id}`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to get video"
            );
        }

        const video =
            data.video || data;


        videoId.value =
            video._id;

        videoTitle.value =
            video.title || "";

        videoLesson.value =
            video.lesson?._id ||
            video.lesson ||
            "";

        videoUrl.value =
            video.video_url || "";


        formTitle.textContent =
            "Edit Video";

        saveVideoBtn.textContent =
            "Update Video";

        videoForm.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(
            "Edit video error:",
            error
        );

        showMessage(
            "Unable to load video information.",
            "error"
        );
    }
}


// =====================================================
// DELETE VIDEO
// =====================================================

async function deleteVideo(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this video?"
        );

    if (!confirmed) {
        return;
    }

    const token = getToken();

    if (!token) {

        showMessage(
            "Please log in as admin.",
            "error"
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/videos/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete video"
            );
        }

        showMessage(
            "Video deleted successfully!"
        );

        await loadVideos();

    } catch (error) {

        console.error(
            "Delete video error:",
            error
        );

        showMessage(
            "Failed to delete video.",
            "error"
        );
    }
}


// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener(
    "click",
    () => {
        loadVideos();
    }
);


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadLessons();

        await loadVideos();
    }
);