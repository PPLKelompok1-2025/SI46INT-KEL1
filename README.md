# Coursepedia: E-Learning Platform

Coursepedia is a full-featured online learning platform built with Laravel, Inertia.js, and React. Students can browse, enroll in, and complete courses; track lesson progress; take notes; earn certificates; make payments/donations; and leave reviews. Instructors can create and manage courses, content, students, assignments, quizzes, and earnings. Admins oversee users, courses, transactions, and analytics.

---

## 🛠 Technologies & Packages

### Backend

- **Framework**: Laravel 12
- **Routing & Controllers**: RESTful controllers with permission middleware
- **Authentication**: Laravel Breeze + Inertia (Vue/React stack)
- **PDF Generation**: `barryvdh/laravel-dompdf`
- **Jobs**: Laravel Queues for asynchronous certificate generation
- **Payments**: Midtrans PHP SDK

### Frontend

- **Rendering**: Inertia.js + React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Dialog, Card, Button, Badge, etc.)
- **Icons**: lucide-react
- **State & Forms**: Inertia React hooks (`useForm`, `router`, etc.)
- **Notifications**: `react-hot-toast`
- **HTTP Requests**: `axios`

### Other Libraries

- `inertiajs/inertia-laravel`
- `inertiajs/inertia-react`

---

## ⚙️ Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-org/coursepedia.git
    cd coursepedia
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install JavaScript dependencies**

    ```bash
    npm install
    ```

4. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

    Configure your `.env` with database credentials, Midtrans keys, etc.

5. **Database migration & seeding**

    ```bash
    php artisan migrate --seed
    ```

6. **Storage symlink**

    ```bash
    php artisan storage:link
    ```

7. **Compile assets**

    ```bash
    npm run dev    # or npm run build for production
    ```

8. **Run the application**
    ```bash
    php artisan serve
    ```
    Visit `http://localhost:8000`

---

## 🚦 Application Routes

### Public Routes

| Method | URI                      | Name             | Description              |
| ------ | ------------------------ | ---------------- | ------------------------ |
| GET    | `/`                      | home             | Landing page             |
| GET    | `/courses`               | courses.index    | Browse all courses       |
| GET    | `/courses/{course:slug}` | courses.show     | View course details      |
| GET    | `/categories`            | categories.index | Browse categories        |
| GET    | `/categories/{slug}`     | categories.show  | View courses by category |
| GET    | `/search`                | search           | Global search            |

### Authenticated (all roles)

| Method | URI              | Name            | Description          |
| ------ | ---------------- | --------------- | -------------------- |
| GET    | `/profile`       | profile.edit    | Edit user profile    |
| PATCH  | `/profile`       | profile.update  | Update profile       |
| DELETE | `/profile`       | profile.destroy | Delete account       |
| POST   | `/profile/photo` | profile.photo   | Upload profile photo |

#### Payment & Donations

| Method | URI                                | Name                          | Description                     |
| ------ | ---------------------------------- | ----------------------------- | ------------------------------- |
| GET    | `/payment/checkout/{course}`       | payment.checkout              | Course checkout page            |
| POST   | `/payment/validate-promo`          | payment.validate-promo        | Validate promo code             |
| POST   | `/payment/midtrans/token/{course}` | payment.midtrans.token        | Generate Midtrans payment token |
| POST   | `/payment/midtrans/notification`   | payment.midtrans.notification | Midtrans server callback        |
| GET    | `/payment/midtrans/callback`       | payment.midtrans.callback     | Midtrans client callback        |
| POST   | `/payment/donation/{course}`       | payment.donation.process      | Make a donation                 |
| GET    | `/payment/donations`               | payment.donations.index       | List user donations             |

### Admin Routes (role: admin)

Prefix: `/admin`, middleware: `role:admin`

- **Dashboard**: GET `/admin/dashboard`
- **Analytics**: GET `/admin/analytics`
- **Users**: Resource `/admin/users`
- **Courses**: Resource `/admin/courses`, PATCH approve/feature
- **Transactions**: Resource `/admin/transactions` (index, show), POST `/admin/transactions/{transaction}/refund`
- **Reviews**: Index, reported, manage approvals/responses
- **Promo Codes**: Resource `/admin/promo-codes` + toggle active
- **Withdrawal Requests**: List, show, approve/reject
- **Reports**: `/admin/reports/sales`, `/admin/reports/users`, `/admin/reports/courses`

### Instructor Routes (role: instructor)

Prefix: `/instructor`, middleware: `role:instructor`

- GET `/instructor/dashboard`
- **Courses**: Resource `/instructor/courses`, PATCH publish/unpublish
- **Students**: GET `/instructor/courses/{course}/students`
- **Donations**: GET `/instructor/courses/{course}/donations`
- **Reviews**: GET `/instructor/courses/{course}/reviews`
- **Lessons**: Nested under courses (index, create, edit, update, destroy)
- **Quizzes**: Nested resource under lessons
- **Assignments**: Nested under lessons & submissions
- **Earnings**: GET `/instructor/earnings`, POST `/instructor/earnings/withdraw`
- **Payment Methods**: Resource `/instructor/payment-methods`

### Student Routes (role: student)

Prefix: `/student`, middleware: `role:student`

- GET `/student/dashboard`
- **Courses**:
    - GET `/student/courses`
    - GET `/student/courses/{slug}`
    - POST `/student/courses/{course}/enroll`
    - GET `/student/courses/{course}/learn`
    - POST `/student/courses/{course}/complete`
    - POST `/student/lessons/{lesson}/complete`
    - Review: POST `/student/courses/{id}/review`, PUT `/student/courses/{id}/review/{review}`, DELETE same
- **Certificates**:
    - GET `/student/certificates`
    - GET `/student/certificates/{id}`
    - GET `/student/certificates/{id}/preview`
    - GET `/student/certificates/{id}/download`
- **Transactions**: GET `/student/transactions`, GET `/student/transactions/{id}`
- **Donations**: GET `/student/donations`, show donation
- **Wishlist**: GET `/student/wishlist`, POST toggle
- **Notes**: CRUD under `/student/notes` and `/student/courses/{course}/notes`
- **Quizzes & Assignments**: GET/POST under `/student/quizzes`, `/student/assignments`

---

## 📂 Project Structure

```
app/
├─ Http/Controllers/
│  ├─ Admin/
│  ├─ Instructor/
│  └─ Student/
├─ Models/
├─ Services/      # CertificateService
├─ Jobs/          # GenerateCertificatePdf
└─ Policies/

resources/js/
├─ Pages/         # Inertia pages (Admin, Instructor, Student, etc.)
├─ Components/    # Shared UI components & layouts
└─ Components/ui/ # Shadcn/ui primitives (Button, Dialog, etc.)

routes/web.php   # All route definitions
```

---

## ✅ Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add ..."`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 🔒 License

This project is open source and available under the [MIT License](LICENSE).
