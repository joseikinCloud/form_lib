class InputObjects {
  constructor() {
  }
  initialize() {
    this.list = allObj.reduce((target, id) => {
      const splitedId = id.split('_');
      splitedId.shift();
      const num = +splitedId.pop();
      const page = +splitedId.pop();
      const objName = splitedId.join('_');
      if (!target[objName]) target[objName] = new InputObjectsByName();
      target[objName].register(id, page);
      return target;
    }, {});
  }
  getAllObjNameList() {
    return Object.keys(this.list);
  }
  getObjByName(name) {
    if (this.list[name] === undefined) throw new Error(`${name} は存在しないオブジェクト`);
    return this.list[name];
  }
  getAllIds(name) {
    return this.getObjByName(name).objList;
  }
  getLengthOfPageListByName(name) {
    return this.getObjByName(name).pageList.filter(v => v.length != 0).length;
  }
  getIdsbyPage(name, page) {
    if (this.getObjByName(name).pageList[page] === undefined) throw new Error(`${page} ページ目に ${name} は存在しない`);
    return this.getObjByName(name).pageList[page];
  }
  getIdsByIndex(name, index) {
    const list = this.getObjByName(name).pageList.filter(v => v.length != 0);
    if (list[index] === undefined) throw new Error(`${name} が存在するページ数は ${index + 1} より少ない`);
    return list[index];
  }
  objExists(name) {
    return this.list[name] != undefined;
  }
}

class InputObjectsByName {
  constructor() {
    const maxPageNum = 20;
    this.objList = [];
    this.pageList = [...Array(maxPageNum)].map(v => []);
  }
  register(id, page) {
    this.objList.push(id);
    this.pageList[page].push(id);
  }
}

class RadioButtons {
  constructor() {
  }
  initialize() {
    this.list = inputObjects.getAllObjNameList().reduce((target, name) => {
      const splitedName = name.split('_');
      const end = splitedName.pop();
      const groupName = splitedName.join('_');
      if (/^R[0-9]{1,2}$/.test(end)) {
        if (!target[groupName]) target[groupName] = new RadioButton();
        target[groupName].registerButton(`${groupName}_${end}`, +end.slice(1));
      }
      return target;
    }, {});
  }
  getAllGroupNameList() {
    return Object.keys(this.list);
  }
  onClickRadioButtonL(name, index) {
    const splitedName = name.split('_');
    const end = splitedName.pop();
    const groupName = splitedName.join('_');
    const preState = getV(...[name, index].filter(v => v != undefined));
    this.list[groupName].getAllButtonNameList().forEach(buttonName => {
      const tmp = [buttonName, index, this.list[groupName].unmark].filter(v => v != undefined);
      setV(...tmp);
    });
    if (preState == this.list[groupName].mark) return;
    const tmp = [name, index, this.list[groupName].mark].filter(v => v != undefined);
    setV(...tmp);
  }
  radioExists(name) {
    return this?.list?.[name] != undefined;
  }
  setMark(name, mark, unmark) {
    this.list[name].setMark(mark, unmark);
  }
}

class RadioButton {
  constructor() {
    this.buttonList = {};
    this.reverseList = {};
    this.mark = '◯';
    this.unmark = ' ';
  }
  getAllButtonNameList() {
    return Object.keys(this.buttonList);
  }
  getButtonNum(name) {
    return this.buttonList[name];
  }
  getButtonName(num) {
    return this.reverseList[num];
  }
  registerButton(name, num) {
    this.buttonList[name] = num;
    this.reverseList[num] = name;
  }
  setMark(mark, unmark) {
    this.mark = mark;
    this.unmark = unmark;
  }
  buttonExists(num) {
    return this.reverseList[num] != undefined;
  }
  synchronizeButton(index) {
    this.getAllButtonNameList().forEach(name => {
      [...Array(inputObjects.getLengthOfPageListByName(name))].forEach((_, i) => {
        setV(name, i, getV(name, index));
      });
    });
  }
  getRadioButtonValue(index) {
    return Object.keys(this.reverseList).find(num => {
      return getV(this.reverseList[num], index) != this.unmark;
    });
  }
}

