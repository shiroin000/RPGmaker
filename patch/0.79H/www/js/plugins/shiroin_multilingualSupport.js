//=============================================================================
 /*:
 * @plugindesc 多语言适配
 * @author shiroin
 */
//=============================================================================

// 修复新版本NWjs关闭程序的写法问题
SceneManager.exit = function() {
  if (window.nw && nw.App && nw.App.quit) {
    nw.App.quit();
  } else {
    window.close();
  }
};

const LANG_CODE = ["CN", "JP", "EN", "RU", "FR"];
const IS_IMOUTO = ["妹妹", "妹", "imouto", "sister", "sis"];


// 系统功能文本需要最先载入
DataManager._databaseFiles.unshift({
  name: 'systemFeatureText',
  src:  'EN/systemFeatureText_EN.json'
});

    DataManager.loadDataFile(
      'systemFeatureText',
      'EN/systemFeatureText_EN.json'
    );

     ConfigManager.language = 2;
	 ConfigManager.FPS_LOCK_MODE = true;
    // --- 保存时写入 language ---
    const _Config_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        const config = _Config_makeData.call(this);
        config.language = this.language;
		config.FPS_LOCK_MODE = this.FPS_LOCK_MODE;
        return config;
    };	 
    // --- 加载时应用 language：优先读配置，否则自动检测 ---
    const _Config_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _Config_applyData.call(this, config);
        if (config.language !== undefined) {
            this.language = Number(config.language);
			if (this.language > 2) this.language = 2;
			this.FPS_LOCK_MODE = config.FPS_LOCK_MODE;
        } else {
            // 第一次运行或未配置时，根据系统语言检测
            const nav = navigator.language.toLowerCase();
            if (nav.startsWith('zh'))         this.language = 0;
            else if (nav.startsWith('ja'))    this.language = 1;
            else                              this.language = 2;
        }
	   // 适配系统语言修正默认字体
	   if (ConfigManager.language === 0) {
	     DrillUp.g_DFF_fontFace = "Haiyanzhishidongdong";
	   } else {
	     DrillUp.g_DFF_fontFace = "FOT-NewCinemaA Std D";
		 //DrillUp.g_DFF_fontFace = "Huninn";
	   }
	   
    const ln = LANG_CODE[this.language] || "EN"; 

    /* 英文就不用再覆盖 */
    if (ln === "EN") return;

    /* 动态加载目标语言 JSON */
    const url = `data/${ln}/systemFeatureText_${ln}.json`;
    const xhr = new XMLHttpRequest();
	if ( Utils.isMobileDevice() ) {
	    const urlcdv = window.cdvUrl + url;
        xhr.open('GET',  urlcdv);		
	} else {
		xhr.open('GET', url);
	}
    xhr.overrideMimeType('application/json');

    xhr.onload = function(){
      try{
        const obj = JSON.parse(xhr.responseText);
        window.systemFeatureText = Object.assign(
          {}, window.systemFeatureText || {}, obj
        );
      }catch(e){
        console.warn(`[MultiLang] 解析 ${url} 失败，继续使用英文基准`, e);
      }
    };

    xhr.onerror = function(){
      console.warn(`[MultiLang] 找不到 ${url}，继续使用英文基准`);
    };

    xhr.send();
	   
    };

