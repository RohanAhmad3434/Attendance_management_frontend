const apiUrl = "http://localhost:8080/api/admin";


document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadCourses();
  loadStudentsAndTeachers();
});


document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password || !role) {
      alert("All fields (username, password, and role) are required.");
      return;
  }

  const response = await fetch("http://localhost:8080/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
  });

  if (response.ok) {
      alert("User added successfully!");
      loadUsers();
  } else if (response.status === 409) {
      alert("Username is already taken.");
  } else {
      alert("Error adding user.");
  }
});

//load users
async function loadUsers() {
  const response = await fetch(`${apiUrl}/users`);
  const users = await response.json();

  const userList = document.getElementById("user-list");
  userList.innerHTML = `
      <h3>Existing Users</h3>
      <ul>
          ${users
              .map(
                  (user) =>
                      `<li>
                          ${user.username} - ${user.role} 
                          <button onclick="deleteUser(${user.id})">Delete</button>
                          <button onclick="updateUser(${user.id})">Update</button>
                      </li>`
              )
              .join("")}
      </ul>`;
}

// Delete User
async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
      await fetch(`${apiUrl}/users/${userId}`, { method: "DELETE" });
      alert("User deleted successfully!");
      loadUsers();
  }
}

// Load Students and Teachers
async function loadStudentsAndTeachers() {
  const response = await fetch(`${apiUrl}/users`);
  const users = await response.json();

  const studentSelect = document.getElementById("studentId");
  const teacherSelect = document.getElementById("teacherId");

  users.forEach((user) => {
      if (user.role === "Student") {
          studentSelect.innerHTML += `<option value="${user.id}">${user.username}</option>`;
      }
      if (user.role === "Teacher") {
          teacherSelect.innerHTML += `<option value="${user.id}">${user.username}</option>`;
      }
  });
}