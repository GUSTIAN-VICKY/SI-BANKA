import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Package, CheckCircle, Loader2, Save, Trash2, Camera, Image as ImageIcon, ScanLine, Edit, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { compressImage } from '../../utils/imageUtils';
import { CameraCaptureModal } from './CameraCaptureModal';
import { useModalClose } from '../../hooks/useModalClose';

export function EditTransactionModal({
    transaction,
    customers = [],
    wasteTypes = [],
    onClose,
    onSave, // Function to handle update
    geminiLoading,
    error
}) {
    useModalClose(onClose);

    // Initialize Cart and State from Transaction
    const [cart, setCart] = useState([]);
    const [wasteId, setWasteId] = useState(wasteTypes.length > 0 ? wasteTypes[0].id : '');
    const [weight, setWeight] = useState('');
    const [proofPhoto, setProofPhoto] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false);

    // Debugging Props
    console.log("EditTransactionModal Props:", { transaction, customers, onSave });

    // Check if mobile (width < 768) OR short screen (height < 700) for landscape phones
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768 || window.innerHeight < 700);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768 || window.innerHeight < 700);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Find customer for display - Handle both camelCase and snake_case or string vs number mismatch
    const customer = customers.find(c => String(c.id) === String(transaction.customerId || transaction.customer_id)) || { name: 'Unknown Customer', balance: 0 };

    useEffect(() => {
        if (transaction) {
            // Parse items
            const items = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : (transaction.items || []);
            // Map to cart structure (need wasteType icons usually, but fine for now)
            const mappedCart = items.map(item => {
                const wasteType = wasteTypes.find(w => w.id === item.id) || { icon: '📦', name: item.name };
                return {
                    id: item.id,
                    name: item.name,
                    icon: wasteType.icon,
                    price: parseFloat(item.price || 0),
                    weight: parseFloat(item.qty || item.weight || 0),
                    total: parseFloat(item.total || item.qty * item.price || 0)
                };
            });
            setCart(mappedCart);

            // Proof Image
            if (transaction.proof_image) {
                setProofPreview(`/storage/${transaction.proof_image}`);
                // Note: we don't set proofPhoto file unless user changes it
            }
        }
    }, [transaction, wasteTypes]);

    const handlePhotoSelect = async (file) => {
        if (!file) return;
        try {
            const compressed = await compressImage(file, 800, 0.7);
            setProofPhoto(compressed);
            setProofPreview(URL.createObjectURL(compressed));
        } catch (err) {
            console.error(err);
            setProofPhoto(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const handleAddToCart = () => {
        if (!weight || weight <= 0) return;
        const waste = wasteTypes.find(w => w.id === wasteId);
        if (!waste) return;

        // Use current price from wasteTypes (or should we preserve old price? Edit implies fixing, so maybe current price is better or make price editable?)
        // Usually, if editing a past transaction, we might want to keep the original price unless explicitly changing.
        // But for simplicity, we use the current price of the selected waste type. 
        // OR: we should look if the item already exists in cart and update it?
        // Let's separate "Add" as new item.

        const currentPrice = waste.price;
        setCart([...cart, { ...waste, price: currentPrice, weight: parseFloat(weight), total: currentPrice * parseFloat(weight) }]);
        setWeight('');
    };

    const handleRemoveFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

    const handleSave = () => {
        // Construct payload data
        // We pass the cart and the file (if any new one)
        // onSave(transaction.id, { items: cart, proofPhoto })

        // Just prepare items array and total
        const items = cart.map(item => ({
            id: item.id,
            name: item.name,
            qty: item.weight,
            price: item.price,
            total: item.total
        }));

        const total = cart.reduce((sum, i) => sum + i.total, 0);

        if (typeof onSave === 'function') {
            onSave(transaction.id, { items, total, date: transaction.date }, proofPhoto);
        } else {
            console.error("onSave prop is not a function!", onSave);
        }
    };

    return createPortal(
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4"
        >
            {/* Camera Capture Modal */}
            {showCameraModal && (
                <CameraCaptureModal
                    onClose={() => setShowCameraModal(false)}
                    onCapture={(file) => {
                        handlePhotoSelect(file);
                        setShowCameraModal(false);
                    }}
                />
            )}

            {/* Modal Container */}
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`bg-white w-full h-full shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slideUp relative ${!isMobile ? 'md:w-auto md:max-w-5xl md:h-[85vh] md:rounded-3xl' : ''}`}
            >

                {/* Close Button Mobile */}
                <button onClick={onClose} className="absolute right-4 top-4 md:hidden bg-slate-100/50 p-2 rounded-full z-20 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors backdrop-blur-sm"><X size={20} /></button>

                {/* LEFT: Item Input */}
                <div className={`flex-1 flex flex-col p-5 overflow-y-auto custom-scrollbar ${!isMobile ? 'md:p-8' : ''}`}>
                    <div className="flex items-center justify-between mb-6 pt-2 md:pt-0">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Edit size={20} /></div>
                                Edit Transaksi
                            </h3>
                            <p className="text-sm font-bold text-slate-400 ml-10">ID: <span className="font-mono text-slate-500">#{transaction.id.slice(0, 8)}</span></p>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    {isMobile ? (
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-200 p-1.5 rounded-lg text-blue-700"><Users size={16} /></div>
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Nasabah</p>
                                    <p className="font-extrabold text-blue-900 leading-none">{customer.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Saldo</p>
                                <p className="font-extrabold text-blue-900 leading-none">{formatCurrency(cart.reduce((s, i) => s + i.total, 0))}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl mb-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500"><Package size={140} /></div>
                            <h4 className="font-black text-2xl relative z-10 mb-1">{customer.name}</h4>
                            <p className="opacity-80 text-sm font-medium relative z-10 mb-4">Saldo Customer</p>
                            <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-xl p-3 inline-block border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80 block mb-1">Total Transaksi Ini</span>
                                <span className="text-2xl font-black">{formatCurrency(cart.reduce((s, i) => s + i.total, 0))}</span>
                            </div>
                        </div>
                    )}

                    {/* Add Item Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Tambah/Edit Sampah</label>
                            <div className="grid grid-cols-3 gap-3">
                                {wasteTypes.map(t => (
                                    <button key={t.id} onClick={() => setWasteId(t.id)} className={`p-3 rounded-2xl border text-center transition-all ${wasteId === t.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-gray-200 bg-white'}`}>
                                        <span className="text-2xl block mb-2">{t.icon}</span>
                                        <p className="font-bold text-xs text-gray-800 truncate">{t.name}</p>
                                        <p className="text-[10px] text-gray-500">{formatCurrency(t.price)}/kg</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Berat (kg)</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xl font-bold text-gray-800 pr-12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KG</span>
                                </div>
                                <button onClick={handleAddToCart} disabled={!weight || parseFloat(weight) <= 0} className="bg-blue-600 disabled:bg-gray-300 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors flex flex-col items-center justify-center leading-none min-w-[80px]">
                                    <Plus size={24} />
                                    <span className="text-[10px] mt-1">ADD</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Summary & Actions */}
                <div className="w-full md:w-96 bg-gray-50 border-l border-gray-200 flex flex-col h-[40vh] md:h-auto">
                    <div className="p-4 border-b border-gray-200 bg-white md:bg-transparent flex justify-between items-center">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2"><Package size={18} className="text-blue-600" /> Ringkasan</h4>
                        <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 m-2 rounded-xl">
                                <Package size={40} className="mb-2 opacity-30" />
                                <p className="text-sm">Keranjang kosong</p>
                            </div>
                        ) : (
                            cart.map((item, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 animate-slideIn">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.weight}kg x {formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-700">{formatCurrency(item.total)}</p>
                                        <button onClick={() => handleRemoveFromCart(i)} className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center justify-end gap-1"><Trash2 size={12} /> Hapus</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Proof Photo Section */}
                    <div className="px-4 py-2 border-t border-gray-200 bg-white">
                        <p className="text-xs font-bold text-gray-700 mb-2">Bukti Lampiran (Opsional)</p>
                        <div className="flex gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                                {proofPreview ? (
                                    <img src={proofPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ScanLine size={20} className="text-gray-400" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2 flex-1 justify-center">
                                {proofPreview ? (
                                    <button onClick={() => { setProofPhoto(null); setProofPreview(null); }} className="text-xs text-red-500 font-bold hover:underline text-left">Hapus / Ganti Foto</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowCameraModal(true)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                                            <Camera size={14} /> <span className="text-xs font-bold">Kamera</span>
                                        </button>
                                        <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors">
                                            <ImageIcon size={14} /> <span className="text-xs font-bold">Galeri</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect(e.target.files[0])} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500 font-medium">Total Baru</span>
                            <span className="text-2xl font-extrabold text-blue-600">{formatCurrency(cart.reduce((sum, i) => sum + i.total, 0))}</span>
                        </div>
                        <button onClick={handleSave} disabled={cart.length === 0 || geminiLoading} className="w-full bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]">
                            {geminiLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="opacity-50" />}
                            {geminiLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );

}
