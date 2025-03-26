class ChechBox {
  static #list = {};

  static initialize() {
    this.#list = InputObjects.getAllObjNameList().reduce((cur, name) => {
      try {
        const id = InputObjects.getObjByName(name).getId();
        if ($(`#${id}`).prop('type') === 'checkbox') cur[name] = InputObjects.getObjByName(name);
      } catch (e) {
        console.warn(e);
      }
      return cur;
    }, {});
    ChechBox.validateCheckMark();
  }

  static isCheckBox(name) {
    return this.#list[name] !== undefined;
  }

  static validateCheckMark() {
    Object.keys(this.#list).forEach(name => {
      const id = this.#list[name].getId();
      const checkedValue = $(`#${id}`).attr('value');
      if (checkedValue !== 'true') console.warn(`${name} のチェック時の書き出し値が true ではなく ${checkedValue} です。`);

      const unchedValue = $(`#${id}`).attr('data-unchecked-value');
      if (unchedValue !== 'false') console.warn(`${name} の非チェック時の書き出し値が false ではなく ${unchedValue} です。`);
    });
  }
}
class CompanyMaster {
  static #hasObjPrefix = {
    SHRSH: {
      SHRSH_POST: 'S_BUSINESS_OWNER_POSTAL_CODE',
      SHRSH_AD1: 'S_BUSINESS_OWNER_ADDRESS_1',
      SHRSH_AD2: 'S_BUSINESS_OWNER_ADDRESS_2',
      SHRSH_OFFICE: 'S_BUSINESS_OWNER_NAME',
      SHRSH_TEL: 'S_BUSINESS_OWNER_TEL',
      SHRSH_POST1: 'S_BUSINESS_OWNER_POSTAL_CODE_1',
      SHRSH_POST2: 'S_BUSINESS_OWNER_POSTAL_CODE_2',
      SHRSH_TEL1: 'S_BUSINESS_OWNER_TEL_1',
      SHRSH_TEL2: 'S_BUSINESS_OWNER_TEL_2',
      SHRSH_TEL3: 'S_BUSINESS_OWNER_TEL_3',
      SHRSH_POSITION: 'LSS_ATTORNEY_POST',
      SHRSH_OWNER: 'LSS_ATTORNEY_FULL_NAME',
      SHRSH_NAME: 'LSS_ATTORNEY_POST_FULL_NAME',
    },
    JGYNSH: {
      JGYNSH_POST: 'BUSINESS_OWNER_POSTAL_CODE',
      JGYNSH_AD1: 'BUSINESS_OWNER_ADDRESS_1',
      JGYNSH_AD2: 'BUSINESS_OWNER_ADDRESS_2',
      JGYNSH_OFFICE: 'BUSINESS_OWNER_NAME',
      JGYNSH_NAME: 'BUSINESS_OWNER_POST_FULL_NAME',
      JGYNSH_TEL: 'BUSINESS_OWNER_TEL',
      JGYNSH_POST1: 'BUSINESS_OWNER_POSTAL_CODE_1',
      JGYNSH_POST2: 'BUSINESS_OWNER_POSTAL_CODE_2',
      JGYNSH_POSITION: 'BUSINESS_OWNER_POST',
      JGYNSH_OWNER: 'BUSINESS_OWNER_REPRESENT_FULL_N',
      JGYNSH_TEL1: 'BUSINESS_OWNER_TEL_1',
      JGYNSH_TEL2: 'BUSINESS_OWNER_TEL_2',
      JGYNSH_TEL3: 'BUSINESS_OWNER_TEL_3',
    },
    OFF: {
      OFF_POST: 'OFFICE_POSTAL_CODE',
      OFF_AD1: 'OFFICE_ADDRESS_1',
      OFF_AD2: 'OFFICE_ADDRESS_2',
      OFF_NAME: 'OFFICE_NAME',
      OFF_TEL: 'OFFICE_TEL',
      OFF_POST1: 'OFFICE_POSTAL_CODE_1',
      OFF_POST2: 'OFFICE_POSTAL_CODE_2',
      OFF_TEL1: 'OFFICE_TEL_1',
      OFF_TEL2: 'OFFICE_TEL_2',
      OFF_TEL3: 'OFFICE_TEL_3',
    },
    TNTSH: {
      TNTSH_NAME: 'RESPONSIBLE_FULL_NAME',
      TNTSH_AFFILIATION: 'RESPONSIBLE_AFFILIATION',
      TNTSH_TEL: 'RESPONSIBLE_TEL',
      TNTSH_FAX: 'RESPONSIBLE_FAX',
      TNTSH_MAIL: 'RESPONSIBLE_MAIL_ADDRESS',
      TNTSH_TEL1: 'RESPONSIBLE_TEL_1',
      TNTSH_TEL2: 'RESPONSIBLE_TEL_2',
      TNTSH_TEL3: 'RESPONSIBLE_TEL_3',
      TNTSH_FAX1: 'RESPONSIBLE_FAX_1',
      TNTSH_FAX2: 'RESPONSIBLE_FAX_2',
      TNTSH_FAX3: 'RESPONSIBLE_FAX_3',
      TNTSH_MAIL1: 'RESPONSIBLE_MAIL_ADDRESS_1',
      TNTSH_MAIL2: 'RESPONSIBLE_MAIL_ADDRESS_2',
    },
  };

  static #notHaveObjPrefix = {
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
    TENANT_ID: 'TENANT_ID',
    CREATED_TENANT_ID: 'CREATED_TENANT_ID',
    ROUKI_ID: 'LSIO_ID',
  };

  static #hasProcessedValue = {
    JGYNSHBIRTHDAY_Y: () => InputObjects.getValue('JGYNSHBIRTHDAY').slice(0, 4),
    JGYNSHBIRTHDAY_M: () => InputObjects.getValue('JGYNSHBIRTHDAY').slice(4, 6),
    JGYNSHBIRTHDAY_D: () => InputObjects.getValue('JGYNSHBIRTHDAY').slice(6, 8),
    SHRSH_NUM: () => InputObjects.getValue('LSS_ATTORNEY_REGIST_NUMBER') || InputObjects.getValue('S_LSS_ATTORNEY_REGIST_NUMBER'),
    ROUKI_NAME: () => InputObjects.getValue('LSIO').split('労働基準監督署')[0],
  };

  static toMasterName(name) {
    const objPrefix = name.split('_')[0];
    if (!(this.#hasObjPrefix.hasOwnProperty(objPrefix))) return this.#notHaveObjPrefix[name];
    return this.#hasObjPrefix[objPrefix][name];
  }

  static getMaster(name) {
    if (this.#hasProcessedValue.hasOwnProperty(name)) return this.#hasProcessedValue[name];
    return InputObjects.getValueByIndex(CompanyMaster.toMasterName(name));
  }

  static setMaster(name) {
    InputObjects.setValueByIndex(name, CompanyMaster.getMaster(name));
  }

  static getAllObjNameByType(type) {
    return Object.keys(this.#hasObjPrefix[type]);
  }

  static setAllMasterByType(type) {
    CompanyMaster.getAllObjNameByType(type).forEach(name => {
      CompanyMaster.setMaster(name);
    });
  }

  static setAllMaster() {
    Object.keys(this.#hasObjPrefix).forEach(type => {
      if (type === 'SHRSH' && (getMaster('TENANT_ID') === getMaster('CREATED_TENANT_ID'))) return;
      CompanyMaster.setAllMasterByType(type);
    });
    Object.keys(this.#notHaveObjPrefix).forEach(name => {
      CompanyMaster.setMaster(name);
    });
    Object.keys(this.#hasProcessedValue).forEach(name => {
      CompanyMaster.setMaster(name);
    });
    LazyEvaluationFunctions.callCompanyMasterFunctions?.();
  }
}
class DMXMapping {
  static #xmlDataMap;
  static #CSVObjList;
  static #JSObjList;

