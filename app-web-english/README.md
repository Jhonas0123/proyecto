# Proyecto

Este es un proyecto fullstack que consiste en un backend en Python (FastAPI) y un frontend en React.

## Requisitos Previos

- Python 3.8 o superior
- Node.js 16.x o superior
- Yarn 1.22.x o superior
- MongoDB (para la base de datos) - por defecto usar la base de datos con nombre 'mi_base_de_datos'


## Configuración del Backend

1. Navega al directorio del backend:
```bash
cd backend
```

2. Crea un entorno virtual de Python:
```bash
sudo apt install -y python3-venv # si es la primera vez usando con entornos virtuales
python3 -m venv env  # iniciar un ambiente virtual
source env/bin/activate  # En Linux/Mac
```

3. Instala las dependencias:
```bash
pip install -r requirements.txt
```

extra - Como pase antes de iniciar para que realize la conexion de manera locar
usar dos comando
```bash
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="mi_base_de_datos"
```

4. Inicia el servidor:
```bash
uvicorn server:app --reload
```

El backend estará corriendo en `http://localhost:8000`

## Configuración del Frontend

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
yarn install
```

3. Inicia el servidor de desarrollo:
```bash
yarn start
```

El frontend estará corriendo en `http://localhost:3000`

## Estructura del Proyecto

- `backend/`: Servidor FastAPI con toda la lógica del backend
- `frontend/`: Aplicación React con componentes UI de Radix
- `tests/`: Pruebas del proyecto

## Notas Adicionales

- El frontend utiliza Tailwind CSS para los estilos
- Los componentes UI están basados en Radix UI
- El backend utiliza FastAPI con MongoDB como base de datos