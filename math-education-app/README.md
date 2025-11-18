# Aplicación Educativa de Matemáticas

Este proyecto es una aplicación web educativa diseñada para ayudar a estudiantes de primaria a aprender matemáticas básicas. Consta de un frontend desarrollado con HTML5, CSS3 y JavaScript, y un backend construido con Python y Flask.

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales: `frontend` y `backend`.

### Frontend

- **index.html**: Archivo HTML principal que sirve como interfaz de usuario.
- **css/styles.css**: Contiene los estilos para el frontend, asegurando un diseño moderno y adaptable.
- **js/app.js**: Código JavaScript para la interactividad y manejo de entradas del usuario.
- **assets/**: Directorio para recursos adicionales como fuentes e imágenes.
- **README.md**: Documentación del frontend, incluyendo instrucciones de uso.

### Backend

- **app.py**: Punto de entrada principal para el backend en Flask, inicializa la aplicación y configura las rutas.
- **requirements.txt**: Lista de dependencias necesarias para el backend, incluyendo Flask y otras librerías.
- **static/**: Directorio para servir archivos estáticos como CSS, JavaScript e imágenes.
- **templates/**: Contiene las plantillas HTML renderizadas con Jinja2 para contenido dinámico.
- **models/__init__.py**: Destinado a definir modelos de datos relacionados con el progreso del usuario y ejercicios.
- **routes/__init__.py**: Define las rutas de la aplicación, organizando los endpoints para distintas funcionalidades.
- **README.md**: Documentación del backend, con instrucciones de instalación y uso.

## Primeros Pasos

Para ejecutar la aplicación, sigue estos pasos:

### Frontend

1. Navega al directorio `frontend`.
2. Abre `index.html` en un navegador web para ver la aplicación.

### Backend

1. Navega al directorio `backend`.
2. Instala las dependencias requeridas usando:
   ```
   pip install -r requirements.txt
   ```
3. Ejecuta la aplicación Flask:
   ```
   python app.py
   ```

## Características

- Ejercicios matemáticos interactivos para estudiantes de primaria.
- Seguimiento del progreso del usuario.
- Diseño responsivo para accesibilidad en distintos dispositivos.

## Contribuir

¡Las contribuciones son bienvenidas! No dudes en enviar un pull request o abrir una incidencia con sugerencias