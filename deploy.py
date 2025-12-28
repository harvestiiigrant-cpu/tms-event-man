#!/usr/bin/env python3
"""
PLP Training Management System - Production Deployment Script
Run: python deploy.py
"""

import os
import sys
import time
import paramiko
from pathlib import Path
from typing import List, Tuple

# Configuration
SERVER_IP = "157.10.73.82"
SERVER_USER = "ubuntu"
SERVER_PASSWORD = "#I%$QtovrCn+7HhuWO0icVexby5^9!"
PROJECT_DIR = "/home/ubuntu/plp-tms"
LOCAL_DIR = Path(__file__).parent.absolute()

print("=" * 50)
print("PLP TMS - Production Deployment")
print("=" * 50)

class SSHSession:
    def __init__(self, host, username, password):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.host = host
        self.username = username
        self.password = password
        self.sftp = None

    def connect(self):
        print(f"Connecting to {self.username}@{self.host}...")
        self.client.connect(self.host, username=self.username, password=self.password)
        self.sftp = self.client.open_sftp()
        print("OK Connected!")

    def run(self, command: str) -> Tuple[str, str]:
        """Run a command and return (stdout, stderr)"""
        cmd_display = command[:60] + "..." if len(command) > 60 else command
        print(f"  - {cmd_display}")
        stdin, stdout, stderr = self.client.exec_command(command)
        stdout_text = stdout.read().decode()
        stderr_text = stderr.read().decode()
        return stdout_text, stderr_text

    def upload_file(self, local_path: str, remote_path: str):
        """Upload a single file"""
        print(f"  UP: {os.path.basename(local_path)}")
        self.sftp.put(local_path, remote_path)

    def upload_dir(self, local_dir: str, remote_dir: str):
        """Upload a directory recursively"""
        dir_name = os.path.basename(local_dir.rstrip('/'))
        print(f"  UP: {dir_name}/")
        local_path = Path(local_dir)
        remote_path = remote_dir.rstrip('/')

        for item in local_path.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(local_path)
                remote_file = f"{remote_path}/{dir_name}/{rel_path}"
                local_file = str(item)
                try:
                    self.sftp.stat(os.path.dirname(remote_file))
                except:
                    self.sftp.mkdir(os.path.dirname(remote_file), mode=755)
                self.sftp.put(local_file, remote_file)

    def close(self):
        if self.sftp:
            self.sftp.close()
        self.client.close()


def main():
    ssh = SSHSession(SERVER_IP, SERVER_USER, SERVER_PASSWORD)

    try:
        ssh.connect()

        # Step 1: Check/Install Docker
        print("\n[Step 1] Checking Docker on server...")
        stdout, _ = ssh.run("which docker && docker --version")
        if not stdout.strip():
            print("Installing Docker...")
            ssh.run("sudo apt-get update -qq")
            ssh.run("sudo apt-get install -y -qq ca-certificates curl gnupg")
            ssh.run("sudo install -m 0755 -d /etc/apt/keyrings")
            ssh.run("curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg")
            ssh.run("sudo chmod a+r /etc/apt/keyrings/docker.gpg")
            ssh.run('echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null')
            ssh.run("sudo apt-get update -qq")
            ssh.run("sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin")
            ssh.run("sudo usermod -aG docker $USER")
            print("OK Docker installed")
        else:
            print(f"OK {stdout.strip()}")

        # Step 2: Create project directory
        print("\n[Step 2] Creating project directory...")
        ssh.run(f"sudo mkdir -p {PROJECT_DIR}")
        ssh.run(f"sudo chown -R {SERVER_USER}:{SERVER_USER} {PROJECT_DIR}")

        # Step 3: Upload configuration files
        print("\n[Step 3] Uploading configuration files...")
        config_files = [
            ("docker-compose.yml", f"{PROJECT_DIR}/docker-compose.yml"),
            (".env.production", f"{PROJECT_DIR}/.env"),
        ]
        for local, remote in config_files:
            ssh.upload_file(str(LOCAL_DIR / local), remote)

        # Upload nginx config
        ssh.sftp.mkdir(f"{PROJECT_DIR}/nginx", mode=755)
        ssh.upload_file(str(LOCAL_DIR / "nginx/default.conf"), f"{PROJECT_DIR}/nginx/default.conf")

        # Step 4: Upload source code directories
        print("\n[Step 4] Uploading source code...")
        dirs_to_upload = ["server", "prisma", "src", "public"]
        for dir_name in dirs_to_upload:
            local_dir = LOCAL_DIR / dir_name
            if local_dir.exists() and any(local_dir.iterdir()):
                ssh.upload_dir(str(local_dir), PROJECT_DIR)

        # Step 5: Upload config files
        print("\n[Step 5] Uploading config files...")
        config_files = [
            "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts",
            "tailwind.config.ts", "index.html", "postcss.config.js",
            "Dockerfile", "Dockerfile.backend"
        ]
        for file_name in config_files:
            local_file = LOCAL_DIR / file_name
            if local_file.exists():
                ssh.upload_file(str(local_file), f"{PROJECT_DIR}/{file_name}")

        # Step 6: Build and start containers
        print("\n[Step 6] Building and starting containers...")
        ssh.run(f"cd {PROJECT_DIR} && docker compose --env-file .env down -v 2>/dev/null || true")
        ssh.run(f"cd {PROJECT_DIR} && docker compose --env-file .env up -d --build")

        # Step 7: Wait for services
        print("\n[Step 7] Waiting for services to be ready...")
        time.sleep(15)
        ssh.run("docker exec plp_tms_db pg_isready -U san_user -d san_training_app || true")

        # Step 8: Run migrations
        print("\n[Step 8] Running database migrations...")
        ssh.run(f"cd {PROJECT_DIR} && docker exec plp_tms_backend npx prisma migrate deploy")

        # Step 9: Check status
        print("\n[Step 9] Checking container status...")
        stdout, _ = ssh.run(f"cd {PROJECT_DIR} && docker compose ps")
        print(stdout)

        print("\n" + "=" * 50)
        print("Deployment complete!")
        print("=" * 50)
        print(f"\nAccess your application at:")
        print(f"   Frontend: http://{SERVER_IP}")
        print(f"   API:      http://{SERVER_IP}/api")
        print(f"   pgAdmin:  http://{SERVER_IP}:5050 (email: admin@plp.local)")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
