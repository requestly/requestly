const STYLES = {};

STYLES.reactSelectCustomStyles = {
  option: (provided, state) => ({
    ...provided,
    border: "none",
  }),
  control: (provided) => ({
    ...provided,
    border: "0",
    marginTop: "3%",
    boxShadow: "0 1px 3px rgb(50 50 93 / 15%), 0 1px 0 rgb(0 0 0 / 2%)",
    fontSize: "0.875rem",
  }),
};

export default STYLES;
