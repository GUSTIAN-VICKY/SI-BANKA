<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Role constants - Hierarki 5 Role
     */
    const ROLE_SUPER_ADMIN_KOTA = 'super_admin_kota';  // Level Kota - Full access + User management
    const ROLE_ADMIN_KOTA = 'admin_kota';              // Level Kota - View all, no user management
    const ROLE_SUPER_ADMIN_RT = 'super_admin_rt';      // Level RT - Full access + User management
    const ROLE_ADMIN_RT = 'admin_rt';                  // Level RT - CRUD in own bank sampah
    const ROLE_NASABAH = 'nasabah';                    // Nasabah per RT
    
    // Legacy role mapping (untuk backward compatibility)
    const ROLE_SUPER_ADMIN = 'super_admin';            // Treated as super_admin_kota
    const ROLE_ADMIN = 'admin';                        // Treated as admin_rt

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'photo_path',
        'role',
        'customer_id',
        'bank_sampah_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke tabel customers (untuk akun nasabah)
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    /**
     * Relasi ke Bank Sampah
     */
    public function bankSampah()
    {
        return $this->belongsTo(BankSampah::class, 'bank_sampah_id');
    }

    /**
     * Cek apakah user adalah nasabah
     */
    public function isNasabah(): bool
    {
        return $this->role === self::ROLE_NASABAH;
    }

    /**
     * Cek apakah user adalah Super Admin Kota (global admin with user management)
     */
    public function isSuperAdminKota(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN_KOTA, self::ROLE_SUPER_ADMIN]);
    }

    /**
     * Cek apakah user adalah Admin Kota (global admin tanpa user management)
     */
    public function isAdminKota(): bool
    {
        return $this->role === self::ROLE_ADMIN_KOTA;
    }

    /**
     * Cek apakah user bisa lihat semua data (level kota)
     */
    public function canViewAllData(): bool
    {
        return $this->isSuperAdminKota() || $this->isAdminKota();
    }

    /**
     * Cek apakah user adalah Super Admin RT
     */
    public function isSuperAdminRT(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN_RT;
    }

    /**
     * Cek apakah user adalah Admin RT (termasuk legacy 'admin')
     */
    public function isAdminRT(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN_RT, self::ROLE_ADMIN]);
    }

    /**
     * Cek apakah user bisa kelola user (Super Admin only)
     */
    public function canManageUsers(): bool
    {
        return $this->isSuperAdminKota() || $this->isSuperAdminRT();
    }

    /**
     * Cek apakah user adalah admin level RT (bisa CRUD data)
     */
    public function isAdmin(): bool
    {
        return $this->isSuperAdminRT() || $this->isAdminRT();
    }

    /**
     * Cek apakah user bisa mengelola Bank Sampah tertentu
     */
    public function canManageBankSampah(?string $bankSampahId = null): bool
    {
        // Super Admin Kota bisa mengelola semua
        if ($this->isSuperAdminKota()) {
            return true;
        }

        // Super Admin RT dan Admin hanya bisa mengelola bank sampah mereka
        if ($bankSampahId === null) {
            return false;
        }

        return $this->bank_sampah_id === $bankSampahId;
    }

    /**
     * Get effective bank_sampah_id for filtering (null = all for super admin kota)
     */
    public function getEffectiveBankSampahId(): ?string
    {
        if ($this->isSuperAdminKota()) {
            return null; // Can see all
        }
        return $this->bank_sampah_id;
    }

    /**
     * Check if email is verified
     */
    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification);
    }
}

