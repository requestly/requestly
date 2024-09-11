import { Vendor } from "../vendor";
import blueCoreIcon from "../../icons/bluecore-icon.svg";

export class BlueCore implements Vendor {
  name: string = "BlueCore";
  icon: string = blueCoreIcon;

  urlPatterns: string[] = ["api.bluecore.com/api/track", "onsitestats.bluecore.com/events"];

  identify(url: string, method: string): boolean {
    return this.urlPatterns.some((pattern) => url.includes(pattern));
  }
}
