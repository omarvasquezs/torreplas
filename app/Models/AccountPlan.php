<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountPlan extends Model
{
    protected $fillable = ['code', 'name', 'type', 'parent_id', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AccountPlan::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(AccountPlan::class, 'parent_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    /** Running balance: sum debits - sum credits (for asset/expense accounts) */
    public function getBalanceAttribute(): float
    {
        $debit  = $this->lines()->sum('debit');
        $credit = $this->lines()->sum('credit');
        return in_array($this->type, ['asset', 'expense'])
            ? $debit - $credit
            : $credit - $debit;
    }
}
