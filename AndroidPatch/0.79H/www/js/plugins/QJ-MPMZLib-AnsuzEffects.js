//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][卢恩特效模板]
 * @author 仇九
 *
 * @help 
 * 
 *
 */
//=============================================================================
//生成并记录谏言
//=============================================================================
var chahuiUtil = chahuiUtil || {};

const appScript = "https://script.google.com/macros/s/AKfycbxsLOC-fYpCKiCQA6Mg3P0Ymy8X3wwucxeXpkkZslHs4TTBB9wV-agK4vnAO0yQZuzd/exec";

// 生成谏言符文
QJ.MPMZ.tl.ex_summonAnuszRune = function() {
    const mapId = $gameMap.mapId();
    let userLang = ConfigManager.language;
    if (![0, 1, 2].includes(userLang)) userLang = 0;
    const AnsuzRevelation = "AnsuzRevelation" + userLang;
    let count = $gameVariables.value(55);
    if (!Number.isInteger(count) || count < 0) return;
    count = Math.min(count, 100);

    // 调用获取多条随机条目的方法
    const maybePromise = StorageManager.getMultipleRandomEntries(AnsuzRevelation, mapId, count);

    // 如果返回值是一个 Promise（移动端环境），就用 .then() 等待结果
    if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(function(AnuszRunes) {
            if (!Array.isArray(AnuszRunes)) return;
            for (const AnuszRune of AnuszRunes) {
                if (
                    AnuszRune &&
                    typeof AnuszRune.textPosX === "number" &&
                    typeof AnuszRune.textPosY === "number" &&
                    typeof AnuszRune.revelationText === "string"
                ) {
                    QJ.MPMZ.tl.ex_createAnuszRune(
                        AnuszRune.textPosX,
                        AnuszRune.textPosY,
                        AnuszRune.revelationText,
                        AnuszRune.author,
                        false
                    );
                } else {
                    console.log("无效的数据:", AnuszRune);
                }
            }
        }).catch(function(err) {
            console.error("读取多条随机条目失败:", err);
        });
    } else {
        // 同步返回数组（PC 桌面端 NW.js 环境）
        const AnuszRunes = maybePromise;
        if (!Array.isArray(AnuszRunes)) return;
        for (const AnuszRune of AnuszRunes) {
            if (
                AnuszRune &&
                typeof AnuszRune.textPosX === "number" &&
                typeof AnuszRune.textPosY === "number" &&
                typeof AnuszRune.revelationText === "string"
            ) {
                QJ.MPMZ.tl.ex_createAnuszRune(
                    AnuszRune.textPosX,
                    AnuszRune.textPosY,
                    AnuszRune.revelationText,
                    AnuszRune.author,
                    false
                );
            } else {
                console.log("无效的数据:", AnuszRune);
            }
        }
    }
};


//创造谏言符文
QJ.MPMZ.tl.ex_playerCreateAnuszRuneOption = function() {
	
			var text,option1,option2;
            const lang = ConfigManager.language;
			switch (lang) {
                case 0: 
                text = "确定要留下这样的讯息吗？";
				option1 = "是的";
				option2 = "算了";
                break;
                case 1: 
                text = "このメッセージを残していい？";
				option1 = "はい";
				option2 = "いいえ";				
                break;	
                case 2: 
                text = "Am I really going to leave this message?";
				option1 = "Confirm";
				option2 = "Never mind";				
                break;
                default: 
                text = "Am I really going to leave this message?";
				option1 = "Confirm";
				option2 = "Never mind";					
                break;	            
			}
			$gameStrings.setValue(6,text);
			$gameStrings.setValue(7,option1);
			$gameStrings.setValue(8,option2);
};

// 创造谏言符文
QJ.MPMZ.tl.ex_createAnuszRune = function(posX, posY, revelationText, author, login) {
    var tileSize = 48;
    posX = (posX - $gameMap.displayX()) * tileSize;
    posY = (posY - $gameMap.displayY()) * tileSize;

    var index = $gameMap.getGroupBulletListQJ('AnuszRune').length + 1;
    var RuneName = "AnuszRune" + index;

    var TextColor = "#c9503c";
    var ShadowColor = "#530000";
    var iconIndex = $dataItems[43].iconIndex - 11;
    var FontFace = "RiiTegakiFude";
    var blend = 0;

    if (String(author).trim() === "master") {
        TextColor = "#fff59f";
        ShadowColor = "#000000";
        iconIndex -= 21;
        blend = 1;
    }

    // 中文适配
    if (ConfigManager.language === 0) {
        FontFace = "Haiyanzhishidongdong";
    }
    
	//FontFace = "Nagurigaki Crayon";
	
	let iconScale = 0.5;
	let collisionRadius = 42;
    // 移动端适配
    if (Utils.isMobileDevice()) {
        iconScale = 1.2;
		collisionRadius = 21;
    }

    // 创建符文本体
    var Anusz = QJ.MPMZ.Shoot({
        img: ['I', iconIndex],
        groupName: ['AnuszRune', RuneName],
        position: [['S', posX], ['S', posY]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        scale: iconScale,
        opacity: '0|1~120/0.3~120/1',
        collisionBox: ['C', collisionRadius],
        moveType: ['S', 0],
        z: "E",
        blendMode: blend,
        existData: [],
        moveF: []
        // timeline: ['S', 0, 120, [180, 2, 60]],
    });

    // 谏言文字
    var textPosX = Anusz.inheritX();
    var textPosY = Anusz.inheritY() - 32;

    QJ.MPMZ.Shoot({
        img: ['T', {
            text: revelationText,
            textColor: TextColor,
            fontSize: 28,
            outlineColor: "#000000",
            outlineWidth: 0,
            fontFace: FontFace,
            fontItalic: false,
            fontBold: true,
            width: -1,
            height: -1,
            textAlign: 5,
            lineWidth: 0,
            lineColor: "#ffffff",
            lineRate: 1.0,
            backgroundColor: null,
            backgroundOpacity: 1,
            shadowBlur: 4,
            shadowColor: ShadowColor,
            shadowOffsetX: 0,
            shadowOffsetY: 0
        }],
        position: [['S', textPosX], ['S', textPosY]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        groupName: ['AnuszText'],
        opacity: 0,
        scale: 0.5,
        moveType: ['S', 0],
        z: "W",
        existData: [
            { t: ['BE', Anusz.index] }
        ],
        moveF: [
            [30, 30, QJ.MPMZ.tl.ex_AnuszEffectActivationCheck, [RuneName]]
        ]
    });

    // 登记谏言
    if (login) {
        var loginPosX = parseFloat($gamePlayer.centerRealX().toFixed(1));
        var loginPosY = parseFloat($gamePlayer.centerRealY().toFixed(1));
        var loginAuthor = Utils.isOptionValid("test") ? "master" : "player";
        QJ.MPMZ.tl.ex_writeAnsuzRevelation(revelationText, loginAuthor, loginPosX, loginPosY);
    }
};


//谏言激活检测
QJ.MPMZ.tl.ex_AnuszEffectActivationCheck = function(index) {
	
    if (!index) return;
	var sss = QJ.MPMZ.getBulletNumberBM(-1,['C',24],[index]);
	if (sss == 0) {
		if (this.opacity >= 1) {
	  this.changeAttribute("opacity",'0|1~30/0~99999|0');
		}
	} else {
		if (this.opacity <= 0) {
	  this.changeAttribute("opacity",'0|0~30/1~99999|1');
		}
	}	
};

StorageManager.appendDataFile = function(src, mapId, newEntry) {
    if (this.isLocalMode()) {
        var fs = require('fs');
        var path = require('path');
        var base = path.dirname(process.mainModule.filename);
        var dirPath = path.join(base, 'data/');
        var filePath = path.join(dirPath, src + ".json");

        let existingData = {};

        // 先读取文件内容（如果文件存在）
        if (fs.existsSync(filePath)) {
            try {
                let rawData = fs.readFileSync(filePath, 'utf8');
                existingData = JSON.parse(rawData);
            } catch (error) {
                console.error("读取 JSON 失败:", error);
                return;
            }
        }

        // 确保 `existingData` 以地图 ID 为分类
        if (!existingData[mapId]) {
            existingData[mapId] = [];
        }

        // 确保 newEntry 数据格式正确
        if (
            typeof newEntry["revelationText"] === "string" &&
            typeof newEntry["author"] === "string" &&
            typeof newEntry["textPosX"] === "number" &&
            typeof newEntry["textPosY"] === "number"
        ) {
            existingData[mapId].push(newEntry); // 追加新数据
        } else {
            console.error("数据格式不符合要求！");
            return;
        }

        // 确保 `data/` 目录存在
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        // 写入更新后的数据
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4), 'utf8');

        console.log(`已更新 ${filePath}:\n`, existingData);
    } else {
        console.log("appendDataFile: Not local");
    }
};

