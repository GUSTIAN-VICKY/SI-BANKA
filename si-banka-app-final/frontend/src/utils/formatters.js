/**
 * formatters.js — Fungsi Format Data
 * 
 * Formatting angka, currency, tanggal, dll.
 * Single source of truth untuk formatCurrency (sebelumnya duplikat di api.js dan notifications.js).
 */

/**
 * Format angka menjadi format Rupiah (IDR).
 * 
 * @param {number} value  Angka yang akan diformat
 * @returns {string}  Contoh: "Rp 150.000"
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
