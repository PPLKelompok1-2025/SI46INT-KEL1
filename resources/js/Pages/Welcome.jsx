import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    featuredCategories,
    statistics,
    testimonials,
}) {
    return (
        <>
            <Head title="Coursepedia - Online Learning Platform" />
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                {/* Navigation */}
                <nav className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <span className="ml-2 text-2xl font-bold text-gray-800 dark:text-white">
                            Coursepedia
                        </span>
                        <div className="hidden space-x-6 md:flex">
                            <Link
                                href={route('courses.index')}
                                className="text-gray-700 transition hover:text-primary dark:text-gray-200"
                                prefetch="hover"
                            >
                                Courses
                            </Link>
                            <Link
                                href={route('categories.index')}
                                className="text-gray-700 transition hover:text-primary dark:text-gray-200"
                                prefetch="hover"
                            >
                                Categories
                            </Link>
                            <Link
                                href={route('search')}
                                className="text-gray-700 transition hover:text-primary dark:text-gray-200"
                                prefetch="hover"
                            >
                                Search
                            </Link>
                        </div>
                        <div className="flex space-x-4">
                            {auth.user ? (
                                <Button asChild>
                                    <Link
                                        href={route('dashboard')}
                                        prefetch="hover"
                                    >
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={route('login')}
                                            prefetch="hover"
                                        >
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link
                                            href={route('register')}
                                            prefetch="hover"
                                        >
                                            Register
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 py-16">
                    <div className="flex flex-col items-center md:flex-row">
                        <div className="md:w-1/2">
                            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                                Unlock Your{' '}
                                <span className="text-primary">Learning</span>{' '}
                                Potential
                            </h1>
                            <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
                                Access thousands of high-quality courses from
                                expert instructors. Learn at your own pace and
                                achieve your goals.
                            </p>
                            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <Button size="lg" asChild>
                                    <Link
                                        href={route('courses.index')}
                                        prefetch="hover"
                                    >
                                        Explore Courses
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link
                                        href={route('register')}
                                        prefetch="hover"
                                    >
                                        Join For Free
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-8 md:mt-0 md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                                alt="Online Learning"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-primary py-16 text-white dark:bg-primary/80">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">
                                    {statistics?.totalCourses?.toLocaleString() ||
                                        '10,000+'}
                                    +
                                </h3>
                                <p className="mt-2 text-lg">Online Courses</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">
                                    {statistics?.totalInstructors?.toLocaleString() ||
                                        '500+'}
                                    +
                                </h3>
                                <p className="mt-2 text-lg">
                                    Expert Instructors
                                </p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-4xl font-bold">
                                    {statistics?.totalStudents?.toLocaleString() ||
                                        '150,000+'}
                                    +
                                </h3>
                                <p className="mt-2 text-lg">Active Students</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-6 py-16">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
                        Why Choose Coursepedia
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Learn Anywhere',
                                description:
                                    'Access courses on any device, anytime, anywhere. Learn at your own pace with flexible schedules.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Quality Content',
                                description:
                                    'High-quality courses created by industry experts with real-world experience and practical knowledge.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Interactive Learning',
                                description:
                                    'Engage with quizzes, assignments, and hands-on projects to reinforce your knowledge and skills.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Certificates',
                                description:
                                    'Earn recognized certificates upon course completion to showcase your new skills to employers.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Community Support',
                                description:
                                    'Connect with fellow learners, participate in discussions, and get help when you need it.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Affordable Pricing',
                                description:
                                    'Access premium courses at competitive prices with flexible payment options and occasional promotions.',
                                icon: (
                                    <svg
                                        className="h-10 w-10 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                ),
                            },
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-gray-800"
                            >
                                <CardHeader>
                                    <div className="mb-2">{feature.icon}</div>
                                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Popular Categories */}
                <section className="bg-gray-50 py-16 dark:bg-gray-900">
                    <div className="container mx-auto px-6">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
                            Popular Categories
                        </h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {(featuredCategories?.length
                                ? featuredCategories
                                : [
                                      'Web Development',
                                      'Data Science',
                                      'Business',
                                      'Design',
                                      'Marketing',
                                      'IT & Software',
                                      'Personal Development',
                                      'Photography',
                                      'Music',
                                      'Health & Fitness',
                                      'Language Learning',
                                      'Teaching',
                                  ]
                            ).map((category, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <svg
                                            className="h-8 w-8"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {typeof category === 'string'
                                            ? category
                                            : category.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="container mx-auto px-6 py-16">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
                        What Our Students Say
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {(
                            testimonials || [
                                {
                                    name: 'Sarah Johnson',
                                    role: 'Web Developer',
                                    content:
                                        'Coursepedia helped me transition from a beginner to a professional web developer in just 6 months. The hands-on projects and supportive community made all the difference.',
                                    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                                },
                                {
                                    name: 'David Chen',
                                    role: 'Data Scientist',
                                    content:
                                        'The data science courses are comprehensive and up-to-date with industry standards. I landed my dream job thanks to the skills I learned through Coursepedia.',
                                    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
                                },
                                {
                                    name: 'Emma Williams',
                                    role: 'UX Designer',
                                    content:
                                        'The design courses offer practical knowledge that I apply daily in my work. The instructors are experienced professionals who share valuable industry insights.',
                                    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
                                },
                            ]
                        ).map((testimonial, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-md dark:bg-gray-800"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                            />
                                            <AvatarFallback>
                                                {testimonial.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-white">
                                                {testimonial.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                                        "{testimonial.content}"
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-primary py-16 text-white dark:bg-primary/80">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            Ready to Start Learning?
                        </h2>
                        <p className="mb-8 text-lg">
                            Join thousands of students and start your learning
                            journey today.
                        </p>
                        <div className="flex flex-col justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white text-primary hover:bg-gray-100"
                                asChild
                            >
                                <Link href={route('register')} prefetch="hover">
                                    Sign Up Now
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white bg-transparent text-white hover:bg-white/10"
                                asChild
                            >
                                <Link
                                    href={route('courses.index')}
                                    prefetch="hover"
                                >
                                    Browse Courses
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800 py-12 text-gray-300">
                    <div className="container mx-auto px-6">
                        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div>
                                <h3 className="mb-4 text-xl font-semibold text-white">
                                    Coursepedia
                                </h3>
                                <p className="mb-4">
                                    Empowering learners worldwide with
                                    high-quality education and skills for the
                                    future.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">
                                    Explore
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <Link
                                            href={route('courses.index')}
                                            className="hover:text-white"
                                            prefetch="hover"
                                        >
                                            Courses
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('categories.index')}
                                            className="hover:text-white"
                                            prefetch="hover"
                                        >
                                            Categories
                                        </Link>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Instructors
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">
                                    Resources
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">
                                    Follow Us
                                </h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="hover:text-white">
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="hover:text-white">
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="hover:text-white">
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="hover:text-white">
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 pt-8 text-center text-sm">
                            <p>
                                &copy; {new Date().getFullYear()} Coursepedia.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
