<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PadronRuc extends Model
{
    protected $table = 'padron_ruc';
    protected $primaryKey = 'ruc';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['ruc', 'nombre', 'estado', 'condicion', 'updated_at'];
}
