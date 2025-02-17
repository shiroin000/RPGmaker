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

StorageManager.getMultipleRandomEntries = function(src, mapId, count) {
    if (this.isLocalMode()) {
        var fs = require('fs');
        var path = require('path');
        var base = path.dirname(process.mainModule.filename);
        var filePath = path.join(base, 'data/', src + ".json");

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.error(`文件 ${filePath} 不存在`);
            return [];
        }

        // 读取 JSON 数据
        try {
            let rawData = fs.readFileSync(filePath, 'utf8');
            let jsonData = JSON.parse(rawData);

            // 检查是否有该地图 ID 的数据
            if (!jsonData[mapId] || jsonData[mapId].length === 0) {
                console.error(`地图 ${mapId} 下没有数据`);
                return [];
            }

            // 获取该地图下的所有对象
            let allEntries = jsonData[mapId];

            // 限制 `count` 不能超过实际数量
            let maxCount = Math.min(count, allEntries.length);

            // Fisher-Yates 洗牌算法，随机获取 `maxCount` 个对象
            let selectedEntries = [];
            let tempArray = [...allEntries]; // 复制数组，避免修改原数据
            for (let i = 0; i < maxCount; i++) {
                let randomIndex = Math.floor(Math.random() * tempArray.length);
                selectedEntries.push(tempArray[randomIndex]);
                tempArray.splice(randomIndex, 1); // 确保不会重复选择
            }

            return selectedEntries;

        } catch (error) {
            console.error("读取或解析 JSON 失败:", error);
            return [];
        }
    } else {
        console.log("getMultipleRandomEntries: Not local");
        return [];
    }
};



//=============================================================================
//书写谏言
//=============================================================================
QJ.MPMZ.tl.ex_writeAnsuzRevelation = function(text,user,posX,posY) {
    var mapId = $gameMap.mapId();
	var userLang = $gameVariables.value(1);
	if (![0,1,2].includes(userLang)) userLang = 0;
	var file = "AnsuzRevelation" + userLang;
    var newData = {
    "revelationText": text,
    "textPosX": posX,
    "textPosY": posY,
    "author": user
  };

    StorageManager.appendDataFile(file, mapId, newData);
};

/*
var text = "世界尽头的灯塔";
var user = "我";
var posX = Math.floor($gamePlayer.centerRealX());
var posY = Math.floor($gamePlayer.centerRealY());
QJ.MPMZ.tl.ex_writeAnsuzRevelation(text,user,posX,posY);
*/

var chahuiUtil = chahuiUtil || {};

// 玩家签到
chahuiUtil.playerDailyLoginReward = function() {
    // 取得当前日期
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var todayNum = y*10000 + m*100 + d;
	var userLang = $gameVariables.value(1);
	if (![0,1,2].includes(userLang)) userLang = 0;

    var lastDate = $gameVariables.value(289); 

    if (todayNum > lastDate) {
      var url = "https://script.google.com/macros/s/AKfycbwWeamOoPrHoOsW_Q4v8iEQ5YICVa0fuW6EsSq_ZnxZUii9vDiMruzE6xp8oCKEawka/exec"
              + "?mode=DailyLogin"
			  + "&lang=" + userLang;
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
	var userLang = $gameVariables.value(1);
	if (![0,1,2].includes(userLang)) userLang = 0;

    var lastDate = $gameVariables.value(289); 

    if (todayNum > lastDate) {
      var url = "https://script.google.com/macros/s/AKfycbwWeamOoPrHoOsW_Q4v8iEQ5YICVa0fuW6EsSq_ZnxZUii9vDiMruzE6xp8oCKEawka/exec"
              + "?mode=NewSave"
			  + "&lang=" + userLang;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.send();
        $gameVariables.setValue(289, todayNum);
    }	 
};




(function(){

    const _SceneManager_catchException = SceneManager.catchException;

    SceneManager.catchException = function(e) {

        _SceneManager_catchException.call(this, e);

        let errorPrinter = document.getElementById("ErrorPrinter");
        if (errorPrinter && e.stack) {
            let p = document.createElement("p");
            p.style.color = "white";  
            p.innerHTML = "<b>Stack Trace:</b><br>" + (""+e.stack).replace(/\n/g,"<br>");
            errorPrinter.appendChild(p);
        }

        setTimeout(function(){
			
			var text;
            const lang = $gameVariables.value(1);
			switch (lang) {
                case 0: 
                text = "游戏发生错误，是否前往茶会的Discord服务器进行Bug反馈？\n(点击“确定”将打开Discord邀请链接)\n(请附带游戏报错画面的截屏)";
                break;
                case 1: 
                text = "ゲームエラーが発生しました。 逆流茶会のDiscordサーバーでバグ報告をお願いします。\n(青い選択肢をクリックするとDiscordの招待リンクが開きます)\n(エラースクリーンショットを添付してください)";
                break;	
                case 2: 
                text = "An error occurred. Please report the bug on the NLCH Discord server.\n(Click Blue Option to open the invite link)\n(Attach a screenshot of the error)";
                break;
                default: 
                text = "游戏发生错误，是否前往逆流茶会的Discord服务器进行Bug反馈？\n(点击“确定”将打开Discord邀请链接)\n(请附带游戏报错画面的截屏)";
                break;	
            
			}				
            const ask = confirm(text);
            if (ask) {
				require('nw.gui').Shell.openExternal('https://discord.gg/9dPrpYwsM9');
            }
        }, 600);
    };
})();

//=============================================================================
//自动更新模块
//=============================================================================

chahuiUtil.compareVersions = function() {
    var versionB = "0.1";
    var title = $dataSystem.gameTitle;
    var match = title.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        var versionA = match[1];
    } else {
        return false;
    }

    var url = "https://script.google.com/macros/s/AKfycbwWeamOoPrHoOsW_Q4v8iEQ5YICVa0fuW6EsSq_ZnxZUii9vDiMruzE6xp8oCKEawka/exec"
            + "?mode=LatestVersion";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();

    xhr.onload = function() {       
        var versionB = xhr.responseText;

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
		  $gameVariables.setValue(2, versionB);	 
          //chahuiUtil.autoUpdate(versionB);
        }
		return true;
    }

        // 如果数值部分相同，比较字母部分（A < B < C...）
        var result = letterA.localeCompare(letterB);
        if (result < 0) {
          $gameVariables.setValue(2, versionB);	
        }
		return true;
    };

    xhr.onerror = function() {
        return false;
    };
};

