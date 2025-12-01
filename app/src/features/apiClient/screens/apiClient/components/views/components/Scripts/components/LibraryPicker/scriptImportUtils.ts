import { parse, Node } from "acorn";
import { simple } from "acorn-walk";
import * as Sentry from "@sentry/react";
import { camelCase } from "lodash";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";

interface RequireInfo {
  variableName: string;
  packageId: string;
  start: number;
  end: number;
}

interface ScriptAnalysis {
  existingRequires: RequireInfo[];
  lastRequireEnd: number;
  hasRequires: boolean;
}

export function analyzeScriptImports(code: string): ScriptAnalysis {
  const existingRequires: RequireInfo[] = [];

  try {
    const ast = parse(code, { ecmaVersion: 2020, sourceType: "script", locations: true });

    simple(ast, {
      VariableDeclaration(node: Node & { declarations?: any[]; start: number; end: number }) {
        if (!node.declarations) return;

        for (const declarator of node.declarations) {
          if (
            declarator.init?.type === "CallExpression" &&
            declarator.init.callee?.type === "Identifier" &&
            declarator.init.callee.name === "require" &&
            declarator.init.arguments?.length === 1 &&
            declarator.init.arguments[0]?.type === "Literal"
          ) {
            const variableName = getVariableNames(declarator.id);
            const packageId = declarator.init.arguments[0].value as string;

            existingRequires.push({
              variableName,
              packageId,
              start: node.start,
              end: node.end,
            });
          }
        }
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "script_import_utils" },
      extra: { codeLength: code.length },
    });
    console.warn("Failed to parse script for import analysis:", error);
  }

  existingRequires.sort((a, b) => a.start - b.start);

  const lastRequireEnd = existingRequires.length > 0 ? existingRequires[existingRequires.length - 1].end : 0;

  return {
    existingRequires,
    lastRequireEnd,
    hasRequires: existingRequires.length > 0,
  };
}

function getVariableNames(id: any): string {
  if (id.type === "Identifier") {
    return id.name;
  }
  if (id.type === "ObjectPattern") {
    return id.properties.map((prop: any) => prop.value?.name || prop.key?.name).join(", ");
  }
  if (id.type === "ArrayPattern") {
    return id.elements
      .map((el: any) => el?.name || "")
      .filter(Boolean)
      .join(", ");
  }
  return "unknown";
}

export function isPackageImported(code: string, packageId: string): boolean {
  const analysis = analyzeScriptImports(code);
  return analysis.existingRequires.some((req) => req.packageId === packageId);
}

export function generateRequireStatement(
  packageId: string,
  variableName: string,
  style: "default" | "named" | "namespace" = "default"
): string {
  switch (style) {
    case "named":
      return `const { ${variableName} } = require("${packageId}");`;
    case "namespace":
      return `const ${variableName} = require("${packageId}");`;
    case "default":
    default:
      return `const ${variableName} = require("${packageId}");`;
  }
}

export function getDefaultVariableName(packageId: string, pkg?: ExternalPackage): string {
  if (pkg?.defaultVariableName) {
    return pkg.defaultVariableName;
  }

  const packageName = packageId.includes("/") ? packageId.split("/").pop()! : packageId;
  return camelCase(packageName);
}

export function getImportedPackageCount(code: string): number {
  const analysis = analyzeScriptImports(code);
  return analysis.existingRequires.length;
}
