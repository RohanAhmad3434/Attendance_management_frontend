document.addEventListener("DOMContentLoaded", function() {

    // Fetch students, courses, and enrollments when the page loads
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
  
});






const apiBase = "http://localhost:8080/api/admin";

// Fetch all students (users with role 'Student')
function fetchStudents() {
    fetch(`${apiBase}/users`)
        .then(response => response.json())
        .then(data => {
            const studentList = document.querySelector("#studentList tbody");
            studentList.innerHTML = "";
             // Clear the dropdown
             const studentDropdown = document.querySelector("#enrollStudent");
             studentDropdown.innerHTML = `<option value="">Select Student</option>`; // Reset options
            data.forEach(user => {
                if (user.role === "Student") { // Only display users with role 'Student':
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.role}</td>
                        <td>
                            <button onclick="editStudent(${user.id})">Edit</button>
                            <button onclick="deleteStudent(${user.id})">Delete</button>
                        </td>
                    `;
                    studentList.appendChild(row);

                    // Populate Enroll Student Dropdown
                    const studentOption = document.createElement("option");
                    studentOption.value = user.id;
                    studentOption.textContent = user.username;
                    document.querySelector("#enrollStudent").appendChild(studentOption);
                }
            });
        });
}

// Fetch all courses
function fetchCourses() {
    fetch(`${apiBase}/courses`)
        .then(response => response.json())
        .then(data => {
            const courseSelect = document.querySelector("#enrollCourse");
            courseSelect.innerHTML = `<option value="">Select Course</option>`;
            data.forEach(course => {
                const courseOption = document.createElement("option");
                courseOption.value = course.id;
                courseOption.textContent = course.name;
                courseSelect.appendChild(courseOption);
            });
        });
}

// Fetch all enrollments
function fetchEnrollments() {
    fetch("http://localhost:8080/api/admin/enrollments")
        .then(response => response.json())
        .then(data => {
            const enrollmentList = document.querySelector("#enrollmentList");
            enrollmentList.innerHTML = "";
            data.forEach(enrollment => {
                const listItem = document.createElement("li");
                listItem.textContent = `${enrollment.student.username} enrolled in ${enrollment.course.name}`;
                enrollmentList.appendChild(listItem);
            });
        });
}


// Add student via API
document.querySelector("#addStudentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const studentData = {
        username: document.querySelector("#username").value,
        password: document.querySelector("#password").value,
        role: document.querySelector("#role").value, // Always 'Student'
    };

    fetch(`${apiBase}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
    })
        .then(async (response) => {
            if (response.ok) {
                // If response is 2xx
                const data = await response.json();
                alert("Student added successfully!");
                fetchStudents(); // Refresh student data
                fetchCourses();
                fetchEnrollments();
            } else if (response.status === 409) {
                // If response is 409 Conflict
                const errorMessage = await response.text();
                alert(errorMessage || "Username is already taken.");
            } else {
                // Handle other errors
                const errorMessage = await response.text();
                alert(`Error adding student: ${errorMessage}`);
            }
        })
        .catch((error) => {
            alert("An error occurred while adding the student.");
            console.error("Error:", error);
        });
});


// Edit student (update student)
function editStudent(studentId) {
    const username = prompt("Enter new username:");
    const password = prompt("Enter new password:");
    const role = prompt("Enter new role (Student/Teacher):");

    const updatedData = { username, password, role };

    fetch(`${apiBase}/users/${studentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Student updated successfully!");
        fetchStudents(); // Refresh student data
        fetchCourses();
        fetchEnrollments();
    });
}


// Delete student
function deleteStudent(studentId) {
    if (confirm("Are you sure you want to delete this student?")) {
        fetch(`http://localhost:8080/api/admin/users/${studentId}`, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) { // Assuming the backend sends a 'success' field in the response
                alert(data.message || "Student deleted successfully!"); 
                fetchStudents(); // Refresh student data
                fetchEnrollments(); // Refresh enrollments data
                fetchCourses();
            } else {
                alert(data.message || "Error deleting student!");
            }
        })
        .catch(error => {
            alert("An error occurred while deleting the student.");
            console.error(error);
        });
    }
}


// Enroll student in course
document.querySelector("#enrollButton").addEventListener("click", function () {
    const studentId = document.querySelector("#enrollStudent").value;
    const courseId = document.querySelector("#enrollCourse").value;

    if (!studentId || !courseId) {
        alert("Please select both a student and a course.");
        return;
    }

    const payload = { studentId, courseId };
    console.log("Sending payload:", payload);

    fetch("http://localhost:8080/api/admin/enroll", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            console.log("Response status:", response.status);
            return response.json(); // Read the response as JSON
        })
        .then(data => {
            console.log("Response data:", data);

            if (data.success) {
                alert(data.message || "Enrollment successful!");
                addEnrollmentToList(data.enrollment); // Add new enrollment
                fetchStudents();
                fetchCourses();
                fetchEnrollments();
            } else {
                alert(data.message || "Error enrolling student!");
            }
        })
        .catch(error => {
            alert("An error occurred while enrolling the student.");
            console.error("Error:", error);
        });
});

// Add a new enrollment to the enrollment list dynamically
function addEnrollmentToList(enrollment) {
    const enrollmentList = document.querySelector("#enrollmentList");

    if (enrollment && enrollment.student && enrollment.course) {
        const listItem = document.createElement("li");
        listItem.textContent = `${enrollment.student.username} enrolled in ${enrollment.course.name}`;
        enrollmentList.appendChild(listItem);
        fetchStudents(); // Refresh dropdowns and table
        fetchCourses();
        fetchEnrollments();
    } else {
        console.warn("Invalid enrollment data:", enrollment);
    }
}



function updateStudentDropdown(students) {
    const studentDropdown = document.querySelector("#enrollStudent");

    // Clear existing options
    studentDropdown.innerHTML = '<option value="">Select Student</option>';

    // Add new options
    students.forEach(student => {
        if (student.role === "Student") {
            const option = document.createElement("option");
            option.value = student.id;
            option.textContent = student.username;
            studentDropdown.appendChild(option);
        }
    });
}

// Go back button logic
document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "admin.html";
});