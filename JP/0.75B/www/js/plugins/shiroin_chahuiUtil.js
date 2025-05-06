/*:
 * @plugindesc 
 * @author shiroin
 *
 * @help
 * 
 */

var chahuiUtil = chahuiUtil || {};

// 快捷显示公共事件文本
Game_Interpreter.prototype.showCommonEventDialogue = function(type, idx, subIdx) {


        const key   = "commonEventDialogue";
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


DataManager._databaseFiles.push(

  {
    name: "dataSceneObjectDescriptionText",
    src: "sceneObjectDescriptionText.json"
  }

);


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
  // 1. 基本设置：清头像区、背景、位置
  $gameMessage.setFaceImage('', 0);
  $gameMessage.setBackground(0);
  $gameMessage.setPositionType(2);

  // 2. 每页最多显示 4 行
  const maxLines = 4;
  const chunks = [];
  for (let i = 0; i < textArray.length; i += maxLines) {
    chunks.push(textArray.slice(i, i + maxLines));
  }

  // 3. 逐页输出：
  chunks.forEach(function(lines, pageIndex) {
    if (pageIndex > 0) {
      // 非第一页，先插入翻页符
      $gameMessage.add('\f');
    }
    // 本页一次性把所有行 join 在一起，中间用单个 '\n'
    $gameMessage.add(lines.join('\n'));
  });
  // 选项适配
  if (this.nextEventCode() === 102) {
    this._index++;
    this.setupChoices(this.currentCommand().parameters);
  }  
  this.setWaitMode('message');
};

// 为场景物件绑定文本描述
chahuiUtil.bindDescriptionToSceneObjects = function (pid, index) {

    if (!window.dataSceneObjectDescriptionText) {
        console.error("sceneObjectDescriptionText 数据未加载");
        return;
    }

    let lang;
    switch ($gameVariables.value(1)) {
      case 0:
      lang = "0";  
	  break;
      case 1:
      lang = "1";  
	  break;
      case 2:
      lang = "2";  
	  break;
      default:
      lang = "0"; 
	  break;
    }
	
	let descData = window.dataSceneObjectDescriptionText;
	let raw = descData[String(index)][lang];
	let prefix = "\\fs[14]\\fi\\c[110]";
	let lines = raw.map(function(line) {
    if (!line.startsWith(prefix)) {
        return prefix + line;
       }
        return line;
    });
	
    let picture = $gameScreen.picture(pid);
	if (!picture) return;
    let bind = DrillUp.g_MPFP_list[6];
	
    if (!picture._drill_MPFP_bean) {
      picture._drill_MPFP_bean = new Drill_MPFP_Bean();
      $gameTemp._drill_MPFP_needRestatistics = true; 
      picture.drill_COPWM_checkData(); 
   }
   
    picture._drill_MPFP_bean.drill_bean_setVisible(true);
    picture._drill_MPFP_bean.drill_bean_setContextList(lines);
    picture._drill_MPFP_bean.drill_bean_setSkinStyle(bind['style_mode'], bind['style_lockedId']);	
	
};

chahuiUtil.resetAllSelfSwitchesForEvents = function (...eventIds) {
    let mapId = $gameMap._mapId;
    let selfSwitches = ["A", "B", "C", "D", "E"];

    eventIds.forEach(function(eventId) {
        selfSwitches.forEach(function(switchChar) {
            let key = [mapId, eventId, switchChar];
            $gameSelfSwitches.setValue(key, false);
        });
    });
};

chahuiUtil.changeSelfSwitchForEvent = function (eventId, switchCharToActivate) {
    let mapId = $gameMap._mapId;
    let selfSwitches = ["A", "B", "C", "D", "E"];

    selfSwitches.forEach(function(switchChar) {
        if (switchChar !== switchCharToActivate) {
            let key = [mapId, eventId, switchChar];
            $gameSelfSwitches.setValue(key, false);
        }
    });

    let keyToActivate = [mapId, eventId, switchCharToActivate];
    $gameSelfSwitches.setValue(keyToActivate, true);
};

chahuiUtil.checkSelfSwitchesForEvent = function (eventId) {
    let mapId = $gameMap._mapId;
    let selfSwitches = ["A", "B", "C", "D", "E"];
    let isActive = false;

    for (let i = 0; i < selfSwitches.length; i++) {
        let key = [mapId, eventId, selfSwitches[i]];
        if ($gameSelfSwitches.value(key)) {
            isActive = true;
            break;
        }
    }

    if (isActive) {
        selfSwitches.forEach(function(switchChar) {
            let key = [mapId, eventId, switchChar];
            $gameSelfSwitches.setValue(key, false);
        });
        return true;
    } else {
        return false;
    }
};


chahuiUtil.changesisterKao = function (eventId) {
    let Id = $gameVariables.value(36);
    let mapId = $gameMap._mapId;
    let selfSwitches = ["A", "B", "C", "D", "E"];

    selfSwitches.forEach(function(switchChar) {
        let key = [mapId, eventId, switchChar];
        $gameSelfSwitches.setValue(key, false);
    });
   
    if (Id >= 0 && Id < selfSwitches.length) {
        let key = [mapId, eventId, selfSwitches[Id]];
        $gameSelfSwitches.setValue(key, true);
    }
};