//=============================================================================
//读取并提取谏言
//=============================================================================
StorageManager.getRandomEntryFromMap = function(src, mapId) {
    if (this.isLocalMode()) {
        var fs = require('fs');
        var path = require('path');
        var base = path.dirname(process.mainModule.filename);
        var filePath = path.join(base, 'data/', src + ".json");

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.error(`文件 ${filePath} 不存在`);
            return null;
        }

        // 读取 JSON 数据
        try {
            let rawData = fs.readFileSync(filePath, 'utf8');
            let jsonData = JSON.parse(rawData);

            // 检查是否有该地图 ID 的数据
            if (!jsonData[mapId] || jsonData[mapId].length === 0) {
                console.error(`地图 ${mapId} 下没有数据`);
                return null;
            }

            // 随机选择一个对象
            let randomIndex = Math.floor(Math.random() * jsonData[mapId].length);
            let selectedEntry = jsonData[mapId][randomIndex];

            console.log(`从地图 ${mapId} 获取的随机数据:`, selectedEntry);
            return selectedEntry;

        } catch (error) {
            console.error("读取或解析 JSON 失败:", error);
            return null;
        }
    } else {
        console.log("getRandomEntryFromMap: Not local");
        return null;
    }
};

StorageManager.getMultipleRandomEntries = function (src, mapId, count) {
  return new Promise((resolve) => {
	  
    // 检测是否在 Node.js 环境（NW.js 桌面版）
    const isNode = (typeof require === "function" && typeof process === "object");

    if (isNode) {
      // ── 桌面 NW.js：使用 fs 同步读取 ──
      try {
        const fs = require("fs");
        const path = require("path");
        const base = path.dirname(process.mainModule.filename);
        const filePath = path.join(base, "data", `${src}.json`);

        if (!fs.existsSync(filePath)) {
          console.error(`文件 ${filePath} 不存在`);
          return resolve([]);
        }

        const rawData = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(rawData);
        const allEntries = jsonData[mapId] || [];
        if (!allEntries.length) {
          return resolve([]);
        }

        // 分组与洗牌
        const official = allEntries.filter((e) => e.author === "master");
        const players = allEntries.filter((e) => e.author !== "master");
        const shuffle = (arr) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        shuffle(official);
        shuffle(players);

        const result = official.concat(players).slice(0, count);
        return resolve(result);
      } catch (err) {
        console.error("读取或解析 JSON 失败:", err);
        return resolve([]);
      }
    }

    // ── Cordova (安卓) 或其他无 Node.js 的环境：使用 XMLHttpRequest 读取 ──
    // 相对于游戏根目录，data/ 文件夹在本地可直接使用相对路径
    const url = `data/${src}.json`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // 在本地 file:// 上，status 可能是 0，也可视为成功
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            const jsonData = JSON.parse(xhr.responseText);
            const allEntries = jsonData[mapId] || [];
            if (!allEntries.length) {
              return resolve([]);
            }
            // 分组与洗牌
            const official = allEntries.filter((e) => e.author === "master");
            const players = allEntries.filter((e) => e.author !== "master");
            const shuffle = (arr) => {
              for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              return arr;
            };
            shuffle(official);
            shuffle(players);
            const result = official.concat(players).slice(0, count);
            return resolve(result);
          } catch (e) {
            console.error("解析 JSON 失败:", e);
            return resolve([]);
          }
        } else {
          console.error(`XHR 读取失败，status=${xhr.status}`);
          return resolve([]);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error("XHR 网络错误:", e);
      return resolve([]);
    };
    xhr.send();
  });
};





//=============================================================================
//书写谏言
//=============================================================================
QJ.MPMZ.tl.ex_writeAnsuzRevelation = function(text,user,posX,posY) {
    var mapId = $gameMap.mapId();
	var userLang = ConfigManager.language;
	if ( userLang > 2 ) userLang = 2;
	var file = "AnsuzRevelation" + userLang;
    var newData = {
    "revelationText": text,
    "textPosX": posX,
    "textPosY": posY,
    "author": "player"
  };

    StorageManager.appendDataFile(file, mapId, newData);
	// 联网登记
	
  var dataToSend = {
    mapId: mapId,
    data: [newData]
  };
  var fileName = "AnsuzRevelation" + userLang + "/json";	
  var url = appScript
             + "?mode=addRevelations"
			 + "&lang=" + userLang;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", fileName);

            var lang = ConfigManager.language;
            switch (lang) {
                case 0:
                    lang = "Ansuz文字标记登录失败！请检查网络连接！";
                    break;
                case 1:
                    lang = "アンスズのログインに失敗！ネット接続を確認してください！";
                    break;
                case 2:
                    lang = "Ansuz login failed! Check your network!";
                    break;
                default:
                    lang = "Ansuz login failed! Check your network!";
                    break;
            }
	
    var text = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + lang;
    var x =  $gamePlayer.screenX() * $gameScreen.zoomScale();
    var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;

  xhr.onload = function(){
    if (xhr.status < 400) {
          
    } else {
      $gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 90 );
    }
  };
  xhr.onerror = function(){
      $gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 90 );
  };

  xhr.send(JSON.stringify(dataToSend));	
	
};

