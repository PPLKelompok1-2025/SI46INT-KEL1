<p align="center"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></p>

# 🎓 Coursepedia

## 📚 About Coursepedia

Coursepedia is a comprehensive online learning platform that connects instructors and students. Built with Laravel and React, it offers a robust feature set for creating, managing, and consuming educational content.

## ✨ Features

- 👨‍🏫 **Instructor Dashboard**: Create and manage courses, lessons, and assignments
- 👨‍🎓 **Student Portal**: Enroll in courses, watch lessons, submit assignments
- 🛡️ **Admin Panel**: Manage users, categories, course approvals, and analytics
- 💰 **Payment Integration**: Secure payment processing with Midtrans
- 🎞️ **Video Content**: Seamless video delivery with FFmpeg integration
- 🏷️ **Promo Codes**: Create and manage promotional discounts

## 🚀 Tech Stack

- **Backend**: Laravel 12.x with PHP 8.2+
- **Frontend**: React 18.x with Inertia.js
- **Styling**: TailwindCSS 3.x
- **Form Handling**: React Hook Form
- **UI Components**: Radix UI primitives
- **Deployment**: Laravel's built-in server with Vite for asset compilation

## 📋 Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js and NPM
- MySQL, PostgreSQL, or SQLite
- FFmpeg for video processing

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/baiqueee/coursepedia.git
cd coursepedia
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install JavaScript dependencies

```bash
npm install
```

### 4. Set up your environment file

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure your database in the .env file

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coursepedia
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Run database migrations and seed data

```bash
php artisan migrate
php artisan db:seed
```

### 7. Link storage for file uploads

```bash
php artisan storage:link
```

## 🏃‍♂️ Running the Application

### Development mode

Run all services concurrently (server, queue worker, and Vite):

```bash
composer dev
```

Or run them individually:

```bash
# Run the Laravel server
php artisan serve

# Run the queue worker
php artisan queue:listen

# Run Vite for frontend assets
npm run dev
```

### Production mode

```bash
# Build frontend assets
npm run build

# Run the server
php artisan serve
```

## 🛣️ Available Routes

### Public Routes

- `GET /` - Home page

### Authentication Routes

- Login, Registration, Password Reset, Email Verification

### Admin Routes

- `GET /admin/dashboard` - Admin dashboard
- `GET|POST /admin/categories` - Category management
- `GET|POST|PUT|DELETE /admin/courses` - Course management
- `GET|POST|PUT|DELETE /admin/promo-codes` - Promo code management
- `GET /admin/analytics` - Analytics and reporting

### Instructor Routes

- Course management
- Lesson and assignment creation
- Student progress tracking

### Student Routes

- Course browsing and enrollment
- Lesson viewing
- Assignment submission

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
