class InputObjects {
  constructor() {
  }
  initialize() {
    const maxPageNum = 50;
    this.objListByPage = [...Array(maxPageNum)].map(v => []);
    this.list = allObj.reduce((target, id) => {
      const splitId = id.split('_');
      splitId.shift();
      const num = +splitId.pop();
      const page = +splitId.pop();
      const objName = splitId.join('_');
      this.objListByPage[page].push({ name: objName, id: id });
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
    return this.getObjByName(name).pageList.filter(v => v.length !== 0).length;
  }
  getIdsbyPage(name, page) {
    if (this.getObjByName(name).pageList[page] === undefined) throw new Error(`${page} ページ目に ${name} は存在しない`);
    return this.getObjByName(name).pageList[page];
  }
  getIdsByIndex(name, index) {
    const list = this.getObjByName(name).pageList.filter(v => v.length !== 0);
    if (list[index] === undefined) throw new Error(`${name} が存在するページ数は ${index + 1} より少ない`);
    return list[index];
  }
  objExists(name) {
    return this.list[name] !== undefined;
  }
  getIndexById(id) {
    const splitId = id.split('_');
    splitId.shift(); splitId.pop(); splitId.pop();
    const objName = splitId.join('_');
    return this.list[objName].getIndexById(id);
  }
  getObjListByPage(page) {
    return this.objListByPage[page];
  }
}

class InputObjectsByName {
  constructor() {
    const maxPageNum = 50;
    this.objList = [];
    this.pageList = [...Array(maxPageNum)].map(v => []);
  }
  register(id, page) {
    this.objList.push(id);
    this.pageList[page].push(id);
  }
  getIndexById(id) {
    return this.pageList.filter(v => v.length !== 0).findIndex(arr => arr.some(v => v === id));
  }
}

class PageList {
  constructor() {
  }
  initialize() {
    this.list = $(`[id^="iftc_cf_page_"]`);
    this.addPages = this.getIndexOfAddPages();
  }
  indexToSelector(index) {
    return this.list.eq(index);
  }
  getIndexOfAddPages() {
    const tmp = new Set();
    const ret = [...this.list]
      .map(v => [...v.classList.values()].find(s => s.indexOf('iftc_cf_form_') > -1))
      .map((str, i) => {
        if (tmp.has(str)) return i + 1;
        tmp.add(str);
        return false;
      }).filter(v => v !== false);
    return ret;
  }
}

class IconObjects {
  constructor() {
    this.list = {
      acrossYears: { name: 'CAPTION_ACROSS_YEARS', string: '前年度から複製可能', color: 'rgba(230,100,0,1)', iconType: 'label' },
      addPage: { name: 'CAPTION_COPY_PAGE', string: 'ページ追加可能', color: 'rgba(190,0,0,1)', iconType: 'label' },
      inputEmployees: { name: 'CAPTION_INPUT_EMPLOYEES', string: '従業員参照可能', color: 'rgba(0,30,100,1)', iconType: 'label' },
      copyPage1: { name: 'COPY_PAGE_BUTTON', string: '1ページ目引用', color: 'rgba(68,201,194,1)', iconType: 'button' },
      csvNum: { name: 'SHOW_CSV_NUM_BUTTON', string: 'CSV番号を表示する', color: 'rgba(68,201,194,1)', iconType: 'button' }
    };
  }
  showIcon(iconSetting) {
    const margin = 13;
    const fontSize = 8;
    if (iconSetting.acrossYears) {
      this.setPages('acrossYears', [2]);
      this.setMargin('acrossYears', margin, margin);
    }
    if (Array.isArray(iconSetting.addPage) && iconSetting.addPage.length !== 0) {
      this.setPages('addPage', iconSetting.addPage);
      this.setMargin('addPage', margin, margin);
    }
    if (Array.isArray(iconSetting.inputEmployees) && iconSetting.inputEmployees.length !== 0) {
      this.setPages('inputEmployees', iconSetting.inputEmployees);
      this.setMargin('inputEmployees', margin + fontSize * 10, margin);
    }
    if (pageList.addPages.length > 0) {
      this.setPages('copyPage1', pageList.addPages);
      this.setMargin('copyPage1', 595 - margin - (this.list.copyPage1.string.length + 2) * fontSize, margin);
    }

    this.setPages('csvNum', [2]);
    this.setMargin('csvNum', 595 - margin - (this.list.csvNum.string.length + 2) * fontSize, margin);


    var style = document.createElement("style");
    Object.keys(this.list).forEach(key => {
      if (!this.list[key].pages) return;
      const csvDiv = $('<div>');
      csvDiv.prop('type', 'button');
      csvDiv.prop('tabindex', '-1');
      csvDiv.css('cursor', this.list[key].iconType === 'button' ? 'pointer' : 'default');
      csvDiv.css('font-weight', 'bold');
      csvDiv.css('font-family', 'ヒラギノ角ゴ');
      csvDiv.css('padding', `2pt 0pt`);
      csvDiv.css('font-size', `${fontSize}pt`);
      csvDiv.css('color', this.list[key].iconType === 'label' ? this.list[key].color : 'white');
      csvDiv.css('background', this.list[key].iconType === 'label' ? 'white' : this.list[key].color);
      csvDiv.css('border', this.list[key].iconType === 'label' ? `solid 2px ${this.list[key].color}` : 'white');
      csvDiv.css('border-radius', '5px');
      csvDiv.css('text-align', 'center');
      csvDiv.css('display', 'inline-block');
      csvDiv.css('width', `${(this.list[key].string.length + 2) * fontSize}pt`);
      csvDiv.attr('id', this.list[key].name);
      csvDiv.css('position', 'absolute');
      csvDiv.text(this.list[key].string);
      this.list[key].pages.forEach(page => {
        this.setPosition(key, page);
        csvDiv.css('top', this.list[key].top);
        csvDiv.css('left', this.list[key].left);
        page.children('[class~="iftc_cf_inputitems"]').append(csvDiv);
      });
    });
  }
  setPages(name, units) {
    if (!Array.isArray(units) || units.length === 0) return;
    this.list[name].pages = units.map(unit => pageList.indexToSelector(unit - 1));
  }
  setMargin(name, left, top) {
    this.list[name].margin = {};
    this.list[name].margin.left = left;
    this.list[name].margin.top = top;
  }
  setPosition(name, page) {
    const getPtValueFromStylesheets = (selector) => {
      let result;
      [...document.styleSheets].some(styleSheet => {
        return [...styleSheet.cssRules].some(rule => {
          if (rule.selectorText === selector) {
            result = rule.style;
            return true;
          }
          return false;
        });
      });
      return result;
    };

    Object.keys(this.list[name].margin).forEach((key, i) => {
      const id = $(`#${page.attr('id')} > [class~="iftc_cf_inputitems"]`).attr('id');
      const inputAreaPos = Number(getPtValueFromStylesheets(`#${id}`)[key].split('pt')[0]);
      this.list[name][key] = `${this.list[name].margin[key] - inputAreaPos}pt`;
    });
  }
  getNameList() {
    return Object.keys(this.list).map(key => this.list[key].name);
  }
}

class RadioButtons {
  constructor() {
  }
  initialize() {
    this.list = inputObjects.getAllObjNameList().reduce((target, name) => {
      const splitName = name.split('_');
      const end = splitName.pop();
      const groupName = splitName.join('_');
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
    const splitName = name.split('_');
    const end = splitName.pop();
    const groupName = splitName.join('_');
    const preState = getV(...[name, index].filter(v => v !== undefined));
    this.list[groupName].getAllButtonNameList().forEach(buttonName => {
      const tmp = [buttonName, index, this.list[groupName].unmark].filter(v => v !== undefined);
      setV(...tmp);
    });
    if (preState === this.list[groupName].mark) return;
    const tmp = [name, index, this.list[groupName].mark].filter(v => v !== undefined);
    setV(...tmp);
  }
  radioExists(name) {
    return this?.list?.[name] !== undefined;
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
    this.unmark = '​';
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
    if (unmark !== '') this.unmark = unmark;
  }
  buttonExists(num) {
    return this.reverseList[num] !== undefined;
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
      return getV(this.reverseList[num], index) === this.mark;
    });
  }
  setCorrectMark() {
    const isWrong = this.getAllButtonNameList().map(name => {
      return getV(name) === this.mark;
    }).filter(v => v).length > 1;
    if (isWrong) this.getAllButtonNameList().forEach(name => {
      const init = $(getSelector(name)).attr('data-init-value');
      if (!!init) setV(name, this.unmark);
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
      ROUKI_ID: 'LSIO_ID',
      ROUKI_NAME: 'LSIO'
    };
  }
  initialize() {
  }
  toMasterName(name) {
    const splitName = name.split('_');
    if (!(splitName[0] in this)) return this.OTHER[name];
    const objPrefix = splitName.shift();
    const objSuffix = splitName.join('_');
    return this[objPrefix][objSuffix];
  }
  getMaster(name) {
    if (!inputObjects.objExists(this.toMasterName(name))) {
      console.warn(`${this.toMasterName(name)}は存在しないオブジェクト`);
      return;
    }
    return getV(this.toMasterName(name));
  }
  setMaster(name) {
    const exists = [name, this.toMasterName(name)].filter(v => !inputObjects.objExists(v));
    if (exists.length > 0) {
      exists.forEach(v => console.warn(`${v}は存在しないオブジェクト`));
      return;
    }
    setV(name, this.getMaster(name));
  }
  getAllObjNameByType(type) {
    return Object.keys(this[type]).map(key => {
      return `${type === 'OTHER' ? '' : (type + '_')}${key}`;
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
    this.splitKeyValue = ['birthday', 'hire_date', 'employment_insurance_number'];
  }
  initialize() {
    try {
      if (!inputObjects.objExists('DOCUMENT_EMPLOYEES_LIST')) {
        this.list = [];
        return;
      }
      this.list = JSON.parse(getV('DOCUMENT_EMPLOYEES_LIST'));
    } catch (e) {
      this.list = [];
    }
    this.objNameSet = new Set();
  }
  getList() {
    return this.list;
  }
  countEmployees() {
    return this.list.length;
  }
  contains(index, key) {
    const splitKey = key.split('_'); splitKey.pop();
    const keyPrefix = splitKey.join('_');
    return this.list[index]?.[keyPrefix] !== undefined || this.list[index]?.[key] !== undefined;
  }
  containsId(id) {
    return this.list.some(v => v.id === id);
  }
  makeIdList() {
    return this.list.map(v => {
      return { id: v[id] };
    });
  }
  getEmployeesValue(index, key) {
    const splitKey = key.split('_'); splitKey.pop();
    const keyPrefix = splitKey.join('_');
    const haveSplit = this.splitKeyValue.some(v => v === keyPrefix);
    if (haveSplit) return this.splitEmployeesValue(index, key);
    return this.list[index]?.[key] === undefined ? '' : this.list[index][key];
  }
  splitEmployeesValue(index, key) {
    const splitKey = key.split('_');
    const keyNum = +splitKey.pop();
    const keyName = splitKey.join('_');
    const notSplitValue = this.getEmployeesValue(index, keyName);
    if (notSplitValue === '') return '';
    if (keyName === 'birthday' || keyName === 'hire_date') {
      return toWareki(notSplitValue)[keyNum];
    }
    if (keyName === 'employment_insurance_number') {
      return notSplitValue.split('-')[keyNum];
    }
    return '';
  }
}

class DocumentEmployeesContents {
  constructor(employees) {
    try {
      if (!inputObjects.objExists('PREVIOUS_DOC_EMP_LIST')) {
        this.previous = [];
        return;
      }
      this.previous = JSON.parse(getV('PREVIOUS_DOC_EMP_LIST'));
    } catch (e) {
      this.previous = [];
    }
    // employees.max の大きさの配列を用意し、PREVIOUS_DOC_EMP_LIST から Id を格納
    const previousDocEmpContents = [...Array(employees.max ?? 0)].map((_, i) => {
      if (this.previous.length > i)
        return { id: this.previous[i].id };
      else
        return {};
    });
    // 現在の書類の内容と合成
    Object.keys(employees.list).forEach(key => {
      [...Array(employees.max ?? 0)].forEach((_, i) => {
        let obj = employees.list[key](i);
        if (Array.isArray(obj)) obj = obj[0];
        if (obj.name !== undefined && (obj.page === undefined || obj.page < getP(obj.name)))
          previousDocEmpContents[i][key] = getV(obj.name, obj.page);
      });
    });
    // DOCUMENT_EMPLOYEES_LIST に存在しない ID のデータを削除
    const subDocEmpcontents = previousDocEmpContents.filter(v => v.id === undefined || documentEmployees.containsId(v.id));
    const sublength = previousDocEmpContents.length - subDocEmpcontents.length;
    const docEmpContents = subDocEmpcontents.concat([...Array(sublength)].map(v => { return {}; }));
    // DOCUMENT_EMPLOYEES_LIST の内容で上書き
    docEmpContents.forEach((_, i) => {
      Object.keys(employees.list).forEach(key => {
        if (documentEmployees.contains(i, key)) {
          docEmpContents[i][key] = documentEmployees.getEmployeesValue(i, key);
          let objs = employees.list[key](i);
          if (!Array.isArray(objs)) objs = [objs];
          objs.forEach(obj => documentEmployees.objNameSet.add(obj.name));
        }
      });
    });
    this.list = docEmpContents;
  }
  getEmployeesValue(index, key) {
    if (this.list[index]?.[key] === undefined) return '';
    return this.list[index][key];
  }
  countElm() {
    return this.list.length;
  }
}

class LazyEvaluationFunctions {
  constructor() {
  }
  setFunction(name, func) {
    if (func === undefined) this[name] = () => { console.warn(`lazyEvaluationFunctions.${name} は未定義`) };
    this[name] = func;
  }
}

const inputObjects = new InputObjects();
const radioButtons = new RadioButtons();
const companyMaster = new CompanyMaster();
const documentEmployees = new DocumentEmployees();
const documentEmployeesContents = { initialize: () => undefined };
const pageList = new PageList();
const iconObjects = new IconObjects();
const lazyEvaluationFunctions = new LazyEvaluationFunctions();

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
  const target = args.length === 2 || (args.length === 3 && args[1] === undefined) ? inputObjects.getAllIds(args[0]) : inputObjects.getIdsByIndex(args[0], args[1]);
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
  if (getV(name, i) === '' || isNaN(hankakuNumber)) return 0;
  setV(name, i, hankakuNumber.toLocaleString('ja-JP'));
  return hankakuNumber;
}
function setN(...args) {
  if (args.length > 3) throw new Error(`引数が多すぎます。`);
  const name = args[0];
  const index = args.length === 3 ? args[1] : undefined;
  const val = args.slice(-1)[0];
  const tmp = [name, index, val === '' ? '' : Number(val).toLocaleString('ja-JP')].filter(v => v !== undefined);
  if (isNaN(Number(val))) throw new Error(`${name} にセットしようとしている ${val} は数値ではありません`);
  setV(...tmp);
}
function getP(name) {
  return inputObjects.getLengthOfPageListByName(name);
}
function toHan(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[－]/g, "-");
}
function isCheckBox(id) {
  return $('#' + id).prop('tagName') === 'INPUT' && $('#' + id).attr('type') === 'checkbox';
}
function getIds(name, index = undefined) {
  if (index === undefined) return inputObjects.getAllIds(name);
  return inputObjects.getIdsByIndex(name, index);
}
function getSelector(name, index = undefined) {
  return getIds(name, index).map(id => '#' + id).join();
}
function makeSelector(names) {
  return names.map(name => getSelector(name)).filter(v => v).join();
}
function getLabelSelector(name, index = undefined) {
  return getIds(name, index).map(id => '#label' + id).join();
}
function getObjectName(evt) {
  const splitId = evt.currentTarget.id.split('_');
  splitId.shift(); splitId.pop(); splitId.pop();
  return splitId.join('_');
}
function getCheckValue(name, index = 0) {
  return $('#' + inputObjects.getAllIds(name)[index]).prop('checked');
}
function setCheckValue(...args) {
  setV(...args);
}
function getIndexById(id) {
  return inputObjects.getIndexById(id);
}
function getIndexByEvt(evt) {
  return inputObjects.getIndexById(evt.currentTarget.id);
}
function getValueByEvt(evt) {
  return $('#' + evt.currentTarget.id).val();
}

function toWareki(dateString) {
  const date = new Date(dateString.slice(0, 4), dateString.slice(4, 6) - 1, dateString.slice(6, 8));
  const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' }).format(date);
  return [wareki.split('/'), wareki.slice(0, 2), wareki.slice(2).split('/')].flat();
}
function calcPeriod(yearId, monthId, dayId, subMonth, subDay, type = 2) {
  const args = [yearId, monthId, dayId, subMonth, subDay];
  const isValid = args.reduce((acc, cur) => acc || cur === undefined, false);
  if (isValid) return '';
  const toNumber = fieldId => {
    if (Number.isInteger(fieldId)) return fieldId;
    if (Number.isInteger(getV(fieldId))) return getV(fieldId);
    const numString = (getV(fieldId) || '').replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[^0-9]/g, '');
    return Number(numString);
  };
  const japanese2Christian = (yearId, type = 2) => {
    if (Number.isInteger(yearId)) return yearId;
    if ([0, 1988, 2018][type] === null) return;
    return (getV(yearId) === '元' ? 1 : toNumber(yearId)) + [0, 1988, 2018][type];
  };
  const toDoubleDigits = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDoubleDigits(dt.getMonth() + 1), toDoubleDigits(dt.getDate())].join('/');
  const year = japanese2Christian(yearId, type);
  const month = toNumber(monthId);
  const day = toNumber(dayId);
  const ymdIsZero = [year, month, day].map(ymd => ymd !== 0).reduce((acc, cur) => acc && cur);
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
  const isValid = args.reduce((acc, cur) => acc || cur === undefined, false);
  if (isValid) return '';
  const toNumber = fieldId => {
    if (Number.isInteger(fieldId)) return fieldId;
    if (Number.isInteger(getV(fieldId))) return getV(fieldId);
    const numString = (getV(fieldId) || '').replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[^0-9]/g, '');
    return Number(numString);
  };
  const japanese2Christian = (yearId, type = 2) => {
    if (Number.isInteger(yearId)) return yearId;
    if ([0, 1988, 2018][type] === null) return;
    return (getV(yearId) === '元' ? 1 : toNumber(yearId)) + [0, 1988, 2018][type];
  };
  const toDoubleDigits = x => ('0' + x).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDoubleDigits(dt.getMonth() + 1), toDoubleDigits(dt.getDate())].join('/');
  const year = japanese2Christian(yearId, type);
  const month = toNumber(monthId);
  const day = toNumber(dayId);
  const ymdIsZero = [year, month, day].map(ymd => ymd !== 0).reduce((acc, cur) => acc && cur);
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
    if (type === 'SHRSH'
      && (getMaster('TENANT_ID') === getMaster('CREATED_TENANT_ID')
        || inputObjects.objExists('IS_MANUAL') && getCheckValue('IS_MANUAL'))
    ) return;
    companyMaster.setAllMasterByType(type);
  });
  if (getMaster('TENANT_ID') !== getMaster('CREATED_TENANT_ID') && inputObjects.objExists('IS_MANUAL')) {
    if (!getCheckValue('IS_MANUAL')) setV('SHRSH_NUM', getV('LSS_ATTORNEY_REGIST_NUMBER') === '' ? getV('S_LSS_ATTORNEY_REGIST_NUMBER') : getV('LSS_ATTORNEY_REGIST_NUMBER'));
    $(getSelector('IS_MANUAL')).on('click', () => {
      if (!getCheckValue('IS_MANUAL')) {
        companyMaster.setAllMasterByType('SHRSH');
        setV('SHRSH_NUM', getV('LSS_ATTORNEY_REGIST_NUMBER') === '' ? getV('S_LSS_ATTORNEY_REGIST_NUMBER') : getV('LSS_ATTORNEY_REGIST_NUMBER'));
      }
    });
  }
  if (inputObjects.objExists('LSIO') && inputObjects.objExists('ROUKI_NAME') && getV('LSIO') !== '') setV('ROUKI_NAME', getV('LSIO').split('労働基準監督署')[0]);
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
    radioButtons.list[groupName].setCorrectMark();
  });
}

