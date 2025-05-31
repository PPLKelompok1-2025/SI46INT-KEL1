import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        end_date: '',
        max_uses: '',
        min_cart_value: '0',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.promo-codes.store'));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Promo Code" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route('admin.promo-codes.index')}
                            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Promo Codes
                        </Link>
                        <h1 className="text-3xl font-bold">
                            Create Promo Code
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Promo Code Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        Code{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={data.code}
                                        onChange={handleChange}
                                        placeholder="e.g. SUMMER25"
                                        className={
                                            errors.code
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">
                                            {errors.code}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        This is the code users will enter to
                                        apply the discount.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Active</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            name="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData('is_active', checked)
                                            }
                                        />
                                        <span>
                                            {data.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive promo codes cannot be used.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={handleChange}
                                    placeholder="Enter a description for this promo code"
                                    className={
                                        errors.description
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="discount_type">
                                        Discount Type{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.discount_type}
                                        onValueChange={(value) =>
                                            setData('discount_type', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="discount_type"
                                            className={
                                                errors.discount_type
                                                    ? 'border-destructive'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">
                                                Percentage
                                            </SelectItem>
                                            <SelectItem value="fixed">
                                                Fixed Amount
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.discount_type && (
                                        <p className="text-sm text-destructive">
                                            {errors.discount_type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_value">
                                        Discount Value{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center">
                                            <span className="flex h-full items-center border-r bg-muted px-3 text-muted-foreground">
                                                {data.discount_type ===
                                                'percentage'
                                                    ? '%'
                                                    : '$'}
                                            </span>
                                        </div>
                                        <Input
                                            id="discount_value"
                                            name="discount_value"
                                            type="number"
                                            min={0}
                                            max={
                                                data.discount_type ===
                                                'percentage'
                                                    ? 100
                                                    : undefined
                                            }
                                            step={
                                                data.discount_type ===
                                                'percentage'
                                                    ? 1
                                                    : 0.01
                                            }
                                            value={data.discount_value}
                                            onChange={handleChange}
                                            className={`pl-12 ${
                                                errors.discount_value
                                                    ? 'border-destructive'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                    {errors.discount_value && (
                                        <p className="text-sm text-destructive">
                                            {errors.discount_value}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {data.discount_type === 'percentage'
                                            ? 'Enter a value from 1 to 100.'
                                            : 'Enter the fixed discount amount.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={handleChange}
                                        className={
                                            errors.start_date
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank for immediate availability.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={handleChange}
                                        className={
                                            errors.end_date
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_date}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank for no expiration.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_uses">
                                        Maximum Uses
                                    </Label>
                                    <Input
                                        id="max_uses"
                                        name="max_uses"
                                        type="number"
                                        min={1}
                                        value={data.max_uses}
                                        onChange={handleChange}
                                        placeholder="Unlimited"
                                        className={
                                            errors.max_uses
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.max_uses && (
                                        <p className="text-sm text-destructive">
                                            {errors.max_uses}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank for unlimited uses.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_cart_value">
                                        Minimum Purchase Amount
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center">
                                            <span className="flex h-full items-center border-r bg-muted px-3 text-muted-foreground">
                                                Rp
                                            </span>
                                        </div>
                                        <Input
                                            id="min_cart_value"
                                            name="min_cart_value"
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={data.min_cart_value}
                                            onChange={handleChange}
                                            className={`pl-12 ${
                                                errors.min_cart_value
                                                    ? 'border-destructive'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                    {errors.min_cart_value && (
                                        <p className="text-sm text-destructive">
                                            {errors.min_cart_value}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Minimum purchase amount required to use
                                        this code.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Create Promo Code
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