// --- 根据 ConfigManager.language 加载对应语言的数据文件 ---
    const _Data_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
		// 保证先把配置读进来（并执行 applyData）
        ConfigManager.load();
        //const lang = ConfigManager.language;
        const test = this.isBattleTest() || this.isEventTest();
        const prefix = test ? 'Test_' : '';
        for (let i = 0; i < this._databaseFiles.length; i++) {
            const name = this._databaseFiles[i].name;
            let src = this._databaseFiles[i].src;
			//if ( ['States.json'].includes(src) ) {
            // 从 GameLanguage文件夹读取
            //src = `GameLanguage${lang}/${src}`;
			//}
            this.loadDataFile(name, prefix + src);
        }
        if (this.isEventTest()) {
            this.loadDataFile('$testEvent', prefix + 'Event.json');
        }
    };	

	
  const _DM_loadMapData = DataManager.loadMapData;
  DataManager.loadMapData = function(mapId) {
    // 多语言适配
    let lang = ConfigManager.language;
	
	// 多语言模块建设完成前，以英语版为主
	if (lang > 2) lang = 2;

    if (mapId > 0) {

      const padded = String(mapId).padStart(3, '0');
	  let filename = `Map${padded}.json`;
	  const mapIdArray = [2,10,11,14,21,26,28,33,36,37,45,47,48,49,51,52,53,54,55];
	    if ( !mapIdArray.includes(mapId) ) {
          filename = `GameLanguage${lang}/Map${padded}.json`;
		}
	  // 开发者用
	  if (Utils.isOptionValid("test")) filename = `Map${padded}.json`;
		
      this._mapLoader = ResourceHandler.createLoader(
        'data/' + filename,
        this.loadDataFile.bind(this, '$dataMap', filename)
      );
      this.loadDataFile('$dataMap', filename);

    } else {
		
      this.makeEmptyMap();
    }
  };

//=============================================================================
// 适配QJ事件复制插件和多语言模块
//=============================================================================

DataManager.loadSpawnMapData = function(mapId) {
    if (mapId<=0) return null;
    // 多语言适配
    const lang = ConfigManager.language;
    const padded = String(mapId).padStart(3, '0');
    //let src = `GameLanguage${lang}/Map${padded}.json`;
	let src = `Map${padded}.json`;
	
    let xhr = new XMLHttpRequest();
    let url = 'data/' + src;
	if ( Utils.isMobileDevice() ) {
	    const urlcdv = window.cdvUrl + url;
        xhr.open('GET',  urlcdv);		
	} else {
		xhr.open('GET', url);
	}
    xhr.overrideMimeType('application/json');
    xhr.onload = ()=>{
        if (xhr.status < 400) {
            $dataSpawnMapList[mapId] = JSON.parse(xhr.responseText);
            DataManager.onLoadSpawnMapData($dataSpawnMapList[mapId]);
            
        }
    };
    xhr.send();
};


//=============================================================================
// 设置界面切换语言
//=============================================================================
    const _SceneOp_create = Scene_Options.prototype.create;
    Scene_Options.prototype.create = function() {
        _SceneOp_create.call(this);
		// 进入设置界面时标记语言
        this._originalLanguage = ConfigManager.language;
    };

    const _SceneOp_popScene = Scene_Options.prototype.popScene;
    Scene_Options.prototype.popScene = function() {
        _SceneOp_popScene.call(this);
            if (ConfigManager.language !== this._originalLanguage) {				
				// 重置系统语言标记
				/*
                let lang = ConfigManager.language;				
				let textArray = window.systemFeatureText["SwitchLanguage"][String(lang)];
				if (!textArray) textArray = window.systemFeatureText["SwitchLanguage"]["2"];
				let text = textArray.join('\n');
                alert(text);
                ConfigManager.save();
                location.reload();
				*/
				if (ConfigManager.language === 3) {
				    let text =  ["Текущая русская версия игры всё ещё находится в процессе перевода и разработки.",
                                 "В ходе этого могут встречаться отсутствующие тексты или баги.",
                                 "Пожалуйста, наберитесь терпения и дождитесь следующих обновлений и дополнений."];
						text = text.join('\n');
                    alert(text);							 
				} else if (ConfigManager.language === 4) {
				    let text =  ["La version française est en cours de traduction. ",
                                 "Cette option sert uniquement d’annonce pour le moment.",
                                 "Merci de patienter pour les prochaines mises à jour !"];
						text = text.join('\n');
                    alert(text);
                    if (!Utils.isOptionValid("test"))  ConfigManager.language = 2;					
				}
				DataManager.reloadLanguage(true);				
         } 
    };
