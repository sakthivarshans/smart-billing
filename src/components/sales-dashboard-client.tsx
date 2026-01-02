
'use client';

import { useMemo, useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, ShoppingBag, Users, Download } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { format, subDays, isToday, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from './ui/date-picker';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#ffc658'];

export function SalesDashboardClient() {
    const { toast } = useToast();
    const { sales } = useAdminStore((state) => ({
        sales: state.sales,
    }));
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const salesData = useMemo(() => {
        const today = new Date();
        const todaysSales = sales.filter(sale => isToday(new Date(sale.date)) && sale.status === 'success');
        
        const todaysRevenue = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
        const todaysSaleCount = todaysSales.length;

        // Weekly sales
        const weeklySalesData = Array.from({ length: 7 }).map((_, i) => {
            const day = subDays(today, 6 - i);
            const dailySales = sales
                .filter(sale => format(new Date(sale.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && sale.status === 'success')
                .reduce((acc, sale) => acc + sale.total, 0);
            return {
                day: format(day, 'EEE'),
                sales: dailySales,
            };
        });

        // Top products
        const productSales = sales.filter(s => s.status === 'success').flatMap(sale => sale.items).reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1; // Count by quantity
            return acc;
        }, {} as Record<string, number>);

        const topProductsData = Object.entries(productSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        
        // New Customers (very basic implementation)
        // This is a simplified logic. A real app would track first purchase date.
        const recentCustomers = new Set(sales
            .filter(sale => isWithinInterval(new Date(sale.date), { start: subDays(today, 7), end: today }) && sale.status === 'success')
            .map(sale => sale.phoneNumber)
        );

        return {
            todaysRevenue,
            todaysSaleCount,
            weeklySalesData,
            topProductsData,
            newCustomersCount: recentCustomers.size
        };
    }, [sales]);

    const handleDownloadLogs = () => {
        if (sales.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Sales Data',
                description: 'There are no sales records to export.',
            });
            return;
        }

        if (fromDate && toDate && fromDate > toDate) {
            toast({
                variant: 'destructive',
                title: 'Invalid Date Range',
                description: '"From" date cannot be after "To" date.',
            });
            return;
        }
    
        const filteredSales = sales.filter(sale => {
            if (!fromDate || !toDate) return true; // No filter if dates are not set
            const saleDate = new Date(sale.date);
            return isWithinInterval(saleDate, { start: startOfDay(fromDate), end: endOfDay(toDate) });
        });

        if (filteredSales.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Sales in Date Range',
                description: 'There are no sales records in the selected period.',
            });
            return;
        }


        // Define CSV headers
        const headers = ['Date', 'Status', 'Payment ID', 'Order ID', 'Customer Phone', 'Total Amount', 'Item Count'];
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...filteredSales.map(sale => {
                const date = `"${new Date(sale.date).toLocaleString()}"`;
                const status = sale.status;
                const paymentId = sale.paymentResponse?.razorpay_payment_id || sale.id;
                const orderId = sale.paymentResponse?.razorpay_order_id || sale.paymentResponse?.error?.metadata?.order_id || 'N/A';
                const phone = sale.phoneNumber;
                const total = sale.total.toFixed(2);
                const itemCount = sale.items.length;
    
                return [date, status, paymentId, orderId, phone, total, itemCount].join(',');
            })
        ].join('\n');
    
        // Create a blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'payment_logs.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        toast({
            title: 'Download Started',
            description: 'Your payment logs are being downloaded.',
        });
    };

    const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-background border rounded-lg shadow-sm">
                    <p className="font-bold">{`${payload[0].payload.name}`}</p>
                    <p className="text-sm">{`Items Sold: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{salesData.todaysRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesData.todaysSaleCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesData.newCustomersCount}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Download Payment Logs</CardTitle>
                    <CardDescription>Select a date range to export payment records.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                    <DatePicker date={fromDate} setDate={setFromDate} placeholder="From Date" />
                    <DatePicker date={toDate} setDate={setToDate} placeholder="To Date" />
                    <Button onClick={handleDownloadLogs} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download Logs
                    </Button>
                </CardContent>
            </Card>


            {/* Charts */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Weekly Sales</CardTitle>
                        <CardDescription>A summary of sales over the last week.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={salesData.weeklySalesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip cursor={{ fill: 'hsla(var(--muted))' }} />
                                <Legend iconSize={10} />
                                <Bar dataKey="sales" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Selling Categories</CardTitle>
                        <CardDescription>A breakdown of your most popular product categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={salesData.topProductsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {salesData.topProductsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
