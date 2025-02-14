"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
import { useState } from "react";
import { DbPathsEnum, OptionMetadata } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";

import get from "lodash/get.js";
import { FollowupData, FollowUpComment, FollowUps } from "./Followup2";
import { CommentTrigger } from "~/components/form/FormComment";

export interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience2 = (props: ExperienceProps) => {
  const { question, edition } = props;

  const { options, entity } = question;

  return (
    <FormItem {...props}>
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options?.map((option, i) => (
            <ExperienceOption key={i} option={option} i={i} {...props} />
          ))}
        </div>
      </div>
    </FormItem>
  );
};

const CodeExample = ({ language, code, codeHighlighted }) => {
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        <FormattedMessage id="general.code_example" />
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

const ExperienceOption = (
  props: ExperienceProps & { option: OptionMetadata; i: number }
) => {
  const {
    i,
    edition,
    response,
    question,
    option,
    path,
    value,
    updateCurrentValues,
    readOnly,
  } = props;
  const hasValue = !isEmpty(value);
  const { followups } = question;

  const formPaths = getFormPaths({ edition, question });

  // get the paths of the predefined and freeform followup answers
  // inside the overall response document for this specific option
  const allPredefinedFollowupPaths = formPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  const predefinedFollowupPath = allPredefinedFollowupPaths?.[option.id];
  const freeformFollowupPath =
    formPaths[DbPathsEnum.FOLLOWUP_FREEFORM]?.[option.id];

  const predefinedFollowupValue =
    (predefinedFollowupPath && get(response, predefinedFollowupPath)) || [];
  const freeformFollowupValue =
    (freeformFollowupPath && get(response, freeformFollowupPath)) || "";

  const hasFollowupData =
    !isEmpty(predefinedFollowupValue) || !isEmpty(freeformFollowupValue);
  const [showFollowupComment, setShowFollowupComment] =
    useState(hasFollowupData);

  const followupData: FollowupData = {
    predefinedFollowupPath,
    freeformFollowupPath,
    predefinedFollowupValue,
    freeformFollowupValue,
  };

  const isChecked = value === option.id;
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const hasValueClass =
    isChecked || (isChecked && hasFollowupData) ? "hasValue" : "";

  return (
    <div className={`form-experience-option ${hasValueClass}`}>
      <div className="form-experience-option-inner">
        <Form.Check
          key={i}
          // layout="elementOnly"
          type="radio"
        >
          <Form.Check.Label htmlFor={`${path}.${i}`}>
            <div className="form-input-wrapper">
              <Form.Check.Input
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  const clickedValue = target.value;
                  if (clickedValue === value) {
                    updateCurrentValues({ [path]: null });
                  }
                }}
                onChange={(e) => {
                  updateCurrentValues({ [path]: e.target.value });
                  if (allPredefinedFollowupPaths) {
                    // when main value changes, also clear all predefined follow-ups
                    for (const followUpPath of Object.values(
                      allPredefinedFollowupPaths
                    )) {
                      updateCurrentValues({ [followUpPath]: null });
                    }
                  }
                }}
                type="radio"
                value={option.id}
                name={path}
                id={`${path}.${i}`}
                // ref={refFunction}
                checked={isChecked}
                className={checkClass}
                disabled={readOnly}
              />
            </div>
            <FormOption {...props} option={option} />
          </Form.Check.Label>
          {followups && <FollowUps {...props} followupData={followupData} />}
        </Form.Check>
        {/* <CommentTrigger /> */}
      </div>
      {/* {showFollowupComment && isChecked && (
        <FollowUpComment {...props} followupData={followupData} />
      )} */}
    </div>
  );
};

export default Experience2;
