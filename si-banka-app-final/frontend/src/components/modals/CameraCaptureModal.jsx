import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCcw, Check, User } from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

export function CameraCaptureModal({ onClose, onCapture }) {
    useModalClose(onClose);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'


    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });

            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setError(null);
        } catch (err) {
            console.error("Camera Error:", err);
            if (!window.isSecureContext) {
                setError("Kamera diblokir oleh browser karena koneksi tidak aman (HTTP). Gunakan HTTPS atau localhost.");
            } else {
                setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Flip horizontally if using user facing camera (mirror effect)
            if (facingMode === 'user') {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get data URL
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            // Convert Data URL to File
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                    onClose();
                });
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 animate-fadeIn"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                    <h3 className="text-white font-bold flex items-center gap-2"><Camera size={20} /> Ambil Foto</h3>
                    <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md"><X size={20} /></button>
                </div>

                {/* Main Content */}
                <div className="relative aspect-[3/4] md:aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">
                    {/* Access Error */}
                    {error && (
                        <div className="text-center p-6 text-white max-w-xs">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><X size={32} /></div>
                            <p>{error}</p>
                            <button onClick={startCamera} className="mt-4 text-sm bg-white/10 px-4 py-2 rounded-lg">Coba Lagi</button>
                        </div>
                    )}

                    {/* Live Video */}
                    {!capturedImage && !error && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        />
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover animate-fadeIn" />
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-gray-900 flex justify-between items-center gap-4">
                    {!capturedImage ? (
                        <>
                            <button onClick={toggleCamera} className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                                <RefreshCcw size={24} />
                            </button>
                            <button onClick={handleCapture} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-95 transition-all">
                                <div className="w-14 h-14 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute"></div>
                                <div className="w-12 h-12 bg-white rounded-full"></div>
                            </button>
                            <div className="w-12"></div> {/* Spacer for balance */}
                        </>
                    ) : (
                        <>
                            <button onClick={handleRetake} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 text-white hover:bg-gray-700">Ulangi</button>
                            <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                                <Check size={20} /> Gunakan
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
