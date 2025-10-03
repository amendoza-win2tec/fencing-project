# 🚀 Instalación del Fencing XML Processor

## 📋 Prerrequisitos

- **Node.js**: v16 o superior
- **npm**: v8 o superior (o yarn/pnpm)
- **Git**: Para clonar el repositorio (opcional)

## 🔧 Instalación Rápida

### 1. Navegar al directorio del proyecto

```bash
cd fencing-project
```

### 2. Instalar dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm (recomendado)
pnpm install
```

### 3. Configurar variables de entorno (opcional)

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables si es necesario
# PORT=3000
# NODE_ENV=development
```

### 4. Compilar el proyecto

```bash
npm run build
```

### 5. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run start:prod
```

## 🚀 Inicio Rápido

### Windows
```bash
# Ejecutar script de inicio automático
start.bat
```

### Linux/Mac
```bash
# Hacer ejecutable y ejecutar
chmod +x start.sh
./start.sh
```

## 🧪 Verificación

### 1. Verificar que la aplicación esté corriendo

```bash
# Health check
curl http://localhost:3000/api/health
```

### 2. Probar el endpoint de fencing

```bash
# Ejecutar script de prueba
npx ts-node src/fencing/application/examples/test-fencing-xml.ts
```

## 📊 Endpoints Disponibles

Una vez que la aplicación esté corriendo, tendrás acceso a:

- **GET** `http://localhost:3000/api/health` - Estado de la aplicación
- **POST** `http://localhost:3000/api/fencing/process-xml` - Procesar XML
- **POST** `http://localhost:3000/api/fencing/process-file` - Procesar archivo XML

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `API_PREFIX` | Prefijo de la API | `api` |
| `CORS_ENABLED` | Habilitar CORS | `true` |

### Configuración del Parser XML

El parser XML está configurado en `src/fencing/infraestructure/controllers/fencing.controller.ts`:

```typescript
const parser = new xml2js.Parser({
  explicitArray: false,    // No crear arrays para elementos únicos
  mergeAttrs: true,        // Fusionar atributos con el objeto
  explicitRoot: false,     // No incluir el elemento raíz
});
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'xml2js'"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"

```bash
# Cambiar puerto
export PORT=3001
npm run start:dev
```

### Error: "TypeScript compilation failed"

```bash
# Limpiar y recompilar
npm run build
```

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start` | Iniciar aplicación |
| `npm run start:dev` | Iniciar en modo desarrollo |
| `npm run start:debug` | Iniciar en modo debug |
| `npm run start:prod` | Iniciar en modo producción |
| `npm run build` | Compilar proyecto |
| `npm run lint` | Ejecutar linter |
| `npm run format` | Formatear código |
| `npm run test` | Ejecutar pruebas |

## 🎯 Próximos Pasos

1. **Probar la API**: Usar los endpoints para procesar XML
2. **Personalizar**: Modificar el mapper según tus necesidades
3. **Desplegar**: Configurar para producción
4. **Monitorear**: Implementar logging y métricas

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Verifica que Node.js esté instalado correctamente
2. Asegúrate de que todas las dependencias se instalen sin errores
3. Revisa los logs de la aplicación para errores específicos
4. Consulta la documentación de NestJS si es necesario

