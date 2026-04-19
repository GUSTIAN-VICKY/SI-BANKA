<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'rt',
        'rw',
        'alamat',
        'balance',
        'last_deposit',
        'photo_path',
        'bank_sampah_id',
        'deleted_at',
    ];
    
    protected $casts = [
        'last_deposit' => 'datetime',
    ];

    /**
     * Get the Bank Sampah this customer belongs to
     */
    public function bankSampah()
    {
        return $this->belongsTo(BankSampah::class, 'bank_sampah_id');
    }

    /**
     * Get the user account for this customer
     */
    public function user()
    {
        return $this->hasOne(User::class, 'customer_id');
    }

    /**
     * Get all transactions for this customer
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'customerId');
    }
}

