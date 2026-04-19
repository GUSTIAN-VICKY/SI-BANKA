<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankSampah extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'bank_sampah';

    protected $fillable = [
        'name',
        'rt',
        'rw',
        'kelurahan',
        'kecamatan',
        'kota',
        'alamat',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all users belonging to this Bank Sampah
     */
    public function users()
    {
        return $this->hasMany(User::class, 'bank_sampah_id');
    }

    /**
     * Get all customers belonging to this Bank Sampah
     */
    public function customers()
    {
        return $this->hasMany(Customer::class, 'bank_sampah_id');
    }

    /**
     * Get all transactions belonging to this Bank Sampah
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'bank_sampah_id');
    }

    /**
     * Get waste types specific to this Bank Sampah
     */
    public function wasteTypes()
    {
        return $this->hasMany(WasteType::class, 'bank_sampah_id');
    }

    /**
     * Get the Super Admin RT of this Bank Sampah
     */
    public function superAdmin()
    {
        return $this->hasOne(User::class, 'bank_sampah_id')
                    ->where('role', 'super_admin_rt');
    }

    /**
     * Get formatted location string
     */
    public function getLocationAttribute(): string
    {
        $parts = ["RT {$this->rt}/RW {$this->rw}"];
        if ($this->kelurahan) $parts[] = $this->kelurahan;
        if ($this->kecamatan) $parts[] = $this->kecamatan;
        $parts[] = $this->kota;
        return implode(', ', $parts);
    }

    /**
     * Get statistics for this Bank Sampah
     */
    public function getStatsAttribute(): array
    {
        return [
            'total_customers' => $this->customers()->count(),
            'total_transactions' => $this->transactions()->count(),
            'total_admins' => $this->users()->whereIn('role', ['super_admin_rt', 'admin'])->count(),
        ];
    }
}
