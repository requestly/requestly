const assert = require("node:assert/strict");

const {
  addExcludedErroredRecordId,
  excludeErroredRecordById,
  getVisibleErroredRecords,
} = require("./erroredRecords.utils");

const records = [
  { id: "request-1", name: "request.json", path: "/workspace/request.json" },
  { id: "request-2", name: "broken.txt", path: "/workspace/broken.txt" },
];

assert.deepEqual(excludeErroredRecordById(records, "request-2"), [records[0]]);
assert.deepEqual(excludeErroredRecordById(records, "missing-id"), records);
assert.notEqual(excludeErroredRecordById(records, "request-2"), records);

assert.deepEqual(addExcludedErroredRecordId([], "request-2"), ["request-2"]);
assert.deepEqual(addExcludedErroredRecordId(["request-2"], "request-2"), ["request-2"]);
assert.deepEqual(getVisibleErroredRecords(records, ["request-2"]), [records[0]]);
assert.deepEqual(getVisibleErroredRecords(records, []), records);

console.log("erroredRecords utils tests passed");
