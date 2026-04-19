<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * AccountService
 * 
 * Mengelola pembuatan dan pengelolaan akun user untuk nasabah.
 * Logic generate username yang sebelumnya duplikat di 3 tempat
 * sekarang terpusat di sini.
 */
class AccountService
{
    /**
     * Generate username unik dari nama lengkap.
     * Format: nama_depan.nama_belakang (lowercase)
     * Jika sudah ada, tambahkan angka suffix.
     *
     * @param string $fullName  Nama lengkap nasabah
     * @return string  Username yang unik
     */
    public function generateUsername(string $fullName): string
    {
        $nameParts = explode(' ', trim($fullName));
        $firstName = strtolower($nameParts[0]);
        $lastName = count($nameParts) > 1 ? strtolower(end($nameParts)) : '';
        $username = $lastName ? "{$firstName}.{$lastName}" : $firstName;

        // Pastikan username unik
        $baseUsername = $username;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Buat akun user untuk nasabah.
     *
     * @param Customer    $customer       Data nasabah
     * @param string      $password       Password plain text
     * @param string|null $bankSampahId   ID Bank Sampah (opsional, override customer)
     * @return User  User yang baru dibuat
     */
    public function createNasabahAccount(Customer $customer, string $password, ?string $bankSampahId = null): User
    {
        $username = $this->generateUsername($customer->name);

        // Generate email unik
        $randomSuffix = substr(md5(uniqid()), 0, 6);
        $email = $username . '.' . $randomSuffix . '@nasabah.sibanka.local';

        return User::create([
            'name' => $customer->name,
            'email' => $email,
            'username' => $username,
            'password' => Hash::make($password),
            'role' => User::ROLE_NASABAH,
            'customer_id' => $customer->id,
            'bank_sampah_id' => $bankSampahId ?? $customer->bank_sampah_id,
        ]);
    }

    /**
     * Buat akun untuk SEMUA nasabah yang belum punya akun.
     *
     * @param string $defaultPassword  Password default untuk semua akun baru
     * @return array  Array of created accounts [{customer_id, name, username}]
     */
    public function generateAllAccounts(string $defaultPassword = '123456'): array
    {
        $customersWithoutAccount = Customer::whereNotIn('id', function ($query) {
            $query->select('customer_id')
                ->from('users')
                ->whereNotNull('customer_id');
        })->get();

        $created = [];

        foreach ($customersWithoutAccount as $customer) {
            $user = $this->createNasabahAccount($customer, $defaultPassword);

            $created[] = [
                'customer_id' => $customer->id,
                'name' => $customer->name,
                'username' => $user->username,
            ];
        }

        return $created;
    }
}
