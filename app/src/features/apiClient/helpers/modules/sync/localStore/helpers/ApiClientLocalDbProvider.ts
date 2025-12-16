import { ApiClientLocalStoreMeta } from "../../interfaces";
import { ApiClientLocalDb } from "./ApiClientLocalDb";

class ApiClientLocalDbProvider {
  private cache: ApiClientLocalDb | null = null;

  get(metadata: ApiClientLocalStoreMeta) {
    if (!this.cache) {
      this.cache = new ApiClientLocalDb(metadata);
    }
    return this.cache as ApiClientLocalDb;
  }
}

const dbProvider = new ApiClientLocalDbProvider();
export default dbProvider;
