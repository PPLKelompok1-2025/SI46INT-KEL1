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

const UserRoleDistributionChart = ({ userRoleDistribution }) => {
    const roleColors = {
        Admin: 'hsl(var(--chart-1))',
        Instructor: 'hsl(var(--chart-2))',
        Student: 'hsl(var(--chart-3))',
    };

    const chartData = userRoleDistribution.map((item) => ({
        name: item.role,
        value: item.total,
        fill: roleColors[item.role] || 'hsl(var(--chart-4))',
    }));

    const totalUsers = React.useMemo(() => {
        return userRoleDistribution.reduce((sum, item) => sum + item.total, 0);
    }, [userRoleDistribution]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Distribution of users by role</CardDescription>
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
                                                        {totalUsers}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            24
                                                        }
                                                        className="fill-muted-foreground"
                                                    >
                                                        Users
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
                                    `${value} users`,
                                    name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full space-y-2">
                    {chartData.map((entry, index) => (
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
                </div>
            </CardFooter>
        </Card>
    );
};

export default UserRoleDistributionChart;
