export const SHOP_KEY = 'shoppulse.shop_hex_code';

export function readShopCode() {
  try {
    return localStorage.getItem(SHOP_KEY) || '';
  } catch {
    return '';
  }
}

export function saveShopCode(code) {
  try {
    localStorage.setItem(SHOP_KEY, code);
  } catch {
    /* storage can be blocked; the terminal still unlocks for this page load */
  }
}

export function clearShopCode() {
  try {
    localStorage.removeItem(SHOP_KEY);
  } catch {
    /* ignore */
  }
}