class CompanyMaster {
  constructor() {
    const hasObjPrefix = {
      SHRSH: {
        masterPrefix: 'S_BUSINESS_OWNER_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE', AD1: 'ADDRESS_1', AD2: 'ADDRESS_2', OFFICE: 'NAME', TEL: 'TEL',
          POST1: 'POSTAL_CODE_1', POST2: 'POSTAL_CODE_2', TEL1: 'TEL_1', TEL2: 'TEL_2', TEL3: 'TEL_3'
        },
        noMasterPrefix: { POSITION: 'LSS_ATTORNEY_POST', OWNER: 'LSS_ATTORNEY_FULL_NAME', NUM: 'SHRSH_NUM' }
      },
      JGYNSH: {
        masterPrefix: 'BUSINESS_OWNER_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE', AD1: 'ADDRESS_1', AD2: 'ADDRESS_2', OFFICE: 'NAME', NAME: 'POST_FULL_NAME', TEL: 'TEL',
          POST1: 'POSTAL_CODE_1', POST2: 'POSTAL_CODE_2', POSITION: 'POST', OWNER: 'REPRESENT_FULL_N', TEL1: 'TEL_1', TEL2: 'TEL_2', TEL3: 'TEL_3'
        },
        noMasterPrefix: {}
      },
      OFF: {
        masterPrefix: 'OFFICE_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE', AD1: 'ADDRESS_1', AD2: 'ADDRESS_2', NAME: 'NAME', TEL: 'TEL',
          POST1: 'POSTAL_CODE_1', POST2: 'POSTAL_CODE_2', TEL1: 'TEL_1', TEL2: 'TEL_2', TEL3: 'TEL_3'
        },
        noMasterPrefix: {}
      },
      TNTSH: {
        masterPrefix: 'RESPONSIBLE_',
        hasMasterPrefix: {
          NAME: 'FULL_NAME', AFFILIATION: 'AFFILIATION', TEL: 'TEL', FAX: 'FAX', MAIL: 'MAIL_ADDRESS',
          TEL1: 'TEL_1', TEL2: 'TEL_2', TEL3: 'TEL_3', FAX1: 'FAX_1', FAX2: 'FAX_2', FAX3: 'FAX_3', MAIL1: 'MAIL_ADDRESS_1', MAIL2: 'MAIL_ADDRESS_2'
        },
        noMasterPrefix: {}
      }
    };
    Object.keys(hasObjPrefix).forEach(type => {
      this[type] = {};
      const tmp = hasObjPrefix[type];
      Object.keys(tmp.hasMasterPrefix).forEach(objSuffix => {
        this[type][objSuffix] = tmp.masterPrefix + tmp.hasMasterPrefix[objSuffix];
      });
      Object.keys(tmp.noMasterPrefix).forEach(objSuffix => {
        this[type][objSuffix] = tmp.noMasterPrefix[objSuffix];
      });
    });
    this.OTHER = {
      EIFN: 'E_I_F_NO',
      LIN: 'LABOR_INSURANCE_NO',
      CN: 'CORPORATE_NUMBER',
      EIFN1: 'E_I_F_NO_1',
      EIFN2: 'E_I_F_NO_2',
      EIFN3: 'E_I_F_NO_3',
      LIN1: 'LABOR_INSURANCE_NO_1',
      LIN2: 'LABOR_INSURANCE_NO_2',
      LIN3: 'LABOR_INSURANCE_NO_3',
      CAPITAL_STOCK: 'CAPITAL',
      EMPLOYEEN: 'EMPLOYEE_NUMBER',
      PRINCIPAL_BIZ: 'PRINCIPAL_BUSINESS',
      SCALE: 'CORPORATE_SCALE',
      INDUSTRYCLASSL: 'INDUSTRY_CLASSIFICATION_DIVISIO',
      INDUSTRYCLASSM: 'INDUSTRY_CLASSIFICATION',
      INDUSTRIES_TYPE: 'INDUSTRIES',
      LABOR_DELEGATE: 'WORKING_REPRESENTATIVE_FULL_NAM',
      CUTOFFDATE: 'CUTOFF_DATE',
      JGYNSHBIRTHDAY: 'REPRESENTATIVE_BIRTHDAY',
      FOUNDATIONYEAR: 'FOUNDATION_YEAR',
      FINANCIALMONTH: 'FINANCIAL_MONTH',
      ROUDOUKYOKU: 'WORKING_AGENCY_HEAD_LOCAL',
      HELLOWORK: 'PUBLIC_EMPLOYMENT_SECURITY_OFFI',
      JGYNSHBIRTHDAY_Y: 'JGYNSHBIRTHDAY_Y',
      JGYNSHBIRTHDAY_M: 'JGYNSHBIRTHDAY_M',
      JGYNSHBIRTHDAY_D: 'JGYNSHBIRTHDAY_D',
      TENANT_ID: 'TENANT_ID',
      CREATED_TENANT_ID: 'CREATED_TENANT_ID',
    };
  }
  initialize() {
  }
  toMasterName(name) {
    const splitedName = name.split('_');
    if (!(splitedName[0] in this)) return this.OTHER[name];
    const objPrefix = splitedName.shift();
    const objSuffix = splitedName.join('_');
    return this[objPrefix][objSuffix];
  }
  getMaster(name) {
    return getV(this.toMasterName(name));
  }
  setMaster(name) {
    setV(name, this.getMaster(name));
  }
  getAllObjNameByType(type) {
    return Object.keys(this[type]).map(key => {
      return `${type == 'OTHER' ? '' : (type + '_')}${key}`;
    });
  }
  setAllMasterByType(type) {
    this.getAllObjNameByType(type).forEach(name => {
      this.setMaster(name);
    });
  }
}

