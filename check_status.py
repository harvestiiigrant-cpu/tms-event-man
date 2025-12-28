#!/usr/bin/env python3
"""Check detailed status"""

import paramiko

password = '#I%$QtovrCn+7HhuWO0icVexby5^9!'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('157.10.73.82', username='ubuntu', password=password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode() + stderr.read().decode()

print("=== All Docker Containers ===")
print(run("docker ps -a"))

print("\n=== Check Docker Compose Status ===")
print(run("cd /home/ubuntu/plp-tms && docker compose ps -a"))

print("\n=== Recent Build Logs ===")
print(run("docker logs plp_tms_frontend --tail=50 2>&1 || echo 'No frontend container'"))

print("\n=== Backend Logs ===")
print(run("docker logs plp_tms_backend --tail=50 2>&1 || echo 'No backend container'"))

print("\n=== DB Logs ===")
print(run("docker logs plp_tms_db --tail=30 2>&1 || echo 'No DB container'"))

print("\n=== Listening Ports ===")
print(run("netstat -tlnp 2>/dev/null | grep -E '2000|2001|80' || ss -tlnp 2>/dev/null | grep -E '2000|2001|80'"))

client.close()
