/**
 * ============================================================

 *
 * Konsep penting:
 * - Configuration
 * - REST API
 * - Feature Flag
 */

// Ganti setelah Apps Script di-deploy sebagai Web App.

export const API_URL =
  'https://script.google.com/macros/s/AKfycbxpCNo28xgY9S9VPzWdrLREXpt9RtgHAgr56RjrW13zOoe0M9v7pkptDrEA7Qyrh1HpAA/exec';
// true = gunakan data awal dan tidak memanggil Apps Script.
// Ubah menjadi false setelah URL Web App sudah dapat mengembalikan JSON.
export const USE_DEMO_DATA = false;