// 成功更新计数
chahuiUtil.autoUpdateSuccessCount = function() {
    const gameTitle = $dataSystem.gameTitle;
    const match = gameTitle.match(/ver0\.(\d+)/i);
    let version;
    if (match) {
        version = parseInt(match[1], 10);
		
	if (version > 100) {
		version = 72;
	}			
		
    } else {
        version = 75;
    }

    let userLang = ConfigManager.language;
    if (userLang > 2) userLang = 2;

    const url =
        appScript +
        "?mode=UpdateSuccessful" +
        "&lang=" + userLang +
        "&version=" + version;
        
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
};


// 获取更新履历
chahuiUtil.getGameUpdateLog = function() {
	 
    var versionB = "0.1";
	$gameStrings.setValue(1,"");
	$gameStrings.setValue(15,"");
    var title = $dataSystem.gameTitle;
    var match = title.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        var versionA = match[1];
    } else {
        return false;
    }
	var userLang = ConfigManager.language;
	if (![0,1,2].includes(userLang)) userLang = 2;
	
    var url = appScript
            + "?mode=LatestVersion"
			+ "&lang=" + userLang
			+ "&version=" + versionA;		

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();

    xhr.onload = function() {     

        if (xhr.status === 0 || xhr.status >= 400) return;

        // 解析 JSON 
        var result;
        try {
            result = JSON.parse(xhr.responseText);
          } catch (_) {
            return;
        }
	    
		result = JSON.parse(xhr.responseText);
        var versionB = result.nextVersion;
		var log = result.update;
        function parseVersion(version) {
            let match = version.match(/^(\d+\.\d+)([A-Z]*)$/);
            if (!match) return [0, ""];
            return [parseFloat(match[1]), match[2] || ""];
        }

        let [numA, letterA] = parseVersion(versionA);
        let [numB, letterB] = parseVersion(versionB);

        // 先比较数值部分
        if (numA !== numB) {
        var result = numA - numB;
        if (result < 0) {
		  $gameStrings.setValue(15, log);
           if ($gameMap.mapId() === 33) {
			   $gameMap.event(1).steupCEQJ(2);
		   }
		}
		return true;
    }

        // 如果数值部分相同，比较字母部分（A < B < C...）
        var result = letterA.localeCompare(letterB);
        if (result < 0) {
		  $gameStrings.setValue(15, log);		  
           if ($gameMap.mapId() === 33) {
			   $gameMap.event(1).steupCEQJ(2);
		   }          
		}
		return true;
    };		
};

// 统计玩家语言情况
chahuiUtil.countPlayersByLanguage = function() {
	  
	  const userLang = (navigator.language || '').toLowerCase();
	  if (userLang == '') return;
	  
	  let version = "";
	  if (Utils.isMobileDevice()) version = "AN";
	  
      var url = appScript
              + "?mode=CountPlayersByLanguage"
			  + "&lang=" + userLang
			  + "&version=" + version;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
      xhr.onload = function() {
          if (xhr.status < 400) {
            $gameSwitches.setValue(336, true);
          } 
      };	
};

// 玩家签到
chahuiUtil.playerDailyLoginReward = function() {
    // 取得当前日期
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var todayNum = y*10000 + m*100 + d;
	var userLang = ConfigManager.language;
	if (userLang > 2) userLang = 2;

    var lastDate = $gameVariables.value(289); 

    if (todayNum > lastDate) {
     
	 // 检测玩家电脑配置
	 if (!Utils.isMobileDevice()) {
       GPUProbe.warnByPolicies({ hasVp9Assets: true });
	 }
	 
	  if (!$gameSwitches.value(336)) {
        chahuiUtil.countPlayersByLanguage();
	  }		  
		
		
	  const gameTitle = $dataSystem.gameTitle;	
	  const match = gameTitle.match(/ver0\.(\d+)/i);
	  var version;
      if (match) {
          version = parseInt(match[1], 10);
		  
		  if (version > 100) {
			  version = 72;
		  }		  
		  
      } else {
          version = 72;
	  }	

      if (Utils.isMobileDevice()) version += "AN";
	  
      var url = appScript
              + "?mode=DailyLogin"
			  + "&lang=" + userLang
			  + "&version=" + version;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
        $gameVariables.setValue(289, todayNum);
    }	
};

// 新存档记录
chahuiUtil.newSaveRecord = function() {
    // 取得当前日期
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var todayNum = y*10000 + m*100 + d;
	var userLang = ConfigManager.language;
	if (userLang > 2) userLang = 2;

    var lastDate = $gameVariables.value(289); 

    if (todayNum > lastDate) {
		
	 // 检测玩家电脑配置
	 if (!Utils.isMobileDevice()) {
       GPUProbe.warnByPolicies({ hasVp9Assets: true });
	 }		
		
	  const gameTitle = $dataSystem.gameTitle;	
	  const match = gameTitle.match(/ver0\.(\d+)/i);
	  var version;
      if (match) {
          version = parseInt(match[1], 10);
		  
		  if (version > 100) {
			  version = 72;
		  }
		  
      } else {
          version = 72;
	  }	
	  
	  if (Utils.isMobileDevice()) version += "AN";
	  
      var url = appScript
              + "?mode=NewSave"
			  + "&lang=" + userLang
			  + "&version=" + version;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
        $gameVariables.setValue(289, todayNum);
    }	 
};

//=============================================================================
//自动更新模块
//=============================================================================

// 自动更新检测
chahuiUtil.autoUpdataCheck = function() {

	//if (Utils.isMobileDevice()) return;	
	if ($gameStrings.value(1).trim() !== "" || $dataSystem.updateLog) {		
		QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
	}
	// 同步游戏公告
	//chahuiUtil.getGameAnnouncement();
	
    var versionB = "0.1";
	$gameStrings.setValue(1,"");
    var title = $dataSystem.gameTitle;
    var match = title.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        var versionA = match[1];
    } else {
        return false;
    }
	var userLang = ConfigManager.language;
	if (![0,1,2].includes(userLang)) userLang = 2;
	
    var url = appScript
            + "?mode=LatestVersion"
			+ "&lang=" + userLang
			+ "&version=" + versionA;				

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();

    xhr.onload = function() {     

        if (xhr.status === 0 || xhr.status >= 400) return;

        // 解析 JSON 
        var result;
        try {
            result = JSON.parse(xhr.responseText);
          } catch (_) {
            return;
        }
	    
		result = JSON.parse(xhr.responseText);
		
		// 读取游戏公告
		if ( result.announcement && result.announcement.trim() !== "" ) {
		    let log = result.announcement;
		    $gameStrings.setValue(25, log);
            QJ.MPMZ.tl._imoutoUtilGameAnnouncementIcon();			
		}
		
        var versionB = result.nextVersion;
		var log = result.update;
        function parseVersion(version) {
            let match = version.match(/^(\d+\.\d+)([A-Z]*)$/);
            if (!match) return [0, ""];
            return [parseFloat(match[1]), match[2] || ""];
        }

        let [numA, letterA] = parseVersion(versionA);
        let [numB, letterB] = parseVersion(versionB);

        // 先比较数值部分
        if (numA !== numB) {
        var result = numA - numB;
        if (result < 0) {
		  $gameStrings.setValue(1,versionB); 
		  $gameVariables.setValue(2, versionB);
		  $gameStrings.setValue(15, log);
		  $dataSystem.updateLog = log;
          QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
		  }
		return true;
    }

        // 如果数值部分相同，比较字母部分（A < B < C...）
        var result = letterA.localeCompare(letterB);
        if (result < 0) {
		  $gameStrings.setValue(1,versionB);
          $gameVariables.setValue(2, versionB);	
		  $gameStrings.setValue(15, log);
          $dataSystem.updateLog = log;		  
          QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
		  }
		return true;
    };		
};

