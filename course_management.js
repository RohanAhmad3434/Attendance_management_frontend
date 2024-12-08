const apiBase = "http://localhost:8080/api/admin";

// Fetch all courses
function fetchCourses() {
    fetch(`${apiBase}/courses`)
        .then(response => response.json())
        .then(data => populateCourseTable(data))
        .catch(error => console.error("Error fetching courses:", error));
}

// Populate the course table
function populateCourseTable(courses) {
    const courseTableBody = document.querySelector("#courseList tbody");
    courseTableBody.innerHTML = ""; // Clear any existing rows

    courses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td>${course.teacherId || "None"}</td>
            <td>
                <button onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        `;
        courseTableBody.appendChild(row);
    });
}

// Add a course
document.querySelector("#addCourseForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const courseName = document.querySelector("#courseName").value;
    const teacherId = document.querySelector("#teacherId").value || null;

    const courseData = { name: courseName, teacherId: teacherId ? parseInt(teacherId) : null };

    fetch(`${apiBase}/courses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
    })
        .then(async response => {
            if (response.ok) {
                alert("Course added successfully!");
                fetchCourses();
            } else {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
            }
        })
        .catch(error => console.error("Error adding course:", error));
});

// Update a course
document.querySelector("#updateCourseForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const courseId = document.querySelector("#updateCourseId").value;
    const courseName = document.querySelector("#updateCourseName").value;
    const teacherId = document.querySelector("#updateTeacherId").value || null;

    const courseData = { name: courseName, teacherId: teacherId ? parseInt(teacherId) : null };

    fetch(`${apiBase}/courses/${courseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
    })
        .then(response => {
            if (response.ok) {
                alert("Course updated successfully!");
                fetchCourses();
            } else {
                alert("Failed to update course.");
            }
        })
        .catch(error => console.error("Error updating course:", error));
});

// Delete a course
function deleteCourse(courseId) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    fetch(`${apiBase}/courses/${courseId}`, {
        method: "DELETE",
    })
        .then(response => {
            const messageDiv = document.getElementById("messageArea"); // A div to display messages
            if (response.ok) {
                return response.text().then(message => {
                    alert(message || "Course deleted successfully!");
                    messageDiv.textContent = message || "Course deleted successfully!";
                    messageDiv.style.color = "green";
                    fetchCourses(); // Refresh course list
                });
            } else {
                return response.text().then(errorMessage => {
                    alert(errorMessage || "Failed to delete course.");
                    messageDiv.textContent = errorMessage || "Failed to delete course.";
                    messageDiv.style.color = "red";
                });
            }
        })
        .catch(error => {
            console.error("Error deleting course:", error);
            const messageDiv = document.getElementById("messageArea");
            messageDiv.textContent = "An error occurred while deleting the course. Check console for details.";
            messageDiv.style.color = "red";
        });
}


// Initial load of courses
document.addEventListener("DOMContentLoaded", fetchCourses);
