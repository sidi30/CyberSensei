# CyberSensei Local Development - Hosts File Configuration

## Why is this needed?

The CyberSensei local environment uses hostname-based routing through Traefik reverse proxy.
To access services via hostnames (e.g., `central.local`), you need to add entries to your system's hosts file.

## Required Entries

Add the following lines to your hosts file:

```
# CyberSensei Local Development
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
127.0.0.1 traefik.local
```

---

## Linux / macOS

### Manual Method

1. Open Terminal
2. Edit the hosts file:
   ```bash
   sudo nano /etc/hosts
   ```
3. Add the entries above at the end of the file
4. Save and exit (Ctrl+X, then Y, then Enter)
5. Flush DNS cache:
   - **macOS**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - **Linux**: `sudo systemctl restart systemd-resolved` or `sudo service nscd restart`

### Quick Script

```bash
# Add CyberSensei hosts
sudo bash -c 'cat >> /etc/hosts << EOF

# CyberSensei Local Development
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
127.0.0.1 traefik.local
EOF'
```

---

## Windows

### Manual Method

1. Open Notepad **as Administrator**
   - Right-click on Notepad → "Run as administrator"
2. Open the file: `C:\Windows\System32\drivers\etc\hosts`
3. Add the entries above at the end of the file
4. Save the file
5. Flush DNS cache:
   ```cmd
   ipconfig /flushdns
   ```

### PowerShell Script (Run as Administrator)

```powershell
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$entries = @"

# CyberSensei Local Development
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
127.0.0.1 traefik.local
"@

Add-Content -Path $hostsFile -Value $entries
ipconfig /flushdns
Write-Host "Hosts file updated successfully!" -ForegroundColor Green
```

---

## WSL2 (Windows Subsystem for Linux)

If you're running Docker inside WSL2, you need to update the hosts file in **both** Windows and WSL:

### In WSL:
```bash
sudo bash -c 'cat >> /etc/hosts << EOF

# CyberSensei Local Development
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
127.0.0.1 traefik.local
EOF'
```

### In Windows (PowerShell as Admin):
Run the PowerShell script above.

---

## Verification

After adding the entries, verify they work:

```bash
# Test DNS resolution
ping central.local

# Should show:
# Pinging central.local [127.0.0.1] ...
```

Or in a browser, open:
- http://central.local:8088

---

## Troubleshooting

### "Host not found" errors

1. Make sure you saved the hosts file correctly
2. Flush DNS cache (see commands above)
3. Try closing and reopening your browser
4. Check for typos in the hosts file

### Permission denied

- Make sure you're editing as Administrator (Windows) or with `sudo` (Linux/macOS)

### Docker-specific issues

If using Docker Desktop:
- Make sure Docker is running
- In Docker Desktop settings, ensure "Use WSL 2 based engine" is enabled (Windows)

---

## Removing Entries

To clean up when you're done:

### Linux/macOS:
```bash
sudo sed -i '/CyberSensei Local Development/,/traefik.local/d' /etc/hosts
```

### Windows (PowerShell as Admin):
```powershell
$content = Get-Content "C:\Windows\System32\drivers\etc\hosts"
$content | Where-Object { $_ -notmatch "CyberSensei|central\.local|node\.local|grafana\.local|prometheus\.local|alertmanager\.local|mailhog\.local|traefik\.local" } | Set-Content "C:\Windows\System32\drivers\etc\hosts"
```