//预加载
Game_Map.prototype.chahuiPreloadPicture = function (Path, Id) {
    const images = {
        Onichann: ["fera_onichann_Hand2", "fera_onichann_Hand3", "fera_onichann_Hand3B", "fera_onichann_Hand4", "fera_onichann_Hand4B", "fera_onichann_Hand5", "fera_onichann_Hand5B", "fera_onichann_Hand6", "onichann_back", "onichann_back_takeoff", "onichann_back_thigh", "onichann_hand_breastTouchA0", "onichann_hand_breastTouchA1", "onichann_hand_breastTouchB0", "onichann_hand_breastTouchB1", "onichann_hand_breastTouchCD0", "onichann_hand_breastTouchCD1", "onichann_hand_breastTouchCD2", "onichann_hand_breastTouchCD3", "onichann_hand_breastTouchCD4", "onichann_hand_breastTouchCD5", "onichann_hand_breastTouchCD6", "onichann_hand_breastTouchCL0", "onichann_hand_breastTouchCL1", "onichann_hand_breastTouchCL2", "onichann_hand_breastTouchCL3", "onichann_hand_breastTouchCL4", "onichann_hand_breastTouchCL5", "onichann_hand_breastTouchCL6", "onichann_hand_breastTouchCR0", "onichann_hand_breastTouchCR1", "onichann_hand_breastTouchCR2", "onichann_hand_breastTouchCR3", "onichann_hand_breastTouchCR4", "onichann_hand_breastTouchCR5", "onichann_hand_breastTouchCR6", "onichann_hand_breastTouchNL0", "onichann_hand_breastTouchNL1", "onichann_hand_breastTouchNL2", "onichann_hand_breastTouchNL3", "onichann_hand_breastTouchNL4", "onichann_hand_breastTouchNL5", "onichann_hand_breastTouchNL6", "onichann_hand_breastTouchNR0", "onichann_hand_breastTouchNR02", "onichann_hand_breastTouchNR1", "onichann_hand_breastTouchNR2", "onichann_hand_breastTouchNR3", "onichann_hand_breastTouchNR4", "onichann_hand_breastTouchNR5", "onichann_hand_breastTouchNR6", "onichann_hand_hiraku_hugL", "onichann_hand_hiraku_hugR", "onichann_hand_hug", "onichann_hand_hug1", "onichann_hand_hug1_A", "onichann_hand_hugL", "onichann_hand_hugR", "onichann_hand_insert0", "onichann_hand_insert1", "onichann_hand_insert2", "onichann_hand_insert3", "onichann_hand_insert4", "onichann_hand_insert5", "onichann_hand_insert6", "onichann_hand_insert7", "onichann_hand_insert8", "onichann_hand_omangoTouch", "onichann_hand_onanii0", "onichann_hand_onanii1", "onichann_hand_onanii2", "onichann_hand_onanii3", "onichann_hand_onanii4", "onichann_hand_onanii5", "onichann_hand_onanii6", "onichann_hand_shimeru_breastTouchCD0", "onichann_hand_shimeru_breastTouchCD1", "onichann_hand_shimeru_breastTouchCD2", "onichann_hand_shimeru_breastTouchCD3", "onichann_hand_shimeru_breastTouchCD4", "onichann_hand_shimeru_breastTouchCD5", "onichann_hand_shimeru_breastTouchCD6", "onichann_hand_shimeru_breastTouchCL0", "onichann_hand_shimeru_breastTouchCL1", "onichann_hand_shimeru_breastTouchCL2", "onichann_hand_shimeru_breastTouchCL3", "onichann_hand_shimeru_breastTouchCL4", "onichann_hand_shimeru_breastTouchCL5", "onichann_hand_shimeru_breastTouchCL6", "onichann_hand_shimeru_breastTouchCR0", "onichann_hand_shimeru_breastTouchCR1", "onichann_hand_shimeru_breastTouchCR2", "onichann_hand_shimeru_breastTouchCR3", "onichann_hand_shimeru_breastTouchCR4", "onichann_hand_shimeru_breastTouchCR5", "onichann_hand_shimeru_breastTouchCR6", "onichann_hand_shimeru_breastTouchNL0", "onichann_hand_shimeru_breastTouchNL1", "onichann_hand_shimeru_breastTouchNL2", "onichann_hand_shimeru_breastTouchNL3", "onichann_hand_shimeru_breastTouchNL4", "onichann_hand_shimeru_breastTouchNL5", "onichann_hand_shimeru_breastTouchNL6", "onichann_hand_shimeru_breastTouchNR0", "onichann_hand_shimeru_breastTouchNR1", "onichann_hand_shimeru_breastTouchNR2", "onichann_hand_shimeru_breastTouchNR3", "onichann_hand_shimeru_breastTouchNR4", "onichann_hand_shimeru_breastTouchNR5", "onichann_hand_shimeru_breastTouchNR6", "onichann_hand_thighTouch0", "onichann_hand_thighTouch1", "onichann_hand_thighTouch2", "onichann_hand_thighTouch3", "onichann_hand_thighTouch4", "onichann_hand_thighTouch5", "onichann_hand_thighTouch6", "onichann_hand_touch0", "onichann_hand_touch1", "onichann_hand_touch2", "onichann_hand_touch3", "onichann_hand_touch4", "onichann_hand_touch5", "onichann_kijoui_hand_hug", "onichann_leg", "onichann_shoulder"],
        sisterShimeru: ["sister_shimeru_back0", "sister_shimeru_back1", "sister_shimeru_back10", "sister_shimeru_back11", "sister_shimeru_back12", "sister_shimeru_back2", "sister_shimeru_back3", "sister_shimeru_back4", "sister_shimeru_back5", "sister_shimeru_back6", "sister_shimeru_back7", "sister_shimeru_back8", "sister_shimeru_back9", "sister_shimeru_back_upper", "sister_shimeru_blush", "sister_shimeru_camisole", "sister_shimeru_camisole_remove", "sister_shimeru_camisole_shadow", "sister_shimeru_coatHem", "sister_shimeru_hand", "sister_shimeru_hand0", "sister_shimeru_hand1", "sister_shimeru_hand2", "sister_shimeru_hand3", "sister_shimeru_hand4", "sister_shimeru_hand5", "sister_shimeru_hand6", "sister_shimeru_kao00", "sister_shimeru_kao01", "sister_shimeru_kao02", "sister_shimeru_kao03", "sister_shimeru_kao04", "sister_shimeru_kao10", "sister_shimeru_kao11", "sister_shimeru_kao12", "sister_shimeru_kao13", "sister_shimeru_kao14", "sister_shimeru_kao20", "sister_shimeru_kao21", "sister_shimeru_kao22", "sister_shimeru_kao23", "sister_shimeru_kao24", "sister_shimeru_kao30", "sister_shimeru_kao31", "sister_shimeru_kao32", "sister_shimeru_kao33", "sister_shimeru_kao34", "sister_shimeru_kao40", "sister_shimeru_kao41", "sister_shimeru_kao42", "sister_shimeru_kao43", "sister_shimeru_kao44", "sister_shimeru_kao45", "sister_shimeru_kao5", "sister_shimeru_shortpants", "sister_shimeru_white_panties"],
        sisterNormal: ["sister_normal_back", "sister_normal_camisole", "sister_normal_coatHem", "sister_normal_hand0", "sister_normal_hand1", "sister_normal_hand2", "sister_normal_hand3", "sister_normal_hand4", "sister_normal_hand5", "sister_normal_hand6", "sister_normal_hand7", "sister_normal_kao0", "sister_normal_kao1", "sister_normal_kao2", "sister_normal_shortpants"],
        sisterHiraku: ["sister_hiraku_back", "sister_hiraku_backB", "sister_hiraku_blush", "sister_hiraku_camisole", "sister_hiraku_camisole_remove", "sister_hiraku_camisole_shadow", "sister_hiraku_coatHem", "sister_hiraku_hand", "sister_hiraku_hand0", "sister_hiraku_hand1", "sister_hiraku_hand2", "sister_hiraku_hand3", "sister_hiraku_hand4", "sister_hiraku_hand5", "sister_hiraku_hand6", "sister_hiraku_kao00", "sister_hiraku_kao01", "sister_hiraku_kao02", "sister_hiraku_kao03", "sister_hiraku_kao04", "sister_hiraku_kao10", "sister_hiraku_kao11", "sister_hiraku_kao12", "sister_hiraku_kao13", "sister_hiraku_kao14", "sister_hiraku_kao20", "sister_hiraku_kao21", "sister_hiraku_kao22", "sister_hiraku_kao23", "sister_hiraku_kao24", "sister_hiraku_kao30", "sister_hiraku_kao31", "sister_hiraku_kao32", "sister_hiraku_kao33", "sister_hiraku_kao34", "sister_hiraku_kao40", "sister_hiraku_kao41", "sister_hiraku_kao42", "sister_hiraku_kao43", "sister_hiraku_kao44", "sister_hiraku_kao45", "sister_hiraku_shortpants", "sister_hiraku_white_panties"],
        sisterKijoui: ["sister_kijoui_back", "sister_kijoui_blush", "sister_kijoui_camisole", "sister_kijoui_camisole_remove", "sister_kijoui_coatHem", "sister_kijoui_hadakaA0", "sister_kijoui_hadakaA1", "sister_kijoui_hadakaA2", "sister_kijoui_hadakaA3", "sister_kijoui_hadakaA4", "sister_kijoui_hadakaA5", "sister_kijoui_hadakaA6", "sister_kijoui_hadakaA_end", "sister_kijoui_hadakaA_end_back", "sister_kijoui_hadakaB0", "sister_kijoui_hadakaB1", "sister_kijoui_hadakaB10", "sister_kijoui_hadakaB2", "sister_kijoui_hadakaB3", "sister_kijoui_hadakaB4", "sister_kijoui_hadakaB5", "sister_kijoui_hadakaB6", "sister_kijoui_hadakaB7", "sister_kijoui_hadakaB8", "sister_kijoui_hadakaB9", "sister_kijoui_hand0", "sister_kijoui_hand1", "sister_kijoui_hand10", "sister_kijoui_hand2", "sister_kijoui_hand3", "sister_kijoui_hand4", "sister_kijoui_hand5", "sister_kijoui_hand6", "sister_kijoui_hand7", "sister_kijoui_hand8", "sister_kijoui_hand9", "sister_kijoui_kao00", "sister_kijoui_kao01", "sister_kijoui_kao02", "sister_kijoui_kao03", "sister_kijoui_kao04", "sister_kijoui_kao10", "sister_kijoui_kao11", "sister_kijoui_kao12", "sister_kijoui_kao13", "sister_kijoui_kao14", "sister_kijoui_kao20", "sister_kijoui_kao21", "sister_kijoui_kao22", "sister_kijoui_kao23", "sister_kijoui_kao24", "sister_kijoui_kao30", "sister_kijoui_kao31", "sister_kijoui_kao32", "sister_kijoui_kao33", "sister_kijoui_kao34", "sister_kijoui_kao4", "sister_kijoui_kao40", "sister_kijoui_kao41", "sister_kijoui_kao42", "sister_kijoui_kao43", "sister_kijoui_kao44", "sister_kijoui_kao45"],
        washRoom: ["washroom_CR_D_RL", "washroom_door", "washroom_door1", "washroom_door2", "washroom_doorLine", "washroom_doorOpen", "washroom_exit", "washroom_fog", "washroom_ofuro_bathtowel", "washroom_ofuro_nuked", "washroom_ofuro_nuked2", "washroom_onichann_bluePanties_onani0", "washroom_onichann_bluePanties_onani1", "washroom_onichann_bluePanties_onani2", "washroom_onichann_bluePanties_onani3", "washroom_onichann_bluePanties_onani4", "washroom_onichann_bluePanties_onani5", "washroom_onichann_hands0", "washroom_onichann_hands1", "washroom_onichann_hands2", "washroom_onichann_hands3", "washroom_onichann_hands4", "washroom_onichann_hands_shake0", "washroom_onichann_hands_shake1", "washroom_onichann_hands_shake2", "washroom_onichann_hands_shake3", "washroom_onichann_hands_shake4", "washroom_onichann_onani0", "washroom_onichann_onani1", "washroom_onichann_onani2", "washroom_onichann_onani3", "washroom_onichann_onani4", "washroom_onichann_onani5", "washroom_onichann_onani_seieki0", "washroom_onichann_onani_seieki1", "washroom_onichann_onani_seieki2", "washroom_onichann_onani_seieki3", "washroom_onichann_onani_seieki4", "washroom_onichann_onani_seieki5", "washroom_onichann_pinkPanties_onani0", "washroom_onichann_pinkPanties_onani1", "washroom_onichann_pinkPanties_onani2", "washroom_onichann_pinkPanties_onani3", "washroom_onichann_pinkPanties_onani4", "washroom_onichann_pinkPanties_onani5", "washroom_onichann_whitePanties_onani0", "washroom_onichann_whitePanties_onani1", "washroom_onichann_whitePanties_onani2", "washroom_onichann_whitePanties_onani3", "washroom_onichann_whitePanties_onani4", "washroom_onichann_whitePanties_onani5", "washroom_sis_bluePanties_0", "washroom_sis_bluePanties_1", "washroom_sis_bluePanties_2U", "washroom_sis_bluePanties_3", "washroom_sis_bluePanties_4", "washroom_sis_brush", "washroom_sis_brush_cloudy", "washroom_sis_clothes", "washroom_sis_clothes_bluePanties", "washroom_sis_clothes_nopanties", "washroom_sis_clothes_pinkPanties", "washroom_sis_clothes_whitePanties", "washroom_sis_datsui_bareta0", "washroom_sis_datsui_bareta0A", "washroom_sis_datsui_bareta0B", "washroom_sis_datsui_bareta0C", "washroom_sis_datsui_bareta1", "washroom_sis_datsui_bareta10", "washroom_sis_datsui_bareta11", "washroom_sis_datsui_bareta12", "washroom_sis_datsui_bareta13", "washroom_sis_datsui_bareta14", "washroom_sis_datsui_bareta15", "washroom_sis_datsui_bareta16", "washroom_sis_datsui_bareta17", "washroom_sis_datsui_bareta18", "washroom_sis_datsui_bareta19", "washroom_sis_datsui_bareta2", "washroom_sis_datsui_bareta20", "washroom_sis_datsui_bareta21", "washroom_sis_datsui_bareta3", "washroom_sis_datsui_bareta4", "washroom_sis_datsui_bareta5", "washroom_sis_datsui_bareta6", "washroom_sis_datsui_bareta7", "washroom_sis_datsui_bareta8", "washroom_sis_datsui_bareta9", "washroom_sis_datsui_bareta_shortpants_10", "washroom_sis_datsui_bareta_shortpants_11", "washroom_sis_datsui_bareta_shortpants_12", "washroom_sis_datsui_bareta_shortpants_13", "washroom_sis_datsui_bareta_shortpants_5", "washroom_sis_datsui_bareta_shortpants_6", "washroom_sis_datsui_bareta_shortpants_7", "washroom_sis_datsui_bareta_shortpants_8", "washroom_sis_datsui_bareta_shortpants_9", "washroom_sis_datsui_bareta_white_panties_12", "washroom_sis_datsui_bareta_white_panties_5", "washroom_sis_datsui_bareta_white_panties_6", "washroom_sis_datsui_bareta_white_panties_7", "washroom_sis_datsui_bareta_white_panties_8", "washroom_sis_datsui_common0", "washroom_sis_datsui_common1", "washroom_sis_datsui_common2", "washroom_sis_datsui_common3", "washroom_sis_datsui_common4", "washroom_sis_datsui_onegai0", "washroom_sis_datsui_onegai1", "washroom_sis_datsui_onegai10", "washroom_sis_datsui_onegai2", "washroom_sis_datsui_onegai3", "washroom_sis_datsui_onegai4", "washroom_sis_datsui_onegai5", "washroom_sis_datsui_onegai6", "washroom_sis_datsui_onegai7", "washroom_sis_datsui_onegai8", "washroom_sis_datsui_onegai9", "washroom_sis_datsui_onegai_alt10", "washroom_sis_datsui_onegai_alt4", "washroom_sis_datsui_onegai_alt5", "washroom_sis_datsui_onegai_alt6", "washroom_sis_datsui_onegai_alt7", "washroom_sis_datsui_onegai_alt8", "washroom_sis_datsui_onegai_alt9", "washroom_sis_datsui_seikou0", "washroom_sis_datsui_seikou1", "washroom_sis_datsui_seikou10", "washroom_sis_datsui_seikou11", "washroom_sis_datsui_seikou12", "washroom_sis_datsui_seikou13", "washroom_sis_datsui_seikou14", "washroom_sis_datsui_seikou15", "washroom_sis_datsui_seikou16", "washroom_sis_datsui_seikou17", "washroom_sis_datsui_seikou18", "washroom_sis_datsui_seikou2", "washroom_sis_datsui_seikou3", "washroom_sis_datsui_seikou4", "washroom_sis_datsui_seikou5", "washroom_sis_datsui_seikou6", "washroom_sis_datsui_seikou7", "washroom_sis_datsui_seikou8", "washroom_sis_datsui_seikou9", "washroom_sis_datsui_seikou_shortpants_13", "washroom_sis_datsui_seikou_shortpants_14", "washroom_sis_datsui_seikou_shortpants_15", "washroom_sis_datsui_seikou_shortpants_16", "washroom_sis_datsui_seikou_shortpants_17", "washroom_sis_datsui_seikou_shortpants_18", "washroom_sis_datsui_seikou_white_panties_13", "washroom_sis_datsui_seikou_white_panties_14", "washroom_sis_datsui_seikou_white_panties_15", "washroom_sis_datsui_seikou_white_panties_16", "washroom_sis_datsui_seikou_white_panties_17", "washroom_sis_datsui_seikou_white_panties_18", "washroom_sis_datsui_ura0", "washroom_sis_datsui_ura1", "washroom_sis_datsui_ura10", "washroom_sis_datsui_ura11", "washroom_sis_datsui_ura12", "washroom_sis_datsui_ura13", "washroom_sis_datsui_ura14", "washroom_sis_datsui_ura15", "washroom_sis_datsui_ura16", "washroom_sis_datsui_ura17", "washroom_sis_datsui_ura18", "washroom_sis_datsui_ura19", "washroom_sis_datsui_ura2", "washroom_sis_datsui_ura20", "washroom_sis_datsui_ura3", "washroom_sis_datsui_ura4", "washroom_sis_datsui_ura5", "washroom_sis_datsui_ura6", "washroom_sis_datsui_ura7", "washroom_sis_datsui_ura8", "washroom_sis_datsui_ura9", "washroom_sis_korobu", "washroom_sis_korobu_end", "washroom_sis_korobu_end_towel0", "washroom_sis_korobu_shadow", "washroom_sis_korobu_shadow2", "washroom_sis_korobu_shampoo", "washroom_sis_korobu_towel0", "washroom_sis_korobu_towel1", "washroom_sis_nozoki_shortpants0", "washroom_sis_nozoki_white_panties0", "washroom_sis_panties", "washroom_sis_pantiesMark_0", "washroom_sis_pantiesMark_1", "washroom_sis_pantiesMark_2", "washroom_sis_pantiesMark_3", "washroom_sis_pantiesMark_4", "washroom_sis_panties_2D", "washroom_sis_pinkPanties_0", "washroom_sis_pinkPanties_1", "washroom_sis_pinkPanties_2U", "washroom_sis_pinkPanties_3", "washroom_sis_pinkPanties_4", "washroom_sis_shadow0", "washroom_sis_shadow1", "washroom_sis_shadow2", "washroom_sis_shadow3", "washroom_sis_shadow4", "washroom_sis_whitepanties_0", "washroom_sis_whitepanties_1", "washroom_sis_whitepanties_2U", "washroom_sis_whitepanties_3", "washroom_sis_whitepanties_4", "washroom_sprinkler", "washroom_S_D", "washroom_S_N_DO_RL_BL", "washroom_S_N_RL", "washroom_S_N_RL_BL"],
        gameitazurafera: ["fera_back0", "fera_back0_wink0", "fera_back0_wink1", "fera_back0_wink2", "fera_back0_wink3", "fera_back1", "fera_back10", "fera_back11", "fera_back12", "fera_back1_wink0", "fera_back1_wink1", "fera_back1_wink2", "fera_back2", "fera_back3", "fera_back4", "fera_back5", "fera_back6", "fera_back7", "fera_back8", "fera_back9", "fera_background", "fera_back_mouth1", "fera_back_mouth10", "fera_back_mouth11", "fera_back_mouth12", "fera_back_mouth13", "fera_back_mouth14", "fera_back_mouth2", "fera_back_mouth3", "fera_back_mouth4", "fera_back_mouth5", "fera_back_mouth6", "fera_back_mouth7", "fera_back_mouth8", "fera_back_mouth9", "fera_ejaculation_mouth", "fera_onichannn_back", "fera_onichannn_back0", "fera_onichannn_back1", "fera_onichannn_back2", "fera_onichannn_back3", "fera_onichannn_back4", "fera_onichannn_back5", "fera_onichannn_back6", "fera_onichannn_penis", "fera_onichannn_penis0", "fera_onichannn_penis1", "fera_onichannn_penis2", "fera_onichann_HandD10", "fera_onichann_HandD11", "fera_onichann_HandD12", "fera_onichann_HandD3", "fera_onichann_HandD4", "fera_onichann_HandD5", "fera_onichann_HandD6", "fera_onichann_HandD7", "fera_onichann_HandD8", "fera_onichann_HandD9", "fera_onichann_HandM0", "fera_onichann_HandM1", "fera_onichann_HandM2", "fera_onichann_HandM3", "fera_onichann_HandM4", "fera_onichann_HandM5", "fera_onichann_HandM6", "fera_seieki_onChest_few", "fera_seieki_onFace_few", "fera_seieki_onPenis_few", "fera_seieki_onPenis_many", "fera_sis_HandA0", "fera_sis_HandA1", "fera_sis_HandA2", "fera_sis_HandA3", "fera_sis_HandA4", "fera_sis_HandA5", "fera_sis_HandA6", "fera_sis_HandB"],
        kitchenEvent: ["kitchen_sis_backA0", "kitchen_sis_backA1", "kitchen_sis_backA2", "kitchen_sis_backA3", "kitchen_sis_backA4", "kitchen_sis_backA5", "kitchen_sis_backA6", "kitchen_sis_backB0", "kitchen_sis_backB1", "kitchen_sis_backB2", "kitchen_sis_backB3", "kitchen_sis_backB4", "kitchen_sis_backB5", "kitchen_sis_backB6", "kitchen_sis_wakuwaku_back", "kitchen_sis_wakuwaku_body", "kitchen_sis_wakuwaku_hand0", "kitchen_sis_wakuwaku_hand1", "kitchen_sis_wakuwaku_hand2", "kitchen_sis_wakuwaku_hand3", "kitchen_sis_wakuwaku_hand4", "kitchen_sis_wakuwaku_hand5", "kitchen_sis_wakuwaku_hand6", "kitchen_sis_wakuwaku_head", "kitchen_sis_wakuwaku_kao0", "kitchen_sis_wakuwaku_kao1", "kitchen_sis_wakuwaku_kao2", "kitchen_sis_wakuwaku_kao3", "kitchen_sis_wakuwaku_kao4", "kitchen_sis_wakuwaku_kao5", "kitchen_sis_wakuwaku_kao6", "kitchen_sis_wakuwaku_kao7", "kitchen_sis_wakuwaku_kao_0", "kitchen_sis_wakuwaku_kao_0A", "kitchen_sis_wakuwaku_kao_1", "kitchen_sis_wakuwaku_kao_1A", "kitchen_sis_wakuwaku_kao_2", "kitchen_sis_wakuwaku_kao_3", "kitchen_sis_wakuwaku_obieru", "kitchen_sis_wakuwaku_shoulder0", "kitchen_sis_wakuwaku_shoulder1", "kitchen_sis_wakuwaku_shoulder2", "kitchen_sis_wakuwaku_shoulder3", "kitchen_sis_wakuwaku_shoulder4", "kitchen_sis_wakuwaku_shoulder5", "kitchen_sis_wakuwaku_shoulder6", "kitchen_sis_wakuwaku_star1", "kitchen_sis_wakuwaku_star2", "nanisoregomi", "umasou", "knife&fork"],
	    toilet: ["toilet_sister_pose1", "toilet_sister_pose1_kao1", "toilet_sister_pose1_kao2", "toilet_sister_pose1_kao3", "toilet_sister_pose1_kao4", "toilet_sister_pose1_kao5", "toilet_sister_pose1_kao6", "toilet_sister_pose1_shadow", "toilet_sister_pose2", "toilet_sister_pose2_kao1", "toilet_sister_pose2_kao2", "toilet_sister_pose2_kao3", "toilet_sister_pose2_kao4", "toilet_sister_pose2_kao5", "toilet_sister_pose2_shadow", "toilet_sister_pose3", "toilet_sister_pose3_emiction", "toilet_sister_pose3_kao1", "toilet_sister_pose3_kao2", "toilet_sister_pose3_kao3", "toilet_sister_pose3_shadow"],
	    washRoomSister: ["washroom_sis_brush", "washroom_sis_brush_cloudy", "washroom_sis_clothes", "washroom_sis_clothes_nopanties", "washroom_sis_datsui_bareta0", "washroom_sis_datsui_bareta0A", "washroom_sis_datsui_bareta0B", "washroom_sis_datsui_bareta0C", "washroom_sis_datsui_bareta1", "washroom_sis_datsui_bareta10", "washroom_sis_datsui_bareta11", "washroom_sis_datsui_bareta12", "washroom_sis_datsui_bareta13", "washroom_sis_datsui_bareta14", "washroom_sis_datsui_bareta15", "washroom_sis_datsui_bareta16", "washroom_sis_datsui_bareta17", "washroom_sis_datsui_bareta18", "washroom_sis_datsui_bareta19", "washroom_sis_datsui_bareta2", "washroom_sis_datsui_bareta20", "washroom_sis_datsui_bareta21", "washroom_sis_datsui_bareta3", "washroom_sis_datsui_bareta4", "washroom_sis_datsui_bareta5", "washroom_sis_datsui_bareta6", "washroom_sis_datsui_bareta7", "washroom_sis_datsui_bareta8", "washroom_sis_datsui_bareta9", "washroom_sis_datsui_bareta_shortpants_10", "washroom_sis_datsui_bareta_shortpants_11", "washroom_sis_datsui_bareta_shortpants_12", "washroom_sis_datsui_bareta_shortpants_13", "washroom_sis_datsui_bareta_shortpants_5", "washroom_sis_datsui_bareta_shortpants_6", "washroom_sis_datsui_bareta_shortpants_7", "washroom_sis_datsui_bareta_shortpants_8", "washroom_sis_datsui_bareta_shortpants_9", "washroom_sis_datsui_bareta_white_panties_12", "washroom_sis_datsui_bareta_white_panties_5", "washroom_sis_datsui_bareta_white_panties_6", "washroom_sis_datsui_bareta_white_panties_7", "washroom_sis_datsui_bareta_white_panties_8", "washroom_sis_datsui_common0", "washroom_sis_datsui_common1", "washroom_sis_datsui_common2", "washroom_sis_datsui_common3", "washroom_sis_datsui_common4", "washroom_sis_datsui_onegai0", "washroom_sis_datsui_onegai1", "washroom_sis_datsui_onegai10", "washroom_sis_datsui_onegai2", "washroom_sis_datsui_onegai3", "washroom_sis_datsui_onegai4", "washroom_sis_datsui_onegai5", "washroom_sis_datsui_onegai6", "washroom_sis_datsui_onegai7", "washroom_sis_datsui_onegai8", "washroom_sis_datsui_onegai9", "washroom_sis_datsui_onegai_alt10", "washroom_sis_datsui_onegai_alt4", "washroom_sis_datsui_onegai_alt5", "washroom_sis_datsui_onegai_alt6", "washroom_sis_datsui_onegai_alt7", "washroom_sis_datsui_onegai_alt8", "washroom_sis_datsui_onegai_alt9", "washroom_sis_datsui_seikou0", "washroom_sis_datsui_seikou1", "washroom_sis_datsui_seikou10", "washroom_sis_datsui_seikou11", "washroom_sis_datsui_seikou12", "washroom_sis_datsui_seikou13", "washroom_sis_datsui_seikou14", "washroom_sis_datsui_seikou15", "washroom_sis_datsui_seikou16", "washroom_sis_datsui_seikou17", "washroom_sis_datsui_seikou18", "washroom_sis_datsui_seikou2", "washroom_sis_datsui_seikou3", "washroom_sis_datsui_seikou4", "washroom_sis_datsui_seikou5", "washroom_sis_datsui_seikou6", "washroom_sis_datsui_seikou7", "washroom_sis_datsui_seikou8", "washroom_sis_datsui_seikou9", "washroom_sis_datsui_seikou_shortpants_13", "washroom_sis_datsui_seikou_shortpants_14", "washroom_sis_datsui_seikou_shortpants_15", "washroom_sis_datsui_seikou_shortpants_16", "washroom_sis_datsui_seikou_shortpants_17", "washroom_sis_datsui_seikou_shortpants_18", "washroom_sis_datsui_seikou_white_panties_13", "washroom_sis_datsui_seikou_white_panties_14", "washroom_sis_datsui_seikou_white_panties_15", "washroom_sis_datsui_seikou_white_panties_16", "washroom_sis_datsui_seikou_white_panties_17", "washroom_sis_datsui_seikou_white_panties_18", "washroom_sis_datsui_ura0", "washroom_sis_datsui_ura1", "washroom_sis_datsui_ura10", "washroom_sis_datsui_ura11", "washroom_sis_datsui_ura12", "washroom_sis_datsui_ura13", "washroom_sis_datsui_ura14", "washroom_sis_datsui_ura15", "washroom_sis_datsui_ura16", "washroom_sis_datsui_ura17", "washroom_sis_datsui_ura18", "washroom_sis_datsui_ura19", "washroom_sis_datsui_ura2", "washroom_sis_datsui_ura20", "washroom_sis_datsui_ura3", "washroom_sis_datsui_ura4", "washroom_sis_datsui_ura5", "washroom_sis_datsui_ura6", "washroom_sis_datsui_ura7", "washroom_sis_datsui_ura8", "washroom_sis_datsui_ura9", "washroom_sis_korobu", "washroom_sis_korobu_end", "washroom_sis_korobu_shadow", "washroom_sis_korobu_shadow2", "washroom_sis_korobu_shampoo", "washroom_sis_korobu_towel0", "washroom_sis_korobu_towel1", "washroom_sis_nozoki_shortpants0", "washroom_sis_nozoki_white_panties0", "washroom_sis_panties", "washroom_sis_shadow0", "washroom_sis_shadow1", "washroom_sis_shadow2", "washroom_sis_shadow3", "washroom_sis_shadow4"],
        bathRoom: ["bathroom_filled", "bathroom_normal", "bathroom_oniichan_back0", "bathroom_oniichan_back0_add", "bathroom_oniichan_back1", "bathroom_oniichan_hand0", "bathroom_oniichan_hand1", "bathroom_oniichan_hand_hug", "bathroom_oniichan_hand_touch", "bathroom_oniichan_kao1", "bathroom_oniichan_leg1", "bathroom_rubberDuck", "bathroom_rubberDuck0", "bathroom_rubberDuck1", "bathroom_sis_back0", "bathroom_sis_back1", "bathroom_sis_back1_bathtowel2", "bathroom_sis_back2", "bathroom_sis_back2_bathtowel1", "bathroom_sis_back2_bathtowel2", "bathroom_sis_bathtowel1", "bathroom_sis_bathtowel1B", "bathroom_sis_bathtowel2B", "bathroom_sis_bothbathing_back0", "bathroom_sis_bothbathing_kao0", "bathroom_sis_bothbathing_kao1", "bathroom_sis_bothbathing_kao2", "bathroom_sis_bothbathing_kao3", "bathroom_sis_bothbathing_kao4", "bathroom_sis_bothbathing_kao5", "bathroom_sis_bothbathing_kao5_soul", "bathroom_sis_bothbathing_kao6", "bathroom_sis_bothbathing_towel0", "bathroom_sis_bothbathing_towel0_alt", "bathroom_sis_bothbathing_towel1", "bathroom_sis_bothbathing_waterMask", "bathroom_sis_kao0", "bathroom_sis_kao1", "bathroom_sis_kao2"],
        sisterbrushingTeeth: ["brushingTeeth0000", "brushingTeeth0001", "brushingTeeth0002", "brushingTeeth0003", "brushingTeeth0004", "brushingTeeth0005", "brushingTeeth0006", "brushingTeeth0007", "brushingTeeth0008", "brushingTeeth0009", "brushingTeeth0010", "brushingTeeth0011", "brushingTeeth0012", "brushingTeeth0013", "brushingTeeth0014", "brushingTeeth0015", "brushingTeeth0016", "brushingTeeth0017", "brushingTeeth0018", "brushingTeeth0019", "brushingTeeth0020", "brushingTeeth0021", "brushingTeeth0022", "brushingTeeth0023", "brushingTeeth0024", "brushingTeeth0025", "brushingTeeth0026", "brushingTeeth0027", "brushingTeeth0028", "brushingTeeth0029", "brushingTeeth0030", "brushingTeeth0031", "brushingTeeth0032", "brushingTeeth0033", "brushingTeeth0034", "brushingTeeth0035", "brushingTeeth0036", "brushingTeeth0037", "brushingTeeth0038", "brushingTeeth0039", "brushingTeeth0040", "brushingTeeth0041", "brushingTeeth0042", "brushingTeeth0043", "brushingTeeth0044", "brushingTeeth0045", "brushingTeeth0046", "brushingTeeth0047", "brushingTeeth0048", "brushingTeeth0049", "brushingTeeth0050", "brushingTeeth0051", "brushingTeeth0052", "brushingTeeth0053", "brushingTeeth0054", "brushingTeeth0055", "brushingTeeth0056", "brushingTeeth0057", "brushingTeeth0058", "brushingTeeth0059", "brushingTeeth0060", "brushingTeeth0061", "brushingTeeth0062", "brushingTeeth0063", "brushingTeeth0064", "brushingTeeth0065", "brushingTeeth0066", "brushingTeeth0067", "brushingTeeth0068", "brushingTeeth0069", "brushingTeeth0070", "brushingTeeth0071", "brushingTeeth0072", "brushingTeeth0073", "brushingTeeth0074", "brushingTeeth0075", "brushingTeeth0076", "brushingTeeth0077", "brushingTeeth0078", "brushingTeeth0079", "brushingTeeth0080", "brushingTeeth0081", "brushingTeeth0082", "brushingTeeth0083", "brushingTeeth0084", "brushingTeeth0085", "brushingTeeth0086", "brushingTeeth0087", "brushingTeeth0088", "brushingTeeth0089", "brushingTeeth0090", "brushingTeeth0091", "brushingTeeth0092", "brushingTeeth0093", "brushingTeeth0094", "brushingTeeth0095", "brushingTeeth0096", "brushingTeeth0097", "brushingTeeth0098", "brushingTeeth0099", "brushingTeeth0100", "brushingTeeth0101", "brushingTeeth0102", "brushingTeeth0103", "brushingTeeth0104", "brushingTeeth0105", "brushingTeeth0106", "brushingTeeth0107", "brushingTeeth0108", "brushingTeeth0109", "brushingTeeth0110", "brushingTeeth0111", "brushingTeeth0112", "brushingTeeth0113", "brushingTeeth0114", "brushingTeeth0115", "brushingTeeth0116", "brushingTeeth0117", "brushingTeeth0118", "brushingTeeth0119", "brushingTeeth0120", "brushingTeeth0121", "brushingTeeth0122", "brushingTeeth0123", "brushingTeeth0124", "brushingTeeth0125", "brushingTeeth0126", "brushingTeeth0127", "brushingTeeth0128", "brushingTeeth0129", "brushingTeeth0130", "brushingTeeth0131", "brushingTeeth0132", "brushingTeeth0133", "brushingTeeth0134", "brushingTeeth0135", "brushingTeeth0136", "brushingTeeth0137", "brushingTeeth0138", "brushingTeeth0139", "brushingTeeth0140", "brushingTeeth0141", "brushingTeeth0142", "brushingTeeth0143", "brushingTeeth0144", "brushingTeeth0145", "brushingTeeth0146", "brushingTeeth0147", "brushingTeeth0148", "brushingTeeth0149", "brushingTeeth0150", "brushingTeeth0151", "brushingTeeth0152", "brushingTeeth0153", "brushingTeeth0154", "brushingTeeth0155", "brushingTeeth0156", "brushingTeeth0157", "brushingTeeth0158", "brushingTeeth0159", "brushingTeeth0160", "brushingTeeth0161", "brushingTeeth0162", "brushingTeeth0163", "brushingTeeth0164", "brushingTeeth0165", "brushingTeeth0166", "brushingTeeth0167", "brushingTeeth0168", "brushingTeeth0169", "brushingTeeth0170", "brushingTeeth0171", "brushingTeeth0172", "brushingTeeth0173", "brushingTeeth0174", "brushingTeeth0175", "brushingTeeth0176", "brushingTeeth0177", "brushingTeeth0178", "brushingTeeth0179", "brushingTeeth0180", "brushingTeeth0181", "brushingTeeth0182", "brushingTeeth0183", "brushingTeeth0184", "brushingTeeth0185", "brushingTeeth0186", "brushingTeeth0187", "brushingTeeth0188", "brushingTeeth0189", "brushingTeeth0190", "brushingTeeth0191", "brushingTeeth0192", "brushingTeeth0193", "brushingTeeth0194", "brushingTeeth0195", "brushingTeeth0196", "brushingTeeth0197", "brushingTeeth0198", "brushingTeeth0199", "brushingTeeth0200", "brushingTeeth0201", "brushingTeeth0202", "brushingTeeth0203", "brushingTeeth0204", "brushingTeeth0205", "brushingTeeth0206", "brushingTeeth0207", "brushingTeeth0208", "brushingTeeth0209", "brushingTeeth0210", "brushingTeeth0211", "brushingTeeth0212", "brushingTeeth0213", "brushingTeeth0214", "brushingTeeth0215", "brushingTeeth0216", "brushingTeeth0217"],
        washRoomSisterSolo: ["bathroom_sis_solo_bubble1", "bathroom_sis_solo_bubble2", "bathroom_sis_solo_bubble3", "bathroom_sis_solo_bubble4", "bathroom_sis_solo_bubble5", "bathroom_sis_solo_bubble6", "bathroom_sis_solo_bubble7", "bathroom_sis_solo_NoRubberDuck", "bathroom_sis_solo_playWithRubberDuck", "bathroom_sis_solo_playWithRubberDuck0", "bathroom_sis_solo_playWithRubberDuck1", "bathroom_sis_solo_playWithRubberDuck2", "bathroom_sis_solo_playWithRubberDuck3", "bathroom_sis_solo_playWithRubberDuck4", "bathroom_sis_solo_playWithRubberDuck5", "bathroom_sis_solo_playWithRubberDuck6", "bathroom_sis_solo_shake_eyesClosed1", "bathroom_sis_solo_shake_eyesClosed2", "bathroom_sis_solo_shake_eyesClosed3", "bathroom_sis_solo_shake_eyesClosed4", "bathroom_sis_solo_shake_eyesClosed5", "bathroom_sis_solo_shake_eyesClosed6", "bathroom_sis_solo_shake_eyesClosed7", "bathroom_sis_solo_shake_eyesOpened1", "bathroom_sis_solo_shake_eyesOpened2", "bathroom_sis_solo_shake_eyesOpened3", "bathroom_sis_solo_shake_eyesOpened4", "bathroom_sis_solo_shake_eyesOpened5", "bathroom_sis_solo_shake_eyesOpened6", "bathroom_sis_solo_shake_eyesOpened7", "bathroom_sis_solo_smile", "bathroom_sis_solo_smile1", "bathroom_sis_solo_smile2", "bathroom_sis_solo_smile3", "bathroom_sis_solo_stretching0", "bathroom_sis_solo_stretching1", "bathroom_sis_solo_stretching10", "bathroom_sis_solo_stretching2", "bathroom_sis_solo_stretching3", "bathroom_sis_solo_stretching4", "bathroom_sis_solo_stretching5", "bathroom_sis_solo_stretching6", "bathroom_sis_solo_stretching7", "bathroom_sis_solo_stretching8", "bathroom_sis_solo_stretching9"],
        dryingHair: ["sis_room_CGdryingHair_back", "sis_room_CGdryingHair_bathTowel", "sis_room_CGdryingHair_bunnyPlush", "sis_room_CGdryingHair_camisole", "sis_room_CGdryingHair_camisole_slide", "sis_room_CGdryingHair_head0", "sis_room_CGdryingHair_head1", "sis_room_CGdryingHair_oniichan0", "sis_room_CGdryingHair_oniichan1", "sis_room_CGdryingHair_shortpants","sis_room_chibi_dryingHair_back1", "sis_room_chibi_dryingHair_back2", "sis_room_chibi_dryingHair_bathTowel1", "sis_room_chibi_dryingHair_bathTowel2", "sis_room_chibi_dryingHair_camisole1", "sis_room_chibi_dryingHair_camisole2", "sis_room_chibi_dryingHair_kao0", "sis_room_chibi_dryingHair_kao1", "sis_room_chibi_dryingHair_kao2", "sis_room_chibi_dryingHair_shortpants", "sis_room_chibi_dryingHair_vapour"],
        washroomNozoku: ["ShowerheadA0", "ShowerheadA1", "ShowerheadA2", "ShowerheadA3", "ShowerheadA4", "ShowerheadA5", "ShowerheadA6", "ShowerheadA7", "ShowerheadB0", "ShowerheadB1", "ShowerheadB2", "ShowerheadB3", "ShowerheadB4", "ShowerheadB5", "ShowerheadB6", "ShowerheadB7", "imouto_shower_actionA0", "imouto_shower_actionA1", "imouto_shower_actionA10", "imouto_shower_actionA11", "imouto_shower_actionA12", "imouto_shower_actionA13", "imouto_shower_actionA14", "imouto_shower_actionA2", "imouto_shower_actionA3", "imouto_shower_actionA4", "imouto_shower_actionA5", "imouto_shower_actionA6", "imouto_shower_actionA7", "imouto_shower_actionA8", "imouto_shower_actionA9", "imouto_shower_actionB15", "imouto_shower_actionB16", "imouto_shower_actionB17", "imouto_shower_actionB18", "imouto_shower_actionB19", "imouto_shower_actionB20", "imouto_shower_actionB21", "imouto_shower_actionB22", "imouto_shower_actionB23", "imouto_shower_actionB24", "imouto_shower_actionB25", "imouto_shower_actionB26", "imouto_shower_actionB27", "imouto_shower_actionB28", "imouto_shower_actionB29", "imouto_shower_actionB30", "imouto_shower_actionB31", "imouto_shower_actionC32", "imouto_shower_actionC33", "imouto_shower_actionC34", "imouto_shower_actionC35", "imouto_shower_actionC36", "imouto_shower_actionC37", "imouto_shower_actionC38", "imouto_shower_actionC39", "imouto_shower_actionC40", "imouto_shower_actionC41", "imouto_shower_actionC42", "imouto_shower_actionC43", "imouto_shower_actionC44", "imouto_shower_actionC45", "imouto_shower_actionC46", "imouto_shower_actionC47", "imouto_shower_actionD48", "imouto_shower_actionD49", "imouto_shower_actionD50", "imouto_shower_actionD51", "imouto_shower_actionD52", "imouto_shower_actionD53", "imouto_shower_actionD54", "imouto_shower_actionD55", "imouto_shower_actionD56", "imouto_shower_actionD57", "imouto_shower_actionD58", "imouto_shower_actionD59", "imouto_shower_actionD60", "imouto_shower_actionD61", "imouto_shower_actionD62", "imouto_shower_actionE63", "imouto_shower_actionE64", "imouto_shower_actionE65", "imouto_shower_actionE66", "imouto_shower_actionE67", "imouto_shower_actionE68", "imouto_shower_actionE69", "imouto_shower_actionE70", "imouto_shower_actionE71", "imouto_shower_actionE72", "imouto_shower_actionE73", "imouto_shower_actionE74", "imouto_shower_actionE75", "imouto_shower_actionE76", "imouto_shower_actionE77", "imouto_shower_actionE78", "imouto_shower_actionE79", "imouto_shower_actionE80", "imouto_shower_actionE81", "imouto_shower_actionE82", "imouto_shower_actionE83", "imouto_shower_actionE84", "imouto_shower_actionE85", "imouto_shower_actionE86", "imouto_shower_actionE87", "imouto_shower_actionE88", "imouto_shower_actionE89", "imouto_shower_actionE90", "imouto_shower_actionE91", "imouto_shower_actionE92", "imouto_shower_actionE93", "imouto_shower_actionE94", "imouto_shower_actionE95", "imouto_shower_actionF100", "imouto_shower_actionF101", "imouto_shower_actionF102", "imouto_shower_actionF103", "imouto_shower_actionF104", "imouto_shower_actionF105", "imouto_shower_actionF106", "imouto_shower_actionF107", "imouto_shower_actionF108", "imouto_shower_actionF109", "imouto_shower_actionF110", "imouto_shower_actionF111", "imouto_shower_actionF112", "imouto_shower_actionF113", "imouto_shower_actionF114", "imouto_shower_actionF115", "imouto_shower_actionF116", "imouto_shower_actionF117", "imouto_shower_actionF96", "imouto_shower_actionF97", "imouto_shower_actionF98", "imouto_shower_actionF99", "imouto_shower_actionG118", "imouto_shower_actionG119", "imouto_shower_actionG120", "imouto_shower_actionG121", "imouto_shower_actionG122", "imouto_shower_actionG123", "imouto_shower_actionG124", "imouto_shower_actionG125", "imouto_shower_actionH100", "imouto_shower_actionH101", "imouto_shower_actionH102", "imouto_shower_actionH103", "imouto_shower_actionH104", "imouto_shower_actionH105", "imouto_shower_actionH106", "imouto_shower_actionH107", "imouto_shower_actionH108", "imouto_shower_actionH109", "imouto_shower_actionH110", "imouto_shower_actionH91", "imouto_shower_actionH92", "imouto_shower_actionH93", "imouto_shower_actionH94", "imouto_shower_actionH95", "imouto_shower_actionH96", "imouto_shower_actionH97", "imouto_shower_actionH98", "imouto_shower_actionH99"],
        washRoomSisterSolo: ["bathroom_sis_solo_bubble1", "bathroom_sis_solo_bubble2", "bathroom_sis_solo_bubble3", "bathroom_sis_solo_bubble4", "bathroom_sis_solo_bubble5", "bathroom_sis_solo_bubble6", "bathroom_sis_solo_bubble7", "bathroom_sis_solo_NoRubberDuck", "bathroom_sis_solo_playWithRubberDuck", "bathroom_sis_solo_playWithRubberDuck0", "bathroom_sis_solo_playWithRubberDuck1", "bathroom_sis_solo_playWithRubberDuck2", "bathroom_sis_solo_playWithRubberDuck3", "bathroom_sis_solo_playWithRubberDuck4", "bathroom_sis_solo_playWithRubberDuck5", "bathroom_sis_solo_playWithRubberDuck6", "bathroom_sis_solo_shake_eyesClosed1", "bathroom_sis_solo_shake_eyesClosed2", "bathroom_sis_solo_shake_eyesClosed3", "bathroom_sis_solo_shake_eyesClosed4", "bathroom_sis_solo_shake_eyesClosed5", "bathroom_sis_solo_shake_eyesClosed6", "bathroom_sis_solo_shake_eyesClosed7", "bathroom_sis_solo_shake_eyesOpened1", "bathroom_sis_solo_shake_eyesOpened2", "bathroom_sis_solo_shake_eyesOpened3", "bathroom_sis_solo_shake_eyesOpened4", "bathroom_sis_solo_shake_eyesOpened5", "bathroom_sis_solo_shake_eyesOpened6", "bathroom_sis_solo_shake_eyesOpened7", "bathroom_sis_solo_smile", "bathroom_sis_solo_smile1", "bathroom_sis_solo_smile2", "bathroom_sis_solo_smile3", "bathroom_sis_solo_stretching0", "bathroom_sis_solo_stretching1", "bathroom_sis_solo_stretching10", "bathroom_sis_solo_stretching2", "bathroom_sis_solo_stretching3", "bathroom_sis_solo_stretching4", "bathroom_sis_solo_stretching5", "bathroom_sis_solo_stretching6", "bathroom_sis_solo_stretching7", "bathroom_sis_solo_stretching8", "bathroom_sis_solo_stretching9"],
        washroomTekoki: ["washroom_tekoki_back", "washroom_tekoki_bluePanties0", "washroom_tekoki_bluePanties1", "washroom_tekoki_bluePanties2", "washroom_tekoki_bluePanties3", "washroom_tekoki_bluePanties4", "washroom_tekoki_bluePanties5", "washroom_tekoki_bluePanties6", "washroom_tekoki_bluePanties7", "washroom_tekoki_bluePanties8", "washroom_tekoki_bluePanties9", "washroom_tekoki_blush", "washroom_tekoki_hand0", "washroom_tekoki_hand1", "washroom_tekoki_hand2", "washroom_tekoki_hand3", "washroom_tekoki_hand4", "washroom_tekoki_hand5", "washroom_tekoki_hand6", "washroom_tekoki_hand7", "washroom_tekoki_hand8", "washroom_tekoki_hand9", "washroom_tekoki_kao0", "washroom_tekoki_kao1", "washroom_tekoki_kao2", "washroom_tekoki_penis0", "washroom_tekoki_penis1", "washroom_tekoki_penis2", "washroom_tekoki_penis3", "washroom_tekoki_penis4", "washroom_tekoki_penis5", "washroom_tekoki_penis6", "washroom_tekoki_penis7", "washroom_tekoki_penis8", "washroom_tekoki_penis9", "washroom_tekoki_pinkPanties0", "washroom_tekoki_pinkPanties1", "washroom_tekoki_pinkPanties2", "washroom_tekoki_pinkPanties3", "washroom_tekoki_pinkPanties4", "washroom_tekoki_pinkPanties5", "washroom_tekoki_pinkPanties6", "washroom_tekoki_pinkPanties7", "washroom_tekoki_pinkPanties8", "washroom_tekoki_pinkPanties9", "washroom_tekoki_visibleBreath0", "washroom_tekoki_visibleBreath1", "washroom_tekoki_visibleBreath2", "washroom_tekoki_visibleBreath3", "washroom_tekoki_visibleBreath4", "washroom_tekoki_visibleBreath5", "washroom_tekoki_visibleBreath6", "washroom_tekoki_visibleBreath7", "washroom_tekoki_whitePanties0", "washroom_tekoki_whitePanties1", "washroom_tekoki_whitePanties2", "washroom_tekoki_whitePanties3", "washroom_tekoki_whitePanties4", "washroom_tekoki_whitePanties5", "washroom_tekoki_whitePanties6", "washroom_tekoki_whitePanties7", "washroom_tekoki_whitePanties8", "washroom_tekoki_whitePanties9"],
        toiletSister: ["toilet_sister_fera_action1", "toilet_sister_fera_action10", "toilet_sister_fera_action2", "toilet_sister_fera_action3", "toilet_sister_fera_action4", "toilet_sister_fera_action5", "toilet_sister_fera_action6", "toilet_sister_fera_action7", "toilet_sister_fera_action8", "toilet_sister_fera_action9", "toilet_sister_fera_hairBack", "toilet_sister_fera_head", "toilet_sister_fera_kao1", "toilet_sister_fera_kao2", "toilet_sister_fera_kao3", "toilet_sister_fera_oniichan", "toilet_sister_fera_shadow1", "toilet_sister_fera_shadow2", "toilet_sister_onanii0_back0", "toilet_sister_onanii0_back1", "toilet_sister_onanii0_back2", "toilet_sister_onanii0_back3", "toilet_sister_onanii0_back4", "toilet_sister_onanii_back1", "toilet_sister_onanii_back10", "toilet_sister_onanii_back11", "toilet_sister_onanii_back12", "toilet_sister_onanii_back13", "toilet_sister_onanii_back14", "toilet_sister_onanii_back15", "toilet_sister_onanii_back16", "toilet_sister_onanii_back17", "toilet_sister_onanii_back2", "toilet_sister_onanii_back3", "toilet_sister_onanii_back4", "toilet_sister_onanii_back5", "toilet_sister_onanii_back6", "toilet_sister_onanii_back7", "toilet_sister_onanii_back8", "toilet_sister_onanii_back9", "toilet_sister_onanii_hairBack", "toilet_sister_onanii_head0", "toilet_sister_onanii_head1", "toilet_sister_onanii_head2", "toilet_sister_onanii_kao0", "toilet_sister_onanii_kao1", "toilet_sister_pose1", "toilet_sister_pose1_kao1", "toilet_sister_pose1_kao2", "toilet_sister_pose1_kao3", "toilet_sister_pose1_kao4", "toilet_sister_pose1_kao5", "toilet_sister_pose1_kao6", "toilet_sister_pose1_shadow", "toilet_sister_pose2", "toilet_sister_pose2_add0", "toilet_sister_pose2_add1", "toilet_sister_pose2_add2", "toilet_sister_pose2_add3", "toilet_sister_pose2_add4", "toilet_sister_pose2_add5", "toilet_sister_pose2_kao1", "toilet_sister_pose2_kao2", "toilet_sister_pose2_kao3", "toilet_sister_pose2_kao4", "toilet_sister_pose2_kao5", "toilet_sister_pose2_shadow", "toilet_sister_pose3", "toilet_sister_pose3_emiction", "toilet_sister_pose3_kao1", "toilet_sister_pose3_kao2", "toilet_sister_pose3_kao3", "toilet_sister_pose3_shadow"],
        ImotoTachie: ["mio_tachie_body", "mio_tachie_boobShake1", "mio_tachie_boobShake2", "mio_tachie_boobShake3", "mio_tachie_boobShake4", "mio_tachie_boobShake5", "mio_tachie_boobShake6", "mio_tachie_nudepose0_hand", "mio_tachie_nurse_cap", "mio_tachie_nurse_uniform0", "mio_tachie_nurse_uniform1", "mio_tachie_nurse_uniform2", "mio_tachie_nurse_uniform3", "mio_tachie_nurse_uniform3_extra", "mio_tachie_T-shirt_draggingA1", "mio_tachie_T-shirt_draggingA2", "mio_tachie_T-shirt_draggingA3", "mio_tachie_T-shirt_draggingA4", "mio_tachie_T-shirt_draggingB1", "mio_tachie_T-shirt_draggingB2", "mio_tachie_T-shirt_draggingB3", "mio_tachie_T-shirt_draggingB4", "mio_tachie_T-shirt_draggingB5", "mio_tachie_T-shirt_dragging_extra"],
		washroomTekokiShasei: [
  "washroom_tekoki_shasei1",
  "washroom_tekoki_shasei10",
  "washroom_tekoki_shasei11",
  "washroom_tekoki_shasei12",
  "washroom_tekoki_shasei13",
  "washroom_tekoki_shasei14",
  "washroom_tekoki_shasei15",
  "washroom_tekoki_shasei16",
  "washroom_tekoki_shasei17",
  "washroom_tekoki_shasei18",
  "washroom_tekoki_shasei19",
  "washroom_tekoki_shasei2",
  "washroom_tekoki_shasei20",
  "washroom_tekoki_shasei21",
  "washroom_tekoki_shasei22",
  "washroom_tekoki_shasei23",
  "washroom_tekoki_shasei24",
  "washroom_tekoki_shasei25",
  "washroom_tekoki_shasei26",
  "washroom_tekoki_shasei27",
  "washroom_tekoki_shasei28",
  "washroom_tekoki_shasei29",
  "washroom_tekoki_shasei3",
  "washroom_tekoki_shasei30",
  "washroom_tekoki_shasei31",
  "washroom_tekoki_shasei32",
  "washroom_tekoki_shasei33",
  "washroom_tekoki_shasei34",
  "washroom_tekoki_shasei35",
  "washroom_tekoki_shasei36",
  "washroom_tekoki_shasei37",
  "washroom_tekoki_shasei38",
  "washroom_tekoki_shasei39",
  "washroom_tekoki_shasei4",
  "washroom_tekoki_shasei40",
  "washroom_tekoki_shasei41",
  "washroom_tekoki_shasei42",
  "washroom_tekoki_shasei43",
  "washroom_tekoki_shasei44",
  "washroom_tekoki_shasei45",
  "washroom_tekoki_shasei46",
  "washroom_tekoki_shasei47",
  "washroom_tekoki_shasei48",
  "washroom_tekoki_shasei49",
  "washroom_tekoki_shasei5",
  "washroom_tekoki_shasei50",
  "washroom_tekoki_shasei51",
  "washroom_tekoki_shasei52",
  "washroom_tekoki_shasei53",
  "washroom_tekoki_shasei54",
  "washroom_tekoki_shasei55",
  "washroom_tekoki_shasei56",
  "washroom_tekoki_shasei57",
  "washroom_tekoki_shasei58",
  "washroom_tekoki_shasei59",
  "washroom_tekoki_shasei6",
  "washroom_tekoki_shasei60",
  "washroom_tekoki_shasei61",
  "washroom_tekoki_shasei62",
  "washroom_tekoki_shasei63",
  "washroom_tekoki_shasei64",
  "washroom_tekoki_shasei65",
  "washroom_tekoki_shasei66",
  "washroom_tekoki_shasei67",
  "washroom_tekoki_shasei7",
  "washroom_tekoki_shasei8",
  "washroom_tekoki_shasei9",
  "washroom_tekoki_shasei_back10",
  "washroom_tekoki_shasei_back11",
  "washroom_tekoki_shasei_back13",
  "washroom_tekoki_shasei_back14",
  "washroom_tekoki_shasei_back6",
  "washroom_tekoki_shasei_back7",
  "washroom_tekoki_shasei_hairSeieki14",
  "washroom_tekoki_shasei_hairSeieki15",
  "washroom_tekoki_shasei_hairSeieki16",
  "washroom_tekoki_shasei_hairSeieki17",
  "washroom_tekoki_shasei_hairSeieki18",
  "washroom_tekoki_shasei_hairSeieki19",
  "washroom_tekoki_shasei_hairSeieki20",
  "washroom_tekoki_shasei_hairSeieki25",
  "washroom_tekoki_shasei_hairSeieki29",
  "washroom_tekoki_shasei_hairSeieki33",
  "washroom_tekoki_shasei_hairSeieki34",
  "washroom_tekoki_shasei_hairSeieki35",
  "washroom_tekoki_shasei_hairSeieki36",
  "washroom_tekoki_shasei_hairSeieki37",
  "washroom_tekoki_shasei_hairSeieki39",
  "washroom_tekoki_shasei_hairSeieki44",
  "washroom_tekoki_shasei_hairSeieki47",
  "washroom_tekoki_shasei_hairSeieki48",
  "washroom_tekoki_shasei_hairSeieki49",
  "washroom_tekoki_shasei_hairSeieki50",
  "washroom_tekoki_shasei_hairSeieki51",
  "washroom_tekoki_shasei_hairSeieki52"
],
        washroomTekokiAction: [
  "washroom_tekoki_action2_1",
  "washroom_tekoki_action2_10",
  "washroom_tekoki_action2_11",
  "washroom_tekoki_action2_12",
  "washroom_tekoki_action2_13",
  "washroom_tekoki_action2_14",
  "washroom_tekoki_action2_15",
  "washroom_tekoki_action2_16",
  "washroom_tekoki_action2_17",
  "washroom_tekoki_action2_18",
  "washroom_tekoki_action2_19",
  "washroom_tekoki_action2_2",
  "washroom_tekoki_action2_20",
  "washroom_tekoki_action2_21",
  "washroom_tekoki_action2_22",
  "washroom_tekoki_action2_23",
  "washroom_tekoki_action2_24",
  "washroom_tekoki_action2_25",
  "washroom_tekoki_action2_26",
  "washroom_tekoki_action2_3",
  "washroom_tekoki_action2_4",
  "washroom_tekoki_action2_5",
  "washroom_tekoki_action2_6",
  "washroom_tekoki_action2_7",
  "washroom_tekoki_action2_8",
  "washroom_tekoki_action2_9",
  "washroom_tekoki_action3_1",
  "washroom_tekoki_action3_10",
  "washroom_tekoki_action3_11",
  "washroom_tekoki_action3_12",
  "washroom_tekoki_action3_13",
  "washroom_tekoki_action3_14",
  "washroom_tekoki_action3_15",
  "washroom_tekoki_action3_16",
  "washroom_tekoki_action3_17",
  "washroom_tekoki_action3_18",
  "washroom_tekoki_action3_19",
  "washroom_tekoki_action3_2",
  "washroom_tekoki_action3_20",
  "washroom_tekoki_action3_21",
  "washroom_tekoki_action3_22",
  "washroom_tekoki_action3_23",
  "washroom_tekoki_action3_24",
  "washroom_tekoki_action3_25",
  "washroom_tekoki_action3_26",
  "washroom_tekoki_action3_27",
  "washroom_tekoki_action3_3",
  "washroom_tekoki_action3_4",
  "washroom_tekoki_action3_5",
  "washroom_tekoki_action3_6",
  "washroom_tekoki_action3_7",
  "washroom_tekoki_action3_8",
  "washroom_tekoki_action3_9",
  "washroom_tekoki_action4_1",
  "washroom_tekoki_action4_2",
  "washroom_tekoki_action4_3",
  "washroom_tekoki_action4_4",
  "washroom_tekoki_action4_5",
  "washroom_tekoki_action4_6",
  "washroom_tekoki_action4_7",
  "washroom_tekoki_action4_8",
  "washroom_tekoki_action4_9",
  "washroom_tekoki_action4_10",
  "washroom_tekoki_action4_11",
  "washroom_tekoki_action4_12",
  "washroom_tekoki_action4_13",
  "washroom_tekoki_action4_14",
  "washroom_tekoki_action4_15",
  "washroom_tekoki_action4_16",
  "washroom_tekoki_action4_17",
  "washroom_tekoki_action4_18",
  "washroom_tekoki_action4_19",
  "washroom_tekoki_action4_20",
  "washroom_tekoki_action4_21",
  "washroom_tekoki_action4_22",
  "washroom_tekoki_action4_23"
],
	};

    const folderPath = Path + "/";
    const selectedImages = images[Id];

    if (selectedImages) {
        selectedImages.forEach(function(imageName) {
            ImageManager.reservePicture(folderPath + imageName);
        });
    }
};

