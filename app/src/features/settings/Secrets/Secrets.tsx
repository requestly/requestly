import NoProvidersEmptyState from "./NoProviderEmptyState";

const Secrets = () => {
  const showEmptyMessage = true; // Set this to false when the actual Secrets page is implemented
  return <>{showEmptyMessage ? <NoProvidersEmptyState /> : <h1>Secrets Management Coming Soon!</h1>}</>;
};

export default Secrets;
