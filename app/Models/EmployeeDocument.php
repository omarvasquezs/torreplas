<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    protected $fillable = ['employee_id', 'name', 'type', 'path', 'original_name'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
