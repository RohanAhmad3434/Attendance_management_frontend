// Fetch and display attendance data
async function fetchAttendanceData() {
    const url = "http://localhost:8080/api/admin/attendanceGroupedByDate";

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attendance data');
        }

        const attendanceData = await response.json();
        renderAttendanceData(attendanceData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('attendanceContainer').innerHTML = `<p>Error fetching attendance data: ${error.message}</p>`;
    }
}


// Render the attendance data
function renderAttendanceData(data) {
    const container = document.getElementById('attendanceContainer');
    container.innerHTML = ''; // Clear previous content

    Object.entries(data).forEach(([date, details]) => {
        // Create a container for each date
        const dateContainer = document.createElement('div');
        dateContainer.classList.add('date-container');

        // Add the date heading
        const dateHeading = document.createElement('h3');
        dateHeading.textContent = `Date: ${date}`;
        dateContainer.appendChild(dateHeading);

        // Display total present and absent with custom classes
        const summary = document.createElement('p');
        summary.classList.add('attendance-summary');
        summary.innerHTML = `
            <strong>Total Present:</strong> <span class="total-present">${details.totalPresent}</span>,
            <strong>Total Absent:</strong> <span class="total-absent">${details.totalAbsent}</span>
        `;
        dateContainer.appendChild(summary);

        // Loop through each course and its attendance details
        Object.entries(details.courses).forEach(([courseName, records]) => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course-container');

            const courseHeading = document.createElement('h4');
            courseHeading.textContent = `Course: ${courseName}`;
            courseContainer.appendChild(courseHeading);

            // Create a table for attendance details
            const table = document.createElement('table');

            const headerRow = document.createElement('tr');
            ['Student Name', 'Teacher Name', 'Status'].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Add rows for each attendance record
            records.forEach(record => {
                const row = document.createElement('tr');

                ['studentName', 'teacherName', 'status'].forEach(field => {
                    const td = document.createElement('td');
                    td.textContent = record[field];
                    row.appendChild(td);
                });

                table.appendChild(row);
            });

            courseContainer.appendChild(table);
            dateContainer.appendChild(courseContainer);
        });

        container.appendChild(dateContainer);
    });
}

// Go back button logic
document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "admin.html";
});

// Fetch attendance data on page load
document.addEventListener('DOMContentLoaded', fetchAttendanceData);
