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
import { DollarSign } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

const RevenueChart = ({ monthlyRevenue }) => {
    const calculateTrend = () => {
        if (monthlyRevenue.length < 2) return { percentage: 0, isUp: true };

        const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].total;
        const previousMonth = monthlyRevenue[monthlyRevenue.length - 2].total;

        if (previousMonth === 0) return { percentage: 100, isUp: true };

        const percentage = ((lastMonth - previousMonth) / previousMonth) * 100;
        return {
            percentage: Math.abs(percentage).toFixed(1),
            isUp: percentage >= 0,
        };
    };

    const trend = calculateTrend();

    const chartData = monthlyRevenue;

    const chartConfig = {
        revenue: {
            label: 'Revenue',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                    Monthly revenue for the current year
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={300}>
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
                                    tickFormatter={(value) => `${value}`}
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
                                    dataKey="total"
                                    fill="var(--color-revenue, hsl(var(--primary)))"
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
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </>
                    ) : (
                        <>
                            Trending down by {trend.percentage}% this month{' '}
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default RevenueChart;
