//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][妹妹互动监听]
 * @author 仇九
 *
 * @help 
 * 
 *
 */
//=============================================================================
//妹妹场景相关
//=============================================================================


// 客厅场景事件触发判断
QJ.MPMZ.tl._imoutoUtilLivingRoomEventTriggerCheck = function() {

   if (!this) return;
   //if ( $gameSystem.day() === 1 ) return;
   // 后续还没写
   if ($gameSelfVariables.value([54, 5, 'animeEpisode']) > 5) return;
   
   let currentDay = $gameSystem.day();
   let lastDate = $gameSelfVariables.value([1, 2, 'lastDate']);  
   // 已经看过不再触发
   if (lastDate >= currentDay) return;
   
   let airDate = $gameSelfVariables.value([1, 2, 'animeAirDate']);
   if (Utils.isOptionValid("test")) airDate = 1;
   // 没看过动画，随机第一集的开播时间
   if (airDate == 0) {
	   airDate = 1 + Math.randomInt(7);
	   $gameSelfVariables.setValue([1, 2, 'animeAirDate'], airDate);
   }
   // 明确具体是周几
   let week = airDate % 7;
   
   if ($gameSystem.day() >= airDate) {
	   if ($gameSystem.day() % 7 === week) {
		  // 检查是否晚点
		  let currentHour = $gameSystem.hour();
		  let currentMinute = $gameSystem.minute();
		  let totalMinute = (60 * currentHour) + currentMinute;
		  // 晚上八点开播,并限制十点后不能触发
		  if (totalMinute >= 1200 && totalMinute < 1320) {
			  let value = false;
			  totalMinute -= 1200;
			  if (totalMinute >= 30) value = totalMinute;
               // 确认有事件可触发时中止当前流程并切入事件
		  	    let id = 18;
    	        $gameMap.event(id).steupCEQJ(5,{later:value});
		  	    $gameSelfVariables.setValue([1, 2, 'lastDate'], currentDay);
		        this._index = this._list.length;		   
		  }
	   }
    }
};

// 妹妹挑选食材
QJ.MPMZ.tl._imoutoUtilImoutoCookingPickIngredients = function() {
	
    let result = [];
    let items = $gameParty.items();   
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item && item.note && item.note.includes("<Ingredients:")) {
            let ingMatch = item.note.match(/<Ingredients:\s*(.+?)>/i);
            if (ingMatch) {
                let ingText = ingMatch[1];  
                let lowerIng = ingText.toLowerCase();
                // 妹妹不会选择辣椒
                if (lowerIng.includes("chilli")) {
                    continue;
                }
                // 妹妹会更倾向于使用肉
                let multiplier = lowerIng.includes("meat") ? 6 : 1;
                let count = $gameParty.numItems(item);
                for (let j = 0; j < count * multiplier; j++) {
                    result.push(item.id);
                }
            }
        }
    }
    $gameNumberArray.setValue(15, result);
};

	
// 妹妹做饭演出
QJ.MPMZ.tl._imoutoUtilImoutoCookingAnimation = function() {
   /*
    let count = Math.randomInt(3) + 1;
	let result = $gameNumberArray.value(15);
    count = Math.min(count, result.length);   
    let selected = [];   
    for (let i = 0; i < count; i++) {
        let idx = Math.randomInt(result.length);
        selected.push(result[idx]);
        result.splice(idx, 1);
    }
	$gameNumberArray.setValue(15,selected);
   */
  let tarX = 552 + Math.randomInt(618); // xx ∈ [552, 1169]
  let tarY;
  if (tarX >= 772 && tarX <= 972) {
    tarY = 570 + Math.randomInt(750 - 570 + 1); // yy ∈ [570, 750]
  } else {
    tarY = 570 + Math.randomInt(304); // yy ∈ [570, 873]
  }

  let itemArray = $gameNumberArray.value(15);
  let item = $dataItems[itemArray[Math.floor(Math.random() * itemArray.length)]];
  let icon = item.iconIndex;
  let posX = 865;
  let posY = 845;  
  let peakRate = 1 + (1 * Math.random());
  let { time, xExp, yExp } = QJ.MPMZ.tl.BulletTrajectoryFormula(tarX, tarY, posX, posY, peakRate,2);

   QJ.MPMZ.Shoot({
        img:['I',icon], 
		position:[['S',tarX],['S',tarY]],
        initialRotation:['S',0],
		opacity:'0|0~8/1~180/1',
		scale:1.5,
		z:"A",
        imgRotation:['S',0],
		moveType:["F", xExp, yExp],
        existData:[ 
		    {t: ['Time', time], d:[1,10,1.2]}  
		],
		
    });
};

// 玩家版本号检查
QJ.MPMZ.tl._playerOldSaveVersionCheck = function(specifyVersion = "0.77") {

    const gameTitle = $dataSystem.gameTitle;
    const match = gameTitle.match(/ver([\d\.A-Za-z]+)/i);
    let versionA,versionB; 
	
    if (match) {
        versionA = match[1];
    } else {
        versionA = "0.77"; // 默认备用值
    }
	
    versionB = $gameStrings.value(2).trim();
    if (versionB === "" || versionB === "<現在装備中>") {
        // 如果存档中没有记录版本号，则视为旧版本存档
        // 重置字符串变量
        $gameStrings.clear();
        $gameStrings.drill_COSt_init();	
        // 重置地图按钮
        $gameSystem.drill_GBu_initSysData();		
        $gameStrings.setValue(2, versionA);
        return true;
    }
    
    // 版本解析函数
    function parseVersion(versionStr) {
        versionStr = versionStr.trim();
        let match = versionStr.match(/^(\d+\.\d+)([A-Z]*)$/);
        if (!match) return [0, ""];
        return [parseFloat(match[1]), match[2] || ""];
    }
    
    let [numStored, letterStored] = parseVersion(versionB);
    let [numSpecified, letterSpecified] = parseVersion(specifyVersion);
    
    // 先比较大版本部分
    if (numStored !== numSpecified) {
        if (numStored < numSpecified) {
            // 是旧的大版本存档，需进行兼容处理
            $gameStrings.setValue(2, String(versionA));
            return true;
        }
    } else {
        // 比指定版本数更旧，也需进行兼容处理
        if (letterStored.localeCompare(letterSpecified) < 0) {
            $gameStrings.setValue(2, String(versionA));
            return true;
        }
    }
    
    return false;  // 不需要兼容处理
};


// 场景BGM自动降调
QJ.MPMZ.tl._imoutoSceneBgmAutoPitchLowering = function () {
let count = this.data.count;
if (AudioManager._currentBgm) {
    var b = AudioManager._bgmBuffer;
    if (b && b._sourceNode) {
        b._pitch = (AudioManager._currentBgm.pitch = count) / 100;
        b._sourceNode.playbackRate.setValueAtTime(
            b._pitch, WebAudio._context.currentTime
        );
        b._startTime = WebAudio._context.currentTime - b.seek() / b._pitch;
        b._removeEndTimer(); b._createEndTimer();
      }
   } else {
	this.data.count = 0;   
   }
   this.data.count -= 1;
   
   if (this.data.count <= 0) {
	   AudioManager.fadeOutBgm(1);
	   this.setDead({t:['Time',0]}); 
   }
};

QJ.MPMZ.tl._imoutoSceneBgsAutoPitchLowering = function() {
    // 假设你用一个全局变量（例如 this.data.count）来记录需要降低的 pitch 数值
    let count = this.data.count;
    // 遍历所有 BGS 线路（AudioManager._currentAllBgs 是一个对象，键通常为线路索引）
    for (let key in AudioManager._currentAllBgs) {
        let currentBgs = AudioManager._currentAllBgs[key];
        let bgsBuffer = AudioManager._allBgsBuffer[key];
        if (currentBgs && bgsBuffer && bgsBuffer._sourceNode) {
            // 计算新的 pitch（例如：count/100，和 BGM 代码一致）
            let newPitch = count / 100;
            // 更新当前 BGS 对象的 pitch（如果插件使用该属性）
            currentBgs.pitch = newPitch;
            // 更新底层 buffer 的播放速率
            bgsBuffer._sourceNode.playbackRate.setValueAtTime(newPitch, WebAudio._context.currentTime);
            // 调整起始播放时间，以便平滑续播
            bgsBuffer._startTime = WebAudio._context.currentTime - bgsBuffer.seek() / newPitch;
            // 重新设置结束定时器（内部方法）
            bgsBuffer._removeEndTimer();
            bgsBuffer._createEndTimer();
        }
    }

    this.data.count -= 1;
    if (this.data.count <= 0) {
        this.setDead({ t: ['Time', 0] });
    }
};


