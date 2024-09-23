import initializeVendors from "./initializeVendors";
import { VendorsRegistry } from "./vendorsRegistry";

export * from "./types";

export default function getVendorsRegistry() {
  initializeVendors();

  return VendorsRegistry;
}