chahuiUtil.getEventsAroundPlayer = function(range) {
    range = range || 2; 
    var playerX = $gamePlayer.x;
    var playerY = $gamePlayer.y;
    var eventIds = [];

    for (var y = playerY - range; y <= playerY + range; y++) {
        for (var x = playerX - range; x <= playerX + range; x++) {
            // 确保坐标在地图范围内
            if (x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height()) {
                var events = $gameMap.eventsXy(x, y);
                if (events.length > 0) {
                    events.forEach(function(event) {
                        if (chahuiUtil.eventContainsComment(event, "canMove")) {
                            $gameNumberArray.value(20).push(event.eventId());
                        }
                    });
                }
            }
        }
    }
    return eventIds;
};

chahuiUtil.getEventsAroundEvent = function(eventID) {
	var event = $gameMap.event(eventID);
    var range = 2; 
    var XX = event.x;
    var YY = event.y;
    var eventIds = [];

    for (var y = YY - range; y <= YY + range; y++) {
        for (var x = XX - range; x <= XX + range; x++) {
            // 确保坐标在地图范围内
            if (x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height()) {
                var events = $gameMap.eventsXy(x, y);
                if (events.length > 0) {
                    events.forEach(function(event) {
						var distance = $gameMap.event(eventID).calcDistance(event.eventId());
                        if (chahuiUtil.eventContainsComment(event, "<Money>") && distance < 32) {
                            event.requestBalloon(2);
                        }
                    });
                }
            }
        }
    }
};

