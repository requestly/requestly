import { RuleType } from "@requestly/shared/types/entities/rules";
import { isRule } from "features/rules";
import pako from "pako";

function decompressString(compressedString) {
  try {
    const compressed = Buffer.from(compressedString, "base64");
    const uncompressed = pako.inflate(compressed, { to: "string" });
    return uncompressed;
  } catch (error) {
    console.log("[DEBUG] Error decompressing string", error, compressedString);
    throw error;
  }
}

function compressString(uncompressedString) {
  try {
    const compressed = pako.deflate(uncompressedString);
    const base64Compressed = Buffer.from(compressed).toString("base64");
    return base64Compressed;
  } catch (error) {
    console.log("[DEBUG] Error compressing string", error, uncompressedString);
    throw error;
  }
}

function decompressRecord(record) {
  const decompressedRecord = { ...record };
  if (isRule(record)) {
    try {
      switch (record.ruleType) {
        case RuleType.RESPONSE:
          record.pairs.forEach((pair, idx) => {
            if (pair.isCompressed) {
              const decompressedVal = decompressString(pair?.response?.value ?? "");
              decompressedRecord.pairs[idx].response.value = decompressedVal;
              decompressedRecord.pairs[idx].isCompressed = false;
            }
          });
          break;

        case RuleType.REQUEST:
          record.pairs.forEach((pair, idx) => {
            if (pair.isCompressed) {
              const decompressedVal = decompressString(pair?.request?.value ?? "");
              decompressedRecord.pairs[idx].request.value = decompressedVal;
              decompressedRecord.pairs[idx].isCompressed = false;
            }
          });
          break;

        case RuleType.SCRIPT:
          record.pairs.forEach((pair, idx) => {
            pair.scripts.forEach((script, sidx) => {
              if (script.type === "code" && script.isCompressed) {
                const ScriptValue = script?.value;
                const decompressedVal = decompressString(ScriptValue ?? "");
                decompressedRecord.pairs[idx].scripts[sidx].value = decompressedVal;
                decompressedRecord.pairs[idx].scripts[sidx].isCompressed = false;
              }
            });
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("[DEBUG] Error decompressing record", error, record);
      return record;
    }
  }
  return decompressedRecord;
}

export function decompressRecords(recordsMap) {
  const decompressedRecordsMap = {};
  for (const recordId in recordsMap) {
    decompressedRecordsMap[recordId] = decompressRecord(recordsMap[recordId]);
  }
  return decompressedRecordsMap;
}

function compressRecord(record) {
  const compressedRecord = { ...record };
  if (isRule(record)) {
    try {
      switch (record.ruleType) {
        case RuleType.RESPONSE:
          record.pairs.forEach((pair, idx) => {
            if (compressedRecord.pairs[idx].isCompressed) return;
            const compressedVal = compressString(pair?.response?.value ?? "");
            compressedRecord.pairs[idx].response.value = compressedVal;
            compressedRecord.pairs[idx].isCompressed = true;
          });
          break;

        case RuleType.REQUEST:
          record.pairs.forEach((pair, idx) => {
            if (compressedRecord.pairs[idx].isCompressed) return;
            const compressedVal = compressString(pair?.request?.value ?? "");
            compressedRecord.pairs[idx].request.value = compressedVal;
            compressedRecord.pairs[idx].isCompressed = true;
          });
          break;

        case RuleType.SCRIPT:
          record.pairs.forEach((pair, idx) => {
            pair.scripts.forEach((script, sidx) => {
              if (script.type === "code" && !script.isCompressed) {
                compressedRecord.pairs[idx].scripts[sidx].value = compressString(script?.value ?? "");
                compressedRecord.pairs[idx].scripts[sidx].isCompressed = true;
              }
            });
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("[DEBUG] Error compressing record", error, record);
      return record;
    }
  }
  return compressedRecord;
}

export function compressRecords(recordsMap) {
  const compressedRecordsMap = {};
  for (const recordId in recordsMap) {
    compressedRecordsMap[recordId] = compressRecord(recordsMap[recordId]);
  }
  return compressedRecordsMap;
}
