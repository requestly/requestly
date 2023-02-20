import "./index.css";
export const BreadCrumb = ({ pages }) => {
  return (
    <div className="cmd-breadcrumb-wrapper">
      {pages.map((page, index) => (
        <div key={index} className="cmd-breadcrumb-page-name">
          {page}
        </div>
      ))}
    </div>
  );
};
