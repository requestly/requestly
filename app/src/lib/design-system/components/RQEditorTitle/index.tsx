import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Input, Typography, InputRef } from "antd";
import { RQButton } from "lib/design-system/components";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import { TextAreaRef } from "antd/lib/input/TextArea";
import "./RQEditorTitle.css";

interface ValidationErrors {
  name?: string;
}
interface TitleProps {
  name: string;
  showDocs?: boolean;
  description: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  nameChangeCallback: (name: string, warnForUnsavedChanges?: boolean) => void;
  descriptionChangeCallback: (desc: string) => void;
  errors?: ValidationErrors;
  mode?: "create" | "edit";
  tagText?: string;
  defaultName?: string;
  disabled?: boolean;
  isSampleRule?: boolean;
}

const { TextArea } = Input;

export const RQEditorTitle: React.FC<TitleProps> = ({
  name,
  disabled = false,
  isSampleRule = false,
  showDocs = false,
  description = "",
  nameChangeCallback,
  namePlaceholder,
  descriptionPlaceholder,
  descriptionChangeCallback,
  defaultName,
  mode = "edit",
  tagText,
  errors,
}) => {
  const [isNameEditable, setIsNameEditable] = useState<boolean>(false);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState<boolean>(false);

  const textAreaRef = useRef<TextAreaRef | null>(null);
  const nameInputRef = useRef<InputRef | null>(null);

  useEffect(() => {
    if (errors?.name) {
      setIsNameEditable(true);
      nameInputRef.current?.focus({ cursor: "end" });
    }
  }, [errors]);

  useEffect(() => {
    if (isDescriptionEditable) {
      textAreaRef.current?.focus({ cursor: "end" });
    }
  }, [isDescriptionEditable]);

  useEffect(() => {
    if (!defaultName || mode === "edit") return;

    nameChangeCallback(defaultName, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, defaultName]);

  return (
    <Row className="editor-title-container">
      <Col className="flex-1">
        <Row className="editor-title-name">
          {name.length === 0 || isNameEditable ? (
            <div className="editor-title-name-wrapper">
              <Input
                disabled={disabled}
                ref={nameInputRef}
                data-tour-id="rule-editor-title"
                className={`${errors?.name && !name ? "error" : null} editor-title-input`}
                autoFocus={true}
                onFocus={() => setIsNameEditable(true)}
                onBlur={() => setIsNameEditable(false)}
                bordered={false}
                spellCheck={false}
                value={name}
                onChange={(e) => nameChangeCallback(e.target.value)}
                placeholder={namePlaceholder}
                onPressEnter={() => setIsNameEditable(false)}
              />
              <div className="field-error-prompt">{errors?.name && !name ? errors?.name : null}</div>
            </div>
          ) : (
            <div className="editor-title" data-tour-id="rule-editor-title">
              <Typography.Text
                ellipsis={true}
                onClick={() => {
                  if (disabled) {
                    return;
                  }

                  setIsNameEditable(true);
                }}
              >
                {name ? name : namePlaceholder}
              </Typography.Text>
              {disabled ? null : <BiPencil onClick={() => setIsNameEditable(true)} />}
            </div>
          )}
        </Row>
        {isSampleRule ? null : (
          <Row className="editor-title-description">
            {isDescriptionEditable ? (
              <TextArea
                disabled={disabled}
                ref={textAreaRef}
                autoSize={{ minRows: 1, maxRows: 3 }}
                // onFocus={() => setIsDescriptionEditable(true)}
                onBlur={() => setIsDescriptionEditable(false)}
                bordered={false}
                maxLength={180}
                value={description}
                onChange={(e) => descriptionChangeCallback(e.target.value)}
                placeholder={descriptionPlaceholder}
                onPressEnter={() => setIsDescriptionEditable(false)}
              />
            ) : (
              <div className="editor-description">
                <Typography.Paragraph
                  disabled={disabled}
                  style={{ width: "100%" }}
                  ellipsis={{
                    rows: 3,
                  }}
                  editable={{
                    icon:
                      description.length > 0 ? (
                        <RQButton
                          disabled={disabled}
                          onClick={() => {
                            setIsDescriptionEditable(true);
                          }}
                          className="edit-description-btn"
                          type="text"
                        >
                          Edit description
                        </RQButton>
                      ) : (
                        <></>
                      ),
                    tooltip: false,
                  }}
                  onClick={() => {
                    setIsDescriptionEditable(true);
                  }}
                >
                  <span>{description ? description : descriptionPlaceholder}</span>
                </Typography.Paragraph>
              </div>
            )}
          </Row>
        )}
      </Col>
      <Row justify="end">{tagText?.length && <Col className="mock-tag editor-title-tag">{tagText}</Col>}</Row>
    </Row>
  );
};
