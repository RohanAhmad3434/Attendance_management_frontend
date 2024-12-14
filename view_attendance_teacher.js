const teacherId = localStorage.getItem("userId");

if (!teacherId) {
    alert("Invalid teacher ID. Redirecting to login.");
    window.location.href = "teacher.html";
}

// Fetch grouped attendance records for the teacher
function fetchAttendanceGroupedByDate() {
    const url = `http://localhost:8080/api/teacher/attendanceGroupedByDate/${teacherId}`;
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
                    const statusClass = record.status.toLowerCase() === "present" ? "present" : "absent";

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

// Go back button logic
document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "teacher.html";
});

// Fetch attendance records when the page loads
fetchAttendanceGroupedByDate();
