class InputObjects {
  initialize() {
    const maxPageNum = 50;
    this.objListByPage = [...Array(maxPageNum)].map(() => []);
    this.list = allObj.reduce((acc, id) => {
      const target = acc;
      const splitId = id.split('_');
      splitId.shift(); splitId.pop();
      const page = +splitId.pop();
      const objName = splitId.join('_');
      this.objListByPage[page].push({ name: objName, id });
      if (!target[objName]) target[objName] = new InputObjectsByName();
      target[objName].register(id, page);
      return target;
    }, {});
  }

  getAllObjNameList() {
    return Object.keys(this.list);
  }

  getObjByName(name) {
    if (this.list[name] === undefined) {
      console.warn(`${name} は存在しないオブジェクト`);
      return new InputObjectsByName();
    }
    return this.list[name];
  }

  getAllIds(name) {
    return this.getObjByName(name).objList;
  }

  getLengthOfPageListByName(name) {
    return this.getObjByName(name).pageList.filter(v => v.length !== 0).length;
  }

  getIdsbyPage(name, page) {
    if (this.getObjByName(name).pageList[page] === undefined) {
      console.warn(`${page} ページ目に ${name} は存在しない`);
      return [];
    }
    return this.getObjByName(name).pageList[page];
  }

  getIdsByIndex(name, index) {
    const list = this.getObjByName(name).pageList.filter(v => v.length !== 0);
    if (list[index] === undefined) {
      console.warn(`${name} が存在するページ数は ${index + 1} より少ない`);
      return [];
    }
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
    this.pageList = [...Array(maxPageNum)].map(() => []);
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
  initialize() {
    this.list = $('[id^="iftc_cf_page_"]');
    this.addPages = this.getIndexOfAddPages();
    this.frontPages = this.getIndexOfFrontPages();
    this.length = this.list.length;
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

  getIndexOfFrontPages() {
    const tmp = new Set();
    const notFrontPageWord = ['hidden', 'rear'];
    const ret = [...this.list]
      .map(v => (
        {
          id: v.id,
          class: [...v.classList.values()].find(s => s.indexOf('iftc_cf_form_') > -1),
        }
      )).map((obj, i) => {
        if (notFrontPageWord.map(w => obj.class.indexOf(w) > -1)
          .reduce((a, b) => a || b)) return false;
        if (tmp.has(obj.class)) return false;
        tmp.add(obj.class);
        return i + 1;
      }).filter(v => v !== false);
    return ret;
  }

  isFrontPage(units) {
    return units.map(unit => {
      const isFront = this.frontPages.some(v => unit === v);
      if (!isFront) console.warn(`ユニット番号 ${unit} は隠しページまたは裏面なのでアイコンまたはボタンを表示できません。`);
      return isFront;
    }).reduce((a, b) => a || b);
  }

  getLength() {
    return this.length;
  }
}

class IconObjects {
  constructor() {
    this.iconList = {
      acrossYears: {
        name: 'CAPTION_ACROSS_YEARS',
        string: '前年度から複製可能',
        color: 'rgba(230,100,0,1)',
        iconType: 'label',
        isEnabled: iconSetting => iconSetting.acrossYears,
        getPages: () => [2],
      },
      addPage: {
        name: 'CAPTION_COPY_PAGE',
        string: 'ページ追加可能',
        color: 'rgba(190,0,0,1)',
        iconType: 'label',
        isEnabled: iconSetting => Array.isArray(iconSetting.addPage) && iconSetting.addPage.length !== 0 && pageList.isFrontPage(iconSetting.addPage),
        getPages: iconSetting => iconSetting.addPage,
      },
      inputEmployees: {
        name: 'CAPTION_INPUT_EMPLOYEES',
        string: '従業員参照可能',
        color: 'rgba(0,30,100,1)',
        iconType: 'label',
        isEnabled: iconSetting => Array.isArray(iconSetting.inputEmployees) && iconSetting.inputEmployees.length !== 0 && pageList.isFrontPage(iconSetting.inputEmployees),
        getPages: iconSetting => iconSetting.inputEmployees,
      },
      copyPage1: {
        name: 'COPY_PAGE_BUTTON',
        string: '1ページ目引用',
        color: 'rgba(68,201,194,1)',
        iconType: 'button',
        isEnabled: () => pageList.addPages.length > 0,
        getPages: () => pageList.addPages,
      },
      csvNum: {
        name: 'SHOW_CSV_NUM_BUTTON',
        string: 'CSV番号を表示する',
        color: 'rgba(68,201,194,1)',
        iconType: 'button',
        isEnabled: () => true,
        getPages: () => [2],
      },
    };
  }

  showIcon(iconSetting) {
    const iconsByPage = [...Array(pageList.getLength())].map(_ => Array(1));

    Object.keys(this.iconList).forEach(iconName => {
      const target = this.iconList[iconName];
      if (target.isEnabled(iconSetting)) target.getPages(iconSetting).forEach(index => iconsByPage[index - 1].push(iconName));
    });
    const veticalPosition = iconSetting.varticalPositions.reduce((acc, [index, position]) => {
      const target = acc;
      target[index - 1] = position;
      return target;
    }, {});
    iconsByPage.forEach((icons, i) => {
      if (icons.length === 0) return;
      const $labelsDiv = $('<div>');
      $labelsDiv.css('padding', '10pt');
      $labelsDiv.css('display', 'flex');
      $labelsDiv.css('text-align', 'left');
      $labelsDiv.css('width', '50%');
      const $buttonsDiv = $('<div>');
      $buttonsDiv.css('padding', '10pt');
      $buttonsDiv.css('display', 'flex');
      $buttonsDiv.css('justify-content', 'end');
      $buttonsDiv.css('width', '50%');

      icons.forEach(icon => {
        const iconDiv = IconObjects.#makeIconDiv(this.iconList[icon]);
        const $tmp = iconDiv.clone();
        if (this.iconList[icon].iconType === 'label') $labelsDiv.append($tmp);
        if (this.iconList[icon].iconType === 'button') {
          $tmp.css('float', 'right');
          $buttonsDiv.append($tmp);
        }
      });
      const $iconsDiv = $('<div>');
      $iconsDiv.attr('id', 'ICONS_DIV');
      $iconsDiv.css('display', 'flex');
      $iconsDiv.css('width', '595pt');
      $iconsDiv.css('height', '40pt');
      const id = pageList.indexToSelector(i).children('[class~="iftc_cf_inputitems"]').attr('id');
      $iconsDiv.css('position', 'absolute');
      const inputAreaCSS = IconObjects.#getPtValueFromStylesheets(`#${id}`);
      const inputAreaTop = Number(inputAreaCSS?.top.split('pt')[0] || 0);
      $iconsDiv.css('top', `${(veticalPosition[i] !== undefined ? veticalPosition[i] : 0) - inputAreaTop}pt`);
      const inputAreaLeft = Number(inputAreaCSS?.left.split('pt')[0] || 0);
      $iconsDiv.css('left', `${-inputAreaLeft}pt`);
      $iconsDiv.append($labelsDiv);
      $iconsDiv.append($buttonsDiv);

      pageList.indexToSelector(i).children('[class~="iftc_cf_inputitems"]').append($iconsDiv);
    });
  }

  static #makeIconDiv(target) {
    const fontSize = 8;
    const iconDiv = $('<div>');
    iconDiv.prop('type', 'button');
    iconDiv.prop('tabindex', '-1');
    iconDiv.css('margin', '0pt 2pt');
    iconDiv.css('cursor', target.iconType === 'button' ? 'pointer' : 'default');
    iconDiv.css('font-weight', 'bold');
    iconDiv.css('font-family', 'メイリオ');
    iconDiv.css('padding', '2pt 0pt');
    iconDiv.css('font-size', `${fontSize}pt`);
    iconDiv.css('color', target.iconType === 'label' ? target.color : 'white');
    iconDiv.css('background', target.iconType === 'label' ? 'white' : target.color);
    iconDiv.css('border', `solid 2px ${target.color}`);
    iconDiv.css('border-radius', '5px');
    iconDiv.css('text-align', 'center');
    iconDiv.css('display', 'inline-block');
    iconDiv.css('width', `${(target.string.length + 2) * fontSize}pt`);
    iconDiv.attr('id', target.name);
    iconDiv.text(target.string);
    return iconDiv;
  }

  static #getPtValueFromStylesheets(selector) {
    let result;
    [...document.styleSheets].some(styleSheet => [...styleSheet.cssRules].some(rule => {
      if (rule.selectorText === selector) {
        result = rule.style;
        return true;
      }
      return false;
    }));
    return result;
  }
}

