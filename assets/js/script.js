  document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu-btn");
  if (menu) menu.addEventListener("click", () => nav.classList.toggle("open"));
  

  document.querySelectorAll("[data-search]").forEach((input) =>
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      document
        .querySelectorAll("[data-search-item]")
        .forEach(
          (item) =>
            (item.style.display = item.textContent.toLowerCase().includes(q)
              ? ""
              : "none"),
        );
    }),
  );
  document.querySelectorAll("[data-progress]").forEach((el) => {
    const v = el.dataset.progress;
    el.querySelector("span").style.width = v + "%";
  });
});

console.log("Frontend JavaScript is running");