  static initialize() {
    this.#xmlDataMap = JSON.parse($('input[name="xmlDataMap"]').val());
    this.#CSVObjList = Object.keys(this.#xmlDataMap).filter(key => this.#xmlDataMap[key].split('_')[0] === 'OBJ').map(key => key);
    this.#JSObjList = Object.keys(this.#xmlDataMap).filter(key => this.#xmlDataMap[key].split('_')[0] === 'JS').map(key => key);
    this.#JSObjList.forEach(obj => {
      if (!InputObjects.objExists(obj)) console.warn(`DMXMapping: ${obj} は不要なマッピング`);
    });
  }

  static getCSVObjList() {
    return this.#CSVObjList;
  }

  static getJSObjList() {
    return this.#JSObjList;
  }

  static getUnmappedObjList() {
    console.log('マッピングされてない項目');
    InputObjects.getAllObjNameList().forEach(name => {
      if (this.#xmlDataMap[name] === undefined) console.log(`${name}`);
    });
  }
}
class Employees {
  static #splitKeyValue = ['birthday', 'hire_date', 'employment_insurance_number'];
  static #list = [];
  static objNameSet = new Set();

  static initialize() {
    try {
      if (!InputObjects.objExists('DOCUMENT_EMPLOYEES_LIST')) return;
      this.#list = JSON.parse(InputObjects.getValueByIndex('DOCUMENT_EMPLOYEES_LIST', 0));
    } catch (e) {
      this.#list = [];
    }
  }

  static getList() {
    return this.#list;
  }

  static countEmployees() {
    return this.#list.length;
  }

  static contains(index, key) {
    const splitKey = key.split('_'); splitKey.pop();
    const keyPrefix = splitKey.join('_');
    return this.#list[index]?.[keyPrefix] !== undefined || this.#list[index]?.[key] !== undefined;
  }

  static containsId(id) {
    return this.#list.some(v => v.id === id);
  }

  static makeIdList() {
    return this.#list.map(v => ({ id: v.id }));
  }

  static getEmployeesValue(index, key) {
    const splitKey = key.split('_'); splitKey.pop();
    const keyPrefix = splitKey.join('_');
    const haveSplit = this.#splitKeyValue.some(v => v === keyPrefix);
    if (haveSplit) return Employees.splitEmployeesValue(index, key);
    return this.#list[index]?.[key] === undefined ? '' : this.#list[index][key];
  }

  static splitEmployeesValue(index, key) {
    const splitKey = key.split('_');
    const keyNum = +splitKey.pop();
    const keyName = splitKey.join('_');
    const notSplitValue = Employees.getEmployeesValue(index, keyName);
    if (notSplitValue === '') return '';
    if (keyName === 'birthday' || keyName === 'hire_date') return toWareki(notSplitValue)[keyNum];
    if (keyName === 'employment_insurance_number') return notSplitValue.split('-')[keyNum];
    return '';
  }
}
class EmployeesContents {
  static #list = [];
  static #previous = [];

