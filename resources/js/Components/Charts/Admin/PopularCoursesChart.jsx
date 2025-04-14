import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const PopularCoursesChart = ({ popularCourses }) => {
    const chartData = [...popularCourses].reverse();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Popular Courses</CardTitle>
                <CardDescription>
                    Top courses by enrollment count
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid horizontal strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="course"
                                type="category"
                                width={150}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} enrollments`]}
                            />
                            <Bar
                                dataKey="total"
                                fill="hsl(var(--chart-3))"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PopularCoursesChart;
