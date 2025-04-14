#!/bin/bash

# Set up directories for encrypted videos and private keys
mkdir -p storage/app/encrypted_videos
mkdir -p storage/app/private/keys
mkdir -p storage/app/temp/videos

# Set proper permissions
chmod -R 755 storage/app/encrypted_videos storage/app/private storage/app/temp

echo "Storage directories created successfully with proper permissions."
echo "- storage/app/encrypted_videos: For encrypted HLS video segments"
echo "- storage/app/private/keys: For encryption keys"
echo "- storage/app/temp/videos: For temporary video uploads"

# Remind about .gitignore
echo ""
echo "Don't forget to add these directories to .gitignore!"