  static initialize(employees) {
    // 現在の従業員リスト
    if (!InputObjects.objExists('DOCUMENT_EMPLOYEES_LIST')) {
      console.warn('DOCUMENT_EMPLOYEES_LISTは存在しないオブジェクト');
      return;
    }
    // 前回保存時の従業員リスト
    if (!InputObjects.objExists('PREVIOUS_DOC_EMP_LIST')) {
      console.warn('PREVIOUS_DOC_EMP_LISTは存在しないオブジェクト');
      return;
    }
    try {
      this.#previous = JSON.parse(InputObjects.getValue('PREVIOUS_DOC_EMP_LIST'));
    } catch (e) {
      this.#previous = [];
    }
    // 固有ロジックで設定する「max: 最大取り込み人数」の大きさの配列を用意し、前回保存時の従業員リストから ID を取得して格納
    const previousDocEmpContents = [...Array(employees.max ?? 0)].map((_, i) => {
      if (this.#previous.length > i) return { id: this.#previous[i].id };
      return {};
    });
    // 前回保存時の従業員リストと現在の書類の内容と合成
    Object.keys(employees.list).forEach(key => {
      [...Array(employees.max ?? 0)].forEach((_, i) => {
        const obj = [employees.list[key](i)].flat()[0];
        if (obj?.name && (obj.page === undefined || obj.page < InputObjects.getLengthOfPageListByName(obj.name))) previousDocEmpContents[i][key] = InputObjects.getValueByIndex(obj.name, obj.page);
      });
    });
    // 現在の従業員リストに存在しない ID の従業員情報を削除
    const subDocEmpcontents = previousDocEmpContents
      .filter(v => v.id === undefined || Employees.containsId(v.id));
    const sublength = previousDocEmpContents.length - subDocEmpcontents.length;
    // 最大取り込み人数に満たない場合、空の従業員情報を追加
    this.#list = subDocEmpcontents.concat([...Array(sublength)].map(() => ({})));
    // 現在の従業員リストの従業員情報で上書き
    this.#list.forEach((_, i) => {
      Object.keys(employees.list).forEach(key => {
        if (Employees.contains(i, key)) {
          const objs = [employees.list[key](i)].flat();
          const value = Employees.getEmployeesValue(i, key);
          this.#list[i][key] = objs[0].func ? objs[0].func(value, i) : value;
          objs.forEach(obj => Employees.objNameSet.add(obj.name));
        }
      });
    });
    // 書類の内容を上書き
    Object.keys(employees.list).forEach(key => {
      [...Array(employees.max)].forEach((_, i) => {
        const value = this.#getEmployeesValue(i, key);
        const objList = [employees.list[key](i)].flat();
        objList.forEach(obj => {
          if (obj?.name && (obj.page === undefined || obj.page < +InputObjects.getLengthOfPageListByName(obj.name))) InputObjects.setValueByIndex(obj.name, obj.page, value);
        });
      });
    });
    // 現在の従業員リストを前回保存時の従業員リストに保存
    InputObjects.setValueByIndex('PREVIOUS_DOC_EMP_LIST', InputObjects.getValue('DOCUMENT_EMPLOYEES_LIST'));
  }

  static #getEmployeesValue(index, key) {
    if (this.#list[index]?.[key] === undefined) return '';
    return this.#list[index][key];
  }
}
class IconObjects {
  static #iconList = {
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
      isEnabled: iconSetting => Array.isArray(iconSetting.addPage) && iconSetting.addPage.length !== 0 && PageList.isFrontPage(iconSetting.addPage),
      getPages: iconSetting => iconSetting.addPage,
    },
    inputEmployees: {
      name: 'CAPTION_INPUT_EMPLOYEES',
      string: '従業員参照可能',
      color: 'rgba(0,30,100,1)',
      iconType: 'label',
      isEnabled: iconSetting => Array.isArray(iconSetting.inputEmployees) && iconSetting.inputEmployees.length !== 0 && PageList.isFrontPage(iconSetting.inputEmployees),
      getPages: iconSetting => iconSetting.inputEmployees,
    },
    copyPage1: {
      name: 'COPY_PAGE_BUTTON',
      string: '1ページ目引用',
      color: 'rgba(68,201,194,1)',
      iconType: 'button',
      isEnabled: () => PageList.getLengthOfAddPage() > 0,
      getPages: () => PageList.getAddPages(),
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

  static showIcon(iconSetting) {
    const iconsByPage = [...Array(PageList.getLength())].map(_ => Array(1));

    Object.keys(this.#iconList).forEach(iconName => {
      const target = this.#iconList[iconName];
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
        const iconDiv = this.#makeIconDiv(this.#iconList[icon]);
        const $tmp = iconDiv.clone();
        if (this.#iconList[icon].iconType === 'label') $labelsDiv.append($tmp);
        if (this.#iconList[icon].iconType === 'button') {
          $tmp.css('float', 'right');
          $tmp.css('pointer-events', 'auto');
          $buttonsDiv.append($tmp);
        }
      });
      const $iconsDiv = $('<div>');
      $iconsDiv.attr('id', 'ICONS_DIV');
      $iconsDiv.css('pointer-events', 'none');
      $iconsDiv.css('display', 'flex');
      $iconsDiv.css('width', '595pt');
      $iconsDiv.css('height', '40pt');
      const id = PageList.indexToSelector(i).children('[class~="iftc_cf_inputitems"]').attr('id');
      $iconsDiv.css('position', 'absolute');
      const inputAreaCSS = this.#getPtValueFromStylesheets(`#${id}`);
      const inputAreaTop = Number(inputAreaCSS?.top.split('pt')[0] || 0);
      $iconsDiv.css('top', `${(veticalPosition[i] !== undefined ? veticalPosition[i] : 0) - inputAreaTop}pt`);
      const inputAreaLeft = Number(inputAreaCSS?.left.split('pt')[0] || 0);
      $iconsDiv.css('left', `${-inputAreaLeft}pt`);
      $iconsDiv.append($labelsDiv);
      $iconsDiv.append($buttonsDiv);

      PageList.indexToSelector(i).children('[class~="iftc_cf_inputitems"]').append($iconsDiv);
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
class InputObjects {
  static #MAX_PAGE_NUM = 50;
  static #list = {};
  static #objListByPage = [];

  static initialize() {
    this.#objListByPage = Array.from({ length: this.#MAX_PAGE_NUM }, () => []);
    this.#list = allObj.reduce(this.#processObject.bind(this), {});
  }

  static #processObject(acc, id) {
    const { objName, page } = this.#parseId(id);
    this.#objListByPage[page].push({ name: objName, id });

    if (!acc[objName]) acc[objName] = new InputObjectsByName(this.#MAX_PAGE_NUM);
    acc[objName].register(id, page);

    return acc;
  }

  static #parseId(id) {
    const splitId = id.split('_');
    const slicedId = splitId.slice(1, -1);
    const page = parseInt(slicedId.pop(), 10);
    const objName = slicedId.join('_');
    return { objName, page };
  }

  static getAllObjNameList() {
    return Object.keys(this.#list);
  }

  static getObjByName(name) {
    if (this.#list[name] === undefined) throw new Error(`InputObjects.getObjByName: ${name} は存在しないオブジェクト`);
    return this.#list[name];
  }

  static getAllIds(name) {
    try {
      return InputObjects.getObjByName(name).getALLIds();
    } catch (e) {
      console.warn(e);
      return [];
    }
  }

  static getLengthOfPageListByName(name) {
    try {
      return InputObjects.getObjByName(name).getLengthOfPage();
    } catch (e) {
      console.warn(e);
      return 0;
    }
  }

  static getIdsbyPage(name, page) {
    try {
      const idList = InputObjects.getObjByName(name).getIdsByPage(page);
      if (idList === undefined) throw new Error(`${page} ページ目に ${name} は存在しない`);
      return idList;
    } catch (e) {
      return [];
    }
  }

  static getIdsByIndex(name, index) {
    try {
      const list = InputObjects.getObjByName(name).getFilteredList();
      if (list[index] === undefined) throw new Error(`${name} が存在するページ数は ${index + 1} より少ない`);
      return list[index];
    } catch (e) {
      console.warn(e);
      return [];
    }
  }

  static objExists(name) {
    return this.#list[name] !== undefined;
  }

  static getIndexById(id) {
    const splitId = id.split('_');
    splitId.shift(); splitId.pop(); splitId.pop();
    const objName = splitId.join('_');
    return this.#list[objName].getIndexById(id);
  }

  static getObjListByPage(page) {
    return this.#objListByPage[page];
  }

  static getValue(name) {
    try {
      return InputObjects.getObjByName(name).getValue();
    } catch (e) {
      console.warn(e);
      return '';
    }
  }

  static getValueByIndex(name, index) {
    try {
      return InputObjects.getObjByName(name).getValueByIndex(index ?? 0);
    } catch (e) {
      console.warn(e);
      return '';
    }
  }

  static setValueByIndex(...args) {
    const target = args.length === 2 || (args.length === 3 && args[1] === undefined)
      ? InputObjects.getAllIds(args[0]) : InputObjects.getIdsByIndex(args[0], args[1]);
    const val = args.slice(-1)[0];
    target.forEach(id => {
      if ($(`#${id}`).prop('type') === 'checkbox') {
        const display = val ? 'inline' : 'none';
        $(`#label${id} svg`).attr('style', `display: ${display};`);
        $(`#${id}`).prop('checked', val);
        return;
      }
      $(`#${id}`).val(val);
    });
  }

  static getType(name) {
    return InputObjects.getObjByName(name).getType();
  }

  static getMaxLengthOfInput(name) {
    return InputObjects.getObjByName(name).getMaxLengthOfInput();
  }
}
class InputObjectsByName {
  constructor(maxPageNum) {
    this.objList = [];
    this.objListByPage = [...Array(maxPageNum)].map(() => []);
    this.type = '';
    this.getValueFunction = undefined;
  }

  register(id, page, type, getValueFunction) {
    this.objList.push(id);
    this.objListByPage[page].push(id);
    if (this.type === '') this.type = type || $(`#${id}`).prop('type');
    if (!this.getValueFunction) this.getValueFunction = getValueFunction || this.defaultGetValueFunction();
  }

  defaultGetValueFunction() {
    if (this.type === 'checkbox') return id => $(`#${id}`).prop('checked');
    return id => $(`#${id}`).val();
  }

  getId() {
    return this.objList[0];
  }

  getALLIds() {
    return this.objList;
  }

  getPageList() {
    return this.objListByPage.map((n, i) => {
      if (n.length > 0) return i + 1;
      return undefined;
    }).filter(v => v !== undefined);
  }

  getIdsByPage(page) {
    return this.objListByPage[page];
  }

  getFilteredList() {
    return this.objListByPage.filter(v => v.length !== 0);
  }

  getIdsByIndex(index) {
    return this.getFilteredList()[index];
  }

  getType() {
    return this.type;
  }

  getValueByIndex(index) {
    const id = this.getIdsByIndex(index)[0];
    return this.getValueFunction(id);
  }

  getValue() {
    return this.getValueByIndex(0);
  }

  getIndexById(id) {
    return this.getFilteredList().findIndex(arr => arr.some(v => v === id));
  }

  getLengthOfPage() {
    return this.getFilteredList().length;
  }

  getMaxLengthOfInput() {
    return $(`#${this.getId()}`).attr('maxlength');
  }
}
class LazyEvaluationFunctions {
  static setFunction(func) {
    if (func === undefined) this[func.name] = () => { console.warn(`LazyEvaluationFunctions.${func.name} は未定義`); };
    this[func.name] = func;
  }
}
class PageList {
  static #list = {};
  static #addPages = [];
  static #frontPages = [];
  static #length = 0;

  static initialize() {
    this.#list = $('[id^="iftc_cf_page_"]');
    this.#addPages = this.getIndexOfAddPages();
    this.#frontPages = this.getIndexOfFrontPages();
    this.#length = this.#list.length;
  }

  static indexToSelector(index) {
    return this.#list.eq(index);
  }

  static getIndexOfAddPages() {
    const tmp = new Set();
    const ret = [...this.#list]
      .map(v => [...v.classList.values()].find(s => s.indexOf('iftc_cf_form_') > -1))
      .map((str, i) => {
        if (tmp.has(str)) return i + 1;
        tmp.add(str);
        return false;
      }).filter(v => v !== false);
    return ret;
  }

  static getIndexOfFrontPages() {
    const tmp = new Set();
    const notFrontPageWord = ['hidden', 'rear'];
    const ret = [...this.#list]
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

  static getIndexOfInitialPages() {
    const addPageSet = new Set(PageList.getIndexOfAddPages());
    return PageList.getIndexOfFrontPages().filter(page => !addPageSet.has(page)).map(v => v - 1);
  }

  static isFrontPage(units) {
    return units.map(unit => {
      const isFront = this.#frontPages.some(v => unit === v);
      if (!isFront) console.warn(`ユニット番号 ${unit} は隠しページまたは裏面なのでアイコンまたはボタンを表示できません。`);
      return isFront;
    }).reduce((a, b) => a || b);
  }

  static getLength() {
    return this.#length;
  }

  static getAddPages() {
    return this.#addPages;
  }

  static getLengthOfAddPage() {
    return this.#addPages.length;
  }
}
class RadioButtonGroup {
  constructor() {
    this.buttonList = {};
    this.reverseList = {};
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
    if (this.mark === undefined) try {
      const type = InputObjects.getObjByName(name).getType();
      if (type === 'checkbox') {
        this.mark = true;
        this.unmark = false;
      }
      if (type === 'text') {
        this.mark = '◯';
        this.unmark = '​';
      }
    } catch (e) {
      console.warn(e);
    }
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
      [...Array(InputObjects.getLengthOfPageListByName(name))].forEach((_, i) => {
        InputObjects.setValueByIndex(name, i, InputObjects.getValueByIndex(name, index));
      });
    });
  }

  getValue(index) {
    return Object.keys(this.reverseList)
      .find(num => InputObjects.getValueByIndex(this.reverseList[num], index) === this.mark);
  }

  setCorrectMark() {
    const isWrong = this.getAllButtonNameList()
      .map(name => InputObjects.getValueByIndex(name) === this.mark).filter(v => v).length > 1;
    if (isWrong) this.getAllButtonNameList().forEach(name => {
      InputObjects.setValueByIndex(name, this.unmark);
    });
  }

  countButtons() {
    return Object.keys(this.buttonList).length;
  }
}
class RadioButtons {
  static #list = {};

  static initialize() {
    this.#list = InputObjects.getAllObjNameList().reduce((cur, name) => {
      const target = cur;
      const splitName = name.split('_');
      const end = splitName.slice(-1)[0];
      const groupName = splitName.slice(0, -1).join('_');
      if (RadioButtons.isRadioButton(name)) {
        if (!target[groupName]) target[groupName] = new RadioButtonGroup();
        target[groupName].registerButton(name, +end.split('R')[1]);
      }
      return target;
    }, {});
  }

  static isRadioButton(name) {
    const suffix = name.split('_').slice(-1)[0];
    return /^R[0-9]+$/.test(suffix);
  }

  static getAllGroupNameList() {
    return Object.keys(this.#list);
  }

  static getAllButtonNameList(name) {
    if (!RadioButtons.radioExists(name)) return [];
    return RadioButtons.getRadioGroup(name).getAllButtonNameList();
  }

  static onClickRadioButtonL(name, index) {
    const groupName = name.split('_').slice(0, -1).join('_');
    const type = InputObjects.getObjByName(name).getType();
    const value = InputObjects.getValueByIndex(name, index);
    const preState = type === 'checkbox' ? !value : value;
    RadioButtons.getRadioGroup(groupName).getAllButtonNameList().forEach(buttonName => {
      const tmp = [buttonName, index, RadioButtons.getRadioGroup(groupName).unmark].filter(v => v !== undefined);
      setV(...tmp);
    });
    if (preState === RadioButtons.getRadioGroup(groupName).mark) return;
    const tmp = [name, index, RadioButtons.getRadioGroup(groupName).mark].filter(v => v !== undefined);
    setV(...tmp);
  }

  static radioExists(name) {
    if (this.#list?.[name] === undefined) return false;
    return true;
  }

  static getRadioGroup(name) {
    if (!RadioButtons.radioExists(name)) {
      console.warn(`getRadioGroup: ${name} は存在しないラジオボタングループ`);
      return {};
    }
    return this.#list[name];
  }

  static getValue(name, index) {
    if (!RadioButtons.radioExists(name)) return '';
    return RadioButtons.getRadioGroup(name).getValue(index);
  }

  static setMark(name, mark, unmark) {
    if (!RadioButtons.radioExists(name)) return;
    RadioButtons.getRadioGroup(name).setMark(mark, unmark);
  }

  static countButtons(name) {
    if (!RadioButtons.radioExists(name)) return {};
    return RadioButtons.getRadioGroup(name).countButtons();
  }
}
// 汎用関数
// eslint-disable-next-line no-unused-vars
function getV(name, index) {
  if (RadioButtons.radioExists(name)) return RadioButtons.getValue(name, index);
  return InputObjects.getValueByIndex(name, index);
}
// eslint-disable-next-line no-unused-vars
function setV(...args) { // (name, val) or (name, index, val)
  InputObjects.setValueByIndex(...args);
}
// eslint-disable-next-line no-unused-vars
function getMaster(name) { return InputObjects.getValueByIndex(name); }
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
  return InputObjects.getLengthOfPageListByName(name);
}
// eslint-disable-next-line no-unused-vars
function setMark(name, mark, unmark) {
  RadioButtons.setMark(name, mark, unmark);
}
// eslint-disable-next-line no-unused-vars
function toHan(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[－]/g, '-');
}
// eslint-disable-next-line no-unused-vars
function isCheckBox(id) {
  return $(`#${id}`).prop('type') === 'checkbox';
}
// eslint-disable-next-line no-unused-vars
function getIds(name, index = undefined) {
  if (index === undefined) return InputObjects.getAllIds(name);
  return InputObjects.getIdsByIndex(name, index);
}
// eslint-disable-next-line no-unused-vars
function getSelector(name, index = undefined) {
  return getIds(name, index).map(id => `#${id}`).join();
}
// eslint-disable-next-line no-unused-vars
function makeSelector(names) {
  return names.map(name => {
    if (RadioButtons.radioExists(name)) return RadioButtons.getAllButtonNameList(name).map(n => getSelector(n));
    return getSelector(name);
  }).flat().filter(v => v).join();
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
  return $(`#${InputObjects.getAllIds(name)[index]}`).prop('checked');
}
// eslint-disable-next-line no-unused-vars
function setCheckValue(...args) {
  setV(...args);
}
// eslint-disable-next-line no-unused-vars
function getIndexById(id) {
  return InputObjects.getIndexById(id);
}
// eslint-disable-next-line no-unused-vars
function getIndexByEvt(evt) {
  return InputObjects.getIndexById(evt.currentTarget.id);
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

// eslint-disable-next-line no-unused-vars
function setFocusColor() {
  const fieldTabIdSelector = InputObjects.getAllObjNameList().map(name => InputObjects
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
  const makeSelectorList = (list, callback) => list.map(n => {
    if (InputObjects.objExists(n)) return callback(n);
    log(n);
    return '';
  }).filter(v => v).join().split(',');

  const captionObj = makeSelectorList(captionList, getSelector);
  $(captionObj.join()).prop('disabled', true);
  $(captionObj.join()).css('font-weight', 'bold');
  const inputObj = makeSelectorList(inputList, getSelector);
  const lableObj = makeSelectorList(labelList, getLabelSelector);

  const names = [captionObj, inputObj, lableObj].flat();
  [...document.styleSheets].some(ss => {
    const result = names.map(name => [...ss.cssRules]
      .find(rule => rule.selectorText && rule.selectorText.indexOf(name) !== -1));
    result.forEach(x => { if (x) x.style.visibility = ''; });
    return result.reduce((x, y) => x && y);
  });
}

// eslint-disable-next-line no-unused-vars
function makeArray(num, prefix, first, deference) {
  return [...Array(num)].map((_, i) => `${prefix}${first + i * deference} `);
}

// eslint-disable-next-line no-unused-vars
function textBoxToSelectBox(names = [], options = []) {
  names.forEach(n => {
    [...Array(getP(n))].forEach((_, p) => {
      const selector = getSelector(n, p);
      const tmp = $(selector).val();
      $(selector).replaceWith($('<select></select>', $(selector).attrAll()));
      options.forEach(([name, value]) => {
        $(selector).append($('<option>').html(name).val(value ?? name));
      });
      $(selector).val(tmp);
    });
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
  const isRadio = RadioButtons.radioExists(newObj);
  const suffix = i => (isRadio ? `_R${i + 1}` : '');
  const loopCount = isRadio ? RadioButtons.countButtons(oldObj) : 1;
  [...Array(loopCount)].forEach((_, i) => {
    if (getV(`${newObj}${suffix(i)}`, newObjIndex) === '') setV(`${newObj}${suffix(i)}`, newObjIndex, getV(`${oldObj}${suffix(i)}`, oldObjIndex));
    else setV(`${oldObj}${suffix(i)}`, oldObjIndex, getV(`${newObj}${suffix(i)}`, newObjIndex));
  });
  const selector = isRadio
    ? makeSelector(RadioButtons.getRadioGroup(newObj).getAllButtonNameList()) : getSelector(newObj);
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
function getUnmappedObjList() {
  DMXMapping.getUnmappedObjList();
}

// eslint-disable-next-line no-unused-vars
function logWarningWithCaller(message) {
  const error = new Error();
  const stack = error.stack.split('\n').slice(1).map(v => v.split('(')[0]).join('\n');
  console.warn(`${message}\n${stack}`);
}

// eslint-disable-next-line no-unused-vars
function fillAllFields(value) {
  enableScriptOnload(false);
  const objNameList = InputObjects.getAllObjNameList();

  const denylist = [
    'TARGET_USER_NAME',
    'DOCUMENT_STATUSES-STATUS',
    'AMOUNT_RECEIVED',
    'RESERVE_ITEM01',
    'RESERVE_ITEM02',
    'TARGET_COMPANY_NAME',
    'SUPPLY_DOCUMENT_START_DATE',
    'DOCUMENT_DEADLINE_DATE',
    'DOCUMENT_REMARKS-TYPE',
    'DOCUMENT_ITEMS-UPDATED_AT',
    'SKIP_RUN_SCRIPT_ON_LOAD',
  ];
  const valueDict = {
    radioButton: '◯',
    checkbox: true,
  };
  objNameList.filter(v => !denylist.includes(v)).forEach(name => {
    const maxLength = InputObjects.getMaxLengthOfInput(name);
    if (maxLength > 0) {
      InputObjects.setValueByIndex(name, [...Array(+maxLength)].map((_, i) => (i + 1) % 10).join(''));
      return;
    }
    const type = RadioButtons.isRadioButton(name) ? 'radioButton' : InputObjects.getType(name);
    InputObjects.setValueByIndex(name, valueDict[type] ?? value);
  });
}

function enableScriptOnload(runScriptOnload = true) {
  InputObjects.setValueByIndex('SKIP_RUN_SCRIPT_ON_LOAD', runScriptOnload ? '' : 'ᅟ');
  console.log(`ロジックが実行され${runScriptOnload ? 'る' : 'ない'}ように設定しました。`);
}

// eslint-disable-next-line no-unused-vars
function shouldRunScriptOnLoad() {
  // HANGUL CHOSEONG FILLER を判定に利用
  const skipScriptOnload = InputObjects.getValue('SKIP_RUN_SCRIPT_ON_LOAD') === 'ᅟ';
  if (!skipScriptOnload) return true;
  console.log('ロジックが実行されません、実行する場合は下記のコマンドを実行して保存し、リロードしてください。');
  console.log('enableScriptOnload()');
  return false;
}
// Load 時実行
// eslint-disable-next-line no-unused-vars
function onLoadCompanyMaster() {
  if (!InputObjects.objExists('IS_MANUAL') || !getCheckValue('IS_MANUAL')) CompanyMaster.setAllMaster();
  if (InputObjects.objExists('IS_MANUAL')) $(getSelector('IS_MANUAL')).on('click', () => {
    if (!getCheckValue('IS_MANUAL')) CompanyMaster.setAllMaster();
  });
}

// eslint-disable-next-line no-unused-vars
function onLoadRadioButton() {
  RadioButtons.getAllGroupNameList().forEach(groupName => {
    RadioButtons.getRadioGroup(groupName).getAllButtonNameList().forEach(name => {
      const num = getP(name);
      [...Array(num)].forEach((_, i) => {
        $(getSelector(name, i)).off('click.initializeButton').on('click.initializeButton', () => {
          RadioButtons.onClickRadioButtonL(name, i);
          $(getSelector(name, i)).each((_i, elm) => {
            if (!/[a-z]/.test($(elm).attr('name'))) RadioButtons.getRadioGroup(groupName).synchronizeButton(i);
          });
        });
      });
    });
    RadioButtons.getRadioGroup(groupName).setCorrectMark();
  });
}

// eslint-disable-next-line no-unused-vars
function onLoadDocumentEmployeesList(employees) {
  EmployeesContents.initialize(employees);
}

// eslint-disable-next-line no-unused-vars
function onLoadIcon(iconSetting) {
  IconObjects.showIcon(iconSetting);
  onClickCopyPageButton();
  createCSVLabel();
}

// eslint-disable-next-line no-unused-vars
function onClickCopyPageButton() {
  $(document).on('click', '#COPY_PAGE_BUTTON', evt => {
    const parent = $(evt.currentTarget).parent().parent().parent();
    const page = parent.attr('id').split('_')[3] - 1;
    InputObjects.getObjListByPage(page).forEach(obj => {
      if (Employees.objNameSet.has(obj.name)) return;
      setV(obj.name, getIndexById(obj.id), getV(obj.name, 0));
    });
    LazyEvaluationFunctions.onLoad?.();
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
  const csvObjList = DMXMapping.getCSVObjList();
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
    if (!InputObjects.objExists(csv)) {
      console.warn(`CSV番号 ${i + 1} 番: ${csv} は存在しないオブジェクト`);
      return undefined;
    }
    const isHidden = [...document.styleSheets].some(ss => [...ss.cssRules].some(rule => {
      if (!rule.selectorText) return false;
      const splitSelectorText = rule.selectorText.split('_');
      splitSelectorText.shift();
      splitSelectorText.pop();
      splitSelectorText.pop();
      const name = splitSelectorText.join('_');
      return name === csv && rule.style.visibility === 'hidden';
    }));
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
function showDocInfo() {
  const formName = $('input[name="jobName"]').val();
  console.log(`フォーム名：${formName.slice(0, 1) === 'J' ? formName.slice(1) : formName} `);
  const libUrl = $('script[src*="form_lib"]').attr('src').split('?')[0].split('/');
  console.log(`ライブラリ名：${libUrl.find(v => v.indexOf('form_lib_') > -1)} `);
  const ver = libUrl.find(v => v.indexOf('@') > -1);
  console.log(`ライブラリVer: ${ver === undefined ? 'なし' : ver} `);
}

function showErrorConfig() {
  const errConfig = [
    { class: 'iftc_cf_checknum', formatType: '数値' },
    { class: 'iftc_cf_checkpercent', formatType: 'パーセント' },
    { class: 'iftc_cf_formatdate', formatType: '日付' },
  ];
  errConfig.forEach(obj => {
    if ($(`.${obj.class}`).length > 0) {
      const name = $(`.${obj.class}`).attr('id').split('_').slice(1, -2)
        .join('_');
      console.warn(`${name} に${obj.formatType}のフォーマットが設定されています。`);
    }
  });
}

function showDuplicateObject() {
  const initialPages = PageList.getIndexOfInitialPages();
  InputObjects.getAllObjNameList().forEach(name => {
    if (InputObjects.getObjByName(name).getIdsByPage(0).length > 0) return;
    const initialPageObjCount = initialPages.map(page => InputObjects.getObjByName(name).getIdsByPage(page).length).reduce((a, b) => a + b);
    if (initialPageObjCount > 1) console.warn(`${name} は重複しています。`);
  });
}

function linkifyTspanText() {
  $('svg').each((_, svgContainer) => {
    const $svgContainer = $(svgContainer);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    $svgContainer.find('tspan').each((__, tspan) => {
      const $tspan = $(tspan);
      const text = $tspan.text().replace(/\r?\n/g, '');
      // URLが含まれているかチェック
      if (urlRegex.test(text)) {
        // URL部分を抽出
        const urls = text.match(urlRegex);
        // 複数のURLが含まれている場合の処理
        if (urls.length > 1) {
          console.warn('テキストオブジェクトに複数のURLが含まれています。');
          return;
        }
        $tspan.on('click', () => {
          window.open(urls[0], '_blank');
        });
        $tspan.on({
          mouseenter: e => {
            $(e.currentTarget).css('cursor', 'pointer');
          },
          mouseleave: e => {
            $(e.currentTarget).css('cursor', 'default');
          },
        });
      }
    });
  });
}

function getWrongFormIdentifiers() {
  // ページインデックスを付与していない場合
  // id = '_ITEXT4000_7_0' name = 'ITEXT4000'
  // ページインデックスを付与している場合
  // id = '_ITEXT5004_8_12' name = 'ITEXT5004_J24J03A00K10p10_0'

  const addPageIndex = $('div[id^="iftc_cf_inputarea_"]').children().filter((_, el) => /_0$/.test(el.name));
  const formIdentifiers = {};
  addPageIndex.each((_, elm) => {
    const id = $(elm).attr('id').split('_').slice(1, -2)
      .join('_');
    const formIdentifier = $(elm).attr('name').replace(id, '').split('_')
      .slice(1, -1)
      .join('_');
    const parentClass = $(elm).closest('div[class^="iftc_cf_form_"]').attr('class');
    const formFileName = parentClass.replace('iftc_cf_form_', '').replace(' iftc_cf_pageframe', '');
    const correctIdentifier = formFileName.split('_').join('');

    if (formIdentifiers[formFileName] === undefined && formIdentifier !== correctIdentifier) formIdentifiers[formFileName] = correctIdentifier;
  });
  Object.keys(formIdentifiers).forEach(formIdentifier => {
    console.warn(`${formIdentifier} の識別子が間違っています。正しい識別子は下記です。`);
    console.warn(`${formIdentifiers[formIdentifier]}`);
  });
}

// eslint-disable-next-line no-unused-vars
function initializeInstances() {
  InputObjects.initialize();
  RadioButtons.initialize();
  Employees.initialize();
  PageList.initialize();
  DMXMapping.initialize();
  ChechBox.initialize();
  defineAttrAll();
}

// eslint-disable-next-line no-unused-vars
function executeFuncitonsOnload() {
  showDocInfo();
  onLoadRadioButton();
  setFocusColor();
  onLoadCompanyMaster();
  linkifyTspanText();
  getWrongFormIdentifiers();
  if (window.location.hostname === 'stg.joseikin-cloud.jp') {
    console.log('---STG用デバッグ情報開始---');
    getUnmappedObjList();
    showErrorConfig();
    showDuplicateObject();
    console.log('---STG用デバッグ情報終了---');
  }
}
