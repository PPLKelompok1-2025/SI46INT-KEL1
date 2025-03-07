import CertificateCard from '@/Components/Student/CertificateCard';
import CourseCard from '@/Components/Student/CourseCard';
import EmptyState from '@/Components/Student/EmptyState';
import StatsOverview from '@/Components/Student/StatsOverview';
import WelcomeCard from '@/Components/Student/WelcomeCard';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function Dashboard({
    auth,
    enrolledCourses,
    inProgressCourses,
    completedCourses,
    certificates,
    recentActivities,
}) {
    return (
        <StudentLayout auth={auth}>
            <Head title="Student Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        My Learning Dashboard
                    </h1>

                    <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </Button>
                </div>

                {/* Welcome Card */}
                <WelcomeCard
                    userName={auth.user.name}
                    inProgressCourses={inProgressCourses}
                />

                {/* Stats Overview */}
                <StatsOverview
                    enrolledCourses={enrolledCourses}
                    certificates={certificates}
                />

                <Tabs defaultValue="in-progress" className="space-y-4">
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inProgressCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        type="in-progress"
                                    />
                                ))}
                            </div>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {completedCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        type="completed"
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="CheckCircle"
                                title="No completed courses yet"
                                description="Keep learning to complete your courses and earn certificates!"
                                buttonText="View In-Progress Courses"
                                buttonLink="/student/dashboard?tab=in-progress"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="all-courses" className="space-y-4">
                        {enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {enrolledCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        type={
                                            course.progress?.percentage === 100
                                                ? 'completed'
                                                : 'in-progress'
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={BookOpen}
                                title="No enrolled courses"
                                description="Start your learning journey by enrolling in a course!"
                                buttonText="Browse Courses"
                                buttonLink="/courses"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="certificates" className="space-y-4">
                        {certificates.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {certificates.map((certificate) => (
                                    <CertificateCard
                                        key={certificate.id}
                                        certificate={certificate}
                                        userName={auth.user.name}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="Award"
                                title="No certificates earned yet"
                                description="Complete courses to earn certificates of achievement!"
                                buttonText="View In-Progress Courses"
                                buttonLink="/student/dashboard?tab=in-progress"
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </StudentLayout>
    );
}
