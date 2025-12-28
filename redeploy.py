#!/usr/bin/env python3
"""
PLP TMS - Quick Redeploy Script
Run: python redeploy.py
"""

import paramiko
import time

password = '#I%$QtovrCn+7HhuWO0icVexby5^9!'
# Fix password string
password = password.replace('$', r'\$')

print("=" * 50)
print("PLP TMS - Redeploy with New Ports")
print("=" * 50)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("\nConnecting to 157.10.73.82...")
    client.connect('157.10.73.82', username='ubuntu', password=password)
    print("OK Connected!")

    sftp = client.open_sftp()

    # Upload files
    print("\n[Step 1] Uploading updated configuration...")
    sftp.put('.env.production', '/home/ubuntu/plp-tms/.env')
    print("  UP: .env.production")

    sftp.put('docker-compose.yml', '/home/ubuntu/plp-tms/docker-compose.yml')
    print("  UP: docker-compose.yml")

    sftp.put('nginx/default.conf', '/home/ubuntu/plp-tms/nginx/default.conf')
    print("  UP: nginx/default.conf")

    sftp.close()

    # Restart containers
    print("\n[Step 2] Stopping old containers...")
    client.exec_command('cd /home/ubuntu/plp-tms && docker compose down')
    time.sleep(5)

    print("[Step 3] Starting new containers...")
    stdin, stdout, stderr = client.exec_command('cd /home/ubuntu/plp-tms && docker compose up -d --build')
    time.sleep(30)

    print("[Step 4] Waiting for database...")
    client.exec_command('sleep 5')

    print("[Step 5] Running migrations...")
    client.exec_command('cd /home/ubuntu/plp-tms && docker exec plp_tms_backend npx prisma migrate deploy')
    time.sleep(10)

    print("[Step 6] Container Status...")
    stdin, stdout, stderr = client.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
    status = stdout.read().decode()
    print(status if status.strip() else "No containers running")

    print("\n" + "=" * 50)
    print("Configuration Complete!")
    print("=" * 50)
    print("\nUpdate your DNS records to point:")
    print("  mentoring.sovathc.org -> 157.10.73.82")
    print("\nThen configure Nginx Proxy Manager with:")
    print("  Frontend: mentoring.sovathc.org -> localhost:2000 (SSL)")
    print("  API: mentoring.sovathc.org:2001 -> localhost:2001 (SSL)")
    print("\nLocal access (via SSH tunnel):")
    print("  Frontend: http://localhost:2000")
    print("  API: http://localhost:2001")

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