chahuiUtil.eventContainsComment = function(event, comment) {
    var pages = event.event().pages;
    for (var i = 0; i < pages.length; i++) {
        var list = pages[i].list;
        for (var j = 0; j < list.length; j++) {
            var command = list[j];
            if ((command.code === 108 || command.code === 408) && command.parameters[0].includes(comment)) {
                return true;
            }
        }
    }
    return false;
};

chahuiUtil.getVarianceDamage = function(type,variance) {
	switch (type) {
	  case 1:		
	var baseDamage = $gameActors.actor(1).atk; 
	  break;
	  case 2:		
	var baseDamage = $gameActors.actor(1).mat; 
	  break;
	  case 3:		
	var baseDamage = Math.round(0.5 * $gameActors.actor(1).atk + 0.5 * $gameActors.actor(1).mat); 
	  break;
  }	
	variance = variance || 10;
    variance = variance / 100; 
    var minDamage = baseDamage * (1 - variance); 
    var maxDamage = baseDamage * (1 + variance); 
    var randomDamage = Math.random() * (maxDamage - minDamage) + minDamage; 
    return Math.round(randomDamage); 
};

// 魔法抗性减伤
chahuiUtil.magicDefenseDamageReduction = function(mdf) {
    const a = 1.65;
    const K = 167;

    // 幂运算
    const Ra = Math.pow(mdf, a);
    const Ka = Math.pow(K, a);

    // 减伤公式： R^a / (R^a + K^a)
	const reduction = Ra / (Ra + Ka);
    return Math.floor(reduction*100);    
};

