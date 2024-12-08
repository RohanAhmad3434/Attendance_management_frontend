document.addEventListener("DOMContentLoaded", function () {
    // Fetch teachers and courses when the page loads
    fetchTeachers();
    fetchCourses();
});

const apiBase = "http://localhost:8080/api/admin";

// Fetch all teachers (users with role 'Teacher')
function fetchTeachers() {
    fetch(`${apiBase}/users`)
        .then(response => response.json())
        .then(data => {
            const teacherTableBody = document.querySelector("#teacherList tbody");
            const teacherSelect = document.querySelector("#assignTeacher");

            teacherTableBody.innerHTML = ""; // Clear any existing content
            teacherSelect.innerHTML = '<option value="">Select Teacher</option>'; // Reset dropdown

            // Filter users with the role "Teacher"
            const teachers = data.filter(user => user.role === "Teacher");

            teachers.forEach(teacher => {
                // Populate Teacher Table
                const row = document.createElement("tr");

                const usernameCell = document.createElement("td");
                usernameCell.textContent = teacher.username;
                row.appendChild(usernameCell);

                const roleCell = document.createElement("td");
                roleCell.textContent = teacher.role;
                row.appendChild(roleCell);

                const actionsCell = document.createElement("td");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.onclick = () => editTeacher(teacher.id);
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.onclick = () => deleteTeacher(teacher.id);
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);
                teacherTableBody.appendChild(row);

                // Populate Teacher Dropdown
                const option = document.createElement("option");
                option.value = teacher.id;
                option.textContent = teacher.username;
                teacherSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching teachers:", error));
}


// Fetch and display courses
function fetchCourses() {
    fetch(`${apiBase}/courses`)
        .then(response => response.json())
        .then(data => {
            const courseTableBody = document.querySelector("#courseList tbody");
            const courseSelect = document.querySelector("#assignCourse");

            courseTableBody.innerHTML = ""; // Clear any existing content
            courseSelect.innerHTML = '<option value="">Select Course</option>'; // Reset dropdown

            data.forEach(course => {
                // Populate Course Table
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.textContent = course.name;
                row.appendChild(nameCell);

                const teacherCell = document.createElement("td");
                if (course.teacherId) {
                    fetchTeacher(course.teacherId, teacherName => {
                        teacherCell.textContent = teacherName;
                    });
                } else {
                    teacherCell.textContent = "No teacher assigned";
                }
                row.appendChild(teacherCell);

                courseTableBody.appendChild(row);

                // Populate Course Dropdown
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching courses:", error));
}

// Fetch teacher details based on teacherId
function fetchTeacher(teacherId, callback) {
    fetch(`${apiBase}/teachers/${teacherId}`)
        .then(response => response.json())
        .then(teacher => {
            if (teacher && teacher.username) {
                callback(teacher.username);
            } else {
                callback("No teacher assigned");
            }
        })
        .catch(error => {
            console.error(`Error fetching teacher for ID ${teacherId}:`, error);
            callback("No teacher assigned");
        });
}

// Add teacher via API
document.querySelector("#addTeacherForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const teacherData = {
        username: document.querySelector("#username").value,
        password: document.querySelector("#password").value,
        role: document.querySelector("#role").value, // Always 'Teacher'
    };

    fetch(`${apiBase}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherData),
    })
        .then(response => {
            if (response.ok) {
                alert("Teacher added successfully!");
                fetchTeachers(); // Refresh teacher data
            } else {
                alert("Error adding teacher.");
            }
        })
        .catch(error => console.error("Error adding teacher:", error));
});

// Edit teacher
function editTeacher(teacherId) {
    const username = prompt("Enter new username:");
    const password = prompt("Enter new password:");

    if (!username || !password) return;

    const updatedData = { username, password, role: "Teacher" };

    fetch(`${apiBase}/users/${teacherId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => {
            if (response.ok) {
                alert("Teacher updated successfully!");
                fetchTeachers();
                fetchCourses();//---------------------------------------------Refresh courses-------
            } else {
                alert("Error updating teacher.");
            }
        })
        .catch(error => console.error("Error updating teacher:", error));
}

// Delete teacher
function deleteTeacher(teacherId) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    fetch(`${apiBase}/users/${teacherId}`, {
        method: "DELETE",
    })
        .then(response => {
            if (response.ok) {
                alert("Teacher deleted successfully!");
                fetchTeachers();
                fetchCourses();//---------------------------------------------Refresh courses-------
            } else {
                alert("Error deleting teacher.");
            }
        })
        .catch(error => console.error("Error deleting teacher:", error));
}

// Assign teacher to course
document.querySelector("#assignTeacherButton").addEventListener("click", function () {
    const teacherId = document.querySelector("#assignTeacher").value;
    const courseId = document.querySelector("#assignCourse").value;

    if (!teacherId || !courseId) {
        alert("Please select both a teacher and a course.");
        return;
    }

    fetch(`${apiBase}/assign-teacher/${courseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherId),
    })
        .then(response => {
            if (response.ok) {
                alert("Teacher assigned to course successfully!");
                fetchCourses();
                
            } else {
                alert("Error assigning teacher to course.");
            }
        })
        .catch(error => console.error("Error assigning teacher to course:", error));
});
