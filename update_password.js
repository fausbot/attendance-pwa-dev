// Script temporal para actualizar la contraseña de administrador en Firestore
// Ejecutar este código en la consola del navegador (F12) en https://attendance-pwa-dev.web.app

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

async function updateAdminPassword() {
    try {
        const docRef = doc(db, 'settings', 'config');
        await setDoc(docRef, { adminPassword: 'perro456' }, { merge: true });
        console.log('✅ Contraseña actualizada exitosamente a: perro456');
    } catch (error) {
        console.error('❌ Error actualizando contraseña:', error);
    }
}

// Ejecutar
updateAdminPassword();
