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
import { GraduationCap } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

const MonthlyEnrollmentChart = ({ monthlyEnrollments }) => {
    // Calculate trend percentage
    const calculateTrend = () => {
        if (monthlyEnrollments.length < 2) return { percentage: 0, isUp: true };

        const lastMonth =
            monthlyEnrollments[monthlyEnrollments.length - 1].total;
        const previousMonth =
            monthlyEnrollments[monthlyEnrollments.length - 2].total;

        if (previousMonth === 0) return { percentage: 100, isUp: true };

        const percentage = ((lastMonth - previousMonth) / previousMonth) * 100;
        return {
            percentage: Math.abs(percentage).toFixed(1),
            isUp: percentage >= 0,
        };
    };

    const trend = calculateTrend();

    // Chart config
    const chartConfig = {
        enrollments: {
            label: 'Enrollments',
            color: 'hsl(var(--chart-2))',
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enrollment Overview</CardTitle>
                <CardDescription>
                    Monthly enrollments for the current year
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyEnrollments}>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="var(--color-enrollments, hsl(var(--chart-2)))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    {trend.isUp ? (
                        <>
                            Trending up by {trend.percentage}% this month{' '}
                            <GraduationCap className="h-4 w-4 text-green-500" />
                        </>
                    ) : (
                        <>
                            Trending down by {trend.percentage}% this month{' '}
                            <GraduationCap className="h-4 w-4 text-red-500" />
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default MonthlyEnrollmentChart;
