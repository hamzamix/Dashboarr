import requests
import time
import psutil
import subprocess
import os
import platform

# --- CONFIGURATION ---
# IMPORTANT: CHANGE THIS to your server's IP address and port.
SERVER_URL = "http://127.0.0.1:5000"
HEARTBEAT_INTERVAL = 5  # seconds

def get_system_stats():
    """Gathers overall system statistics."""
    return {
        "cpuUsage": psutil.cpu_percent(interval=1),
        "memUsage": psutil.virtual_memory().percent,
        "totalProcesses": len(psutil.pids())
    }

def get_process_stats(process_names):
    """Gathers stats for a specific list of process names."""
    running_processes = {}
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            if proc.info['name'] in process_names:
                # Accumulate stats if multiple processes have the same name
                if proc.info['name'] not in running_processes:
                    running_processes[proc.info['name']] = {'cpu_usage': 0, 'mem_usage': 0, 'count': 0}
                
                # cpu_percent can be > 100 on multi-core systems, divide by core count
                running_processes[proc.info['name']]['cpu_usage'] += proc.info['cpu_percent'] / psutil.cpu_count()
                running_processes[proc.info['name']]['mem_usage'] += proc.info['memory_percent']
                running_processes[proc.info['name']]['count'] += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    # Format the output to match the expected structure
    formatted_stats = []
    for name, stats in running_processes.items():
        formatted_stats.append({
            "name": name,
            "cpu_usage": stats['cpu_usage'],
            "mem_usage": stats['mem_usage'],
        })
    return formatted_stats

def execute_command(command):
    """Executes a command received from the server."""
    cmd_type = command.get('type')
    print(f"Executing command: {cmd_type}")

    try:
        if cmd_type == 'start_app':
            app_info = command.get('app')
            # Use Popen for non-blocking start
            subprocess.Popen([app_info['path']] + app_info.get('args', '').split())
            print(f"Started: {app_info['name']}")

        elif cmd_type == 'stop_app':
            app_info = command.get('app')
            # Use os.system for simplicity, can be replaced with psutil for more control
            if platform.system() == "Windows":
                os.system(f"taskkill /f /im {app_info['processName']}")
            else: # Linux/macOS
                 os.system(f"pkill -f {app_info['processName']}")
            print(f"Stopped: {app_info['name']}")

        elif cmd_type == 'restart':
            os.system("shutdown /r /t 1")

        elif cmd_type == 'shutdown':
            os.system("shutdown /s /t 1")
    except Exception as e:
        print(f"Error executing command '{cmd_type}': {e}")

def send_heartbeat():
    """Sends stats to the server and gets commands."""
    try:
        # First, get a list of required process names from the server
        # This is a conceptual step; our current server doesn't provide this.
        # So we'll have to get it from the last known state or assume a static list.
        # For now, we will scan all processes and the server will filter.
        # A more optimized agent would get the list of apps to monitor first.
        
        # A simple implementation: we just get all processes. The backend will have to do the matching.
        # This is inefficient but works for this architecture.
        # In a real-world scenario, the agent would register and get a list of apps to monitor.
        all_process_stats = get_process_stats([p.info['name'] for p in psutil.process_iter(['name'])])
        
        payload = {
            "system_stats": get_system_stats(),
            "process_stats": all_process_stats
        }
        
        response = requests.post(f"{SERVER_URL}/api/heartbeat", json=payload, timeout=10)
        response.raise_for_status()
        
        commands = response.json().get('commands', [])
        if commands:
            print(f"Received {len(commands)} command(s).")
            for command in commands:
                execute_command(command)

    except requests.exceptions.RequestException as e:
        print(f"Could not connect to server: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Agent started. Press Ctrl+C to stop.")
    print(f"Connecting to server at: {SERVER_URL}")
    while True:
        send_heartbeat()
        time.sleep(HEARTBEAT_INTERVAL)