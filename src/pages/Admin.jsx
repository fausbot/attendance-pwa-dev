import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Download, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();
    const { isAdminAuthenticated } = useAuth();

    useEffect(() => {
        // Verificar si el usuario tiene permiso en el estado global
        if (!isAdminAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchLogs = async () => {
            try {
                const q = query(collection(db, "attendance"), orderBy("fecha", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLogs(data);
            } catch (error) {
                console.error("Error fetching logs:", error);
                alert("Error al cargar los datos: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const parseSpanishDate = (dateStr) => {
        // Convierte "6/2/2026" a objeto Date
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Meses en JS son 0-indexed
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
    };

    const exportToCSV = () => {
        setExporting(true);

        try {
            // Filtrar por rango de fechas
            let filteredLogs = logs;

            if (startDate || endDate) {
                filteredLogs = logs.filter(log => {
                    const logDate = parseSpanishDate(log.fecha);
                    if (!logDate) return false;

                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    if (start && logDate < start) return false;
                    if (end && logDate > end) return false;

                    return true;
                });
            }

            if (filteredLogs.length === 0) {
                alert('No hay registros en el rango de fechas seleccionado.');
                setExporting(false);
                return;
            }

            // Crear CSV
            const headers = ['Usuario', 'Tipo', 'Fecha', 'Hora', 'Localidad'];
            const csvRows = [headers.join(',')];

            filteredLogs.forEach(log => {
                const row = [
                    log.usuario || '',
                    log.tipo || '',
                    log.fecha || '',
                    log.hora || '',
                    `"${(log.localidad || '').replace(/"/g, '""')}"` // Escapar comillas
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');

            // Descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const fileName = startDate && endDate
                ? `asistencia_${startDate}_${endDate}.csv`
                : `asistencia_${new Date().toISOString().split('T')[0]}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error exportando CSV:', error);
            alert('Error al exportar. Por favor, intenta de nuevo.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                    <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                        Volver
                    </button>
                </div>

                {/* Sección de Exportación */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Download size={24} />
                        Exportar Registros a CSV
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={exportToCSV}
                            disabled={exporting}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                        >
                            <Download size={20} />
                            {exporting ? 'Exportando...' : 'Exportar CSV'}
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                        {startDate || endDate
                            ? `Exportará registros ${startDate ? `desde ${startDate}` : ''} ${endDate ? `hasta ${endDate}` : ''}`
                            : 'Exportará todos los registros disponibles'}
                    </p>
                </div>

                {/* Tabla de Registros */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Usuario</th>
                                    <th className="p-4 font-semibold text-gray-600">Tipo</th>
                                    <th className="p-4 font-semibold text-gray-600">Fecha</th>
                                    <th className="p-4 font-semibold text-gray-600">Hora</th>
                                    <th className="p-4 font-semibold text-gray-600">Localidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center">Cargando registros...</td></tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{log.usuario}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {log.tipo}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{log.fecha}</td>
                                        <td className="p-4 text-gray-600">{log.hora}</td>
                                        <td className="p-4 text-gray-500 text-sm">{log.localidad}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && !loading && (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay registros aún.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
