FROM node:18-bullseye

# Set working directory early
WORKDIR /src

# Copy only the tools install script first (isolated for caching)
COPY scripts /tmp/scripts

# Ensure all scripts are executable
RUN chmod +x /tmp/scripts/*.sh

# Run the install script (caches unless tools.sh changes)
RUN /tmp/scripts/tools.sh

# Use entrypoint for runtime logic
ENTRYPOINT ["/tmp/scripts/entrypoint.sh"]

# Default command - open a shell
CMD ["/bin/bash"]
