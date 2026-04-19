import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ScanLine, Plus, X, Package, CheckCircle, Users, Loader2, AlertTriangle, Camera, Image as ImageIcon, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { compressImage } from '../../utils/imageUtils';
import { CameraCaptureModal } from './CameraCaptureModal';

export function NewTransactionModal({
  customers,
  wasteTypes,
  cart,
  setCart,
  selectedCustomer,
  setSelectedCustomer,
  setShowNewTransactionModal,
  handleConfirmTransaction,
  handleAddToCart,
  handleRemoveFromCart,
  geminiLoading,
  error // Error prop from Dashboard.jsx
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [wasteId, setWasteId] = useState(wasteTypes.length > 0 ? wasteTypes[0].id : '');
  const [weight, setWeight] = useState('');
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(localSearch.toLowerCase()) || c.id.toLowerCase().includes(localSearch.toLowerCase()));
  // Check if mobile (width < 768) OR short screen (height < 700) for landscape phones
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768 || window.innerHeight < 700);

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path; // Base64
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  const [showCameraModal, setShowCameraModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || window.innerHeight < 700);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (wasteTypes.length > 0 && !wasteId) {
      setWasteId(wasteTypes[0].id);
    }
  }, [wasteTypes, wasteId]);

  const [proofPhoto, setProofPhoto] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

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

  const handleConfirmAndClose = async () => {
    // Rely on geminiLoading prop passed from parent (Dashboard logic)
    // The parent function (handleConfirmTransaction) sets geminiLoading=true
    await handleConfirmTransaction(proofPhoto);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] animate-fadeIn md:p-6">
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

      <div className={`bg-white w-full md:max-w-6xl h-[100dvh] md:h-[90vh] md:rounded-[2.5rem] shadow-2xl flex flex-col ${isMobile ? '' : 'md:flex-row'} overflow-hidden animate-slideUp md:animate-fadeIn relative ${selectedCustomer && isMobile ? 'bg-slate-50' : ''}`}>

        {/* Mobile Header when Customer is Selected */}
        {isMobile && selectedCustomer && (
          <div className="bg-white/80 backdrop-blur-md p-4 flex items-center gap-3 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
            <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">
              <X size={20} />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden bg-slate-100 border border-slate-200 mr-2`}>
              {selectedCustomer.photo_path ? (
                <img src={getPhotoUrl(selectedCustomer.photo_path)} alt={selectedCustomer.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400">{selectedCustomer.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 leading-none">{selectedCustomer.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.id}</p>
              {selectedCustomer.alamat && (
                <p className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin size={10} />
                  {selectedCustomer.alamat}
                </p>
              )}
            </div>
            <div className="bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
              {formatCurrency(selectedCustomer.balance)}
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR: Customer Selection */}
        {(!selectedCustomer || !isMobile) && (
          <div className={`w-full md:w-72 lg:w-80 border-r border-slate-200 bg-white flex flex-col ${isMobile ? 'h-full' : ''}`}>
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Users size={20} /></div>
                  Nasabah
                </h3>
                <p className="text-xs text-slate-400 font-medium ml-9 mt-0.5">Cari nasabah</p>
              </div>
              {isMobile && (
                <button onClick={() => setShowNewTransactionModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-4 bg-white sticky top-[76px] z-10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Cari nama..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-semibold text-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-6 space-y-2 custom-scrollbar">
              {filteredCustomers.map(cust => (
                <button
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${selectedCustomer?.id === cust.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-transparent bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden ${selectedCustomer?.id === cust.id ? 'bg-white text-emerald-600' : 'bg-white text-slate-400'}`}>
                      {cust.photo_path ? (
                        <img src={getPhotoUrl(cust.photo_path)} alt={cust.name} className="w-full h-full object-cover" />
                      ) : (
                        cust.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${selectedCustomer?.id === cust.id ? 'text-emerald-800' : 'text-slate-700 group-hover:text-emerald-700'}`}>{cust.name}</p>
                      <p className={`text-[10px] truncate ${selectedCustomer?.id === cust.id ? 'text-emerald-600' : 'text-slate-400'}`}>{cust.id}</p>
                      {cust.alamat && (
                        <p className={`text-[9px] truncate flex items-center gap-0.5 mt-0.5 ${selectedCustomer?.id === cust.id ? 'text-blue-600' : 'text-slate-400'}`}>
                          <MapPin size={8} />
                          {cust.alamat}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${selectedCustomer?.id === cust.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 group-hover:text-emerald-500'}`}>
                    <Plus size={14} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT CONTENT: Transaction Input */}
        {(selectedCustomer || !isMobile) && (
          <div className={`flex-1 flex flex-col md:flex-row overflow-hidden relative ${isMobile && !selectedCustomer ? 'hidden' : ''}`}>
            {!isMobile && (
              <button
                onClick={() => { setShowNewTransactionModal(false); setSelectedCustomer(null); setCart([]); }}
                className="absolute right-4 top-4 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full z-50 shadow-sm border border-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            )}

            {selectedCustomer ? (
              <>
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                  <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-32 md:pb-8">
                    {!isMobile && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/30 overflow-hidden">
                          {selectedCustomer.photo_path ? (
                            <img src={getPhotoUrl(selectedCustomer.photo_path)} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                          ) : (
                            selectedCustomer.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-800">{selectedCustomer.name}</h2>
                          <p className="text-slate-500 text-sm font-medium ml-1">Saldo: <span className="text-emerald-600 font-bold">{formatCurrency(selectedCustomer.balance)}</span></p>
                        </div>
                      </div>
                    )}

                    {/* Waste Type Grid */}
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">1. Pilih Jenis Sampah</h4>
                      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {wasteTypes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setWasteId(t.id)}
                            className={`relative p-4 rounded-3xl border-2 text-left transition-all duration-200 group active:scale-95 ${wasteId === t.id
                              ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10 shadow-emerald-500/20 shadow-lg z-10 scale-[1.02]'
                              : 'border-white bg-white hover:border-emerald-200 hover:shadow-xl shadow-sm'
                              }`}
                          >
                            <div className="text-3xl mb-2 transform transition-transform group-hover:scale-110">{t.icon}</div>
                            <p className={`font-bold text-sm leading-tight mb-1 ${wasteId === t.id ? 'text-emerald-800' : 'text-slate-700'}`}>{t.name}</p>
                            <p className="text-xs font-mono text-slate-400">{formatCurrency(t.price)}/kg</p>
                            {wasteId === t.id && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-scaleIn">
                                <CheckCircle size={12} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Weight Input */}
                    <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Masukkan Berat</h4>
                      <div className="flex flex-col xl:flex-row gap-3 items-stretch">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-3xl font-black text-slate-800 pr-12 outline-none transition-all placeholder:text-slate-300"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">KG</span>
                        </div>
                        <button
                          onClick={() => { handleAddToCart(wasteId, weight); setWeight(''); }}
                          disabled={!weight || parseFloat(weight) <= 0}
                          className="bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100 min-w-[120px]"
                        >
                          <Plus size={20} strokeWidth={3} />
                          <span className="text-base">TAMBAH</span>
                        </button>
                      </div>
                    </section>
                  </div>
                </div>

                {/* SUMMARY SIDEBAR / BOTTOM SHEET */}
                <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col h-[45vh] md:h-auto z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h4 className="font-black text-slate-700 flex items-center gap-2 text-base">
                      <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><Package size={18} /></div>
                      Keranjang <span className="text-slate-400 font-medium text-xs">({cart.length})</span>
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 m-2 rounded-3xl">
                        <Package size={48} className="mb-3 opacity-50" />
                        <p className="font-bold">Keranjang Kosong</p>
                        <p className="text-xs">Tambahkan item dari menu.</p>
                      </div>
                    ) : (
                      cart.map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-slate-100 animate-slideUp">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">{item.icon}</span>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{item.name}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{item.weight}kg x {formatCurrency(item.price)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-600">{formatCurrency(item.total)}</p>
                            <button onClick={() => handleRemoveFromCart(i)} className="text-[10px] font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors mt-1">
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Proof & Checkout */}
                  <div className="p-5 bg-white border-t border-slate-100 space-y-4">
                    {/* Photo Proof Mini */}
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {proofPreview ? <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-500 mb-1">Bukti Foto (Opsional)</p>
                        <div className="flex gap-2">
                          {proofPreview ? (
                            <button onClick={() => { setProofPhoto(null); setProofPreview(null); }} className="text-xs text-red-500 font-bold hover:underline">Hapus</button>
                          ) : (
                            <>
                              <button onClick={() => setShowCameraModal(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100">Kamera</button>
                              <label className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 cursor-pointer">
                                Galeri <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect(e.target.files[0])} />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-bold text-sm">Total Tagihan</span>
                      <span className="text-2xl font-black text-slate-800">{formatCurrency(cart.reduce((sum, i) => sum + i.total, 0))}</span>
                    </div>

                    {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

                    <button
                      onClick={handleConfirmAndClose}
                      disabled={cart.length === 0 || geminiLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {geminiLoading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                      {geminiLoading ? 'Memproses...' : 'KONFIRMASI'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              !isMobile && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
                  <Users size={100} className="mb-6 opacity-20" />
                  <h3 className="text-xl font-bold text-slate-400">Pilih Nasabah</h3>
                  <p className="text-slate-400">Pilih nasabah dari menu kiri untuk memulai transaksi.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );

}
