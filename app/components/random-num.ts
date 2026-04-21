export const randomAngka = Math.floor(Math.random() * 100) + 1;
export const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
export function generateRandomString(length = 15) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}