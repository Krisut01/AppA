let token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", function () {
    if (token) {
        // User is already logged in
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("message-section").style.display = "block";
        document.getElementById("logout-btn").style.display = "block";
        loadInbox();
    }
});

async function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            alert("Registration successful! You can now log in.");
        } else {
            const data = await response.json();
            document.getElementById("register-error").innerText = JSON.stringify(data);
        }
    } catch (error) {
        console.error(error);
        document.getElementById("register-error").innerText = "An error occurred.";
    }
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            token = data.access;  // Store the access token
            localStorage.setItem("token", token);  // Store the token in localStorage

            document.getElementById("auth-section").style.display = "none";
            document.getElementById("message-section").style.display = "block";
            document.getElementById("logout-btn").style.display = "block";
            console.log("Token after login:", token);  // Debugging token
        } else {
            const data = await response.json();
            document.getElementById("login-error").innerText = JSON.stringify(data);
        }
    } catch (error) {
        console.error(error);
        document.getElementById("login-error").innerText = "An error occurred.";
    }
}

async function sendMessage() {
    // Declare recipientUsername and content first
    const recipientUsername = document.getElementById("recipient").value;
    const content = document.getElementById("message-content").value;

    try {
        // Ensure the recipient username is provided
        if (!recipientUsername) {
            document.getElementById("message-error").innerText = "Recipient username is required.";
            return;
        }

        // Fetch the recipient data by username
        const userResponse = await fetch(`http://127.0.0.1:8000/api/messages/users/get_by_username/?username=${recipientUsername}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        // If the user is not found, handle the error
        if (!userResponse.ok) {
            const userData = await userResponse.json();
            document.getElementById("message-error").innerText = userData.detail || "Recipient not found.";
            return;
        }

        // Extract the recipient ID from the response
        const userData = await userResponse.json();
        const recipientId = userData.id;

        // Send the message to the recipient
        const response = await fetch("http://127.0.0.1:8000/api/messages/send/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                recipient: recipientId,  // Pass the recipient's ID
                content,                 // Pass the message content
            }),
        });

        // Handle success or failure
        if (response.ok) {
            alert("Message sent!");
            loadInbox();  // Reload the inbox after sending the message
        } else {
            const data = await response.json();
            document.getElementById("message-error").innerText = JSON.stringify(data);
        }
    } catch (error) {
        console.error(error);
        document.getElementById("message-error").innerText = "An error occurred while sending the message.";
    }
}

async function loadInbox() {
    if (!token) {
        console.error("Token is missing or expired. Please log in again.");
        document.getElementById("message-error").innerText = "Token is missing or expired.";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/messages/inbox/", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            document.getElementById("message-error").innerText = `Error: ${response.statusText}`;
            return;
        }

        const data = await response.json();
        const inboxDiv = document.getElementById("inbox");
        inboxDiv.innerHTML = "";

        // Loop through messages and display each one
        data.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.className = "message";
            messageDiv.innerHTML = `
                <p><strong>From:</strong> ${msg.sender_username || 'Unknown'}</p>
                <p><strong>Message:</strong> ${msg.content || 'No content'}</p>
                <p><strong>Date:</strong> ${msg.timestamp || 'No date'}</p>
            `;
            inboxDiv.appendChild(messageDiv);
        });
    } catch (error) {
        console.error(error);
        document.getElementById("message-error").innerText = "An error occurred while loading the inbox.";
    }
}
function logout() {
    localStorage.removeItem("token");
    token = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("message-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
}
