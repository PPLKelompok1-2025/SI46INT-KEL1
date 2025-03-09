'use client';

import { Pie, PieChart, ResponsiveContainer } from 'recharts';

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

// Define chart colors
const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-6))',
    'hsl(var(--chart-7))',
    'hsl(var(--chart-8))',
];

export default function EnrollmentChart({ enrollmentsByCourse }) {
    // Format data for the chart and create config
    const chartData = enrollmentsByCourse.map((item, index) => ({
        course: item.course,
        enrollments: item.total,
        fill: `var(--color-course-${index + 1}, ${chartColors[index % chartColors.length]})`,
    }));

    // Create dynamic chart config based on the courses
    const chartConfig = {
        enrollments: {
            label: 'Enrollments',
        },
        ...Object.fromEntries(
            enrollmentsByCourse.map((item, index) => [
                `course-${index + 1}`,
                {
                    label: item.course,
                    color: chartColors[index % chartColors.length],
                },
            ]),
        ),
    };

    // Calculate total enrollments
    const totalEnrollments = enrollmentsByCourse.reduce(
        (sum, item) => sum + item.total,
        0,
    );

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Enrollment Distribution</CardTitle>
                <CardDescription>Enrollments by course</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-foreground"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) =>
                                            `${value} students`
                                        }
                                    />
                                }
                            />
                            <Pie
                                data={chartData}
                                dataKey="enrollments"
                                nameKey="course"
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                                outerRadius={80}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="text-sm">
                <div className="w-full text-center text-muted-foreground">
                    Total of {totalEnrollments} enrollments across{' '}
                    {enrollmentsByCourse.length} courses
                </div>
            </CardFooter>
        </Card>
    );
}
