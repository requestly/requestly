import { isRule } from "features/rules";
import pako from "pako";
import { RuleType } from "types";

function decompressString(compressedString) {
  const compressed = Buffer.from(compressedString, "base64");
  const uncompressed = pako.inflate(compressed, { to: "string" });
  return uncompressed;
}

function compressString(uncompressedString) {
  const compressed = pako.deflate(uncompressedString, { to: "string" });
  const base64Compressed = Buffer.from(compressed).toString("base64");
  return base64Compressed;
}

function decompressRecord(record) {
  const decompressedRecord = { ...record };
  if (isRule(record)) {
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
    switch (record.ruleType) {
      case RuleType.RESPONSE:
        record.pairs.forEach((pair, idx) => {
          const compressedVal = compressString(pair?.response?.value ?? "");
          compressedRecord.pairs[idx].response.value = compressedVal;
          compressedRecord.pairs[idx].isCompressed = true;
        });
        break;

      case RuleType.REQUEST:
        record.pairs.forEach((pair, idx) => {
          const compressedVal = compressString(pair?.request?.value ?? "");
          compressedRecord.pairs[idx].request.value = compressedVal;
          compressedRecord.pairs[idx].isCompressed = true;
        });
        break;

      case RuleType.SCRIPT:
        record.pairs.forEach((pair, idx) => {
          pair.scripts.forEach((script, sidx) => {
            if (script.type === "code") {
              compressedRecord.pairs[idx].scripts[sidx].value = compressString(script?.value ?? "");
              compressedRecord.pairs[idx].scripts[sidx].isCompressed = true;
            }
          });
        });
        break;
      default:
        break;
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
