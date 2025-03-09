'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

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
import { formatCurrency } from '@/lib/utils';

export default function EarningsChart({ monthlyEarnings }) {
    // Calculate trend percentage (comparing last month with previous month)
    const calculateTrend = () => {
        if (monthlyEarnings.length < 2) return { percentage: 0, isUp: true };

        const lastMonth = monthlyEarnings[monthlyEarnings.length - 1].total;
        const previousMonth = monthlyEarnings[monthlyEarnings.length - 2].total;

        if (previousMonth === 0) return { percentage: 100, isUp: true };

        const percentage = ((lastMonth - previousMonth) / previousMonth) * 100;
        return {
            percentage: Math.abs(percentage).toFixed(1),
            isUp: percentage >= 0,
        };
    };

    const trend = calculateTrend();

    // Format data for the chart
    const chartData = monthlyEarnings.map((item) => ({
        month: item.month,
        earnings: parseFloat(item.total),
    }));

    const chartConfig = {
        earnings: {
            label: 'Earnings',
            color: 'hsl(var(--chart-2))',
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Last 5 months</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
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
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="earnings"
                                    fill="var(--color-earnings, hsl(var(--primary)))"
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
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </>
                    ) : (
                        <>
                            Trending down by {trend.percentage}% this month{' '}
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total earnings for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}
