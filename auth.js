// auth.js

// Add an event listener to the form submission
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    // Get username and password values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    console.log("Username:", username);
    console.log("Password:", password);
  
    // Clear error message
    document.getElementById("error-message").style.display = 'none';
  
    // Create the request payload
    const loginData = {
        username: username,
        password: password
    };
  
    // Send login request to the backend API
    fetch("http://localhost:8080/api/login", { // Adjust the endpoint according to your actual login URL
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();  // Parse the JSON response
        } else {
            throw new Error("Invalid username or password");
        }
    })
    .then(data => {
        console.log("Login response:", data);
  
        // Ensure the response contains necessary data, including id and role
        const { id, role } = data;
  
        // Save id to localStorage (no need to save username)
        localStorage.setItem("userId", id);
        const zzz=localStorage.getItem("userId");
        console.log("User ID saved to localStorage:",zzz);
  
        // Redirect based on the role
        if (role === "Admin") {
            window.location.href = "Admin.html";  // Redirect to Admin page
        } else if (role === "Teacher") {
           window.location.href = "Teacher.html";  // Redirect to Teacher page
        } else if (role === "Student") {
            window.location.href = "Student.html";  // Redirect to Student page
        } else {
            throw new Error("Invalid role");
        }
    })
    .catch(error => {
        console.error("Login failed: ", error);
        document.getElementById("error-message").style.display = 'block';  // Show error message
    });
});
