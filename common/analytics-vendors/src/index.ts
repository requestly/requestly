import initializeVendors from "./initializeVendors";
import { VendorsRegistry } from "./vendorsRegistry";

export default function getVendorsRegistry() {
  initializeVendors();

  return VendorsRegistry;
}
