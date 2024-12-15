const apiBase = "http://localhost:8080/api/student";

function loadAttendanceRecords(studentId) {
    const url = `${apiBase}/attendanceGroupedByDate/${studentId}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch attendance records.");
            }
            return response.json();
        })
        .then(attendanceGroupedByDate => {
            const recordsContainer = document.getElementById("attendance-records-container");
            recordsContainer.innerHTML = ""; // Clear previous data

            // Check if there are no attendance records
            if (attendanceGroupedByDate === "No attendance records found for this student.") {
                recordsContainer.innerHTML = `<p>${attendanceGroupedByDate}</p>`;
                return;
            }

            // Iterate over each grouped date
            for (const [date, records] of Object.entries(attendanceGroupedByDate)) {
                // Create a new section for each date
                const dateSection = document.createElement("section");
                dateSection.className = "attendance-group";

                // Date Header
                const dateHeader = document.createElement("h3");
                dateHeader.textContent = `Attendance for  :  ${date}`;
                dateSection.appendChild(dateHeader);

                // Create a table for each date
                const table = document.createElement("table");
                table.className = "attendance-table";
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Teacher Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                const tbody = table.querySelector("tbody");

                // Add rows for each record in the date group
                records.forEach(record => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${record.courseName}</td>
                        <td>${record.teacherName}</td>
                        <td>${record.status}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Append the table to the section
                dateSection.appendChild(table);
                recordsContainer.appendChild(dateSection);
            }
        })
        .catch(error => {
            console.error("Error loading attendance records:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const studentId = localStorage.getItem("userId"); // Retrieve logged-in student's ID

    if (!studentId) {
        alert("Student not logged in.");
        window.location.href = "index.html";
        return;
    }

    // Load initial data
    loadAttendanceRecords(studentId);


    document.getElementById("goBack").addEventListener("click", () => {
        window.location.href = "student.html";
    });
    
});
