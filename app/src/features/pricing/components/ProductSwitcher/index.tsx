import { PRICING } from "features/pricing/constants/pricing";
import { PRODUCT_FEATURES } from "features/pricing/constants/productFeatures";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { redirectToProductSpecificPricing } from "utils/RedirectionUtils";
import "./productSwitcher.scss";

interface Props {
  activeProduct: string;
  setActiveProduct: (arg: string) => void;
  isOpenedFromModal?: boolean;
}

const ProductSwitcher: React.FC<Props> = ({ activeProduct, setActiveProduct, isOpenedFromModal = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productFromQuery = searchParams.get("product") ?? null;

  const productChangeHandler = (value: string) => {
    if (!isOpenedFromModal) redirectToProductSpecificPricing(navigate, value);
    setActiveProduct(value);
  };

  useEffect(() => {
    if (
      [PRICING.PRODUCTS.API_CLIENT, PRICING.PRODUCTS.HTTP_RULES, PRICING.PRODUCTS.SESSION_REPLAY].includes(
        productFromQuery
      )
    ) {
      setActiveProduct(productFromQuery);
    }
  }, [productFromQuery]);

  return (
    <div className={`product-switcher ${isOpenedFromModal ? "in-modal" : ""}`}>
      {PRODUCT_FEATURES.map((product) => {
        const isActive = product.key === activeProduct;
        return (
          <div
            className={`product-details ${isActive ? "active" : ""}`}
            key={product.key}
            onClick={() => productChangeHandler(product.key)}
          >
            <div className="product-text">
              <p>{product.title}</p>
              {!isOpenedFromModal && <span className="description">{product.description}</span>}
            </div>
            <img src={isActive ? product.activeIcon : product.icon} alt={product.title} />
          </div>
        );
      })}
    </div>
  );
};

export default ProductSwitcher;
