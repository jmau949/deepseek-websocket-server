FROM ollama/ollama:latest

# -----------------------------------------------------------------------------
# Set Environment Variables
# -----------------------------------------------------------------------------
# OLLAMA_HOST is set to 0.0.0.0 so that the service listens on all network interfaces.
# OLLAMA_MODELS specifies the directory where Ollama models will be stored.
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_MODELS=/root/.ollama/models

# -----------------------------------------------------------------------------
# Expose the Port
# -----------------------------------------------------------------------------
# Port 11435 is exposed so that external clients can access the Ollama service.
EXPOSE 11435

# -----------------------------------------------------------------------------
# Set the Working Directory
# -----------------------------------------------------------------------------
# All subsequent commands will run from this directory (/app).
WORKDIR /app

# -----------------------------------------------------------------------------
# Install Necessary Dependencies
# -----------------------------------------------------------------------------
# Update the package list, install 'curl' and 'ca-certificates' without extra recommended packages,
# and clean up the apt cache to reduce image size.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Create a Startup Script
# -----------------------------------------------------------------------------
# This script will:
# 1. Start the Ollama server in the background.
# 2. Pause for 5 seconds to allow the server to start.
# 3. Download (pull) the 'deepseek-r1' model.
# 4. Print a confirmation message.
# 5. Keep the container running indefinitely by tailing /dev/null.
RUN echo '#!/bin/bash \n\
# Start the Ollama server in the background\n\
ollama serve & \n\
# Wait a few seconds to ensure the server is up\n\
sleep 5 \n\
# Inform the user that the model download is starting\n\
echo "Pulling deepseek-r1 model..." \n\
# Download the specified model\n\
ollama pull deepseek-r1 \n\
# Confirm successful download and that the server is running\n\
echo "Model pulled successfully. Server is running on port 11435." \n\
# Prevent the container from exiting by tailing an empty file\n\
tail -f /dev/null' > /app/start.sh && \
    chmod +x /app/start.sh

# -----------------------------------------------------------------------------
# Set the Startup Script as the Entrypoint
# -----------------------------------------------------------------------------
# When the container starts, it will execute the /app/start.sh script.
ENTRYPOINT ["/app/start.sh"]
