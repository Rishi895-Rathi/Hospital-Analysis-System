📋 Commands Reference Guide

This file documents all commands used in this project with their meanings.

---

## 🖥️ Local Development

### Backend

| Command | Meaning |
|---------|---------|
| `./gradlew bootRun` | Spring Boot app locally run karo |
| `./gradlew build -x test` | JAR build karo, tests skip karo |
| `./gradlew clean bootRun` | Clean build karke run karo |
| `./gradlew --stop` | Gradle daemon band karo |
| `chmod +x gradlew` | gradlew ko executable banao |

### Frontend

| Command | Meaning |
|---------|---------|
| `npm install` | Dependencies install karo |
| `npm run dev` | Development server start karo |
| `npm run build` | Production build banao |

---

## 🐳 Docker Commands

| Command | Meaning |
|---------|---------|
| `docker pull redis` | Redis image download karo |
| `docker run -d -p 6379:6379 --name redis-server redis` | Redis container start karo |
| `docker ps` | Running containers dekho |
| `docker ps -a` | Sab containers dekho (stopped bhi) |
| `docker start redis-server` | Stopped Redis container start karo |
| `docker stop redis-server` | Redis container band karo |
| `docker logs hospital-app` | Container logs dekho |
| `docker-compose up --build` | Docker compose se build aur start karo |
| `docker-compose down` | Docker compose band karo |

---

## ☁️ AWS EC2 Commands

### SSH Connection

| Command | Meaning |
|---------|---------|
| `ssh -i "hospital-key.pem" ubuntu@<EC2-IP>` | EC2 se SSH connect karo |

### System Setup

| Command | Meaning |
|---------|---------|
| `sudo apt update` | Package list update karo |
| `sudo apt install openjdk-17-jdk -y` | Java 17 install karo |
| `sudo apt install git -y` | Git install karo |
| `sudo apt install docker.io -y` | Docker install karo |
| `sudo apt install nginx -y` | Nginx install karo |
| `sudo apt install certbot python3-certbot-nginx -y` | SSL certbot install karo |

### Swap Memory

| Command | Meaning |
|---------|---------|
| `sudo fallocate -l 2G /swapfile` | 2GB swap file banao |
| `sudo chmod 600 /swapfile` | Swap file permissions set karo |
| `sudo mkswap /swapfile` | Swap space initialize karo |
| `sudo swapon /swapfile` | Swap activate karo |
| `free -h` | Memory usage dekho |

### App Management

| Command | Meaning |
|---------|---------|
| `nohup java -Xmx400m -Xms128m -jar app.jar > app.log 2>&1 &` | Background mein app run karo |
| `tail -f app.log` | Live logs dekho |
| `ps aux | grep java` | Java processes dekho |
| `sudo kill $(sudo lsof -t -i:8081)` | Port 8081 pe running process kill karo |

### Systemd Service

| Command | Meaning |
|---------|---------|
| `sudo systemctl daemon-reload` | Systemd config reload karo |
| `sudo systemctl enable hospital` | Service auto-start on boot enable karo |
| `sudo systemctl start hospital` | Service start karo |
| `sudo systemctl stop hospital` | Service stop karo |
| `sudo systemctl restart hospital` | Service restart karo |
| `sudo systemctl status hospital` | Service status dekho |
| `sudo journalctl -u hospital -n 50` | Service logs dekho |

### Nginx

| Command | Meaning |
|---------|---------|
| `sudo nginx -t` | Nginx config test karo |
| `sudo systemctl restart nginx` | Nginx restart karo |
| `sudo certbot --nginx -d hospital-rishi.duckdns.org` | SSL certificate lo |

---

## 🔧 Git Commands

| Command | Meaning |
|---------|---------|
| `git init` | New git repo initialize karo |
| `git add .` | Saari changes stage karo |
| `git commit -m "message"` | Changes commit karo |
| `git push` | Remote repo pe push karo |
| `git pull` | Remote se latest code lo |
| `git pull origin main --rebase` | Rebase ke saath pull karo |
| `git stash` | Local changes temporarily save karo |
| `git stash pop` | Stashed changes wapas lao |
| `git log --oneline -5` | Last 5 commits dekho |
| `git status` | Current status dekho |

---

## 🗄️ PostgreSQL Commands (pgAdmin)

| Command | Meaning |
|---------|---------|
| `CREATE DATABASE hospital_db;` | Database banao |
| `TRUNCATE TABLE appointments CASCADE;` | Table data delete karo (cascade) |
| `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS on_leave BOOLEAN DEFAULT false;` | Column add karo |
| `ALTER SEQUENCE doctors_id_seq RESTART WITH 1;` | ID sequence reset karo |

---

## 🌐 Network Commands

| Command | Meaning |
|---------|---------|
| `curl http://localhost:8081/api-docs` | API locally test karo |
| `netstat -ano | findstr :8081` | Port 8081 pe kya chal raha hai dekho |
| `ps aux | grep java` | Java processes dekho |

---

## 📦 Memory Management

| Flag | Meaning |
|------|---------|
| `-Xmx400m` | Maximum heap memory 400MB |
| `-Xms128m` | Starting heap memory 128MB |
| `-x test` | Tests skip karo during build |

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://hospital-analysis-system.vercel.app |
| Backend API | https://hospital-rishi.duckdns.org |
| Swagger UI | https://hospital-rishi.duckdns.org/swagger-ui.html |
| GitHub Repo | https://github.com/Rishi895-Rathi/Hospital-Analysis-System |

---

## 📝 Environment Variables (.env)

| Variable | Meaning |
|----------|---------|
| `DB_URL` | PostgreSQL database connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | JWT token signing secret key |
| `JWT_EXPIRATION` | Token expiry time (milliseconds) |
| `REDIS_HOST` | Redis server host |
| `REDIS_PORT` | Redis server port |


## 🔄 GitHub Actions / CI-CD

| Command/Action | Meaning |
|----------------|---------|
| `git push` | Code push karo — auto deploy trigger hoga |
| GitHub → Actions tab | Deployment status dekho |
| "Re-run all jobs" | Failed workflow dobara run karo |

## 🔑 GitHub Secrets

| Secret | Meaning |
|--------|---------|
| `EC2_HOST` | EC2 ka Elastic IP |
| `EC2_SSH_KEY` | EC2 SSH private key (github_actions file) |

## 🔄 EC2 Start/Stop Workflow

### Start karne ka order:
| Step | Action |
|------|--------|
| 1 | AWS RDS → Start → Available hone tak wait karo |
| 2 | AWS EC2 → Start |
| 3 | SSH connect karo |
| 4 | `sudo docker start redis` |
| 5 | `sudo systemctl start hospital` |

### Stop karne ka order:
| Step | Action |
|------|--------|
| 1 | `sudo docker stop redis` |
| 2 | `sudo systemctl stop hospital` |
| 3 | AWS EC2 → Stop |
| 4 | AWS RDS → Stop temporarily |

## ☁️ Important AWS Notes

| Resource | Note |
|----------|------|
| Elastic IP | EC2 se associated rakhna — warna charge lagega |
| RDS | Stop karne pe data safe rahta hai |
| EC2 | Stop/Start pe Elastic IP same rahti hai |
| Redis | EC2 restart pe manually start karna hoga |

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://hospital-analysis-system.vercel.app |
| Backend | https://hospital-rishi.duckdns.org |
| Swagger | https://hospital-rishi.duckdns.org/swagger-ui.html |
| GitHub | https://github.com/Rishi895-Rathi/Hospital-Analysis-System |
