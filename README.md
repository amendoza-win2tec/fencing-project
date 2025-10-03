# Fencing XML Processor

Una aplicación NestJS independiente para procesar archivos XML de competiciones de esgrima y convertirlos a formato JSON.

## 🚀 Características

- **Parser XML**: Utiliza `xml2js` para convertir XML a JSON
- **API REST**: Endpoints para procesar XML de esgrima
- **Servicio de Procesamiento**: Convierte datos XML a formato W2TEC
- **Mapeo de Fases**: Transforma datos de competición a unidades de fase
- **Aplicación Independiente**: Proyecto standalone sin dependencias externas

## 📦 Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- npm, yarn o pnpm

### Instalación de Dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm (recomendado)
pnpm install
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
# Con npm
npm run start:dev

# Con yarn
yarn start:dev

# Con pnpm
pnpm start:dev
```

### Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

## 🔗 Endpoints

### Health Check
- **GET** `/api/health` - Estado de la aplicación

### Fencing XML Processing
- **POST** `/api/fencing/process-xml` - Procesa contenido XML
- **POST** `/api/fencing/process-file` - Procesa archivos XML

## 📝 Uso de la API

### Procesar XML Content

```bash
curl -X POST http://localhost:3000/api/fencing/process-xml \
  -H "Content-Type: application/json" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
  }'
```

### Procesar XML File

```bash
curl -X POST http://localhost:3000/api/fencing/process-file \
  -H "Content-Type: application/json" \
  -d '{
    "xmlFile": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
  }'
```

## 🧪 Pruebas

### Ejecutar Script de Prueba

```bash
# Ejecutar el script de prueba
npx ts-node src/fencing/application/examples/test-fencing-xml.ts
```

### Ejemplo de XML de Entrada

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CompetitionIndividuelle Version="3.3" Championnat="TEST" ID="000" Annee="2008/2009" Arme="E" Sexe="M" Domaine="I" Federation="ZZZ" Categorie="S" Date="06.02.2009" TitreCourt="ZZ-293" TitreLong="Evaluation competition">
  <Tireurs>
    <Tireur ID="1" Nom="ABBAZ" Prenom="Jose Luis" DateNaissance="22.06.1978" Sexe="M" Lateralite="I" Nation="ESP" dossard="2001" IdOrigine="2380" Classement="36"/>
    <Tireur ID="2" Nom="ACHARD" Prenom="Norman" DateNaissance="13.08.1983" Sexe="M" Lateralite="I" Nation="GER" dossard="2002" IdOrigine="3440"/>
  </Tireurs>
  <Phases>
    <TourDePoules PhaseID="TourPoules1" ID="1" NbDePoules="1">
      <Tireur REF="1" RangInitial="5" RangFinal="2" Statut="Q" IdOrigine="2380"/>
      <Tireur REF="2" RangInitial="11" RangFinal="1" Statut="Q" IdOrigine="3440"/>
    </TourDePoules>
  </Phases>
</CompetitionIndividuelle>
```

### Ejemplo de Respuesta JSON

```json
{
  "success": true,
  "data": {
    "unitsNumber": 1,
    "code": "FENMEPEE----------------GP01-0001--------",
    "name": "Fencing Competition",
    "description": {
      "eng": {
        "lang": "eng",
        "long": "Fencing Competition",
        "short": ""
      }
    },
    "order": 1,
    "unitTypeCode": "HATH",
    "metadata": {
      "discipline": "FEN",
      "gender": "M",
      "sportEvent": "EPEE",
      "category": "GENERAL",
      "phase": "GP01",
      "unit": "0001",
      "phaseCode": "FENMEPEE----------------GP01-0001--------"
    },
    "dateInfo": {
      "startDate": "2009-02-06T16:00:00.000Z",
      "endDate": "2009-02-06T16:00:00.000Z"
    },
    "location": "FEN",
    "hasMedals": false,
    "medalCodes": [],
    "medalQuantities": 0,
    "venue": "FEN",
    "status": "OFFICIAL"
  },
  "message": "Fencing XML processed successfully"
}
```

## 🏗️ Estructura del Proyecto

```
fencing-project/
├── src/
│   ├── fencing/
│   │   ├── application/
│   │   │   ├── examples/
│   │   │   │   └── test-fencing-xml.ts
│   │   │   ├── mapper/
│   │   │   │   └── fencing-to-unit.mapper.ts
│   │   │   ├── ports/
│   │   │   │   └── fencing.app.service.ts
│   │   │   └── fencing.app.service.ts
│   │   ├── infraestructure/
│   │   │   └── controllers/
│   │   │       └── fencing.controller.ts
│   │   └── fencing.module.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

El proyecto puede configurarse usando variables de entorno:

```bash
# Puerto del servidor (por defecto: 3000)
PORT=3000

# Nivel de logging
LOG_LEVEL=info
```

### Configuración del Parser XML

El parser XML está configurado con las siguientes opciones:

```typescript
const parser = new xml2js.Parser({
  explicitArray: false,    // No crear arrays para elementos únicos
  mergeAttrs: true,        // Fusionar atributos con el objeto
  explicitRoot: false,     // No incluir el elemento raíz
});
```

## 🚨 Manejo de Errores

La aplicación maneja los siguientes tipos de errores:

- **400 Bad Request**: Cuando no se proporciona contenido XML
- **400 Bad Request**: Cuando el XML no es válido
- **500 Internal Server Error**: Cuando hay errores en el procesamiento

## 📊 Logs

La aplicación registra información detallada sobre el procesamiento:

- Datos XML de entrada
- Resultado del procesamiento
- Errores durante el procesamiento

## 🧪 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Compilación
npm run build

# Linting
npm run lint

# Formateo
npm run format

# Pruebas
npm run test
```

### Estructura de Archivos

- `src/` - Código fuente
- `dist/` - Código compilado (generado)
- `node_modules/` - Dependencias (generado)

## 📄 Licencia

Este proyecto es privado y está bajo licencia UNLICENSED.

## 👥 Autor

W2TEC - Fencing XML Processor v1.0.0

