const API_URL = "https://providers-cylinder-have-cap.trycloudflare.com";

let editingCategoryId = null;

document.addEventListener("DOMContentLoaded", () => {
    checkAdmin();
});


// ================================
// Check Admin Authentication
// ================================

async function checkAdmin() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/protected`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await response.json();

        if (!response.ok || !data.user || data.user.role !== "admin") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";
            return;
        }

        loadCategories();
        setupCategoryForm();

    } catch (error) {
        console.error("Authentication error:", error);
    }
}


// ================================
// Load Categories
// ================================

async function loadCategories() {
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("categoryTableBody");

    try {
        const response = await fetch(`${API_URL}/api/categories`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const categories = await response.json();

        if (!response.ok) {
            console.error(categories.message);
            return;
        }

        tableBody.innerHTML = "";

        if (categories.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No categories found.
                    </td>
                </tr>
            `;
            return;
        }

        categories.forEach(category => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>0</td>
                <td>
                    <button
                        class="action edit"
                        onclick="editCategory('${category._id}', '${escapeQuotes(category.name)}', '${escapeQuotes(category.description)}')"
                    >
                        Edit
                    </button>

                    <button
                        class="action delete"
                        onclick="deleteCategory('${category._id}')"
                    >
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


// ================================
// Add / Edit Form
// ================================

function setupCategoryForm() {

    const addButton = document.getElementById("addCategoryBtn");
    const cancelButton = document.getElementById("cancelCategoryBtn");
    const form = document.getElementById("categoryForm");

    addButton.addEventListener("click", () => {

        editingCategoryId = null;

        document.getElementById("categoryFormTitle").textContent =
            "Add Category";

        form.reset();

        document.getElementById("categoryFormCard").style.display =
            "block";
    });


    cancelButton.addEventListener("click", () => {

        editingCategoryId = null;

        form.reset();

        document.getElementById("categoryFormCard").style.display =
            "none";
    });


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("categoryName").value.trim();

        const description =
            document.getElementById("categoryDescription").value.trim();

        if (!name || !description) {
            return;
        }

        if (editingCategoryId) {
            await updateCategory(
                editingCategoryId,
                name,
                description
            );
        } else {
            await createCategory(
                name,
                description
            );
        }
    });
}


// ================================
// Create Category
// ================================

async function createCategory(name, description) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/api/categories`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },

                body: JSON.stringify({
                    name,
                    description
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to create category.");
            return;
        }

        showMessage("Category created successfully!");

        document.getElementById("categoryForm").reset();

        document.getElementById("categoryFormCard").style.display =
            "none";

        loadCategories();

    } catch (error) {

        console.error("Create category error:", error);

        showMessage("Unable to connect to backend.");
    }
}


// ================================
// Edit Category
// ================================

function editCategory(id, name, description) {

    editingCategoryId = id;

    document.getElementById("categoryFormTitle").textContent =
        "Edit Category";

    document.getElementById("categoryName").value = name;

    document.getElementById("categoryDescription").value =
        description;

    document.getElementById("categoryFormCard").style.display =
        "block";
}


// ================================
// Update Category
// ================================

async function updateCategory(id, name, description) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/api/categories/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },

                body: JSON.stringify({
                    name,
                    description
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to update category.");
            return;
        }

        showMessage("Category updated successfully!");

        editingCategoryId = null;

        document.getElementById("categoryForm").reset();

        document.getElementById("categoryFormCard").style.display =
            "none";

        loadCategories();

    } catch (error) {

        console.error("Update category error:", error);

        showMessage("Unable to connect to backend.");
    }
}


// ================================
// Delete Category
// ================================

async function deleteCategory(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
        return;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/api/categories/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete category.");
            return;
        }

        alert("Category deleted successfully!");

        loadCategories();

    } catch (error) {

        console.error("Delete category error:", error);

        alert("Unable to connect to backend.");
    }
}


// ================================
// Show Message
// ================================

function showMessage(message) {

    const messageBox =
        document.getElementById("categoryMessage");

    messageBox.textContent = message;

    messageBox.classList.remove("hidden");

    setTimeout(() => {
        messageBox.classList.add("hidden");
    }, 3000);
}


// ================================
// Escape quotes for HTML
// ================================

function escapeQuotes(value) {

    return value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// Make functions available to buttons
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
