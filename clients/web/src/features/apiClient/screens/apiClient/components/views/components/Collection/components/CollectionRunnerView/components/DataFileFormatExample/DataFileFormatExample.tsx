import React from "react";
import "./dataFileFormatExample.scss";

interface DataFileFormatExampleProps {
  fileExtension: string;
  showLabel?: boolean;
}

export const DataFileFormatExample: React.FC<DataFileFormatExampleProps> = ({ fileExtension, showLabel = true }) => {
  const isJSON = fileExtension === "JSON";

  const jsonExample = (
    <pre className="code-example">
      <code>
        <span className="punctuation">[</span>
        {"\n  "}
        <span className="punctuation">{"{"}</span>
        <span className="key">"name"</span>
        <span className="punctuation">: </span>
        <span className="value">"Alice"</span>
        <span className="punctuation">, </span>
        <span className="key">"age"</span>
        <span className="punctuation">: </span>
        <span className="value">30</span>
        <span className="punctuation">{"}"}</span>
        <span className="punctuation">,</span>
        {"\n  "}
        <span className="punctuation">{"{"}</span>
        <span className="key">"name"</span>
        <span className="punctuation">: </span>
        <span className="value">"Bob"</span>
        <span className="punctuation">, </span>
        <span className="key">"age"</span>
        <span className="punctuation">: </span>
        <span className="value">25</span>
        <span className="punctuation">{"}"}</span>
        {"\n"}
        <span className="punctuation">]</span>
      </code>
    </pre>
  );

  const csvExample = (
    <pre className="code-example">
      <code>
        <span className="key">name,age</span>
        {"\n"}
        <span className="value">Alice,30</span>
        {"\n"}
        <span className="value">Bob,25</span>
      </code>
    </pre>
  );

  return (
    <div className="data-file-format-example">
      {showLabel && <div className="example-label">EXAMPLE FORMAT:</div>}
      {isJSON ? jsonExample : csvExample}
    </div>
  );
};
