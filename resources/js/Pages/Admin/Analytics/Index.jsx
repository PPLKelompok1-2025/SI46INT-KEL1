import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/Components/ui/chart';
import { DateRangePicker } from '@/Components/ui/date-range-picker';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { CreditCard, TrendingUp, Users } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

// Chart configuration
const revenueChartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'hsl(var(--chart-1))',
    },
};

const enrollmentChartConfig = {
    enrollments: {
        label: 'Enrollments',
        color: 'hsl(var(--chart-2))',
    },
};

export default function Index({
    stats,
    topCourses,
    dailyRevenue,
    dailyEnrollments,
    dateRange,
}) {
    // Calculate trend percentages (placeholder values - you can replace with real calculations)
    const revenueTrend = 5.2;
    const enrollmentTrend = 8.7;

    // Format data for charts to use the correct keys
    const formattedRevenueData = dailyRevenue.map((item) => ({
        date: item.date,
        revenue: parseFloat(item.total),
    }));

    const formattedEnrollmentData = dailyEnrollments.map((item) => ({
        date: item.date,
        enrollments: parseInt(item.total),
    }));

    const handleDateRangeUpdate = (values) => {
        const { range } = values;

        router.get(route('admin.analytics.index'), {
            start_date: range.from.toISOString().split('T')[0],
            end_date: range.to.toISOString().split('T')[0],
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analytics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <DateRangePicker
                        onUpdate={handleDateRangeUpdate}
                        initialDateFrom={dateRange?.start || new Date()}
                        initialDateTo={dateRange?.end || new Date()}
                        align="start"
                        locale="id-ID"
                        showCompare={false}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">
                                {formatCurrency(stats.totalRevenue)}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none text-green-600">
                                <TrendingUp className="h-4 w-4" />{' '}
                                {revenueTrend}% this month
                            </div>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Enrollments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">
                                {stats.totalEnrollments}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none text-green-600">
                                <TrendingUp className="h-4 w-4" />{' '}
                                {enrollmentTrend}% this month
                            </div>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                New Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900">
                                {stats.totalNewUsers}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-sm">
                            <div className="leading-none text-muted-foreground">
                                <Users className="mr-1 inline h-4 w-4" /> Active
                                students
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trends</CardTitle>
                            <CardDescription>
                                Daily revenue over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={revenueChartConfig}
                                className="h-[300px] w-full"
                            >
                                <LineChart
                                    accessibilityLayer
                                    data={formattedRevenueData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) =>
                                            value.slice(5)
                                        }
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <Line
                                        dataKey="revenue"
                                        type="natural"
                                        stroke="var(--color-revenue)"
                                        strokeWidth={2}
                                        dot={{
                                            fill: 'var(--color-revenue)',
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                <CreditCard className="h-4 w-4" /> Average daily
                                revenue:{' '}
                                {formatCurrency(
                                    stats.totalRevenue / dailyRevenue.length,
                                )}
                            </div>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Trends</CardTitle>
                            <CardDescription>
                                Daily enrollments over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={enrollmentChartConfig}
                                className="h-[300px] w-full"
                            >
                                <LineChart
                                    accessibilityLayer
                                    data={formattedEnrollmentData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) =>
                                            value.slice(5)
                                        }
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <Line
                                        dataKey="enrollments"
                                        type="natural"
                                        stroke="var(--color-enrollments)"
                                        strokeWidth={2}
                                        dot={{
                                            fill: 'var(--color-enrollments)',
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                <Users className="h-4 w-4" /> Average daily
                                enrollments:{' '}
                                {(
                                    stats.totalEnrollments /
                                    dailyEnrollments.length
                                ).toFixed(1)}
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Courses by Enrollment</CardTitle>
                        <CardDescription>
                            Courses with the highest enrollment numbers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Enrollments
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {topCourses.map((course) => (
                                        <tr key={course.id}>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {course.title}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {course.enrollments_count}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
