<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrier extends Model
{
    protected $guarded = [];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }
}
