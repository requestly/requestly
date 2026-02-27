import NoProvidersIcon from "assets/icons/no-providers.svg?react";
import { RQButton } from "lib/design-system-v2/components";
import "./index.scss";
const NoProvidersEmptyState = () => {
  return (
    <section className="no-provider-empty-state-container">
      <NoProvidersIcon />
      <div className="no-provider-text-container">
        <p className="title-text">No providers connected yet</p>
        <p className="description-text">
          Add provider to securely fetch your secrets and use them in API requests. Secrets are never synced to
          Requestly Cloud.
        </p>
      </div>
      <RQButton type="primary" onClick={() => alert("Add provider functionality coming soon!")}>
        Add provider
      </RQButton>
    </section>
  );
};

export default NoProvidersEmptyState;
