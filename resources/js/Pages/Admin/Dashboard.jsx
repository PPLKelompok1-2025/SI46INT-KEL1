import CategoryDistributionChart from '@/Components/Charts/Admin/CategoryDistributionChart';
import MonthlyEnrollmentChart from '@/Components/Charts/Admin/MonthlyEnrollmentChart';
import PopularCoursesChart from '@/Components/Charts/Admin/PopularCoursesChart';
import RevenueChart from '@/Components/Charts/Admin/RevenueChart';
import UserRoleDistributionChart from '@/Components/Charts/Admin/UserRoleDistributionChart';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    Clock,
    DollarSign,
    GraduationCap,
    ShoppingCart,
    UserCog,
    Users,
} from 'lucide-react';

export default function Dashboard({
    stats,
    recentTransactions,
    recentUsers,
    recentCourses,
    monthlyRevenue,
    monthlyEnrollments,
    popularCourses,
    categoryDistribution,
    userRoleDistribution,
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Students
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalStudents}
                                </h3>
                            </div>
                            <Users className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Courses
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalCourses}
                                </h3>
                            </div>
                            <BookOpen className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Revenue
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalRevenue
                                        ? formatCurrency(stats.totalRevenue)
                                        : '0.00'}
                                </h3>
                            </div>
                            <DollarSign className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Enrollments
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalEnrollments}
                                </h3>
                            </div>
                            <GraduationCap className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Instructors
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalInstructors}
                                </h3>
                            </div>
                            <UserCog className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending Course Approvals
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.pendingCourses}
                                </h3>
                            </div>
                            <Clock className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="transactions">
                            Transactions
                        </TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <RevenueChart monthlyRevenue={monthlyRevenue} />
                            <MonthlyEnrollmentChart
                                monthlyEnrollments={monthlyEnrollments}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <CategoryDistributionChart
                                categoryDistribution={categoryDistribution}
                            />
                            <UserRoleDistributionChart
                                userRoleDistribution={userRoleDistribution}
                            />
                        </div>

                        <PopularCoursesChart popularCourses={popularCourses} />

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest 5 transactions on the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-full bg-primary/10 p-2">
                                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            transaction.course
                                                                .title
                                                        }
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.user.name}{' '}
                                                        •{' '}
                                                        {new Date(
                                                            transaction.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest transactions on the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-full bg-primary/10 p-2">
                                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            transaction.course
                                                                .title
                                                        }
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.user.name}{' '}
                                                        •{' '}
                                                        {new Date(
                                                            transaction.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Users</CardTitle>
                                <CardDescription>
                                    Latest users who joined the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-full bg-primary/10 p-2">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.email} •{' '}
                                                        {user.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <UserRoleDistributionChart
                            userRoleDistribution={userRoleDistribution}
                        />
                    </TabsContent>

                    <TabsContent value="courses" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Courses</CardTitle>
                                <CardDescription>
                                    Latest courses added to the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-full bg-primary/10 p-2">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {course.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        By {course.user.name} •{' '}
                                                        {course.category.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        course.price,
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {course.lessons_count}{' '}
                                                    lessons •{' '}
                                                    {course.enrollments_count}{' '}
                                                    enrollments
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Rating:{' '}
                                                    {Number(
                                                        course.average_rating,
                                                    ).toFixed(1)}
                                                    /5 ({course.reviews_count}{' '}
                                                    reviews)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <CategoryDistributionChart
                                categoryDistribution={categoryDistribution}
                            />
                            <PopularCoursesChart
                                popularCourses={popularCourses}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