chahuiUtil.autoUpdate = function(version) {

            const lang = $gameVariables.value(1);
			switch (lang) {
                case 0: 
                version = "CN/" + version;
                break;
                case 1: 
                version = "JP/" + version;
                break;	
                case 2: 
                version = "EN/" + version;
                break;
                default: 
                  return;
                break;	
            
			}
	var path = version + "/www";
    downloadGitHubDirectory("shiroin000", "RPGmaker", path, "main")
                .then(() => {
            var text;
            var lang = $gameVariables.value(1);
            switch (lang) {
                case 0:
                    text = "游戏自动更新完成！\n关闭该弹窗后将自动重启游戏以适配更新内容！\n重启后可以读取自动存档回到当前进度！";
                    break;
                case 1:
                    text = "ゲームの自動アップデートが完了しました！\nウィンドウを閉じるとゲームが自動的に再起動し、更新内容が適用されます！\n再起動後、自動セーブを読み込んで現在の進行に戻ることができます！";
                    break;
                case 2:
                    text = "Game update completed!\nThe game will restart automatically after closing this window.\nYou can load the auto-save to resume progress!";
                    break;
                default:
                    text = "游戏自动更新完成！\n关闭该弹窗后将自动重启游戏以适配更新内容！\n重启后可以读取自动存档回到当前进度！";
                    break;
            }
            alert(text);
			$gameVariables.setValue(2, 0);
			$gameSelfSwitches.setValue([$gameMap.mapId(), 2, 'D'], true);
			// 定时重启
			setTimeout(function(){
			location.reload();
			}, 1000);
        })
        .catch(err => {
            var text;
            var lang = $gameVariables.value(1);
            switch (lang) {
                case 0:
                    text = "游戏更新失败！\n请检查网络或进行手动更新！";
                    break;
                case 1:
                    text = "ゲームの更新に失敗しました！\nネットワークを確認するか、手動で更新してください！";
                    break;
                case 2:
                    text = "Game update failed!\nPlease check your network or update manually!";
                    break;
                default:
                    text = "Game update failed!\nPlease check your network or update manually!";
                    break;
            }
            alert(text);
			$gameVariables.setValue(2, 0);
			$gameSelfSwitches.setValue([$gameMap.mapId(), 2, 'D'], true);
        });

};

function downloadOneFile(remoteUrl, localPath) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", remoteUrl);
        // 如果是二进制文件(如 png, ogg),需要 xhr.responseType="arraybuffer"
        // 这里简单示例: 如果文件后缀是 .png / .ogg / .rpgmvo ... 判断一下
        if (/(png|jpg|ogg|m4a|rpgmvo|rpgmvm|rpgmva)$/i.test(localPath)) {
            xhr.responseType = "arraybuffer";
        }

        xhr.onload = function(){
            if (xhr.status < 400) {
                try {
                    saveFile(localPath, xhr.response, xhr.responseType);
                    console.log("已下载并覆盖:", localPath);
                    resolve(localPath);
                } catch(e) {
                    reject(e);
                }
            } else {
                reject(new Error("下载失败, HTTP状态码:" + xhr.status));
            }
        };
        xhr.onerror = function(){
            reject(new Error("网络请求错误 " + remoteUrl));
        };
        xhr.send();
    });
}

function saveFile(localPath, fileData, responseType) {
    var path = require("path");
    var fs = require("fs");
    var base = path.dirname(process.mainModule.filename); // 通常 .../www
    var fullPath = path.join(base, localPath);

    // 确保目录存在
    var dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        // 递归创建文件夹
        fs.mkdirSync(dir, { recursive: true });
    }

    // 判断是二进制还是文本
    if (responseType === "arraybuffer" && fileData instanceof ArrayBuffer) {
        // 二进制写入
        var buffer = Buffer.from(new Uint8Array(fileData));
        fs.writeFileSync(fullPath, buffer);
    } else {
        // 默认当作文本(例如 json, js, csv 等)
        let text = (typeof fileData === "string") ? fileData : fileData.toString();
        fs.writeFileSync(fullPath, text, "utf8");
    }
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
                            // push后不需要再调, 直接resolve
                            processItem(item);
                            return Promise.resolve();
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