# HLS Video Encryption System

This document outlines the encrypted video system implemented using Laravel FFmpeg to protect course videos from unauthorized access and downloads.

## System Overview

The system provides:

1. Secure video uploading for instructors
2. Automatic HLS (HTTP Live Streaming) conversion
3. AES-128 encryption of video segments
4. Secure key storage
5. Access control based on course enrollment
6. Adaptive bitrate streaming for different devices and network conditions

## Requirements

- PHP 8.0+
- Laravel 9.0+
- FFmpeg installed on the server
- [Laravel FFmpeg package](https://github.com/protonemedia/laravel-ffmpeg)

## Setup Instructions

### 1. Install Dependencies

```bash
composer require pbmedia/laravel-ffmpeg
```

### 2. Create Storage Directories

Run the setup script:

```bash
bash setup-video-storage.sh
```

Or manually create these directories:

```bash
mkdir -p storage/app/encrypted_videos
mkdir -p storage/app/private/keys
mkdir -p storage/app/temp/videos
chmod -R 755 storage/app/encrypted_videos storage/app/private storage/app/temp
```

### 3. Configure Storage Disks

Make sure your `config/filesystems.php` includes these disk configurations:

```php
'encrypted_videos' => [
    'driver' => 'local',
    'root' => storage_path('app/encrypted_videos'),
    'throw' => false,
    'visibility' => 'private',
],

'private' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'throw' => false,
    'visibility' => 'private',
],
```

### 4. Migrate Database

Run the migration to add the necessary video storage fields to the lessons table:

```bash
php artisan migrate
```

## How It Works

1. **Upload**: Instructors upload videos through the Lesson creation/edit forms
2. **Processing**: The system temporarily stores the upload and processes it with FFmpeg
3. **Encryption**: Videos are segmented into `.ts` files and encrypted using AES-128
4. **Key Storage**: Encryption keys are stored securely in the private storage area
5. **Access Control**: The system checks user enrollment before providing videos or keys
6. **Streaming**: HLS.js is used to stream videos to the client with proper authentication

## Security Features

- Videos are stored as encrypted segments, not complete files
- Each video has its own unique encryption key
- Access to videos requires valid authentication and enrollment
- All API endpoints for video access include CSRF protection
- Direct file access is prevented by storing files outside the public directory
- Video playback is managed by HLS.js with secure key retrieval

## Maintenance and Cleanup

- Temporary uploads are automatically deleted after processing
- If a lesson is deleted, related video files are also removed
- Failed uploads are cleaned up automatically