//=============================================================================
// 根据语言加载指定公共事件和场景物件语料库
//=============================================================================
var shiroin_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
	
    shiroin_Scene_Boot_start.call(this);
    
	// 移动端适配，需要使用更大号的UI
    if (Utils.isMobileDevice()) {
      DrillUp.g_DOp_defaultStyleId = 9;
	  $gameSystem._drill_DOp_curStyle = JSON.parse(JSON.stringify( DrillUp.g_DOp_list[ 8 ] ));
	  DrillUp.g_DOp_list[ 7 ]['fontSize'] = 28;
	  DrillUp.g_COSB_btn[ 0 ] = DrillUp.g_COSB_btn[ 19 ];
	  DrillUp.g_COSB_btn[ 20 ] = DrillUp.g_COSB_btn[ 21 ];
	  //地图事件描述框
      DrillUp.g_MPFE_defaultStyle = 4;
	  DrillUp.g_MPFE_fontsize = 20;
	  DrillUp.g_MBB_default["style_id"] = 2;
	  if (DrillUp.g_GFTH_style) {
  	    for (let i = 0; i < DrillUp.g_GFTH_style.length; i++) {
    	  if (i === 4) continue;            
    	  const style = DrillUp.g_GFTH_style[i];
    	  if (!style) continue;
    	  style.regist_x = 1090;
    	  style.regist_y = 880;
  	    }
	  }
	}
    
	$gameStrings.setValue(20,"");
    /* 刷新自定义选项文本 */
    DataManager.reloadLanguage(false);
    // 玩家不需要看见开关变量数据
      $dataSystem.variables.fill('', 1);  // 索引0本来就是空
      $dataSystem.switches.fill('', 1);  
    // 玩家也不需要看见公共事件数据
      if ($dataCommonEvents) {
            for (let i = 1; i < $dataCommonEvents.length; i++) {
                const ce = $dataCommonEvents[i];
                if (ce) ce.name = '';
          }
      }	  
};

//=============================================================================
// 地图事件多语言适配
//=============================================================================
var chahuiUtil = chahuiUtil || {};

// 检查地图数据是否真实存在
chahuiUtil.checkMapEventExists = function(mapId) {

  $gameSelfSwitches.setValue([$gameMap.mapId(), 2, 'D'], true); 
  return;

	
  if (!this || !mapId) return;	
  
  const fs   = require('fs');
  const path = require('path');
  // process.cwd() 在 NW.js 下就是游戏部署 exe 所在的目录
  const base = process.cwd();

  const filename = `Map${String(mapId).padStart(3,'0')}.json`;
  const file = path.join(base, 'data', filename);

  try {
    const json = fs.readFileSync(file, 'utf8');
    const map = JSON.parse(json);
	const eventId = this._eventId;
     if (map.events.length > 1) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), eventId, 'D'], true); 
	 }
  } catch (e) {
    console.error('读取失败：', e);
  }
};

// 快捷显示原型事件文本  
Game_Interpreter.prototype.showPrototypeEventDialogue = function(type, idx, subIdx) {

        const key   = "prototypeEventTemplate";
        const table = window[key] || {};
        const entry = table[type]?.[String(idx)];
        let textArray;

        if (subIdx !== undefined) {
            // 如果传了 subIdx，就取第二层
            const sub = entry?.[String(subIdx)];
            // 无论取到的是字符串还是对象，都要包成数组
            textArray = sub !== undefined ? [sub] : [];
        } else {
            // 原先的整体数组
            textArray = Array.isArray(entry) ? entry : [];
        }

        chahuiUtil.multilingualCompatibleDisplayText.call(this, textArray);
};

// 快捷显示公共事件文本
Game_Interpreter.prototype.showCommonEventDialogue = function(type, idx, subIdx) {


        const key   = "mapCommonEventDialogue";
        const table = window[key] || {};
        const entry = table[type]?.[String(idx)];
        let textArray;

        if (subIdx !== undefined) {
            // 如果传了 subIdx，就取第二层
            const sub = entry?.[String(subIdx)];
            // 无论取到的是字符串还是对象，都要包成数组
            textArray = sub !== undefined ? [sub] : [];
        } else {
            // 原先的整体数组
            textArray = Array.isArray(entry) ? entry : [];
        }

        chahuiUtil.multilingualCompatibleDisplayText.call(this, textArray);
};

