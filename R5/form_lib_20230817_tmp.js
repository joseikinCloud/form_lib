if (window.allObj != undefined) {
  initializeInstances();
  showDocInfo();
  if (getV('DOCUMENT_STATUSES-STATUS') == '3') return;
  initialize();
  onLoad();
  onChange();
}

function initialize() {
  radioSetting();
  onLoadRadioButton();
  setFocusColor();
  onLoadCompanyMaster();
  onLoadDocumentEmployeesList(makeListForDocumentEmployeesList());
}

function radioSetting() {
}

function makeListForDocumentEmployeesList() {
  const ret = { list: {}, max: 0 };
  return ret;
}

function onLoad() {
}
function onChange() {
}
