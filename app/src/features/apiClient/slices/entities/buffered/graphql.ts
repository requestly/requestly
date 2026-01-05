import { RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, EntityNotFound, UpdateCommand } from "../../types";
import { bufferActions, bufferAdapterSelectors } from "../../buffer/slice";
import { ApiClientRootState } from "../../hooks/types";
import { GraphQLRecordEntity } from "../graphql";
import { BufferedApiClientEntity, BufferedApiClientEntityMeta } from "./factory";

export class BufferedGraphQLRecordEntity extends GraphQLRecordEntity<BufferedApiClientEntityMeta> implements BufferedApiClientEntity {
  origin = new GraphQLRecordEntity(this.dispatch, { id: this.meta.referenceId });
  override dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(bufferActions.applyPatch({ id: this.meta.id, command }));
  }

  override getEntityFromState(state: ApiClientRootState): RQAPI.GraphQLApiRecord {
    const entry = bufferAdapterSelectors.selectById(state.buffer, this.meta.id);
    if (!entry) {
      throw new EntityNotFound(this.id, this.type);
    }

    const record = entry.current as RQAPI.ApiClientRecord;
    if (record.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record.type,
      });
    }
    if (record.data?.type !== RQAPI.ApiEntryType.GRAPHQL) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.GRAPHQL,
        foundType: record.data?.type,
      });
    }

    return record as RQAPI.GraphQLApiRecord;
  }
}
