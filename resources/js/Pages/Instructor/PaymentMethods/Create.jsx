import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Landmark } from 'lucide-react';
import { useEffect } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'bank_transfer',
        bank_name: '',
        account_name: '',
        account_number: '',
        paypal_email: '',
        is_default: true,
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route('instructor.payment-methods.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    // When type changes, reset the form fields for the other type
    useEffect(() => {
        if (data.type === 'bank_transfer') {
            setData('paypal_email', '');
        } else if (data.type === 'paypal') {
            setData('bank_name', '');
            setData('account_name', '');
            setData('account_number', '');
        }
    }, [data.type]);

    return (
        <AuthenticatedLayout>
            <Head title="Add Payment Method" />

            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link href={route('instructor.payment-methods.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                            Payment Methods
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        Add Payment Method
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method Details</CardTitle>
                        <CardDescription>
                            Add a new payment method for withdrawals
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Payment Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select payment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">
                                                Bank Transfer
                                            </SelectItem>
                                            <SelectItem value="paypal">
                                                PayPal
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-destructive">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                <Tabs value={data.type} className="mt-6">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger
                                            value="bank_transfer"
                                            onClick={() =>
                                                setData('type', 'bank_transfer')
                                            }
                                        >
                                            <Landmark className="mr-2 h-4 w-4" />
                                            Bank Transfer
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="paypal"
                                            onClick={() =>
                                                setData('type', 'paypal')
                                            }
                                        >
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            PayPal
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="bank_transfer"
                                        className="space-y-4 pt-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_name">
                                                Bank Name
                                            </Label>
                                            <Input
                                                id="bank_name"
                                                value={data.bank_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'bank_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter bank name"
                                            />
                                            {errors.bank_name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.bank_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="account_name">
                                                Account Holder Name
                                            </Label>
                                            <Input
                                                id="account_name"
                                                value={data.account_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'account_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter account holder name"
                                            />
                                            {errors.account_name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.account_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="account_number">
                                                Account Number
                                            </Label>
                                            <Input
                                                id="account_number"
                                                value={data.account_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'account_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter account number"
                                            />
                                            {errors.account_number && (
                                                <p className="text-sm text-destructive">
                                                    {errors.account_number}
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="paypal"
                                        className="space-y-4 pt-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="paypal_email">
                                                PayPal Email
                                            </Label>
                                            <Input
                                                id="paypal_email"
                                                type="email"
                                                value={data.paypal_email}
                                                onChange={(e) =>
                                                    setData(
                                                        'paypal_email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter PayPal email address"
                                            />
                                            {errors.paypal_email && (
                                                <p className="text-sm text-destructive">
                                                    {errors.paypal_email}
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center space-x-2 pt-4">
                                    <Checkbox
                                        id="is_default"
                                        checked={data.is_default}
                                        onCheckedChange={(checked) =>
                                            setData('is_default', checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="is_default"
                                        className="font-normal"
                                    >
                                        Set as default payment method
                                    </Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Payment Method'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-6 py-3">
                        <p className="text-sm text-muted-foreground">
                            Your payment information is stored securely and will
                            only be used for processing your withdrawal
                            requests.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
