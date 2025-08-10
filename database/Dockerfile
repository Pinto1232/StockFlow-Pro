# Use the official Microsoft SQL Server 2022 image
FROM mcr.microsoft.com/mssql/server:2022-latest

# Switch to root user to install packages
USER root

# Update package lists and install curl and gnupg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        gnupg \
        software-properties-common && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add Microsoft repository using the modern approach (avoiding deprecated apt-key)
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-archive-keyring.gpg && \
    echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/mssql-release.list

# Update package lists and install mssql-tools18 and unixodbc-dev
RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends \
        mssql-tools18 \
        unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Switch back to mssql user
USER mssql

# Set environment variables
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=StockFlow123!

# Expose the default SQL Server port
EXPOSE 1433

# Start SQL Server
CMD ["/opt/mssql/bin/sqlservr"]