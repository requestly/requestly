import { NetworkEvent, VendorEvent, VendorName } from "./types";
import { Vendor } from "./vendor";

export class VendorsRegistry {
  private static instance: VendorsRegistry;
  private vendors: Vendor[];

  private constructor() {
    this.vendors = [];
  }

  public static getInstance(): VendorsRegistry {
    if (!VendorsRegistry.instance) {
      VendorsRegistry.instance = new VendorsRegistry();
    }
    return VendorsRegistry.instance;
  }

  public addVendor(vendor: Vendor): void {
    this.vendors.push(vendor);
  }

  public getVendorByName(name: string): Vendor | undefined {
    return this.vendors.find((vendor) => vendor.name === name);
  }

  public getVendorByUrl(url: string, method?: string): Vendor | undefined {
    return this.vendors.find((vendor) => vendor.identify(url, method));
  }

  public getVendorEventDetailsByName(name: string, event: NetworkEvent): VendorEvent | null {
    switch (name) {
      case VendorName.BLUECORE: {
        const vendor = this.getVendorByName(name);
        return vendor.getEventDetails(event);
      }
      default: {
        return null;
      }
    }
  }

  getVendorsCount(): number {
    return this.vendors.length;
  }
}
