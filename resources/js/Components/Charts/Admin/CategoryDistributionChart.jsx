import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import * as React from 'react';
import {
    Cell,
    Label,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const CategoryDistributionChart = ({ categoryDistribution }) => {
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

    const chartData = categoryDistribution.map((item, index) => ({
        name: item.category,
        value: item.total,
        fill: `var(--color-category-${index + 1}, ${chartColors[index % chartColors.length]})`,
    }));

    const totalCourses = React.useMemo(() => {
        return categoryDistribution.reduce((sum, item) => sum + item.total, 0);
    }, [categoryDistribution]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>
                    Distribution of courses by category
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill}
                                    />
                                ))}
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
                                                        {totalCourses}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            24
                                                        }
                                                        className="fill-muted-foreground"
                                                    >
                                                        Courses
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [
                                    `${value} courses`,
                                    name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full space-y-1">
                    {chartData.slice(0, 5).map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <div
                                    className="mr-2 h-3 w-3 rounded-full"
                                    style={{ backgroundColor: entry.fill }}
                                />
                                <span className="text-sm">{entry.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                    {chartData.length > 5 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                            +{chartData.length - 5} more categories
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default CategoryDistributionChart;
