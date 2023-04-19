import React from "react";

const Preferences = () => {
  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="card-wrapper">
          {/* Form controls  */}
          <div className="card has-no-box-shadow has-modern-border">
            {/* Card header  */}
            <div className="card-header">
              <h3 className="mb-0">App Behaviour</h3>
            </div>
            {/* Card body  */}
            <div className="card-body">
              <div className="form-group row">
                <label htmlFor="launch-on-startup" className="col-md-10 col-form-label form-control-label">
                  Launch Requestly on system startup
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="launch-on-startup" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="data-collection" className="col-md-10 col-form-label form-control-label">
                  Allow anonymous data collection
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="data-collection" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card-wrapper">
          {/* Form controls  */}
          <div className="card has-no-box-shadow has-modern-border">
            {/* Card header  */}
            <div className="card-header">
              <h3 className="mb-0">Local Proxy Server</h3>
            </div>
            {/* Card body  */}
            <div className="card-body">
              <div className="form-group row">
                <label for="default-host" className="col-md-6 col-form-label form-control-label">
                  Default Host
                </label>
                <div className="col-md-6">
                  <input className="form-control" type="text" value="127.0.0.0" id="default-host" />
                </div>
              </div>
              <div className="form-group row">
                <label for="default-port" className="col-md-6 col-form-label form-control-label">
                  Default Port
                </label>
                <div className="col-md-6">
                  <input className="form-control" type="number" value="8080" id="default-port" />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="launch-on-startup" className="col-md-10 col-form-label form-control-label">
                  Auto apply proxy on application startup
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="launch-on-startup" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="data-collection" className="col-md-10 col-form-label form-control-label">
                  Auto remove proxy when I quit Requestly
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="data-collection" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-wrapper">
          {/* Form controls  */}
          <div className="card has-no-box-shadow has-modern-border">
            {/* Card header  */}
            <div className="card-header">
              <h3 className="mb-0">Certificate</h3>
            </div>
            {/* Card body  */}
            <div className="card-body">
              <div className="form-group row">
                <div className="col-md-6 text-center">
                  <button type="button" className="btn btn-icon btn-outline-primary btn-sm ">
                    <span className="btn-inner--icon">
                      <i className="ni ni-cloud-download-95"></i>
                    </span>
                    <span className="btn-inner--text">Save certificate</span>
                  </button>
                </div>
                <div className="col-md-6 text-center">
                  <button type="button" className="btn btn-icon btn-outline-primary btn-sm ">
                    <span className="btn-inner--icon">
                      <i className="ni ni-fat-remove"></i>
                    </span>
                    <span className="btn-inner--text">Clear all certificates</span>
                  </button>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="data-collection" className="col-md-10 col-form-label form-control-label">
                  Auto install certificate on app startup
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="data-collection" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="data-collection" className="col-md-10 col-form-label form-control-label">
                  Also install certificate on each rule change
                </label>
                <div className="col-md-2">
                  <label className="custom-toggle">
                    <input type="checkbox" id="data-collection" checked onChange={() => null} />
                    <span
                      className="custom-toggle-slider rounded-circle"
                      data-label-off="No"
                      data-label-on="Yes"
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
