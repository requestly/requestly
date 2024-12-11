import ThumbPrintIcon from "./assets/auth-empty-state.svg";

export default function NoAuthBanner() {
  return (
    <div className="no-auth-banner">
      <div className="banner-container">
        <img src={ThumbPrintIcon} alt="No auth headers to be shown" />
        <div className="banner-text">
          <div className="title">No authorization type selected for this request.</div>
          <div className="subtitle">Please select a authorization type above.</div>
        </div>
      </div>
    </div>
  );
}
