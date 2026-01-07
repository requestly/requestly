import type { RunConfigEntity as RunConfigRecord } from "../../runConfig/types";
import { EntityNotFound } from "../../types";
import { bufferAdapterSelectors, bufferActions } from "../../buffer/slice";
import type { ApiClientRootState } from "../../hooks/types";
import { RunConfigEntity } from "../runConfig";
import { parseRunnerConfigBufferReference } from "../../runConfig/types";
import type { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";
import type { EntityDispatch } from "../types";

/**
 * Buffered entity class for RunConfig.
 * Works with the buffer system for unsaved changes.
 */
export class BufferedRunConfigEntity
  extends RunConfigEntity<BufferedApiClientEntityMeta>
  implements BufferedApiClientEntity
{
  // Origin entity pointing to the actual stored RunConfig
  origin: RunConfigEntity;

  constructor(public readonly dispatch: EntityDispatch, public readonly meta: BufferedApiClientEntityMeta) {
    super(dispatch, meta);

    // Parse referenceId to get actual RunConfig composite key
    const { collectionId, configId } = parseRunnerConfigBufferReference(meta.referenceId);
    const actualId = `${collectionId}::${configId}`;

    this.origin = new RunConfigEntity(dispatch, { id: actualId });
  }

  getEntityFromState(state: ApiClientRootState): RunConfigRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }
    return entry.current as RunConfigRecord;
  }

  dispatchUnsafePatch(patcher: (config: RunConfigRecord) => void): void {
    this.dispatch(
      bufferActions.unsafePatch({
        id: this.meta.id,
        patcher: (entry) => {
          patcher(entry.current as RunConfigRecord);
        },
      })
    );
  }

  setRunOrder(runOrder: RunConfigRecord["runOrder"]): void {
    this.unsafePatch((config) => {
      config.runOrder = runOrder;
    });
  }

   setDelay(delay: number): void {
    this.unsafePatch((config) => {
      config.delay = delay;
    });
  }

  setIterations(iterations: number): void {
    this.unsafePatch((config) => {
      config.iterations = iterations;
    });
  }

  setDataFile(dataFile: RunConfigRecord["dataFile"]): void {
    this.unsafePatch((config) => {
      config.dataFile = dataFile;
    });
  }

  toggleRequestSelection(requestId: string): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) =>
        item.id === requestId ? { ...item, isSelected: !item.isSelected } : item
      );
    });
  }

  setRequestSelection(requestId: string, isSelected: boolean): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) => (item.id === requestId ? { ...item, isSelected } : item));
    });
  }

  toggleAllSelections(isSelected: boolean): void {
    this.unsafePatch((config) => {
      config.runOrder = config.runOrder.map((item) => ({
        ...item,
        isSelected,
      }));
    });
  }
}