// 自动更新主流程
chahuiUtil.autoUpdate = function (version, isTitle) {

    const patchRoot = Utils.isMobileDevice()
        ? `AndroidPatch/${version}`
        : `patch/${version}`;
    const dirPath   = `${patchRoot}/www`;

    const owner = "shiroin000";
    const repo  = "RPGmaker";
    const branch = "main";
    
	$gameVariables.setValue(86, []);
    // ------------------------------------------------------------------
    // 为下载进度计算先统计文件总数
    // ------------------------------------------------------------------
    listAllGitHubFiles(owner, repo, dirPath, branch)
        .then(files => {
            let textArray = window.systemFeatureText && window.systemFeatureText.totalFilesToUpdate;
            if (!textArray) textArray = "Detected ${} files to update—starting download process!";
            let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");
            const match = String(text).match(/\$\{([^}]*)\}/);
	        if (match)  text = String(text).replace(/\$\{[^}]*\}/g, String(files.length));	
	        text = "\\fs[24]" + text;
		    $gameSystem._drill_GFTH_styleId = 5;
		    $gameTemp.drill_GFTH_pushNewText( text );
            $gameVariables.setValue(8, files.length);
            return files.length;
        })
        .catch(console.error);

    // ------------------------------------------------------------------
    // 开始列表下载
    // ------------------------------------------------------------------
    downloadGitHubDirectory(owner, repo, dirPath, branch)
        .then(() => {
			
            $gameVariables.setValue(2, 0);
			if ($gameMap.mapId() === 33) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 1, "D"], true);
			}
            $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "D"], true);

            // 没有下载压缩包时正常提示并重启
            if (!$gameSelfSwitches.value([$gameMap.mapId(), 1, "Z"])) {
                const msgArr = isTitle
                    ? window.systemFeatureText.UpdateComplete2   
                    : window.systemFeatureText.UpdateComplete1; 
                alert(msgArr.join("\n"));

                setTimeout(() => location.reload(), 1000);
            }
        })
        .catch(err => {
            console.error(err);

            // ---------- 下载出错 ----------
            const lang = ConfigManager.language;
            const errText = {
                0: "游戏更新失败！\n请检查网络或进行手动更新！",
                1: "ゲームの更新に失敗しました！\nネットワークを確認するか、手動で更新してください！",
                2: "Game update failed!\nPlease check your network or update manually!"
            }[lang] || "Game update failed!\nPlease check your network or update manually!";
            alert(errText);

            // 清理标记
            $gameVariables.setValue(2, 0);
			if ($gameMap.mapId() === 33) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 1, "D"], true);
			}
            $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "D"], true);
        });
};


// 使用 Node 原生流解压补丁包，解压过程不卡帧
function ensureModule(name) {

  if (typeof Utils !== "undefined" && Utils.isMobileDevice && Utils.isMobileDevice()) {
    console.warn(`[ZipExtract] Skip loading "${name}" on mobile.`);
    return null;
  }

  if (typeof require !== "function") {
    console.warn(`[ZipExtract] "require" is not available; skip "${name}".`);
    return null;
  }

  try {
    return require(name);
  } catch (e) {
    // 桌面 NW.js 且缺包时，尝试安装
    try {
      const isNw = (typeof Utils !== "undefined" && Utils.isNwjs && Utils.isNwjs()) || !!window.nw;
      if (!isNw) {
        console.warn(`[ZipExtract] Not in NW.js; cannot install "${name}".`);
        return null;
      }
      const child_process = require("child_process");
      console.log(`[ZipExtract] installing ${name} ...`);
      child_process.execSync(`npm install ${name} --prod`, { stdio: "ignore" });
      return require(name);
    } catch (e2) {
      console.error(`[ZipExtract] Failed to install "${name}":`, e2);
      return null;
    }
  }
};

  
// 解压缩方法
chahuiUtil.extractPatch = function (zipFileName, onProgress) {
	
  const StreamZip = ensureModule("node-stream-zip");
  const fs        = require("fs");
  const path      = require("path");	
	
  return new Promise((resolve, reject) => {

    const zipPath = path.join(process.cwd(), zipFileName);
    const zip = new StreamZip.async({ file: zipPath });

    zip.entries().then(async entries => {
      const names = Object.keys(entries);
      const total = names.length;
      let   done  = 0;

      for (const name of names) {
        const entry = entries[name];
        const dest  = path.join(process.cwd(), name);
        if (entry.isDirectory) {
          fs.mkdirSync(dest, { recursive: true });
        } else {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          await zip.extract(entry.name, dest);
        }
        done++;
        onProgress && onProgress(done / total);
      }
      await zip.close();
      resolve();
    }).catch(reject);
  });
};

// 解压缩方法(对应安卓版)
chahuiUtil.androidExtractPatch = function(zipFileName, onProgress) {
  const isCordova = !!(window.cordova && window.resolveLocalFileSystemURL);
  if (!isCordova) {return Promise.reject(new Error('unsupported environment'));}
  const root = cordova.file.dataDirectory;
  function extractWithNative(zipNativePath, destNativeDir) {
    return new Promise((resolve, reject) => {
      if (!window.zip || !window.zip.unzip) {return reject(new Error('native zip plugin not available'));}
      try {
        window.zip.unzip(
          zipNativePath,
          destNativeDir,
          status => {
            if (status === 0) {resolve();
            } else {reject(new Error('unzip failed: ' + status));}},
          rawProgress => {
            let prog;
            if (rawProgress && typeof rawProgress === 'object' && 'loaded' in rawProgress && 'total' in rawProgress) {
              prog = rawProgress.loaded / rawProgress.total * 100;
            } else {prog = Number(rawProgress);}
            if (isNaN(prog)) {prog = 0;}
            const fraction = prog / 100;
            if (onProgress) {
              try {
                onProgress(fraction);
              } catch (e) {
              }}});
      } catch (e) {
        reject(e);
      }});
  }
  const zipNativePath = root + zipFileName;
  const destNativeDir = root;
  return new Promise((resolve, reject) => {
    extractWithNative(zipNativePath, destNativeDir)
      .then(resolve)
      .catch(reject);
  });
};

