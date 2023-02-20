const LIMIT_REACHED_MODAL = {};

LIMIT_REACHED_MODAL.MODES = {
  CHECK_LIMIT: "check_limit",
  CHECK_IF_ENABLED: "check_if_enabled",
  IMPORT_LIMIT: "import_limit",
};

LIMIT_REACHED_MODAL.REASON = {
  MOCK_SERVER: "mock_limit_reached",
  SHARED_LIST: "sharedList_limit_reached",
  CREATE_RULE: "create_rule_limit_reached",
  ACTIVE_RULE: "active_rule_limit_reached",
  CHARACTER_LIMIT: "rule_character_limit_reached",
  RULE_PAIRS: "rule_pairs_limit_reached",
  IMPORT_RULE: "import_rule_limit_reached",
};

LIMIT_REACHED_MODAL.SOURCE = {
  MOCK_SERVER: "mock_limit_dialog",
  SHARED_LIST: "sharedList_limit_dialog",
  CREATE_RULE: "create_rule_limit_dialog",
  ACTIVE_RULE: "active_rule_limit_dialog",
  CHARACTER_LIMIT: "rule_character_limit_dialog",
  RULE_PAIRS: "rule_pairs_limit_dialog",
  IMPORT_RULE: "import_rule_limit_dialog",
};

export default LIMIT_REACHED_MODAL;
