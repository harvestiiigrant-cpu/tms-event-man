#!/usr/bin/env python3
"""Start containers with sudo"""

import paramiko
import time

password = '#I%$QtovrCn+7HhuWO0icVexby5^9!'

print("=" * 60)
print("PLP TMS - Start Containers with Sudo")
print("=" * 60)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("\nConnecting to server...")
    client.connect('157.10.73.82', username='ubuntu', password=password, timeout=10)
    print("Connected!")

    def run(cmd, desc="", wait=0):
        """Run command with output"""
        if desc:
            print(f"\n[*] {desc}")
        print(f"    $ {cmd[:60]}..." if len(cmd) > 60 else f"    $ {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out.strip():
            print(f"    {out[:200]}")
        if err.strip() and 'warning' not in err.lower():
            print(f"    ERROR: {err[:200]}")
        if wait:
            time.sleep(wait)
        return out

    print("\n" + "=" * 60)
    run("sudo docker ps -a --format 'table {{.Names}}\t{{.Status}}'", "Current Containers")

    run("cd /home/ubuntu/plp-tms && sudo docker compose down", "Stopping containers", 3)

    run("cd /home/ubuntu/plp-tms && sudo docker compose up -d --build", "Starting containers", 45)

    run("sleep 10", "Waiting for services")

    run("sudo docker exec plp_tms_db pg_isready -U san_user -d san_training_app", "Database health check")

    run("cd /home/ubuntu/plp-tms && sudo docker exec plp_tms_backend npx prisma migrate deploy", "Running migrations", 5)

    print("\n" + "=" * 60)
    run("sudo docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'", "Final Status")

    print("\n" + "=" * 60)
    print("Success! Containers should be running on:")
    print("  Frontend: http://157.10.73.82:2000")
    print("  API:      http://157.10.73.82:2001")
    print("=" * 60)

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
