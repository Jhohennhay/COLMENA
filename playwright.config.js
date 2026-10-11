// Pruebas de navegador: abren dist/colmena.html (npm test lo construye antes).
import { defineConfig, devices } from '@playwright/test';
const gl = { launchOptions: { args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] } };
export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  workers: process.env.CI ? 2 : 1, // en este equipo (sin tarjeta gráfica) el paralelo va más lento, no más rápido
  reporter: [['list']],
  use: { locale: 'es-ES', ...gl },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1100, height: 700 }, ...gl } },
    { name: 'movil', use: { ...devices['Pixel 7'], ...gl } },
  ],
});
