import Swal from 'sweetalert2';

// Standard styling configuration
const swalConfig = {
    customClass: {
        popup: 'rounded-3xl shadow-2xl border border-white/20 bg-white/95 backdrop-blur-xl',
        title: 'text-2xl font-bold text-slate-800',
        htmlContainer: 'text-slate-600',
        confirmButton: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-6 py-3 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform transition-all hover:-translate-y-0.5',
        cancelButton: 'bg-white text-slate-500 border-2 border-slate-200 rounded-xl px-6 py-3 font-semibold hover:bg-slate-50 hover:text-slate-700 transition-colors',
    },
    buttonsStyling: false,
    showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
};

export const showSuccess = (title, text) => {
    return Swal.fire({
        ...swalConfig,
        icon: 'success',
        title: title || 'Berhasil!',
        text: text,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
    });
};

export const showError = (title, text) => {
    return Swal.fire({
        ...swalConfig,
        icon: 'error',
        title: title || 'Gagal!',
        text: text,
        confirmButtonText: 'Tutup'
    });
};

export const showConfirm = async ({ title, text, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal' }) => {
    const result = await Swal.fire({
        ...swalConfig,
        icon: 'warning',
        title: title || 'Apakah Anda yakin?',
        text: text || "Tindakan ini tidak dapat dibatalkan!",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
        focusCancel: true
    });

    return result.isConfirmed;
};

export const showLoading = (title = 'Memproses...') => {
    Swal.fire({
        ...swalConfig,
        title: title,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const closeAlert = () => {
    Swal.close();
};
