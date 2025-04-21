'use client';

import { TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

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
                item.course.toLowerCase().replace(/\s+/g, '-'),
                {
                    label: item.course,
                    color: chartColors[index % chartColors.length],
                },
            ]),
        ),
    };

    // Calculate total enrollments
    const totalEnrollments = React.useMemo(() => {
        return enrollmentsByCourse.reduce((sum, item) => sum + item.total, 0);
    }, [enrollmentsByCourse]);

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Enrollment Distribution</CardTitle>
                <CardDescription>Enrollments by course</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[350px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="enrollments"
                            nameKey="course"
                            innerRadius={80}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        'cx' in viewBox &&
                                        'cy' in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalEnrollments.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Enrollments
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Total of {totalEnrollments} enrollments across{' '}
                    {enrollmentsByCourse.length} courses
                </div>
                {enrollmentsByCourse.length > 0 && (
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Most popular: {enrollmentsByCourse[0].course}
                        <TrendingUp className="h-4 w-4" />
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
