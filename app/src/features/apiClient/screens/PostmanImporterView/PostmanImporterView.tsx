import { useNavigate } from "react-router-dom";
import { PostmanImporter } from "./components/PostmanImporter/PostmanImporter";
import { redirectToApiClient } from "utils/RedirectionUtils";
import "./postmanImporterView.scss";

export const PostmanImporterView = () => {
  const navigate = useNavigate();
  return (
    <div className="postman-importer-view">
      <div className="postman-importer-view_content">
        <PostmanImporter onSuccess={() => redirectToApiClient(navigate)} />
      </div>
    </div>
  );
};
