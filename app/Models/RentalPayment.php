<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class RentalPayment extends Model
{
    protected $fillable = [
        'rental_id', 'period', 'due_date', 'paid_date',
        'amount', 'status', 'payment_method', 'reference', 'notes', 'receipt_number',
    ];

    protected $casts = [
        'due_date'  => 'date',
        'paid_date' => 'date',
        'amount'    => 'decimal:2',
    ];

    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    /** Auto-mark as overdue if due_date is in the past and still pending */
    public function checkOverdue(): void
    {
        if ($this->status === 'pending' && $this->due_date->isPast()) {
            $this->update(['status' => 'overdue']);
        }
    }
}
