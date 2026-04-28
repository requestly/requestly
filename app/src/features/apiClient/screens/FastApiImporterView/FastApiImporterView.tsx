import { useNavigate } from "react-router-dom";
import { FastApiImporter } from "./components/FastApiImporter/FastApiImporter";
import { redirectToApiClient } from "utils/RedirectionUtils";
import "./fastApiImporterView.scss";

export const FastApiImporterView = () => {
  const navigate = useNavigate();
  return (
    <div className="fastapi-importer-view">
      <div className="fastapi-importer-view_content">
        <FastApiImporter onSuccess={() => redirectToApiClient(navigate)} />
      </div>
    </div>
  );
};
