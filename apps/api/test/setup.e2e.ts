// Refuse accidental use of a default/development/production database.
const uri = process.env['MONGODB_URI'] ?? '';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/gm_structure_[\w-]+$/.test(uri)) {
  throw new Error('Set MONGODB_URI to a disposable local gm_structure_* database');
}
if (!process.env['JWT_SECRET']) throw new Error('Set a test JWT_SECRET');
