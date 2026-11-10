# ⚡ LogiCraft Studio

> Aplicación web interactiva de alto rendimiento para el diseño, simulación en tiempo real, validación DRC y exportación de circuitos lógicos digitales.

[![Deploy to GitHub Pages](https://github.com/monstruosaurio/TestAppHechaConIA/actions/workflows/deploy.yml/badge.svg)](https://github.com/monstruosaurio/TestAppHechaConIA/actions/workflows/deploy.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vitejs.dev/)

---

## 🌟 Características Principales

### 🖱️ 1. Editor Visual Drag & Drop
- **Lienzo Infinito**: Navegación fluida con desplazamiento panorámico (pan), zoom con rueda/gestos y rejilla magnética adaptable (grid snapping).
- **Simbología Estandarizada**: Identificadores visuales claros acompañados en pequeño del símbolo lógico/electrónico estándar (ANSI / IEEE e IEC).
- **Auto-posicionamiento Inteligente**: Algoritmo jerárquico (*Sugiyama layout*) que organiza y desenreda automáticamente cualquier plano de circuito con un solo clic.

### ⚡ 2. Motor de Simulación en Tiempo Real
- **Propagación Instantánea**: Simulación de señales binarias (`0`, `1` y alta impedancia `Z`).
- **Relojes y Secuenciales**: Osciladores de reloj configurables (1 Hz a 20 Hz) para circuitos síncronos.
- **Interactividad Directa**: Pulsa interruptores y botones pulsadores para observar cómo reaccionan las compuertas, displays y LEDs en vivo.

### 🛡️ 3. Validación de Reglas de Diseño (DRC - Design Rule Check)
- **Detección de Conflictos Eléctricos**: Alerta visual inmediata en color rojo brillante si dos salidas compiten en el mismo bus o cable (evita cortocircuitos lógicos).
- **Terminales y Cables Desconectados**: Resalta terminales flotantes sin alimentación o entradas no conectadas.
- **Panel de Diagnóstico**: Lista de advertencias y sugerencias con acceso directo a cada componente conflictivo.

### 🧩 4. Amplia Biblioteca de Componentes
- **Entradas**: Interruptor (Switch), Pulsador (Push Button), Generador de Reloj (Clock), VCC (+5V), GND (0V).
- **Compuertas Lógicas**: NOT, AND, OR, NAND, NOR, XOR, XNOR, Búfer Tri-estado.
- **Aritmética y Combinacional**: Semisumador (Half Adder), Sumador Completo (Full Adder), Multiplexor 2:1, Demultiplexor 1:2.
- **Secuenciales**: Flip-Flop D, Flip-Flop JK, Registro de 4 bits, Contador Binario de 4 bits.
- **Visualización y Salidas**: Diodos LED (color configurable), Sonda de Medición (Probe), Display de 7 segmentos y Display Digital HEX de 4 bits.
- **Creador de Circuitos Integrados**: Empaqueta cualquier subcircuito en un nuevo chip reutilizable dentro de la biblioteca.

### 📝 5. Lenguaje Formal Estructurado (DSL)
Todo el circuito se representa de forma bidireccional mediante una base descriptiva formal en texto plano:
```yaml
circuit Calculadora_Aritmetica:
  components:
    sw_a0: SWITCH [x: 100, y: 120, label: "A0", state: 1]
    sw_b0: SWITCH [x: 100, y: 220, label: "B0", state: 1]
    fa_0: FULL_ADDER [x: 350, y: 150]
    hex_disp: DISPLAY_HEX [x: 650, y: 150]
  connections:
    sw_a0.out -> fa_0.a
    sw_b0.out -> fa_0.b
    fa_0.s -> hex_disp.d0
```

### 🤝 6. Control de Versiones y Colaboración
- **Historial de Versiones**: Guarda instantáneas con fecha y hora, nombres personalizados y posibilidad de restaurar versiones anteriores en cualquier momento.
- **Colaboración Multiusuario**: Salas virtuales en tiempo real con control de roles y permisos (Solo Lectura, Editor, Administrador).

### 🖨️ 7. Exportación de Alta Resolución
- **PDF Vectorial**: Planos listos para imprimir o adjuntar en informes técnicos.
- **Imagen PNG de Alta Resolución**: Exportación con escalado nítido para documentación técnica.
- **Importación / Exportación JSON**: Guarda y restaura tus proyectos sin pérdida de datos.

### 🧮 8. Ejemplos Predefinidos
- **Calculadora Aritmética 2-Bit (Suma / Resta)**: Operandos $A$ y $B$ (0 a 3), resta en complemento a dos y display HEX digital.
- **Sumador Completo con Acarreo**.
- **Contador Binario Asíncrono de 4 Bits**.
- **Pestillo SR (SR Latch)** con retroalimentación.

---

## 💻 Requisitos y Pila Tecnológica

- **Frontend**: React 19, TypeScript
- **Empaquetador y Servidor**: Vite 8
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Pruebas**: Node.js Test Runner con `tsx`

---

## 🚀 Inicio Rápido en Local

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/monstruosaurio/TestAppHechaConIA.git
   cd TestAppHechaConIA
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador web.

4. **Ejecuta la suite de pruebas unitarias**:
   ```bash
   npm test
   ```

5. **Compila para producción**:
   ```bash
   npm run build
   ```

---

## 🌐 Publicación en GitHub Pages

Este proyecto utiliza rutas relativas (`base: './'` en `vite.config.ts`) para funcionar tanto en la raíz de un dominio como en subdirectorios de GitHub Pages:

1. Ve a **Settings > Pages** en tu repositorio de GitHub.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Al hacer `git push origin main`, el flujo de trabajo compilará y publicará la web automáticamente.
4. La aplicación estará disponible en:
   ```
   https://<tu-usuario>.github.io/<tu-repositorio>/
   ```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **Apache-2.0**.
