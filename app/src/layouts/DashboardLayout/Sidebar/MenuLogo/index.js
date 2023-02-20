import React from "react";
import { Link } from "react-router-dom";
import RQLogo from "../../../../assets/images/logo/newRQlogo.svg";
import "./MenuLogo.css";

const MenuLogo = (props) => {
  return (
    <Link to="/" className="menu-logo-link" onClick={props.onClose}>
      <img
        src={RQLogo}
        width="85px"
        height="36px"
        className="logo"
        alt="requestly logo"
      />
    </Link>
  );
};

export default MenuLogo;
