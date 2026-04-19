<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sudah Terverifikasi - Si-Banka</title>
    <link rel="icon" href="{{ asset('logo.png') }}" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
        
        .floating-particle {
            position: absolute;
            background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.2));
            border-radius: 50%;
            animation: float-particle infinite ease-in-out;
        }

        @keyframes float-particle {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(10px, -20px); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
    
    <!-- Animated Particles -->
    <div class="floating-particle w-20 h-20 top-10 left-10" style="animation-duration: 6s;"></div>
    <div class="floating-particle w-32 h-32 top-1/4 right-10" style="animation-duration: 8s;"></div>
    
    <!-- Main Card -->
    <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 w-full max-w-md text-center shadow-2xl shadow-blue-900/50 transform transition-all hover:scale-[1.01] overflow-hidden">
        
        <!-- Decorative Top Gradient -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <!-- Logo -->
        <div class="mb-8 flex justify-center">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-3">
                <img src="{{ asset('logo.png') }}" alt="Si-Banka Logo" class="w-full h-full object-contain">
            </div>
        </div>

        <!-- Info Icon -->
        <div class="mb-6 inline-flex items-center justify-center p-4 bg-blue-50 rounded-full text-blue-600 mb-6 ring-4 ring-blue-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>

        <!-- Typography -->
        <h1 class="text-3xl font-bold text-slate-800 mb-3">
            Sudah Terverifikasi
        </h1>
        <p class="text-slate-500 mb-8 leading-relaxed">
            Akun Anda sudah diverifikasi sebelumnya. Tidak perlu melakukan tindakan apa pun.
        </p>

        <!-- Button -->
        <a href="https://localhost:5173/login" 
           class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl shadow-blue-500/30 transition-all duration-200">
            <span class="flex items-center gap-2">
                Masuk ke Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </span>
        </a>

        <!-- Footer -->
        <p class="mt-8 text-xs text-slate-400">
            © {{ date('Y') }} Si-Banka. Sistem Bank Sampah Digital.
        </p>
    </div>
</body>
</html>