// 场景BGM自动适配
QJ.MPMZ.tl._imoutoSceneBgmSelection = function () {
	
	var randomBgmArray;
	if ($gameSystem.hour() > 5 && $gameSystem.hour() < 17) {
	var weather = $gameVariables.value(60);
    switch (weather) {
       case 0:
	     randomBgmArray = ["The-Freedom-Hunter","Le thé de l'après-midi","セレスタの森"];
       break;
       case 1:
	     randomBgmArray = ["野うさぎのワルツ", "植物愛好家の団欒"];
       break;	   
       case 2:
	     randomBgmArray = ["この雨が上がったら", "Matin-Pluvieux"];
       break;	   
       default:	
	     randomBgmArray = ["The-Freedom-Hunter","Le thé de l'après-midi"];
	}
    } else {
		 randomBgmArray = ["Strahlburg", "Café de Strahlburg - Charlotte", "Important-Thing", "木漏れ日の調べ", "シュトラールブルクの休日", "見習い魔女と古都の晩景"]; 
	}
	let randomBgm = randomBgmArray[Math.floor(Math.random() * randomBgmArray.length)];	
	AudioManager.playBgm({ name: randomBgm, volume: 90, pitch: 100, pan: 0 });    	
	   
};


// 妹妹状态描述刷新
QJ.MPMZ.tl._imoutoUtilStateDescriptionRefresh = function() {
	
        var actor = $gameActors.actor(2);
	    var imoutoText = QJ.MPMZ.tl._imoutoUtilStateText;

        // 立绘标记移除
        if (actor.isStateAffected(27)) {
            for (let i = 28; i <= 32; i++) {
                actor.removeState(i);
            }
            return;
        }

        // 妹妹玩游戏
        if (actor.isStateAffected(28)) {
			let States = window.statesDescription["28"];
			let subtitle = States.subtitle.join();
            // 移除立绘标记
            for (let i = 29; i <= 32; i++) {
                actor.removeState(i);
            }
			$gameStrings.setValue(41, subtitle);
			let textArray = "";
			let index = Math.randomInt(2);
            textArray = States.variants[String(index)]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[28].description = textArray.join("\n");
            return;
        }
        // 妹妹洗澡中
        if (actor.isStateAffected(29)) {
			let States = window.statesDescription["29"];
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
			let textArray = "";
			let index = 0;
			if ($gameMap.mapId() == 4) index = 1;
            textArray = States.variants[String(index)]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[29].description = textArray.join("\n");
            return;
        }
        // 妹妹休息中
        if (actor.isStateAffected(30)) {
			let States = window.statesDescription["30"];
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
			// 根据心情值切换描述
            var mood = $gameVariables.value(20);
			var textArray = "";
            if ($gameScreen.picture(5) && $gameScreen.picture(5).name().includes("rubEyes")) {
                textArray = States.variants["5"]["description"];
				if (!textArray[0].includes("✦\\fi\\c[110]")) {
				textArray[0] = "✦\\fi\\c[110]" + textArray[0];
				}
				$dataStates[30].description = textArray.join("\n");
				return;
            }
            if (mood >= 70) {
				let index = Math.randomInt(2);
                textArray = States.variants[String(index)]["description"];
            } else if (mood >= 45) {
                textArray = States.variants["2"]["description"];
            } else {
				let index = 3 + Math.randomInt(2);
                textArray = States.variants[String(index)]["description"];
            } 
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}
			$dataStates[30].description = textArray.join("\n");
            return;
        }		
        // 妹妹睡眠中(根据睡眠欲变化文本)
        if (actor.isStateAffected(31)) {
			let States = window.statesDescription["31"];
			if (!States.variants) {
               $dataStates[31].description = "\\c[10]Missing translation";
               return;				
			}			
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
			// 根据睡眠值切换描述
            var sleepDesire = $gameVariables.value(19);
			var textArray = "";
      	    if (sleepDesire >= 70) {
     	       textArray = States.variants["5"]["description"];
    	    } else if (sleepDesire >= 50) {
     	       textArray = States.variants["4"]["description"];
     	    } else if (sleepDesire >= 30) {
      	       textArray = States.variants["3"]["description"];
    	    } else if (sleepDesire >= 10) {
     	       textArray = States.variants["2"]["description"];
    	    } else if (sleepDesire >= 0) {
      	       textArray = States.variants["1"]["description"];
    	    } else {
     	       textArray = States.variants["0"]["description"];
      	    }
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}
			$dataStates[31].description = textArray.join("\n");
            return;
        }
        // 妹妹肚子饿
        if (actor.isStateAffected(32)) {
			let States = window.statesDescription["32"];
			if (!States.variants) {
               $dataStates[32].description = "\\c[10]Missing translation";
               return;				
			}			
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
			let textArray = "";
			let index = Math.randomInt(3);
            textArray = States.variants[String(index)]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[32].description = textArray.join("\n");
            return;
        }
        // 妹妹乘凉中
        if (actor.isStateAffected(33)) {
			let States = window.statesDescription["33"];
			if (!States.variants) {
               $dataStates[33].description = "\\c[10]Missing translation";
               return;				
			}			
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
            let textArray = States.variants["0"]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[33].description = textArray.join("\n");
            return;
        }		
        // 妹妹刷牙中
        if (actor.isStateAffected(34)) {
			let States = window.statesDescription["34"];
			if (!States.variants) {
               $dataStates[34].description = "\\c[10]Missing translation";
               return;				
			}			
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
            let textArray = States.variants["0"]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[34].description = textArray.join("\n");
            return;
        }
        // 妹妹辣哭了
        if (actor.isStateAffected(40)) {
			let States = window.statesDescription["40"];
			if (!States.variants) {
               $dataStates[40].description = "\\c[10]Missing translation";
               return;				
			}
			let subtitle = States.subtitle.join();
			$gameStrings.setValue(41, subtitle);
            let textArray = States.variants["0"]["description"];
			if (!textArray[0].includes("✦\\fi\\c[110]")) {
			textArray[0] = "✦\\fi\\c[110]" + textArray[0];
			}			
            $dataStates[40].description = textArray.join("\n");
            return;
        }		
};

// 不同状态妹妹点击效果
QJ.MPMZ.tl._imoutoDifferentStateClickEffects = function () {
    let imouto = $gameActors.actor(2);

    // 坐着的妹妹
    if (imouto.isStateAffected(30)) {
        if ($gameMap.mapId() === 4) $gameMap.event(15).start();
        return;
    }

    // 玩游戏的妹妹
    if (imouto.isStateAffected(28)) {
        if ($gameMap.mapId() === 4) {
            $gameScreen._pictureCidArray = [];
            $gameMap.event(2).steupCEQJ(3);
        }
        if ($gameMap.mapId() === 7) {
            $gameMap.event(26).start();
        }
        return;
    }

    // 洗澡中的妹妹
    if (imouto.isStateAffected(29)) {
        if ($gameMap.mapId() === 3) {
            if ($gameMessage.isBusy() || SceneManager._scene._messageWindow._choiceWindow.active) return;
            $gameMap.event(17).start();
        }
        if ($gameMap.mapId() === 4) {
            $gameMap.event(13).start();
        }
        return;
    }

    // 睡着的妹妹
    if (imouto.isStateAffected(31)) {
        if ($gameScreen.picture(1) && $gameScreen.picture(1)._name === "sister_room_night2_fine") {
            $gameMap.event(7).steupCEQJ(2); // 触发夜袭流程
			return;
        }
        if ($gameMap.mapId() === 54) {
            $gameMap.event(3).start(); // 早晨看望妹妹
			return;
        }
        if ($gameMap.mapId() === 4) {
            $gameMap.event(35).start(); // 早晨看望妹妹
			return;
        }		
		
        return;
    }

    // 饿肚子的妹妹
    if (imouto.isStateAffected(32)) {
        if ($gameMap.mapId() === 11) {
            $gameMap.event(21).start();
        }
        return;
    }

    // 炎热天气乘凉的妹妹
    if (imouto.isStateAffected(33) && ($gameMap.mapId() === 4 || $gameMap.mapId() === 54)) {
        if ($gameParty.hasItem($dataItems[19])) {
            $gameMap.event(50).steupCEQJ(1); // 有电风扇
        } else {
            // 被热晕的妹妹，区分有无T恤
            let picture = $gameScreen.picture(6);
            if (picture && picture.name() === "sis_room/sis_room_chibi_sleep_hot") {
                $gameMap.event(49).steupCEQJ(2);
            } else {
                $gameMap.event(49).steupCEQJ(3);
            }
        }
        return;
    }

    // 被辣哭了的妹妹
    if (imouto.isStateAffected(40)) {
        $gameScreen._pictureCidArray = [];
		if ($gameMap.mapId() === 4) {
          $gameMap.event(45).steupCEQJ(2);
		} else {
		  $gameMap.event(6).steupCEQJ(2);		
		}
        return;
    }
};


