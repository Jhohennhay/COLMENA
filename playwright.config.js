// Pruebas de navegador: abren dist/colmena.html (npm test lo construye antes).
import { defineConfig, devices } from '@playwright/test';
// En Windows (el equipo del dueño tiene una Intel UHD 620) se dibuja con la tarjeta gráfica: unas 20 veces más rápido.
// En GitHub no hay tarjeta y se dibuja por software. COLMENA_GPU=0 fuerza el dibujo por software también aquí.
const GPU = !process.env.CI && process.platform === 'win32' && process.env.COLMENA_GPU !== '0';
const gl = {
  launchOptions: {
    args: GPU ? ['--use-angle=d3d11', '--enable-gpu', '--enable-webgl', '--ignore-gpu-blocklist'] : ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  },
};
export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  workers: 1, // dibujando por software el paralelo va más lento y hace fallar pruebas por tiempo
  retries: process.env.CI ? 1 : 0, // en GitHub, un segundo intento antes de dar una prueba por rota
  reporter: [['list']],
  use: { locale: 'es-ES', ...gl },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1100, height: 700 }, ...gl } },
    { name: 'movil', use: { ...devices['Pixel 7'], ...gl } },
  ],
});
