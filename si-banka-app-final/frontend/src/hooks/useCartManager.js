import { useState } from 'react';

/**
 * useCartManager — Hook untuk Manajemen Keranjang Transaksi
 * 
 * State dan handler untuk keranjang setoran sampah.
 * Sebelumnya inline di Dashboard.jsx.
 */
export const useCartManager = (wasteTypes) => {
    const [cart, setCart] = useState([]);

    /**
     * Tambah item ke keranjang.
     * Menghitung total otomatis: berat (kg) × harga per kg.
     * 
     * @param {string} wasteId  ID jenis sampah
     * @param {number} weight   Berat dalam kg
     */
    const handleAddToCart = (wasteId, weight) => {
        if (!weight || weight <= 0) return;

        const waste = wasteTypes.find((w) => w.id === wasteId);
        if (!waste) return;

        const currentPrice = waste.price;
        const parsedWeight = parseFloat(weight);

        setCart((prev) => [
            ...prev,
            {
                ...waste,
                price: currentPrice,
                weight: parsedWeight,
                total: currentPrice * parsedWeight,
            },
        ]);
    };

    /**
     * Hapus item dari keranjang berdasarkan index.
     * 
     * @param {number} index  Index item yang akan dihapus
     */
    const handleRemoveFromCart = (index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * Kosongkan seluruh keranjang.
     */
    const clearCart = () => setCart([]);

    return {
        cart,
        setCart,
        handleAddToCart,
        handleRemoveFromCart,
        clearCart,
    };
};
