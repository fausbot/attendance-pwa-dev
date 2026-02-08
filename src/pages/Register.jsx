import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAdminAuthenticated } = useAuth();

    React.useEffect(() => {
        if (!isAdminAuthenticated) {
            navigate('/login');
        }
    }, [isAdminAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        try {
            setError('');
            setLoading(true);
            // Auto-agregar dominio si no está presente
            const emailToUse = email.includes('@') ? email : `${email}@vertiaguas.com`;

            await createUserWithEmailAndPassword(auth, emailToUse, password);
            alert('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este usuario ya existe.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Error al crear cuenta: ' + err.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-sm bg-opacity-90">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Registrar Nuevo Empleado</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nuevo Usuario / ID</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej: nuevoempleado"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="text"
                            style={{ WebkitTextSecurity: 'disc' }}
                            name="new_sec_field_a"
                            autoComplete="off"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input
                            type="text"
                            style={{ WebkitTextSecurity: 'disc' }}
                            name="new_sec_field_b"
                            autoComplete="off"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                    >
                        Crear Cuenta
                    </button>
                    <div className="flex flex-col gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                            📊 Ver Registros y Exportar CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-green-600 hover:text-green-800 text-center"
                        >
                            Volver al Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
