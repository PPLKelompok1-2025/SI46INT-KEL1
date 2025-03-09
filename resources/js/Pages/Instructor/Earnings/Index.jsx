import { Button } from '@/Components/ui/button';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Calendar, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function Index({
    totalEarnings,
    pendingEarnings,
    availableEarnings,
    recentTransactions,
    monthlyEarnings,
    withdrawalHistory,
}) {
    // Format chart data for recharts
    const chartData = monthlyEarnings.map((item) => ({
        month: item.month,
        earnings: parseFloat(item.total),
    }));

    // Calculate trend percentage (comparing current month to previous month)
    const calculateTrend = () => {
        if (chartData.length < 2) return { percentage: 0, isUp: true };

        const currentMonth = chartData[chartData.length - 1].earnings;
        const previousMonth = chartData[chartData.length - 2].earnings;

        if (previousMonth === 0) return { percentage: 100, isUp: true };

        const percentage =
            ((currentMonth - previousMonth) / previousMonth) * 100;
        return {
            percentage: Math.abs(percentage).toFixed(1),
            isUp: percentage >= 0,
        };
    };

    const trend = calculateTrend();

    // Chart configuration
    const chartConfig = {
        earnings: {
            label: 'Earnings',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Earnings Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Earnings Dashboard
                    </h1>
                    <Button asChild>
                        <Link href={route('instructor.earnings.withdraw')}>
                            <Wallet className="mr-2 h-4 w-4" /> Request
                            Withdrawal
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totalEarnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime earnings from all courses
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Earnings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(pendingEarnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Earnings from the last 30 days (not yet
                                available)
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available for Withdrawal
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(availableEarnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Amount available for withdrawal
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Earnings Overview</CardTitle>
                            <CardDescription>
                                Your earnings over the last 12 months
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="h-[300px] w-full"
                            >
                                <BarChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `$${value}`}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                formatter={(value) =>
                                                    formatCurrency(value)
                                                }
                                            />
                                        }
                                    />
                                    <Bar
                                        dataKey="earnings"
                                        fill="var(--color-earnings, hsl(var(--primary)))"
                                        radius={4}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                {trend.isUp ? 'Trending up' : 'Trending down'}{' '}
                                by {trend.percentage}% this month
                                <TrendingUp
                                    className={`h-4 w-4 ${trend.isUp ? 'text-green-500' : 'rotate-180 transform text-red-500'}`}
                                />
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Showing total earnings for the last{' '}
                                {chartData.length} months
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Your most recent course sales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map(
                                            (transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        <Link
                                                            href={route(
                                                                'instructor.courses.show',
                                                                transaction
                                                                    .course.id,
                                                            )}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {
                                                                transaction
                                                                    .course
                                                                    .title
                                                            }
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.user.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            transaction.created_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            transaction.instructor_amount,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center"
                                            >
                                                No transactions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route(
                                            'instructor.earnings.course',
                                            recentTransactions[0]?.course.id ||
                                                '',
                                        )}
                                    >
                                        View All Transactions
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Withdrawal History</CardTitle>
                            <CardDescription>
                                Your recent withdrawal requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawalHistory.length > 0 ? (
                                        withdrawalHistory.map((withdrawal) => (
                                            <TableRow key={withdrawal.id}>
                                                <TableCell>
                                                    {new Date(
                                                        withdrawal.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        withdrawal.amount,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            withdrawal.status ===
                                                            'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : withdrawal.status ===
                                                                    'approved'
                                                                  ? 'bg-green-100 text-green-800'
                                                                  : withdrawal.status ===
                                                                      'processed'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {withdrawal.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            withdrawal.status.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="h-24 text-center"
                                            >
                                                No withdrawal history found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
