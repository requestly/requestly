import { toast } from "utils/Toast.js";
//Action
import { uploadNewFile } from "../../../../../utils/files/FilesService";

export const handleFileInput = (e) => {
  const fileDetails = {};
  const file = e.target.files[0];

  if (file.size > 10 * 1000 * 1000) {
    return toast.warn("File Uploaded Limit Exceeded. Please keep it <10 mb");
  }

  fileDetails.name = file.name;
  fileDetails.description = "";
  fileDetails.contentType = file.type;

  return uploadNewFile(file, fileDetails).then((result) => {
    if (result.success) {
      toast.info("File Uploaded Successfully");
    } else {
      toast.error("File Type not supported");
    }
  });
};
