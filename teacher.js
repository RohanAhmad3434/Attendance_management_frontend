const apiBase = "http://localhost:8080/api/teacher";
const zase="http://localhost:8080/api/student";
// Retrieve the teacher ID from local storage
const teacherId = localStorage.getItem("userId");
if (!teacherId) {
    console.error("Teacher ID is not available.");
    alert("Please log in again.");
    window.location.href = "index.html";
}

// Fetch courses for the teacher
function fetchCourses() {
  const url = `${apiBase}/courses/${teacherId}`;
  fetch(url)
      .then(response => response.json())
      .then(courses => {
          const courseSelect = document.getElementById("courseSelect");
          courseSelect.innerHTML = `<option value="">Select a course</option>`;
          courses.forEach(course => {
              const option = document.createElement("option");
              option.value = course.courseId; // Use courseId here
              option.textContent = `${course.courseName} (ID: ${course.courseId})`; // Show both name and ID
              courseSelect.appendChild(option);
          });
      })
      .catch(error => {
          console.error("Error fetching courses:", error);
          alert("Could not load courses.");
      });
}

// Load students enrolled in the selected course whose attendance has not been marked today
function loadStudents() {
    const courseId = document.getElementById("courseSelect").value;
  
    if (!courseId) {
        alert("Please select a course.");
        return;
    }
  
    const url = `${apiBase}/courses/${courseId}/studentsNotMarkedToday`;  // New API URL
    fetch(url)
        .then(response => {
            if (response.status === 404) {
                // Handle case when no students are enrolled in the course
                return response.json().then(data => {
                    throw new Error(data.message || "No students enrolled in this course.");
                });
            }
            return response.json();
        })
        .then(students => {
            const studentList = document.getElementById("studentList");
            studentList.innerHTML = ""; // Clear previous student list
  
            if (students.length === 0) {
                studentList.innerHTML = "<p>No students available to mark attendance.</p>";
                return;
            }
  
            students.forEach(student => {
                const studentId = student.studentId; // Adjust based on your response structure
                const studentName = student.studentName; // Adjust based on your response structure
  
                const div = document.createElement("div");
                div.className = "student";
                div.dataset.studentId = studentId;
                div.dataset.status = ""; // Default status
  
                div.textContent = `${studentName} (ID: ${studentId})`; // Show both name and ID
  
                const presentButton = document.createElement("button");
                presentButton.textContent = "Present";
                presentButton.addEventListener("click", () => {
                    div.dataset.status = "Present";
                    div.style.backgroundColor = "lightgreen";
                });
  
                const absentButton = document.createElement("button");
                absentButton.textContent = "Absent";
                absentButton.addEventListener("click", () => {
                    div.dataset.status = "Absent";
                    div.style.backgroundColor = "lightcoral";
                });
  
                div.appendChild(presentButton);
                div.appendChild(absentButton);
                studentList.appendChild(div);
            });
  
            document.getElementById("markAttendance").style.display = "block";
        })
        .catch(error => {
            console.log("Error loading students:", error);
            const studentList = document.getElementById("studentList");
            studentList.innerHTML = `<p>${error.message}</p>`;  // Show the error message from the API
        });
  }
  

// Mark attendance for students
function markAttendance() {
    const courseId = document.getElementById("courseSelect").value;

    if (!courseId) {
        alert("Please select a course.");
        return;
    }

    const students = document.querySelectorAll("#studentList .student");

    if (students.length === 0) {
        alert("No students available for marking attendance.");
        return;
    }

    const attendanceData = Array.from(students).map(student => ({
        teacherId: parseInt(teacherId),
        courseId: parseInt(courseId),
        studentId: parseInt(student.dataset.studentId),
        status: student.dataset.status || "Absent", // Default to "Absent" if not marked
    }));

    fetch(`${apiBase}/markAttendance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Attendance marked successfully.");
          //  fetchAttendanceRecords(); // Update the attendance record table
          fetchAttendanceGroupedByDate();
            loadStudents();
        })
        .catch(error => {
            console.error("Error marking attendance:", error);
            alert("Could not mark attendance. Please try again.");
        });
}
  

// Fetch attendance records for the teacher
// function fetchAttendanceRecords() {
//     const url = `${apiBase}/attendanceRecords/${teacherId}`;
//     fetch(url)
//         .then(response => response.json())
//         .then(records => {
//             const recordTableBody = document.getElementById("attendanceRecordTableBody");
//             recordTableBody.innerHTML = ""; // Clear previous records

//             records.forEach(record => {
//                 const row = document.createElement("tr");
//                 row.innerHTML = `
//                     <td>${record.teacherName}</td>
//                     <td>${record.studentName}</td>
//                     <td>${record.courseName}</td>
//                     <td>${record.date}</td>
//                     <td>${record.status}</td>
//                 `;
//                 recordTableBody.appendChild(row);
//             });
//         })
//         .catch(error => {
//             console.error("Error fetching attendance records:", error);
//             alert("Could not load attendance records.");
//         });
// }




// Fetch attendance records grouped by date for the teacher

function fetchAttendanceGroupedByDate() {
    const url = `${apiBase}/attendanceGroupedByDate/${teacherId}`;
    fetch(url)
        .then(response => response.json())
        .then(groupedRecords => {
            const groupedRecordsDiv = document.getElementById("attendanceGroupedRecords");
            groupedRecordsDiv.innerHTML = ""; // Clear previous records

            // Loop through each date in the response
            for (const [date, records] of Object.entries(groupedRecords)) {
                const dateSection = document.createElement("div");
                dateSection.className = "date-group";

                // Date header
                const dateHeader = document.createElement("h3");
                dateHeader.textContent = `Date: ${date}`;
                dateSection.appendChild(dateHeader);

                // Table for records on that date
                const table = document.createElement("table");
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Teacher Name</th>
                            <th>Student Name</th>
                            <th>Course Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                const tbody = table.querySelector("tbody");

                // Add rows for each record
                records.forEach(record => {
                    const row = document.createElement("tr");

                    // Assign 'present' or 'absent' class based on record.status
                    const statusClass = record.status.toLowerCase() === 'present' ? 'present' : 'absent';
                    row.innerHTML = `
                        <td>${record.teacherName}</td>
                        <td>${record.studentName}</td>
                        <td>${record.courseName}</td>
                        <td class="${statusClass}">${record.status}</td>
                    `;
                    tbody.appendChild(row);
                });

                dateSection.appendChild(table);
                groupedRecordsDiv.appendChild(dateSection);
            }
        })
        .catch(error => {
            console.error("Error fetching grouped attendance records:", error);
            alert("Could not load grouped attendance records.");
        });
}



// Event listeners
document.getElementById("loadStudents").addEventListener("click", loadStudents);
document.getElementById("markAttendance").addEventListener("click", markAttendance);


 //Logout button logic
 document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("userId");
    window.location.href = "index.html";
});

// Initial fetch of courses
fetchCourses();
// fetchAttendanceRecords();
fetchAttendanceGroupedByDate();
