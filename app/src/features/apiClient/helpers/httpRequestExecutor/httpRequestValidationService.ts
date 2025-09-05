import { isValidUrl } from "utils/FormattingHelper";
import { FormDropDownOptions, RequestContentType, RequestMethod, RQAPI } from "../../types";
import { apiClientFileStore } from "../../store/apiClientFilesStore";

export class HttpRequestValidationService {
  validateRequest(entryDetails: RQAPI.HttpApiEntry) {
    /*
        Header is checked if it is unresolved at this step
        Check flags invalid characters & incomplete/undeclared variables
        For Ex: {{RQ_CLIENT_ID}} not defined in environment table & {{RQ_CLIENT_ID} which is invalid expression
    */
    const INVALID_HEADER_CHARACTERS = /[^!#$%&'*+\-.0-9A-Z^_a-z|~]/;
    const invalidHeader = entryDetails?.request?.headers?.find((header) => {
      return INVALID_HEADER_CHARACTERS.test(header.key);
    });

    if (!entryDetails.request.url) {
      throw new Error("Request URL cannot be empty!");
    }

    if (!this.isOnline()) {
      throw new Error("Looks like you are offline. Please check your network connection.");
    }

    if (!this.isMethodSupported(entryDetails.request.method)) {
      throw new Error(`Unsupported request method: ${entryDetails.request.method}`);
    }

    if (!this.isUrlValid(entryDetails.request.url)) {
      throw new Error(`Invalid URL: ${entryDetails.request.url}`);
    }

    if (!this.isUrlProtocolValid(entryDetails.request.url)) {
      throw new Error(`Invalid URL protocol: ${entryDetails.request.url}`);
    }

    if (invalidHeader) {
      throw new Error(`Invalid header key: "${invalidHeader.key}". Header keys must not contain special characters.`);
    }
  }

  isOnline() {
    return window.navigator.onLine === true;
  }

  isMethodSupported(method: string) {
    return Object.keys(RequestMethod).includes(method);
  }

  isUrlValid(url: string) {
    return isValidUrl(url);
  }

  isUrlProtocolValid(url: string) {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async validateMultipartFormBodyFiles(
    entryDetails: RQAPI.HttpApiEntry
  ): Promise<{
    invalidFiles: string[];
  }> {
    if (entryDetails.request.contentType === RequestContentType.MULTIPART_FORM) {
      const fileBodies = (entryDetails.request.body as RQAPI.MultipartFormBody)?.filter(
        (body) => body.type === FormDropDownOptions.FILE && typeof body.value !== "string"
      );

      const validateFile = apiClientFileStore.getState().isFilePresentLocally;

      const invalidFiles: string[] = [];

      for (const body of fileBodies) {
        if (Array.isArray(body.value)) {
          const filesExistenceCheckerResponse = await Promise.all(
            body.value.map(async (file) => ({
              id: file.id,
              exists: await validateFile(file.id),
            }))
          );

          filesExistenceCheckerResponse.forEach(({ id, exists }) => {
            if (!exists) {
              invalidFiles.push(id);
            }
          });
        }
      }

      return { invalidFiles };
    }
    return { invalidFiles: [] };
  }
}