// 快捷显示地图事件文本
Game_Interpreter.prototype.showMapEventDialogue = function(idx, subIdx) {
        const eid   = String(this._eventId);
        const mapId = $gameMap.mapId();
        const key   = `MapEventDialogue${mapId}`;
        const table = window[key] || {};
        const entry = table[eid]?.[String(idx)];
        let textArray;

        if (subIdx !== undefined) {
            // 如果传了 subIdx，就取第二层
            const sub = entry?.[String(subIdx)];
            // 无论取到的是字符串还是对象，都要包成数组
            textArray = sub !== undefined ? [sub] : [];
        } else {
            // 原先的整体数组
            textArray = Array.isArray(entry) ? entry : [];
        }
		
        /* ---------- 如果没取到 & 未重试过 ---------- */
        if ( textArray.length === 0 ) {
		 chahuiUtil.loadMapEventDialogue(2); 	
         textArray = ["\\c[10]Text missing. You may have selected a language",
		              "still being translated. ",
					  "Switching to English display from here ",
					  "on for stability!"];
        }		

        chahuiUtil.multilingualCompatibleDisplayText.call(this, textArray);
};

// 重置语言标记
chahuiUtil.resetSystemLanguageFlag = function() {
	
   var titleText = $dataSystem.gameTitle;
   
   if (titleText.includes("和存在感薄弱")) {
        $gameVariables.setValue(1, 0);
    } else if (titleText.includes("存在感薄い")) {
        $gameVariables.setValue(1, 1);
    } else {
        $gameVariables.setValue(1, 2);
    } 
};


// 多语言适配显示文本
chahuiUtil.multilingualCompatibleDisplayText = function(textArray, isBlackBackground) {
  // 基本设置：清头像区、背景、位置
  let type = 0;
  if (isBlackBackground) type = 1;
  $gameMessage.setFaceImage('', 0);
  $gameMessage.setBackground(type);
  $gameMessage.setPositionType(2);

  // 每页最多显示 4 行
  const maxLines = 4;
  const chunks = [];
  for (let i = 0; i < textArray.length; i += maxLines) {
    chunks.push(textArray.slice(i, i + maxLines));
  }

  chunks.forEach(function(lines, pageIndex) {
    if (pageIndex > 0) {
      // 非第一页，先插入翻页符
      $gameMessage.add('\f');
    }
    // 本页一次性把所有行 join 在一起
    $gameMessage.add(lines.join('\n'));
  });
  // 选项适配
  if (this.nextEventCode() === 102) {
    this._index++;
    this.setupChoices(this.currentCommand().parameters);
  }  
  this.setWaitMode('message');
};

// 为防止坏档或读档失败而采取的措施
  const _DM_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DM_extractSaveContents.call(this, contents);

	if (!$gameMap) return;
    // 清除子弹数据防止找不到函数索引报错
      $gameMap._mapBulletsQJ = {};
      $gameMap._mapBulletsNameQJ = {};
	  $gameMap._mapBulletsQJLength = 0;

	// 因多语言模块不写入存档，每次读档必须重新加载
	const allowMap = [4,11,21];
    const mapId = $gameMap.mapId();
	if (allowMap.includes(mapId)) {
    const key = 'MapEventDialogue' + mapId; 
    if (!window[key]) { 
       chahuiUtil.loadMapEventDialogue();
      }	
	}
	
};

/*
// 确保读档时必定有加载多语言语料
const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);

      const mapId = $gameMap.mapId();
	  if ([4,21].includes(mapId)) {
      const key   = 'MapEventDialogue' + mapId;
      if (!window[key]) {
        chahuiUtil.loadMapEventDialogue();
        }
      }
};
*/

