import { BaseTabSource } from 'componentsV2/Tabs/helpers/baseTabSource';
import PATHS from 'config/constants/sub/paths';
import { MdOutlineSpaceDashboard } from '@react-icons/all-files/md/MdOutlineSpaceDashboard';
import { getApiClientFeatureContext } from 'features/apiClient/slices';
import { RUNTIME_VARIABLES_ENTITY_ID } from 'features/apiClient/slices/common/constants';
import RuntimeVariablesView from '../containers/RuntimeVariablesView';

export class RuntimeVariablesViewTabSource extends BaseTabSource {
  constructor(metadata) {
    super();
    this.component = <RuntimeVariablesView />;
    this.metadata = {
      ...metadata,
      id: RUNTIME_VARIABLES_ENTITY_ID,
      name: 'runtime-new',
      title: 'Runtime Variables'
    };
    this.urlPath = `${PATHS.API_CLIENT.VARIABLES.ABSOLUTE}/${this.metadata.name}`;
    this.icon = <MdOutlineSpaceDashboard />;
  }

  static create(matchedPath) {
    const context = getApiClientFeatureContext();
    return new RuntimeVariablesViewTabSource({
      id: RUNTIME_VARIABLES_ENTITY_ID,
      title: 'Runtime Variables',
      context: { id: context.workspaceId }
    });
  }
}