class RadioButtons {
  initialize() {
    this.list = inputObjects.getAllObjNameList().reduce((cur, name) => {
      const target = cur;
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
    splitName.pop();
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

  getRadioGroup(name) {
    if (!this.radioExists(name)) {
      console.warn(`getRadioGroup: ${name} は存在しないラジオボタングループ`);
      return {};
    }
    return this.list[name];
  }

  setMark(name, mark, unmark) {
    if (!this.radioExists(name)) {
      console.warn(`setMark: ${name} は存在しないラジオボタングループ`);
      return;
    }
    this.list[name].setMark(mark, unmark);
  }

  countButtons(name) {
    if (!this.radioExists(name)) {
      console.warn(`countButtons: ${name} は存在しないラジオボタングループ`);
      return {};
    }
    return this.getRadioGroup(name).countButtons();
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
    return Object.keys(this.reverseList)
      .find(num => getV(this.reverseList[num], index) === this.mark);
  }

  setCorrectMark() {
    const isWrong = this.getAllButtonNameList()
      .map(name => getV(name) === this.mark).filter(v => v).length > 1;
    if (isWrong) this.getAllButtonNameList().forEach(name => {
      const init = $(getSelector(name)).attr('data-init-value');
      if (init === undefined) setV(name, this.unmark);
    });
  }

  countButtons() {
    return Object.keys(this.buttonList).length;
  }
}

class CompanyMaster {
  constructor() {
    const hasObjPrefix = {
      SHRSH: {
        masterPrefix: 'S_BUSINESS_OWNER_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE',
          AD1: 'ADDRESS_1',
          AD2: 'ADDRESS_2',
          OFFICE: 'NAME',
          TEL: 'TEL',
          POST1: 'POSTAL_CODE_1',
          POST2: 'POSTAL_CODE_2',
          TEL1: 'TEL_1',
          TEL2: 'TEL_2',
          TEL3: 'TEL_3',
        },
        noMasterPrefix: {
          POSITION: 'LSS_ATTORNEY_POST',
          OWNER: 'LSS_ATTORNEY_FULL_NAME',
          NUM: 'SHRSH_NUM',
        },
      },
      JGYNSH: {
        masterPrefix: 'BUSINESS_OWNER_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE',
          AD1: 'ADDRESS_1',
          AD2: 'ADDRESS_2',
          OFFICE: 'NAME',
          NAME: 'POST_FULL_NAME',
          TEL: 'TEL',
          POST1: 'POSTAL_CODE_1',
          POST2: 'POSTAL_CODE_2',
          POSITION: 'POST',
          OWNER: 'REPRESENT_FULL_N',
          TEL1: 'TEL_1',
          TEL2: 'TEL_2',
          TEL3: 'TEL_3',
        },
        noMasterPrefix: {},
      },
      OFF: {
        masterPrefix: 'OFFICE_',
        hasMasterPrefix: {
          POST: 'POSTAL_CODE',
          AD1: 'ADDRESS_1',
          AD2: 'ADDRESS_2',
          NAME: 'NAME',
          TEL: 'TEL',
          POST1: 'POSTAL_CODE_1',
          POST2: 'POSTAL_CODE_2',
          TEL1: 'TEL_1',
          TEL2: 'TEL_2',
          TEL3: 'TEL_3',
        },
        noMasterPrefix: {},
      },
      TNTSH: {
        masterPrefix: 'RESPONSIBLE_',
        hasMasterPrefix: {
          NAME: 'FULL_NAME',
          AFFILIATION: 'AFFILIATION',
          TEL: 'TEL',
          FAX: 'FAX',
          MAIL: 'MAIL_ADDRESS',
          TEL1: 'TEL_1',
          TEL2: 'TEL_2',
          TEL3: 'TEL_3',
          FAX1: 'FAX_1',
          FAX2: 'FAX_2',
          FAX3: 'FAX_3',
          MAIL1: 'MAIL_ADDRESS_1',
          MAIL2: 'MAIL_ADDRESS_2',
        },
        noMasterPrefix: {},
      },
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
      ROUKI_NAME: 'LSIO',
    };
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
      return '';
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
    return Object.keys(this[type]).map(key => `${type === 'OTHER' ? '' : `${type}_`}${key}`);
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
    return this.list.map(v => ({ id: v.id }));
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
    if (keyName === 'birthday' || keyName === 'hire_date') return toWareki(notSplitValue)[keyNum];
    if (keyName === 'employment_insurance_number') return notSplitValue.split('-')[keyNum];
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
      if (this.previous.length > i) return { id: this.previous[i].id };
      return {};
    });
    // 現在の書類の内容と合成
    Object.keys(employees.list).forEach(key => {
      [...Array(employees.max ?? 0)].forEach((_, i) => {
        let obj = employees.list[key](i);
        if (!obj) return;
        if (Array.isArray(obj)) [obj] = obj;
        if (!obj?.name) return;
        if (obj.page === undefined
          || obj.page < getP(obj.name)) previousDocEmpContents[i][key] = getV(obj.name, obj.page);
      });
    });
    // DOCUMENT_EMPLOYEES_LIST に存在しない ID のデータを削除
    const subDocEmpcontents = previousDocEmpContents
      .filter(v => v.id === undefined || documentEmployees.containsId(v.id));
    const sublength = previousDocEmpContents.length - subDocEmpcontents.length;
    const docEmpContents = subDocEmpcontents.concat([...Array(sublength)].map(() => ({})));
    // DOCUMENT_EMPLOYEES_LIST の内容で上書き
    docEmpContents.forEach((_, i) => {
      Object.keys(employees.list).forEach(key => {
        if (documentEmployees.contains(i, key)) {
          docEmpContents[i][key] = documentEmployees.getEmployeesValue(i, key);
          let objs = employees.list[key](i);
          if (!objs) return;
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

class DMXMapping {
  initialize() {
    this.xmlDataMap = JSON.parse($('input[name="xmlDataMap"]').val());
    this.CSVObjList = Object.keys(this.xmlDataMap).filter(key => this.xmlDataMap[key].split('_')[0] === 'OBJ').map(key => key);
    this.JSObjList = Object.keys(this.xmlDataMap).filter(key => this.xmlDataMap[key].split('_')[0] === 'JS').map(key => key);
    this.JSObjList.forEach(obj => {
      if (!inputObjects.objExists(obj)) console.warn(`DMXMapping: ${obj} は不要なマッピング`);
    });
  }

  getCSVObjList() {
    return this.CSVObjList;
  }

  getJSObjList() {
    return this.JSObjList;
  }

  getUnmappedObjList() {
    console.log('マッピングされてない項目');
    inputObjects.getAllObjNameList().forEach(name => {
      if (this.xmlDataMap[name] === undefined) console.log(`${name}`);
    });
  }
}

class LazyEvaluationFunctions {
  setFunction(name, func) {
    if (func === undefined) this[name] = () => { console.warn(`lazyEvaluationFunctions.${name} は未定義`); };
    this[name] = func;
  }
}

const inputObjects = new InputObjects();
const radioButtons = new RadioButtons();
const companyMaster = new CompanyMaster();
const documentEmployees = new DocumentEmployees();
// eslint-disable-next-line no-unused-vars
const documentEmployeesContents = { initialize: () => undefined };
const pageList = new PageList();
const iconObjects = new IconObjects();
const lazyEvaluationFunctions = new LazyEvaluationFunctions();
const dmxMapping = new DMXMapping();

// 汎用関数
// eslint-disable-next-line no-unused-vars
function getV(name, index) {
  if (radioButtons.radioExists(name)) return radioButtons.list[name].getRadioButtonValue(index);
  const id = inputObjects.getIdsByIndex(name, index ?? 0)[0];
  if (isCheckBox(id)) return $(`#${id}`).prop('checked');
  return $(`#${id}`).val();
}
// eslint-disable-next-line no-unused-vars
function setV(...args) { // (name, val) or (name, index, val)
  const target = args.length === 2 || (args.length === 3 && args[1] === undefined)
    ? inputObjects.getAllIds(args[0]) : inputObjects.getIdsByIndex(args[0], args[1]);
  const val = args.slice(-1)[0];
  target.forEach(id => {
    if (isCheckBox(id)) {
      const display = val ? 'inline' : 'none';
      $(`#label${id} svg`).attr('style', `display: ${display};`);
      $(`#${id}`).prop('checked', val);
      return;
    }
    $(`#${id}`).val(val);
  });
}
// eslint-disable-next-line no-unused-vars
function getMaster(name) { return companyMaster.getMaster(name); }
// eslint-disable-next-line no-unused-vars
function getN(name, i) {
  const hankakuNumber = Number(toHan(getV(name, i)).replace(/,/g, ''));
  if (getV(name, i) === '' || Number.isNaN(hankakuNumber)) return 0;
  setV(name, i, hankakuNumber.toLocaleString('ja-JP'));
  return hankakuNumber;
}
// eslint-disable-next-line no-unused-vars
function setN(...args) {
  if (args.length > 3) {
    console.warn('引数が多すぎます。');
    return;
  }
  const name = args[0];
  const index = args.length === 3 ? args[1] : undefined;
  const val = args.slice(-1)[0];
  if (Number.isNaN(Number(val))) console.warn(`${name} にセットしようとしている ${val} は数値ではありません`);
  const tmp = Number.isNaN(Number(val)) ? val.toString().replace(/[^0-9]/g, '') : Number(val).toLocaleString('ja-JP');
  const ret = [name, index, val === '' ? '' : tmp].filter(v => v !== undefined);
  setV(...ret);
}
// eslint-disable-next-line no-unused-vars
function getP(name) {
  return inputObjects.getLengthOfPageListByName(name);
}
// eslint-disable-next-line no-unused-vars
function toHan(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[－]/g, '-');
}
// eslint-disable-next-line no-unused-vars
function isCheckBox(id) {
  return $(`#${id}`).prop('tagName') === 'INPUT' && $(`#${id}`).attr('type') === 'checkbox';
}
// eslint-disable-next-line no-unused-vars
function getIds(name, index = undefined) {
  if (index === undefined) return inputObjects.getAllIds(name);
  return inputObjects.getIdsByIndex(name, index);
}
// eslint-disable-next-line no-unused-vars
function getSelector(name, index = undefined) {
  return getIds(name, index).map(id => `#${id}`).join();
}
// eslint-disable-next-line no-unused-vars
function makeSelector(names) {
  return names.map(name => getSelector(name)).filter(v => v).join();
}
// eslint-disable-next-line no-unused-vars
function getLabelSelector(name, index = undefined) {
  return getIds(name, index).map(id => `#label${id}`).join();
}
// eslint-disable-next-line no-unused-vars
function getObjectName(evt) {
  const splitId = evt.currentTarget.id.split('_');
  splitId.shift(); splitId.pop(); splitId.pop();
  return splitId.join('_');
}
// eslint-disable-next-line no-unused-vars
function getCheckValue(name, index = 0) {
  return $(`#${inputObjects.getAllIds(name)[index]}`).prop('checked');
}
// eslint-disable-next-line no-unused-vars
function setCheckValue(...args) {
  setV(...args);
}
// eslint-disable-next-line no-unused-vars
function getIndexById(id) {
  return inputObjects.getIndexById(id);
}
// eslint-disable-next-line no-unused-vars
function getIndexByEvt(evt) {
  return inputObjects.getIndexById(evt.currentTarget.id);
}
// eslint-disable-next-line no-unused-vars
function getValueByEvt(evt) {
  return $(`#${evt.currentTarget.id}`).val();
}
// eslint-disable-next-line no-unused-vars
function toWareki(dateString) {
  const date = new Date(dateString.slice(0, 4), dateString.slice(4, 6) - 1, dateString.slice(6, 8));
  const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' }).format(date);
  return [wareki.split('/'), wareki.slice(0, 2), wareki.slice(2).split('/')].flat();
}
// eslint-disable-next-line no-unused-vars
function getDateFromFieldId(yearId, monthId, dayId, type = 2) {
  const toNumber = fieldId => {
    if (Number.isInteger(fieldId)) return fieldId;
    if (Number.isInteger(getV(fieldId))) return getV(fieldId);
    const numString = (getV(fieldId) || '').replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/[^0-9]/g, '');
    return Number(numString);
  };
  const japanese2Christian = (id, t = 2) => {
    if (Number.isInteger(id)) return id;
    if ([0, 1988, 2018][t] === null) return id;
    return (getV(id) === '元' ? 1 : toNumber(id)) + [0, 1988, 2018][t];
  };
  const result = {
    year: japanese2Christian(yearId, type),
    month: toNumber(monthId),
    day: toNumber(dayId),
  };
  return result;
}
// eslint-disable-next-line no-unused-vars
function calculateDeadline(year, month, day, subMonth, subDay) {
  const toDoubleDigits = x => (`0${x}`).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDoubleDigits(dt.getMonth() + 1), toDoubleDigits(dt.getDate())].join('/');
  const refDt = new Date(Number(year), Number(month) - 1, Number(day) + subDay);
  const lastDay = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth + 1, 0);
  let result;
  if (refDt.getDate() > lastDay.getDate()) result = lastDay;
  else result = new Date(refDt.getFullYear(), refDt.getMonth() + subMonth, refDt.getDate() + (subMonth <= 0 ? 0 : -1));
  return toDateField(result);
}
// eslint-disable-next-line no-unused-vars
function calcPeriod(yearId, monthId, dayId, subMonth, subDay, type) {
  const args = [yearId, monthId, dayId, subMonth, subDay];
  const isValid = args.reduce((acc, cur) => acc || cur === undefined, false);
  if (isValid) return '';
  const date = getDateFromFieldId(yearId, monthId, dayId, type);
  const ymdIsZero = [date.year, date.month, date.day].map(ymd => ymd !== 0).reduce((acc, cur) => acc && cur);
  if (!ymdIsZero) return '';
  return calculateDeadline(date.year, date.month, date.day, subMonth, subDay);
}
// eslint-disable-next-line no-unused-vars
function calcPeriodFromDate(dateId, subMonth = 0, subDay = 0) {
  if (!dateId) return '';
  if (!getV(dateId)) return '';
  const splitDate = getV(dateId).split('/');
  return calculateDeadline(splitDate[0], splitDate[1], splitDate[2], subMonth, subDay);
}
// eslint-disable-next-line no-unused-vars
function calculateSubstractDate(year, month, day, subMonth, subDay) {
  const toDD = x => (`0${x}`).slice(-2);
  const toDateField = dt => [dt.getFullYear(), toDD(dt.getMonth() + 1), toDD(dt.getDate())].join('/');
  const result = new Date(Number(year), Number(month) - 1 + subMonth, Number(day) + subDay);
  return toDateField(result);
}
// eslint-disable-next-line no-unused-vars
function calcSubDate(yearId, monthId, dayId, subMonth, subDay, type) {
  const args = [yearId, monthId, dayId, subMonth, subDay];
  const isValid = args.reduce((acc, cur) => acc || cur === undefined, false);
  if (isValid) return '';
  const date = getDateFromFieldId(yearId, monthId, dayId, type);
  const ymdIsZero = [date.year, date.month, date.day].map(ymd => ymd !== 0).reduce((acc, cur) => acc && cur);
  if (!ymdIsZero) return '';
  return calculateSubstractDate(date.year, date.month, date.day, subMonth, subDay);
}
// eslint-disable-next-line no-unused-vars
function calcSubDateFromDate(dateId, subMonth = 0, subDay = 0) {
  if (!dateId) return '';
  if (!getV(dateId)) return '';
  const splitDate = getV(dateId).split('/');
  return calculateSubstractDate(splitDate[0], splitDate[1], splitDate[2], subMonth, subDay);
}

// Load 時実行
// eslint-disable-next-line no-unused-vars
function onLoadCompanyMaster() {
  setV('JGYNSHBIRTHDAY_Y', getMaster('JGYNSHBIRTHDAY').slice(0, 4));
  setV('JGYNSHBIRTHDAY_M', getMaster('JGYNSHBIRTHDAY').slice(4, 6));
  setV('JGYNSHBIRTHDAY_D', getMaster('JGYNSHBIRTHDAY').slice(6, 8));
  Object.keys(companyMaster).forEach(type => {
    if (type === 'SHRSH' && (getMaster('TENANT_ID') === getMaster('CREATED_TENANT_ID') || (inputObjects.objExists('IS_MANUAL') && getCheckValue('IS_MANUAL')))) return;
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
// eslint-disable-next-line no-unused-vars
function onLoadRadioButton() {
  radioButtons.getAllGroupNameList().forEach(groupName => {
    radioButtons.list[groupName].getAllButtonNameList().forEach(name => {
      const num = getP(name);
      [...Array(num)].forEach((_, i) => {
        $(getSelector(name, i)).off('click.initializeButton').on('click.initializeButton', () => {
          radioButtons.onClickRadioButtonL(name, i);
          $(getSelector(name, i)).each((_i, elm) => {
            if (!/[a-z]/.test($(elm).attr('name'))) radioButtons.list[groupName].synchronizeButton(i);
          });
        });
      });
    });
    radioButtons.list[groupName].setCorrectMark();
  });
}
// eslint-disable-next-line no-unused-vars
function onLoadDocumentEmployeesList(employees) {
  if (!inputObjects.objExists('DOCUMENT_EMPLOYEES_LIST')) {
    console.warn('DOCUMENT_EMPLOYEES_LISTは存在しないオブジェクト');
    return;
  }
  if (!inputObjects.objExists('PREVIOUS_DOC_EMP_LIST')) {
    console.warn('PREVIOUS_DOC_EMP_LISTは存在しないオブジェクト');
    return;
  }
  const docEmpContents = new DocumentEmployeesContents(employees);
  // 配列を利用して書類の内容を上書き
  Object.keys(employees.list).forEach(key => {
    [...Array(employees.max)].forEach((_, i) => {
      const value = docEmpContents.getEmployeesValue(i, key);
      let objList = employees.list[key](i);
      if (!objList) return;
      if (!Array.isArray(objList)) objList = [objList];
      objList.forEach(obj => {
        if (!obj?.name) return;
        if (obj.page < getP(obj.name) || obj.page === undefined) setV(obj.name, obj.page, value);
      });
    });
  });
  setV('PREVIOUS_DOC_EMP_LIST', getV('DOCUMENT_EMPLOYEES_LIST'));
}
// eslint-disable-next-line no-unused-vars
function onLoadIcon(iconSetting) {
  iconObjects.showIcon(iconSetting);
  onClickCopyPageButton();
  createCSVLabel();
}
// eslint-disable-next-line no-unused-vars
function onClickCopyPageButton() {
  $(document).on('click', '#COPY_PAGE_BUTTON', evt => {
    const parent = $(evt.currentTarget).parent().parent().parent();
    const page = parent.attr('id').split('_')[3] - 1;
    inputObjects.getObjListByPage(page).forEach(obj => {
      if (documentEmployees.objNameSet.has(obj.name)) return;
      setV(obj.name, getIndexById(obj.id), getV(obj.name, 0));
    });
    lazyEvaluationFunctions.onLoad();
  });
}
// eslint-disable-next-line no-unused-vars
function setFocusColor() {
  const fieldTabIdSelector = inputObjects.getAllObjNameList().map(name => inputObjects
    .getAllIds(name).map(id => {
      if ($(`#${id} `).attr('tabindex') > 0) return `#${id} `;
      return undefined;
    }).filter(v => v).join()).filter(v => v).join();
  const focusColor = 'rgba(155,185,225,0.75)';
  const fieldTabColor = 'rgba(199,218,244,0.5)';
  // 手入力可能なフィールドに色を付ける。
  $(fieldTabIdSelector).css('background', fieldTabColor);
  // フォーカスのあたっているフィールドに色を付ける。
  $(fieldTabIdSelector).on({
    focus: evt => $(evt.target).css('background', focusColor),
    blur: evt => $(evt.target).css('background', fieldTabColor),
  });
}
// eslint-disable-next-line no-unused-vars
function visualizeObj(captionList = [], inputList = [], labelList = []) {
  const log = n => console.warn(`visualizeObj: ${n} は存在しないラベル`);
  [...document.styleSheets].some(ss => {
    const captionObj = captionList.map(n => {
      if (inputObjects.objExists(n)) return getSelector(n);
      log(n);
      return '';
    }).filter(v => v).join().split(',');
    $(captionObj.join()).prop('disabled', true);
    $(captionObj.join()).css('font-weight', 'bold');
    const inputObj = inputList.map(n => {
      if (inputObjects.objExists(n)) return getSelector(n);
      log(n);
      return '';
    }).filter(v => v).join().split(',');
    const lableObj = labelList.map(n => {
      if (inputObjects.objExists(n)) return getLabelSelector(n);
      log(n);
      return '';
    }).filter(v => v);
    const names = [captionObj, inputObj, lableObj].flat();
    const result = names.map(name => [...ss.cssRules]
      .find(rule => rule.selectorText && rule.selectorText.indexOf(name) !== -1));
    result.forEach(x => { if (x) x.style.visibility = ''; });
    return result.reduce((x, y) => x && y);
  });
}
// eslint-disable-next-line no-unused-vars
function toggleCSVLabel() {
  let isVisible = false;
  return () => {
    isVisible = !isVisible;
    $('#SHOW_CSV_NUM_BUTTON').text(!isVisible ? 'CSV番号を表示する' : 'CSV番号を隠す');
    $('.csv-num').css('visibility', !isVisible ? 'hidden' : '');
  };
}
// eslint-disable-next-line no-unused-vars
function createCSVLabel() {
  const callToggleCSVLabel = toggleCSVLabel();
  $('#SHOW_CSV_NUM_BUTTON').on('click', () => {
    callToggleCSVLabel();
  });
  const csvObjList = dmxMapping.getCSVObjList();
  const cssPrp = {
    background: 'rgba(68,201,194,1)',
    color: 'white',
    position: 'absolute',
    'align-items': 'center',
    'font-weight': 'bold',
    'font-family': 'メイリオ',
    display: 'flex',
    'justify-content': 'center',
  };
  // CSV項目の中で hidden に設定されているオブジェクトを udefined に設定する。
  const visibleObj = csvObjList.map((csv, i) => {
    if (!inputObjects.objExists(csv)) {
      console.warn(`CSV番号 ${i + 1} 番: ${csv} は存在しないオブジェクト`);
      return undefined;
    }
    const isHidden = [...document.styleSheets].some(ss => [...ss.cssRules]
      .some(rule => rule.selectorText && rule.selectorText.indexOf(csv) !== -1 && rule.style.visibility === 'hidden'));
    if (isHidden) {
      console.warn(`CSV番号 ${i + 1} 番: ${csv} は欄外のオブジェクト`);
      return undefined;
    }
    return csv;
  });
  visibleObj.forEach((csv, i) => {
    if (csv === undefined) return;
    const maxFontSizePt = '14pt';
    const tmpDiv = $('<div>');
    tmpDiv.css('font-size', maxFontSizePt);
    tmpDiv.attr('id', 'tmp-div');
    $('#iftc_cf_page_1').after(tmpDiv);
    const maxFontSizePx = Number($('#tmp-div').css('font-size').split('px')[0]);
    $(getSelector(csv)).each((_, elm) => {
      const csvDiv = ['width', 'left', 'top', 'visibility'].reduce((target, cur) => {
        if (cur === 'visibility') target.css(cur, 'hidden');
        else target.css(cur, $(elm).css(cur));
        return target;
      }, $('<div>'));
      const minFontSize = Math.min(($(elm).css('width').split('px')[0]) / ((i + 1).toString().length), $(elm).css('height').split('px')[0] - 2);
      const fontSize = Math.min(minFontSize, maxFontSizePx);
      const topPadding = 2;
      csvDiv.css('line-height', `${$(elm).css('height').split('px')[0] - topPadding}px`);
      csvDiv.css('padding', `${topPadding}px 0px 0px`);
      csvDiv.css('font-size', `${fontSize}px`);
      csvDiv.addClass('csv-num');
      Object.keys(cssPrp).forEach(key => csvDiv.css(key, cssPrp[key]));
      csvDiv.text(i + 1);
      $(elm).after(csvDiv);
    });
  });
}
// eslint-disable-next-line no-unused-vars
function makeArray(num, prefix, first, deference) {
  return [...Array(num)].map((_, i) => `${prefix}${first + i * deference} `);
}
// eslint-disable-next-line no-unused-vars
function textBoxToSelectBox(names = [], options = []) {
  names.forEach(n => {
    const selector = getSelector(n);
    const tmp = getV(n);
    $(selector).replaceWith($('<select></select>', $(selector).attrAll()));
    options.forEach(([name, value]) => {
      if (value) $(selector).append($('<option>').html(name)).val(value);
      else $(selector).append($('<option>').html(name));
    });
    $(selector).val(tmp);
  });
}

/**
 * OBJ_XXXX と JS_OBJ_XXXX のマッピングを入れ替えた際に値の受け渡しを行う。
 * @param  {...any} args[0] - 古いマッピングのオブジェクト名
 * @param  {...any} args[1] - 新しいマッピングのオブジェクト名
 * 追加ページの場合は下記の利用方法となる。
 * @param  {...any} args[0] - 古いマッピングのオブジェクト名
 * @param  {...any} args[1] - 古いマッピングのオブジェクト名のページインデックス
 * @param  {...any} args[2] - 新しいマッピングのオブジェクト名
 * @param  {...any} args[3] - 新しいマッピングのオブジェクト名のページインデックス
 */
// eslint-disable-next-line no-unused-vars
function setValueFromOldObjToNewObj(...args) {
  const oldObj = args[0];
  const oldObjIndex = args.length === 2 ? undefined : args[1];
  const newObj = args.length === 2 ? args[1] : args[2];
  const newObjIndex = args.length === 2 ? undefined : args[3];
  const isRadio = radioButtons.radioExists(newObj);
  const suffix = i => (isRadio ? `_R${i + 1}` : '');
  const loopCount = isRadio ? radioButtons.countButtons(oldObj) : 1;
  [...Array(loopCount)].forEach((_, i) => {
    setV(`${newObj}${suffix(i)}`, newObjIndex, getV(`${oldObj}${suffix(i)}`, oldObjIndex));
  });
  const selector = isRadio
    ? makeSelector(radioButtons.getRadioGroup(newObj).getAllButtonNameList()) : getSelector(newObj);
  const event = isRadio ? 'click' : 'click change';
  $(selector).on(event, () => {
    [...Array(loopCount)].forEach((_, i) => {
      setV(`${oldObj}${suffix(i)}`, oldObjIndex, getV(`${newObj}${suffix(i)}`, newObjIndex));
    });
  });
}

function defineAttrAll() {
  (function _defineAttrAll($) {
    $.fn.attrAll = function attrAll() {
      const attr = this.get(0).attributes;
      return [...Array(attr.length)].reduce((acc, _, i) => {
        acc[attr[i].name] = attr[i].value;
        return acc;
      }, {});
    };
  }(jQuery));
}
// eslint-disable-next-line no-unused-vars
function showDocInfo() {
  const formName = $('input[name="jobName"]').val();
  console.log(`フォーム名：${formName.slice(0, 1) === 'J' ? formName.slice(1) : formName} `);
  const libUrl = $('script[src*="form_lib"]').attr('src').split('?')[0].split('/');
  console.log(`ライブラリ名：${libUrl.find(v => v.indexOf('form_lib_') > -1)} `);
  const ver = libUrl.find(v => v.indexOf('@') > -1);
  console.log(`ライブラリVer: ${ver === undefined ? 'なし' : ver} `);
}
// eslint-disable-next-line no-unused-vars
function getUnmappedObjList() {
  dmxMapping.getUnmappedObjList();
}
// eslint-disable-next-line no-unused-vars
function executeFuncitonsOnload() {
  onLoadRadioButton();
  setFocusColor();
  onLoadCompanyMaster();
}
// eslint-disable-next-line no-unused-vars
function initializeInstances() {
  inputObjects.initialize();
  radioButtons.initialize();
  documentEmployees.initialize();
  pageList.initialize();
  dmxMapping.initialize();
  defineAttrAll();
  showDocInfo();
}