class DocumentEmployees {
  constructor() {
  }
  initialize() {
    try {
      this.list = JSON.parse(getV('DOCUMENT_EMPLOYEES_LIST'));
    } catch (e) {
      this.list = [];
    }
  }
  getEmployeesValue(index, key) {
    if (this.list[index]?.[key] == undefined) return '';
    return this.list[index][key];
  }
  countEmployees() {
    return this.list.length;
  }
}

class DocumentEmployeesContents {
  constructor() {
  }
  initialize() {
    try {
      this.list = JSON.parse(getV('DOCUMENT_EMPLOYEES_CONTENTS'));
      if (!Array.isArray(this.list)) this.list = JSON.parse(this.list);
      if (!Array.isArray(this.list)) this.list = [];
    } catch (e) {
      this.list = [];
    }
  }
  getEmployeesValue(index, key) {
    if (this.list[index]?.[key] == undefined) return '';
    return this.list[index][key];
  }
  makeSplicedList(documentEmployees) {
    this.list.splice(0, documentEmployees.countEmployees());//先頭n件を削除
    const nullIdList = this.list.filter(elm => elm.id == undefined || elm.id == '');//idの存在する要素の削除
    this.list = [documentEmployees.list, nullIdList].flat();
  }
  countElm() {
    return this.list.length;
  }
}

const inputObjects = new InputObjects();
const radioButtons = new RadioButtons();
const companyMaster = new CompanyMaster();
const documentEmployees = new DocumentEmployees();
const documentEmployeesContents = new DocumentEmployeesContents();
// 汎用関数
function getV(name, index) {
  if (radioButtons.radioExists(name)) return radioButtons.list[name].getRadioButtonValue(index);
  const id = inputObjects.getIdsByIndex(name, index ?? 0)[0];
  if (isCheckBox(id)) {
    return $('#' + id).prop('checked');
  }
  return $('#' + id).val();
}
function setV(...args) { // (name, val) or (name, index, val)
  const target = args.length == 2 || (args.length == 3 && args[1] == undefined) ? inputObjects.getAllIds(args[0]) : inputObjects.getIdsByIndex(args[0], args[1]);
  const val = args.slice(-1)[0];
  target.forEach(id => {
    if (isCheckBox(id)) {
      const display = val ? 'inline' : 'none';
      $(`#label${id} svg`).attr('style', `display: ${display};`);
      $('#' + id).prop('checked', val);
      return;
    }
    $('#' + id).val(val);
  });
}
function getMaster(name) { return companyMaster.getMaster(name); }
function getN(name, i) {
  const hankakuNumber = Number(toHan(getV(name, i)).replace(/,/g, ''));
  if (getV(name, i) == '' || isNaN(hankakuNumber)) return 0;
  setV(name, i, hankakuNumber.toLocaleString('ja-JP'));
  return hankakuNumber;
}
function setN(...args) {
  if (args.length > 3) throw new Error(`引数が多すぎます。`);
  const name = args[0];
  const index = args.length == 3 ? args[1] : undefined;
  const val = args.slice(-1)[0];
  const tmp = [name, index, val == '' ? '' : Number(val).toLocaleString('ja-JP')].filter(v => v != undefined);
  if (isNaN(Number(val))) throw new Error(`${name} にセットしようとしている ${val} は数値ではありません`);
  setV(...tmp);
}
function toHan(x) { return x.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[－]/g, "-"); }
function isCheckBox(id) {
  return $('#' + id).prop('tagName') == 'INPUT' && $('#' + id).attr('type') == 'checkbox';
}
function getIds(name, index = undefined) {
  if (index == undefined) return inputObjects.getAllIds(name);
  return inputObjects.getIdsByIndex(name, index);
}
function getSelector(name, index = undefined) {
  return getIds(name, index).map(id => '#' + id).join();
}
function makeSelector(names) {
  return names.map(name => getSelector(name)).filter(v => v).join();
}
function getObjectName(evt) {
  const splitedId = evt.currentTarget.id.split('_');
  splitedId.shift(); splitedId.pop(); splitedId.pop();
  return splitedId.join('_');
}
function getCheckValue(name, index = 0) {
  return $('#' + inputObjects.getAllIds(name)[index]).prop('checked');
}
function setCheckValue(...args) {
  setV(...args);
}
function getNumObj(name) {
  return inputObjects.getObjByName(name).pageList.filter(v => v.length != 0).length;
}

