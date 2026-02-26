<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DispatchGuide extends Model
{
    protected $fillable = [
        'series',
        'correlative',
        'code',
        'issue_date',
        'recipient_name',
        'observations',
        'origin_ubigeo',
        'origin_address',
        'destination_ubigeo',
        'destination_address',
        'status',
        'user_id',
    ];

    protected $casts = [
        'issue_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DispatchGuideItem::class);
    }
}
