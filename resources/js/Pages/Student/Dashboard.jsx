import CertificateCard from '@/Components/Student/CertificateCard';
import CourseCard from '@/Components/Student/CourseCard';
import EmptyState from '@/Components/Student/EmptyState';
import StatsOverview from '@/Components/Student/StatsOverview';
import WelcomeCard from '@/Components/Student/WelcomeCard';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage, WhenVisible } from '@inertiajs/react';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function Dashboard({
    enrolledCourses,
    inProgressCourses,
    completedCourses,
    certificates,
    activeTab = 'in-progress',
    page,
    inProgressPage,
    completedPage,
    certificatesPage,
    isEnrolledNextPageExists,
    isInProgressNextPageExists,
    isCompletedNextPageExists,
    isCertificatesNextPageExists,
    totalCounts,
}) {
    const { auth } = usePage().props;

    const handleTabChange = (value) => {
        router.get(
            route('student.dashboard'),
            { tab: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['activeTab'],
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        My Learning Dashboard
                    </h1>

                    <Button asChild>
                        <Link href="/courses" prefetch="hover">
                            Browse Courses
                        </Link>
                    </Button>
                </div>

                <WelcomeCard
                    userName={auth.user.name}
                    inProgressCount={totalCounts.inProgress}
                />

                <StatsOverview
                    enrolledCount={totalCounts.enrolled}
                    certificatesCount={totalCounts.certificates}
                />

                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="space-y-4"
                >
                    <TabsList>
                        <TabsTrigger value="in-progress">
                            In Progress
                        </TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="all-courses">
                            All Courses
                        </TabsTrigger>
                        <TabsTrigger value="certificates">
                            Certificates
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="in-progress" className="space-y-4">
                        {inProgressCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {inProgressCourses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                        />
                                    ))}
                                </div>
                                {isInProgressNextPageExists && (
                                    <div className="mt-8">
                                        <WhenVisible
                                            always
                                            params={{
                                                in_progress_page:
                                                    Number(inProgressPage) + 1,
                                                tab: activeTab,
                                            }}
                                            only={[
                                                'inProgressCourses',
                                                'inProgressPage',
                                                'isInProgressNextPageExists',
                                            ]}
                                            fallback={
                                                <div className="flex justify-center">
                                                    <p className="text-muted-foreground">
                                                        You've reached the end.
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <div className="flex justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            </div>
                                        </WhenVisible>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="No courses in progress"
                                description="Start learning by enrolling in a course today!"
                                buttonText="Browse Courses"
                                buttonLink="/courses"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        {completedCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {completedCourses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            type="completed"
                                        />
                                    ))}
                                </div>
                                {isCompletedNextPageExists && (
                                    <div className="mt-8">
                                        <WhenVisible
                                            always
                                            params={{
                                                completed_page:
                                                    Number(completedPage) + 1,
                                                tab: activeTab,
                                            }}
                                            only={[
                                                'completedCourses',
                                                'completedPage',
                                                'isCompletedNextPageExists',
                                            ]}
                                            fallback={
                                                <div className="flex justify-center">
                                                    <p className="text-muted-foreground">
                                                        You've reached the end.
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <div className="flex justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            </div>
                                        </WhenVisible>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={CheckCircle}
                                title="No completed courses yet"
                                description="Keep learning to complete your courses and earn certificates!"
                                buttonText="View In-Progress Courses"
                                buttonLink="/student/dashboard?tab=in-progress"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="all-courses" className="space-y-4">
                        {enrolledCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {enrolledCourses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                        />
                                    ))}
                                </div>
                                {isEnrolledNextPageExists && (
                                    <div className="mt-8">
                                        <WhenVisible
                                            always
                                            params={{
                                                page: Number(page) + 1,
                                                tab: activeTab,
                                            }}
                                            only={[
                                                'enrolledCourses',
                                                'page',
                                                'isEnrolledNextPageExists',
                                            ]}
                                            fallback={
                                                <div className="flex justify-center">
                                                    <p className="text-muted-foreground">
                                                        You've reached the end.
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <div className="flex justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            </div>
                                        </WhenVisible>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="No enrolled courses"
                                description="Start learning by enrolling in a course today!"
                                buttonText="Browse Courses"
                                buttonLink="/courses"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="certificates" className="space-y-4">
                        {certificates.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {certificates.map((certificate) => (
                                        <CertificateCard
                                            key={certificate.id}
                                            certificate={certificate}
                                        />
                                    ))}
                                </div>
                                {isCertificatesNextPageExists && (
                                    <div className="mt-8">
                                        <WhenVisible
                                            always
                                            params={{
                                                certificates_page:
                                                    Number(certificatesPage) +
                                                    1,
                                                tab: activeTab,
                                            }}
                                            only={[
                                                'certificates',
                                                'certificatesPage',
                                                'isCertificatesNextPageExists',
                                            ]}
                                            fallback={
                                                <div className="flex justify-center">
                                                    <p className="text-muted-foreground">
                                                        You've reached the end.
                                                    </p>
                                                </div>
                                            }
                                        >
                                            <div className="flex justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            </div>
                                        </WhenVisible>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={CheckCircle}
                                title="No certificates yet"
                                description="Complete courses to earn certificates!"
                                buttonText="View In-Progress Courses"
                                buttonLink="/student/dashboard?tab=in-progress"
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
