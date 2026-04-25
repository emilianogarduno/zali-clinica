# Zalí Clínica 🐬

Sistema de Gestión de Terapia Acuática con Control Bluetooth - Dolphin Therapy Management System with Bluetooth Control

## Características ✨

- 👥 **Gestión de Pacientes** - Crear y organizar pacientes
- 🎮 **Control Remoto Joystick** - Control direccional intuitivo del dispositivo Bluetooth
- 📊 **Métricas y Historial** - Registrar y visualizar datos de sesiones
- 🔊 **Estímulo Auditivo** - Controlar estímulos auditivos durante la terapia
- 📱 **Responsive Design** - Funciona perfectamente en mobile y tablet
- 🔵 **Bluetooth BLE** - Conexión inalámbrica con dispositivos compatibles
- 🎨 **Interfaz Moderna** - Diseño limpio con Tailwind CSS

## Tecnologías Utilizadas 🛠️

- **React 18** - Librería de UI
- **Tailwind CSS 3** - Estilos y diseño responsive
- **Lucide React** - Iconos modernos
- **Web Bluetooth API** - Conexión BLE

## Instalación Local 🚀

```bash
# Clonar el repositorio
git clone https://github.com/emilianogarduno/zali-clinica.git
cd zali-clinica

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## Despliegue en Netlify 🌐

### Opción 1: Despliegue Automático (Recomendado)

1. Ir a [netlify.com](https://netlify.com)
2. Hacer clic en "New site from Git"
3. Seleccionar tu cuenta de GitHub
4. Elegir el repositorio `zali-clinica`
5. Los ajustes de compilación se rellenarán automáticamente:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Hacer clic en "Deploy site"

### Opción 2: Despliegue Manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Compilar la aplicación
npm run build

# Desplegar a producción
netlify deploy --prod --dir=build
```

## Uso de la Aplicación 📖

### 1. Gestión de Pacientes
- Visualizar la lista de pacientes existentes
- Agregar nuevos pacientes mediante el formulario
- Seleccionar un paciente para acceder a su perfil

### 2. Conectar Bluetooth
- Presionar el botón "Vincular Pez" en la esquina superior derecha
- Seleccionar el dispositivo Zalí de la lista
- Confirmar la conexión

### 3. Iniciar Sesión de Terapia
- Seleccionar un paciente
- Presionar "Iniciar Nueva Terapia"
- Pasar por las fases: Adaptación → Rutinas → Resumen
- Usar el joystick para controlar el dispositivo
- Registrar tiempos de cada fase

### 4. Ver Métricas
- Acceder al historial de un paciente
- Visualizar todas las sesiones registradas
- Ver tiempos de cada fase de terapia

## Estructura del Proyecto 📁

```
zali-clinica/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx              # Componente principal
│   ├── index.js             # Punto de entrada React
│   └── index.css            # Estilos globales
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Requisitos para Bluetooth 🔵

- Navegador moderno con soporte Web Bluetooth API:
  - Chrome/Chromium 56+
  - Edge 79+
  - Android Chrome
- HTTPS activado (requerido por Web Bluetooth API)
- Dispositivo Bluetooth BLE con UUID de servicio: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`

## Configuración de Bluetooth 🔧

Para conectar un dispositivo diferente, modifica los siguientes valores en `src/App.jsx`:

```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'TU_PREFIJO' }],  // Cambiar prefijo del dispositivo
  optionalServices: ['TU_UUID_SERVICIO']      // Cambiar UUID del servicio
});
```

## Comandos Bluetooth 📨

Los comandos enviados al dispositivo:
- `F` - Adelante (Forward)
- `B` - Atrás (Back)
- `L` - Izquierda (Left)
- `R` - Derecha (Right)
- `T` - Estímulo (Trigger)
- `S` - Detener (Stop)

## Desarrollo 💻

### Scripts disponibles:

```bash
# Iniciar modo desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test
```

## Notas Importantes ⚠️

- La aplicación requiere **HTTPS** para usar Web Bluetooth API
- Netlify proporciona HTTPS automáticamente
- Los datos de sesiones se almacenan en memoria (se pierden al recargar la página)
- Para persistencia, considera agregar localStorage o una base de datos

## Roadmap 🗺️

- [ ] Persistencia de datos con localStorage
- [ ] Exportar métricas a PDF
- [ ] Gráficos de progreso del paciente
- [ ] Autenticación de usuario
- [ ] Base de datos backend
- [ ] Sincronización en la nube

## Licencia 📄

MIT License - Siente libre de usar este proyecto

## Contacto 📧

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Hecho con ❤️ para la terapia acuática**
