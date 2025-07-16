import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory
from threading import Thread, Lock
import time

app = Flask(__name__, static_folder='../dist')

# --- Configuration & Data ---
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
COMPUTERS_FILE = os.path.join(DATA_DIR, 'computers.json')
os.makedirs(DATA_DIR, exist_ok=True)

# In-memory state with thread-safe lock
state = {
    "computers": [],
    "commands": {}, # { "computer_id": [command1, command2] }
    "last_heartbeat": {} # { "computer_id": timestamp }
}
state_lock = Lock()

# --- Data Persistence ---
def load_data():
    with state_lock:
        if not os.path.exists(COMPUTERS_FILE):
            state["computers"] = []
            return
        try:
            with open(COMPUTERS_FILE, 'r') as f:
                state["computers"] = json.load(f)
        except (IOError, json.JSONDecodeError):
            state["computers"] = []

def save_data():
    with state_lock:
        with open(COMPUTERS_FILE, 'w') as f:
            # Only save the persistent parts of the computer data
            computers_to_save = []
            for comp in state["computers"]:
                computers_to_save.append({
                    "id": comp.get("id"),
                    "name": comp.get("name"),
                    "ipAddress": comp.get("ipAddress"),
                    "apps": [
                        {
                            "id": app.get("id"),
                            "name": app.get("name"),
                            "path": app.get("path"),
                            "processName": app.get("processName"),
                            "args": app.get("args", "")
                        } for app in comp.get("apps", [])
                    ]
                })
            json.dump(computers_to_save, f, indent=4)

# --- Helper Functions ---
def find_computer(computer_id):
    with state_lock:
        for comp in state["computers"]:
            if comp['id'] == computer_id:
                return comp
    return None

def find_computer_by_ip(ip):
    with state_lock:
        for comp in state["computers"]:
            if comp.get('ipAddress') == ip:
                return comp
    return None

def find_app(computer, app_id):
    for app_data in computer.get('apps', []):
        if app_data['id'] == app_id:
            return app_data
    return None

def add_command(computer_id, command):
    with state_lock:
        if computer_id not in state["commands"]:
            state["commands"][computer_id] = []
        state["commands"][computer_id].append(command)

# --- API Endpoints ---
@app.route('/api/computers', methods=['GET'])
def get_computers():
    with state_lock:
        # Create a deep copy to avoid modifying the state directly
        computers_copy = json.loads(json.dumps(state["computers"]))
        for comp in computers_copy:
             # Add transient state not stored in the file
            comp['isOnline'] = comp['id'] in state["last_heartbeat"]
            if not comp.get('stats'):
                comp['stats'] = {'cpuUsage': 0, 'memUsage': 0, 'totalProcesses': 0}
            if not comp.get('apps'):
                comp['apps'] = []
            for app_data in comp['apps']:
                if 'isRunning' not in app_data:
                    app_data['isRunning'] = False
                if 'cpuUsage' not in app_data:
                    app_data['cpuUsage'] = 0
                if 'memUsage' not in app_data:
                    app_data['memUsage'] = 0

    return jsonify(computers_copy)


@app.route('/api/computers', methods=['POST'])
def add_computer():
    data = request.json
    if not data or 'name' not in data or 'ipAddress' not in data:
        return jsonify({"message": "Missing name or ipAddress"}), 400

    new_computer = {
        "id": str(uuid.uuid4()),
        "name": data['name'],
        "ipAddress": data['ipAddress'],
        "isOnline": False,
        "stats": { "cpuUsage": 0, "memUsage": 0, "totalProcesses": 0 },
        "apps": []
    }
    with state_lock:
        state["computers"].append(new_computer)
    save_data()
    return jsonify(new_computer), 201

@app.route('/api/computers/<computer_id>', methods=['DELETE'])
def delete_computer(computer_id):
    with state_lock:
        comp_to_delete = find_computer(computer_id)
        if not comp_to_delete:
            return jsonify({"message": "Computer not found"}), 404
        state["computers"] = [c for c in state["computers"] if c['id'] != computer_id]
        if computer_id in state["commands"]:
            del state["commands"][computer_id]
        if computer_id in state["last_heartbeat"]:
            del state["last_heartbeat"][computer_id]
    save_data()
    return "", 204