// 解压缩 zip 安装补丁流程
// 需要注意压缩包必须处于www路径下,压缩包内无需再出现www路径
chahuiUtil.extractAndInstallPatch = async function () {

  function normalizeToArray(val) {
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    if (val == null) return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      // JSON 数组字符串
      if (s[0] === "[" && s[s.length - 1] === "]") {
        try {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) return arr.filter(Boolean).map(String);
        } catch (e) { /* fallthrough */ }
      }
      // 逗号或空白分隔
      if (s.includes(",")) return s.split(/\s*,\s*/).filter(Boolean);
      const maybeSplit = s.split(/\s+/).filter(Boolean);
      if (maybeSplit.length > 1) return maybeSplit;
      return [s];
    }
    return [String(val)];
  }

  // —— 文本工具 ——
  function joinTextArray(textArray, fallbackArr) {
    let arr = textArray || fallbackArr;
    return Array.isArray(arr) ? arr.join("\n") : String(arr ?? "");
  }

  // —— 读取储存了压缩包文件名的变量并标准化为数组 ——
  const v86 = $gameVariables.value(86);
  const zipNamesRaw = normalizeToArray(v86);
  if (zipNamesRaw.length === 0) return;

  // —— 移动端 ——
  if (Utils.isMobileDevice()) {
    chahuiUtil.androidExtractAndInstallPatch(zipNamesRaw);
    return;
  }

  // —— PC / NW.js 路径 ——
  const fs   = require("fs");
  const path = require("path");

  // 非 test 模式时，强制加上 www/ 前缀
  const addPrefix = !Utils.isOptionValid("test") && !Utils.isMobileDevice();
  const zipNames = zipNamesRaw.map(n => {
    const name = String(n).trim();
    if (!name) return name;
    return addPrefix && !/^www\//i.test(name) ? ("www/" + name) : name;
  });

  // —— 绝对路径 & 先验证所有文件是否存在 ——
  const cwd = process.cwd();
  const zipPaths = zipNames.map(n => path.join(cwd, n));
  const missing = zipPaths
    .map((zp, i) => (!fs.existsSync(zp) ? zipNames[i] : null))
    .filter(Boolean);

  if (missing.length > 0) {
    const failText = joinTextArray(
      window.systemFeatureText && window.systemFeatureText.zipUpdateFail,
      [
        "Failed to extract and install the patch!",
        "Please try the auto-update again or",
        "manually extract the patch files to install!"
      ]
    );
    alert(failText + "\nMissing: " + missing.join(", "));
    $gameSelfSwitches.setValue([$gameMap.mapId(), 1, "Z"], false);
    $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "Z"], false);
    return;
  }

  try {
    // —— 进度聚合（整体百分比：0~100） ——
    const total = zipNames.length;
    const updateOverallPct = (idx, pctInCurrent) => {
      const overall = (idx + (pctInCurrent || 0)) / total;
      $gameVariables.setValue(82, Math.floor(overall * 100));
    };

    // —— 逐个解压 & 删除 ——（顺序即覆盖顺序）
    for (let i = 0; i < zipNames.length; i++) {
      const name = zipNames[i];
      const abs  = zipPaths[i];
          // —— 解压提醒演出 ——
            let textArray = window.systemFeatureText && window.systemFeatureText.startExtractZipFile;
            if (!textArray) textArray = `Extracting ${name}…`;
            let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");
	        text = "\\fs[24]" + text;
		    $gameSystem._drill_GFTH_styleId = 5;
		    $gameTemp.drill_GFTH_pushNewText( text );
      // —— 解压进行 ——
      await chahuiUtil.extractPatch(name, pct => updateOverallPct(i, pct));

      // 每个包完成后，确保进度至少抵达该段末尾
      updateOverallPct(i + 1, 0);

      try {
        fs.unlinkSync(abs);
      } catch (e) {
        console.warn("删除 zip 失败：", abs, e);
      }
    }

    // —— 结束提醒 ——
    setTimeout(() => {
      const okText = joinTextArray(
        window.systemFeatureText?.zipUpdateComplete,
        ["Patch installed successfully.", "Restarting the game to apply the update!"]
      );
      alert(okText);
      location.reload();
    }, 500);

  } catch (err) {
    console.log("解压过程中失败：", err);
    const failText = joinTextArray(
      window.systemFeatureText && window.systemFeatureText.zipUpdateFail,
      [
        "Failed to extract and install the patch!",
        "Please try the auto-update again or",
        "manually extract the patch files to install!"
      ]
    );
    alert(failText);
    $gameSelfSwitches.setValue([$gameMap.mapId(), 1, "Z"], false);
    $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "Z"], false);
  }
};

// 解压缩 zip 安装补丁流程
// 需要注意压缩包必须处于www路径下,压缩包内无需再出现www路径
chahuiUtil.androidExtractAndInstallPatch = async function (namesOrOne) {
  const root = cordova.file.dataDirectory;

  // —— 工具：把输入规范成数组 —— //
  function normalizeToArray(val) {
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    if (val == null) return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      if (s[0] === "[" && s[s.length - 1] === "]") {
        try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.filter(Boolean).map(String); }
        catch { /* ignore */ }
      }
      if (s.includes(",")) return s.split(/\s*,\s*/).filter(Boolean);
      const maybeSplit = s.split(/\s+/).filter(Boolean);
      return maybeSplit.length > 1 ? maybeSplit : [s];
    }
    return [String(val)];
  }

  function joinTextArray(textArray, fallbackArr) {
    let arr = textArray || fallbackArr;
    return Array.isArray(arr) ? arr.join("\n") : String(arr ?? "");
  }

  function alertFail(extraMsg) {
    let textArray = window.systemFeatureText?.zipUpdateFail;
    if (!textArray) {
      textArray = [
        "Failed to extract and install the patch!",
        "Please try the auto-update again or",
        "manually extract the patch files to install!"
      ];
    }
    const text = joinTextArray(textArray, textArray) + (extraMsg ? ("\n" + extraMsg) : "");
    alert(text);
    $gameSelfSwitches.setValue([$gameMap.mapId(), 1, "Z"], false);
    $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "Z"], false);
  }

  function fsExists(fileUrl) {
    return new Promise((res, rej) => {
      window.resolveLocalFileSystemURL(fileUrl, () => res(true), err => rej(err));
    });
  }

  function fsRemove(fileUrl) {
    return new Promise((res, rej) => {
      window.resolveLocalFileSystemURL(
        fileUrl,
        fe => fe.remove(() => res(), err => rej(err)),
        err => rej(err)
      );
    });
  }

  // —— 读取来源（参数优先，否则读 86 号变量） —— //
  const raw = (typeof namesOrOne !== "undefined") ? namesOrOne : $gameVariables.value(86);
  const zipNames = normalizeToArray(raw);
  if (zipNames.length === 0) return;

  // —— 先校验所有文件是否存在（位于 dataDirectory 下） —— //
  const missing = [];
  for (const name of zipNames) {
    try { await fsExists(root + name); } catch { missing.push(name); }
  }
  if (missing.length) {
    alertFail("Missing: " + missing.join(", "));
    return;
  }

  // —— 进度聚合（整体 0~100） —— //
  const total = zipNames.length;
  const updateOverallPct = (idx, pctInCurrent) => {
    const overall = (idx + (pctInCurrent || 0)) / total;
    try { $gameVariables.setValue(82, Math.floor(overall * 100)); } catch (_) {}
  };

  try {
    // —— 顺序解压（避免 I/O 争抢；后包覆盖先包） —— //
    for (let i = 0; i < zipNames.length; i++) {
      const name = zipNames[i];

      await chahuiUtil.androidExtractPatch(name, pct => updateOverallPct(i, pct));
      // 把该段收尾到段末
      updateOverallPct(i + 1, 0);

      // 解压完成即删除 zip（位于 dataDirectory/www/...）
      try { await fsRemove(root + name); } catch (e) { console.warn("remove failed:", name, e); }
    }

    setTimeout(() => {
      let textArray = window.systemFeatureText?.zipUpdateComplete;
      if (!textArray) {
        textArray = [
          "Patch installed successfully.",
          "Restarting the game to apply the update!"
        ];
      }
      alert(joinTextArray(textArray, textArray));
      try { location.reload(); } catch (_) {}
    }, 500);

  } catch (err) {
    console.log("Android patch install failed:", err);
    alertFail();
  }
};


