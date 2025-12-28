#!/usr/bin/env python3
"""
Fix PLP TMS Containers - Restart with correct configuration
"""

import paramiko
import time
import sys

password = '#I%$QtovrCn+7HhuWO0icVexby5^9!'

print("=" * 50)
print("PLP TMS - Fix Containers")
print("=" * 50)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("\nConnecting...")
    client.connect('157.10.73.82', username='ubuntu', password=password, timeout=10)
    print("Connected!")

    def run_cmd(cmd, wait=0):
        """Run command and print output"""
        print(f"\n>>> {cmd[:70]}..." if len(cmd) > 70 else f"\n>>> {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        output = stdout.read().decode()
        errors = stderr.read().decode()
        if output:
            print(output[:500])
        if errors and 'error' in errors.lower():
            print(f"ERROR: {errors[:200]}")
        if wait:
            time.sleep(wait)
        return output

    print("\n[Step 1] Current Status")
    run_cmd("docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

    print("\n[Step 2] Stopping containers...")
    run_cmd("cd /home/ubuntu/plp-tms && docker compose down", 3)

    print("\n[Step 3] Starting containers...")
    run_cmd("cd /home/ubuntu/plp-tms && docker compose up -d --build", 30)

    print("\n[Step 4] Waiting for database...")
    run_cmd("sleep 10")

    print("\n[Step 5] Checking database...")
    run_cmd("docker exec plp_tms_db pg_isready -U san_user -d san_training_app")

    print("\n[Step 6] Running migrations...")
    run_cmd("cd /home/ubuntu/plp-tms && docker exec plp_tms_backend npx prisma migrate deploy", 5)

    print("\n[Step 7] Final Status")
    run_cmd("docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")

    print("\n" + "=" * 50)
    print("Fix Complete!")
    print("=" * 50)
    print("\nTest with curl:")
    print("  curl http://157.10.73.82:2000/")
    print("  curl http://157.10.73.82:2001/api/")

except Exception as e:
    print(f"\nError: {e}")
    sys.exit(1)
finally:
    client.close()
