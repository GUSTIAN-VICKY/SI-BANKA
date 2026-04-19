<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UpdateLog extends Model
{
    use HasFactory;

    protected $table = 'update_log';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'date',
        'itemId',
        'itemName',
        'changeType',
        'oldValue',
        'newValue',
        'admin',
        'user_id',
        'bank_sampah_id'
    ];

    protected $casts = [
        'date' => 'datetime', // Changed from date to datetime
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
