import React, { useState } from 'react';
import { X, Lock, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPasswordModal({ isOpen, onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setIsAdminAuthenticated } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const docRef = doc(db, 'settings', 'config');
            const docSnap = await getDoc(docRef);

            let storedPassword = 'admin123'; // Default fallback

            if (docSnap.exists()) {
                storedPassword = docSnap.data().adminPassword;
            } else {
                // First run: Create the document with default
                try {
                    await setDoc(docRef, { adminPassword: 'admin123' });
                    console.log("Password document created via first run logic.");
                } catch (writeErr) {
                    console.error("Could not write default password (likely permission issue):", writeErr);
                }
            }

            // Limpiar espacios en blanco de ambas contraseñas
            const cleanPassword = password.trim();
            const cleanStoredPassword = storedPassword.trim();

            console.log('Contraseña ingresada:', cleanPassword);
            console.log('Contraseña almacenada:', cleanStoredPassword);

            if (cleanPassword === cleanStoredPassword) {
                // Otorgar acceso administrativo en el estado global (se pierde con F5)
                setIsAdminAuthenticated(true);

                onSuccess();
                setPassword('');
                onClose();
            } else {
                setError('Clave incorrecta');
            }
        } catch (err) {
            console.error("Error verifying password:", err);
            setError('Error de conexión verificando clave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="text-blue-600" size={20} />
                        Acceso Administrador
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">
                        Ingrese la clave maestra para gestionar usuarios.
                    </p>

                    <div className="space-y-2">
                        <input
                            type="text"
                            style={{ WebkitTextSecurity: 'disc' }}
                            name="x_access_id"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && password) {
                                    handleSubmit(e);
                                }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg tracking-widest"
                            placeholder="••••••"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !password}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Acceder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
