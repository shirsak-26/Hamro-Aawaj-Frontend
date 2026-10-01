console.log("🔥 LESSON DETAILS JS IS RUNNING");
const API_BASE_URL ="https://providers-cylinder-have-cap.trycloudflare.com/api";

// Get token from localStorage or sessionStorage
function getAuthToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Get lesson ID from URL
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const lessonTitle = document.getElementById("lessonTitle");
const lessonDescription = document.getElementById("lessonDescription");
const lessonPhoto = document.getElementById("lessonPhoto");
const videoContainer = document.getElementById("videoContainer");
const categoryTag = document.getElementById("categoryTag");

async function loadLesson() {
  if (!lessonId) {
    showError("No lesson selected.");
    return;
  }

  const token = getAuthToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    // Get lesson
    const lessonResponse = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const lesson = await lessonResponse.json();
console.log("🔥 FULL LESSON:", lesson);
    if (!lessonResponse.ok) {
      throw new Error(lesson.message || "Failed to load lesson.");
    }

    displayLesson(lesson);

    // Get videos
    await loadVideos(token);
  } catch (error) {
    console.error("Error loading lesson:", error);
    showError(error.message);
  }
}

function displayLesson(lesson) {
  const title = document.getElementById("lessonTitle");

  const description = document.getElementById("lessonDescription");

  const learningDescription = document.getElementById("learningDescription");

  const photo = document.getElementById("lessonPhoto");

  const category = document.getElementById("categoryTag");

  if (title) {
    title.textContent = lesson.title || "Untitled Lesson";
  }

  if (description) {
    description.textContent = lesson.description || "";
  }

  if (learningDescription) {
    learningDescription.textContent = lesson.description || "";
  }

  if (category) {
    category.textContent = lesson.category?.name || "NSL Lesson";
  }

  if (photo) {
    if (lesson.photo) {
      photo.src = lesson.photo;

      photo.alt = lesson.title || "Lesson image";

      photo.style.display = "block";
    } else {
      photo.style.display = "none";
    }
  }

  document.title = `${lesson.title || "Lesson"} | Hamro Aawaj`;
}

async function loadVideos(token) {
   
console.log("🔥 loadVideos() started");
 try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const videos = await response.json();
console.log("🔥 ALL VIDEOS:", videos);
        if (!response.ok) {
            throw new Error(
                videos.message || "Failed to load videos."
            );
        }

        // Only videos belonging to this lesson
        const lessonVideos = videos.filter((video) => {
            console.log("🔥 VIDEO OBJECT:", video);
    console.log("🔥 VIDEO LESSON:", video.lesson);
    console.log("🔥 VIDEO LESSON ID:", video.lesson?._id || video.lesson);
    console.log("🔥 CURRENT LESSON ID:", lessonId);
            const videoLessonId =
                video.lesson?._id || video.lesson;

            return String(videoLessonId) === String(lessonId);
        });

        // ⭐ THIS WAS MISSING
        
console.log("🔥 LESSON ID:", lessonId);
console.log("🔥 LESSON VIDEOS:", lessonVideos);
        displayVideos(lessonVideos);

    } catch (error) {
        console.error("Error loading videos:", error);

        if (videoContainer) {
            videoContainer.innerHTML = `
                <p>
                    Additional videos could not be loaded.
                </p>
            `;
        }
    }
}

function displayVideos(videos) {
  if (videos.length === 0) {
    videoContainer.innerHTML = `
            <p>No videos available for this lesson yet.</p>
        `;
    return;
  }

  videoContainer.innerHTML = "";

  videos.forEach((video) => {
    const videoCard = document.createElement("div");
    videoCard.className = "card";
    videoCard.style.marginBottom = "20px";

    console.log("VIDEO URL:", video.video_url);
console.log("YOUTUBE ID:", getYouTubeVideoId(video.video_url));

    const youtubeId = getYouTubeVideoId(video.video_url);

    if (youtubeId) {
      videoCard.innerHTML = `
                <h3>${escapeHTML(video.title)}</h3>

                <div
                    style="
                        position:relative;
                        width:100%;
                        padding-bottom:56.25%;
                        height:0;
                        overflow:hidden;
                        border-radius:10px;
                        margin-top:10px;
                    "
                >

                    <iframe
                        src="https://www.youtube.com/embed/${youtubeId}"
                        title="${escapeHTML(video.title)}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="
                            position:absolute;
                            top:0;
                            left:0;
                            width:100%;
                            height:100%;
                        "
                    ></iframe>

                </div>
            `;
    } else {
      videoCard.innerHTML = `
                <h3>${escapeHTML(video.title)}</h3>

                <video
                    controls
                    width="100%"
                    style="
                        border-radius:10px;
                        margin-top:10px;
                    "
                >
                    <source
                        src="${escapeHTML(video.video_url)}"
                        type="video/mp4"
                    >
                    Your browser does not support the video element.
                </video>
            `;
    }

    videoContainer.appendChild(videoCard);
  });
  
}
function getYouTubeVideoId(url) {
    try {
        const parsedUrl = new URL(url);

        // youtube.com/watch?v=VIDEO_ID
        if (
            parsedUrl.hostname === "www.youtube.com" ||
            parsedUrl.hostname === "youtube.com"
        ) {
            if (parsedUrl.pathname === "/watch") {
                return parsedUrl.searchParams.get("v");
            }

            // youtube.com/embed/VIDEO_ID
            if (parsedUrl.pathname.startsWith("/embed/")) {
                return parsedUrl.pathname
                    .split("/embed/")[1]
                    .split("?")[0];
            }

            // youtube.com/shorts/VIDEO_ID
            if (parsedUrl.pathname.startsWith("/shorts/")) {
                return parsedUrl.pathname
                    .split("/shorts/")[1]
                    .split("?")[0];
            }
        }

        // youtu.be/VIDEO_ID
        if (parsedUrl.hostname === "youtu.be") {
            return parsedUrl.pathname
                .substring(1)
                .split("?")[0];
        }

        return null;

    } catch (error) {
        console.error("Invalid video URL:", url);
        return null;
    }
}

function showError(message) {
  if (videoContainer) {
    videoContainer.innerHTML = `
            <p style="color:red;">
                ${escapeHTML(message)}
            </p>
        `;
  } else {
    console.error(message);
  }
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
}

// Start
loadLesson();