//显示妹妹描述窗口
QJ.MPMZ.tl._imoutoUtilDisplayStatusHud = function (hudDisplay) {
	
	if (!$gameParty.leader().hasSkill(7)) return;
	
    const koukan = [30, 32, 33, 34, 40];
    const keikai = [28, 31];
    let frameX, frameY, hudX, hudY;

    // 定义hud坐标
    function setFrameAndHudPositions(index, frameX, frameY, hudX, hudY) {
        $gameSystem._drill_GFV_bindTank[5].visible = true;
        $gameSystem._drill_GFV_bindTank[6].visible = true;
        $gameSystem._drill_GFV_bindTank[index].visible = true;

        $gameSystem._drill_GFV_bindTank[5].frame_x = frameX;
        $gameSystem._drill_GFV_bindTank[5].frame_y = frameY;
        $gameSystem._drill_GFV_bindTank[6].frame_x = frameX + 8;
        $gameSystem._drill_GFV_bindTank[6].frame_y = frameY + 20;
        $gameSystem._drill_GFV_bindTank[index].frame_x = frameX - 105;
        $gameSystem._drill_GFV_bindTank[index].frame_y = frameY + 30;

        $gameTemp._drill_GFV_needRefresh = true;
    }


    function createHudEffect(hudX, hudY) {

    if (!$gameSystem._drill_GFPT_dataTank[10]) {
		
		const isMobileDevice = Utils.isMobileDevice();
		// 初始化描述窗口
		if (isMobileDevice) {
        $gameSystem.drill_GFPT_create(10, 30);			
		} else {
        $gameSystem.drill_GFPT_create(10, 29);			
		}
        const data = $gameSystem._drill_GFPT_dataTank[10];   
        const lang = ConfigManager.language;
        const imouto = $gameActors.actor(2);
        
        let state1 = " ";
        let state2 = " ";
        let panties = " ";
        let description = " ";
        let sisName = $gameStrings.value(120);
        let dropsName = " ";
        
        const affectedList = imouto.getStateCategoryAffectedList('imoutoState');
        
        // 生成第一个状态描述（若存在）
        if (affectedList[0]) {
            state1 = "${$dataStates[" + affectedList[0] + "].description}";
        }
        // 生成第二个状态描述（若存在）
        if (affectedList[1]) {
            state2 = "${$dataStates[" + affectedList[1] + "].description}";
        }
        
        // 妹妹的内衣描述
        if (imouto.equips()[1]) {
            //panties = "\\ia[" + imouto._equips[1]._itemId + "]";
			panties = "\\ia[159]";
        } else {
            panties = "\\sa[159]";
        }
        
        // 适配多语言
        switch (lang) {
            case 0:
                dropsName = "可能掉落";
                break;
            case 1:
                dropsName = "ドロップアイテム";
                break;
            case 2:
                dropsName = "Possible drops";
                break;
            default:
                dropsName = "可能掉落";
                break;
        }
        
        description = "\\fs[20]\\str[41]" + sisName +
                      "\n\\fs[30]\\i[2]\\fs[20] ???" +
                      "\n\\py[8]" + state1 +
                      "\n\\py[24]" + state2 +
                      "\n\\fs[16]\\py[24]✦" + dropsName + ":" +
                      "\n\\fs[16]\\py[-4]" + panties;
					  
		if (isMobileDevice) {
        description = "\\fs[24]\\str[41]" + sisName +
                      "\n\\fs[30]\\i[2]\\fr ???" +
                      "\n\\py[8]\\fs[18]" + state1 +
                      "\n\\py[28]\\fs[18]" + state2 +
                      "\n\\py[28]✦\\fs[18]" + dropsName + ":" +
                      "\n\\py[-4]" + panties;
		}			
					                       
        data.context = description;
        
        const m_data = {
            x: hudX,
            y: hudY,
            time: 1,
            type: "瞬间移动"
        };

        // 执行窗口淡入动画
        $gameSystem.drill_GFPT_moveTo(10, m_data);
        }
    }

    
	if ($gameActors.actor(2).isStateAffected(27)) {
		frameX = 1410; frameY = 110;	
        setFrameAndHudPositions(7, frameX, frameY, hudX, hudY);	
        return;		
	}
	
	
    // Handle 好感度UI类型
    if (koukan.some(stateId => $gameActors.actor(2).isStateAffected(stateId))) {
        if ($gameActors.actor(2).isStateAffected(30)) { // 普通坐
            frameX = 463; frameY = 370; hudX = 400; hudY = 450;
        } else if ($gameActors.actor(2).isStateAffected(32)) { // 餐厅普通坐
            frameX = 820; frameY = 530; hudX = 750; hudY = 570;
        } else if ($gameActors.actor(2).isStateAffected(33)) { // 吹风扇乘凉
            if ($gameParty.hasItem($dataItems[19])) {
                if ($gameScreen.picture(6)?.name() === "sis_room/sis_room_chibi6_back0") { // 站姿妹妹
                    frameX = 850; frameY = 300; hudX = 750; hudY = 400;
                } else {
                    frameX = 750; frameY = 600; hudX = 750; hudY = 650;
                }
            } else {
                if ($gameScreen.picture(6)?.name() === "sis_room/sis_room_chibi6_back0") { // 中暑妹妹
                    frameX = 1340; frameY = 450; hudX = 1250; hudY = 460;
                } else {
                    frameX = 850; frameY = 300; hudX = 750; hudY = 400;
                }
            }
        } else if ($gameActors.actor(2).isStateAffected(34)) { // 刷牙
            frameX = 1100; frameY = 150; hudX = 980; hudY = 230;
        } else if ($gameActors.actor(2).isStateAffected(40)) { // 被辣哭
		    frameX = 1350; frameY = 450; hudX = 1300; hudY = 500;
		}

        setFrameAndHudPositions(7, frameX, frameY, hudX, hudY);		
        if (hudDisplay) createHudEffect(hudX, hudY);
    }

    // Handle 警戒度UI类型
    if (keikai.some(stateId => $gameActors.actor(2).isStateAffected(stateId))) {
        if ($gameActors.actor(2).isStateAffected(28)) { // 玩游戏
            if ($gameMap.mapId() === 4) {
                frameX = 463; frameY = 370; hudX = 400; hudY = 450;
            } else {
                frameX = 720; frameY = 120; hudX = 660; hudY = 150;
            }
        } else if ($gameActors.actor(2).isStateAffected(31)) { // 睡觉中
            if ($gameMap.mapId() === 4 || $gameMap.mapId() === 54) {
                frameX = 1340; frameY = 450; hudX = 1350; hudY = 460;
            } else if (!$gameSwitches.value(44)) { // 夜袭是否拉近距离
                frameX = 850; frameY = 230; hudX = 620; hudY = 300;
            } else {
                frameX = 700; frameY = 160; hudX = 450; hudY = 250;
            }
        }

        setFrameAndHudPositions(8, frameX, frameY, hudX, hudY);
        if (hudDisplay) createHudEffect(hudX, hudY);
    }
	
	//特殊状态-洗澡
	if ($gameActors.actor(2).isStateAffected(29)) { // 洗澡中
	    if ($gameMap.mapId() === 4) {
			frameX = 1100; frameY = 550; hudX = 1000; hudY = 600;		
            setFrameAndHudPositions(7, frameX, frameY, hudX, hudY);			
		} else {
			frameX = 1400; frameY = 280; hudX = 1300; hudY = 360;		
            setFrameAndHudPositions(8, frameX, frameY, hudX, hudY);	
		}
	        if (hudDisplay) createHudEffect(hudX, hudY);
	}		
	
};
//妹妹描述窗口淡入演出
QJ.MPMZ.tl._imoutoUtilMoveStatusHud = function() {

    if ( $gameSystem._drill_GFPT_dataTank[10] ) {
		let distance;
		if ($gameActors.actor(2).isStateAffected(31) && $gameMap.mapId() === 19) {
			distance = -150;
		 } else {
			distance = 150;
		 }
		  var data = $gameSystem._drill_GFPT_dataTank[ 10 ];
                var m_data = {
				    "x": data['x'] + distance,
				    "y": data['y'],
				    "time":30,
				    "type":"增减速移动",
 				   }
				$gameSystem.drill_GFPT_moveTo( 10, m_data );
		 	
				var o_data = {
                    "opacity":255,
                    "time":30,
                    "type":"匀速变化",
                   }
                $gameSystem.drill_GFPT_opacityTo( 10, o_data );				
	}
};