// 根据语言重置数据库信息
DataManager.updateLocalizedNames = function() {
	
	// 还原正常版本
    if ( DrillUp.g_COSt_list[ 119 ]['context'] !== "Mio" ) {
        let heroineName = window.systemFeatureText.heroineName || "Imouto";
        $gameStrings.setValue( 120, String(heroineName) );
        $gameVariables.setValue( 10, String(heroineName) );	
        $gameSwitches.setValue(332, true);
        let heroName = window.systemFeatureText.heroName || "onii-chan";
        $gameStrings.setValue( 121, String(heroName) );		
    }
	
	// 状态
    const sd = window.statesDescription || {};
    const states = $dataStates;
        for (let n = 1; n < states.length; n++) {
            const obj = states[n];
            if (!obj) continue;
            const entry = sd[obj.id] || {};
            let textArray = [];
			
			if (entry.subtitle && entry.subtitle.length >= 1 && entry.subtitle[0] !== "") {
               let subtitleArray = entry.subtitle;
               let template =  "\\c[110]\\fi%TEXT%\\fr";
               subtitleArray = subtitleArray.map(t => template.replace("%TEXT%", t));			
               textArray.push(...subtitleArray);				
			}
			if (entry.description && entry.description.length >= 1 && entry.description[0] !== "") {
               let descriptionArray = entry.description;		
               textArray.push(...descriptionArray);				
			}			
            obj.description = textArray.join("\n");
        }
	
    // 物品
    for (let i = 1; i < $dataItems.length; i++) {
      const desc = window.itemsDescription[String(i)];
      if (desc && desc.name) {
        $dataItems[i].name = desc.name.join();
      }
    }
    // 武器
    for (let i = 1; i < $dataWeapons.length; i++) {
      const desc = window.weaponsDescription[String(i)];
      if (desc && desc.name) {
        $dataWeapons[i].name = desc.name.join();
      }
    }
    // 装备
    for (let i = 1; i < $dataArmors.length; i++) {
      const desc = window.armorsDescription[String(i)];
      if (desc && desc.name) {
        $dataArmors[i].name = desc.name.join();
      }
    }
	
  function getLocalizedName(descObj, id) {
    const entry = descObj?.[String(id)];
    if (!entry?.name) return null;
    return typeof entry.name === 'string'
      ? entry.name
      : Array.isArray(entry.name) && entry.name.length
        ? entry.name.join('')
        : null;
  }

  function refreshNames(dataArray, descObj) {
    if (!Array.isArray(dataArray)) return;
    dataArray.forEach(item => {
      // —— 跳过空值或没有 baseItemId 的条目 —— 
      if (!item || item.baseItemId == null) return;

      const newName = getLocalizedName(descObj, item.baseItemId);
      if (newName) {
        item.name = newName;
      }
    });
  }

    refreshNames(DataManager._independentWeapons, window.weaponsDescription);
    refreshNames(DataManager._independentArmors,  window.armorsDescription);
};




