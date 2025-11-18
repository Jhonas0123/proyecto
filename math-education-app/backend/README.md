# Backend de la Aplicación Educativa de Matemáticas

Este es el componente backend de la Aplicación Educativa de Matemáticas, diseñado para proporcionar una API robusta que sirva contenido educativo enfocado en matemáticas básicas para estudiantes de primaria.

## Estructura del Proyecto

- **app.py**: Punto de entrada principal para la aplicación Flask. Inicializa la app, configura las rutas y gestiona las solicitudes.
- **requirements.txt**: Lista las dependencias necesarias para el backend, incluyendo Flask y otras librerías.
- **static/**: Directorio para servir archivos estáticos como CSS, JavaScript e imágenes.
- **templates/**: Contiene las plantillas HTML renderizadas con Jinja2 para la generación de contenido dinámico.
- **models/**: Directorio para definir modelos de datos relacionados con el progreso del usuario y los ejercicios.
- **routes/**: Directorio para definir las rutas de la aplicación, organizando los endpoints para distintas funcionalidades.

## Instrucciones de Instalación

1. **Clona el repositorio**:
   ```
   git clone <url-del-repositorio>
   cd math-education-app/backend
   ```

2. **Crea un entorno virtual** (opcional pero recomendado):
   ```
   python -m venv venv
   source venv/bin/activate  # En Windows usa `venv\Scripts\activate`
   ```

3. **Instala las dependencias**:
   ```
   pip install -r requirements.txt
   ```

4. **Ejecuta la aplicación**:
   ```
   python app.py
   ```

5. **Accede a la API**: Abre tu navegador y navega a `http://localhost:5000` para acceder a la API del backend.

## Uso

- El backend sirve como API para el frontend, proporcionando endpoints para obtener contenido educativo, enviar el progreso del usuario y más.
- Asegúrate de que el servidor Flask esté ejecutándose antes de acceder a la aplicación frontend.

## Contribuir

¡Las contribuciones son bienvenidas! Por favor, envía un pull request o abre una incidencia para cualquier mejora o