chahuiUtil.autoUpdateAnsuzRevelation = function() {

            var lang = ConfigManager.language;
			var path,text;
			switch (lang) {
                case 0: 
                path = "AnsuzRevelation/CN"; 
                break;
                case 1: 
                path = "AnsuzRevelation/JP";
                break;	
                case 2: 
                path = "AnsuzRevelation/EN";
                break;
                default: 
                  return;
                break;	
            
			}

    var x =  $gamePlayer.screenX() * $gameScreen.zoomScale();
    var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;
			
    downloadGitHubDirectory("shiroin000", "RPGmaker", path, "main")
                .then(() => {					
                // 此处预留更新了谏言的提醒
            switch (lang) {
                case 0:
                    lang = "Ansuz记录同步成功！";
                    break;
                case 1:
                    lang = "アンスズの記録同期に成功しました！";
                    break;
                case 2:
                    lang = "Ansuz record sync successful!";
                    break;
                default:
                    lang = "Ansuz record sync successful!";
                    break;
            }
	
      text = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + lang;
      $gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 150 );
    })
        .catch(err => {
            // 此处预留更新失败的提醒
            switch (lang) {
                case 0:
                    lang = "Ansuz记录同步失败！";
                    break;
                case 1:
                    lang = "アンスズのログインに失敗！ネット接続を確認してください！";
                    break;
                case 2:
                    lang = "Ansuz login failed! Check your network!";
                    break;
                default:
                    lang = "Ansuz login failed! Check your network!";
                    break;
            }
	
      text = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + lang;
      $gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 150 );			
    });
};

// 下载文件，失败时最多重试2次
function downloadOneFile(remoteUrl, localPath, retries = 3) {
    return new Promise((resolve, reject) => {
        const xhr      = new XMLHttpRequest();
		const isZip    = /zip$/i.test(localPath);
        xhr.open("GET", remoteUrl);
        // 如果是二进制文件(如 png, ogg),需要 xhr.responseType="arraybuffer"
        if (/(zip|png|jpg|ogg|m4a|rpgmvo|rpgmvp|webm|nlch)$/i.test(localPath)) {
            xhr.responseType = "arraybuffer";
        }
    
	// 反映大文件下载进度(通常指zip文件)
    if (isZip) {
      xhr.onprogress = e => {
        if (e.lengthComputable) {
          const percent = Math.floor(e.loaded / e.total * 100);
          $gameVariables.setValue(82, percent);          
        }
      };
    }

    xhr.onload = function () {
      if (xhr.status < 400) {
        try {
		// 增加下载进度
        $gameVariables.setValue(85, $gameVariables.value(85) + 1);
	    // 显示下载日志
        let textArray = window.systemFeatureText && window.systemFeatureText.fileDownloadedSuccessfully;
        if (!textArray) textArray = "${} downloaded successfully!";
        let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");
        const match = String(text).match(/\$\{([^}]*)\}/);
	    if (match)  text = String(text).replace(/\$\{[^}]*\}/g, `\\fs[24]${localPath}`);	
	
		$gameSystem._drill_GFTH_styleId = 5;
		$gameTemp.drill_GFTH_pushNewText( text );
		// 对象是压缩包时将激活后续解压缩流程
		if (isZip) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 1, 'Z'], true);
			$gameSelfSwitches.setValue([$gameMap.mapId(), 2, 'Z'], true);
			  // 86号变量：非数组或为0 → 重置为 []
            let q = $gameVariables.value(86);
            if (!Array.isArray(q) || q === 0) q = [];
            q.push(String(localPath));
            $gameVariables.setValue(86, q);
		}
		
          saveFile(localPath, xhr.response, xhr.responseType)
            .then(() => resolve(localPath))
            .catch(reject);
        } catch (e) {
          retryOrReject(e);
        }
      } else {
        retryOrReject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => retryOrReject(new Error(`Network error → ${remoteUrl}`));
    xhr.send();
    /* ---------------- 内部：失败处理 & 重试 ---------------- */
    function retryOrReject(err) {
      if (retries > 0) {
        console.warn(`[retry] ${localPath} (${retries} left):`, err.message);
		// 下载重试日志
        let textArray = window.systemFeatureText && window.systemFeatureText.fileDownloadFailed;
        if (!textArray) textArray = "${} download failed! Try downloading again!";
        let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");
        const match = String(text).match(/\$\{([^}]*)\}/);
	    if (match)  text = String(text).replace(/\$\{[^}]*\}/g, `\\fs[24]\\c[10]${localPath}`);	
		
		$gameSystem._drill_GFTH_styleId = 5;
		$gameTemp.drill_GFTH_pushNewText( text );
        // 简单延迟 1 秒再重试；可按需改成指数退避
        setTimeout(() => {
          downloadOneFile(remoteUrl, localPath, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      } else {
        console.error(`[failed] ${localPath}:`, err.message);
        reject(err);
      }
    }
  });
};