DataManager.reloadLanguage = async function(needSave=false){

  if (needSave) ConfigManager.save();
  const curLang = ConfigManager.language;     // 0-CN|1-JP|2-EN|3-RU…
  const key     = LANG_CODE[curLang] ?? "EN";  
  /* ① 先保证 systemFeatureText 已加载目标语言 ---------------- */
  await extraJsonLoad(
    'systemFeatureText',                           // 变量名
    `data/${key}/systemFeatureText_${key}.json`,   // 可能缺；函数内部会 fallback
  ); 
  
  const sysText = window.systemFeatureText;  
  if (sysText){
    const ln = String(curLang);

    /* 自动修改女主角认知 */
	const raw = $gameVariables.value(10);
    const input = raw != null ? String(raw).toLowerCase() : "";
	let isImouto = IS_IMOUTO.some(keyword =>
          input.includes(keyword.toLowerCase())
    );
    if (DrillUp.g_COSt_list[ 119 ]['context'] !== "Mio")  isImouto = true;

    if (isImouto) {
		let rawTitle = window.systemFeatureText.gameTitle;
		let titleStr = Array.isArray(rawTitle) ? rawTitle.join("") : String(rawTitle);
		let newTitle = titleStr
    		.replace(/少女/g, "妹妹")      
    		.replace(/彼女/g, "妹")        
    		.replace(/girl/gi, "Sister");  
        window.systemFeatureText.gameTitle = [newTitle];		
	}
    /* 刷新音量设置文本 */
    $dataSystem.terms.messages.bgmVolume = sysText.BgmVolume;
    $dataSystem.terms.messages.bgsVolume = sysText.BgsVolume;
    $dataSystem.terms.messages.seVolume  = sysText.SeVolume;

    /* 刷新自定义选项文本 */
    ConfigManager.customParams = null;
    ConfigManager.getCustomParams();

    /* 刷新游戏标题 */
    const ver = ($dataSystem.gameTitle.match(/(ver[\d.]+[A-Za-z]*)$/i)||[])[1]||"";
    $dataSystem.gameTitle = sysText.gameTitle + (ver ? ` ${ver}` : "");
    document.title        = $dataSystem.gameTitle;
    if (window.nw?.Window) nw.Window.get().title = document.title;
  }

  /* 刷新对话框皮肤 */
      let data = $gameSystem.drill_DSk_getStyle("Drill_DNB_NameBoxWindow");
	  let lang = ConfigManager.language;
      if (lang > 2) lang = 2;
      data['window_pic_src'] = 'talkback_namebox' + lang;

  /* 根据系统语言刷新字体使用格式 */
   if (window.DrillUp) {
       switch (curLang) {
           case 0:                             // 中文
               DrillUp.g_DFF_fontFace = "Haiyanzhishidongdong";
               break;

           case 3:                             // 俄语
               DrillUp.g_DFF_fontFace = "Huninn";
               break;
			   
           case 4:                             // 法语
               DrillUp.g_DFF_fontFace = "Huninn";
               break;
			   
           default:                            // 日语、英语等
               DrillUp.g_DFF_fontFace = "FOT-NewCinemaA Std D";
       }
   }
  if ($gameMap && $gameMap.mapId() > 0) {
      const mark = 'MapEventDialogue' + $gameMap.mapId(); 
      if (window[mark]) chahuiUtil.loadMapEventDialogue(); 
  }

  /*  批量加载多语 JSON --------------------------------------*/
  await Promise.all([
    extraJsonLoad('dataSceneObjectDescriptionText',`data/${key}/sceneObjectDescriptionText_${key}.json`),  
    extraJsonLoad('mapCommonEventDialogue',        `data/${key}/MapCommonEventDialogue${key}.json`),
	extraJsonLoad('systemFeatureText',             `data/${key}/systemFeatureText_${key}.json` ),
    extraJsonLoad('prototypeEventTemplate',        `data/${key}/MapEventDialogue${key}001.json`),
    extraJsonLoad('skillDescription',              `data/${key}/skillDescription${key}.json` ),
    extraJsonLoad('itemsDescription',              `data/${key}/ItemsDescription${key}.json` ),
    extraJsonLoad('weaponsDescription',            `data/${key}/WeaponsDescription${key}.json` ),
    extraJsonLoad('armorsDescription',             `data/${key}/ArmorsDescription${key}.json` ),
	extraJsonLoad('statesDescription',             `data/${key}/statesDescription${key}.json` )
  ]);
  DataManager.loadSpawnMapData(1);
};

/*───────────────────────────────────────────────────────────────────
  为兼容更多语言，优先读取英语，然后覆盖正在选择的语言模块，可兼容未完成的文本
 *──────────────────────────────────────────────────────────────────*/