//常态存在的妹妹监听器
QJ.MPMZ.tl._imoutoUtilCheckInitialization = function(forbid) {
    
	// 快捷互动按钮
	let condition = $gameScreen.picture(5) && $gameScreen.picture(5).name().includes("dozingOff");
	if (!forbid && condition) chahuiUtil.quickInteractionIconInitialize();

	if ($gameMap.getGroupBulletListQJ('imoutoUtil').length > 0) return;
		
    var imoutoUtil = QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['imoutoUtil'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',1],
        moveType:['D',false],
        existData:[	
        ],
		moveF:[
		  [60,180,QJ.MPMZ.tl._imoutoUtilkokanBarFades],  //监听妹妹HUD隐藏
		  [30,20,QJ.MPMZ.tl._imoutoUtilOniiChansHpBarFades],   //监听哥哥体力HUD隐藏
		  [60,7200,chahuiUtil.autoUpdataCheck]  // 自动更新检测
		],
    });	
	
	if ( $gameMap.mapId() === 4 ) {
		imoutoUtil.addMoveData("F",[30,2,QJ.MPMZ.tl._imoutoUtilCallSisterOver]); //监听呼叫妹妹过来操作		
	}
	// 是否强制进入贤者模式
	if ( $gameParty.leader().hasSkill(61) ) {
		imoutoUtil.addMoveData("JS",[10,120,"$gameVariables.setValue(25, -10)"]); 
	}
	
	// 防范可能存在的UI未隐藏问题
	if ( !$dataMap.note.includes("<深渊>") ) {
		
		$gameSwitches.setValue(3, false);
		// 防鼠标转向
		ctb.useTurnPlayer = false;
		// 对话框样式
		$gameSystem._drill_DSk_messageStyleId = 3;
		var id = DrillUp.g_DOp_defaultStyleId;
		$gameSystem._drill_DOp_curStyle = JSON.parse(JSON.stringify( DrillUp.g_DOp_list[ id-1 ] ));
		// 地图小按钮
		$gameSystem._drill_GBu_dataTank[ 0 ]['visible'] = false;
		$gameSystem._drill_GBu_dataTank[ 1 ]['visible'] = false;
		$gameSystem._drill_GBu_dataTank[ 2 ]['visible'] = false;
		$gameSystem._drill_GBu_dataTank[ 3 ]['visible'] = false;
		$gameSystem._drill_GBu_dataTank[ 4 ]['visible'] = false;
		$gameSystem._drill_GBu_dataTank[ 9 ]['visible'] = false;
		// 哥哥的战力显示
		$gameSystem._drill_GFV_bindTank[ 3 ]['visible'] = false;
		$gameTemp._drill_GFV_needRefresh = true;
		// 金钱显示框
		$gameSystem._ghud_visible = false;
		// Discord状态适配
		if (Imported.ODUE_discord_MV && typeof replaceRow1 === 'function') {
		replaceRow1("At home with Imouto!");
		}
		
	}
	
	// 重置系统语言标记
   var titleText = $dataSystem.gameTitle;
   if (titleText.includes("和存在感薄弱妹妹一起的简单生活")) {
        $gameVariables.setValue(1, 0);
    } else if (titleText.includes("存在感薄い妹との簡単生活")) {
        $gameVariables.setValue(1, 1);
    } else {
        $gameVariables.setValue(1, 2);
    }
    // 重置鼠标指针
    $gameStrings.setValue(36, '');	

};


// 自动更新提醒图标
QJ.MPMZ.tl._imoutoUtilautoUpdataIcon = function() {
   	
	if ($gameMap.mapId() !== 4) return;
	if ($gameScreen.picture(81)) return;
	if ($gameSwitches.value(28)) return;

	if ($gameMap.isEventRunningQJ()) {
	   setTimeout(() => QJ.MPMZ.tl._imoutoUtilautoUpdataIcon(), 2000);
	   return;
	}
	
	var IMG = "autoUpdataIcon";
	$gameScreen.showPictureFromPath(81, "characters", IMG, 0, 388, 360, 100, 100, 0, 0);
	IMG = $gameScreen.picture(81);
	// 更新提示音
	AudioManager.playSe({name: "038myuu_YumeSE_FukidashiOnnpu01", volume: 80, pitch: 100, pan: 0});
	
	if (IMG) {
    $gameScreen.movePicture(81, IMG.origin(), IMG.x(), IMG.y(), IMG.scaleX(), IMG.scaleY(), 255, 0, 30);
    IMG.drill_PCE_stopEffect();
	IMG.drill_PCE_playSustainingFloating( 518400000,1,1,120,3 );
	$gameScreen.setPictureCallCommon(81, 40, 1,null);
	}	
	
};

// 游戏公告提醒图标
QJ.MPMZ.tl._imoutoUtilGameAnnouncementIcon = function() {
   	
	if ($gameScreen.picture(82)) return;
    if ($gameMap.mapId() !== 4) return;
	if (!$gameScreen.picture(1) || !$gameScreen.picture(1).name().includes("sister_room_night_fine"))  return;
	if ($gameVariables.value(82) === $gameSystem.day()) return;
	
    if ( $gameStrings.value(25) === $gameStrings.value(26) )  return;
	
	if ($gameMap.isEventRunningQJ()) {
	   setTimeout(() => QJ.MPMZ.tl._imoutoUtilGameAnnouncementIcon(), 2000);
	   return;
	}
	$gameVariables.setValue(82, $gameSystem.day());
	
	var pid = 82;
	var IMG = "characters/gameAnnouncementIcon";
	$gameScreen.showPicture(pid, IMG, 0, 1498, 590, 100, 100, 0, 0);
	// 日记本
	$gameScreen.showPicture(pid+1, "sister_room_night_diary", 0, 1488, 644, 100, 100, 0, 0);
	var diary = $gameScreen.picture(pid+1);
	
	IMG = $gameScreen.picture(pid);
	// 更新提示音
	AudioManager.playSe({name: "038myuu_YumeSE_FukidashiOnnpu01", volume: 80, pitch: 100, pan: 0});
	
	if (IMG) {
    $gameScreen.movePicture(pid, IMG.origin(), IMG.x(), IMG.y(), IMG.scaleX(), IMG.scaleY(), 255, 0, 30);
    IMG.drill_PCE_stopEffect();
	IMG.drill_PCE_playSustainingFloating( 518400000,1,1,120,3 );
	$gameScreen.setPictureCallCommon(pid, 41, 1,null);
	}	

	if (diary) {
    $gameScreen.movePicture(pid+1, diary.origin(), diary.x(), diary.y(), diary.scaleX(), diary.scaleY(), 255, 0, 30);
	diary.drill_PLAZ_setZIndex( 2 );	
	}	
};

// 监听妹妹好感条消失
QJ.MPMZ.tl._imoutoUtilkokanBarFades = function() {
	
	//蜜汁BUG
	$gameSwitches.setValue(3, false);	
	// 立绘状态bar淡出消失
	if ([23,24,25,26].some(stateId => $gameActors.actor(2).isStateAffected(stateId))) {
	$gameSystem._drill_GFV_bindTank[5].visible = false;
	$gameSystem._drill_GFV_bindTank[6].visible = false;
	$gameSystem._drill_GFV_bindTank[7].visible = false;
	$gameSystem._drill_GFV_bindTank[8].visible = false;
	$gameTemp._drill_GFV_needRefresh = true
	}
    // 防范玩家鼠标权限始终未返还
    if ( !$gameSystem._drill_COI_map_mouse ) {
		$gameSystem._drill_COI_map_mouse = true;
	}
	
	// 发情状态监听
	if (!$gameSystem.hasGameTimeEvent('state35')) {
		$gameActors.actor(2).removeState(35);
	}
	// 犯困状态监听
	if (!$gameSystem.hasGameTimeEvent('state36')) {
		$gameActors.actor(2).removeState(36);
	}	
	// 饱腹状态监听
	if (!$gameSystem.hasGameTimeEvent('state41')) {
		$gameActors.actor(2).removeState(41);
	}	
	
};

//在家里监听呼叫妹妹过来操作
QJ.MPMZ.tl._imoutoUtilCallSisterOver = function() {
	
	this._coolDown = this._coolDown || 0; 
	if (this._coolDown > 0) this._coolDown -= 1;

		                                                                                            //  鼠标位于哥哥HP条上的情形
	let forbid1 = $gameMessage.isBusy() || $gameMap.isEventRunningQJ() || $gameSwitches.value(14) || $gameScreen.isPointerInnerPicture(81);
	// 必须是坐着的妹妹小人才适配该功能
	let forbid2 = $gameScreen.picture(5) && 
	              $gameScreen.picture(5)._opacity > 250 && 
				  ($gameScreen.picture(5).name().includes("sis_chibi_normal") || $gameScreen.picture(5).name().includes("dozingOff"));
	// 触发睡眠事件
	let forbid3 = $gameSelfSwitches.value([$gameMap.mapId(), 42, 'A']) || $gameSelfSwitches.value([$gameMap.mapId(), 15, 'D']);
	
	if ( forbid1 || !forbid2 ) {
		  if ( !$gameStrings.value(36) === 'pointer_touch' ) {
		   $gameStrings.setValue(36, '');
		  }
		return;
	} else {
		$gameStrings.setValue(36, 'pointer');
	}

    if (forbid3) {
		$gameStrings.setValue(36, '');
		return;		
	}
	
	//let rectX = TouchInput.x > 256 && TouchInput.x < 560;
	//let rectY = TouchInput.y > 393 && TouchInput.y < 872;	

	if ( !$gameScreen.isPointerInnerPicture(5) ) {
		$gameStrings.setValue(36, 'pointer');
	} else {
		$gameStrings.setValue(36, '')
		return;
	}
	
	if (Utils.isMobileDevice()) {
		  // 移动端适配，点击图标有效，但长按才能呼叫妹妹
		  if (!TouchInput.isPressed()) return;
		  let Triggerd = QJ.MPMZ.rangeAtk([['M'],['M']],['B','imoutoUtilIcon'],['S',"bulletTarget._activated=true"],['C',20]).length;
		  if (TouchInput._pressedTime < 24) return;
  		  // 玩家一直按着屏幕	
		  if ( Triggerd == 0 ) {
			$gameMap.event(15).steupCEQJ(4);
    	    this._coolDown = 30;
		  }		
	} else {
       if ( TouchInput.drill_isLeftTriggerd() || TouchInput.drill_isLeftPressed() ) {		
			// 为点击判定追加图标响应器			
		  if ( QJ.MPMZ.rangeAtk([['M'],['M']],['B','imoutoUtilIcon'],['S',"bulletTarget._activated=true"],['C',2]).length == 0 ) {
			$gameMap.event(15).steupCEQJ(4);
    	    this._coolDown = 30;
		  }
	   }		  
   	}
};

