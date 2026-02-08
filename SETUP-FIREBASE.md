# 🔥 Configuración de Firebase para attendance-pwa-dev

Esta es la versión de desarrollo de tu aplicación de asistencia. Sigue estos pasos para configurarla con una **nueva cuenta de Firebase**.

## 📋 Pasos para configurar Firebase

### 1️⃣ Crear un nuevo proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. **IMPORTANTE**: Asegúrate de estar usando la cuenta de Firebase que quieres usar para desarrollo (diferente a la de producción)
3. Haz clic en "Agregar proyecto" o "Add project"
4. Nombre sugerido: `attendance-dev` o `control-entrada-dev`
5. Sigue el asistente de creación

### 2️⃣ Configurar Authentication

1. En el proyecto nuevo, ve a **Authentication** → **Sign-in method**
2. Habilita **Email/Password**
3. Crea los usuarios que necesites para pruebas

### 3️⃣ Configurar Firestore Database

1. Ve a **Firestore Database** → **Create database**
2. Selecciona modo **Production** (las reglas ya están en `firestore.rules`)
3. Elige la ubicación más cercana

### 4️⃣ Obtener las credenciales de Firebase

1. Ve a **Project Settings** (⚙️ en la parte superior izquierda)
2. Baja hasta **Your apps** → Selecciona **Web app** (</> icono)
3. Registra la app con un nombre como "attendance-dev-web"
4. Copia la configuración de Firebase (el objeto `firebaseConfig`)

### 5️⃣ Actualizar firebaseConfig.js

Abre el archivo `src/firebaseConfig.js` y reemplaza las credenciales con las de tu nuevo proyecto:

```javascript
const firebaseConfig = {
  apiKey: "TU-NUEVA-API-KEY",
  authDomain: "tu-proyecto-dev.firebaseapp.com",
  projectId: "tu-proyecto-dev",
  storageBucket: "tu-proyecto-dev.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### 6️⃣ Inicializar Firebase CLI en el proyecto

Abre una terminal en la carpeta `attendance-pwa-dev` y ejecuta:

```bash
firebase login
firebase init
```

Cuando te pregunte:
- **Which Firebase features?** → Selecciona **Firestore** y **Hosting**
- **Select a default Firebase project** → Selecciona tu nuevo proyecto
- **Firestore rules file** → Presiona Enter (usa `firestore.rules`)
- **Firestore indexes file** → Presiona Enter
- **Public directory** → Escribe `dist`
- **Configure as single-page app** → **Yes**
- **Set up automatic builds** → **No**
- **Overwrite index.html** → **No**

### 7️⃣ Desplegar las reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### 8️⃣ Probar localmente

```bash
npm run dev
```

### 9️⃣ Desplegar a Firebase Hosting (cuando estés listo)

```bash
npm run build
firebase deploy --only hosting
```

---

## 🎯 Resumen de diferencias

| Aspecto | Producción (`attendance-pwa`) | Desarrollo (`attendance-pwa-dev`) |
|---------|-------------------------------|-----------------------------------|
| **Carpeta** | `attendance-pwa` | `attendance-pwa-dev` |
| **Proyecto Firebase** | `control-de-entrada-3d85b` | Tu nuevo proyecto |
| **URL** | https://control-de-entrada-3d85b.web.app | Tu nueva URL |
| **Propósito** | Versión estable en uso | Experimentación y pruebas |

---

## ⚠️ Importante

- **NO modifiques** la carpeta `attendance-pwa` - esa es tu versión de producción
- Todos los experimentos hazlos en `attendance-pwa-dev`
- Los cambios en esta carpeta **NO afectarán** tu aplicación en producción
