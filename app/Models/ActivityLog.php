<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'action', 'model', 'model_id', 'changes', 'ip_address'];

    protected $casts = ['changes' => 'array'];

    public $updatedAt = false; // only created_at needed

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $action, ?object $model = null, array $changes = []): void
    {
        $userId = Auth::id();
        static::create([
            'user_id'    => $userId,
            'action'     => $action,
            'model'      => $model ? class_basename($model) : null,
            'model_id'   => $model?->getKey(),
            'changes'    => $changes ?: null,
            'ip_address' => request()->ip(),
        ]);
    }
}
