const excludeErroredRecordById = (records, recordId) => {
  return records.filter((record) => record.id !== recordId);
};

const addExcludedErroredRecordId = (recordIds, recordId) => {
  return recordIds.includes(recordId) ? recordIds : [...recordIds, recordId];
};

const getVisibleErroredRecords = (records, excludedRecordIds) => {
  return records.filter((record) => !excludedRecordIds.includes(record.id));
};

module.exports = {
  addExcludedErroredRecordId,
  excludeErroredRecordById,
  getVisibleErroredRecords,
};