@app.route('/api/computers/<computer_id>/apps', methods=['POST'])
def add_app(computer_id):
    computer = find_computer(computer_id)
    if not computer:
        return jsonify({"message": "Computer not found"}), 404
    data = request.json
    if not all(k in data for k in ['name', 'path', 'processName']):
         return jsonify({"message": "Missing app data"}), 400

    new_app = {
        "id": str(uuid.uuid4()),
        "name": data['name'],
        "path": data['path'],
        "processName": data['processName'],
        "args": data.get('args', ""),
        "isRunning": False,
        "cpuUsage": 0,
        "memUsage": 0
    }
    if 'apps' not in computer:
        computer['apps'] = []

    with state_lock:
      computer['apps'].append(new_app)
    save_data()
    return jsonify(new_app), 201


@app.route('/api/computers/<computer_id>/apps/<app_id>', methods=['DELETE'])
def delete_app(computer_id, app_id):
    computer = find_computer(computer_id)
    if not computer:
        return jsonify({"message": "Computer not found"}), 404
    
    with state_lock:
      app_found = find_app(computer, app_id)
      if not app_found:
          return jsonify({"message": "App not found"}), 404
      computer['apps'] = [a for a in computer['apps'] if a['id'] != app_id]
    
    save_data()
    return "", 204

@app.route('/api/computers/<computer_id>/apps/<app_id>/action', methods=['POST'])
def app_action(computer_id, app_id):
    computer = find_computer(computer_id)
    if not computer:
        return jsonify({"message": "Computer not found"}), 404
    app_data = find_app(computer, app_id)
    if not app_data:
        return jsonify({"message": "App not found"}), 404
    
    data = request.json
    action = data.get('action') # 'start' or 'stop'
    if action not in ['start', 'stop']:
        return jsonify({"message": "Invalid action"}), 400
        
    command = {"type": f"{action}_app", "app": app_data}
    add_command(computer_id, command)
    return jsonify({"message": f"Command '{action}' for app '{app_data['name']}' queued."}), 202

@app.route('/api/computers/<computer_id>/action', methods=['POST'])
def system_action(computer_id):
    if not find_computer(computer_id):
        return jsonify({"message": "Computer not found"}), 404

    data = request.json
    action = data.get('action') # 'shutdown' or 'restart'
    if action not in ['shutdown', 'restart']:
        return jsonify({"message": "Invalid action"}), 400
    
    command = {"type": action}
    add_command(computer_id, command)
    return jsonify({"message": f"Command '{action}' queued."}), 202

@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    agent_ip = request.remote_addr
    computer = find_computer_by_ip(agent_ip)
    if not computer:
        # Silently ignore heartbeats from unknown IPs
        return jsonify({"commands": []})

    data = request.json
    with state_lock:
        # Update status and stats
        computer['isOnline'] = True
        computer['stats'] = data.get('system_stats', computer.get('stats'))
        
        # Update individual app stats
        process_stats = {p['name']: p for p in data.get('process_stats', [])}
        for app_data in computer.get('apps', []):
            proc_name = app_data.get('processName')
            if proc_name in process_stats:
                app_data['isRunning'] = True
                app_data['cpuUsage'] = process_stats[proc_name]['cpu_usage']
                app_data['memUsage'] = process_stats[proc_name]['mem_usage']
            else:
                app_data['isRunning'] = False
                app_data['cpuUsage'] = 0
                app_data['memUsage'] = 0
        
        state["last_heartbeat"][computer['id']] = time.time()
        
        # Get pending commands
        commands_to_send = state["commands"].pop(computer['id'], [])

    return jsonify({"commands": commands_to_send})

# --- Serve React App ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- Background Task for Offline Status ---
def check_offline_status():
    while True:
        with state_lock:
            now = time.time()
            offline_ids = []
            for comp_id, last_time in state["last_heartbeat"].items():
                if now - last_time > 15:  # 15 seconds timeout
                    offline_ids.append(comp_id)
            
            for comp_id in offline_ids:
                del state["last_heartbeat"][comp_id]
                computer = find_computer(comp_id)
                if computer:
                    computer['isOnline'] = False

        time.sleep(5) # Check every 5 seconds

if __name__ == '__main__':
    load_data()
    offline_checker = Thread(target=check_offline_status, daemon=True)
    offline_checker.start()
    app.run(host='0.0.0.0', port=5000)