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
// 系统功能文本需要最先载入
DataManager._databaseFiles.unshift({
  name: 'systemFeatureText',
  src:  'systemFeatureText.json'
});

    DataManager.loadDataFile(
      'systemFeatureText',
      'systemFeatureText.json'
    );

     ConfigManager.language = 2;
    // --- 保存时写入 language ---
    const _Config_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        const config = _Config_makeData.call(this);
        config.language = this.language;
        return config;
    };	 
    // --- 加载时应用 language：优先读配置，否则自动检测 ---
    const _Config_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _Config_applyData.call(this, config);
        if (config.language !== undefined) {
            this.language = Number(config.language);
        } else {
            // 第一次运行或未配置时，根据系统语言检测
            const nav = navigator.language.toLowerCase();
            if (nav.startsWith('zh'))      this.language = 0;
            else if (nav.startsWith('ja')) this.language = 1;
            else                            this.language = 2;
        }
	   // 适配系统语言修正默认字体
	   if (ConfigManager.language === 0) {
	     DrillUp.g_DFF_fontFace = "Haiyanzhishidongdong";
	   } else {
	     DrillUp.g_DFF_fontFace = "FOT-NewCinemaA Std D";
	   }				
    };

    // --- 根据 ConfigManager.language 加载对应语言的数据文件 ---
    const _Data_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
		// 保证先把配置读进来（并执行 applyData）
        ConfigManager.load();
        const lang = ConfigManager.language;
        const test = this.isBattleTest() || this.isEventTest();
        const prefix = test ? 'Test_' : '';
        for (let i = 0; i < this._databaseFiles.length; i++) {
            const name = this._databaseFiles[i].name;
            let src = this._databaseFiles[i].src;
			if ( !['systemFeatureText.json','Enemies.json','CommonEvents.json','System.json'].includes(src) ) {
            // 从 GameLanguage文件夹读取
            src = `GameLanguage${lang}/${src}`;
			}
            this.loadDataFile(name, prefix + src);
        }
        if (this.isEventTest()) {
            this.loadDataFile('$testEvent', prefix + 'Event.json');
        }
    };	
	
  const _DM_loadMapData = DataManager.loadMapData;
  DataManager.loadMapData = function(mapId) {
    // 多语言适配
    const lang = ConfigManager.language;

    if (mapId > 0) {

      const padded = String(mapId).padStart(3, '0');
	  let filename = `Map${padded}.json`;
	    if ( !['Map054.json','Map051.json','Map033.json','Map021.json','Map002.json'].includes(filename) ) {
          filename = `GameLanguage${lang}/Map${padded}.json`;
		}
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
    const src = `GameLanguage${lang}/Map${padded}.json`;
	
    let xhr = new XMLHttpRequest();
    let url = 'data/' + src;
    xhr.open('GET', url);
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
                let lang = 2;
                let nav = navigator.language.toLowerCase();
                if (nav.startsWith('zh'))      lang = 0;
                else if (nav.startsWith('ja')) lang = 1;
				
				let textArray = window.systemFeatureText["SwitchLanguage"][String(lang)];
				let text = textArray.join('\n');
                alert(text);
                ConfigManager.save();
                location.reload();
            
         } 
    };
//=============================================================================
// 根据语言加载指定公共事件和场景物件语料库
//=============================================================================
var shiroin_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
	
    shiroin_Scene_Boot_start.call(this);
    
	if (window.systemFeatureText) {
	let lang = ConfigManager.language;
	  $dataSystem.terms.messages['bgmVolume'] = window.systemFeatureText["BgmVolume"][String(lang)];
	  $dataSystem.terms.messages['bgsVolume'] = window.systemFeatureText["BgsVolume"][String(lang)];
	  $dataSystem.terms.messages['seVolume'] = window.systemFeatureText["SeVolume"][String(lang)];	
	  // 适配修改游戏标题
	  const oldTitle = $dataSystem.gameTitle;  
	  const newBaseTitle = window.systemFeatureText["gameTitle"][String(lang)];  
	  const m = oldTitle.match(/(ver[\d.]+[A-Za-z]*)$/i);  
	  const version = m ? m[1] : "";  
	  $dataSystem.gameTitle = version  
	    ? `${newBaseTitle} ${version}`  
	    : newBaseTitle;
	  
	 const newTitle = $dataSystem.gameTitle;
     document.title = newTitle;
     // 如果是在 NW.js 环境，用 NW.js API 更新原生窗口标题
     if (window.nw && nw.Window) {
        nw.Window.get().title = newTitle;
      }
	}

    var titleText = $dataSystem.gameTitle || "";
    var langKey   = titleText.includes("和存在感薄弱妹妹一起的简单生活")
                  ? "CN"
                  : titleText.includes("存在感薄い妹との簡単生活")
                  ? "JP"
                  : "EN";

    DataManager.loadDataFile(
      'mapCommonEventDialogue',
      `MapCommonEventDialogue${langKey}.json`
    );
	
    DataManager.loadDataFile(
      'dataSceneObjectDescriptionText',
      'sceneObjectDescriptionText.json'
    );	
};

//=============================================================================
// 地图事件多语言适配
//=============================================================================
var chahuiUtil = chahuiUtil || {};

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

// 检查地图数据是否真实存在
chahuiUtil.checkMapEventExists = function(mapId) {
	
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

        chahuiUtil.multilingualCompatibleDisplayText.call(this, textArray);
};

// 重置语言标记
chahuiUtil.resetSystemLanguageFlag = function() {
	
   var titleText = $dataSystem.gameTitle;
   
   if (titleText.includes("和存在感薄弱妹妹一起的简单生活")) {
        $gameVariables.setValue(1, 0);
    } else if (titleText.includes("存在感薄い妹との簡単生活")) {
        $gameVariables.setValue(1, 1);
    } else if (titleText.includes("A Simple Life with My Unobtrusive Sister")) {
        $gameVariables.setValue(1, 2);
    } else {
		$gameVariables.setValue(1, 0);
	}
};


// 初始载入地图对话多语言模板
chahuiUtil.loadMapEventDialogue = function() {

	// 重置系统语言标记
   var titleText = $dataSystem.gameTitle;
   if (titleText.includes("和存在感薄弱妹妹一起的简单生活")) {
        $gameVariables.setValue(1, 0);
    } else if (titleText.includes("存在感薄い妹との簡単生活")) {
        $gameVariables.setValue(1, 1);
    } else if (titleText.includes("A Simple Life with My Unobtrusive Sister")) {
        $gameVariables.setValue(1, 2);
    }
  
    let mapId = $gameMap.mapId();
    let key = "MapEventDialogue" + mapId;
    let lang,json;
	
    switch ($gameVariables.value(1)) {
      case 0:
      lang = "CN";  
	  break;
      case 1:
      lang = "JP";  
	  break;
      case 2:
      lang = "EN";  
	  break;
      default:
      lang = "CN"; 
	  break;
  }
    mapId = String(mapId).padStart(3, '0');
	json = "MapEventDialogue" + lang + mapId + ".json";
	
   DataManager.loadDataFile(key, json);	
};

// 多语言适配显示文本
chahuiUtil.multilingualCompatibleDisplayText = function(textArray) {
  // 基本设置：清头像区、背景、位置
  $gameMessage.setFaceImage('', 0);
  $gameMessage.setBackground(0);
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
