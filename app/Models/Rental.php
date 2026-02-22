<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rental extends Model
{
    protected $fillable = [
        'client_id', 'user_id', 'description', 'address',
        'monthly_fee', 'start_date', 'end_date', 'payment_day', 'status', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'monthly_fee'=> 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RentalPayment::class);
    }

    public function pendingPayments(): HasMany
    {
        return $this->hasMany(RentalPayment::class)->whereIn('status', ['pending', 'overdue']);
    }

    /** Generate payment record for a given YYYY-MM period (idempotent) */
    public function generatePaymentForPeriod(string $period): RentalPayment
    {
        return $this->payments()->firstOrCreate(
            ['period' => $period],
            [
                'due_date' => \Carbon\Carbon::parse($period . '-' . str_pad($this->payment_day, 2, '0', STR_PAD_LEFT)),
                'amount'   => $this->monthly_fee,
                'status'   => 'pending',
            ]
        );
    }
}