function toWareki(dateString) {
  const date = new Date(dateString.slice(0, 4), dateString.slice(4, 6) - 1, dateString.slice(6, 8));
  const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' }).format(date);
  return [wareki.split('/'), wareki.slice(0, 2), wareki.slice(2).split('/')].flat();
}
function calcPeriod(yearId, monthId, dayId, subMonth, subDay, type = 2) {
  const args = [yearId, monthId, dayId, subMonth, subDay];
  const isValid = args.reduce((acc, cur) => acc || cur == undefined, false);
  if (isValid) return '';
  const toNumber = fieldId => {
    if (Number.isInteger(fieldId)) return fieldId;
    if (Number.isInteger(getV(fieldId))) return getV(fieldId);
    const numString = (getV(fieldId) || '').replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[^0-9]/g, '');
    return Number(numString);
  };
  const japanese2Christian = (yearId, type = 2) => {
    if (Number.isInteger(yearId)) return yearId;
    if ([0, 1988, 2018][type] == null) return;
    return (getV(yearId) == '元' ? 1 : toNumber(yearId)) + [0, 1988, 2018][type];
  };
  const toDoubleDigits = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDoubleDigits(dt.getMonth() + 1), toDoubleDigits(dt.getDate())].join('/');
  const year = japanese2Christian(yearId, type);
  const month = toNumber(monthId);
  const day = toNumber(dayId);
  const ymdIsZero = [year, month, day].map(ymd => ymd != 0).reduce((acc, cur) => acc && cur);
  if (!ymdIsZero) return '';
  const refDt = new Date(year, month - 1, day + subDay);
  let result;
  const lastDay = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth + 1, 0);
  if (refDt.getDate() > lastDay.getDate()) {
    result = lastDay;
  } else {
    result = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth, refDt.getDate() + (subMonth <= 0 ? 0 : -1));
  }
  return toDateField(result);
}

function calcPeriodFromDate(dateId, subMonth = 0, subDay = 0) {
  if (!dateId) return '';
  if (!getV(dateId)) return '';
  const toDD = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDD(dt.getMonth() + 1), toDD(dt.getDate())].join('/');
  let refDt = new Date(getV(dateId)); refDt.setDate(refDt.getDate() + subDay);
  const lastDay = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth + 1, 0);
  let result;
  if (refDt.getDate() > lastDay.getDate()) {
    result = lastDay;
  } else {
    result = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth, refDt.getDate() + (subMonth <= 0 ? 0 : -1));
  }
  return toDateField(result);
}