function saveFile(localPath, fileData, responseType) {
  if (!localPath || fileData == null) {
    return Promise.reject(new Error('saveFile: invalid args'));
  }

  const isNode = typeof require === 'function'
              && typeof process !== 'undefined'
              && process.versions;

  /* ---------- NW.js / Node ---------- */
  if (isNode) {
    return new Promise((resolve, reject) => {
      try {
        const path = require('path');
        const fs   = require('fs').promises;           // async 版
        const base = path.dirname(process.mainModule.filename);
        const full = path.join(base, localPath);
        fs.mkdir(path.dirname(full), { recursive: true })
          .then(() => {
            if (responseType === 'arraybuffer' && fileData instanceof ArrayBuffer) {
              return fs.writeFile(full, Buffer.from(new Uint8Array(fileData)));
            } else {
              return fs.writeFile(full, String(fileData), 'utf8');
            }
          })
          .then(() => resolve(full))
          .catch(reject);
      } catch (e) { reject(e); }
    });
  }

  /* ---------- Cordova / Capacitor ---------- */
  const isCordova = !!(window.cordova && window.resolveLocalFileSystemURL);
  if (!isCordova) {
    return Promise.reject(new Error('saveFile: unsupported environment'));
  }

  return new Promise((resolve, reject) => {
    const root = cordova.file.dataDirectory;              // 可写目录
    const dirs = localPath.split('/');
    const file = dirs.pop();

    // 递归建目录
    (function makeDir(base, idx) {
      return new Promise((res, rej) => {
        if (idx >= dirs.length) return res(base);
        window.resolveLocalFileSystemURL(base, dir => {
          dir.getDirectory(dirs[idx], { create: true }, sub =>
            res(makeDir(sub.nativeURL, idx + 1)), rej);
        }, rej);
      });
    })(root, 0).then(dirPath => {
      window.resolveLocalFileSystemURL(dirPath, dir => {
        dir.getFile(file, { create: true }, fe => {
          fe.createWriter(w => {
            w.onwriteend = () => resolve(fe.nativeURL);
            w.onerror    = reject;
            const blob = (responseType === 'arraybuffer' && fileData instanceof ArrayBuffer)
              ? new Blob([fileData], { type: 'application/octet-stream' })
              : (fileData instanceof Blob)
                  ? fileData
                  : new Blob([String(fileData)], { type: 'text/plain;charset=utf-8' });
            w.write(blob);
          }, reject);
        }, reject);
      }, reject);
    }).catch(reject);
  });
}


function fetchGitHubDirectory(owner, repo, dirPath, ref) {
    let apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${ref}`;
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl);
        xhr.onload = function(){
            if (xhr.status < 400) {
                try {
                    let arr = JSON.parse(xhr.responseText);
                    if (!Array.isArray(arr)) {
                        // 可能不是文件夹(如果dirPath指向单个文件)
                        return reject(new Error("Not a directory or invalid response."));
                    }
                    // arr 里每项: { name, path, type, download_url, ... }

                    // 准备一个空数组, 用于存储所有最终文件
                    let filesList = [];

                    // 我们用一个子函数,递归(或迭代)
                    function processItem(item) {
                        if (item.type === "file") {
                            // 直接放入结果
                            filesList.push({
                                path: item.path,  // "066/www/data/AnsuzRevelation0.json"
                                download_url: item.download_url,
                                type: "file"
                            });
                        } else if (item.type === "dir") {
                            // 递归获取子目录
                            // fetchGitHubDirectory(... item.path)
                            // 但是 item.path 可能是 "066/www/img" 之类
                            // => 我们要调 fetchGitHubDirectory(owner, repo, item.path, ref)
                            // 再合并返回
                        }
                    }

                    // 处理 arr 每个元素
                    // 这里演示"浅层"做法, 若想深层递归 => 需要在 type=dir时再次调用 fetchGitHubDirectory
                    // 并合并返回
                    let promises = arr.map(item => {
                        if (item.type === "file") {
														
							if (item.name === "patchFileList.json" && item.download_url) {
								    $gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'Z'], true);
							        return fetch(item.download_url)
 							           .then(res => {
 							               if (!res.ok) throw new Error("Failed to fetch patchFileList.json");
							                return res.json();
							            })
							            .then(fileList => {
							                filesList.push(...fileList); 
							            });
							 } else {
                             // 非索引文件
                            // push后不需要再调, 直接resolve
                            processItem(item);
                            return Promise.resolve();
						  }
                        } else if (item.type === "dir") {
                            return fetchGitHubDirectory(owner, repo, item.path, ref)
                            .then(subFiles => {
                                filesList.push(...subFiles);
                            });
                        } else {
                            return Promise.resolve();
                        }
                    });

                    Promise.all(promises)
                        .then(()=>resolve(filesList))
                        .catch(e=>reject(e));

                } catch(e) {
                    reject(e);
                }
            } else {
                reject(new Error(`HTTP error ${xhr.status}`));
            }
        };
        xhr.onerror = function(){
            reject(new Error("Network Error to " + apiUrl));
        };
        xhr.send();
    });
}


function downloadGitHubDirectory(owner, repo, dirPath, ref) {
    return fetchGitHubDirectory(owner, repo, dirPath, ref)
    .then(fileList => {
        // => 这是所有 (path, download_url)
        return batchDownloadFiles(fileList);
    });
}

// 读取下载列表的文件数
function listAllGitHubFiles(owner, repo, dirPath, ref) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl);
    xhr.onload = () => {
      if (xhr.status < 400) {
        try {
          const data = JSON.parse(xhr.responseText);
          // filter 出我们目录下的 blob（文件）
          const files = data.tree
            .filter(e => e.type === 'blob' && e.path.startsWith(dirPath))
            .map(e => ({
              path: e.path,
              download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${e.path}`
            }));
          resolve(files);
        } catch (e) { reject(e); }
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network Error"));
    xhr.send();
  });
};

/**
 * 批量下载
 * fileList: [ { path, download_url, type:"file" }, ... ]
 * 其中 path 例: "066/www/data/AnsuzRevelation0.json"
 */
function batchDownloadFiles(fileList) {
    let index = 0;
    function next() {
        if (index >= fileList.length) return Promise.resolve();
        let item = fileList[index++];
        return downloadGitHubFileToLocal(item.download_url, item.path).then(()=>next());
    }
    return next();
}

/**
 * 例: downloadGitHubFileToLocal(url, path) => 先截取 path 里 "/www/" 后部分 => localPath
 */
function downloadGitHubFileToLocal(remoteUrl, fullPath) {
    // 1) 找 "/www/"
    let idx = fullPath.indexOf("www/");
    if (idx < 0) {
        // maybe we only handle subdir if path contain 'www/'
        console.warn("不含 www/, 跳过:", fullPath);
        return Promise.resolve();
    }
    let subPath = fullPath.substring(idx + 4); //  => "data/AnsuzRevelation0.json"

    // 2) 用之前写好的 downloadOneFile(remoteUrl, subPath)
    return downloadOneFile(remoteUrl, subPath);
}




//=============================================================================
//打开游戏时就检测有没有新版本
//=============================================================================

const _ST_update = Scene_Title.prototype.update;
Scene_Title.prototype.update = function() {
  _ST_update.call(this);
  // 只发一次 XHR
  
  if ( this._commandWindow && this._commandWindow.isOpenAndActive() ) {
    this._commandWindowInitialized = true; 
  }
  
  if (!this._hasCheckedUpdate) {
    this._hasCheckedUpdate = true;
    this.autoUpdataCheck();
	this.detectIfLaunchedFromArchive();
  }
  
};

