import React, { useEffect } from "react";
import { RULE_DETAILS } from "./constants";
import { RuleType } from "types";
import { Button } from "antd";
import { MdMenuBook } from "@react-icons/all-files/md/MdMenuBook";
import { MdOutlineFactCheck } from "@react-icons/all-files/md/MdOutlineFactCheck";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useDispatch } from "react-redux";
import { actions } from "store";
import { trackRuleDetailsPanelClosed, trackRuleDetailsPanelViewed } from "modules/analytics/events/common/rules";
import "./RuleDetailsPanel.scss";

interface RuleDetailsPanelProps {
  ruleType: RuleType | undefined;
  source: "docs_sidebar" | "new_rule_editor";
}

export const RuleDetailsPanel: React.FC<RuleDetailsPanelProps> = ({ ruleType, source }) => {
  const dispatch = useDispatch();

  const handleCloseClick = () => {
    trackRuleDetailsPanelClosed(ruleType, source);
    dispatch(actions.closeCurrentlySelectedRuleDetailsPanel());
  };

  useEffect(() => {
    if (ruleType && source) {
      trackRuleDetailsPanelViewed(ruleType, source);
    }
  }, [ruleType, source]);

  return !ruleType ? null : (
    <div key={ruleType} className="rule-details-panel-container">
      <span className="close-btn" onClick={handleCloseClick}>
        <MdClose className="anticon" />
      </span>

      <div className="details-panel">
        <div className="rule-details-container">
          <div className="title">{RULE_DETAILS[ruleType].name}</div>
          <div className="description">
            {RULE_DETAILS[ruleType].description} Redirect scripts, APIs, Stylesheets, or any other resource from one
            environment to another. Use Modify API Response rule to debug & modify API responses on the fly.
          </div>

          <div className="use-cases-container">
            <div className="title">Use cases</div>

            <ul className="use-cases-list">
              {RULE_DETAILS[ruleType].useCases?.length > 0 &&
                RULE_DETAILS[ruleType].useCases?.map(({ useCase, suggestedTemplateLink }, index) => {
                  return (
                    <li key={index} className="use-case-list-item">
                      <div className="use-case">
                        {useCase}
                        <br />
                        {suggestedTemplateLink ? (
                          <Button
                            type="link"
                            className="link use-template-btn"
                            icon={<MdOutlineFactCheck className="anticon" />}
                          >
                            Use template
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        <div className="rule-templates">
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path
                d="M6.61467 0.5C5.0331 0.5 3.51631 1.12827 2.39798 2.24661C1.27964 3.36495 0.651367 4.88174 0.651367 6.4633V27.5642C0.651367 29.1458 1.27964 30.6626 2.39798 31.7809C3.51631 32.8993 5.0331 33.5275 6.61467 33.5275H17.2055C16.6561 32.6694 16.2189 31.7445 15.9046 30.7752H6.61467C5.76306 30.7752 4.94633 30.4369 4.34414 29.8348C3.74196 29.2326 3.40366 28.4158 3.40366 27.5642V6.4633C3.40366 4.69083 4.84219 3.25229 6.61467 3.25229H27.7156C29.4881 3.25229 30.9266 4.69083 30.9266 6.4633V15.7532C31.8958 16.0675 32.8208 16.5047 33.6789 17.0541V6.4633C33.6789 4.88174 33.0506 3.36495 31.9323 2.24661C30.814 1.12827 29.2972 0.5 27.7156 0.5H6.61467ZM27.2569 15.1789C27.5346 15.1789 27.811 15.1881 28.0862 15.2064C28.1649 14.9981 28.1919 14.7738 28.1648 14.5527C28.1377 14.3317 28.0574 14.1205 27.9307 13.9374C27.804 13.7542 27.6348 13.6046 27.4375 13.5012C27.2403 13.3979 27.0209 13.3439 26.7982 13.344H18.5413C18.1763 13.344 17.8263 13.489 17.5682 13.7471C17.3101 14.0052 17.1651 14.3552 17.1651 14.7202C17.1651 15.0852 17.3101 15.4352 17.5682 15.6933C17.8263 15.9513 18.1763 16.0963 18.5413 16.0963H22.6624C24.1182 15.4898 25.6798 15.1779 27.2569 15.1789ZM7.5321 6.00459C7.16713 6.00459 6.8171 6.14958 6.55902 6.40765C6.30094 6.66573 6.15596 7.01576 6.15596 7.38074C6.15596 7.74571 6.30094 8.09574 6.55902 8.35382C6.8171 8.6119 7.16713 8.75688 7.5321 8.75688H26.7982C27.1631 8.75688 27.5132 8.6119 27.7712 8.35382C28.0293 8.09574 28.1743 7.74571 28.1743 7.38074C28.1743 7.01576 28.0293 6.66573 27.7712 6.40765C27.5132 6.14958 27.1631 6.00459 26.7982 6.00459H7.5321ZM6.15596 14.7202C6.15596 14.178 6.26274 13.6412 6.47021 13.1403C6.67769 12.6394 6.98179 12.1843 7.36515 11.8009C7.74851 11.4176 8.20363 11.1135 8.70451 10.906C9.2054 10.6985 9.74224 10.5917 10.2844 10.5917C10.8266 10.5917 11.3634 10.6985 11.8643 10.906C12.3652 11.1135 12.8203 11.4176 13.2036 11.8009C13.587 12.1843 13.8911 12.6394 14.0986 13.1403C14.3061 13.6412 14.4128 14.178 14.4128 14.7202C14.4128 15.8151 13.9779 16.8652 13.2036 17.6394C12.4294 18.4137 11.3793 18.8486 10.2844 18.8486C9.18947 18.8486 8.13938 18.4137 7.36515 17.6394C6.59092 16.8652 6.15596 15.8151 6.15596 14.7202ZM10.2844 13.344C9.91942 13.344 9.56939 13.489 9.31131 13.7471C9.05324 14.0052 8.90825 14.3552 8.90825 14.7202C8.90825 15.0852 9.05324 15.4352 9.31131 15.6933C9.56939 15.9513 9.91942 16.0963 10.2844 16.0963C10.6494 16.0963 10.9994 15.9513 11.2575 15.6933C11.5156 15.4352 11.6605 15.0852 11.6605 14.7202C11.6605 14.3552 11.5156 14.0052 11.2575 13.7471C10.9994 13.489 10.6494 13.344 10.2844 13.344ZM10.2844 20.6835C9.18947 20.6835 8.13938 21.1185 7.36515 21.8927C6.59092 22.6669 6.15596 23.717 6.15596 24.8119C6.15596 25.9069 6.59092 26.9569 7.36515 27.7312C8.13938 28.5054 9.18947 28.9404 10.2844 28.9404C11.3793 28.9404 12.4294 28.5054 13.2036 27.7312C13.9779 26.9569 14.4128 25.9069 14.4128 24.8119C14.4128 23.717 13.9779 22.6669 13.2036 21.8927C12.4294 21.1185 11.3793 20.6835 10.2844 20.6835ZM8.90825 24.8119C8.90825 24.447 9.05324 24.0969 9.31131 23.8389C9.56939 23.5808 9.91942 23.4358 10.2844 23.4358C10.6494 23.4358 10.9994 23.5808 11.2575 23.8389C11.5156 24.0969 11.6605 24.447 11.6605 24.8119C11.6605 25.1769 11.5156 25.5269 11.2575 25.785C10.9994 26.0431 10.6494 26.1881 10.2844 26.1881C9.91942 26.1881 9.56939 26.0431 9.31131 25.785C9.05324 25.5269 8.90825 25.1769 8.90825 24.8119ZM37.3486 27.1055C37.3486 24.429 36.2854 21.8621 34.3928 19.9696C32.5003 18.077 29.9334 17.0138 27.2569 17.0138C24.5804 17.0138 22.0135 18.077 20.1209 19.9696C18.2284 21.8621 17.1651 24.429 17.1651 27.1055C17.1651 29.782 18.2284 32.3489 20.1209 34.2415C22.0135 36.134 24.5804 37.1973 27.2569 37.1973C29.9334 37.1973 32.5003 36.134 34.3928 34.2415C36.2854 32.3489 37.3486 29.782 37.3486 27.1055ZM28.1743 28.0229L28.1761 32.6156C28.1761 32.8589 28.0795 33.0923 27.9074 33.2643C27.7354 33.4364 27.502 33.533 27.2587 33.533C27.0154 33.533 26.782 33.4364 26.61 33.2643C26.4379 33.0923 26.3413 32.8589 26.3413 32.6156V28.0229H21.745C21.5016 28.0229 21.2683 27.9263 21.0962 27.7542C20.9242 27.5822 20.8275 27.3488 20.8275 27.1055C20.8275 26.8622 20.9242 26.6288 21.0962 26.4568C21.2683 26.2847 21.5016 26.1881 21.745 26.1881H26.3394V21.6009C26.3394 21.3576 26.4361 21.1243 26.6082 20.9522C26.7802 20.7801 27.0136 20.6835 27.2569 20.6835C27.5002 20.6835 27.7336 20.7801 27.9056 20.9522C28.0777 21.1243 28.1743 21.3576 28.1743 21.6009V26.1881H32.756C32.9993 26.1881 33.2326 26.2847 33.4047 26.4568C33.5767 26.6288 33.6734 26.8622 33.6734 27.1055C33.6734 27.3488 33.5767 27.5822 33.4047 27.7542C33.2326 27.9263 32.9993 28.0229 32.756 28.0229H28.1743Z"
                fill="#8F8F8F"
              />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="68" height="5" viewBox="0 0 68 5" fill="none">
              <ellipse opacity="0.1" cx="34.0001" cy="2.52071" rx="33.0274" ry="1.98165" fill="#8F8F8F" />
            </svg>
          </div>
          <Button block className="templates-btn">
            Explore all templates
          </Button>
        </div>
      </div>

      <Button
        type="link"
        target="_blank"
        rel="noreferrer"
        className="link documentation-link"
        href={RULE_DETAILS[ruleType].documentationLink}
        icon={<MdMenuBook className="anticon" />}
      >
        Read complete documentation
      </Button>
    </div>
  );
};