chahuiUtil.lerp = function(start, end, amt) {
    return (1 - amt) * start + amt * end;
};

chahuiUtil.getToneByTime = function() {
    // 获取当前时间或帧数
    const time = Graphics.frameCount; // 或者使用其他时间/帧计数的方法

    // 定义色调变化的周期
    const cycleLength = 240;

    // 根据当前时间计算周期的位置
    const cyclePosition = (time % cycleLength) / cycleLength;

    // 定义起始和结束色调
    const startTone = [255, 0, 0, 100]; // 红色
    const endTone = [0, 0, 255, 100]; // 蓝色

    // 计算两个色调之间的过渡比例
    const amt = cyclePosition;
    // 对每个颜色通道进行插值
    const r = chahuiUtil.lerp(startTone[0], endTone[0], amt);
    const g = chahuiUtil.lerp(startTone[1], endTone[1], amt);
    const b = chahuiUtil.lerp(startTone[2], endTone[2], amt);
    const a = chahuiUtil.lerp(startTone[3], endTone[3], amt);; // 如果你也想过渡alpha值

    return [r, g, b, a];
};

chahuiUtil.getCharacterAngle = function(characterId) {
    var angle;
    var character;

    // 确定角色是玩家还是特定事件
    if (characterId === -1) {
        character = $gamePlayer; // 玩家
    } else if (characterId > 0) {
        character = $gameMap.event(characterId); // 指定事件
    } else {
        return $gamePlayer; 
    }

    // 获取角色的朝向
    switch (character.direction()) {
        case 2:  // 下
            angle = 180;
            break;
        case 4:  // 左
            angle = 270;
            break;
        case 6:  // 右
            angle = 90;
            break;
        case 8:  // 上
            angle = 0;
            break;
        case 1:  // 左下
            angle = 225;
            break;
        case 3:  // 右下
            angle = 135;
            break;
        case 7:  // 左上
            angle = 315;
            break;
        case 9:  // 右上
            angle = 45;
            break;
        default: 
            angle = 0;
            break;
    }

    return angle;
};


chahuiUtil.checkWeaponQuality = function(paramName) {
    var weaponId = $gameActors.actor(1).equips()[0].baseItemId; 
	var weapon = $dataWeapons[weaponId]; 
    if (weapon) {
        var notes = weapon.note.split(/[\r\n]+/); 
        var regex = new RegExp("<" + paramName + ":(\\d+)>"); 
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var match = note.match(regex); 
            if (match) {
                return Number(match[1]); 
            }
        }
    }
    return 0; 
};

chahuiUtil.tsubamegaeshi = function() {
let flat = 210;
let angle = QJ.BL.calculateAngleByDirection($gamePlayer.direction())*180/Math.PI;
    angle += flat;
return angle;
};

chahuiUtil.checkSlashBlend = function() {
    var weaponId = $gameActors.actor(1).equips()[0].baseItemId;
    var weapon = $dataWeapons[weaponId];
    if (weapon) {
        var notes = weapon.note.split(/[\r\n]+/);
        var regex = /<SlashBlend:\[([\d,]+)\]>/;
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var match = note.match(regex);
            if (match) {
                var numbers = match[1].split(',').map(Number);
                return numbers;
            }
        }
    }
    return "[0,0,0,0]"; 
};

chahuiUtil.weightedRandom = function(baseWeights) {
    var numbers = [0, 1, 2, 3, 4, 5]; 
    if ($gameParty.leader().isLearnedSkill(50)) {
        baseWeights[0] = Math.max(baseWeights[0] - 10, 0);
        baseWeights[1] = Math.max(baseWeights[1] - 10, 0);
    }
    var totalWeight = baseWeights.reduce((acc, cur) => acc + cur, 0);
    var randomNum = Math.random() * totalWeight;
    var weightSum = 0;

    for (var i = 0; i < numbers.length; i++) {
        weightSum += baseWeights[i];
        if (randomNum < weightSum) {
            return numbers[i];
        }
    }
};

chahuiUtil.extendStateTime = function(stateId, time) {	
	stateId = stateId.toString();
	var extendTime = time.toString();
    if ($gameSystem._timeEvents) {
     let found = false; 
    $gameSystem._timeEvents.forEach(function(event) {
        if (event.command === "remove" && event.target === stateId) {
            event.minutes += time;
            found = true;
        }
    });
    if (!found) {
        var args = ['remove', extendTime, '100', stateId];
        $gameSystem.addTimeEvent(args);
        }
    } else {
    var args = ['remove', extendTime, '100', stateId];
    $gameSystem.addTimeEvent(args);
    }
};

chahuiUtil.adjustWeaponAngle = function(direction) {
    let ax = ($gamePlayer._realX + 0.5 - $gameMap.displayX()) * 48;
    let ay = ($gamePlayer._realY + 0.5 - $gameMap.displayY()) * 48;
    let bx = TouchInput.x / 2 + $gameMap.displayX();
    let by = TouchInput.y / 2 + $gameMap.displayY();
    let deg = QJ.BL.calculateAngleByTwoPoint(ax, ay, bx, by);
    deg = Math.round((deg * 180) / Math.PI);

    let minAngle, maxAngle;
    switch (direction) {
        case 8: // 上
            minAngle = 300;
            maxAngle = 60;
            break;
        case 4: // 左
            minAngle = 210;
            maxAngle = 330;
            break;
        case 6: // 右
            minAngle = 30;
            maxAngle = 150;
            break;
        case 2: // 下
            minAngle = 120;
            maxAngle = 240;
            break;
        default:
            return deg * (Math.PI / 180); // 如果方向无效，返回原始角度
    }

    // 将角度转换为 0-359 度范围内
    deg = (deg + 360) % 360;

    const angleDifference = (a, b) => {
        let diff = Math.abs(a - b);
        return Math.min(diff, 360 - diff);
    };

    // 处理跨越360°的情况
    if (minAngle > maxAngle) {
        if (deg >= minAngle || deg <= maxAngle) {
            return deg * (Math.PI / 180);
        }
    } else {
        if (deg >= minAngle && deg <= maxAngle) {
            return deg * (Math.PI / 180);
        }
    }

    // 计算到 minAngle 和 maxAngle 的最小距离
    let distanceToMin = angleDifference(deg, minAngle);
    let distanceToMax = angleDifference(deg, maxAngle);

    let adjustedAngle = (distanceToMin < distanceToMax) ? minAngle : maxAngle;
    return adjustedAngle * (Math.PI / 180);
};

chahuiUtil.findAttackStartingAngle = function(type) {
	var direction = $gamePlayer.direction();
    let minAngle, maxAngle;
    switch (direction) {
        case 8: // 上
            minAngle = 300;
            maxAngle = 60;
            break;
        case 4: // 左
            minAngle = 210;
            maxAngle = 330;
            break;
        case 6: // 右
            minAngle = 30;
            maxAngle = 150;
            break;
        case 2: // 下
            minAngle = 120;
            maxAngle = 240;
            break;
        default:
            return 0; 
    }
	if (type == 0) {
		return minAngle;
	} else if (type == 1){
	    return maxAngle;
	}
};

chahuiUtil.gachaWeightedCalculate = function(luk) {

    luk = Math.max(0, Math.min(luk, 999));

    let c, u, r, e, l;

    if (luk < 40) {
        let f = luk / 40;
        // 下限值: C=6500,U=2200,R=1000,E=300,L=0
        // 基准值: C=5000,U=2500,R=1500,E=800,L=200
        // 插值计算: (end - start)*f + start
        c = 6500 - 1500 * f;   // 6500→5000
        u = 2200 + 300 * f;    // 2200→2500
        r = 1000 + 500 * f;    // 1000→1500
        e = 300 + 500 * f;     // 300→800
        l = 0 + 200 * f;       // 0→200
    } else {
        let f = (luk - 40) / 959;
        // 基准值: C=5000,U=2500,R=1500,E=800,L=200
        // 上限值: C=2000,U=1200,R=3000,E=1900,L=1900
        c = 5000 - 3000 * f;   // 5000→2000
        u = 2500 - 1300 * f;   // 2500→1200
        r = 1500 + 1500 * f;   // 1500→3000
        e = 800 + 1100 * f;    // 800→1900
        l = 200 + 1700 * f;    // 200→1900
    }

    c = Math.round(c);
    u = Math.round(u);
    r = Math.round(r);
    e = Math.round(e);
    l = Math.round(l);

    return [c, u, r, e, l];
};

chahuiUtil.getImoutoMoodReaction = function() {
	let kimochi = $gameVariables.value(20);
    kimochi = Math.max(0, Math.min(kimochi, 100));
    let c,u,r,e,l;

    if (kimochi <= 50) {
        let f = kimochi / 50.0;
        c = 40 - 20 * f; //40→20
        u = 30 - 10 * f; //30→20
        r = 20;          //20→20
        e = 5  + 15 * f; //5→20
        l = 5  + 15 * f; //5→20
    } else {
        let f = (kimochi - 50) / 50.0;
        c = 20 - 15 * f; //20→5
        u = 20 - 15 * f; //20→5
        r = 20;          //20→20
        e = 20 + 10 * f; //20→30
        l = 20 + 20 * f; //20→40
    }

    c = Math.round(c * 10);
    u = Math.round(u * 10);
    r = Math.round(r * 10);
    e = Math.round(e * 10);
    l = Math.round(l * 10);

    return [c,u,r,e,l];
};

