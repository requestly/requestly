import { VendorsRegistry } from "./vendorsRegistry";
import { BlueCore } from "./vendors/BlueCore";

function addVendors() {
  const registry = VendorsRegistry.getInstance();
  registry.addVendor(new BlueCore());
}

export default function initializeVendors() {
  const registry = VendorsRegistry.getInstance();

  if (registry.getVendorsCount() === 0) {
    addVendors();
  }
}
