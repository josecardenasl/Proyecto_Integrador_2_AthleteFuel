# AthleteFuel

Plataforma web para que deportistas gestionen sus rutinas de entrenamiento y suplementación en un solo lugar. Incluye calendario de sesiones, recordatorios automáticos y un panel de administración para coaches.

## Aplicación desplegada

**[http://athletefuel-frontend-prod.s3-website-us-east-1.amazonaws.com](http://athletefuel-frontend-prod.s3-website-us-east-1.amazonaws.com)**

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | 31 AWS Lambda (Node.js 20.x) |
| Base de datos | Amazon DynamoDB |
| API | AWS API Gateway |
| Hosting | Amazon S3 (sitio estático) |
| Autenticación | JWT |
| Correos | Resend API |
| Infraestructura | Serverless Framework |

---

## Manual de Usuario

### Acceso a la aplicación

Ingresar a: [http://athletefuel-frontend-prod.s3-website-us-east-1.amazonaws.com](http://athletefuel-frontend-prod.s3-website-us-east-1.amazonaws.com)

---

### Para el Usuario

#### 1. Registro
1. En la pantalla de inicio, hacer clic en **"Regístrate aquí"**.
2. Completar nombre, correo electrónico y contraseña.
3. Hacer clic en **"Crear cuenta"**.
4. El sistema redirige automáticamente al Dashboard.

#### 2. Inicio de sesión
1. Ingresar correo y contraseña en la pantalla principal.
2. Hacer clic en **"Iniciar sesión"**.

#### 3. Recuperar contraseña
1. En la pantalla de login, hacer clic en **"¿Olvidaste tu contraseña?"**.
2. Ingresar el correo registrado y enviar.
3. Revisar el correo y hacer clic en el enlace recibido.
4. Ingresar la nueva contraseña y confirmar.

---

#### 4. Dashboard — Entrenamientos
- Visualiza todos tus planes de entrenamiento creados.
- **Crear:** clic en **"+ Agregar"** → completar nombre, tipo (Cardio, Fuerza, HIIT, Flexibilidad, Otro), duración en minutos y notas opcionales → **"Guardar"**.
- **Editar:** clic en **"Editar"** en la tarjeta → modificar campos → **"Guardar"**.
- **Eliminar:** clic en **"Eliminar"** → confirmar.
- **Programar sesión:** clic en **"Programar"** → seleccionar fecha y hora → **"Programar"**. El sistema redirige al Calendario.

#### 5. Dashboard — Suplementos
- Visualiza todos tus suplementos registrados.
- **Crear:** clic en **"+ Agregar"** → completar nombre, dosis, momento del día (Mañana, Pre-entrenamiento, Post-entrenamiento, Noche) y notas → **"Guardar"**.
- **Editar / Eliminar:** igual que en Entrenamientos.
- **Programar ingesta:** clic en **"Programar"** → seleccionar fecha y uno o más horarios → **"Programar"**. Se pueden agregar múltiples horarios con **"+ Agregar horario"**.

#### 6. Dashboard — Calendario
- Vista mensual con todos los eventos del mes: sesiones de entrenamiento y programaciones de suplementos.
- Hacer clic en un evento para **editarlo o eliminarlo** directamente desde el calendario.
- Programar nuevos eventos con los botones **"+ Entrenamiento"** y **"+ Suplemento"** en la parte superior.

#### 7. Mi Perfil
1. Hacer clic en **"Mi perfil"** (esquina superior derecha).
2. Completar: peso (kg), altura (cm), edad, género, zona horaria y objetivos.
3. Activar o desactivar notificaciones y configurar cuántos minutos antes deseas ser avisado.
4. Clic en **"Guardar cambios"**.

#### 8. Notificaciones
- La **campana** en la barra de navegación muestra el número de recordatorios activos para hoy.
- Aparece un recordatorio cuando hay un entrenamiento o ingesta programados dentro del margen de minutos configurado en el perfil.
- Se puede descartar cada recordatorio individualmente o todos a la vez con **"Descartar todos"**.

---

### Para el Administrador

#### 1. Acceso al panel
- Iniciar sesión con una cuenta con rol administrador.
- El sistema redirige automáticamente al panel de administración (`/admin`).

#### 2. Gestión de usuarios
- La pantalla muestra la lista completa de usuarios registrados con nombre, correo y fecha de registro.
- **Eliminar usuario:** clic en el ícono de eliminar → confirmar en el diálogo.

#### 3. Ver datos de un usuario
- Clic en el nombre de un usuario para ver sus entrenamientos, suplementos, sesiones e ingestas.

#### 4. Asignar planes a un usuario
Desde el perfil del usuario seleccionado se puede asignar:
- Un **plan de entrenamiento** con nombre, tipo y duración.
- Un **suplemento** con dosis y momento del día.
- Una **sesión de entrenamiento** con fecha y hora.
- Una **ingesta de suplemento** con fecha y horarios.

#### 5. Logs de actividad
- En la sección **"Logs"** se visualiza el historial completo de acciones del sistema: registros, logins, creaciones, eliminaciones y asignaciones, con fecha, hora y usuario responsable.

---

## Estructura del repositorio

```
├── backend/
│   ├── lambdas/
│   │   ├── auth/          # Registro, login, perfil, recuperación de contraseña
│   │   ├── workouts/      # CRUD entrenamientos y sesiones
│   │   ├── supplements/   # CRUD suplementos e ingestas
│   │   └── admin/         # Gestión de usuarios, logs y asignaciones
│   ├── services/
│   └── serverless.yml     # Configuración de infraestructura AWS
└── frontend/
    └── vite-project/
        └── src/
            ├── pages/     # Login, Register, Dashboard, Admin, ForgotPassword, ResetPassword
            ├── components/ # Navbar, CalendarView, WorkoutForm, SupplementForm, ProfileForm, Toast
            └── services/  # api.js — consumo del API Gateway
```

---

## Despliegue

### Backend
```bash
cd backend
npm install
serverless deploy --region us-east-1
```

### Frontend
```bash
cd frontend/vite-project
npm install
npm run build
# Subir carpeta dist/ al bucket S3 con hosting estático habilitado
```
