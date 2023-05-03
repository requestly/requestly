Handlebars.registerHelper("parseRequestType", (requestType) => {
  switch (requestType) {
    case "main_frame":
      return "document (main)";
    case "sub_frame":
      return "document (iframe)";
    case "xmlhttprequest":
      return "xhr";
    default:
      return requestType;
  }
});

Handlebars.registerHelper("log", (data) => {
  console.log(data);
});
