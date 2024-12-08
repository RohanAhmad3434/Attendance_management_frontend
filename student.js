const apiBase = "http://localhost:8080/api/student"; // Update this URL as needed

// Fetch and display the attendance records for the logged-in student
function loadAttendanceRecords(studentId) {
    const url = `${apiBase}/attendance/${studentId}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch attendance records.");
            }
            return response.json();
        })
        .then(attendanceRecords => {
            const tableBody = document.querySelector("#attendance-table tbody");
            tableBody.innerHTML = ""; // Clear previous data

            if (attendanceRecords === "No attendance records found for this student.") {
                tableBody.innerHTML = `<tr><td colspan="4">${attendanceRecords}</td></tr>`;
                return;
            }

            attendanceRecords.forEach(record => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${record.course.id}</td>
                    <td>${record.course.name}</td>
                    <td>${record.date}</td>
                    <td>${record.status}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading attendance records:", error);
        });
}

// Fetch courses for the student to select for checking running attendance
function loadCoursesForStudent(studentId) {
    const url = `${apiBase}/attendance/${studentId}`; // Using attendance endpoint to infer courses
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch courses for the student.");
            }
            return response.json();
        })
        .then(attendanceRecords => {
            const courseSelect = document.getElementById("courseSelect");
            courseSelect.innerHTML = ""; // Clear previous options

            if (attendanceRecords === "No attendance records found for this student.") {
                const option = document.createElement("option");
                option.textContent = "No courses available.";
                option.disabled = true;
                courseSelect.appendChild(option);
                return;
            }

            // Extract unique courses from attendance records
            const courses = [...new Map(attendanceRecords.map(record => [
                record.course.id,
                { id: record.course.id, name: record.course.name },
            ])).values()];

            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading courses for student:", error);
        });
}

// Check running attendance for a selected course
function checkRunningAttendance(studentId) {
    const courseId = document.getElementById("courseSelect").value;
    if (!courseId) {
        alert("Please select a course.");
        return;
    }

    const url = `${apiBase}/checkRunningAttendance/${studentId}/${courseId}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to check running attendance.");
            }
            return response.text();
        })
        .then(message => {
            document.getElementById("runningAttendance").textContent = message;
        })
        .catch(error => {
            console.error("Error checking running attendance:", error);
        });
}

// Add event listeners for actions
document.addEventListener("DOMContentLoaded", () => {
    const studentId = localStorage.getItem("userId"); // Retrieve logged-in student's ID

    if (!studentId) {
        alert("Student not logged in.");
        window.location.href = "index.html";
        return;
    }

    // Load initial data
    loadAttendanceRecords(studentId);
    loadCoursesForStudent(studentId);

    // Set up event listener for checking running attendance
    document.getElementById("checkAttendance").addEventListener("click", () => {
        checkRunningAttendance(studentId);
    });

    //Logout button logic
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("userId");
        window.location.href = "index.html";
    });
});
