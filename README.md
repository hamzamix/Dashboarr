# Windows Remote Control Dashboard

This project is a full-stack application to remotely monitor and manage multiple Windows PCs from a central web dashboard.

## Architecture

The system consists of two main parts:

1.  **Central Server**: A Dockerized Python Flask application that serves the React frontend and provides a REST API for managing computers. It's designed to run 24/7 on a home server (e.g., a Linux machine).
2.  **Agent**: A Python script (`agent.py`) that runs on each Windows PC you want to manage. It reports system statistics to the server and executes commands received from it.

---

## How to Run (Using Docker & Portainer)

The entire application (frontend and backend) is built automatically inside a single Docker container.

### Prerequisites

-   A server with Docker and Portainer installed.
-   A GitHub repository containing all the project files.
-   Python 3 installed on the Windows PCs you want to manage.

### Step 1: Deploy the Server with Portainer

1.  Log in to Portainer and go to the appropriate environment.
2.  Click on **Stacks** in the left menu, then click **+ Add stack**.
3.  Give the stack a **Name** (e.g., `remote-control`).
4.  Select **Repository** as the build method.
5.  Enter your **Repository URL** (e.g., `https://github.com/your-username/your-repo.git`).
6.  Leave the other repository settings as default unless you need a specific branch or authentication.
7.  In the **Web editor**, paste the contents of the `docker-compose.yml` file.
8.  Click **Deploy the stack**.

Portainer will now pull your code from GitHub, use the multi-stage `Dockerfile` to build the frontend and backend into a single image, and start the container. The dashboard will be accessible at `http://<your-server-ip>:5000`.

**Important**: The `docker-compose.yml` is configured to create a `backend/data` directory on your Docker host machine inside the Portainer volumes folder. This is where `computers.json` will be stored to ensure your configuration persists.

### Step 2: Set up and Run the Agent on Each Windows PC

For each Windows computer you want to control:

1.  **Copy the `agent` folder** to the Windows machine (e.g., to `C:\rc-agent`).
2.  **Configure the server address:**
    -   Open `agent/agent.py` in a text editor.
    -   Change the `SERVER_URL` to point to your central server's IP address.
    ```python
    # agent/agent.py
    SERVER_URL = "http://192.168.1.100:5000" # <-- CHANGE THIS to your server's IP
    ```
3.  **Install Python dependencies:**
    -   Open a Command Prompt or PowerShell, navigate to the `agent` directory, and run:
    ```powershell
    cd C:\rc-agent
    pip install -r requirements.txt
    ```
4.  **Run the agent:**
    -   In the same terminal, run:
    ```powershell
    python agent.py
    ```
    -   The agent will now run and begin sending heartbeats.
    -   **Note**: To run the agent permanently, set it up as a startup task using Windows Task Scheduler.

### Step 3: Add Your Computer to the Dashboard

1.  Open the web dashboard in your browser (`http://<your-server-ip>:5000`).
2.  Click **"Add Computer"**.
3.  Enter a friendly name and the **exact local IP Address** of the Windows PC where the agent is running.
4.  Once added, the server will recognize the agent's next heartbeat, and the computer's status will turn "Online" in the dashboard. You can now manage it.

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
