import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;
export const PORT = 8080;
export const PRODUCTS_JSON = "db/products.json";