function onLoadDocumentEmployeesList(employees) {
  if (!inputObjects.objExists('DOCUMENT_EMPLOYEES_LIST')) {
    console.warn(`DOCUMENT_EMPLOYEES_LISTは存在しないオブジェクト`);
    return;
  }
  if (!inputObjects.objExists('PREVIOUS_DOC_EMP_LIST')) {
    console.warn(`PREVIOUS_DOC_EMP_LISTは存在しないオブジェクト`);
    return;
  }
  const docEmpContents = new DocumentEmployeesContents(employees);
  // 配列を利用して書類の内容を上書き
  Object.keys(employees.list).forEach(key => {
    [...Array(employees.max)].forEach((_, i) => {
      let objList = employees.list[key](i);
      if (!Array.isArray(objList)) objList = [objList];
      objList.forEach(obj => {
        if (obj.page < inputObjects.getLengthOfPageListByName(obj.name) || obj.page === undefined)
          setV(obj.name, obj.page, docEmpContents.getEmployeesValue(i, key));
      });
    });
  });
  setV('PREVIOUS_DOC_EMP_LIST', getV('DOCUMENT_EMPLOYEES_LIST'));
}

function onLoadIcon(iconSetting) {
  iconObjects.showIcon(iconSetting);
}

function onClickCopyPageButton() {
  $('#COPY_PAGE_BUTTON').on('click', (evt) => {
    const parent = $(evt.currentTarget).parent();
    const page = parent.attr('id').split('_')[3] - 1;
    inputObjects.getObjListByPage(page).forEach(obj => {
      if (documentEmployees.objNameSet.has(obj.name)) return;
      setV(obj.name, getIndexById(obj.id), getV(obj.name, 0));
    });
    lazyEvaluationFunctions.onLoad();
  });
}

