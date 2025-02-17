import { createWorkspaceFolder, fsManagerServiceAdapterProvider } from "services/fsManagerServiceAdapter";

class FsManagerService {
  constructor(readonly rootPath: string) {}

  private getAdapter() {
    return fsManagerServiceAdapterProvider.get(this.rootPath);
  }
}

export function getFsManagerService(rootPath: string) {
  return new FsManagerService(rootPath);
}

export function createWorkspaceFolderCommand(path: string) {
	return createWorkspaceFolder(path);
}
