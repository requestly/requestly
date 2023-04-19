import React, { useCallback, useEffect, useState } from "react";
import { filesByCountry, getCountryName } from "utils/geoUtils";
import { Spin } from "antd";
import { useMediaQuery } from "react-responsive";

const CompanyLogo = ({ appTheme }) => {
  //country of visitor
  const [currentCountry, setCurrentCountry] = useState("");
  //set the no. of images countrywise
  const [logoCount, setLogoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  //setting logoCount
  const setCount = useCallback((country) => {
    if (country === "") setLoading(false);
    //checking if country is included
    else if (filesByCountry[country] !== undefined) {
      setLogoCount(filesByCountry[country]);
      setLoading(false);
    } else if (country !== "" && filesByCountry[country] === undefined) {
      //if country not included show default logos
      setLoading(false);
    }
  }, []);

  const setCountryName = useCallback(async () => {
    const countryName = await getCountryName();
    setCurrentCountry(countryName);
    setCount(countryName);
  }, [setCount]);

  useEffect(() => {
    setCountryName();
  }, [setCountryName]);

  //return logos country wise
  const returnCountryLogos = () => {
    return [...Array(logoCount)].map((_, index) => {
      return (
        <div key={index}>
          <img
            height={100}
            width={100}
            alt=""
            style={{ cursor: "default" }}
            src={`assets/img/countries-customer-brand/${currentCountry}/${appTheme}/customerLogo-${index}.svg`}
            className="bw-color-on-hover"
          />
        </div>
      );
    });
  };

  //returns 10 - (count) logos from default group
  const returnDefaultLogos = () => {
    return [...Array(10 - logoCount)].map((_, index) => {
      return (
        <div key={index}>
          <img
            height={100}
            width={100}
            alt=""
            style={{ cursor: "default" }}
            src={`assets/img/customer-brand/${appTheme}/customerLogo-${index}.svg`}
            className="bw-color-on-hover"
          />
        </div>
      );
    });
  };

  const xl = useMediaQuery({ minWidth: 1224 });
  const md = useMediaQuery({ minWidth: 768 });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: xl ? "repeat(12,auto)" : md ? "repeat(5,auto)" : "repeat(3,auto)",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      {loading ? <Spin indicator /> : [returnCountryLogos(), returnDefaultLogos()]}
    </div>
  );
};

export default CompanyLogo;
