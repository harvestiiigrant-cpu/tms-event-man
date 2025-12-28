# Jenkins CI/CD Setup Guide

This document provides instructions for setting up and deploying the PLP Training Management System using Jenkins.

## Prerequisites

- Jenkins server (version 2.375+)
- Git plugin installed in Jenkins
- Docker and Docker Compose installed on Jenkins agent/node
- Node.js (v18+) and npm installed on Jenkins agent/node
- SSH access to deployment servers (for production deployments)

## Jenkins Setup Steps

### 1. Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Install the following plugins:
   - **Pipeline** (Scripted and Declarative)
   - **Git**
   - **GitHub** (if using GitHub)
   - **Docker Pipeline**
   - **SSH Agent**
   - **Credentials Binding**
   - **AnsiColor** (for colored console output)
   - **Email Extension** (optional, for notifications)
   - **Slack** (optional, for Slack notifications)

### 2. Create Jenkins Credentials

#### a. Docker Hub Credentials
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Add Credentials**
3. Fill in the form:
   - Kind: **Username with password**
   - Username: `<your-docker-hub-username>`
   - Password: `<your-docker-hub-password>`
   - ID: `docker-hub-credentials`

#### b. Deployment SSH Key
1. Create a new credential:
   - Kind: **SSH Username with private key**
   - Username: `ubuntu` (or your deployment user)
   - Private Key: Paste your SSH private key
   - ID: `deploy-ssh-key`

#### c. Deployment Server Details
1. Create credentials for:
   - ID: `deploy-host`
     - Secret: `your-server-domain.com` or IP address
   - ID: `deploy-user`
     - Secret: `ubuntu` (or your deployment username)

### 3. Create a New Jenkins Job

1. Click **New Item**
2. Enter job name: `pixel-perfect-replica-pipeline`
3. Select **Pipeline**
4. Click **OK**

### 4. Configure Pipeline Job

#### General Settings
- **Description**: "CI/CD Pipeline for PLP Training Management System"
- **Discard old builds**: 10 builds (keep last 10)
- **GitHub project**: https://github.com/harvestiiigrant-cpu/pixel-perfect-replica

#### Pipeline Configuration
1. In the **Pipeline** section:
   - **Definition**: Select "Pipeline script from SCM"
   - **SCM**: Select "Git"
   - **Repository URL**: https://github.com/harvestiiigrant-cpu/pixel-perfect-replica.git
   - **Branch Specifier**: `*/main` and `*/develop`
   - **Script Path**: `Jenkinsfile`

2. Save the configuration

### 5. Configure Build Parameters

The Jenkinsfile includes the following build parameters:
- **DEPLOYMENT_ENV**: development | staging | production
- **RUN_TESTS**: Run automated tests (default: true)
- **RUN_LINT**: Run ESLint checks (default: true)
- **SKIP_BUILD**: Skip Docker build (default: false)

### 6. Set Environment Variables

Create or edit Jenkins system environment variables:
1. **Manage Jenkins** → **Configure System** → **Global properties**
2. Add environment variables:
   ```
   NODE_VERSION=18
   DOCKER_REGISTRY=docker.io
   PROJECT_NAME=plp-tms
   ```

## GitHub Integration (Optional)

### Webhook Setup for Automatic Triggers

1. In GitHub repository settings:
   - Go to **Settings** → **Webhooks**
   - Click **Add webhook**
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: `application/json`
   - Events: Select "Push events"
   - Active: ☑️ checked

2. In Jenkins job:
   - Check **GitHub hook trigger for GITScm polling**
   - Save

## Running Builds

### Manual Build

1. Click **Build with Parameters** on the job page
2. Select desired parameters:
   ```
   DEPLOYMENT_ENV: development
   RUN_TESTS: ✓
   RUN_LINT: ✓
   SKIP_BUILD: ☐
   ```
3. Click **Build**

### Build Triggers

The pipeline will automatically trigger on:
- Push to `main` branch (production deployment)
- Push to `develop` branch (development deployment)
- GitHub webhook events (if configured)

## Pipeline Stages

### 1. **Checkout**
- Clones the repository from GitHub

### 2. **Environment Setup**
- Creates `.env` file from `.env.example`
- Displays Node.js, npm, Docker versions

### 3. **Install Dependencies**
- Runs `npm ci` (clean install)

### 4. **Lint** (optional)
- Runs ESLint checks
- Non-blocking (warnings only)

### 5. **Build Application**
- Runs `npm run build`
- Creates production-ready frontend bundle

### 6. **Build Docker Images**
- Builds backend image: `plp-tms-backend:${BUILD_NUMBER}`
- Builds frontend image: `plp-tms-frontend:${BUILD_NUMBER}`
- Tags images as `latest`

