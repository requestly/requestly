import React from "react";

const Jumbotron = (props) => (
  <div className="text-center jumbotron" style={{ background: "transparent" }}>
    {props.children}
  </div>
);

export default Jumbotron;