//在家里常态隐藏体力hud监听器
QJ.MPMZ.tl._imoutoUtilOniiChansHpBarFades = function() {
    this._UIcoolDown = this._UIcoolDown || 0;
	this._playerHp = this._playerHp || $gameParty.leader().hp;
	this._stateList = this._stateList || $gameParty.leader().states().length;

    if (this._UIcoolDown === 0) {
        var neddFade = QJ.MPMZ.tl._imoutoUtilOniiChansHpBarFadesInAndOut();
		
        if (this._playerHp !== $gameParty.leader().hp)	{
			this._playerHp = $gameParty.leader().hp;
            neddFade = true;
		}			
        if (this._stateList !== $gameParty.leader().states().length) {
			this._stateList = $gameParty.leader().states().length;
            neddFade = true;
		}
		
        if (!neddFade) {
            if ($gameSystem._ahud_visible) {
                // 设置延迟倒计时
                this._UIcoolDown = 4;
            } else {
                $gameSystem._ahud_visible = false;
            }
        } else {
            $gameSystem._ahud_visible = true;
        }
    } else {
        this._UIcoolDown -= 1;
        if (this._UIcoolDown === 0) {
            $gameSystem._ahud_visible = false;
        } else {
            $gameSystem._ahud_visible = true;
        }
    }
};

//体力hud淡入淡出
QJ.MPMZ.tl._imoutoUtilOniiChansHpBarFadesInAndOut = function() {
    var hud = SceneManager._scene._actorHud;
    if (hud._hud_size[0] === -1) {return false};
	if (!hud._battler) {return false};
	if ($gameVariables.value(4) < hud._hud_size[0]) {return false};
	if ($gameVariables.value(4) > hud._hud_size[2]) {return false};
	if ($gameVariables.value(5) < hud._hud_size[1]) {return false};
	if ($gameVariables.value(5) > hud._hud_size[3]) {return false};	   

    return true;
};


// 妹妹强制睡眠时间监听
QJ.MPMZ.tl._imoutoUtilSleepEventListener = function() {

    if ($gameMap.mapId() !== 4) return;
	// 夜袭场景不触发
	if (!$gameScreen.picture(1) || !$gameScreen.picture(1).name().includes("night_fine")) return;
    // 洗澡立绘不触发
    if ($gameActors.actor(2).isStateAffected(25)) return;

    // 计算当前时刻（单位：总分钟）
    const currentDay = $gameSystem.day();
    const hour     = $gameSystem.hour();
    const minute   = $gameSystem.minute();
    const currentMinutes = currentDay * 1440 + hour * 60 + minute;

    // 最优先检查： 连续吃掉两颗蓝色金平糖
	const blueKonpeito = $gameActors.actor(2).isStateAffected(36) && $gameVariables.value(19) < 0;
	if ( blueKonpeito ) $gameSelfSwitches.setValue([$gameMap.mapId(), 42, 'A'], true);

    // 第一重检查：限定在22:00～23:59或0:00～6:00的时间段内
    if (!(hour >= 22 && hour <= 23) && !(hour >= 0 && hour <= 6)) {
        return;
    }

    // 第二重检查：如果妹妹正在洗澡不触发
    if ($gameActors.actor(2).isStateAffected(29) || $gameSelfSwitches.value([$gameMap.mapId(), 14, 'A'])) {
        return;
    }


    const finalTargetMinutes = $gameVariables.value(3);
	
    // 若当前时间已到达或超过目标时间，则触发强制睡眠事件
    if ( currentMinutes >= finalTargetMinutes ) {
        if ($gameMap.event(42)) {
            $gameSelfSwitches.setValue([$gameMap.mapId(), 42, 'A'], true);
        } else {
            $gameSwitches.setValue(15, true);
        }
        // 触发后重新计算下一个目标时间
       // QJ.MPMZ.tl._imoutoUtilCalculateFinalTargetMinutes();
    }
};


// 计算强制睡眠时间
QJ.MPMZ.tl._imoutoUtilCalculateFinalTargetMinutes = function() {
    let extend = $gameSelfVariables.value([1, 2, 'healing']);
      	extend = Math.min(extend,7);
    const baseMinutes = 22 * 60; // 22点为1320分钟
    const extendMinutes = extend * 30; // 每extend增加30分钟

    let targetMinutes = baseMinutes + extendMinutes;
    let targetDay;
	
	if ($gameSystem.hour() > 15) {
      targetDay = $gameSystem.day() + 1;
	} else {
	  targetDay = $gameSystem.day();
	}

    // 若超过1440则跨天
    while (targetMinutes >= 1440) {
        targetMinutes -= 1440;
        targetDay += 1;
    }

    const finalTargetMinutes = targetDay * 1440 + targetMinutes;
    $gameVariables.setValue(3, finalTargetMinutes);
};


QJ.MPMZ.tl._imoutoUtilSceneNameDisplay = function(text) {
	
	if (!text) return;
	
	let posX = 1920 / $gameScreen.zoomScale();
    let posY = 180 / $gameScreen.zoomScale();
	let Scale = 1 / $gameScreen.zoomScale();
    let BulletText = "✦" + text;
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#aeadad",
    fontSize:26,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:"MPLUS2ExtraBold",
    fontItalic:false,
    fontBold:true,
    width:300,
    height:100,
    textAlign:6,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:8,
    shadowColor:"#000000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: 1,
            moveType: ['S', 0],
            z:"A",
			scale:Scale,
			onScreen:true,
			anchor:[1,1],
            existData: [
			],
        });		
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#d5d5d5",
    fontSize:26,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:"MPLUS2ExtraBold",
    fontItalic:false,
    fontBold:true,
    width:300,
    height:100,
    textAlign:6,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:8,
    shadowColor:"#000000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: 1,
            moveType: ['S', 0],
            z:"A",
			scale:Scale,
			anchor:[1,1],
			onScreen:true,
            existData: [
			],
			moveF:[
			  [0,999,QJ.MPMZ.tl._imoutoUtilScenesymbolDisplay]
			]
        });	
	
};


QJ.MPMZ.tl._imoutoUtilScenesymbolDisplay = function(extraText) {
	let scaleX = 0.5 / $gameScreen.zoomScale();
	let scaleY = 0.5 / $gameScreen.zoomScale();
	let posX = 1930 / $gameScreen.zoomScale();;
    let posY = 152 / $gameScreen.zoomScale();;
        QJ.MPMZ.Shoot({
            img:"line",
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
			scale:[scaleX,scaleY],
            opacity: 1,
			anchor:[1,1],
			onScreen:true,
            moveType: ['S', 0],
            z:"A",
            existData: [
			],
        });		
};



/*
	let posX = $gameMap.event(23).screenBoxXShowQJ();
    let posY = $gameMap.event(23).screenBoxYShowQJ() - 48;
	let Scale = 1 / $gameScreen.zoomScale();
    let BulletText = "✦"+$gameStrings.value(10);
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#d3d3d3",
    fontSize:26,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:null,
    fontItalic:false,
    fontBold:true,
    width:300,
    height:100,
    textAlign:5,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:8,
    shadowColor:"#000000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['E',23], ['E',23]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: 0.8,
            moveType: ['B',23,0,-56,0,-56,0,-56,0,-56],
            z:"W",
			scale:Scale,		
			anchor:[0.5,0.5],
            existData: [
			],
        });	
*/

// 摸妹妹头好感奖励
QJ.MPMZ.tl._imoutoUtilPatPatEffect = function() {

    let baseArray = [1, 2, 3, 4, 5];

    let level = $gameParty.leader().skillMasteryLevel(61);
    if (level > 0) {
        baseArray = baseArray.map(n => Math.round((n * 1.3 ** level) + level));
    }

    let weights = chahuiUtil.getImoutoMoodReaction();
    let random = chahuiUtil.gachaWeightedRandom(baseArray, weights);

    let koukan = $gameVariables.value(17) + random;
    $gameVariables.setValue(17, koukan);

    let index = baseArray.indexOf(random);
    index += 1;
    return index;
};


// 快捷摸头妹妹反应文字
QJ.MPMZ.tl._imoutoUtilMoodText = function(randomIndex) {
	
	let posX,posY; 
	if ($gameVariables.value(1) < 2) {
    do {
        posX = 320 + Math.randomInt(200); 
    } while (posX >= 380 && posX <= 460); // 排除范围	
        posY = 500 + Math.randomInt(200);
	} else {
		posX = 500 + Math.randomInt(80);
		posY = 450;
	}
	
	let textArray,textSize,textFace;
	let type = 1;
	let moveSpeed = '0|0.5~120/0.01~999/0.01';
	
    if ( $gameVariables.value(1) === 1) {
		textArray = [ "髪が乱れちゃう|", "触りすぎちゃダメ|", "悪くない|", "もっと？", "うにゃ|"];	
        textSize = 20;		
		textFace = "RiiTegakiFude";
	} else if ( $gameVariables.value(1) === 2) {
		textArray = [ "My hair will get messy!", "Don’t pat it too much!", "Feels nice", "A little longer?", "Meow..."];
		textSize = 24;
		textFace = "RiiTegakiFude";
        type = 0;	
        moveSpeed = 0;		
	} else {
		textArray = [ "头发会乱的|", "不可以摸太多啦|", "感觉还不错|", "不多摸会儿吗？", "呜喵|"];
		textSize = 24;
		textFace = null;
	}
	
	if (!randomIndex) randomIndex = 1;
	randomIndex -= 1;
    let BulletText = textArray[randomIndex];
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:type,
    textColor:"#e1e1e1",
    fontSize:textSize,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:textFace,
    fontItalic:false,
    fontBold:true,
    width:-1,
    height:-1,
    textAlign:5,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:4,
    shadowColor:"#000000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity:'0|1~30|1~90/0',
            moveType:['S',moveSpeed],
            z:"A",
			onScreen:true,
			anchor:[1,1],
            existData: [
		      {t:['Time',120]}
			],
        });		
};

