import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt } from "../helpers";

/**
 * System, file, and directory variables:
 * $randomSemver, $randomFileName, $randomFileType, $randomFileExt,
 * $randomCommonFileName, $randomCommonFileType, $randomCommonFileExt,
 * $randomFilePath, $randomDirectoryPath, $randomMimeType
 */
export const createFileVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$randomSemver", "A random semantic version number", "3.12.4", () => faker.system.semver()),
  createDynamicVariable(
    "$randomFileName",
    "A random file name (includes uncommon extensions)",
    "report_2024.pdf",
    (...args: unknown[]) => {
      if (!args[0]) return faker.system.fileName();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const extensionCount = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      return faker.system.fileName({ extensionCount });
    }
  ),
  createDynamicVariable("$randomFileType", "A random file type (includes uncommon file types)", "video", () =>
    faker.system.fileType()
  ),
  createDynamicVariable(
    "$randomFileExt",
    "A random file extension (includes uncommon extensions)",
    "csv",
    (...args: unknown[]) => {
      const mimeType = args[0] ? String(args[0]) : undefined;
      return faker.system.fileExt(mimeType);
    }
  ),
  createDynamicVariable("$randomCommonFileName", "A random file name", "presentation.pptx", () =>
    faker.system.commonFileName()
  ),
  createDynamicVariable("$randomCommonFileType", "A random, common file type", "image", () =>
    faker.system.commonFileType()
  ),
  createDynamicVariable("$randomCommonFileExt", "A random, common file extension", "jpg", () =>
    faker.system.commonFileExt()
  ),
  createDynamicVariable("$randomFilePath", "A random file path", "/var/www/html/index.html", () =>
    faker.system.filePath()
  ),
  createDynamicVariable("$randomDirectoryPath", "A random directory path", "/opt/apps", () =>
    faker.system.directoryPath()
  ),
  createDynamicVariable("$randomMimeType", "A random MIME type", "image/jpeg", () => faker.system.mimeType()),
];