chahuiUtil.gachaWeightedRandom = function(numbers = [1, 2, 3, 4, 5], weights = [50, 25, 15, 8, 2]) {
    
    // 计算总权重
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

    // 生成一个在 0 和 totalWeight 之间的随机数
    const randomNum = Math.random() * totalWeight;

    // 根据权重分布返回一个数字
    let cumulativeWeight = 0;
    for (let i = 0; i < numbers.length; i++) {
        cumulativeWeight += weights[i];
        if (randomNum < cumulativeWeight) {
            return numbers[i];
        }
    }
};

chahuiUtil.gachaNumberRandom = function(inputValue) {
    let value = 0;
    let minRange = 100;
    let maxRange = 500;

    while (inputValue >= minRange) {       
        let randomDecrement = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        if (inputValue >= randomDecrement) {
            inputValue -= randomDecrement;
            value++;
        } else {
            break; 
        }
    }

    return value;
};

chahuiUtil.gachaRandomRocation = function (EID) {
    let event = $gameMap.event(EID);
    let condition = DrillUp.g_COFA_condition_list[10];
    var c_area = $gameMap.drill_COFA_getCustomPointsByIdWithCondition(EID, 7, condition);

    let xPlus, yPlus;

    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        if (p && typeof p.x === 'number' && typeof p.y === 'number') {
            // 确保 p 存在且 p.x 和 p.y 是有效的数值
            xPlus = p.x - event.x;
            yPlus = p.y - event.y;
        } else {
            // 如果 p 无效或 p.x/p.y 无法读取，则使用随机值
            xPlus = Math.randomInt(9) - 4;
            yPlus = Math.randomInt(9) - 4;
        }
    } else {
        // 如果 c_area 没有元素，则使用随机值
        xPlus = Math.randomInt(9) - 4;
        yPlus = Math.randomInt(9) - 4;
    }

    $gameMap.event(EID).jump(xPlus, yPlus);
    $gameMap.event(EID)._opacity = 255;
};

chahuiUtil.terminateSpecifiedEvents = function(events) {
	
var eventIds = events;
eventIds.forEach(function(eventId) {
    var event = $gameMap.event(eventId);
    if (event) {
        // 检查地图解释器是否在处理该事件
        if ($gameMap._interpreter._eventId === eventId) {
            if (typeof $gameMap._interpreter.terminate === 'function') {
                $gameMap._interpreter.terminate();
            }
            $gameMap._interpreter.clear();
        }
        // 检查事件自己的解释器是否在运行
        if (event._interpreter && event._interpreter.isRunning()) {
            if (typeof event._interpreter.terminate === 'function') {
                event._interpreter.terminate();
            }
            event._interpreter.clear();
        }
    }
});

// 关闭消息窗口并重置状态
var messageWindow = SceneManager._scene._messageWindow;
if (messageWindow) {
    messageWindow._textState = null;          // 重置文本状态
    messageWindow.close();                    // 关闭消息窗口
    $gameMessage.clear();                     // 清除游戏消息
    messageWindow.updatePlacement();          // 更新消息窗口位置
    messageWindow.contents.clear();           // 清除消息窗口内容
    // 重置输入等待状态
    messageWindow._showFast = false;
    messageWindow._lineShowFast = false;
    messageWindow.pause = false;
    messageWindow._pauseSkip = false;
    messageWindow._waitCount = 0;
}
   // 隐藏姓名框
    if (messageWindow._drill_DNB_nameWindow) {
        messageWindow._drill_DNB_nameWindow.deactivate();
        messageWindow._drill_DNB_nameWindow.hide();
    }
	
};

chahuiUtil.abortEventById = function(eventId) {
    // 获取调用该指令的当前事件 ID（支持串行或平行事件）
    var callerId = 0;
    if (this && typeof this.eventId === 'function') {
        callerId = this.eventId();
    } else if ($gameMap._interpreter && $gameMap._interpreter._eventId) {
        callerId = $gameMap._interpreter._eventId;
    }
    
    // 内部函数：重置消息窗口状态
    function resetMessageWindow() {
        var messageWindow = SceneManager._scene._messageWindow;
		var cw = SceneManager._scene._messageWindow._choiceWindow;
        if (messageWindow) {
            messageWindow._textState = null;          // 重置文本状态
            messageWindow.close();                    // 关闭消息窗口
            $gameMessage.clear();                     // 清除游戏消息
            messageWindow.updatePlacement();          // 更新消息窗口位置
            messageWindow.contents.clear();           // 清除消息窗口内容

            // 重置输入等待状态
            messageWindow._showFast = false;
            messageWindow._lineShowFast = false;
            messageWindow.pause = false;
            messageWindow._pauseSkip = false;
            messageWindow._waitCount = 0;

            // 隐藏姓名框（如果存在）
            if (messageWindow._drill_DNB_nameWindow) {
                messageWindow._drill_DNB_nameWindow.deactivate();
                messageWindow._drill_DNB_nameWindow.hide();
            }
        }
         // 清空当前选项数据
        if (cw && cw.active) {
         $gameMessage._choices = [];
         // 关闭选项窗口，不触发回调
         cw.deactivate();
         cw.close();
        }		
		
    }

    // 内部函数：终止事件的自定义解释器（新增运行模式）
    function terminateCommonEventQJ(interpreters) {
        if (interpreters && interpreters.length > 0) {
            interpreters.forEach(function(interpreter) {
                if (interpreter && interpreter.isRunning && interpreter.isRunning()) {
                    if (typeof interpreter.terminate === 'function') {
                        interpreter.terminate();
                    }
                }
            });
            // 清空数组
            interpreters.length = 0;
        }
    }

    // 如果传入的是数组，则逐个调用
    if (Array.isArray(eventId)) {
        eventId.forEach(function(id) {
            chahuiUtil.abortEventById(id);
        });
        return;
    }

    // eventId 为 -1 时，中断所有事件，但排除当前调用该指令的事件
    if (eventId === -1) {
        // 首先处理地图上所有标准事件
        $gameMap.events().forEach(function(event) {
            var id;
            if (event.page() && event.page().trigger === 4) { // 并行处理事件
                id = event._eventId;
            } else {
                id = event.eventId();
            }
            // 排除当前事件
            if (id === callerId) return;
            if (event.page() && event.page().trigger === 4) {
                $gameMap.eraseEvent(event.eventId());
            } else {
                if ($gameMap._interpreter && $gameMap._interpreter._eventId === id) {
                    if (typeof $gameMap._interpreter.terminate === 'function') {
                        $gameMap._interpreter.terminate();
                    }
                    $gameMap._interpreter.clear();
                }
            }
            // 同时终止该事件自定义的解释器（新增运行模式）
            if (event._commonEventQJ) {
                terminateCommonEventQJ(event._commonEventQJ);
            }
        });
        // 处理地图层新增的自定义解释器（例如公共事件模式）
        if ($gameMap._commonEventQJ) {
            terminateCommonEventQJ($gameMap._commonEventQJ);
        }
        resetMessageWindow();
        return;
    }

    // 单独处理指定的事件
    var event = $gameMap.event(eventId);
    if (!event) return;
    
    var id;
    if (event.page() && event.page().trigger === 4) { // 并行处理事件
        id = event._eventId;
    } else {
        id = event.eventId();
    }
    // 如果目标事件就是当前调用该指令的事件，则跳过
    if (id === callerId) return;
    
    if (event.page() && event.page().trigger === 4) {
        $gameMap.eraseEvent(event.eventId());
    } else {
        if ($gameMap._interpreter && $gameMap._interpreter._eventId === id) {
            if (typeof $gameMap._interpreter.terminate === 'function') {
                $gameMap._interpreter.terminate();
            }
            $gameMap._interpreter.clear();
        }
    }
    // 同时终止该事件自定义的解释器（新增运行模式）
    if (event._commonEventQJ) {
        terminateCommonEventQJ(event._commonEventQJ);
    }
    resetMessageWindow();
};