// 妹妹好感度变化演出
QJ.MPMZ.tl._imoutoUtilKoukanLevelChange = function() {
	let posX = $gameSystem._drill_GFV_bindTank[7].frame_x;
	posX += 5 + Math.randomInt(50);
    let posY = $gameSystem._drill_GFV_bindTank[7].frame_y;
	posY -= Math.randomInt(10);
	
	let hearts = $gameVariables.value(15);
	let currentKoukan = $gameVariables.value(17);
	let totalKoukan = $gameVariables.value(12);
	let accumulatedKoukan = 100 * (hearts * (hearts + 1)) / 2 + currentKoukan;
	let difference = accumulatedKoukan - totalKoukan;
	if (difference <= 0) return;
    let BulletText = "+" + difference;
	$gameVariables.setValue(12, accumulatedKoukan);
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#e1e1e1",
    fontSize:20,
    outlineColor:"#e53789",
    outlineWidth:0,
    fontFace:"RiiTegakiFude",
    fontItalic:false,
    fontBold:true,
    width:64,
    height:32,
    textAlign:6,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:5,
    shadowColor:"#d1075b",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity:'0|1~30|1~60/0',
            moveType:['S','0|0.5~90/0.01~999/0.01'],
            z:"A",
			scale:1,
			onScreen:true,
			anchor:[1,1],
            existData: [
		      {t:['Time',90]}
			],
        });		
};


// 妹妹选择饮料互动反应
QJ.MPMZ.tl._imoutoUtilSelectDrinkResponse = function () {

  this._coolDown = this._coolDown || 0;
  if (this._coolDown > 0) {
    this._coolDown--;
    return;
  }

  const scene    = SceneManager._scene;
  const msgWin   = scene && scene._messageWindow;
  const itemWin  = msgWin  && msgWin._itemWindow;

  if (!itemWin || !itemWin.active) {
    this.setDead({ t: ['Time', 0] });
    return;
  }

  const item = itemWin.item();        
  if (!item || typeof item.id !== 'number') return;

  /* 切换选中物品时，出现互动内容 */
  this._selected = this._selected || 0;
  if (this._selected === item.id) return;   

  this._selected = item.id;
  $gameMap.event(44).steupCEQJ(4, { selectedId: item.id });

  this._coolDown = 3;    
};

// 妹妹服装重置
QJ.MPMZ.tl._imoutoUtilImoutoOutfitReset = function() {
	
	var imouto = $gameActors.actor(2);
	// 复原胖次
	const panties = imouto.equips()[1];
	if (!panties || !panties.name || panties.name.trim() === '') {
	var array = [154, 155, 156];
	var newPanties = array[Math.floor(Math.random() * array.length)];
	 imouto.changeEquipById(2, newPanties);
	}	
	// 复原睡衣和短裤
	imouto.changeEquipById(3, 152);
    imouto.changeEquipById(4, 153);
	
	//清除掉背包中残留的妹妹装备
	var armorIdsToRemove = [152,153,154,155,156,157,158,159];
	var armors = $gameParty.allItems().filter(function(item) {
    return item && DataManager.isArmor(item) && armorIdsToRemove.includes(item.baseItemId);
	});
	armors.forEach(function(armor) {
    $gameParty.loseItem(armor, 1);
	});	
	
};

// 妹妹语音自动播放
QJ.MPMZ.tl._imoutoUtilVoiceAutoPlayListener = function() {
	
        QJ.MPMZ.Shoot({
            img:"null1",
			groupName:['voiceAutoPlay'],
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
			onScreen:true,
            moveType: ['S', 0],
            existData: [
			{t:['S','$gameScreen.picture(30)',true]}
			],
			moveF:[
			  [60,15,QJ.MPMZ.tl._imoutoUtilVoiceAutoPlay1]
			]
        });		
	
};

QJ.MPMZ.tl._imoutoUtilVoiceAutoPlay1 = function() {
	
		this._coolDown = this._coolDown || 0;
        if (this._coolDown > 0) {
	      this._coolDown -= 1;
	      return;
        }
	
	this._count = this._count || 1;
    let random,waitTime;
    do {
        random = 1 + Math.randomInt(5);
    } while (random === this._count);
	this._count = random;
	
    switch (random) {
        case 1:  
            waitTime = 12;
            break;
        case 2:  
            waitTime = 16;
            break;
        case 3:  // 右
            waitTime = 32;
            break;
        case 4:  // 上
            waitTime = 20;
            break;
        case 5: 
            waitTime = 32;
            break;
    }		
        var voice    = {};
        voice.name   = "toilet_event_onani" + random;
        voice.volume = 40;
        voice.pitch  = 100;
        voice.pan    = 0;
        var channel  = 1;
        AudioManager.playVoice(voice, false, channel);	

    this._coolDown = waitTime;
	this._coolDown += Math.randomInt(20);
};


// 妹妹自定义浮现文字
QJ.MPMZ.tl._imoutoUtilCustomMoodText = function(posX,posY,text) {
	QJ.MPMZ.deleteProjectile('moodText');
	let textSize,textFace;
	let type = 1;
	let moveSpeed = '0|0.5~120/0.01~999/0.01';
	
    if ( $gameVariables.value(1) === 1) {
        textSize = 20;		
		textFace = "RiiTegakiFude";
	} else if ( $gameVariables.value(1) === 2) {
		textSize = 24;
		textFace = "RiiTegakiFude";
        type = 0;	
        moveSpeed = 0;		
	} else {
		textSize = 24;
		textFace = null;
	}
	
    let BulletText = text;
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:type,
    textColor:"#e1e1e1",
    fontSize:textSize,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:textFace,
    fontItalic:false,
    fontBold:true,
    width:-1,
    height:-1,
    textAlign:5,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:4,
    shadowColor:"#000000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
			groupName:['moodText'],
            opacity:'0|1~30|1~90/0',
            moveType:['S',moveSpeed],
            z:"A",
			onScreen:true,
			anchor:[1,1],
            existData: [
		      {t:['Time',120]}
			],
        });		
};

//浴室花洒动画播放器
QJ.MPMZ.tl.bathroomShowerheadAnimation = function() {
   this._frames = this._frames || 0;
   var IMG;
   if ($gameScreen.picture(40) && $gameScreen.picture(40).name().includes("actionH")) {
         IMG = "ShowerheadB" + this._frames;
    } else {
         IMG = "ShowerheadA" + this._frames;
    }
	
   var path = "washroom_nozoku";
   $gameScreen.showPictureFromPath(45, path, IMG, 0, 0, 0, 100, 100, 255, 0);
   
   this._frames += 1;
   if (this._frames >= 8) this._frames = 0;
   
};


//场景提醒图标
QJ.MPMZ.tl._imoutoUtilNotificationIcon = function(path,index,posX,posY) {

 let iconImg = "imoutoUtil/" + path;
 let radius = ['C',24];
 if (path == "button_passTime") radius = ['R',800,1080];
 let tag = "button" + index;
 
 let iconScale = 1;
 if (Utils.isMobileDevice()) iconScale = 1.5;
 var icon = QJ.MPMZ.Shoot({
    groupName:["button",tag],
    img:iconImg,
	initialRotation:['S',0],
    position:[['S',posX],['S',posY]],
	z:"A",
    imgRotation:['S',0],
	moveType: ['S',0],
	scale:iconScale,
    opacity:'0|0~30/1~99999|1',
	collisionBox:radius,
	anchor:[0.56,0.55],
    existData:[ 
	],
	moveF:[
	  [180,10,QJ.MPMZ.tl._imoutoUtilIconOpacityChange,[index]],
	],
    timeline:['S',0,120,[180,5,60]],
   });	
  
   if (index == 4) {
	  icon.addMoveData("F",[60,2,QJ.MPMZ.tl._imoutoUtilIconClickDetection]);
   }
  
};

//图标不透明度变化监听
QJ.MPMZ.tl._imoutoUtilIconOpacityChange = function(index) {
	
    if (!index) return;
	if ($gameScreen.isPointerInnerPicture(index)) {
		if (this.opacity >= 1) {
	  this.changeAttribute("opacity",'0|1~30/0~99999|0');
		}
	} else {
		if (this.opacity <= 0) {
	  this.changeAttribute("opacity",'0|0~30/1~99999|1');
		}
	}
};

