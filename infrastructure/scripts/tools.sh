#!/bin/bash
set -e

# Update the package list and install essential tools
echo "Updating package list and installing essential tools..."
apt-get update -y
apt-get install -y unzip curl less

# Define NPM packages to install Globally
NPM_PACKAGES=("aws-cdk" "typescript")

echo "Checking and installing required global NPM packages..."
for pkg in "${NPM_PACKAGES[@]}"; do
  if npm list -g "$pkg" >/dev/null 2>&1; then
    echo "$pkg is already installed. Skipping..."
  else
    echo "Installing $pkg globally..."
    npm install -g "$pkg"
  fi
done

# Check if AWS CLI v2 is already installed
if command -v aws >/dev/null 2>&1 && aws --version | grep -q "aws-cli/2"; then
    echo "AWS CLI v2 is already installed. Skipping..."
else
    echo "Downloading and installing AWS CLI v2..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    aws configure set cli_pager ""
    rm -rf awscliv2.zip aws
fi

echo "Tool installation completed successfully."