Scene_Title.prototype.detectIfLaunchedFromArchive = function() {
	
	if (!Utils.isNwjs || !Utils.isNwjs()) return;
    const os   = require('os');
    const fs   = require('fs');
    const path = require('path');
    const tempDir = os.tmpdir().replace(/\\/g, '/');
    // process.cwd() 就是运行时的工作目录
    const cwd = process.cwd().replace(/\\/g, '/');

    // 判断 cwd 是否为 tempDir 的子目录
    function isUnderTemp(dir, tempRoot) {
      return dir.toLowerCase().indexOf(tempRoot.toLowerCase() + '/') === 0;
    }

    // 如果在临时目录下运行，则强制退出
    if (isUnderTemp(cwd, tempDir)) {
      let textArray = [ "检测到游戏通过压缩包直接启动！",
	                    "请正常解压文件再启动游戏！"
					  ];
	  if (ConfigManager.language > 0) {
          textArray = [ "Game detected as being launched directly from an archive!",
	                    "Please extract all files properly before running the game!"
					  ];		  
	  }
	  let text = textArray.join("\n");
	  alert(text);
      try { nw.App.quit(); } catch(e) { window.close(); }
    }	
};

Scene_Title.prototype.autoUpdataCheck = function() {
  // 确保语言选项始终是正常指向
	ConfigManager["String2"] = ConfigManager.language;
  // 重置锁60帧设置选项
	ConfigManager['Boolean2'] = ConfigManager.FPS_LOCK_MODE;

  // 先把非法的 v2 全部重置为 0 
  let v2 = $gameVariables.value(2);
  const goodString = typeof v2 === 'string' && /^0\.\d+[A-Za-z]?$/.test(v2);
  if (v2 !== 0 && !goodString) {
    // 既不是数字 0 ，也不是合法的版本字符串 → 重置
    $gameVariables.setValue(2, 0);
    v2 = 0;
  }

  // 旧版本数据也重置
  if (goodString && parseFloat(v2) < 0.75) {
    $gameVariables.setValue(2, 0);
  }
  // 有正确的版本记录的情况下，直接触发更新流程
  if (goodString && parseFloat(v2) >= 0.75) {
    this.autoUpdataConfirm();
    return;
  }

    var title = $dataSystem.gameTitle;
    var match = title.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        var versionA = match[1];
    } else {
        return false;
    }

    // 当前不会有缺少小数点版本的情况
    if (versionA.split('.').length < 2) {
      return;
    }
	/*
    var digits = versionA
      .split('.')[1]                       
      .replace(/\D/g, '');               
    */
	
	var userLang = ConfigManager.language;
	if (![0,1,2].includes(userLang)) userLang = 2;
    const scene = this;	
    var url = appScript
            + "?mode=LatestVersion"
			+ "&lang=" + userLang
			+ "&version=" + versionA;			

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
	
    xhr.onerror = () => {
      $gameVariables.setValue(2, 0);
    };
	
    xhr.onload = function() {
		
        if (xhr.status < 200 || xhr.status >= 300) {
           $gameVariables.setValue(2, 0);
           return;
        }

        if (xhr.status === 0 || xhr.status >= 400) return;
        // 解析 JSON 
        var result;
        try {
            result = JSON.parse(xhr.responseText);
          } catch (_) {
            return;
        }

		result = JSON.parse(xhr.responseText);
        var versionB = result.nextVersion.trim();
        let m = versionB.match(/^(\d+\.\d+)([A-Z]*)$/);
        if (!m) {
        $gameVariables.setValue(2, 0);
        return;
        }
		
        function parseVersion(version) {
            let match = version.match(/^(\d+\.\d+)([A-Z]*)$/);
            if (!match) return [0, ""];
            return [parseFloat(match[1]), match[2] || ""];
        }

        let [numA, letterA] = parseVersion(versionA);
        let [numB, letterB] = parseVersion(versionB);

        // 先比较数值部分
        if (numA !== numB) {
        var contrast = numA - numB;
        if (contrast < 0) {
		  $gameVariables.setValue(2, versionB);
		  scene.autoUpdataConfirm();
          scene._startedCustomGame = true;
		  // 如果有更新履历，就预存备用
		   if (result.update) {
			  $dataSystem.updateLog = result.update;
		   }		  
		}
		return true;
    }

        // 如果数值部分相同，比较字母部分（A < B < C...）
        var contrast = letterA.localeCompare(letterB);
        if (contrast < 0) {
		  $gameVariables.setValue(2, versionB);
		  scene.autoUpdataConfirm(versionB);
          scene._startedCustomGame = true;
		  // 如果有更新履历，就预存备用
		   if (result.update) {
			  $dataSystem.updateLog = result.update;
		   }		  
		}
		return true;
    };		
};


Scene_Title.prototype.autoUpdataConfirm = function(version) {

  // 防范玩家在已经点击选项后继续弹窗
  if (this._commandWindowInitialized) {
  if ( !this._commandWindow || !this._commandWindow.isOpenAndActive() ) {
    return;                                        
    }
  }
	
	if (!version) {
		version = $gameVariables.value(2);
	}
	
    let textArray = window.systemFeatureText && window.systemFeatureText.autoUpdate;
    if (!textArray) return;
    let text = textArray.join('\n');

	const match = String(text).match(/\$\{([^}]*)\}/);
	
	if (match && version) {
	 text = String(text).replace(/\$\{[^}]*\}/g, version);	
	}
	
	
    const ask = confirm(text);
    if (ask) {
     // 将玩家送进小黑屋
    const preMapId  = $dataSystem.startMapId;
    const preStartX = $dataSystem.startX;
    const preStartY = $dataSystem.startY;
    $dataSystem.startMapId = 33;
    $dataSystem.startX     = 8;
    $dataSystem.startY     = 5;
    this.commandNewGame();
    $dataSystem.startMapId = preMapId;
    $dataSystem.startX     = preStartX;
    $dataSystem.startY     = preStartY;               
  } else {
	$gameVariables.setValue(2, 0);  
  }
};

//=============================================================================
//实验品
//=============================================================================

chahuiUtil.temporarilyShowNetworkPicture = function(pid, url) {
(async () => {
  // 1. 下载
  const res = await fetch(url, { mode: 'cors' }).catch(() => null);
  if (!res || !res.ok) return false;
  const blobURL = URL.createObjectURL(await res.blob());

  // 2. 创建 <img>
  const img = new Image();
  img.src = blobURL;
  await new Promise(ok => (img.onload = ok));

  // 3. Bitmap
  const base = new PIXI.BaseTexture(img);
  const bmp  = new Bitmap(img.width, img.height);
  bmp._image       = img;
  bmp._baseTexture = base;
  bmp._baseTexture.hasLoaded = true;
  bmp._setDirty();
  
  if (!$gameScreen.picture(pid)) {
	  URL.revokeObjectURL(blobURL);   // 释放 blob: URL 引用
      bmp.destroy();                 // 让 Bitmap/纹理占用也被 PIXI 释放
	  return;
  }
  //  4.切换 
  const sprite = SceneManager._scene._spriteset._pictureContainer
                   .children.find(s => s._pictureId === pid);
  if (sprite) {
    sprite.bitmap = bmp;
    sprite._refresh();
  }
})();
};
