<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists to avoid duplicates
        User::updateOrCreate(
            ['email' => 'admin@bankasentosa.id'],
            [
                'name' => 'Admin Bank Sampah',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'super_admin',
            ]
        );

        // Add more dummy users if needed for testing
        // User::factory(10)->create();
    }
}
