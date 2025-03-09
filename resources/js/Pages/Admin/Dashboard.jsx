import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    DollarSign,
    GraduationCap,
    ShoppingCart,
    Users,
} from 'lucide-react';

export default function Dashboard({
    stats,
    recentTransactions,
    // recentUsers,
    // recentCourses,
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
                                    ${stats.totalRevenue.toFixed(2)}
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Overview</CardTitle>
                                    <CardDescription>
                                        Monthly revenue for the current year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        {/* This would be a chart component */}
                                        <p className="text-center text-muted-foreground">
                                            Revenue chart will be displayed here
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrollment Overview</CardTitle>
                                    <CardDescription>
                                        Monthly enrollments for the current year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        {/* This would be a chart component */}
                                        <p className="text-center text-muted-foreground">
                                            Enrollment chart will be displayed
                                            here
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

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
                                                ${transaction.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                        {/* Transactions tab content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest transactions on the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Transaction list would go here */}
                                <p className="text-center text-muted-foreground">
                                    Detailed transaction list will be displayed
                                    here
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        {/* Users tab content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Users</CardTitle>
                                <CardDescription>
                                    Latest users who joined the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* User list would go here */}
                                <p className="text-center text-muted-foreground">
                                    Detailed user list will be displayed here
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="courses" className="space-y-4">
                        {/* Courses tab content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Courses</CardTitle>
                                <CardDescription>
                                    Latest courses added to the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Course list would go here */}
                                <p className="text-center text-muted-foreground">
                                    Detailed course list will be displayed here
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
