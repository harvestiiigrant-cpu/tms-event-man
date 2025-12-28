#!/usr/bin/env python3
"""
Complete container restart with detailed logging
"""

import paramiko
import time
import sys
import os

# Fix encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

PASSWORD = '#I%$QtovrCn+7HhuWO0icVexby5^9!'

print("=" * 70)
print("PLP TMS - Full Container Restart & Fix")
print("=" * 70)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("\n[CONNECT] Connecting to 157.10.73.82...")
    client.connect('157.10.73.82', username='ubuntu', password=PASSWORD, timeout=10)
    print("[OK] Connected successfully")

    def exec_cmd(cmd, desc="", timeout=30, show_output=True):
        """Execute command and return full output"""
        if desc:
            print(f"\n[{desc}]")
        if show_output:
            print(f"  $ {cmd[:65]}{'...' if len(cmd) > 65 else ''}")

        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode()
        err = stderr.read().decode()

        if show_output:
            if out.strip():
                for line in out.split('\n')[:10]:
                    if line.strip():
                        print(f"    {line}")
                if len(out.split('\n')) > 10:
                    print(f"    ... ({len(out.split(chr(10)))} lines total)")
            if err.strip() and 'warning' not in err.lower():
                for line in err.split('\n')[:5]:
                    if line.strip():
                        print(f"    ERROR: {line}")

        return out, err

    # Step 1: Status check
    exec_cmd("sudo docker ps -a", "STEP 1: Current Status", show_output=True)

    # Step 2: Stop containers
    exec_cmd("cd /home/ubuntu/plp-tms && sudo docker compose down -v", "STEP 2: Stopping Containers")
    time.sleep(3)

    # Step 3: Cleanup
    exec_cmd("sudo docker system prune -f", "STEP 3: Cleaning Up", show_output=False)

    # Step 4: Verify files
    out, _ = exec_cmd("ls -lah /home/ubuntu/plp-tms/docker-compose.yml /home/ubuntu/plp-tms/.env", "STEP 4: Verify Config Files")

    # Step 5: Start with build
    print("\n[STEP 5: Building & Starting Containers]")
    print("  $ cd /home/ubuntu/plp-tms && sudo docker compose up -d --build")
    print("  (This may take 2-3 minutes for build...)")

    stdin, stdout, stderr = client.exec_command(
        "cd /home/ubuntu/plp-tms && sudo docker compose up -d --build 2>&1",
        timeout=300
    )

    # Read output in chunks while waiting
    for i in range(150):
        line = stdout.readline().decode()
        if line:
            print(f"    {line.rstrip()}")
        if not line and i > 60:  # Wait at least 60 seconds
            break
        time.sleep(0.5)

    time.sleep(30)

    # Step 6: Wait for database
    print("\n[STEP 6: Waiting for Database]")
    for attempt in range(30):
        out, _ = exec_cmd(
            "sudo docker exec plp_tms_db pg_isready -U san_user -d san_training_app",
            show_output=False
        )
        if "accepting" in out:
            print(f"  ✓ Database ready (attempt {attempt+1})")
            break
        print(f"  Waiting... ({attempt+1}/30)")
        time.sleep(2)
    else:
        print("  ⚠ Database timeout, continuing anyway...")

    # Step 7: Migrations
    print("\n[STEP 7: Running Migrations]")
    exec_cmd(
        "cd /home/ubuntu/plp-tms && sudo docker exec plp_tms_backend npx prisma migrate deploy",
        show_output=True
    )

    # Step 8: Final status
    print("\n[STEP 8: Final Container Status]")
    exec_cmd("sudo docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'", show_output=True)

    # Step 9: Port check
    print("\n[STEP 9: Port Verification]")
    out, _ = exec_cmd("sudo netstat -tlnp 2>/dev/null | grep -E '2000|2001|3000' || echo 'Ports may not be bound yet'", show_output=True)

    # Step 10: Quick connectivity test
    print("\n[STEP 10: Connectivity Test]")
    exec_cmd("curl -s -o /dev/null -w 'Frontend (2000): %{http_code}\\n' http://localhost:2000/", show_output=True)
    exec_cmd("curl -s -o /dev/null -w 'API (2001): %{http_code}\\n' http://localhost:2001/api/", show_output=True)

    print("\n" + "=" * 70)
    print("OK RESTART COMPLETE")
    print("=" * 70)
    print("\nAccess your application:")
    print("  Frontend: https://mentoring.sovathc.org (via nginx-proxy-manager)")
    print("  Direct:   http://157.10.73.82:2000")
    print("  API:      http://157.10.73.82:2001/api")
    print("\nIf still getting 500 error:")
    print("  1. Check container logs: docker logs plp_tms_frontend")
    print("  2. Verify Nginx Proxy Manager points to localhost:2000")
    print("  3. SSH and run: cd /home/ubuntu/plp-tms && docker compose logs -f")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    client.close()
    print("\n[DONE] Disconnected from server")
