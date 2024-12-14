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

             // Add event listener to refresh student list based on selected course
             courseSelect.addEventListener("change", () => {
                const selectedValue = courseSelect.value;
                if (selectedValue === "") {
                    // Clear student list if "Select a course" is chosen
                    document.getElementById("studentList").innerHTML = "";
                } else {
                    // Refresh student list for the selected course
                   // loadStudents();
                }
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
        studentList.innerHTML = "";
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

     // Show confirmation alert
     const confirmMarking = confirm("Are you sure you want to mark attendance?");
     if (!confirmMarking) {
         // Clear course selection and student list if "Cancel" is clicked
         document.getElementById("courseSelect").value = "";
         document.getElementById("studentList").innerHTML = "";
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
            loadStudents();
        })
        .catch(error => {
            console.error("Error marking attendance:", error);
            alert("Could not mark attendance. Please try again.");
        });
}
  
document.getElementById("loadStudents").addEventListener("click", loadStudents);
document.getElementById("markAttendance").addEventListener("click", markAttendance);


 //Logout button logic
 document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("userId");
    window.location.href = "index.html";
});


// Event listener for "View Attendance Records" button
document.getElementById("viewAttendanceRecords").addEventListener("click", () => {
    window.location.href = "view_attendance_teacher.html";
});


// Initial fetch of courses
fetchCourses();