//图标点击判定
QJ.MPMZ.tl._imoutoUtilIconClickDetection = function() {
	
    if (TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered()) {
		
	 QJ.MPMZ.Shoot({
		groupName:['RaidoCheck'],
        img:"null1",
        position:[['M'],['M']],
        initialRotation:['S',0],
        moveType:['S',0],
        imgRotation:['F'],
        existData:[
            {t:['Time',2]},
			{t:['B',['button4']],a:['F',QJ.MPMZ.tl._imoutoUtilIconClickPanties],p:[-1,false,true],c:['T',0,10,true]},
        ],
		collisionBox:['C',2],
     });		
		
	}
};

//胖次点击判定
QJ.MPMZ.tl._imoutoUtilIconClickPanties = function() {
	
	if ($gameMessage.isBusy() || SceneManager._scene._messageWindow._choiceWindow.active) return;
	
     $gameScreen.setPictureRemoveCommon(2);
     $gameScreen.setPictureRemoveCommon(4);
     $gameScreen.setPictureRemoveCommon(5);
     $gameMap.event(6).steupCEQJ(1);	
	 this.setDead({t:['Time',0]});
	
};

//洗面所点击空白处判定
QJ.MPMZ.tl._imoutoUtilWashRoomClickBlankSpace = function() {
	
  if ($gameScreen.isPointerInnerPicture(2)) return;
  if ($gameScreen.isPointerInnerPicture(4)) return;
  if ($gameScreen.isPointerInnerPicture(7)) return;
  if ($gameScreen.isPointerInnerPicture(8)) return;
  
  if (TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered()) {

	 QJ.MPMZ.Shoot({
		groupName:['RaidoCheck'],
        img:"null1",
        position:[['M'],['M']],
        initialRotation:['S',0],
        moveType:['S',0],
        imgRotation:['F'],
        existData:[
            {t:['Time',6]},
			{t:['B',['buttonnull']],a:['F',QJ.MPMZ.tl._imoutoUtilWashRoomClickBlankSpaceEffect],p:[-1,false,true],c:['T',0,6,true]},
        ],
		collisionBox:['C',2],
     });	  

	
  }
  
};

//洗面所点击空白处判定
QJ.MPMZ.tl._imoutoUtilWashRoomClickBlankSpaceEffect = function() {
	
	if ($gameMessage.isBusy() || SceneManager._scene._messageWindow._choiceWindow.active) return;
	$gameScreen.setPictureRemoveCommon(2);
    $gameScreen.setPictureRemoveCommon(4);
    $gameScreen.setPictureRemoveCommon(5);
    $gameMap.event(3).steupCEQJ(4);	
};
	
//第一次潜入洗面所的退出判断
QJ.MPMZ.tl._imoutoUtilWashRoomFirstTimePeeking = function() {

    let condition1 = $gameSelfSwitches.value([$gameMap.mapId(), 6, 'F']);
    let condition2 = $gameSelfSwitches.value([$gameMap.mapId(), 17, 'F']);
    let condition3 = $gameSelfSwitches.value([$gameMap.mapId(), 20, 'B']);
	
        if (condition1 && condition2 && !condition3) {
            $gameSelfSwitches.setValue([$gameMap.mapId(), 20, 'B'], true);
            $gameScreen._pictureCidArray = [];
            $gameMap.event(20).steupCEQJ(1);
            this.setDead({t:['Time',0]});
        }

};

// 监听妹妹洗澡时间阶段
QJ.MPMZ.tl._imoutoUtilWashRoomPeekingTimeCalculation = function() {
	
    // 若尚未设置过基准时间
    if (!this._fixedHour && !this._fixedMinute) {
        const currentHour = $gameSystem.hour();
        const currentMinute = $gameSystem.minute();
        let newMinute = currentMinute + 25;
        let newHour   = currentHour;
        if (newMinute >= 60) {
            newMinute -= 60;
            newHour += 1;
        }
        this._fixedHour = newHour;
        this._fixedMinute = newMinute;
		this._eventLevel = this._eventLevel || 1;
    }

    // 当前时间(总分钟)
    const nowTotal = $gameSystem.hour() * 60 + $gameSystem.minute();
    // 目标时间(总分钟)
    const fixedTotal = this._fixedHour * 60 + this._fixedMinute;
    // 剩余多少分钟
    let remain = fixedTotal - nowTotal;
    // 妹妹出浴
    if (remain <= 0) {
       $gameVariables.setValue(19, 99999);	
	   $gameMap.event(7).steupCEQJ(1);	
       this.setDead({t:['Time',0]});
        return;
    }
	// 分阶段划分妹妹的行动
    const passed = 25 - remain;	
    let currentLevel;
    if (passed < 3) {
        currentLevel = 1;
    } else if (passed < 6) {
        currentLevel = 2;
    } else if (passed < 9) {
        currentLevel = 3;
    } else if (passed < 12) {
        currentLevel = 4;
    } else if (passed < 15) {
        currentLevel = 5;
    } else if (passed < 18) {
        currentLevel = 6;
	} else if (passed < 21) {
		// 妹妹开始泡澡
		$gameSelfSwitches.setValue([$gameMap.mapId(), 17, 'D'], true);
		currentLevel = 7;
    } else if (passed < 24) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), 17, 'D'], true);
		currentLevel = 8;
    } else {	
		$gameSelfSwitches.setValue([$gameMap.mapId(), 17, 'D'], true);		
		currentLevel = 9;
	} 
    // 阶段检查
    if (this._eventLevel !== currentLevel) {
        $gameMap.event(29).steupCEQJ(1);
    }	

    // 适配洗发水事件
    if (currentLevel >= 2 && $gameSelfSwitches.value([4, 14, 'B'])) {
        $gameSelfSwitches.setValue([$gameMap.mapId(), 6, 'D'], true);
    }	
	
	// 记录阶段和剩余时间
	this._eventLevel = currentLevel;
	this._remainTime = remain;
	
};

// 亲密接触初始化
QJ.MPMZ.tl._imoutoUtilSkinship = function() {
	
	// 改变指针
	$gameStrings.setValue(36, 'pointer_touch');
	$gameSwitches.setValue(46, true);
	
    var ahoge = $gameScreen.picture(20);
    if (ahoge && !ahoge.drill_PDr_getDragController()) {
        ahoge.drill_COPWM_setPixelHoverEnabled(true);  // 像素级判定
        ahoge.drill_PDr_setCanDrag(true);                // 可拖拽
        ahoge.drill_PAS_addAdsorbType("卡牌A类");          // 添加吸附类型
        ahoge.drill_PAS_setPullOutEnabled(false);         // 拖拽后可脱离槽
        $gameScreen.drill_PAS_addSlot_ByIndex(1, 1300, 150, 0);
        ahoge.drill_PAS_doAdsorb1_ByIndex(1);
    }

    var Skinship = QJ.MPMZ.Shoot({
        img: "null1",
        groupName: ['skinshipListeners'],
        existData: [
            { t: ['SW', 46, false] },
            { t: ["S", "!$gameMessage.isBusy()&&(Input.isPressed('cancel')||TouchInput.isCancelled())", true], a: ["S", "$gameMap.event(4).steupCEQJ(1);$gameStrings.setValue(36, '')"] }
        ],
        moveF: [
            [30, 1, QJ.MPMZ.tl._imoutoUtilSkinshipAhogeDetection],
            [30, 1, QJ.MPMZ.tl._imoutoUtilSkinshipHitboxDetection]
        ]
        // deadJS: ["$gameMap.event(4).steupCEQJ(1)"]
    });
		
};

// 亲密接触摸呆毛判定
QJ.MPMZ.tl._imoutoUtilSkinshipAhogeDetection = function() {

	// 摸呆毛判定
	 var ahoge = $gameScreen.picture(20);
    if ( $gameMessage.isBusy() || $gameSwitches.value(14) || $gameSwitches.value(32) || $gameSwitches.value(33) ) {
		
        if( ahoge ) {
          ahoge.drill_PDr_setCanDrag( false );
        }	 
		
	} else {
        if( ahoge ) {
          ahoge.drill_PDr_setCanDrag( true );
        }			
	}

	if ( !ahoge || $gameMessage.isBusy() || $gameSwitches.value(14) || $gameSwitches.value(32) || $gameSwitches.value(33) ) {
		
		if (ahoge){
          ahoge.drill_PDr_clearDragPosition();
		   
        }
		return;
	}
	
	var disX = ahoge.drill_PDr_getDraggingXOffset();
	var disY = ahoge.drill_PDr_getDraggingYOffset();
	var distance = Math.sqrt(disX ** 2 + disY ** 2);
	if (Math.abs(distance) > 6) {
		ahoge.drill_PDr_setCanDrag( false );
		$gameSwitches.setValue(14, true);
		$gameMap.steupCEQJ(37,1,{skipAchievement:true, ahogeDistance:disX});
		QJ.MPMZ.deleteProjectile('skinshipListeners');
		return;
	}
};