### 7. **Run Tests** (optional)
- Executes test suite
- Non-blocking (warnings only)

### 8. **Deploy to Development**
- Triggered on `develop` branch
- Runs `docker-compose --profile dev up -d`
- Executes database migrations
- Seeds database (if configured)

### 9. **Deploy to Production**
- Triggered on `main` branch
- Requires SSH access to production server
- Pulls latest images
- Runs migrations on production database
- **Note**: Requires SSH key configuration

### 10. **Health Check**
- Verifies backend API responds
- Checks database connectivity
- Validates frontend is accessible

### 11. **Smoke Tests**
- Tests critical API endpoints
- Validates basic functionality after deployment

## Troubleshooting

### Issue: "Unable to find Jenkinsfile from git"

**Solution**: Ensure:
1. Jenkinsfile is in the root directory of your repository
2. Jenkinsfile is committed and pushed to the branch
3. Jenkins has access to the repository
4. Branch specifier in Jenkins job matches your branch

### Issue: Docker Build Fails

**Solution**: Verify:
1. Docker is installed and running on the Jenkins agent
2. Jenkins user has Docker permissions: `sudo usermod -aG docker jenkins`
3. Dockerfiles exist: `Dockerfile`, `Dockerfile.backend`, `Dockerfile.dev`
4. `.env` file contains required environment variables

### Issue: Database Migration Fails

**Solution**: Check:
1. PostgreSQL container is running
2. Database credentials match `.env` file
3. Migrations are properly created in `prisma/migrations/`
4. Run: `docker-compose exec -T backend npm run db:migrate -- --skip-generate`

### Issue: Deployment SSH Connection Failed

**Solution**: Verify:
1. SSH key is added to Jenkins credentials
2. Deployment server public key matches private key
3. Deployment user can access the deployment directory
4. Firewall allows SSH connections (port 22)

## Production Deployment Configuration

For production deployments, configure:

1. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://prod_user:prod_password@prod-db-host:5432/prod_db
   JWT_SECRET=<64-char-random-hex-string>
   VITE_API_URL=https://your-domain.com/api
   ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
   ```

2. **Deployment Server Setup**:
   ```bash
   # On production server
   cd /home/ubuntu/plp-tms

   # Clone or pull repository
   git clone <repo-url>
   cd pixel-perfect-replica

   # Create .env file with production values
   cp .env.example .env.production
   # Edit .env.production with production credentials

   # Start services
   docker-compose up -d

   # Run migrations
   docker-compose exec backend npm run db:migrate
   ```

3. **Nginx Reverse Proxy**:
   Configure reverse proxy to route traffic:
   - `/api` → Backend (port 3000)
   - `/` → Frontend (port 80)

## Monitoring and Logs

### View Build Logs
- Click on build number in Jenkins job
- View console output in real-time or after completion

### View Container Logs
```bash
# SSH into Jenkins agent or deployment server
docker logs plp_tms_backend
docker logs plp_tms_frontend
docker logs plp_tms_db
```

### Archive Artifacts
- Build logs are saved in Jenkins job workspace
- Docker images are tagged with build number for traceability

## Security Best Practices

1. **Protect Sensitive Data**:
   - Use Jenkins credentials for all secrets
   - Never hardcode passwords in Jenkinsfile
   - Rotate JWT secrets regularly

2. **Access Control**:
   - Configure Jenkins user authentication
   - Use role-based access control (RBAC)
   - Limit who can trigger production deployments

3. **SSH Security**:
   - Use SSH keys instead of passwords
   - Restrict SSH key access to Jenkins user
   - Use different keys for different environments

4. **Network Security**:
   - Keep Jenkins on a private network
   - Use firewall rules to restrict access
   - Enable HTTPS for Jenkins UI

## Advanced Configuration

### Email Notifications

Configure in Jenkinsfile (post section):
```groovy
post {
    failure {
        emailext (
            subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build failed. Check console output: ${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
}
```

### Slack Notifications

Add to Jenkinsfile:
```groovy
post {
    always {
        slackSend (
            color: currentBuild.result == 'SUCCESS' ? 'good' : 'danger',
            message: "Build ${env.BUILD_NUMBER}: ${currentBuild.result}"
        )
    }
}
```

### Custom Deployment Scripts

Extend the Jenkinsfile with:
```groovy
stage('Custom Deployment') {
    steps {
        sh '''
            ./deploy.sh ${DEPLOYMENT_ENV}
        '''
    }
}
```

## Reference

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkinsfile Syntax](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [Git Plugin](https://plugins.jenkins.io/git/)
