# AstraPad

Una aplicación móvil de notas premium construida con React Native y Expo.

## Características
- ✨ Diseño futurista con Glassmorphism.
- 🌓 Modos Claro y Oscuro.
- 📂 Categorías: Teología y Filosofía.
- 🔍 Búsqueda y filtrado dinámico.
- 💾 Persistencia local con AsyncStorage.
- 🎨 UI/UX inspirada en diseños modernos.

## Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Expo Go](https://expo.dev/client) en tu dispositivo móvil para pruebas.
- [Java Development Kit (JDK)](https://adoptium.net/) (para generar el APK).
- [Android Studio](https://developer.android.com/studio) (para el entorno de emulación y Gradle).

## Instalación

1. Clona el repositorio (o descarga el código).
2. Abre una terminal en la carpeta raíz del proyecto.
3. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución en Desarrollo

Para probar la aplicación localmente:
```bash
npx expo start
```
Luego escanea el código QR con la app **Expo Go** en tu teléfono Android.

## Generación de APK (Android)

Para generar un archivo APK instalable, puedes utilizar los servicios de Expo Application Services (EAS):

1. Instala el CLI de EAS de forma global:
   ```bash
   npm install -g eas-cli
   ```

2. Inicia sesión en tu cuenta de Expo:
   ```bash
   eas login
   ```

3. Registra el proyecto en EAS:
   ```bash
   eas build:configure
   ```

4. Genera el APK (Build para Android):
   ```bash
   eas build --platform android --profile preview
   ```
   *Nota: El perfil `preview` suele estar configurado para generar un archivo APK en lugar de un AAB (App Bundle).*

## Estructura del Proyecto
- `src/components`: Componentes reutilizables de la interfaz.
- `src/screens`: Pantallas principales de la aplicación.
- `src/services`: Lógica de almacenamiento y servicios externos.
- `src/theme`: Sistema de diseño (colores, tipografía).
- `src/types`: Definiciones de tipos TypeScript.

---
Creado con ❤️