// 亲密接触部位判定
QJ.MPMZ.tl._imoutoUtilSkinshipHitboxDetection = function() {

	this._coolDown = this._coolDown || 0;
    this._idleTime = this._idleTime	|| 0;
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
    // 流程锁，需主动解锁
    if (this._suspend) {
		return;
	}
    // 无操作判定
  if (!TouchInput.drill_isLeftPressed() && !$gameSwitches.value(14) && !$gameMap.isAnyEventStartingQJ()) {
	  this._idleTime += 1;
	  if (this._idleTime >= 60) {
		  this._coolDown = 5;
		  this._idleTime = 0;
		  if (!$gameScreen.picture(16) || $gameScreen.picture(16).name().includes("OAO")) return;
		       $gameScreen.showPicture(16, "mio_tachie_kao_OAO", 0, 1000, 150, 100, 100, 255, 0);
			   
			   const key   = "MapEventDialogue4";
               const table = window[key];
               const lines = table && table["4"] && table["4"]["3"];
			   if (Array.isArray(lines) && lines.length) {
                  const PREFIX = "\\dDCOG[11:2:2:2]\\fs[32]";
                  const text = PREFIX + lines.join();
			      $gameTemp.drill_GFTT_createSimple([1480, 215], text, 5, 9, 150);
			   }
			   
               AudioManager.playVoice(
                   { name: "sis_room_tachie_kimochi04", volume: 90, pitch: 100, pan: 0 },
                   false, 2
               );		   
		  return;
	  }
  }
    
	
	let Touching = false;
	// 移动端适配
	if ( Utils.isMobileDevice() ) {
		Touching = TouchInput.isPressed() || TouchInput.isTriggered();
	} else {
		Touching = TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered();
	}

	
  if ( Touching ) {
	  
	  this._idleTime = -60;
	
	if ($gameScreen.isPointerInnerPicture(20)) return;


    let Pressed = false;
	let Triggered = false;
	// 移动端适配,并细分触摸动作
	if ( Utils.isMobileDevice() ) {
		Pressed = TouchInput.isPressed(); 
		Triggered = TouchInput.isTriggered();
	} else {
		Pressed = TouchInput.drill_isLeftPressed(); 
		Triggered = TouchInput.drill_isLeftTriggered();
	}
	
	// 穿着T恤
	if ( $gameActors.actor(2).isStateAffected(23) && Pressed ) {
		
		if ( chahuiUtil.pointInPolygo('TshirtCollar') && TouchInput.isMoved() ) {
		 	 this._coolDown = 999;
             $gameMap.event(4).steupCEQJ(3,{skinShip:"B"});
    	     return;			
		}
		if ( chahuiUtil.pointInPolygo('TshirtHem') && TouchInput.isMoved() ) {
		 	 this._coolDown = 999;
             $gameMap.event(4).steupCEQJ(3,{skinShip:"A"});
			 return;			
		}		
	}

	
	// 摸头判定
    if ( chahuiUtil.pointInEllipse('tachieHead') && TouchInput.isMoved() ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(4).steupCEQJ(2);
         return;		 
	}
    // 乳头判定-左
    if ( chahuiUtil.pointInCircle('tachieLeftNipple') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if ( TouchInput.isMoved() && Pressed ) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(4,{actionType:type});
         return;	
	}
	// 乳头判定-右
    if ( chahuiUtil.pointInCircle('tachieRightNipple') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if ( TouchInput.isMoved() && Pressed ) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(4,{actionType:type});
         return;	
	}	
    // 揉胸判定-左
    if ( chahuiUtil.pointInCircle('tachieLeftBreast') && Pressed ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(1);
         return;	
	}
    // 揉胸判定-右
    if ( chahuiUtil.pointInCircle('tachieRightBreast') && Pressed ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(1);
         return;		
	}
    // 摸肚脐判定
    if ( chahuiUtil.pointInCircle('tachieNavel') && Pressed ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if (TouchInput.isMoved()) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(5,{touchPoint:"navel",actionType:type});
         return;
	}
    // 小穴区域判定	
    if ( chahuiUtil.pointInPolygo('tachieOmanko') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(2);
         return;		 
	}	
    // 胖次区域判定	
    if ( !$gameActors.actor(2).equips()[3] && $gameActors.actor(2).equips()[1] !== undefined ) {
		if ( chahuiUtil.pointInPolygo('tachiePanties') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(2);
         return;	
        }		 
	}
    // 短裤区域判定	
    if ( $gameActors.actor(2).equips()[3] !== undefined ) {
		 if ( chahuiUtil.pointInPolygo('tachieShortpants') ) {
			 
		 }
	}	
    // 锁骨区域判定	
    if ( chahuiUtil.pointInPolygo('tachieClavicle') && Pressed ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if (TouchInput.isMoved()) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(5,{touchPoint:"clavicle",actionType:type});
         return;		 
	}
    // 右耳区域判定	
    if ( chahuiUtil.pointInPolygo('tachieRightEar') && TouchInput.isMoved() ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if ( TouchInput.isMoved() && Pressed ) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(5,{touchPoint:"ear",actionType:type});
		 return;
	}	
    // 左耳区域判定	
    if ( chahuiUtil.pointInPolygo('tachieLeftEar') && TouchInput.isMoved() ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 let type;
		 if ( TouchInput.isMoved() && Pressed ) {
           type = "stroke";
		 } else {
		   type = "poke";
		 }
         $gameMap.event(5).steupCEQJ(5,{touchPoint:"ear",actionType:type});
		 return;
	}
	// 未触发任何判定时，视为挠痒痒
	   if (TouchInput.isMoved() && Math.random() > 0.99 && $gameScreen.isPointerInnerPicture(11)) {
	   $gameMap.event(5).steupCEQJ(3);	
	   }
  }
};


// 实验中的吃饭动画
QJ.MPMZ.tl._imoutoUtilTest = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	
	var Imouto = "辣晕" + this._frames;
	$gameScreen.showPictureFromPath(11, "diningRoom", Imouto, 0, 0, 0, 100, 100, 255, 0);

    if (this._frames == 1) this._coolDown += 60;
	if ([2,3,4].includes(this._frames)) this._coolDown += 12;

    var index = this._frames;	
	if ([1,2,3,4].includes(this._frames)) index = "1-4";
	if ([9,10].includes(this._frames)) index = "9-10";
	if ([11,12].includes(this._frames)) index = "11-12";
	if ([13,14].includes(this._frames)) index = "13-14";
	if ([15,16].includes(this._frames)) index = "15-16";
	if ([17,18,19,20,21].includes(this._frames)) index = "17";
	
	var Shadow = "影子" + index;
	$gameScreen.showPictureFromPath(10, "diningRoom", Shadow, 0, 0, 0, 100, 100, 255, 2);

	if (this._frames == 21) {
		this._frames = 1;
		this._coolDown += 90;
	}
	
	this._frames += 1;
	this._coolDown += 3;
	
};

QJ.MPMZ.tl.beginnersGuideTextPosition = {
	
	"guide0":{
		x: 420,
		y: 330,
		index: 0
	},	
	"guide1":{
		x: 960,
		y: 600,
		index: 1
	},
	"guide2":{
		x: 750,
		y: 600,
		index: 2
	},
	"guide3":{
		x: 1700,
		y: 290,
		index: 3
	},
	"mobileSaveReminder1":{
		x: 960,
		y: 500,
		index: 4
	},
	"mobileSaveReminder2":{
		x: 960,
		y: 500,
		index: 5
	},	
};

// 新手教程演出
QJ.MPMZ.tl._imoutoUtilBeginnersGuide = function(guideIndex) {
	
	var guide = QJ.MPMZ.tl.beginnersGuideTextPosition[guideIndex];
	if (!guide) return;

    var guideTextArray = window["MapEventDialogue4"]["beginnersGuide"][guide.index];

    var FontFace = "RiiTegakiFude";
    // 中文适配
    if (ConfigManager.language === 0) {
        FontFace = "Haiyanzhishidongdong";
    }
    
	let FontSize = 28;
    // 移动端适配
    if (Utils.isMobileDevice()) {
		guideTextArray = window["MapEventDialogue4"]["AndroidBeginnersGuide"][guide.index];
		FontSize = 32;
	}
    
	for (let i = 0; i < guideTextArray.length; i++) {
	
    // 文字和坐标
	var guideText = guideTextArray[i];
    var textPosX = guide.x;
    var textPosY = guide.y + (i * (FontSize + 4));

    QJ.MPMZ.Shoot({
        img: ['T', {
            text: guideText,
            textColor: "#ffffff",
            fontSize: 28,
            outlineColor: "#000000",
            outlineWidth: 0,
            fontFace: FontFace,
            fontItalic: false,
            fontBold: true,
			advanced: true,
            width: -1,
            height: -1,
            textAlign: 5,
            lineWidth: 0,
            lineColor: "#ffffff",
            lineRate: 1.0,
            backgroundColor: null,
            backgroundOpacity: 1,
            shadowBlur: 4,
            shadowColor: "#000000",
            shadowOffsetX: 0,
            shadowOffsetY: 0
        }],
        position: [['S', textPosX], ['S', textPosY]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        groupName: ['BeginnersGuide',guideIndex],
        opacity: '0|0~60/1~30/1~60/0',
        scale: 1,
        moveType: ['S', 0],
        z: "A",
        existData: [
            //{ t: ['Time', 180] }
        ],
    });
  }
};