function calcSubDate(yearId, monthId, dayId, subMonth, subDay, type = 2) {
  const args = [yearId, monthId, dayId, subMonth, subDay];
  const isValid = args.reduce((acc, cur) => acc || cur == undefined, false);
  if (isValid) return '';
  const toNumber = fieldId => {
    if (Number.isInteger(fieldId)) return fieldId;
    if (Number.isInteger(getV(fieldId))) return getV(fieldId);
    const numString = (getV(fieldId) || '').replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[^0-9]/g, '');
    return Number(numString);
  };
  const japanese2Christian = (yearId, type = 2) => {
    if (Number.isInteger(yearId)) return yearId;
    if ([0, 1988, 2018][type] == null) return;
    return (getV(yearId) == '元' ? 1 : toNumber(yearId)) + [0, 1988, 2018][type];
  };
  const toDoubleDigits = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDoubleDigits(dt.getMonth() + 1), toDoubleDigits(dt.getDate())].join('/');
  const year = japanese2Christian(yearId, type);
  const month = toNumber(monthId);
  const day = toNumber(dayId);
  const ymdIsZero = [year, month, day].map(ymd => ymd != 0).reduce((acc, cur) => acc && cur);
  if (!ymdIsZero) return '';
  const result = new Date(year, month - 1 + subMonth, day + subDay);
  return toDateField(result);
}

function calcSubDateFromDate(dateId, subMonth = 0, subDay = 0) {
  if (!dateId) return '';
  if (!getV(dateId)) return '';
  const toDD = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDD(dt.getMonth() + 1), toDD(dt.getDate())].join('/');
  let result = new Date(getV(dateId));
  result.setMonth(result.getMonth() + subMonth);
  result.setDate(result.getDate() + subDay);
  return toDateField(result);
}

// Load 時実行
function onLoadCompanyMaster() {
  setV('JGYNSHBIRTHDAY_Y', getMaster('JGYNSHBIRTHDAY').slice(0, 4));
  setV('JGYNSHBIRTHDAY_M', getMaster('JGYNSHBIRTHDAY').slice(4, 6));
  setV('JGYNSHBIRTHDAY_D', getMaster('JGYNSHBIRTHDAY').slice(6, 8));
  Object.keys(companyMaster).forEach(type => {
    if (type == 'SHRSH'
      && (getMaster('TENANT_ID') == getMaster('CREATED_TENANT_ID')
        || inputObjects.objExists('IS_MANUAL') && getCheckValue('IS_MANUAL'))
    ) return;
    companyMaster.setAllMasterByType(type);
  });
  if (getMaster('TENANT_ID') != getMaster('CREATED_TENANT_ID') && inputObjects.objExists('IS_MANUAL')) {
    if (!getCheckValue('IS_MANUAL')) setV('SHRSH_NUM', getV('LSS_ATTORNEY_REGIST_NUMBER') == '' ? getV('S_LSS_ATTORNEY_REGIST_NUMBER') : getV('LSS_ATTORNEY_REGIST_NUMBER'));
    $(getSelector('IS_MANUAL')).on('click', () => {
      if (!getCheckValue('IS_MANUAL')) {
        companyMaster.setAllMasterByType('SHRSH');
        setV('SHRSH_NUM', getV('LSS_ATTORNEY_REGIST_NUMBER') == '' ? getV('S_LSS_ATTORNEY_REGIST_NUMBER') : getV('LSS_ATTORNEY_REGIST_NUMBER'));
      }
    });
  }
}

function onLoadRadioButton() {
  radioButtons.getAllGroupNameList().forEach(groupName => {
    radioButtons.list[groupName].getAllButtonNameList().forEach(name => {
      const num = inputObjects.getLengthOfPageListByName(name);
      [...Array(num)].forEach((_, i) => {
        $(getSelector(name, i)).off('click.initializeButton').on('click.initializeButton', (evt) => {
          radioButtons.onClickRadioButtonL(name, i);
          $(getSelector(name, i)).each((_, elm) => {
            if (!/[a-z]/.test($(elm).attr('name'))) {
              radioButtons.list[groupName].synchronizeButton(i);
            }
          });
        });
      });
    });
  });
}

function onLoadDocumentEmployeesList(employees) {
  if (Object.keys(employees.list).length == 0) return;
  // list = {full_name:(i)=>[`ITEXT${3000+i}`]}
  // list = {full_name:[[{name:'ITEXT1000'},{name:'ITEXT1001'}],{name:'ITEXT1002',page:0}]}
  documentEmployeesContents.makeSplicedList(documentEmployees);
  const count = documentEmployeesContents.countElm();
  Object.keys(employees.list).forEach(key => {
    [...Array(employees.max)].forEach((_, i) => {
      let objList = employees.list[key](i);
      if (!Array.isArray(objList)) objList = [objList];
      objList.forEach(obj => {
        if (i < count && (obj.page < inputObjects.getLengthOfPageListByName(obj.name) || obj.page == undefined)) setEmployeesValue(key, i, obj);
        setEventHandlerForDocumentEmployees(employees, obj, objList);
      });
    });
  });
}