// 妹妹立绘组合
chahuiUtil.imoutoOutfitloading = function (posX, posY, bathTowel) {
    // 妹妹胖次检测
    let imouto = $gameActors.actor(2);
    let panties = imouto.equips()[1];
    panties = panties ? panties.baseItemId : 0;

    switch (panties) {
        case 154:
            panties = "mio_tachie_bluepanties";
            break;
        case 155:
            panties = "mio_tachie_pinkpanties";
            break;
        case 156:
            panties = "mio_tachie_whitepanties";
            break;
        case 157:
            panties = "mio_tachie_bandaid";
            break;
        case 158:
            panties = "mio_tachie_whitebowPanties";
            break;
        case 160:
            panties = "mio_tachie_bunnyDoodle";
            break;
        case 161:
            panties = "mio_tachie_whiteTights";
            break;
        default:
            panties = "";
            break;
    }

    if (!posX || !posY) {
        posX = 1000;
        posY = 1600;
    }
    let ahogeX = posX + 300;
    $gameScreen.showPicture(12, panties, 0, posX, posY, 100, 100, 255, 0);

    if (!$gameScreen.picture(16)) {
        $gameScreen.showPicture(16, "", 0, posX, posY, 100, 100, 255, 0); // 表情占位符
    } else {
        let kao = $gameScreen.picture(16).name();
        $gameScreen.showPicture(16, kao, 0, posX, posY, 100, 100, 255, 0); // 重置坐标
    }
//=============================================================================
// 妹妹穿着T恤
//=============================================================================
    if (imouto.isStateAffected(23)) { 
        $gameNumberArray.setValue(41, [10, 11, 12, 13, 14, 16, 17, 19, 20]);
        $gameScreen.showPicture(10, "mio_tachie_hair", 0, posX, posY, 100, 100, 255, 0);

        if (imouto.isStateAffected(36) || $gameSystem.hour() >= 21) {
            // 妹妹犯困	
            $gameScreen.showPicture(11, "imoto_tachie/mio_tachie_body", 0, posX, posY, 100, 100, 255, 0);
			$gameScreen.showPicture(12, "imoto_tachie/mio_tachie_boobShake1", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(13, "mio_tachie_T-shirt_nemui", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(17, "mio_tachie_hand_nemui_extra", 0, posX, posY, 100, 100, 255, 0);
        } else {
            let nail = $gameVariables.value(60);
            nail = [0, 1, 2].includes(nail) ? nail : 0; // 防修改器报错措施
            $gameScreen.showPicture(11, "imoto_tachie/mio_tachie_body", 0, posX, posY, 100, 100, 255, 0);
			$gameScreen.showPicture(12, "mio_tachie_handpose1", 0, posX, posY, 100, 100, 255, 0);			
			$gameScreen.showPicture(13, "imoto_tachie/mio_tachie_boobShake1", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(14, "mio_tachie_T-shirt1", 0, posX, posY, 100, 100, 255, 0);
        }
        $gameScreen.showPicture(19, "mio_tachie_bowknot", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(20, "mio_tachie_ahoge", 0, ahogeX, posY, 100, 100, 255, 0);
    }
//=============================================================================
// 妹妹常态（穿外套）
//=============================================================================
    if (imouto.isStateAffected(24)) { 
        $gameNumberArray.setValue(41, [10, 11, 12, 13, 14, 15, 16, 19, 20]);
        $gameScreen.showPicture(10, "mio_tachie_hair", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(11, "mio_tachie_nudepose0", 0, posX, posY, 100, 100, 255, 0);

        let equip2 = imouto.equips()[2]?.baseItemId || 0;
        let equip3 = imouto.equips()[3]?.baseItemId || 0;

        $gameScreen.showPicture(13, equip3 === 153 ? "mio_tachie_pajamas2" : "", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(14, equip2 === 152 ? "mio_tachie_pajamas1" : "", 0, posX, posY, 100, 100, 255, 0);

        if (imouto.isStateAffected(36) || $gameSystem.hour() >= 21) {
            // 妹妹犯困
            if (equip3 === 0) {
                $gameScreen.showPicture(15, "mio_tachie_coat_nemui", 0, posX, posY, 100, 100, 255, 0);
                $gameScreen.picture(15).drill_PLAZ_setZIndex(16.5);
            } else {
                $gameScreen.showPicture(15, "mio_tachie_coat_nemui_shortpants", 0, posX, posY, 100, 100, 255, 0);
                $gameScreen.picture(15).drill_PLAZ_setZIndex(16.5);
            }
        } else {
            if (equip2 === 0 && equip3 === 0) {
                $gameScreen.showPicture(15, "mio_tachie_coat1", 0, posX, posY, 100, 100, 255, 0);
            } else if (equip2 === 0 && equip3 > 0) {
                $gameScreen.showPicture(15, "mio_tachie_coat1", 0, posX, posY, 100, 100, 255, 0);
            } else if (equip2 > 0 && equip3 === 0) {
                $gameScreen.showPicture(15, "mio_tachie_coat2", 0, posX, posY, 100, 100, 255, 0);
            } else {
                $gameScreen.showPicture(15, "mio_tachie_coat0", 0, posX, posY, 100, 100, 255, 0);
            }
        }
        $gameScreen.showPicture(19, "mio_tachie_bowknot", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(20, "mio_tachie_ahoge", 0, ahogeX, posY, 100, 100, 255, 0);
    }
//=============================================================================
// 妹妹洗澡中（多分歧）
//=============================================================================
    if (imouto.isStateAffected(25)) { 
        // 判断是否和哥哥一起共浴
        if ($gameSelfSwitches.value([4, 10, 'B']) || bathTowel) {
            $gameNumberArray.setValue(41, [10, 13, 16, 20]);
            $gameScreen.showPicture(10, "mio_tachie_ofuro_back", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(13, "mio_tachie_bathtowel0", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(20, "mio_tachie_ahoge", 0, ahogeX, posY, 100, 100, 255, 0);
        } else {
            $gameNumberArray.setValue(41, [10, 11, 12, 13, 14, 16, 20]);
            $gameScreen.showPicture(10, "mio_tachie_hair2", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(11, "mio_tachie_nudepose1_0", 0, posX, posY, 100, 100, 255, 0);

            let equip2 = imouto.equips()[2]?.baseItemId;
            let equip3 = imouto.equips()[3]?.baseItemId;

            $gameScreen.showPicture(13, equip3 === 153 ? "mio_tachie_pajamas2" : "", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(14, equip2 === 152 ? "mio_tachie_pajamas1" : "", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(20, "mio_tachie_ahoge", 0, ahogeX, posY, 100, 100, 255, 0);
        }
    }
//=============================================================================
// 妹妹洗澡后（无外套）
//=============================================================================
    if (imouto.isStateAffected(26)) { 
        $gameNumberArray.setValue(41, [10, 11, 12, 13, 14, 16, 17, 19, 20]);
        $gameScreen.showPicture(10, "mio_tachie_hair", 0, posX, posY, 100, 100, 255, 0);
        
        if (imouto.isStateAffected(36) || $gameSystem.hour() >= 21) {
            // 妹妹犯困	
            $gameScreen.showPicture(11, "mio_tachie_hand_nemui", 0, posX, posY, 100, 100, 255, 0);
            $gameScreen.showPicture(17, "mio_tachie_hand_nemui_extra", 0, posX, posY, 100, 100, 255, 0);
        } else {
            let nail = $gameVariables.value(60);
            nail = [0, 1, 2].includes(nail) ? nail : 0;
            $gameScreen.showPicture(11, `mio_tachie_nudepose1_${nail}`, 0, posX, posY, 100, 100, 255, 0);
        }
        
        let equip2 = imouto.equips()[2]?.baseItemId;
        let equip3 = imouto.equips()[3]?.baseItemId;
        $gameScreen.showPicture(13, equip3 === 153 ? "mio_tachie_pajamas2" : "", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(14, equip2 === 152 ? "mio_tachie_pajamas1" : "", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(19, "mio_tachie_bowknot", 0, posX, posY, 100, 100, 255, 0);
        $gameScreen.showPicture(20, "mio_tachie_ahoge", 0, ahogeX, posY, 100, 100, 255, 0);
    }

    // 建立图层图钉
    $gameNumberArray.value(41).forEach(n => {
        if (n !== 16 && n !== 20) {
            if ($gameScreen.picture(n)) {
                $gameScreen.picture(n).drill_PTh_bindPic(16);
            }
        }
    });
};


//游戏时间流逝和自动进位
chahuiUtil.systemTimeProgression = function (time) {

if (!time) time = 0;

if (time > 0) {	
let text = "\\fn[RiiTegakiFude]\\dDCOG[11:1:1:1]+" + time;
$gameTemp.drill_GFTT_createSimple( [1845, 70], text, 1, 6, 60 );	
let randomSeArray = ["パパッ", "パッ", "ペタッ"];
let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
AudioManager.playSe({ name: randomSe, volume: 90, pitch: 100, pan: 0 });
}
	
var currentHour = $gameSystem.hour();
var currentMinute = $gameSystem.minute();
currentMinute += time;

if (currentMinute >= 60) {
    var extraHours = Math.floor(currentMinute / 60);
    currentMinute = currentMinute % 60;
    currentHour += extraHours;
}  if (currentHour >= 24) {
    currentHour = currentHour % 24;  
	$gameSystem.add_day(1);
}
$gameSystem.set_hour(currentHour);
$gameSystem.set_minute(currentMinute);  	

};

//妹妹小人按钮显示初始化
chahuiUtil.imoutoChibiButtonInitialization = function () {
    $gameSystem._drill_DCB_curStyle = 14;

    let style = [];
    style.push("button_touch2","button_talk","button_skinShip");

    if ($gameSystem.hour() <= 20 && $gameSwitches.value(500)) {  //一起玩游戏
        style.push("button_game");
    } else if ($gameSystem.hour() === 20 && $gameSwitches.value(485)) {  //去客厅看电视
        style.push("button_television");
    } else if ($gameSystem.hour() > 20 && !$gameSwitches.value(31)) { //洗澡
        style.push("button_bath");
    }
	
    DrillUp.g_DCB_data[13].btn_src = style;
    DrillUp.g_DCB_data[13].x = 545;
    DrillUp.g_DCB_data[13].y = 445;    
	
};

chahuiUtil.quickInteractionIconInitialize = function() {

   if ($gameMap.getGroupBulletListQJ('optionButton').length == 0) {
    var optionButton = QJ.MPMZ.Shoot({
    groupName:["optionButton","imoutoUtilIcon"],
    img:"imoutoUtil/button_option",
	initialRotation:['S',0],
    position:[['S',1694],['S',502]],
	z:"A",
	blendMode:0,
    imgRotation:['S',0],
	moveType: ['S',0],
    opacity:'0|0~30/1~99999|1',
	collisionBox:['C',24],
	anchor:[0.56,0.55],
    existData:[ 
	  { t: ['S', '!this._activated', false], d: [1, 30, 1.5], a: ["S","SoundManager.playOk();$gameMap.steupCEQJ(48,1,{optionFunction:true})"] },
	  { t: ['S', '$gameMessage.isBusy()||$gameMap.isAnyEventStartingQJ()', true], d: [1, 30, 1.5],c: ['S', 'this.time>30'] },
	],
	moveF:[
	  
	],
    timeline:['S',0,120,[180,5,60]],
   });
   }

   if ($gameMap.getGroupBulletListQJ('saveButton').length == 0) {
    var saveButton = QJ.MPMZ.Shoot({
    groupName:["saveButton","imoutoUtilIcon"],
    img:"imoutoUtil/button_save",
	initialRotation:['S',0],
    position:[['S',148],['S',525]],
	z:"A",
	blendMode:0,
    imgRotation:['S',0],
	moveType: ['S',0],
    opacity:'0|0~30/1~99999|1',
	collisionBox:['C',24],
	anchor:[0.56,0.55],
    existData:[ 
	  { t: ['S', '!this._activated', false], d: [1, 30, 1.5], a: ["S","SoundManager.playOk();$gameMap.steupCEQJ(48,1,{saveFunction:true})"] },
	  { t: ['S', '$gameMessage.isBusy()||$gameMap.isAnyEventStartingQJ()', true], d: [1, 30, 1.5], c: ['S', 'this.time>30'] },
	],
	moveF:[
	  
	],
    timeline:['S',0,120,[180,5,60]],
   });
   }

   if ($gameMap.getGroupBulletListQJ('exitButton').length == 0) {
    var exitButton = QJ.MPMZ.Shoot({
    groupName:["exitButton","imoutoUtilIcon"],
    img:"imoutoUtil/button_exit",
	initialRotation:['S',0],
    position:[['S',315],['S',715]],
	z:"A",
	blendMode:0,
    imgRotation:['S',0],
	moveType: ['S',0],
    opacity:'0|0~30/1~99999|1',
	collisionBox:['C',24],
	anchor:[0.56,0.55],
    existData:[ 
	  { t: ['S', '!this._activated', false], d: [1, 30, 1.5], a: ["S","SoundManager.playOk();$gameMap.steupCEQJ(48,1,{exitFunction:true})"] },
	  { t: ['S', '$gameMessage.isBusy()||$gameMap.isAnyEventStartingQJ()', true], d: [1, 30, 1.5], c: ['S', 'this.time>30'] },
	],
	moveF:[
	  
	],
    timeline:['S',0,120,[180,5,60]],
   });
   }   

   if ($gameMap.getGroupBulletListQJ('sleepButton').length == 0) {
    var sleepButton = QJ.MPMZ.Shoot({
    groupName:["sleepButton","imoutoUtilIcon"],
    img:"imoutoUtil/button_sleep",
	initialRotation:['S',0],
    position:[['S',1528],['S',480]],
	z:"A",
	blendMode:0,
    imgRotation:['S',0],
	moveType: ['S',0],
    opacity:'0|0~30/1~99999|1',
	collisionBox:['C',24],
	anchor:[0.56,0.55],
    existData:[ 
	  { t: ['S', '!this._activated', false], d: [1, 30, 1.5], a: ["S","SoundManager.playOk();$gameMap.event(24).steupCEQJ(1)"] },
	  { t: ['S', '$gameMessage.isBusy()||$gameMap.isAnyEventStartingQJ()', true], d: [1, 30, 1.5], c: ['S', 'this.time>30'] },
	],
	moveF:[
	  
	],
    timeline:['S',0,120,[180,5,60]],
   });
   }   

    // 喝茶选项图标
	if ( $gameMap.getGroupBulletListQJ('teaButton').length == 0 && $gameSwitches.value(493) ) {
    var teaButton = QJ.MPMZ.Shoot({
    groupName:["teaButton","imoutoUtilIcon"],
    img:"imoutoUtil/button_tea",
	initialRotation:['S',0],
    position:[['S',180],['S',610]],
	z:"A",
	blendMode:0,
    imgRotation:['S',0],
	moveType: ['S',0],
    opacity:'0|0~30/1~99999|1',
	collisionBox:['C',24],
	anchor:[0.56,0.55],
    existData:[ 
	  { t: ['S', '!this._activated', false], d: [1, 30, 1.5], a: ["S","SoundManager.playOk();$gameMap.event(44).steupCEQJ(1)"] },
	  { t: ['S', '$gameMessage.isBusy()||$gameMap.isAnyEventStartingQJ()', true], d: [1, 30, 1.5], c: ['S', 'this.time>30'] },
	],
	moveF:[
	  //[30,6,chahuiUtil.imoutoUtilIconClickDetection],
	],
    timeline:['S',0,120,[180,5,60]],
   });
	}

};


//读取妹妹的心之容器状态
chahuiUtil.imoutoHeartContainerInitialization = function() {

    let max = 100 + ($gameVariables.value(15) * 100);
    let dataBind = $gameSystem._drill_GFV_bindTank[7];
    dataBind['slot_list'][0]['level_max'] = max;
    dataBind['commandParamChanged'] = true;

    // 若满足红心转化条件
    //    (好感度17 >= max && 红心<7)，则+1颗红心，清空好感度
    if ($gameVariables.value(17) >= max && $gameVariables.value(15) < 7) {
        $gameVariables.setValue(15, $gameVariables.value(15) + 1);
        $gameVariables.setValue(17, 0);
        AudioManager.playSe({ 
            name: "032myuu_YumeSE_MassagePositive01", 
            volume: 70, 
            pitch: 100, 
            pan: 0 
        });
    }

    // 红心不足时无法发生紫心转化
    if ($gameVariables.value(16) >= 100 && $gameVariables.value(15) < 1) {
        $gameVariables.setValue(16, 99);
    }

    // 若满足紫心转化条件
    if ($gameVariables.value(16) >= 100 && $gameVariables.value(15) >= 1) {
        let curPurple = $gameVariables.value(18) + 1;
        if (curPurple > 7) curPurple = 7;  // 紫心最大7颗
        $gameVariables.setValue(18, curPurple);
        $gameVariables.setValue(16, 0);
        AudioManager.playSe({ 
            name: "039myuu_YumeSE_FukidashiHeart01", 
            volume: 80, 
            pitch: 90, 
            pan: 0 
        });
    }

    // 构造心形UI

    let redHeartCount = $gameVariables.value(15);   
    let purpleHeartCount = $gameVariables.value(18); 

    const maxHearts = 7;
    const displayedRedHearts = Math.min(redHeartCount, maxHearts);
    const displayedPurpleHearts = Math.min(purpleHeartCount, displayedRedHearts);

    const emptyType       = 0;
    const purpleHeartType = 2;
    const redHeartType    = 3;

    // 构造心形表示数组
    let heartDisplay = Array(maxHearts).fill(emptyType);

    // 先填红心
    for (let i = 0; i < displayedRedHearts; i++) {
        heartDisplay[i] = redHeartType;
    }
    // 再转化紫心
    for (let i = 0; i < displayedPurpleHearts; i++) {
        heartDisplay[i] = purpleHeartType;
    }
    const heartDisplayValue = parseInt(heartDisplay.join(''), 10);
    $gameVariables.setValue(34, heartDisplayValue);
};

//检查指定装备装备数量
chahuiUtil.checkEquippedItem = function(baseItemId) {
    var actor = $gameParty.leader(); 
    var equips = actor.equips();    
    var equippedCount = 0;         

    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item && item.baseItemId === baseItemId) {
            equippedCount++; 
        }
    }

    return equippedCount
};

//丢弃指定装备
chahuiUtil.removeAndDiscardEquip = function(equipId) {
    var actor = $gameParty.leader(); 
    var equips = actor.equips();    

    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item && item.etypeId === 2 && item.baseItemId === equipId) {
            // 移除装备
            actor.changeEquipById(i + 1, null);
            // 丢弃装备
            var obj = $dataArmors[item.id]; 
            $gameParty.loseItem(obj, 1);
            break; 
        }
    }
};

// 天气自定义条件变化
chahuiUtil.customWeatherConditionChanges = function () {
	
    // 重置一系列事件开关
	$gameSelfSwitches.setValue([1, 41, 'A'], false);
	$gameSelfSwitches.setValue([1, 41, 'B'], false);
    $gameSelfSwitches.setValue([1, 94, 'D'], false);
	$gameSelfVariables.setValue([4, 16, "times"], 0); // 重置拔呆毛次数
	$gameSwitches.setValue(28, false);    // 自动更新履历标记
    $gameSwitches.setValue(123, false);    // 炎热天气标记
    $gameSwitches.setValue(124, false);    // 妹妹早起标记
    $gameSwitches.setValue(440, false);    // 寿司布丁标记

    // 初始化天气预报数组
    if ($gameNumberArray.value(30).length !== 7) {
		$gameNumberArray.setValue(30,[]);
        for (let i = 0; i < 7; i++) {
            $gameNumberArray.value(30).push(dingk.Loot.calculateRandomItemIndex(2));
        }
    }

    // 当天的天气取第一个元素
    let todayWeather = $gameNumberArray.value(30).shift();

    // 娃娃影响
    if (chahuiUtil.checkEquippedItem(126) > 0) {
		todayWeather = 400;
		chahuiUtil.removeAndDiscardEquip(126);
	}
    if (chahuiUtil.checkEquippedItem(127) > 0) {
		todayWeather = 401;
		chahuiUtil.removeAndDiscardEquip(127);
	}
    if (chahuiUtil.checkEquippedItem(128) > 0) {
		todayWeather = 402;
		chahuiUtil.removeAndDiscardEquip(128);
	}	
	
    // 补充新的一天的天气
    $gameNumberArray.value(30).push(dingk.Loot.calculateRandomItemIndex(2));
    let mappedValue;

    // 从掉落物ID转化成天气ID
    switch (todayWeather) {
        case 400:
            mappedValue = 0;
            break;
        case 401:
            mappedValue = 1;
            break;
        case 402:
            mappedValue = 2;
            break;
        default:
            mappedValue = 0; 
            break;
    }
    $gameVariables.setValue(60, mappedValue);

    // 晴天的变化
    if (mappedValue === 0) {
        // 神秘商店出现
        if (Math.random() > 0.3) {
            $gameSelfSwitches.setValue([1, 94, 'D'], true);
        }

        // 转化出炎热天气
        if ($gameParty.hasItem($dataItems[198]) || $gameSelfSwitches.value([24, 14, 'A'])) {
            if (Math.random() > 0.66) {
                $gameSwitches.setValue(123, true);
            }
        } else {
            if (Math.random() > 0.9) {
                $gameSwitches.setValue(123, true);
            }
        }
    }

    // 雨天的变化
    if (mappedValue === 2) {
        if ($gameVariables.value(60) === 2) {
            let abyss = $gameNumberArray.value(99);
            $gameSystem.deleteSaveDataSpawnEventMapQJ(abyss, true);
            abyss.forEach(function (mapIndex) {
                $gameSelfVariables.setValue([mapIndex, 1, 'rainyCreation'], 2);
            });
        }
    }
};

// 平滑改变BGM音调
chahuiUtil.changeBgmPitch = function(targetRate, duration) {

        if (!AudioManager._currentBgm) return;

        let b = AudioManager._bgmBuffer;

        if (!b || !b._sourceNode || !WebAudio._context) return;

        let now = WebAudio._context.currentTime;

        b._sourceNode.playbackRate.cancelScheduledValues(now);

        let currentRate = b._sourceNode.playbackRate.value;
        b._sourceNode.playbackRate.setValueAtTime(currentRate, now);

        b._sourceNode.playbackRate.linearRampToValueAtTime(targetRate, now + duration);

        b._pitch = targetRate;
		
};

// 多边形碰撞箱预设模板
chahuiUtil.polySets = {
  // 立绘-短裤
  tachieShortpants: [
    { x: 1233, y: 795 },
    { x: 1478, y: 788 },
    { x: 1522, y: 948 },
    { x: 1505, y: 995 },
	{ x: 1211, y: 995 },
	{ x: 1199, y: 934 }	
  ],	
  // 立绘-胖次
  tachiePanties: [
    { x: 1236, y: 806 },
    { x: 1357, y: 840 },
    { x: 1478, y: 800 },
    { x: 1376, y: 908 },
	{ x: 1338, y: 908 }
  ],
  // 立绘-小穴
  tachieOmanko: [
    { x: 1340, y: 890 },
    { x: 1354, y: 875 },
    { x: 1373, y: 897 },
	{ x: 1359, y: 909 }
  ],
  // 立绘-下巴
  tachieChin: [
    { x: 1324, y: 428 },
    { x: 1370, y: 440 },
    { x: 1416, y: 407 },
    { x: 1400, y: 445 },
	{ x: 1352, y: 447 }
  ],  
  // 立绘-锁骨
  tachieClavicle: [
    { x: 1297, y: 478 },
    { x: 1369, y: 488 },
    { x: 1443, y: 480 },
	{ x: 1369, y: 503 },
  ],
  // 立绘-右耳
  tachieRightEar: [
    { x: 1251, y: 387 },
    { x: 1290, y: 372 },
    { x: 1301, y: 400 },
  ], 
  // 立绘-左耳
  tachieLeftEar: [
    { x: 1442, y: 344 },
    { x: 1488, y: 344 },
    { x: 1445, y: 378 },
  ],
  // T恤-衣领
  TshirtCollar: [
    { x: 1295, y: 470 },
    { x: 1310, y: 460 },
    { x: 1385, y: 520 },
    { x: 1508, y: 525 },
    { x: 1508, y: 550 },
    { x: 1378, y: 555 },
    { x: 1320, y: 518 },	
  ],
  // T恤-下摆
  TshirtHem: [
    { x: 1218, y: 845 },
    { x: 1360, y: 875 },
    { x: 1515, y: 886 },
    { x: 1508, y: 942 },
    { x: 1355, y: 940 },
    { x: 1214, y: 900 },	
  ],  
};

// 圆形碰撞箱预设模板
chahuiUtil.circleSets = {
  // 立绘-左乳头
  tachieLeftNipple: {
    cx: 1440,  // 圆心 x
    cy: 600,   // 圆心 y
    r: 20      // 半径
  },	
  // 立绘-右乳头
  tachieRightNipple: {
    cx: 1266,  // 圆心 x
    cy: 591,   // 圆心 y
    r: 20      // 半径
  },	
  // 立绘-右胸
  tachieRightBreast: {
    cx: 1294,  // 圆心 x
    cy: 593,   // 圆心 y
    r: 57      // 半径
  },
  // 立绘-左胸
  tachieLeftBreast: {
    cx: 1425,  // 圆心 x
    cy: 598,   // 圆心 y
    r: 57      // 半径
  }, 
  // 立绘-肚脐
  tachieNavel: {
    cx: 1350,  // 圆心 x
    cy: 760,   // 圆心 y
    r: 30      // 半径
  }, 
  // 立绘-左手
  tachieLeftHand: {
    cx: 1584,  // 圆心 x
    cy: 917,   // 圆心 y
    r: 50      // 半径
  },  
  // 立绘-右手
  tachieRightHand: {
    cx: 1183,  // 圆心 x
    cy: 508,   // 圆心 y
    r: 50      // 半径
  },   
};

// 椭圆形碰撞箱预设模板
chahuiUtil.ellipseSets = {
  // 立绘-摸头
  tachieHead: {
    cx: 1355,     // 椭圆中心 x 坐标
    cy: 240,     // 椭圆中心 y 坐标
    rx: 107,     // x方向半径
    ry: 50       // y方向半径
  }
};
	
// 判断鼠标是否位于指定多边形范围内
chahuiUtil.pointInPolygo = function(presetName) {

    var polygonVertices = chahuiUtil.polySets[presetName];
    if (!polygonVertices) {
        console.error("未找到预设区域名称：" + presetName);
        return false;
    }
	
    var mouseX = _drill_mouse_x;
    var mouseY = _drill_mouse_y;
    
    var inside = false;
    // 使用射线法检测：遍历多边形的每一条边
    for (var i = 0, j = polygonVertices.length - 1; i < polygonVertices.length; j = i++) {
        var xi = polygonVertices[i].x, yi = polygonVertices[i].y;
        var xj = polygonVertices[j].x, yj = polygonVertices[j].y;
        // 如果当前边跨过了水平线 mouseY，计算交点的X坐标
        var intersect = ((yi > mouseY) !== (yj > mouseY)) &&
                        (mouseX < (xj - xi) * (mouseY - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
};	

// 判断鼠标是否位于指定圆形范围内
chahuiUtil.pointInCircle = function(presetName) {
    var circle = chahuiUtil.circleSets[presetName];
    if (!circle) {
        console.error("pointInCircle: 未找到圆形预设名称：" + presetName);
        return false;
    }
    // 取鼠标坐标
    var mx = _drill_mouse_x;
    var my = _drill_mouse_y;

    // 圆心(cx, cy) 及半径 r
    var cx = circle.cx;
    var cy = circle.cy;
    var r  = circle.r;

    // 判断 (mx - cx)^2 + (my - cy)^2 <= (r)^2
    var dx = mx - cx;
    var dy = my - cy;
    return (dx * dx + dy * dy <= r * r);
};

// 判断鼠标是否位于指定椭圆形范围内
chahuiUtil.pointInEllipse = function(presetName) {
    var ellipse = chahuiUtil.ellipseSets[presetName];
    if (!ellipse) {
        console.error("pointInEllipse: 未找到椭圆预设名称：" + presetName);
        return false;
    }

    // 当前鼠标坐标
    var mx = _drill_mouse_x;
    var my = _drill_mouse_y;

    // 椭圆中心 & 半径
    var cx = ellipse.cx;
    var cy = ellipse.cy;
    var rx = ellipse.rx;
    var ry = ellipse.ry;

    // 如果半径无效，直接返回false
    if (rx <= 0 || ry <= 0) {
        return false;
    }

    // 计算 (mx - cx)^2 / rx^2 + (my - cy)^2 / ry^2
    var dx = mx - cx;
    var dy = my - cy;
    var val = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

    return val <= 1; // <=1 表示在椭圆内部
};

// 测试用方法：在当前场景中绘制指定预设区域的填充多边形
chahuiUtil.drawPolygonOverlay = function(presetName, color) {
    // 获取预设多边形顶点集合
    var polygonVertices = chahuiUtil.polySets[presetName];
    if (!polygonVertices) {
        console.error("chahuiUtil.drawPolygonOverlay: 未找到预设区域名称：" + presetName);
        return null;
    }
    
    // 如果未提供颜色，则默认使用半透明红色
    color = color || "rgba(255, 0, 0, 0.5)";
    
    // 创建一个覆盖整个游戏窗口的 Bitmap 与 Sprite
    var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    var sprite = new Sprite(bitmap);
    // 将该 Sprite 设置到较高层级，以便显示在最前
    sprite.z = 10000;
    
    // 获取 Bitmap 的 canvas context 对象进行绘制
    var ctx = bitmap._context;
    if (!ctx) {
        console.error("chahuiUtil.drawPolygonOverlay: 无法获取 Bitmap 上下文");
        return null;
    }
    
    // 开始绘制多边形
    ctx.beginPath();
    // 注意：这里假设预设顶点坐标已经是屏幕坐标
    ctx.moveTo(polygonVertices[0].x, polygonVertices[0].y);
    for (var i = 1; i < polygonVertices.length; i++) {
        ctx.lineTo(polygonVertices[i].x, polygonVertices[i].y);
    }
    ctx.closePath();
    
    // 设置填充色
    ctx.fillStyle = color;
    ctx.fill();
    
    // 通知 Bitmap 更新（使 canvas 的改变生效）
    bitmap._setDirty();
    
    // 将绘制好的 Sprite 添加到当前场景（例如 Scene_Map）中
    if (SceneManager._scene) {
        SceneManager._scene.addChild(sprite);
    } else {
        console.error("chahuiUtil.drawPolygonOverlay: 当前场景不存在，无法添加 Sprite");
    }
    
    // 返回该 Sprite，便于后续可能的移除操作
    return sprite;
};

// 测试用方法：在当前场景中绘制指定预设区域的填充圆形
chahuiUtil.drawCircleOverlay = function(presetName, color) {
    var circle = chahuiUtil.circleSets[presetName];
    if (!circle) {
        console.error("drawCircleOverlay: 未找到圆形预设名称：" + presetName);
        return null;
    }
    // 若不指定颜色，默认半透明红
    color = color || "rgba(255, 0, 0, 0.5)";

    // 创建一个覆盖整个画面的 Bitmap + Sprite
    var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    var sprite = new Sprite(bitmap);
    sprite.z = 9999; // 或 10000, 保证在最前端显示

    // 获取 canvas context
    var ctx = bitmap._context;
    if (!ctx) {
        console.error("drawCircleOverlay: 无法获取 canvas 上下文");
        return null;
    }

    // 读取圆心与半径
    var cx = circle.cx;
    var cy = circle.cy;
    var r  = circle.r;

    // 开始绘制
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // 通知位图更新
    bitmap._setDirty();

    // 将 sprite 添加到当前场景
    if (SceneManager._scene) {
        SceneManager._scene.addChild(sprite);
    } else {
        console.error("drawCircleOverlay: 当前无可用场景");
    }

    // 返回 sprite，以便后续可能移除
    return sprite;
};

// 测试用方法：在当前场景中绘制指定预设区域的填充椭圆形
chahuiUtil.drawEllipseOverlay = function(presetName, color) {
    var ellipse = chahuiUtil.ellipseSets[presetName];
    if (!ellipse) {
        console.error("drawEllipseOverlay: 未找到椭圆预设：" + presetName);
        return null;
    }
    color = color || "rgba(255,0,0,0.5)";

    var cx = ellipse.cx, cy = ellipse.cy;
    var rx = ellipse.rx, ry = ellipse.ry;
    if (rx <= 0 || ry <= 0) {
        console.warn("drawEllipseOverlay: 非法椭圆半径 rx/ry");
        return null;
    }

    // 创建一个覆盖画面的 Bitmap+Sprite
    var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    var sprite = new Sprite(bitmap);
    sprite.z = 9999; // 显示在最前
    var ctx = bitmap._context;
    if (!ctx) {
        console.error("drawEllipseOverlay: 无法获取 canvas context");
        return null;
    }

    // 使用 canvas 的 ellipse 方法
    ctx.beginPath();
    // ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle, anticlockwise)
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // 使bitmap刷新
    bitmap._setDirty();

    // 将sprite添加到当前场景
    if (SceneManager._scene) {
        SceneManager._scene.addChild(sprite);
    } else {
        console.error("drawEllipseOverlay: 当前无可用场景");
    }
    return sprite;
};



chahuiUtil.oldSaveWarningText = {
	
    0:[
       ["\\c[10]检查到来自旧版本的存档数据。\n由于一些底层数据发生变动的影响，\n来自0.70前版本的存档文件必须采取\n重置掉一些数据的兼容性处理"],
	   ["\\c[10]请根据需求备份好存档文件，\n以便之后出现更优策略时可以及时复原。 "]
    ],
    1:[
       ["\\c[10]旧バージョンのセーブデータが検出されました。\n一部の基盤データが変更された影響により、\nバージョン0.70以前のセーブデータには、\n一部データのリセットを伴う互換性処理が必要です。"],
	   ["\\c[10]将来的により適切な解決策が示された際に\n迅速に復元できるよう、\nセーブデータのバックアップを必ず実施してください。"]
    ],	
    2:[
       ["\\c[10]Old version save data detected.\nDue to changes in core data structures, save files \nfrom versions prior to 0.70 require compatibility \nadjustments that will reset certain data."],
	   ["\\c[10]Please back up your save files to ensure \nrestoration if improved solutions become available \nin the future."]
    ]	
};
// 闲聊对话模板
chahuiUtil.chitChatDialogueTemplate = {
			
    0:[
       ["「今天有了新料理的创意了哦！」"],
	   ["「头发、变长了呢。」"],
	   ["「明天的天气会怎么样呢…」"],
	   ["「这个游戏啊……」"],
	   ["「之前有听说过……」"]
    ],
    1:[
       ["「今日、新しい料理のアイデアが浮かんだよ！」"],
	   ["「髪、伸びたね。」"],
	   ["「明日の天気はどうなるかな…」"],
	   ["「このゲーム……」"],
	   ["「前に聞いたんだ……」"]
    ],	
    2:[
       ["\"I came up with a new recipe idea today!\""],
       ["\"Your hair... it's gotten longer.\""],
       ["\"I wonder what the weather will be like tomorrow...\""],
       ["\"This game, huh...\""],
       ["\"I heard about that before...\""]
    ]
 
};

// 讨好妹妹对话模板
chahuiUtil.flatterImoutoDialogueTemplate = {
	
 0: {
		
    0:[
       ["「交给我吧！」"],
	   ["沙拉沙拉——\\w[30]沙拉沙拉——\\w[30]沙拉沙拉—\\w[30]"],
	   ["仔细地为妹妹梳了梳头。"]
    ],
    1:[
       ["「任せてくれ！！」"],
	   ["サラサラ——\\w[30]サラサラ——\\w[30]サラサラ——\\w[30]"],
	   ["妹の髪を丁寧にとかしてやった。"]
    ],	
    2:[
       ['"Leave it to me!"'],
	   ["Swish swish—\\w[30]swish swish—\\w[30]swish swish—\\w[30]"],
	   ["Carefully brushed my sister's hair."]
    ]
 },
 
 1: {
		
    0:[
       ["「比昨天更加可爱了呢！」"],
	   ["非常努力地夸奖了一番妹妹。"]
    ],
    1:[
       ["「昨日よりもっと可愛くなったね！」"],
	   ["一生懸命に妹を褒めちぎった。"]
    ],	
    2:[
       ['"You are even cuter than yesterday!"'],
	   ["I put in a lot of effort to compliment my sister."]
    ]
 },
 
 2: {
		
    0:[
       ["「好乖好乖好乖——！」"],
	   ["来回抚摸了妹妹的头。"]
    ],
    1:[
       ["「よしよしよし——！」"],
	   ["妹の頭を何度もなでた。"]
    ],	
    2:[
       ['"Good girl, good girl, good girl—!"'],
	   ["Gently patted my sister’s head over and over."]
    ]
 },
 
 
};

// 冒险故事对话模板
chahuiUtil.adventureAtoryDialogueTemplate = {
	
 0: {
		
    0:[
       ["「在迷宫深处啊——」"],
	   ["和妹妹聊了关于在深渊中的冒险的话题。"]
    ],
    1:[
       ["「迷宮の中でさ——」"],
	   ["妹にアビスの中での冒険話をしたんだ。"]
    ],	
    2:[
       ['"Deep in the labyrinth—"'],
	   ["Chatted with my little sister about \nmy adventures in the abyss."]
    ]
 },
 
 1: {
		
    0:[
       ["「其实有很多很多道具有着非常神奇的效果哟——」"],
	   ["和妹妹聊了关于魔法道具的话题。"]
    ],
    1:[
       ["「実はいくつかのアイテムがとても不思議なんだよ——」"],
	   ["妹に魔法のアイテムについての話をしたんだ。"]
    ],	
    2:[
       ['"There are actually tons of adventure gear \nwith some pretty crazy effects!"'],
	   ["Chatted with my little sister about magical items."]
    ]
 },
 
 2: {
		
    0:[
       ["「我昨天发现了——」"],
	   ["和妹妹聊了最近自己的冒险见闻的话题。"]
    ],
    1:[
       ["「昨日見つけたんだ——」"],
	   ["妹に最近自分の冒険について話したんだ。"]
    ],	
    2:[
       ['"I found out something yesterday—"'],
	   ["Chatted with my little sister about \nmy recent adventures."]
    ]
 },
 
 3: {
		
    0:[
       ["「所谓冒险者呢、就是会为了庆祝胜利而聚集在酒场里…」"],
	   ["和妹妹聊了关于冒险者们的日常的话题。"]
    ],
    1:[
       ["「冒険者はね、勝利を祝うために酒場で集まるんだよ…」"],
	   ["妹に冒険者たちの日常についての冒険話をしたんだ。"]
    ],	
    2:[
       ['"Adventurers, you see, always end up gathering at \ntaverns to celebrate their victories..."'],
	   ["Chatted with my little sister about \nwhat everyday life is like for adventurers."]
    ]
 }, 
 
 4: {
		
    0:[
       ["「知道吗？其实有会跑步的蘑菇哦！」"],
	   ["和妹妹聊了关于在深渊中遭遇到的奇妙魔物的冒险话题。"]
    ],
    1:[
       ["「知ってる？実は歩くキノコがいるんだよ……！」"],
	   ["アビスで遭遇した奇妙な魔物の冒険の話を妹にしたんだ。"]
    ],	
    2:[
       ['"Did you know? \nThere are actually mushrooms that can run!"'],
	   ["Chatted with my little sister about \nweird monsters I ran into in the abyss."]
    ]
 }, 
 
 
};