function extraJsonLoad(targetVar, url, { fallback = {} } = {}) {
  return new Promise(resolve => {

    const prev = window[targetVar] || {};          // 先保存旧内容
    const xhr  = new XMLHttpRequest();
	
	if ( Utils.isMobileDevice() ) {
	    const urlcdv = window.cdvUrl + url;
        xhr.open('GET',  urlcdv);		
	} else {
		xhr.open('GET', url);
	}
    xhr.overrideMimeType('application/json');

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        window[targetVar] = Object.assign({}, prev, data); // 合并到旧内容
      } catch (e) {
        console.warn(`[extraJsonLoad] JSON parse error in ${url}`, e);
        window[targetVar] = prev;                          // 回滚
      }
      resolve(window[targetVar]);
    };

    xhr.onerror = () => {
      console.warn(`[extraJsonLoad] Missing ${url} → keep previous`);
      window[targetVar] = prev;                            // 完全保持旧值
      resolve(prev);
    };

    xhr.send();
  });
}

window.chahuiUtil = window.chahuiUtil || {};

chahuiUtil.loadMapEventDialogue = function (Specified) {
  
  if (!Specified) Specified = ConfigManager.language;
  
  const mapIdRaw = $gameMap.mapId();                 // 4
  const mapIdPad = String(mapIdRaw).padStart(3, '0'); // "004"
  const key      = `MapEventDialogue${mapIdRaw}`;     // window 变量

  // 小语种默认加载英语
  if (Specified > 2) {
  extraJsonLoad(key, `data/EN/MapEventDialogueEN${mapIdPad}.json`, {});
  }

  // ② 目标语言（可能缺）
  const ln = LANG_CODE[Specified] || "EN";
  extraJsonLoad(key, `data/${ln}/MapEventDialogue${ln}${mapIdPad}.json`, {});
 
};

// 动态变化状态描述文本
DataManager.changeDifferenceStateDescription = function(id,index) {  
            const obj = $dataStates[id];
            const sd = window.statesDescription[String(id)]["variants"];
            const entry = sd[String(index)] || {};
            let textArray = [];
			
			if (entry.subtitle && entry.subtitle.length >= 1 && entry.subtitle[0] !== "") {
               let subtitleArray = entry.subtitle;
               let template =  "\\c[110]\\fi%TEXT%\\fr";
               subtitleArray = subtitleArray.map(t => template.replace("%TEXT%", t));			
               textArray.push(...subtitleArray);				
			}
			if (entry.description && entry.description.length >= 1 && entry.description[0] !== "") {
               let descriptionArray = entry.description;		
               textArray.push(...descriptionArray);				
			}			
            obj.description = textArray.join("\n");  
};