function setEmployeesValue(key, index, obj) {
  const splitedKey = key.split('_'); splitedKey.pop();
  const keyPrefix = splitedKey.join('_');
  const splitedKeyValue = ['birthday', 'hire_date', 'employment_insurance_number'];
  const isSplited = splitedKeyValue.some(v => v == keyPrefix);
  const keyTmp = isSplited ? keyPrefix : key;
  const value = documentEmployeesContents.getEmployeesValue(index, keyTmp);
  setV(obj.name, obj.page, splitEmployeesValue(key, value));
}

function splitEmployeesValue(key, value) {
  if (value == '') return value;
  const splitedKey = key.split('_');
  const keyNum = +splitedKey.pop();
  const keyName = splitedKey.join('_');
  if (value != '' && keyName == 'birthday' || keyName == 'hire_date') {
    return toWareki(value)[keyNum];
  }
  if (keyName == 'employment_insurance_number') {
    return value.split('-')[keyNum];
  }
  return value;
}

function setEventHandlerForDocumentEmployees(employees, obj, objList) {
  getIds(obj.name, obj.page).forEach(id => {
    const event = isCheckBox(id) ? 'click.initialize' : 'change.initialize';
    $(getSelector(obj.name, obj.page)).on(event, (evt) => {
      setDocumentEmployeesContents(employees);
      objList.forEach((_, j) => {
        if (obj.page < inputObjects.getLengthOfPageListByName(obj.name) && inputObjects.getIdsbyPage(objList[j].name, objList[j].page).some(id => id == evt.currentTarget.id)) {
          setV(objList[j].name, objList[j].page, evt.currentTarget.value);
        }
      });
    });
  });
}

function setDocumentEmployeesContents(employees) {
  const result = [...Array(employees.max)].map((_, i) => {
    return { id: documentEmployees.getEmployeesValue(i, 'id') };
  });
  const count = Math.max(documentEmployees.countEmployees(), employees.max ?? 0);
  Object.keys(employees.list).forEach(key => {
    [...Array(count)].forEach((_, i) => {
      const obj = employees.list[key](i);
      if (obj.name != undefined && (obj.page == undefined || (obj.page < inputObjects.getLengthOfPageListByName(obj.name)))) result[i][key] = getV(obj.name, obj.page);
    });
  });
  setV('DOCUMENT_EMPLOYEES_CONTENTS', JSON.stringify(result));
}

function setFocusColor() {
  const fieldTabIdSelector = inputObjects.getAllObjNameList().map(name => {
    return inputObjects.getAllIds(name).map(id => {
      if ($(`#${id} `).attr('tabindex') > 0) return `#${id} `;
    }).filter(v => v).join();
  }).filter(v => v).join();
  const focusColor = 'rgba(155,185,225,0.75)';
  const fieldTabColor = 'rgba(199,218,244,0.5)';
  // 手入力可能なフィールドに色を付ける。
  $(fieldTabIdSelector).css('background', fieldTabColor);
  // フォーカスのあたっているフィールドに色を付ける。
  $(fieldTabIdSelector).on({
    'focus': (evt) => $(evt.target).css('background', focusColor),
    'blur': (evt) => $(evt.target).css('background', fieldTabColor)
  });
}

function visualizeObj(captionList = [], inputList = [], labelList = []) {
  [...document.styleSheets].some(ss => {
    const captionObj = captionList.map(n => getSelector(n)).join().split(',');
    $(captionObj.join()).prop("disabled", true);
    $(captionObj.join()).css('font-weight', 'bold');
    const inputObj = inputList.map(n => getSelector(n)).join().split(',');
    const lableObj = labelList.map(n => getLabelSelector(n));
    const names = [captionObj, inputObj, lableObj].flat();
    const result = names.map(name => [...ss.cssRules].find(rule => rule.selectorText && rule.selectorText.indexOf(name) != -1));
    result.forEach(x => { if (x) x.style.visibility = ''; });
    return result.reduce((x, y) => x && y);
  });
}

function makeArray(num, prefix, first, deference) {
  return [...Array(num)].map((_, i) => `${prefix}${first + i * deference} `);
}