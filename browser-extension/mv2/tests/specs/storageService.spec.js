describe("Storage Service", function () {
  beforeEach(function () {
    StorageService.getInstance({ cacheRecords: true }, RQ);
    RQ.StorageService.records = [];
  });

  afterEach(function () {
    RQ.StorageService.records = [];
  });

  describe("#getCachedRecordIndex ", function () {
    it("should return index where {key} matches with {id} in cached records", function () {
      RQ.StorageService.records.push({ id: 100, key: "name", value: "sachin" });
      RQ.StorageService.records.push({ id: 200, key: "age", value: 25 });

      expect(RQ.StorageService.getCachedRecordIndex(200)).toBe(1);
    });

    it("should return -1 where {key} does not match with {id} in cached records", function () {
      RQ.StorageService.records.push({ id: 100, key: "name", value: "sachin" });
      RQ.StorageService.records.push({ id: 200, key: "age", value: 25 });

      expect(RQ.StorageService.getCachedRecordIndex(300)).toBe(-1);
    });

    it("should return -1 where there are no cached records", function () {
      expect(RQ.StorageService.getCachedRecordIndex(100)).toBe(-1);
    });
  });

  describe("#updateRecords ", function () {
    it("should add new record when oldValue is undefined", function () {
      // Initially numRecords should be 0
      expect(RQ.StorageService.records.length).toBe(0);

      var changes = {
        REPLACE_100: {
          newValue: { id: "REPLACE_100", ruleType: RQ.RULE_TYPES.REPLACE },
        },
        HEADERS_500: {
          newValue: { id: "HEADERS_500", ruleType: RQ.RULE_TYPES.HEADERS },
        },
      };

      RQ.StorageService.updateRecords(changes, RQ.configs.storageType);
      expect(RQ.StorageService.records.length).toBe(2);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_100")).toBe(0);
      expect(RQ.StorageService.getCachedRecordIndex("HEADERS_500")).toBe(1);
    });

    it("should update existing record when oldValue and newValue are defined", function () {
      // Initially numRecords should be 0
      expect(RQ.StorageService.records.length).toBe(0);

      RQ.StorageService.records.push({
        id: "REPLACE_100",
        ruleType: RQ.RULE_TYPES.REPLACE,
        value: "R1",
      });
      expect(RQ.StorageService.records.length).toBe(1);

      var changes = {
        REPLACE_100: {
          oldValue: { id: 100, ruleType: RQ.RULE_TYPES.REPLACE, value: "R1" },
          newValue: { id: 100, ruleType: RQ.RULE_TYPES.REPLACE, value: "R2" },
        },
      };

      RQ.StorageService.updateRecords(changes, RQ.configs.storageType);
      expect(RQ.StorageService.records[0].value).toBe("R2");
    });

    it("should remove record when newValue is undefined", function () {
      // Initially numRecords should be 0
      expect(RQ.StorageService.records.length).toBe(0);

      RQ.StorageService.records.push({
        id: "REPLACE_100",
        ruleType: RQ.RULE_TYPES.REPLACE,
        value: "R1",
      });
      RQ.StorageService.records.push({
        id: "REPLACE_200",
        ruleType: RQ.RULE_TYPES.REPLACE,
        value: "R2",
      });
      RQ.StorageService.records.push({
        id: "REPLACE_300",
        ruleType: RQ.RULE_TYPES.REPLACE,
        value: "R3",
      });

      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_100")).toBe(0);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_200")).toBe(1);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_300")).toBe(2);

      var changes = {
        REPLACE_100: {
          oldValue: { id: 100, ruleType: RQ.RULE_TYPES.REPLACE, value: "R1" },
        },

        REPLACE_200: {
          oldValue: { id: 200, ruleType: RQ.RULE_TYPES.REPLACE, value: "R2" },
        },
      };

      RQ.StorageService.updateRecords(changes, RQ.configs.storageType);
      expect(RQ.StorageService.records.length).toBe(1);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_100")).toBe(-1);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_200")).toBe(-1);
    });

    it("should not cache record when record does not have primary key", function () {
      // Initially numRecords should be 0
      expect(RQ.StorageService.records.length).toBe(0);

      var changes = {
        REDIRECT_100: {
          newValue: {
            id: "REDIRECT_100",
            ruleType: RQ.RULE_TYPES.REDIRECT,
            value: "R1",
          },
        },

        REPLACE_200: {
          newValue: { id: "REPLACE_200", value: "R2" },
        },
      };

      RQ.StorageService.updateRecords(changes, RQ.configs.storageType);

      expect(RQ.StorageService.records.length).toBe(1);
      expect(RQ.StorageService.getCachedRecordIndex("REDIRECT_100")).toBe(0);
      expect(RQ.StorageService.getCachedRecordIndex("REPLACE_200")).toBe(-1);
    });

    it("should ignore records which do not have primaryKeys", function () {
      // Initially numRecords should be 0
      expect(RQ.StorageService.records.length).toBe(0);

      var changes = {
        A_1: {
          newValue: { a: "1" },
        },
      };

      RQ.StorageService.updateRecords(changes, RQ.configs.storageType);
      expect(RQ.StorageService.records.length).toBe(0);
      expect(RQ.StorageService.getCachedRecordIndex("A_1")).toBe(-1);
    });
  });

  describe("#filterRecordsByType", function () {
    var records;

    beforeEach(function () {
      records = [
        { id: 100, name: "A" },
        { id: 200, name: "B", objectType: RQ.OBJECT_TYPES.RULE },
        { id: 200, name: "C", objectType: RQ.OBJECT_TYPES.GROUP },
      ];
    });

    it("should return all objects if type not passed", function () {
      var filteredRecords = RQ.StorageService.filterRecordsByType(records);
      expect(filteredRecords.length).toBe(3);
    });

    it("should return rule objects if rule type passed", function () {
      var filteredRecords = RQ.StorageService.filterRecordsByType(
        records,
        RQ.OBJECT_TYPES.RULE
      );
      expect(filteredRecords.length).toBe(2);
    });

    it("should return rule objects if group type passed", function () {
      var filteredRecords = RQ.StorageService.filterRecordsByType(
        records,
        RQ.OBJECT_TYPES.GROUP
      );
      expect(filteredRecords.length).toBe(1);
    });
  });
});
