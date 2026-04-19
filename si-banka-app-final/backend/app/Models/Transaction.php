<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customerId',
        'date',
        'total',
        'items',
        'proof_image',
        'user_id',
        'bank_sampah_id',
    ];

    protected $casts = [
        'items' => 'array',
        'date' => 'datetime',
    ];

    /**
     * Get the user who created this transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the customer associated with this transaction.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerId');
    }

    /**
     * Get the Bank Sampah that owns this transaction.
     */
    public function bankSampah()
    {
        return $this->belongsTo(BankSampah::class, 'bank_sampah_id');
    }
}
