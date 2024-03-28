if (window.allObj != undefined) {
  initializeInstances();
  showDocInfo();
  if (getV('DOCUMENT_STATUSES-STATUS') == '3') return;
  initialize();
  onLoad();
  onChange();
  lazyEvaluationFunctions.setFunction('onLoad', onLoad);
}

function initialize() {
  radioSetting();
  onLoadRadioButton();
  setFocusColor();
  onLoadCompanyMaster();
  onLoadDocumentEmployeesList(makeListForDocumentEmployeesList());
  onLoadIcon(iconSetting());
  onClickCopyPageButton();
  createCSVLabel();
}

function iconSetting() {
  return {
    acrossYears: false, // 年度またぎの複製可能か true or false
    addPage: [5], // ページ追加対象ユニット番号
    inputEmployees: [5] // 従業員取り込み対象ユニット番号
  };
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