function setFocusColor() {
  const fieldTabIdSelector = inputObjects.getAllObjNameList().map(name => {
    if (iconObjects.getNameList().map(v => v === name).reduce((a, b) => a || b)) return;
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
    const result = names.map(name => [...ss.cssRules].find(rule => rule.selectorText && rule.selectorText.indexOf(name) !== -1));
    result.forEach(x => { if (x) x.style.visibility = ''; });
    return result.reduce((x, y) => x && y);
  });
}

function toggleCSVLabel() {
  let isVisible = false;
  return () => {
    isVisible = !isVisible;
    $('#SHOW_CSV_NUM_BUTTON').text(!isVisible ? 'CSV番号を表示する' : 'CSV番号を隠す');
    $('.csv-num').css('visibility', !isVisible ? 'hidden' : '');
  }
}

function createCSVLabel() {
  const callToggleCSVLabel = toggleCSVLabel();
  $('#SHOW_CSV_NUM_BUTTON').on('click', (evt) => {
    callToggleCSVLabel();
  });
  const xmlDataMap = JSON.parse($('input[name="xmlDataMap"]').val());
  const csvObjs = Object.keys(xmlDataMap).filter(key => {
    return xmlDataMap[key].split('_')[0] === 'OBJ';
  }).map(key => key);
  const cssPrp = {
    'background': 'rgba(68,201,194,1)',
    'color': 'white',
    'position': 'absolute',
    'align-items': 'center',
    'font-weight': 'bold',
    'font-family': 'メイリオ',
    'display': 'flex',
    'justify-content': 'center',
    'align-items': 'center'
  };
  // CSV項目の中で hidden に設定されているオブジェクトを探す
  const hiddenObj = csvObjs.map((csv, i) => {
    const isHidden = [...document.styleSheets].some(ss => {
      return [...ss.cssRules].some(rule => rule.selectorText && rule.selectorText.indexOf(csv) !== -1 && rule.style.visibility === 'hidden');
    });
    return isHidden ? undefined : csv;
  });
  hiddenObj.forEach((csv, i) => {
    if (csv === undefined) return;
    const csvDiv = ['width', 'left', 'top', 'visibility'].reduce((target, cur) => {
      if (cur === 'visibility') target.css(cur, 'hidden');
      else target.css(cur, $(getSelector(csv)).css(cur));
      return target;
    }, $('<div>'));
    const fontSize = Math.min(($(getSelector(csv)).css('width').split('px')[0] - 2) / (i.toString().length), $(getSelector(csv)).css('height').split('px')[0] - 2);
    csvDiv.css('line-height', `${$(getSelector(csv)).css('height').split('px')[0]}px`);
    csvDiv.css('font-size', `${fontSize}px`);
    csvDiv.addClass('csv-num');
    Object.keys(cssPrp).forEach(key => csvDiv.css(key, cssPrp[key]));
    csvDiv.text(i + 1);
    $(getSelector(csv)).after(csvDiv);
  });
}

function makeArray(num, prefix, first, deference) {
  return [...Array(num)].map((_, i) => `${prefix}${first + i * deference} `);
}

function showDocInfo() {
  console.log(`フォーム名：${$('input[name="jobName"]').val()} `);
  console.log(`ライブラリ名：${$('script[src*="form_lib"]').attr('src').split('/').find(v => v.indexOf('form_lib_') > -1).split('?')[0]} `);
}

function initializeInstances() {
  inputObjects.initialize();
  radioButtons.initialize();
  companyMaster.initialize();
  documentEmployees.initialize();
  pageList.initialize();
}