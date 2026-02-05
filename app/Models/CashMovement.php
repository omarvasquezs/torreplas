<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashMovement extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function cashRegister()
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
