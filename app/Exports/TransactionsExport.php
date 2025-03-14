<?php

namespace App\Exports;

use App\Models\Transaction;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $transactions;

    public function __construct(Collection $transactions)
    {
        $this->transactions = $transactions;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->transactions;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Transaction ID',
            'User Name',
            'User Email',
            'Course',
            'Amount',
            'Instructor Amount',
            'Status',
            'Type',
            'Payment Method',
            'Date',
        ];
    }

    /**
     * @param mixed $row
     *
     * @return array
     */
    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->transaction_id,
            $transaction->user ? $transaction->user->name : 'N/A',
            $transaction->user ? $transaction->user->email : 'N/A',
            $transaction->course ? $transaction->course->title : 'N/A',
            $transaction->amount,
            $transaction->instructor_amount,
            $transaction->status,
            $transaction->type,
            $transaction->payment_method,
            $transaction->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true]],
        ];
    }
}