<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispatchGuideItem extends Model
{
    protected $fillable = [
        'dispatch_guide_id',
        'product_id',
        'product_name',
        'unit_name',
        'quantity',
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(DispatchGuide::class, 'dispatch_guide_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