/* 乱码混淆 */
(() => {

  /* ---------- 乱码字符池 ---------- */
  const POOLS = [
    [...'ｦｧｨｩｪｫｬｭｮｯﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓ'],    
    [...'БГДЖЙЛПФЩЪЫЬ'],                
    [...'ΔΞΠΣΦΨΩΘΛΓ'],                  
    [...'辟ｶ閠鯉ｼ悟叉萓ｿ蜿ｪ譏ｯ霑吝ｾｮ荳崎ｶｳ驕鍋噪谿句桃鬲費ｼ檎ｻ晞撼閭ｽ豁｣遑ｮ譏ｾ遉ｺ荳堺ｼ壻ｹｱ遐りｿ呎弍蝗蜃｡'],
	[...'莠ｺ謇閭ｽ霓ｻ譏灘小蜚､窶披霑吩ｸｪ鬘ｵ髱｢荳ｻ隕∫畑譚･隗ょｯ滉ｸ谿ｵ譁'], 
	[...'餈嗘葵憿菟𢒰銝餉賣迤蝖格遬蝷箔堒銁蝻𣇉糓隞冊摮㛖泵銝'],
    [...'abcdefghijklmnopqrstuvwxyz'],    
    [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']     
  ];

  function garbleOne(str){
    let out = '';
    for (const ch of str){
      if (/[\s]/.test(ch)){ out += ch; continue; }

      const pool = POOLS[Math.floor(Math.random() * POOLS.length)];
      out += pool[Math.floor(Math.random() * pool.length)];
    }
    return out;
  }

  /** garble(textOrArray) → 同类型乱码 */
  function garble(input){
    return Array.isArray(input)
      ? input.map(s => garbleOne(String(s)))
      : garbleOne(String(input));
  }

  // 导出到全局
  if (typeof module !== 'undefined') module.exports = garble;
  else                               window.garble = garble;

})();



// 优化设置界面不同语言的显示效果
(function() {

  const GAP = 100;                               // 额外间距值

Window_Options.prototype.windowWidth = function() {
	let value = 500;
	if (ConfigManager.language > 1)  value = 640;   // 中日语不提升窗口宽度
    return value;
};

  const _drawItem = Window_Options.prototype.drawItem;
  Window_Options.prototype.drawItem = function(index) {

    const title  = this.commandName(index);
    const status = this.statusText(index);
    const rect   = this.itemRectForText(index);
    const sw     = this.statusWidth();          

    // 标题区域 = 总宽 - 数值宽 - GAP
    let tw = rect.width - sw - GAP;
    if (ConfigManager.language <= 1)  tw += GAP;
	
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(title, rect.x, rect.y, tw);
    this.drawText(status, rect.x, rect.y, rect.width, 'right');
  };

})();



//修改了item描述的显示格式
Window_Help.prototype.setItem = function(item) {

  if (item) {
    const combinedText = DataManager.isSkill(item)
        ? QJ.MPMZ.tl.ex_playerSetSkillDescription(item)
        : QJ.MPMZ.tl.ex_playerSetItemDescription(item);
    this.setText(combinedText);
  } else {
    this.setText("");
  }

};


chahuiUtil.customizeImoutoName = function (oldSave) {

   let textArray = window.systemFeatureText && window.systemFeatureText.renameCharacter;
   if (!textArray) textArray = ["I remember now—","she is..."];

   if (oldSave) {
			switch (ConfigManager.language) {
                case 0: 
                textArray.push("（请重新设定你对女主角的称呼！）");
                break;
                case 1: 
                textArray.push("（ヒロインの呼び方をもう一度設定してください！）");			
                break;	
                case 2:
                default: 				
                textArray.push("(Please reassign how you refer to the heroine!)");				
                break;	            
			}	   
   }
   let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");
   
   let  ss = prompt( text, $gameStrings.value(120) );
   if ( ss != undefined ) {

        // 加权长度计算：汉字/假名算 2，其它算 1
        const weightedLength = str => {
            let len = 0;
            const reWide = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uFF66-\uFF9F]/;
            for (const ch of str) {
                len += reWide.test(ch) ? 2 : 1;
            }
            return len;
        };
        // 超过 8 点位，重新输入
        if (weightedLength(ss) > 8 || weightedLength(ss) <= 0) {					
            chahuiUtil.customizeImoutoName();
            return false;
        }
	  
      $gameSwitches.setValue(332, true);	  
      $gameStrings.setValue( 120, ss );
	  $gameVariables.setValue( 10, ss );
   }

    /* 自动修改女主角认知 */
	const raw = $gameVariables.value(10);
    const input = raw != null ? String(raw).toLowerCase() : "";
	const isImouto = IS_IMOUTO.some(keyword =>
          input.includes(keyword.toLowerCase())
    );
    if (isImouto) {
		let rawTitle = window.systemFeatureText.gameTitle;
		let titleStr = Array.isArray(rawTitle) ? rawTitle.join("") : String(rawTitle);
		let newTitle = titleStr
    		.replace(/少女/g, "妹妹")      
    		.replace(/彼女/g, "妹")        
    		.replace(/girl/gi, "Sister");  
        window.systemFeatureText.gameTitle = [newTitle];
      /* 刷新游戏标题 */
        const ver = ($dataSystem.gameTitle.match(/(ver[\d.]+[A-Za-z]*)$/i)||[])[1]||"";
        $dataSystem.gameTitle = window.systemFeatureText.gameTitle + (ver ? ` ${ver}` : "");
        document.title        = $dataSystem.gameTitle;
        if (window.nw?.Window) nw.Window.get().title = document.title;
      /* 自动修改男主角认知 */	
        let heroName = window.systemFeatureText.heroName || "onii-chan";
        $gameStrings.setValue( 121, heroName );
	}
    
    return true;	
};