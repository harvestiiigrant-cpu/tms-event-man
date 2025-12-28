#!/usr/bin/env python3
import paramiko, time, sys

PASSWORD = '#I%$QtovrCn+7HhuWO0icVexby5^9!'

print("Starting PLP TMS containers...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect('157.10.73.82', username='ubuntu', password=PASSWORD, timeout=10)

    commands = [
        ('sudo docker ps -a --filter "name=plp"', 'Current status:'),
        ('cd /home/ubuntu/plp-tms && sudo docker compose down', 'Stopping...', 5),
        ('cd /home/ubuntu/plp-tms && sudo docker compose up -d --build', 'Starting... (wait 2 min)', 120),
        ('sleep 30', 'Waiting for startup', 0),
        ('sudo docker ps -a --filter "name=plp"', 'Final status:'),
        ('cd /home/ubuntu/plp-tms && sudo docker exec plp_tms_backend npx prisma migrate deploy 2>&1 || echo "Done"', 'Migrations:'),
    ]

    for cmd_tuple in commands:
        cmd = cmd_tuple[0]
        label = cmd_tuple[1] if len(cmd_tuple) > 1 else ""
        wait_time = cmd_tuple[2] if len(cmd_tuple) > 2 else 0

        if label:
            print(f"\n[*] {label}")

        stdin, stdout, stderr = client.exec_command(cmd, timeout=180)
        output = stdout.read().decode()

        if output.strip():
            lines = output.split('\n')
            for line in lines[:15]:
                if line.strip():
                    print(f"    {line}")
            if len(lines) > 15:
                print(f"    ... ({len(lines)} lines)")

        if wait_time:
            time.sleep(wait_time)

    print("\n" + "=" * 60)
    print("Containers should be running on:")
    print("  Frontend: http://157.10.73.82:2000")
    print("  API:      http://157.10.73.82:2001/api")
    print("=" * 60)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
finally:
    client.close()
