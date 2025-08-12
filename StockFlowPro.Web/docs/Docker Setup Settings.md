Backend API URLs & Credentials


🐳 Docker Backend (Production-like)
API URL: http://localhost:5000/
Username: admin@stockflowpro.com
Password: SecureAdmin2024!
User Info: John Admin (Admin Role)


💻 Local Development Backend
API URL: http://localhost:5131/
Username: admin
Password: admin
User Info: Admin User (Admin Role)


🗄️ Database
SQL Server: localhost:1433
Username: sa
Password: StockFlow123!
Database: StockFlowProDb

Note: localhost:1433 is a SQL Server port, not a web page. Opening it in a browser will show connection reset/ERR_EMPTY_RESPONSE. Use a database client (Azure Data Studio/SSMS) or sqlcmd to connect.

Quick test (from host):
- Server: localhost,1433
- Auth: SQL Login
- User: sa
- Password: StockFlow123!

Optional terminal check:
```
docker compose ps
docker exec -it stockflow-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -Q "SELECT @@VERSION;"
```

Security tip: set DB_PASSWORD (SA password) and DB_APP_USER_PASSWORD in a local .env file. Example in .env.example.

📧 Email Testing (MailHog)
SMTP: localhost:1025
Web UI: http://localhost:8025/


🔄 Redis Cache
URL: localhost:6379


Docker Frontend URL and Configuration
Docker Frontend Access
Primary URL: http://localhost:8080/
Direct Frontend: http://localhost:5173/ (bypasses Nginx)



The Docker frontend is configured to use:

API Base URL: /api (relative path)
Backend Credentials:
Username: admin@stockflowpro.com
Password: SecureAdmin2024!


Complete Docker URL Structure
Service	URL	Internal Routing
Main App	http://localhost:8080/	→ Frontend via Nginx
API Calls	http://localhost:8080/api/*	→ Backend via Nginx
Swagger	http://localhost:8080/swagger/	→ Backend docs
WebSockets	http://localhost:8080/stockflowhub	→ SignalR hub
🎯 Testing the Docker Frontend
Access: Go to http://localhost:8080/
Login with:
Username: admin@stockflowpro.com
Password: SecureAdmin2024!


Start the Complete Stack
docker-compose up -d

Start with Build (if you made changes)
docker-compose up --build -d

View Logs (Real-time)
docker-compose logs -f

Check Container Status
docker-compose ps


Stop All Services
docker-compose down

Stop and Remove Volumes (Complete Reset)
docker-compose down -v

Start Docker Stack:
docker-compose up -d


docker-compose up