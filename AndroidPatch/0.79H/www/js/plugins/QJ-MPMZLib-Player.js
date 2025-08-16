//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][玩家模板]
 * @author 仇九
 *
 * @help 
 * 
 *
 */
//=============================================================================
//
//=============================================================================

QJ.MPMZ.tl.checkPictureExists = function(pathSegments, fileNameWithExtension) {
	
    if (Utils.isNwjs()) {
        const fs = require('fs');
        const path = require('path');
        // 获取游戏本体路径
        const base = path.dirname(process.mainModule.filename);
        // 构造完整路径
        const filePath = path.join(base, ...pathSegments, fileNameWithExtension);
        return fs.existsSync(filePath);
    } else {
        // 移动端环境
        return false;
    }
};

Spriteset_Map.prototype.findTargetSprite = function(target) {
    return this._characterSprites.find(sprite => sprite._character === target);
};

//清除玩家冗余存档数据
QJ.MPMZ.tl.clearPlayerSaveRedundantData = function() {

for (let i = 0; i < DataManager._independentWeapons.length; i++) {
    let weapon = DataManager._independentWeapons[i];
    if (!weapon || typeof weapon !== "object" || !("id" in weapon)) continue;
    let weaponId = weapon.id;
    // 如果对应武器数据的 description 不为空且包含 "不可删除"，则跳过删除
    if ($dataWeapons[weaponId] && $dataWeapons[weaponId].description &&
        $dataWeapons[weaponId].description.indexOf("不可删除") !== -1) {
        continue;
    }
    if ($gameParty._weapons[weaponId] === undefined || $gameParty._weapons[weaponId] <= 0) {       
        DataManager.removeIndependentItem($dataWeapons[weaponId]);
    }
}

for (let i = 0; i < DataManager._independentArmors.length; i++) {
    let armor = DataManager._independentArmors[i];
    if (!armor || typeof armor !== "object" || !("id" in armor)) continue;
    let armorId = armor.id;
    // 如果对应护甲数据的 description 不为空且包含 "不可删除"，则跳过删除
    if ($dataArmors[armorId] && $dataArmors[armorId].description &&
        $dataArmors[armorId].description.indexOf("不可删除") !== -1) {
        continue;
    }
    if ($gameParty._armors[armorId] === undefined || $gameParty._armors[armorId] <= 0) {       
        DataManager.removeIndependentItem($dataArmors[armorId]);
    }
}
	
};

//玩家异常状态检查
QJ.MPMZ.tl.ex_playerConditionCheck = function() {

    QJ.MPMZ.deleteProjectile('system');
	
	if ( $gameMap.mapId() === 51 ) return;
	
	$gameSwitches.setValue(118, false);
	// 重置死因统计
	$gameStrings.setValue(20,"");

    var posX = "$gamePlayer.screenShootXQJ()";
	var posY = "$gamePlayer.screenShootYQJ() + 18";
	
    var system = QJ.MPMZ.Shoot({
        img:"Shadow1",
		groupName:['system','playerFeet'],
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        imgRotation:['F'],
		blendMode:2,
		z:"E",
		opacity:0.8,
		anchor:[0.5,0.86],
        collisionBox:['R',20,4],
        moveType:['D',true],
        existData:[	
        ],
		moveF:[
			[90,150,QJ.MPMZ.tl.ex_abyssTimeFlow], // 在深渊时间自动流逝
			[20,20,QJ.MPMZ.tl.ex_PlayerHitCheck], // 受击检测和无敌帧重置
			[60,60,QJ.MPMZ.tl.ex_playerStuckCheck], // 玩家卡墙检测
			[60,120,QJ.MPMZ.tl.ex_playerAttributeRefresh], // 玩家属性框刷新
		],
    });
	
	// 解决无武器问题
    if(!$gameParty.leader().equips()[0]) {
		$gameParty.leader().changeEquipById(1, 4);
	}
	
	// 处理玩家身上未清算掉的金钱道具
    const itemIdArray = [4,5,6,7,8,9,10,11,12];
    const allItems = $gameParty.allItems();
    for (const item of allItems) {
        if (!item) continue;
        if (!DataManager.isItem(item)) continue;
        if (!itemIdArray.includes(item.id)) continue;
        const qty = $gameParty.numItems(item);
        for (let i = 0; i < qty; i++) {
            QJ.MPMZ.tl.ex_playerDropsValueChange(item);
        }
    }	
	
	if ($gamePlayer.isStealthMode()) return;
    
	// 生成从者
	QJ.MPMZ.tl.ServantResetAndRegeneration();	
	// 防范行走图标记丢失
	QJ.MPMZ.tl.ex_playerSwitchesSpiritType();
	
	if ( $gameParty.leader().isStateAffected(77) ) {
		if ($gameSystem.hasGameTimeEvent("state77")) {
			$gameScreen._particle.particleSet(0,'fireBirdBlessing','player','sparks_c');
		} else {
			$gameParty.leader().removeState(77);
		}
	}
	
   // 优化策略： 在大地图降低视野外事件的刷新频率
   if ( [5,28,37,47,48].includes($gameMap.mapId()) ) {
	  system.addMoveData("F",[60,10,QJ.MPMZ.tl.ex_refreshFarEventDisabledCounters]);
   }
	
};

// 要事件不在当前画面内（考虑缩放），就标记为屏外
QJ.MPMZ.tl.ex_refreshFarEventDisabledCounters = function () {
  const list = $gameMap.events();
  if (!list || !list.length) return;

  //console.log("所有事件："+count);  
  // 取当前可视范围（以未缩放的地图像素为单位）
  const rs = (window.drowsepost && drowsepost.rendersize) || null;
  const scale = rs?.scale || ($gameScreen.zoomScale ? $gameScreen.zoomScale() : 1) || 1;
  const viewW = rs?.width  || Math.ceil(Graphics.width  / scale);
  const viewH = rs?.height || Math.ceil(Graphics.height / scale);

  const tw = $gameMap.tileWidth(), th = $gameMap.tileHeight();
  const margin = tw + 48; // 边缘缓冲一格，避免抖动频繁进出

  for (let i = 0; i < list.length; i++) {
    const ev = list[i];
    if (!ev || !ev.page()) continue;

    // 事件相对屏幕左上角的像素坐标（已考虑滚动/循环）
    const x = ev.scrolledX() * tw;
    const y = ev.scrolledY() * th;

    const onScreen = (x >= -margin && x <= viewW + margin &&
                      y >= -margin && y <= viewH + margin);
					  
    ev._perfOffscreen = !onScreen;
	if (!onScreen) {
      ev._IsDisabledCounter = (ev._IsDisabledCounter || 0) + 10;
	}
  }
  
};


// 从者重置-生成
QJ.MPMZ.tl.ServantResetAndRegeneration = function() { 
     
  setTimeout(() => {	 
    let actor = $gameActors.actor(1); 
    
    // 自动环绕型从者
    if ($gameNumberArray.value(22).length > 0) {
        let bulletTypes = $gameNumberArray.value(22);
        QJ.MPMZ.tl.ex_orbitingBulletInitialization(bulletTypes);    
    }

    // 招财猫
    if ($gameParty.leader().hasSkill(40)) {
        let XX = $gamePlayer._x;
        let YY = $gamePlayer._y;
		$gameMap.spawnEventQJ(1,118,XX,YY,false);	  			
	}

    // 猪猪存钱罐
    if ($gameParty.leader().hasSkill(32)) {
        let XX = $gamePlayer._x;
        let YY = $gamePlayer._y;
        let piggyBankCount = actor.equips().filter(equip => 
            equip && DataManager.isArmor(equip) && equip.baseItemId === 37
        ).length;

        // 生成多个存钱罐
        QJ.MPMZ.Shoot({
                   img: "null1",
                   groupName: ['skinshipListeners'],
				   extra:piggyBankCount,
                   existData: [
				     {t: ['S', "this.data.extra==0", true]},
					 {t: ['Time', 10]},
                   ],
                   moveJS: [
                       [1, 1, `$gameMap.spawnEventQJ(1, 111, ${XX}, ${YY}, false);this.data.extra-=1`],
                   ]
          });
		
        // 贪欲存钱罐
        if (actor.equips().some(equip => equip && DataManager.isArmor(equip) && equip.baseItemId === 38)) {
            let eid = $gameMap.spawnEventQJ(1, 112, XX, YY, false); 
            let e = $gameMap.event(eid);
            if (!e) return;
                e._needSE = false;
            let condition = DrillUp.g_COFA_condition_list[6];
            let validPositions = $gameMap.drill_COFA_getShapePointsWithCondition(
                Math.floor(XX), Math.floor(YY), "圆形区域", 3, condition
            );

            if (validPositions.length > 0) {
                let pos = validPositions[Math.floor(Math.random() * validPositions.length)];
                e.locate(pos.x, pos.y);
            }
        }
    }

    // 薯条和海鸥
    if ($gameSwitches.value(223)) {
        $gameMap.steupCEQJ(291, 1);
    }

    // 谢里斯的诅咒手
    if ($gameParty.leader().hasSkill(88)) {
        QJ.MPMZ.tl.ex_XerisesCursedHand();	  			
	}
  }, 200);    
};

//玩家攻击模式检测
QJ.MPMZ.tl.ex_playerAttackModeDetection = function() { 

        if(!$gameParty.leader().equips()[0]) return;
		if ($gamePlayer.isStealthMode()) return;

		if ($gameMap.getGroupBulletListQJ('attackMonitoring').length > 0) return;
        let weaponType = $gameParty.leader().equips()[0].wtypeId;
        let swordType = [1,2];
		let bowType = [3];
		let staffType = [5,6,7];
		// 剑攻击监听
        if (swordType.includes(weaponType)) {
          if ($gameMap.getGroupBulletListQJ('playerWeapon').length > 0) return;
		  QJ.MPMZ.tl.ex_playermeleeAttackCheck();
		  return;
		}
		// 弓攻击监听
		if (bowType.includes(weaponType)) {
		  if ($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
          if ($gameMap.getGroupBulletListQJ('playerBow').length > 0) return;
		  QJ.MPMZ.tl.ex_playerBowAttackCheck();
		  return;
		}
        // 法杖攻击监听
        if (staffType.includes(weaponType)) {
          if ($gameMap.getGroupBulletListQJ('playerStaff').length > 0) return;
		  QJ.MPMZ.tl.ex_staffAlwaysVisible();	
		  return;
		}
		
		// 特殊武器
		if ($gameParty.leader().equips()[0].baseItemId === 61) {  //巨蜗吸尘器
			QJ.MPMZ.tl.ex_giantSnailVacuumsListener();
		}
		// 拳头
		if ($gameParty.leader().equips()[0].baseItemId === 4) {  
			QJ.MPMZ.tl.ex_punchAttackListener();
		}		

};

// 捡取物品转化为金钱
QJ.MPMZ.tl.ex_playerDropsValueChange = function(item) {
	
    if (!item) return; 

    const itemType = DataManager.isItem(item)
        ? "item"
        : DataManager.isWeapon(item)
        ? "weapon"
        : DataManager.isArmor(item)
        ? "armor"
        : null;

    if (!itemType) return; 
	
	let yieldRate = 1;
    
	if ($gameParty.leader().hasSkill(43)) {
		yieldRate *= 2;
	}
	
    const price = item.price || 0; 
    const totalValue = Math.floor(price * yieldRate); 

    if ($gameParty.hasItem(item, false)) {
        $gameParty.gainGold(totalValue); 
        $gameParty.loseItem(item, 1); 
    }
};

// 背包大小描述
QJ.MPMZ.tl.ex_playerCheckInventory = function(type) {
	
  //保险
  if ($gameParty.leader()._weaponAmountBonus < 0) {
	  $gameParty.leader()._weaponAmountBonus = 0;
  }
  if ($gameParty.leader()._armorAmountBonus < 0) {
	  $gameParty.leader()._armorAmountBonus = 0;
  }

  const MAP = {
    weapon: {
      pool     : () => $gameParty._weapons,               // 所有武器实例
      capacity : () => $gameParty.leader()._weaponAmountLimit
                   +  $gameParty.leader()._weaponAmountBonus
    },
    gear  : {
      pool     : () => $gameParty._armors,                // 所有防具实例
      capacity : () => $gameParty.leader()._armorAmountLimit
                   +  $gameParty.leader()._armorAmountBonus
    }
  };

  const cfg = MAP[type];
  if (!cfg) return "";
   
  // 统计数量 / 上限
  const currentValue  = Object.values(cfg.pool()).length;
  const maximumValue  = cfg.capacity();
  const rate          = currentValue / maximumValue;
	
  // 颜色与超限提示
  let color = 6, extraDesc = "";
  if (rate >= 0.5) color = 14;
  if (rate >= 0.7) color = 2;
  if (rate >= 1) {
    color = 10;
    let lang = ConfigManager.language;
    extraDesc = "\\fs[18]\\c[10]" + window.systemFeatureText.bagFull;
  }

  return `\\c[${color}]${currentValue}\\c[0]/${maximumValue}  ${extraDesc}`;
};

// 技能描述生成
QJ.MPMZ.tl.ex_playerSetSkillDescription = function(item) {

    if (!window.skillDescription) return "";
	let lines = [];
    let skillId = item.id;
	let skill = window.skillDescription[String(skillId)];
	if (!skill) return "";
	
    let fontSize = "\\fs[18]";
    if (ConfigManager.language >= 2) fontSize = "\\fs[16]";	
	let skillName = skill.name;
	let skillLevel = "";
	// 技能等级显示
	if (skill.subtitle && skill.subtitle.join() === "true") {
		skillLevel = QJ.MPMZ.tl.playerSkillLevelDisplay(skillId);  
	}
	// 技能开关状态
	if (item.animationId > 0) {
	let skillToggle = item.animationId - 1;
	    skillToggle = window.skillDescription["skillToggle"][String(skillToggle)];
	    skillLevel += `  \\fr\\fs[18]<${skillToggle}>`;
	}
	lines.push(`\\c[27]\\fs[28]${skillName} ${skillLevel}\\c[0]\\py[16]`);
	// 导入描述文本
	let descriptionArray = skill.description;
    let template = fontSize + "%TEXT%";
    descriptionArray = descriptionArray.map(t => template.replace("%TEXT%", t));	
	descriptionArray[0] = "\\fr•" + descriptionArray[0];
	lines.push(...descriptionArray);

    // 技能特殊效果
     if (skill["ability"].length >= 1 && skill["ability"][0] !== "") {
       let abilityArray = skill["ability"];
       let template = "\\fr•\\c[108]" + fontSize + "%TEXT%";
       abilityArray = abilityArray.map(t => template.replace("%TEXT%", t));
       lines.push(...abilityArray);
    }
	
	let combinedText = lines.join("\n");
    return combinedText;

};


// 物品、武器、装备描述生成
QJ.MPMZ.tl.ex_playerSetItemDescription = function(item) {
    // 保险措施
    if (!item) return "";

    let lines = [];
    let itemName = "";
    let fontSize = "\\fs[18]";
    if (ConfigManager.language >= 2) fontSize = "\\fs[16]";
    let itemId = item.id;
    // 独立物品适配
    if (item.baseItemId != undefined) itemId = item.baseItemId;
    let description;
    let colorCode = "";
	let showQuantity = false;

    // 判断物品类型，设置描述表和色码
    if (DataManager.isItem(item)) {
        description = window.itemsDescription;
        colorCode = $gameTemp.drill_ITC_getColorCode_Item(itemId);
		showQuantity = true;
    }
    if (DataManager.isWeapon(item)) {
        description = window.weaponsDescription;
        colorCode = $gameTemp.drill_ITC_getColorCode_Weapon(itemId);
    }
    if (DataManager.isArmor(item)) {
        description = window.armorsDescription;
        colorCode = $gameTemp.drill_ITC_getColorCode_Armor(itemId);
    }

    // 未适配多语言则走旧逻辑
    if (!description || !description[String(itemId)]) {
        if (colorCode != "") {
            itemName = "\\fs[28]\x1bcsave\x1bcc[" + colorCode + "]" + item.name + "\x1bcload\\fr";
        } else {
            itemName = "\\fs[28]" + item.name + "\\fr";
        }
        itemName += "\\py[4]";
        lines.push(itemName);
		if (showQuantity) {
        let num = $gameParty.numItems(item);
		let quantityText = window.systemFeatureText["quantityHeld"].join(); 
		    quantityText = quantityText.replace(/\$\{[^}]*\}/g, num);	
        lines.push(quantityText);
		}
        let top = item.infoTextTop || "";
        let bottom = item.infoTextBottom || "";
        if (bottom && top) {
            lines.push(bottom);
            lines.push(top);
        } else if (bottom) {
            lines.push(bottom);
        } else if (top) {
            lines.push(top);
        }
    } else {
        description = description[String(itemId)];
        // 道具名称
        if (colorCode != "") {
            itemName = "\\fs[28]\x1bcsave\x1bcc[" + colorCode + "]" + description["name"] + "\x1bcload\\fr";
        } else {
            itemName = "\\fs[28]" + description["name"] + "\\fr";
        }
		itemName += "\\py[4]";
        lines.push(itemName);
		// 非独立物品显示持有数量
		if (showQuantity) {
        let num = $gameParty.numItems(item);
		let quantityText = window.systemFeatureText["quantityHeld"].join(); 
		    quantityText = quantityText.replace(/\$\{[^}]*\}/g, num);	
        lines.push(quantityText);
		}

        // 道具对白
        if (description["subtitle"].length >= 1 && description["subtitle"][0] !== "") {
            let subtitleArray = description["subtitle"];
            let template = fontSize + "\\c[110]\\fi%TEXT%";
            subtitleArray = subtitleArray.map(t => template.replace("%TEXT%", t));
            subtitleArray[0] = `\\fr${fontSize}•` + subtitleArray[0];			
            lines.push(...subtitleArray);
        }

        // 道具描述文本
        let descriptionArray = description["description"];
        let template = fontSize + "%TEXT%";
        descriptionArray = descriptionArray.map(t => template.replace("%TEXT%", t));
        descriptionArray[0] = `\\fr${fontSize}•` + descriptionArray[0];
        lines.push(...descriptionArray);

        // 道具能力
        if (description["ability"].length >= 1 && description["ability"][0] !== "") {
            let abilityArray = description["ability"];
            let itemIconIndex = item.iconIndex;
            let template = "\\fr" + fontSize + "•\\{\\i[" + itemIconIndex + "]\\}%TEXT%";
            abilityArray = abilityArray.map(t => template.replace("%TEXT%", t));
            lines.push(...abilityArray);
        }
    }

    // 如果是武器或护甲，则额外显示其 params 信息
    if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
        // 例如只显示 [atk, def, mat, mdf, luk] 这几项
        const paramIndices = [2, 3, 4, 5, 7];
        const paramIcons = ["\\i[17]", "\\i[19]", "\\i[18]", "\\i[20]", "\\i[22]"];
        let statsArray = [];

        for (let i = 0; i < paramIndices.length; i++) {
            let idx = paramIndices[i];
            let val = item.params[idx] + item.flatParams[idx];
            if (val > 0) {
                if (item.flatParams[idx] > 0) {
                    statsArray.push("\\c[10]" + paramIcons[i] + val + "\\c[0]");
                } else {
                    statsArray.push(paramIcons[i] + val);
                }
            }
        }

        // 如果收集到属性不为空，拼在最后
        if (statsArray.length > 0) {
            let statsLine = statsArray.join("  ");
            lines.push("•" + statsLine);
        }
    }

    // 3. 最终把行数组合并成字符串，使用换行符连接
    let combinedText = lines.join("\n");
    return combinedText;
};


// 玩家武器换装
QJ.MPMZ.tl.ex_playerWeaponImage = function(fadeOut) {
	
	$gameParty.leader().removeStateCategoryAll('refreshNeeded');
	
    QJ.MPMZ.deleteProjectile('attackMonitoring');
	
	if (fadeOut) {
    QJ.MPMZ.deleteProjectile('playerWeaponImg',{d:[1,10,0]});
	} else {
	QJ.MPMZ.deleteProjectile('playerWeaponImg');	
	}	
    if ($gameParty.leader().equips()[0]) {
        let xx = 1872;
        let yy = 228;
        $gameScreen.showPicture(74, 'equip slot', 1, xx, yy, 100, 100, 255, 0);
        
        let posX = xx / $gameScreen.zoomScale();
        let posY = yy / $gameScreen.zoomScale();
        let index = $gameParty.leader().equips()[0].id;
		// 武器描述
		let text = QJ.MPMZ.tl.ex_playerSetItemDescription($dataWeapons[index]);
            text = text.split("\n");
        index = $dataWeapons[index].iconIndex;

        if ($gameParty.leader().hasSkill(55)) {
    		zz = "MF_UR";
    	} else {
    		zz = "A";
    	}
		
		let iconScale = 0.5
        if ( Utils.isMobileDevice() ) iconScale = 1;
		
        var playerWeaponImg = QJ.MPMZ.Shoot({
            groupName: ['playerWeaponImg','playerEquipment'],
            img: ['I', index],
            position: [['S', posX], ['S', posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: `0|0~10/1~5/${iconScale}~999999999|${iconScale}`,		
            opacity: 1,
			immuneTimeStop:true,
            onScreen: true,
            moveType: ['S', 0],
            existData: [
			  {t:['S','this._broken',true],a:['F',QJ.MPMZ.tl.ex_playerWeaponBroken],d:[0,20]}
			],
			moveF:[
			  [4,30,QJ.MPMZ.tl.ex_playerWeaponDurabilityMonitoring],
			  [4,60,QJ.MPMZ.tl.ex_playerWeaponDescriptionRefresh],
			],
            z: zz
        });

        // 特殊词缀
		/*
        if ($gameParty.leader().equips()[0].namePrefix == '') {
			playerWeaponImg.changeAttribute("hue",100);
		}
        */
		
		if (!$gameSwitches.value(444)) {
			playerWeaponImg.addMoveData("F",[4,30,QJ.MPMZ.tl.ex_playerWeaponDurabilityReminder]);
		} else {
			QJ.MPMZ.deleteProjectile('weaponDurabilityReminder');
			QJ.MPMZ.tl.ex_playerWeaponDurabilityText();  
		}

        let picture = $gameScreen.picture(74);
        let bind = DrillUp.g_MPFP_list[2];

        if (!picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean = new Drill_MPFP_Bean();
            $gameTemp._drill_MPFP_needRestatistics = true;
            picture.drill_COPWM_checkData();
        }

        picture._drill_MPFP_bean.drill_bean_setVisible(true);
        picture._drill_MPFP_bean.drill_bean_setContextList(text);
        picture._drill_MPFP_bean.drill_bean_setSkinStyle(bind['style_mode'], bind['style_lockedId']);
    
    } else {
        let xx = 1872;
        let yy = 228;
        $gameScreen.showPicture(74, 'equip slot_null', 1, xx, yy, 100, 100, 255, 0);
        
        let picture = $gameScreen.picture(74);
        
        if (picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean.drill_bean_setVisible(false);
        }
    }
};

// 玩家武器描述刷新
QJ.MPMZ.tl.ex_playerWeaponDescriptionRefresh = function() {
	
        if (!$gameScreen.picture(74)) return;
		if ($gameScreen.isPointerInnerPicture(74)) return;
		if (!$gameParty.leader().equips()[0]) return;
		// 武器描述
		let text = QJ.MPMZ.tl.ex_playerSetItemDescription($gameParty.leader().equips()[0]);
            text = text.split("\n");		
        let picture = $gameScreen.picture(74);
        let bind = DrillUp.g_MPFP_list[2];

        if (!picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean = new Drill_MPFP_Bean();
            $gameTemp._drill_MPFP_needRestatistics = true;
            picture.drill_COPWM_checkData();
        }

        picture._drill_MPFP_bean.drill_bean_setVisible(true);
        picture._drill_MPFP_bean.drill_bean_setContextList(text);
        picture._drill_MPFP_bean.drill_bean_setSkinStyle(bind['style_mode'], bind['style_lockedId']);
		
};

// 武器耐久度显示器
QJ.MPMZ.tl.ex_playerWeaponDurabilityReminder = function() {

  if ($gameScreen.picture(74)) {
	  if ($gameScreen.isPointerInnerPicture(74)) {
		if ($gameMap.getGroupBulletListQJ('weaponDurabilityReminder').length === 0) {

        if (!$gameParty.leader().equips()[0]) return;
            QJ.MPMZ.tl.ex_playerWeaponDurabilityText();    
		}			
		  
	  }
  }

};

// 武器耐久度显示器文本
QJ.MPMZ.tl.ex_playerWeaponDurabilityText = function() {
	
             let weapon = $gameParty.leader().equips()[0];
			 let bulletText = "";
			 let textSize = 12;
		     let durMax = weapon.durMax;
             let durability = weapon.durability;
			 let durRate = 100 * (durability / durMax);
					 if (durability == 114514) {
      			       bulletText = "∞";
     			       durRate = 100;	
                       textSize = 20;					   
    			     } else {
    			         bulletText = Math.floor(durRate) + "%";   
				 	}		
			 let posX = 1905 / $gameScreen.zoomScale();
			 let posY = 302 / $gameScreen.zoomScale();
			 let Scale = 1 / $gameScreen.zoomScale();
			 let durColour,shadowColour;
	         if (durRate > 40) {
				 durColour = "#ffffff";
				 shadowColour = "#000000";
			 } else if (durRate > 20) {
				 durColour = "#ffcfd7";
				 shadowColour = "#bc8992";
			 } else if (durRate > 5) {	 
				 durColour = "#ff738a";
				 shadowColour = "#b85364";			 
			 } else {
				 durColour = "#b9001f";
				 shadowColour = "#b91e38";				 
			 }
        QJ.MPMZ.Shoot({
            img:['T',{
    text:bulletText,
    arrangementMode:0,
    textColor:durColour,
    fontSize:textSize,
    outlineColor:"#000000",
    outlineWidth:0,
    fontFace:"MPLUS2ExtraBold",
    fontItalic:false,
    fontBold:true,
    width:60,
    height:100,
    textAlign:4,
    lineWidth:0,
    lineColor:"#ffffff",
    lineRate:1.0,
    backgroundColor:null,
    backgroundOpacity:1,
    shadowBlur:8,
    shadowColor:shadowColour,
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
			groupName: ['weaponDurabilityReminder','playerEquipment'],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: '0|0~30/1~999999|1',
            moveType: ['S', 0],
            z:"A",
			scale:Scale,
			onScreen:true,
			anchor:[1,1],
            existData: [
			   //{ t:['S','!$gameScreen.isPointerInnerPicture(74)',true],d:[0,30] }
			],
			moveF:[
			   [30,30,QJ.MPMZ.tl.ex_playerWeaponDurabilityTextChange]
			]
        });	
};

// 武器耐久度显示器文本
QJ.MPMZ.tl.ex_playerWeaponDurabilityTextChange = function() {

    const doDurabilityText = (weapon) => {
        if (!weapon) return;
		let bulletText = "";
		let textSize = 12;
        let durMax = weapon.durMax;
        let durability = weapon.durability;
        let durRate = 100 * (durability / durMax);
		if (durability == 114514) {
            bulletText = "∞";
            durRate = 100;		
			textSize = 20;
        } else {
            bulletText = Math.floor(durRate) + "%";   
		}			
        // 根据 durRate 判断颜色
        let durColour, shadowColour;
        if (durRate > 40) {
            durColour = "#ffffff";
            shadowColour = "#000000";
        } else if (durRate > 20) {
            durColour = "#ffcfd7";
            shadowColour = "#bc8992";
        } else if (durRate > 5) {
            durColour = "#ff738a";
            shadowColour = "#b85364";
        } else {
            durColour = "#b9001f";
            shadowColour = "#b91e38";
        }

        // 构造贴图信息
        let durImg = {
            text: bulletText,
            arrangementMode: 0,
            textColor: durColour,
            fontSize: textSize,
            outlineColor: "#000000",
            outlineWidth: 0,
            fontFace: "MPLUS2ExtraBold",
            fontItalic: false,
            fontBold: true,
			immuneTimeStop:true,
            width: 60,
            height: 100,
            textAlign: 4,
            lineWidth: 0,
            lineColor: "#ffffff",
            lineRate: 1.0,
            backgroundColor: null,
            backgroundOpacity: 1,
            shadowBlur: 8,
            shadowColor: shadowColour,
            shadowOffsetX: 0,
            shadowOffsetY: 0
        };
        this.changeAttribute("img", ["T", durImg]);
    };

    if ($gameSwitches.value(444)) {
        // 分支一：耐久度常驻显示
        let weapon = $gameParty.leader().equips()[0];
        if (!weapon) {
            this.setDead({ t: ["Time", 0], d: [0, 30] });
            return;
        }
        doDurabilityText(weapon);

    } else {
        // 分支二：耐久度不常驻显示
        if ($gameScreen.isPointerInnerPicture(74)) {
            let weapon = $gameParty.leader().equips()[0];
            if (!weapon) return; 
            doDurabilityText(weapon);
        } else {
            this.setDead({ t: ["Time", 0], d: [0, 30] });
        }
    }
};


// 耐久度归零玩家武器被破坏
QJ.MPMZ.tl.ex_playerWeaponBroken = function() {
    // 播放随机 SE 音效
    let randomSeArray = ["剣で打ち合う3"];
    let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];
    let randomPitch = 85 + Math.randomInt(40);
    AudioManager.playSe({
        name: randomSe,
        volume: 100,
        pitch: randomPitch,
        pan: 0
    });

    // 取消攻击能力
    QJ.MPMZ.deleteProjectile('attackMonitoring');

    let obj = $gameParty.leader().equips()[0];

    let posX, posY;
    // 标记武器破损的演出位置
    if ($gameMap.getGroupBulletListQJ('weaponMarker').length > 0) {
        let bulletId = $gameMap.getGroupBulletListQJ('weaponMarker')[0];
        posX = $gameMap._mapBulletsQJ[bulletId].inheritX();
        posY = $gameMap._mapBulletsQJ[bulletId].inheritY();
    } else {
        posX = $gamePlayer.screenBoxXShowQJ();
        posY = $gamePlayer.screenBoxYShowQJ();
    }

    // 武器破损闪光演出
    $gameScreen.showPicture(66, "", 0, posX, posY, 100, 100, 0, 0);
    var data = $gameScreen._particle.particleSet(0, 'aura_bp', 'picture:66');
    $gameScreen._particle.particleUpdate(['aura_bp', 'pos', '0', '-12']);
    // $gameScreen._particle.particleUpdate(['aura_bp', 'color', '#ff4665']);
    data.clear = true;

    // 预先检查图像是否存在/检查文件
	let chips = "weaponChip" + obj.baseItemId + "[6].rpgmvp";	
    if ( QJ.MPMZ.tl.checkPictureExists(['img', 'projectiles', 'weapon'], chips) ) {
		chips = "weapon/weaponChip" + obj.baseItemId + "[6]";
	} else {
		chips = "weapon/weaponChips[6]";
	}
	// 移动端没法检测文件
	if (Utils.isMobileDevice()) chips = "weapon/weaponChip" + obj.baseItemId + "[6]";
	
	// 武器碎片破损粒子演出
    QJ.MPMZ.Shoot({
        img: "null",
        initialRotation: 90,
        existData: [
            { t: ['Time', 6] }
        ],
        moveType: ['S', 0],
        position: [
            ['S', posX],
            ['S', posY]
        ],
        particles: [
            {
                img: chips,
                intervalTime: 1,
                bundleNumber: 5,
                synScale: true,
                offsetMin: [-36, -24, -10],
                offsetMax: [0, 24, 10],
                existTime: 80,
                disappearTime: 20,
                disappearScale: 0.5,
                scaleXMin: 1,
                scaleXMax: 1,
                moveType: [
                    '(()=>{let a = this.remA = this.remA ? this.remA : (Math.random()*3-1.5);return a*t;})()',
                    '(()=>{let a = t<30?t:(30+(t-30)/2);return 8/60*a*(60-a);})()'
                ]
            }
        ]
    });

    // 清理耐久度文本
    QJ.MPMZ.deleteProjectile('weaponDurabilityReminder');
    $gameParty.leader().durabilityBreakItem(obj);

    // 移除特定状态并更新武器图像
    $gameParty.leader().removeState(62);
    QJ.MPMZ.tl.ex_playerWeaponImage(true);

    // 武器破坏后效果：播放特殊粒子效果并执行后续处理 JS
    QJ.MPMZ.Shoot({
        img: "null1",
        groupName: ['weaponBroken'],
        position: [
            ['P'],
            ['P']
        ],
        existData: [
            { t: ['Time', 60] }
        ],
        deadJS: ["Zzy.TWF.ToTheWorld(true);$gameMap.steupCEQJ(101,1)"]
    });
};


// 武器破坏后效果
QJ.MPMZ.tl.ex_playerweaponBrokenEffect = function() {
	Zzy.TWF.ToTheWorld(true);
	$gameTemp.reserveCommonEvent(101);
};

// 玩家武器耐久度监听
QJ.MPMZ.tl.ex_playerWeaponDurabilityMonitoring = function() {

  if (this._lastAboutToBreak === undefined) this._lastAboutToBreak = false;
  if (this._lastPower === undefined) this._lastPower = 0;

  let weapon = $gameParty.leader().equips()[0];
  if (!weapon) {
    QJ.MPMZ.deleteProjectile('playerWeaponImg');
    this._broken = false;
    this._aboutToBreak = false;
    return;
  }

  let durMax = weapon.durMax;
  let durability = weapon.durability;
  if (durMax <= 0 || durability < 0) {
    this._broken = true;
    return;
  }
  
  if (Utils.isMobileDevice()) return;
  
  let durRate = durability / durMax; // 比例
  this._broken = (durability <= 0);

  let aboutToBreak = false;
  let power = 0;    

  if (durRate < 0.05) {
    aboutToBreak = true;
    power = 250;  // 第三阶段
	// 武器低耐久度，即将损坏	
	  if (!this._brokenWarning) {
		this._brokenWarning = true;
		let lang = ConfigManager.language;
		if (lang > 2) lang = 2;
		let imgName = 'durabilityLow' + lang;
        QJ.MPMZ.Shoot({
            groupName: ['durabilityLow'],
            img: imgName,
            position: [['S', 480], ['S', 270]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: 0.5,
            opacity: '0|0~30/1~9999/1',
            onScreen: true,
            moveType: ['S', 0],
            existData: [
			  { t:['Time',120],d:[1,30,1.25]}
			],
            z: "A"
        });	
	  }
  } else if (durRate < 0.20) {
    aboutToBreak = true;
    power = 100;  // 第二阶段
  } else if (durRate < 0.40) {
    aboutToBreak = true;
    power = 40;   // 第一阶段
  }

  // 仅当 aboutToBreak 或 power 发生变化时，才调用一次 changeAttribute
  let changedAboutToBreak = (aboutToBreak !== this._lastAboutToBreak);
  let changedPower = (power !== this._lastPower);

  if (changedAboutToBreak || changedPower) {
    if (aboutToBreak) {
      let change = '0|0~45/' + power + '~45/0';
      this.changeAttribute('tone', [change, 0, 0, 0]);
    } else {
      this.changeAttribute('tone', [0, 0, 0, 0]);
    }
  }

  this._aboutToBreak = aboutToBreak;
  this._lastAboutToBreak = aboutToBreak;
  this._lastPower = power;
};



// 玩家装备换装
QJ.MPMZ.tl.ex_playerArmorImage = function(id,fadeOut) {
	
	$gameParty.leader().removeStateCategoryAll('refreshNeeded');
	
	let needRefresh = false;
	let imgIndex = 74 + id;
	let bullet = 'playerArmorImg' + id;
	let xx = 1872;
	let yy = 228;
	yy += id * 80;
	if (fadeOut) {
    QJ.MPMZ.deleteProjectile(bullet,{d:[1,10,0]});
	} else {
	QJ.MPMZ.deleteProjectile(bullet);	
	}
	QJ.MPMZ.deleteProjectile("equipmentEffect");
    
    if ($gameParty.leader().equips()[id]) {
		
        $gameScreen.showPicture(imgIndex, 'equip slot', 1, xx, yy, 100, 100, 255, 0);
        
        let posX = xx / $gameScreen.zoomScale();
        let posY = yy / $gameScreen.zoomScale();
        let index = $gameParty.leader().equips()[id].baseItemId;
		let text = QJ.MPMZ.tl.ex_playerSetItemDescription($dataArmors[index]);
            text = text.split("\n");
        let icon = $gameParty.leader().equips()[id].iconIndex;

		let iconScale = 0.5
        if ( Utils.isMobileDevice() ) iconScale = 1;

    var Gear = QJ.MPMZ.Shoot({
            groupName: [bullet,'playerEquipment'],
            img: ['I', icon],
            position: [['S', posX], ['S', posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: `0|0~10/1~5/${iconScale}~999999999|${iconScale}`,	
            opacity: 1,
            onScreen: true,
			immuneTimeStop:true,
            moveType: ['S', 0],
            existData: [],
            z: "A"
        });

        if ($dataArmors[index].note && /<needRefresh>/i.test($dataArmors[index].note)) needRefresh = true;
		
		if (needRefresh) {
		    Gear.addMoveData("F",[60,60,QJ.MPMZ.tl.ex_playerGearDescriptionRefresh,[id]]);
		}

        let picture = $gameScreen.picture(imgIndex);
        let bind = DrillUp.g_MPFP_list[2];

        if (!picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean = new Drill_MPFP_Bean();
            $gameTemp._drill_MPFP_needRestatistics = true;
            picture.drill_COPWM_checkData();
        }

        picture._drill_MPFP_bean.drill_bean_setVisible(true);
        picture._drill_MPFP_bean.drill_bean_setContextList(text);
        picture._drill_MPFP_bean.drill_bean_setSkinStyle(bind['style_mode'], bind['style_lockedId']);
    
    } else {
        $gameScreen.showPicture(imgIndex, 'equip slot_null', 1, xx, yy, 100, 100, 255, 0);
        
        let picture = $gameScreen.picture(imgIndex);
        
        if (picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean.drill_bean_setVisible(false);
        }
    }
	
	let actor = $gameParty.leader();	
    if (actor.hasSkill(89) || actor.hasSkill(90) || actor.hasSkill(91)) {
      QJ.MPMZ.tl.ex_playerCloseRangePiercingAttackListeners();
    }
	
};

// 玩家装备描述刷新
QJ.MPMZ.tl.ex_playerGearDescriptionRefresh = function(gid) {
	
	
	    let imgIndex = 74 + gid;
        if (!$gameScreen.picture(imgIndex)) return;
		if ($gameScreen.isPointerInnerPicture(imgIndex)) return;
        let index = $gameParty.leader().equips()[gid].id;
		// 武器描述
		let text = QJ.MPMZ.tl.ex_playerSetItemDescription($dataArmors[index]);
            text = text.split("\n");		
        let picture = $gameScreen.picture(imgIndex);
        let bind = DrillUp.g_MPFP_list[2];

        if (!picture._drill_MPFP_bean) {
            picture._drill_MPFP_bean = new Drill_MPFP_Bean();
            $gameTemp._drill_MPFP_needRestatistics = true;
            picture.drill_COPWM_checkData();
        }

        picture._drill_MPFP_bean.drill_bean_setVisible(true);
        picture._drill_MPFP_bean.drill_bean_setContextList(text);
        picture._drill_MPFP_bean.drill_bean_setSkinStyle(bind['style_mode'], bind['style_lockedId']);
		
};

// 玩家拆卸装备时触发特殊效果
QJ.MPMZ.tl.ex_playerUnequippingSpecialEffects = function(index,Equip,effect) {
	
	 if (effect != null) return; 
	
	var actor = $gameParty.leader();	
	if (!actor) return;
	if (!Equip) {
	    Equip = actor.equips()[index];
	}
	if (!Equip) return;
	
	if (DataManager.isWeapon(Equip)) {
		return;
	}

	if (DataManager.isArmor(Equip)) {
		// 招财猫
		if (Equip.baseItemId == 36) {			
	        let equips = actor.equips().filter(equip => equip && equip.baseItemId === 36);
	        equips = equips.length;		
            if (equips <= 0) {
			let BName = 'manekiNeko'; 
			QJ.MPMZ.deleteProjectile(BName,{a:['S','this._needJS=true']});
			}				
            return;
		}		
		// 猪猪存钱罐
		if (Equip.baseItemId == 37) {			
			let BName = 'piggyBank' + Equip.id; 
			QJ.MPMZ.deleteProjectile(BName,{a:['S','this._needJS=true']});		
            return;
		}
		// 贪欲存钱罐
		if (Equip.baseItemId == 38) {			
			let BName = 'goldenPiggyBank'; 
			QJ.MPMZ.deleteProjectile(BName,{a:['S','this._needJS=true']});		
            return;
		}		
	}
	
};

// 拆卸玩家身上的指定装备
QJ.MPMZ.tl.ex_unequipPlayerSpecifiedEquipment = function(item, effect, KeepIt) {

    let actor = $gameActors.actor(1); 
    let equips = actor.equips(); 
    let isWeapon = DataManager.isWeapon(item); 
    let isArmor = DataManager.isArmor(item); 
    //console.log(isArmor);
    for (let index = 1; index < equips.length; index++) {
        let equip = equips[index];

        if (!equip) continue; // 跳过空装备
        if ( isArmor && equip.id === item.id ) {
			actor.changeEquipById(index+1, null, effect);			 
            $gameMap.steupCEQJ(100, index, { equipFadeOut: true, equipChange: true, equipIndex: index });
			if ( !KeepIt ) $gameParty.loseItem(equip, 1);
            //console.log(`成功卸下装备: ${item.name} (槽位: ${index+1})`);
            return; 
        }
    }

    //console.log(`未找到需要卸下的装备: ${item.name}`);
};

// 玩家在深渊的时间流动
QJ.MPMZ.tl.ex_abyssTimeFlow = function() {

    $gameParty.refreshMembers();

    // 检查是否处于时停条件
    if (!$gameSwitches.value(118) && !QJ.MPMZ.tl.ex_playerAntiClickDetection("timeFlow")) {
        $gameSystem.add_minute(1);
        $gameVariables.setValue(71, $gameSystem.hour().padZero(2));
        $gameVariables.setValue(72, $gameSystem.minute().padZero(2));

        // 刷新时间显示窗口
        if ($gameTemp._drill_GFPT_windowTank[3]) {
            $gameTemp._drill_GFPT_windowTank[3].drill_initMessage();
        } else {
            $gameSystem.drill_GFPT_create(3, 22);
        }

        // 强制结束当天行程
        if ($gameSystem.hour() >= 17 && !Utils.isOptionValid("test")) {
            $gameSwitches.setValue(16, true); 
            $gameSwitches.setValue(3, false); 
        }
    }

    // 动态监听玩家可能持有的异常状态
	var leader = $gameParty.leader();
	// 法杖吟唱状态
    if (leader.isStateAffected(68)) {
        var equippedWeapon = leader.equips()[0];
        var clearStatesAndEffects = () => {
            leader.removeState(65);
            leader.removeState(68);
            $gamePlayer.drill_ECE_endSustainingFloating();
            $gameScreen._particle.particleClear('mahoujin_c-P');
            $gamePlayer.drill_EASA_setEnabled(true);
        };
        if (!equippedWeapon) {
            clearStatesAndEffects();
            return;
        }
        var weaponType = $dataWeapons[equippedWeapon.baseItemId].wtypeId;
        var staffTypes = [5, 6, 7];
        if (!staffTypes.includes(weaponType)) {
            clearStatesAndEffects();
        }
    }
	// 玩家攻击模式检测
    QJ.MPMZ.tl.ex_playerAttackModeDetection.call(this);
	
	// 防止闪步BUFF持续
    if (leader.isStateAffected(63)) {    
	   if($gameMap.getGroupBulletListQJ('senPo').length == 0){
		  leader.removeState(63);
	    }
	}	
	// 防止闪步太刀BUFF持续
    if (leader.isStateAffected(80)) {    
	   if($gameMap.getGroupBulletListQJ('senpoTach').length == 0){
		  leader.removeState(80);
	    }
	}	
	// 麻痹状态-如果计时器不存在了，需要立即删除状态
    if (leader.isStateAffected(7)) {    
	   if (!$gameSystem.hasGameTimeEvent("state7")) {
		  leader.removeState(7);
	    }
	}		
	// 冻结状态-如果计时器不存在了，需要立即删除状态
    if (leader.isStateAffected(9)) {    
	   if (!$gameSystem.hasGameTimeEvent("state9")) {
		  leader.removeState(9);
	    }
	}
	// 眩晕状态-如果计时器不存在了，需要立即删除状态
    if (leader.isStateAffected(11)) {    
	   if (!$gameSystem.hasGameTimeEvent("state11")) {
		  leader.removeState(11);
	    }
	}	
	
};


//玩家穿透子弹
QJ.MPMZ.tl.ex_playerBulletPhasing = function() {

  if ($gameSystem._ZzyTWFTheWorlding) return true;
  if ($gameSwitches.value(100)) return true;
  if ($gamePlayer.isJumping() || $gamePlayer._opacity < 150) return true;
  return false;

};

//玩家受伤判定
QJ.MPMZ.tl.ex_playerDamageCheck = function(baseDamage,damageType,effectId,probability,effectValue1,effectValue2) {

	if ($gameSystem._ZzyTWFTheWorlding) return;
 
	if ($gameParty.leader()._damageableCount > 0) {
        $gameParty.leader()._damageableCount -= 1;

    let randomPitch = Math.randomInt(30) + 91;
    AudioManager.playSe({ name: "Damage5", volume: 70, pitch: randomPitch, pan: 0 });
                 
	if (!Utils.isMobileDevice())  $gamePlayer.requestAnimation(141);	
				 
	if (!damageType) damageType = 1;
	// 伤害衰减
	if (this.opacity) {
	    baseDamage *= this.opacity;
	}	 
	// 物理伤害
	if (damageType === 1) {
		baseDamage -= $gameParty.leader().def;
		baseDamage *= $gameParty.leader().grd;
		baseDamage = Math.max(1, Math.min(baseDamage, 99999));
	}
	// 魔法伤害
	if (damageType === 2) {
		let damageReduction = 0.01 * chahuiUtil.magicDefenseDamageReduction($gameParty.leader().mdf);
		baseDamage -= baseDamage * damageReduction;
		baseDamage *= $gameParty.leader().grd;
		baseDamage = Math.max(1, Math.min(baseDamage, 99999));
	}
	
	let finalDamage = Math.floor(baseDamage);
	
  //伤害演出和实际受伤
    let posX = Math.randomInt(25) - 12;
    if ( damageType === 1 ) {
    SimpleMapDamageQJ.put(2,-1,finalDamage,posX,-64);   //物理伤害演出
	 } else if ( damageType === 2 ) {
	SimpleMapDamageQJ.put(3,-1,finalDamage,posX,-72);	 //魔法伤害演出 
	 }
    $gameParty.leader().gainHp(-finalDamage);
	
   //装备效果判定
    if (finalDamage > 0) { 
	  QJ.MPMZ.tl.ex_playerHitTriggerEffect(finalDamage);
	}
  //重伤判定
    if( $gameParty.leader().hpRate() <= 0.2 ) {
	 $gameScreen.startShake(1, 8, 30);	
	 QJ.MPMZ.tl.ex_playerDamageFlash();
        }
	}

  // 异常状态判定
  if (!effectId || !probability) return;
  if ( effectId <= 0 ) return;
     probability = probability * 1000 * $gameParty.leader().stateRate(effectId);
	 if (probability < Math.randomInt(100000)) return; 
	// 中毒
    if (effectId === 5) { 
	   if (!effectValue1) effectValue1 = 1;
	   if (!effectValue2) effectValue1 = 4;
	  QJ.MPMZ.tl.ex_playerPoison(effectValue1,effectValue2);
    }
	// 出血
    if (effectId === 6) { 
	   if (!effectValue1) effectValue1 = 1;
	   if (!effectValue2) effectValue1 = 4;
	  QJ.MPMZ.tl.ex_playerBleeding(effectValue1,effectValue2);
    }
	// 打雷
    if (effectId === 7) { 
	   if (!effectValue1) effectValue1 = 1;
	  QJ.MPMZ.tl.ex_playerElectrified(effectValue1);
    }	
	// 炎上
    if (effectId === 8) { 
	   if (!effectValue1) effectValue1 = 1;
	   if (!effectValue2) effectValue1 = 4;
	  QJ.MPMZ.tl.ex_playerBurning(effectValue1,effectValue2);
    }
	// 冰结
    if (effectId === 9) { 
	   if (!effectValue1) effectValue1 = 1;
	  QJ.MPMZ.tl.ex_playerFreeze(effectValue1);
    }		
};

// 玩家受击触发特效
QJ.MPMZ.tl.ex_playerHitTriggerEffect = function(damage) {

	//炸弹魔自爆	
	if ($gameParty.leader().hasSkill(34)) {
	  let chance = 10 + 6 * $gameParty.leader().skillMasteryLevel(34);
		if (chance > Math.randomInt(100)) {
	       let posX = $gamePlayer.screenBoxXShowQJ();
           let posY = $gamePlayer.screenBoxYShowQJ(); 
			QJ.MPMZ.tl.ex_bombFiendSoul(posX,posY,true);
		}		
	}
	//苹果头套的回复效果	
	if ($gameParty.leader().hasSkill(52)) {
	   if (Math.random() > 0.5) {
		   let extra = 10 + 2 * $gameParty.leader().skillMasteryLevel(52);
		   let heal = Math.randomInt(extra) + extra - 9;
               heal = Math.round(heal * $gameParty.leader().pha);
               $gameParty.leader().gainHp(heal);
               heal = heal.toString();
        QJ.MPMZ.Shoot({
            img: ['T', heal, 0, '#06ff00', 12],
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: '0|1~90/0',
            moveType: ['S', '0|1~90/0.1~999/0.1'],
            existData: [{ t: ['Time', 90] }]
        });		   
	   }
	}
	//贪欲存钱罐-玛门的索取	
	if ($gameParty.leader().isStateAffected(116)) {
	
    if (damage < 10) damage = 10; 
	if ($gameParty._gold <= 0) return;	
	$gameParty.gainGold(-damage);
    function splitDeposit(deposit) {
        // 递减顺序的大额优先面值
        const coinValues = [50000, 10000, 5000, 1000, 500, 100, 50, 10];
        let result = [];

        for (let coin of coinValues) {
            let c = Math.floor(deposit / coin);
            if (c > 0) {
                result.push({ coinValue: coin, count: c });
                deposit -= c * coin;
            }
        }
        return result;
    }
	
    function coinValueToItemId(coinValue) {

        let coinArr = [10, 50, 100, 500, 1000, 5000, 10000, 50000];
        let index = coinArr.indexOf(coinValue); 
        // 找到后 itemId = index + 4
        if (index >= 0) {
            return index + 4;
        }
        return 6; 
    }	
	
    let pieces = splitDeposit(damage); 
    for (let piece of pieces) {
        let coinValue = piece.coinValue;
        let c = piece.count;
        if (c <= 0) continue;

        // 获取 itemId
        let itemId = coinValueToItemId(coinValue);
        QJ.MPMZ.Shoot({
            img:"null1",
            position:[['P'],['P']],
            initialRotation:['S',0],
            imgRotation:['F'],
            collisionBox:['C',1],
            moveType:['S',0],
            existData:[	
				{ t:['Time',c]},
            ],
            moveJS:[
                [1,0,`
                   dingk.Loot.getMapDrops($gamePlayer, $dataItems[${itemId}]);
                `],
                [1,0,"AudioManager.playSe({ name: 'Heal1', volume: 40, pitch: 130, pan: 0 })"],
            ]
        });
      }		  
	}
};

//玩家重伤演出
QJ.MPMZ.tl.ex_playerDamageFlash = function() {
   QJ.MPMZ.Shoot({
        img:"damageFlash",
        groupName:['damageFlash'],
        position:[['S',0],['S',0]],scale:0.5,
        initialRotation:['S',0],moveType:['S',0],
        opacity:'0|0~30/1~30/0',anchor:[0,0],
        imgRotation:['F'],existData:[
          {t:['Time',59]},
        ],
        z:"A",onScreen:true
    })
};

//玩家感到兴奋
QJ.MPMZ.tl.ex_playerFeelsExcited = function() {
   var random = 80 + Math.randomInt(40);
   var se = { name: "039myuu_YumeSE_FukidashiHeart01", volume: 70, pitch: random, pan: 0 };
   AudioManager.playSe(se);	
   
   let zoom = 1 / $gameScreen.zoomScale();
   
   QJ.MPMZ.Shoot({
        img:"imoutoUtil/feelsExcited",
        groupName:['feelsExcited'],
        position:[['S',0],['S',0]],
		scale:zoom,
        initialRotation:['S',0],
		moveType:['S',0],
        opacity:'0|0~30/1~30/0',
		anchor:[0,0],
        imgRotation:['F'],
		existData:[
          {t:['Time',59]},
        ],
        z:"A",
		onScreen:true
    })
};

//玩家可复活检测
QJ.MPMZ.tl.ex_playerCanRevive = function() {
   var actor = $gameParty.leader();  
   // 火鸟的祝福
   if (actor.isStateAffected(77)) {
	  $gameSystem.triggerGameTimeEventNow('fireBirdBlessing');
      actor.removeState(77);	  
	  return 1; 
   }
   
   var armorId = 26;
   var equips = actor.equips();  
   var result = 0;
   
   for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item && item.etypeId === 2 && item.baseItemId === armorId) {
            result = 1; // 拥有火鸟的羽毛
            break;
        }
    } 
   
   return result;
};

//玩家防连点检测
QJ.MPMZ.tl.ex_playerAntiClickDetection = function(type) {
	let condition;
    switch (type) {
        case "generic":
         condition = !$gameSwitches.value(3) || $gameSwitches.value(14) || $gameMessage.isBusy() || $gamePlayer._drill_PT_is_lifting;
            break;		

        case "itemUsing":
         condition = !$gameSwitches.value(3) || $gameSwitches.value(14) || $gameMessage.isBusy() || $gamePlayer._drill_PT_is_lifting || !$gamePlayer._drill_EASA_enabled;
            break;
        
        case "throwing":
         condition = !$gameSwitches.value(3) || $gameSwitches.value(14) || $gameMessage.isBusy() || $gamePlayer._drill_PT_is_lifting || !$gamePlayer._drill_EASA_enabled;
            break;
			
        case "lifting":
         condition = $gameSwitches.value(14) || $gamePlayer._drill_PT_is_lifting || !$gamePlayer._drill_EASA_enabled || $gamePlayer.drill_EASe_isPlayingAct();
            break;
			
        case "normalAttack":
		condition = !$gameSwitches.value(3) || $gameSwitches.value(14) || $gameMessage.isBusy() || $gamePlayer._drill_PT_is_lifting || $gameMap.isEventRunning() || $gameParty.leader()._characterName == "$player_swim";
            break;
		case "timeFlow":
		condition = $gameSystem._ZzyTWFTheWorlding;
		    break;
			
        default:
            return true; 
    }
	return condition;
};

//玩家快捷道具栏刷新
QJ.MPMZ.tl.ex_playerItemRefresh = function() { 

    let useableItems = [];  
    $gameParty.allItems().forEach(function(item) {
        if (item && item.note.includes('<useableItem>')) {
            useableItems.push(item.id); 
        }
    });
    Ritter.ActiveItem_System.updateActiveIds(useableItems);
}

//玩家受击情况检查
QJ.MPMZ.tl.ex_PlayerHitCheck = function() { 
        
    //玩家自动回复能力
     if ($gameParty.leader().hrg > 0 ) {
		 QJ.MPMZ.tl.ex_playerAutoRecovery();
	 }

    //玩家可受伤次数刷新 
     let damageableCount = 5;
     if ($gameParty.leader()._damageableCount !== damageableCount) {
       $gameParty.leader()._damageableCount = damageableCount;
      }

    //防止玩家没死成
   if ( !$gameTemp._eventReserved && ($gameActors.actor(1).isStateAffected(1) || $gameActors.actor(1).hp <= 0) ) {
	   // 稻草人发动
	   if (!$gameSystem.hasGameTimeEvent('scarecrowHeart') && $gameActors.actor(1).isStateAffected(115)) {
	      if (!$gameSystem.hasGameTimeEvent('scarecrowHeartActivated')) {
		      $gameSystem.addGameTimeEvent({ key: 'scarecrowHeart', delayMinutes: 3 });
			  $gameSystem.addGameTimeEvent({ key: 'scarecrowHeartActivated', delayMinutes: 60 });
			  $gameScreen._particle.particleSet(0,'dark_hole_r_3','player');
			  $gameScreen.startTint([-100, -100, -100, 0], 450);
		  }
	   }
	   
	   $gameMap.steupCEQJ(4,1);
	  
   }
    // 举物状态重置
   if ($gamePlayer._drill_PT_is_lifting) {
	   $gameSwitches.setValue(195,true);
      } 

    // 长按触发闪步
    if (Input.drill_isKeyPressed('空格')) {
	   if (!$gameSwitches.value(203)) {
		   QJ.MPMZ.tl.ex_senpo.call(this);
	   }
   }
  

};

// 玩家自动回复能力
QJ.MPMZ.tl.ex_playerAutoRecovery = function() {
	
    if ($gameMap.getGroupBulletListQJ('playerAutoRecovery').length > 0) {
		let player = $gameParty.leader();
        let heal = 100 * player.hrg * player.pha;
        heal = Math.floor(heal);
        player.gainHp(heal);
        if ( player.hpRate() < 1 ) {
        heal = heal.toString();
        QJ.MPMZ.Shoot({
            img: ['T', heal, 0, '#06ff00', 12],
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: '0|1~90/0',
            moveType: ['S', '0|1~90/0.1~999/0.1'],
            existData: [{ t: ['Time', 90] }]
        });
		}
		
    } else {
		
		$gameScreen._particle.particleSet(0,'mahoujin_c-H','player','mahoujin_c');
        QJ.MPMZ.Shoot({
            groupName: ['playerAutoRecovery'],
            img: "null1",
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 1,
            scale: [0.75, 0.75],
            anchor: [0.55, 0.6],
            moveType: ['B', -1],
            collisionBox: ['C', 1],
            existData: [
                { t: ['S', '$gameParty.leader().hrg > 0', false], d: [0, 30] }
            ],
			deadJS:["$gameScreen._particle.particleClear('mahoujin_c-H')"]
        });
    }
};

//玩家刷新攻击模式
QJ.MPMZ.tl.ex_playerUpdatesAttackMode = function() { 
     
     QJ.MPMZ.deleteProjectile('playerWeapon');
	 QJ.MPMZ.deleteProjectile('playerStaff');
	 QJ.MPMZ.deleteProjectile('playerPunch');

    if ($gamePlayer.isStealthMode()) return;
    if(!$gameParty.leader().equips()[0]) return;

		 let weaponType = $gameParty.leader().equips()[0].wtypeId;
		 let swordType = [1,2];
		 let staffType = [5,6,7];
		 
		 if ( swordType.includes(weaponType) ) {
			 QJ.MPMZ.tl.ex_playermeleeAttackCheck();
		 }		 
		 if ( staffType.includes(weaponType) ) {
			 QJ.MPMZ.tl.ex_staffAlwaysVisible();
		 }

		// 拳头
		if (!$gameParty.leader().equips()[0].baseItemId) {
		  if ($gameParty.leader().equips()[0].id == 4) {  
			QJ.MPMZ.tl.ex_punchAttackListener();
		  }
		} else {
		  if ($gameParty.leader().equips()[0].baseItemId == 4) {  
			QJ.MPMZ.tl.ex_punchAttackListener();
		  }
		}			

};

//玩家属性面板刷新
QJ.MPMZ.tl.ex_playerAttributeRefresh = function() { 

	var picture = $gameScreen.picture(70);
	if (picture && picture._drill_MPFP_bean){
	if ($gameScreen.isPointerInnerPicture(70)) return;
	var actor = $gameActors.actor(1);
	//攻击力
    var text = "\\fn[RiiTegakiFude]\\fs[26]\\i[17]\\fs[22]: " + actor.atk;
	if ( actor.paramPlus(2) > 0 ) text += " \\c[110]\\fs[18]\\fi(+" + actor.paramPlus(2) + ") ";
	if ( actor.paramFlat(2) > 0 ) text += " \\c[10](+" + actor.paramFlat(2) + ")\\c[0] ";
	if ( actor.paramFlat(2) < 0 ) text += " \\c[2](" + actor.paramFlat(2) + ")\\c[0] ";
	//魔攻力
	    text += "\n\\fn[RiiTegakiFude]\\fs[26]\\i[18]\\fs[22]: " + actor.mat;
	if ( actor.paramPlus(4) > 0 ) text += " \\c[110]\\fs[18]\\fi(+" + actor.paramPlus(4) + ") ";
	if ( actor.paramFlat(4) > 0 ) text += " \\c[23](+" + actor.paramFlat(4) + ")\\c[0] ";
	if ( actor.paramFlat(4) < 0 ) text += " \\c[22](" + actor.paramFlat(4) + ")\\c[0] ";
	//防御力
		text += "\n\\fn[RiiTegakiFude]\\fs[26]\\i[19]\\fs[22]: " + actor.def;
	if ( actor.paramPlus(3) > 0 ) text += " \\c[110]\\fs[18]\\fi(+" + actor.paramPlus(3) + ") ";
	if ( actor.paramFlat(3) > 0 ) text += " \\c[6](+" + actor.paramFlat(3) + ")\\c[0] ";
	if ( actor.paramFlat(3) < 0 ) text += " \\c[14](" + actor.paramFlat(3) + ")\\c[0] ";
	//魔法抗性
		text += "\n\\fn[RiiTegakiFude]\\fs[26]\\i[20]\\fs[22]: " + actor.mdf;
		text += "\\c[31][-" + chahuiUtil.magicDefenseDamageReduction(actor.mdf) + "%]\\c[0]";
	if ( actor.paramPlus(5) > 0 ) text += " \\c[110]\\fs[18]\\fi(+" + actor.paramPlus(5) + ") ";
	if ( actor.paramFlat(5) > 0 ) text += " \\c[6](+" + actor.paramFlat(5) + ")\\c[0] ";
	if ( actor.paramFlat(5) < 0 ) text += " \\c[14](" + actor.paramFlat(5) + ")\\c[0] ";	
	//幸运
	    text += "\n\\fn[RiiTegakiFude]\\fs[26]\\i[22]\\fs[22]: " + actor.luk;
    //移动速度
		text += "\n\\fn[RiiTegakiFude]\\fs[26]\\i[21]\\fs[22]: " + $gamePlayer.realMoveSpeed();
    text = text.split("\n");
    picture._drill_MPFP_bean.drill_bean_setVisible( true );
    picture._drill_MPFP_bean.drill_bean_setContextList( text );	
	} else {
		$gameScreen.showPicture(70, "gauge", 0, 25, 32, 100, 100, 255, 0);
		$gameScreen.picture(70)._drill_MPFP_bean = new Drill_MPFP_Bean();
		$gameTemp._drill_MPFP_needRestatistics = true;
		$gameScreen.picture(70).drill_COPWM_checkData();
		$gameScreen.picture(70)._drill_MPFP_bean.drill_bean_setVisible( true );
		$gameScreen.picture(70)._drill_MPFP_bean.drill_bean_setContextList( " " );
		$gameScreen.picture(70)._drill_MPFP_bean.drill_bean_setSkinStyle( "锁定皮肤样式", 3 );
	}


}; 

//玩家水中检查
QJ.MPMZ.tl.ex_playerSwimmingCheck = function () {

    if (!this || !$gamePlayer._drill_EASA_enabled) return;

    const canChangeOpacity = typeof this.changeAttribute === 'function';
    const leader           = $gameParty.leader();
    const playerX          = Math.floor($gamePlayer.centerRealX());
    const playerY          = Math.floor($gamePlayer.centerRealY());
    const inWater          = $gameMap.regionId(playerX, playerY) === 8 && !$gamePlayer.isJumping();

    /* 玩家在水中 -------------------------------------------------- */
    if (inWater) {

        if (canChangeOpacity) this.changeAttribute('opacity', 0);

        if (leader._characterName !== '$player_swim') {
            $gameScreen._particle.particleGroupSet(0, 'splash_cp', 'player');
            $gamePlayer.drill_EASe_stopAct();
            leader._characterName = '$player_swim';
            $gamePlayer.refresh();
            $gamePlayer.drill_EASA_setEnabled(true);
            leader.addState(67);
            $gameSwitches.setValue(14, true);
        }

    /* 玩家离开水面 ----------------------------------------------- */
    } else {

        if ($gameStrings.value(20).trim() === '' && canChangeOpacity) {
            this.changeAttribute('opacity', 0.8);
        }

        if (leader.isStateAffected(67)) {
            leader.removeState(67);
            $gameSwitches.setValue(14, false);
        }
    }
};

// 玩家卡墙检查
QJ.MPMZ.tl.ex_playerStuckCheck = function() {

    if ($gameMessage.isBusy()) {
	  QJ.MPMZ.tl.ex_playerAttackCommandBlock();
	}
	
    var playerX = Math.floor($gamePlayer.centerRealX());
    var playerY = Math.floor($gamePlayer.centerRealY());

    // 水中检查
    QJ.MPMZ.tl.ex_playerSwimmingCheck.call(this);

    var noPass = false;
    var region = $gameMap.regionId(playerX, playerY);
    if ($gameNumberArray.value(5).includes(region)) {
        noPass = true;
    }

    var canThrough = $gamePlayer._through || $gamePlayer.isJumping() || $gameSwitches.value(100);
	var canMove = $gamePlayer.canPass(playerX, playerY, 2) ||
	              $gamePlayer.canPass(playerX, playerY, 4) ||
	              $gamePlayer.canPass(playerX, playerY, 6) ||
	              $gamePlayer.canPass(playerX, playerY, 8);
    // 如果四个方向都不可通行，或者玩家处于标记的区域ID内，则玩家处于无法移动的位置
    if ( (noPass && !canThrough) || !canMove ) {

        // 卡墙的碰撞伤害
        QJ.MPMZ.tl.ex_playerStuckCollisionDamage();

        var condition = DrillUp.g_COFA_condition_list[10];
        var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(playerX, playerY, "圆形区域", 8, condition);

        if (c_area.length > 0) {
            var p = c_area[Math.floor(Math.random() * c_area.length)];
            var xPlus = p.x - playerX;
            var yPlus = p.y - playerY; 
            $gamePlayer.jump(xPlus, yPlus);
        } else {
            $gamePlayer.jump(0, 0);
        }
    }
	
};

// 视情况切换行走图动画类型
QJ.MPMZ.tl.ex_playerSwitchesSpiritType = function() {
	
	let player = $gamePlayer;	
	if (!player._drill_EASe_controller) return;
	let controller = player._drill_EASe_controller.drill_data();
	if (!controller) return;
	
	// 初始化移速记录
	$gameParty.leader()._baseSpeed = $gameParty.leader()._baseSpeed || 8;
	let baseSpeed = $gameParty.leader()._baseSpeed;
	let extraSpeed = 0;
	
	// 处于奔跑状态
	if ( ConfigManager.alwaysDash ) {
		player._moveSpeed = baseSpeed + extraSpeed;
		return;
	}
	// 处于走路或潜行状态
	if ( $gameParty.leader().hasSkill(10) && $gameSwitches.value(145) ) {
	  // 忍者潜行
	  controller.state_tank[0].tag_tank = [];
	  controller.state_tank[31].tag_tank = ["<行走图-移动>"];
	  extraSpeed += Math.floor($gameParty.leader().skillMasteryLevel(10)/2) - 4;
	  // 激活潜行检测脚本
      QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['playerStealth'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
		anchor:[0.5,0.5],
        collisionBox:['C',60],
        moveType:['D',true],
        existData:[	
		   {t:['S','$gameSwitches.value(145)',false]},
		   {t:['G',['"enemy"']],a:['F',QJ.MPMZ.tl.ex_playerStealthDetectionRange],p:[-1,true,true],c:['T',0,30,true]},		
        ],
		moveF:[
           [30,15,QJ.MPMZ.tl.ex_playerStealthDetectionRange]  
		],
     });
	} else {
	  controller.state_tank[0].tag_tank = ["<行走图-移动>"];
	  controller.state_tank[31].tag_tank = [""];	
	}
	
	player._moveSpeed = baseSpeed + extraSpeed;
};

// 玩家潜行中范围检测
QJ.MPMZ.tl.ex_playerStealthDetectionRange = function(args) {

  if ( args.target instanceof Game_Event ) {
	   
	let chasing = false;
	let moved = $gamePlayer.isMoved();
	let alerted = !args.target._shouldAlert && args.target._canBeAlerted;
	if (args.target._enemyState && args.target._enemyState === 2) {
		chasing = true;
	}
	
	if (moved && alerted && !chasing) {

	// 标记子弹
	 const randomX = Math.randomInt(1600) - 300;
	 const name = 'stealth' + randomX;
     let bullet = QJ.MPMZ.Shoot({
        img:"null1",
		groupName: [name],
		position:[['S',randomX],['S',0]],
        initialRotation:['S',0],
		imgRotation:['F'],
		onScreen:true,
        moveType:['S',0],
        scale:0.5,
        existData:[
        {t:['Time',61]}	
        ],
    });	
	
	let index = bullet.index;	
	let posX = $gamePlayer.screenBoxXShowQJ();
	let posY = $gamePlayer.screenBoxYShowQJ() + 20;
    QJ.MPMZ.Shoot({
        img:"kosokoso",
		//groupName: ['sushiPudding'],
		position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
		imgRotation:['S',0],
        moveType:['TB',name,1.5,10,20],
		opacity:'0|0~30/1~60/0',
        scale:0.5,
		z:"W",
        existData:[
          {t:['Time',60],d:[0,30]}	
        ],
		moveF:[
		  //[90,999,QJ.MPMZ.tl.ex_sushiPuddingSummonAki]
		],
		timeline:['S',0,40,[-1,8,20]],
    });	
	// 增加熟练度
    if(Math.random() > 0.4) {
		QJ.MPMZ.tl.ex_playerStealthProficiencyIncreased(1);
	  }
	}	
  }
	
};

// 潜行技能熟练度变化
QJ.MPMZ.tl.ex_playerStealthProficiencyIncreased = function(value) {
	
	  $gameParty.leader().gainSkillMasteryUses(10, value);
     const uses = $gameParty.leader().skillMasteryUses(10);
     const masteryTable = [4, 15, 50, 150, 500, 1600, 4800, 12000, 24000, 36000];
     let newLevel = 0; 
     for (let i = 0; i < masteryTable.length; i++) {
       if (uses >= masteryTable[i]) {
           newLevel = i + 1;
         } else {
           break;
         }
     }
    $gameParty.leader().setSkillMasteryLevel(10, newLevel);
	$gameParty.leader().setSkillMasteryUses(10, uses);
	
};

// 卡墙的碰撞伤害
QJ.MPMZ.tl.ex_playerStuckCollisionDamage = function() {
	
	if (!Utils.isMobileDevice())  $gamePlayer.requestAnimation(140);
	var realDamage = Math.floor($gameParty.leader().mhp * 0.05);
    SimpleMapDamageQJ.put(2,-1,realDamage,0,-72);
    $gameParty.leader().gainHp(-realDamage);
	
    QJ.MPMZ.Shoot({
        img:"animehit[5,4]",
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',1],
        moveType:['S',0],
        existData:[	
		  {t:['Time',19]},
        ],
    });
};

//玩家坠落检测
QJ.MPMZ.tl.ex_playerFallCheck = function() {
    
	var condition1 = !$gameSwitches.value(100) && !$gameSwitches.value(188) && $gameMap.regionId( Math.floor($gamePlayer.centerRealX()), Math.floor($gamePlayer.centerRealY()) ) === 250;
	
	var condition2 = $gameStrings.value(20).trim() == "" && $gamePlayer._opacity > 100;
	
	return condition1 && condition2;
	
};

//玩家攻击指令阻塞（防止对话框关闭时失误攻击）
QJ.MPMZ.tl.ex_playerAttackCommandBlock = function() {
   
   if ($gameMap.getGroupBulletListQJ('attackBlock').length == 0) {
	   
	  $gameSwitches.setValue(14, true);
	  QJ.MPMZ.Shoot({
  	   img:"null1",
	   groupName: ['attackBlock'],
	   extra:0,
  	   existData: [ 
	     {t:['Time',600]},
	     {t:['S',"this.data.extra > 4",true]},
	   ],
	   moveJS:[
	     [30,15,"if($gameMessage.isBusy()){this.data.extra=0}else{this.data.extra+=1}"]
	   ],
  	   deadJS:[
 	      "$gameSwitches.setValue(14, false)"
 	    ]
	  });	   
	   
   }
      
};

//检查玩家背包中武器容量
QJ.MPMZ.tl.checkplayerWeaponWeight = function() {
	if ($gameParty.leader()._weaponAmountLimit === undefined) $gameParty.leader()._weaponAmountLimit = 10;
	if (!$gameParty.leader()._weaponAmountBonus) $gameParty.leader()._weaponAmountBonus = 0;
	const limit = $gameParty.leader()._weaponAmountLimit + $gameParty.leader()._weaponAmountBonus;
	const weapons = Object.values($gameParty._weapons).length;
	
    if (weapons < limit) return true;

    var randomPitch = Math.randomInt(40) + 80;
    var se = { name: "014myuu_YumeSE_SystemBuzzer03", volume: 55, pitch: randomPitch, pan: 0 };
    AudioManager.playSe(se);

    const lang = $gameVariables.value(1);
	var BulletText;
    switch(lang) {
    case 0:
        BulletText = "拿不下更多武器啦！";
        break;
    case 1:
        BulletText = "もう武器持てない！"
        break;
    case 2:
        BulletText = "Can’t carry more weapons!"
        break;
    default:
        return;
        break;
    }

	var text  = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + BulletText;
    var x =  $gamePlayer.screenX() * $gameScreen.zoomScale();
    var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;	
	$gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 120 );

};


//检查玩家背包中装备容量
QJ.MPMZ.tl.checkplayerGearWeight = function() {
	if ($gameParty.leader()._armorAmountLimit === undefined) $gameParty.leader()._armorAmountLimit = 20;
	if (!$gameParty.leader()._armorAmountBonus)  $gameParty.leader()._armorAmountBonus = 20;
	const limit = $gameParty.leader()._armorAmountLimit + $gameParty.leader()._armorAmountBonus;
	const armors = Object.values($gameParty._armors).length;
	
    if (armors < limit) return true;

    var randomPitch = Math.randomInt(40) + 80;
    var se = { name: "014myuu_YumeSE_SystemBuzzer03", volume: 55, pitch: randomPitch, pan: 0 };
    AudioManager.playSe(se);
	
    const lang = $gameVariables.value(1);
	var BulletText;
    switch(lang) {
    case 0:
        BulletText = "拿不下更多装备啦！";
        break;
    case 1:
        BulletText = "もう装備持てない！"
        break;
    case 2:
        BulletText = "Can’t carry more gears!"
        break;
    default:
        return;
        break;
    }

	var text  = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + BulletText;
    var x =  $gamePlayer.screenX() * $gameScreen.zoomScale();
    var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;	
	$gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 120 );
};

//检查玩家背包中装备容量
QJ.MPMZ.tl.upgradeWeaponArmorLimit = function(type) {

    const isWeapon = (type === 'weapon');
    const isArmor  = (type === 'armor');
    if (!isWeapon && !isArmor) {
        return false;  
    }

    const actor = $gameParty.leader();  
    if (!actor) return false;


    if (actor._weaponAmountLimit === undefined) actor._weaponAmountLimit = 10; 
    if (actor._armorAmountLimit === undefined)  actor._armorAmountLimit  = 20; 

    const limitKey = isWeapon ? '_weaponAmountLimit' : '_armorAmountLimit';
    let currentLimit = actor[limitKey];  
    const maxLimit   = 50;     

    if (currentLimit >= maxLimit) {
        return false;
    }

    const base = isWeapon ? 10 : 20;             
    const upgrades = currentLimit - base;        // 已经扩容过多少次
    const cost = Math.min(128, Math.pow(2, upgrades));

    if ($gameParty.numItems($dataItems[312]) < cost) {
        return false;
    }

    $gameParty.loseItem($dataItems[312], cost);

    actor[limitKey] = currentLimit + 1;  
    return true; 
};


//=============================================================================
//体术
//=============================================================================



//闪步
QJ.MPMZ.tl.ex_senpo = function() {
	
    if (!$dataMap) return;
    if (!$dataMap.note.includes("<深渊>")) return;
	// 屁股痛
	if ( $gameParty.leader().isStateAffected(61) ) return;
    
	if ($gameSwitches.value(14) && !$gameParty.leader().isStateAffected(67)) return;
	// 潜行状态不允许冲刺
	if (!ConfigManager.alwaysDash && $gameSwitches.value(145)) return;
	
    if ( $gameSwitches.value(203) || $gameSwitches.value(95) || $dataMap.disableDashing ) {

            var lang = $gameVariables.value(1);
            switch (lang) {
                case 0:
                    lang = "技能冷却中！!";
                    break;
                case 1:
                    lang = "スキルはクールダウン中！!";
                    break;
                case 2:
                    lang = "Skill On Cooldown!!";
                    break;
                default:
                    lang = "Skill On Cooldown!!";
                    break;
            }
            var text = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + lang;
            var x = $gamePlayer.screenX() * $gameScreen.zoomScale();
            var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;
            $gameTemp.drill_GFTT_createSimple([x, y], text, 5, 0, 90);
            AudioManager.playSe({ name: "012myuu_YumeSE_SystemBuzzer01", volume: 70, pitch: 100, pan: 0 });
            return;
        }
    
    
    if ($gameMap.getGroupBulletListQJ('senpoTachi').length > 0) return;
    if ($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
    
    // 技能持续时间，基于玩家技能熟练度增加
    var skillDuration = 15;
    skillDuration += $gameParty.leader().skillMasteryLevel(39);
    
    // 根据状态选择演出效果
    if (!$gameParty.leader().isStateAffected(67)) {
        $gameScreen._particle.particlePlay(0, "fuss_startdash", "player", "def", "0.9");
    } else {
        $gameScreen._particle.particleGroupSet(0, "splash_cp", "player");
    }
    
    // 播放音效
    var seNames = "Wind1";
    var se = { name: seNames, volume: 60, pitch: 140, pan: 0 };
    AudioManager.playSe(se);
    
    // 设置运动滤镜效果
	if (!Utils.isMobileDevice()) {
	$gameMap.createFilter("モーションブラー", "motionblur", 3999);
    $gameMap.setFilter("モーションブラー", [30, 0]);
    $gameMap.moveFilter("モーションブラー", [0, 0], skillDuration);
    $gameMap.eraseFilterAfterMove("モーションブラー");
	}
    // 设置闪步状态开关
    $gameSwitches.setValue(95, false);
    $gameSwitches.setValue(100, true);
    $gameSwitches.setValue(203, true);
    $gameParty.leader().addState(63);
    
    // 保证走路时触发闪步时有最低位移
    if ($gamePlayer.realMoveSpeed() < 25) {
        $gamePlayer._moveSpeed = 20;
    }
    
    var character = $gamePlayer;
    var color;
    if (!$gameParty.leader().isStateAffected(67)) {
        var r = 255, g = 150, b = 0;
        color = [r, g, b, 255];
    } else {
        var r = 50, g = 140, b = 200;
        color = [r, g, b, 255];
    }
    
    // 幽灵闪步效果：改变颜色、透明度和穿透性
    if ($gameParty.leader().hasSkill(92)) {
        r = 144; g = 0; b = 255;
        color = [r, g, b, 255];
        character._opacity = 128;
        character._through = true;
    }
    
    // 计算残影间隔（根据移动速度）
    var baseSpeed = 48;
    var moveSpeed = $gamePlayer.realMoveSpeed();
    const minPeriod = 0;
    const maxPeriod = 4;
    var period = Math.max(minPeriod, maxPeriod - Math.floor(moveSpeed / baseSpeed));
       
    var senPo = QJ.MPMZ.Shoot({
        img: "null1",
        groupName: ['senPo'],
        position: [['P'], ['P']],
        initialRotation: ['PD'],
        scale: [1, 1],
        moveType: ['B', -1],
        opacity: 0,
        imgRotation: ['F'],
        anchor: [0.5, 0.5],
        existData: [
            { t: ['Time', skillDuration] }
            // { t: ['G', ['"enemy"', '"object"']], a: ['C', 155, [1, 20, 0, 0]], p: [-1, false, true] }
        ],
		moveF: [
		   [0,2,QJ.MPMZ.tl.ex_senpoResidualEffect,[-1,color]]
		],
        z: "E",
        collisionBox: ['C', 1],
        deadF: [[QJ.MPMZ.tl.ex_senpoFinish]]
    });
    
	// 女仆装状态下禁止以下操作
    if ($gamePlayer.isStealthMode()) return;
    
    // 闪步太刀监听器
    if ($gameParty.leader().hasSkill(3)) {
        QJ.MPMZ.Shoot({
            img: "null1",
            groupName: ['senpoTachiListener'],
            position: [['P'], ['P']],
            initialRotation: ['PD'],
            moveType: ['B', -1],
            opacity: 0,
            existData: [
                { t: ['Time', 60] }
            ],
            moveF: [
                [0, 0, QJ.MPMZ.tl.ex_senpoTachiListener]
            ]
        });
    }
    
    // 适配荆棘套装的接近攻击能力
    if ($gameParty.leader().hasSkill(91)) {
        let damage = 5 + $gameParty.leader().skillMasteryLevel(91);
        damage += Math.floor(damage * ($gamePlayer.realMoveSpeed() / 20));
        QJ.MPMZ.Shoot({
            img: "null1",
            groupName: ['2'],
            position: [['P'], ['P']],
            initialRotation: ['PD'],
            collisionBox: ['C', 30],
            moveType: ['B', -1],
            opacity: 0,
            existData: [
                { t: ['Time', skillDuration] },
                { t: ['G', ['"enemy"']], a: ['F', QJ.MPMZ.tl.customEnemyDamageCalculation, [damage, false]], p: [-1, false, true] }
            ]
        });
    }
};

// 闪步残像生成
QJ.MPMZ.tl.ex_senpoResidualEffect = function(user,color = [0,0,0,0],IsActionSequence = null) {
	
	let zz = "MF_UG";
	if (Utils.isMobileDevice()) zz = "W";
	
	let posX,posY,value;
	if (user > 0) {
		if ($gameMap.event(user)) {
		if (!$gameMap.event(user).isMoved()) return;	
     posX = $gameMap.event(user).screenBoxXShowQJ();
     posY = $gameMap.event(user).screenBoxYShowQJ();
	 value = IsActionSequence;
		}
	} else {
	 if (!$gamePlayer.isMoved()) return;		
     posX = $gamePlayer.screenBoxXShowQJ();
     posY = $gamePlayer.screenBoxYShowQJ();
	  if ($gamePlayer._drill_EASe_controller !== undefined) {
	    value = true;
	  } else {
		value = false;  
	  }
	}		
	
	let time = 10;
	
    var residual = QJ.MPMZ.Shoot({
        img:['C',user],
		position:[['S',posX],['S',,posY]],
        initialRotation:['S',0],
		imgRotation:['F'],
        moveType:['S',0],
		opacity:0.3,
		blendMode:0,
		tone:color,
		collisionBox: ['R', 22, 30],
        existData:[	
           {t:['Time',time],d:[0,60]},
		   //{ t: ['G', ['"enemy"']], a: ['F', QJ.MPMZ.tl.customEnemyDamageCalculation, [4, false]], p: [-1, false, true] }
        ],
        isActionSequence:value,
        z:zz,
		//timeline:['S',0,2,[-1,1,1]],
    });

    /*
    if ( $gameParty.leader().hasSkill(52) ) {
        residual.addTimeline(['S',0,2,[-1,1,1]]);
	}		
	*/
};



//闪步太刀攻击模式监听
QJ.MPMZ.tl.ex_senpoTachiListener = function() {

    if ($gameSwitches.value(14) || $gameParty.leader()._characterName == "$player_swim") return;
	
	if ($gamePlayer.isDashing()) {
		$gamePlayer._moveSpeed = 8;
	}

 // 手柄检测
 if ( navigator.getGamepads() && navigator.getGamepads()[0] !== null ) {
	 var GamepadsAttack = Input.drill_isPadPressed('右摇杆上') || Input.drill_isPadPressed('右摇杆下') || Input.drill_isPadPressed('右摇杆左') || Input.drill_isPadPressed('右摇杆右');
     if (GamepadsAttack && !$gameSwitches.value(95)) {
		   QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
        if($gameMap.getGroupBulletListQJ('playerSkill').length === 0){
           QJ.MPMZ.deleteProjectile('senpoTachEffects');
           QJ.MPMZ.tl.ex_senpoTachiRelease();
		   QJ.MPMZ.deleteProjectile('senpoTachiListener');
         }
	 }	
    return;	 
  }
	
	if ( TouchInput.drill_isLeftPressed() && !$gameSwitches.value(95) ) {
        if($gameMap.getGroupBulletListQJ('playerSkill').length === 0){
           QJ.MPMZ.deleteProjectile('senpoTachEffects');
           QJ.MPMZ.tl.ex_senpoTachiRelease();
		   QJ.MPMZ.deleteProjectile('senpoTachiListener');
         }		
	}
	
	if ( TouchInput.drill_isRightPressed() && !$gameSwitches.value(95) ) {
        if($gameMap.getGroupBulletListQJ('playerSkill').length === 0){
           QJ.MPMZ.deleteProjectile('senpoTachEffects');
           QJ.MPMZ.tl.ex_senpoTachi();
		   QJ.MPMZ.deleteProjectile('senpoTachiListener');
         }		
	}	
	
};

//闪步结束效果
QJ.MPMZ.tl.ex_senpoFinish = function() {

	var character = $gamePlayer;
	character._opacity = 255;
	character._moveSpeed = 8;
	character._through = false;
	$gameSwitches.setValue(95, false);
	$gameSwitches.setValue(100, false);
	$gameParty.leader().removeState(63);


   var type;
   if(!$gameParty.leader().isStateAffected(67)){
    var coolDown = 60;
    type = 0;
   } else {
	var coolDown = 120;   
    type = 1;	
   }

   if ($gameParty.leader().hasSkill(28)) {
	 coolDown -= 15 * $gameParty.leader().skillMasteryLevel(28);
   } 
     coolDown = Math.max(1,coolDown);
   
	$gameParty.leader().addState(64);
    var senPokinshi = QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['senPokinshi'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
		extra:type,
        collisionBox:['C',1],
        moveType:['D',false],
        existData:[
            {t:['Time',coolDown]}, 		
        ],
		deadJS:["$gameParty.leader().removeState(64);$gameSwitches.setValue(203, false)"]
    });

    if (coolDown > 10) {
	  coolDown -= 10;
      senPokinshi.addMoveData("JS",[coolDown,99999,'if(this.data.extra===1){$gamePlayer.requestAnimation(183)}else{$gamePlayer.requestAnimation(147)}']);
	}		
	
};

//=============================================================================
//玩家技能
//=============================================================================

//近战普通攻击行为检测
QJ.MPMZ.tl.ex_playermeleeAttackCheck = function() {
	
	 if(!$gameParty.leader().equips()[0]) return;
	 let weaponType = $gameParty.leader().equips()[0].wtypeId;
     let swordType = [1,2];
	 if (!swordType.includes(weaponType)) return;	 
	 if($gameMap.getGroupBulletListQJ('playerWeapon').length > 0) return;
	 
     var Monitor = QJ.MPMZ.Shoot({
            groupName: ['playerWeapon','attackMonitoring'],
            img: "null1",
            position: [['P'], ['P']],
            initialRotation: ['S',0],
            moveType: ['B',-1],
			opacity:0,
			collisionBox:['C',1],
            existData: [
            ],          
            moveF: [
			[30,2,QJ.MPMZ.tl.ex_playerMeleeAttackTrigger],
            [30,2,QJ.MPMZ.tl.ex_playerSpecialAttackTrigger],
            ],
        });

	 // 标记移动端
	 if (Utils.isMobileDevice()) {
		Monitor._isMobile = true;
	 }	
};

// 手柄控制玩家朝向
QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection = function() {
	
     $gamePlayer._directionFix = false;
    // 检测右摇杆
    const up    = Input.drill_isPadPressed('右摇杆上');
    const down  = Input.drill_isPadPressed('右摇杆下');
    const left  = Input.drill_isPadPressed('右摇杆左');
    const right = Input.drill_isPadPressed('右摇杆右');

    // 是否有任何方向输入
    const isPadPressed = up || down || left || right;

    // 若玩家有推动右摇杆，则按4方向进行朝向
    if (isPadPressed) {
        // 优先级： 上 > 下 > 左 > 右
        // 如果按上+左 或 上+右，也都视作“上”。
        // 如果按下+左 或 下+右，也都视作“下”。
        if (up) {
            $gamePlayer.setDirection(8); // 向上
        } else if (down) {
            $gamePlayer.setDirection(2); // 向下
        } else if (left) {
            $gamePlayer.setDirection(4); // 向左
        } else if (right) {
            $gamePlayer.setDirection(6); // 向右
        }
    }
	$gamePlayer._directionFix = true;
};


// 近战普通攻击行为检测
QJ.MPMZ.tl.ex_playerMeleeAttackTrigger = function() {
    this._coolDown = this._coolDown || 0;
    if (this._coolDown > 0) {
        this._coolDown -= 1;
        return;
    }

    var GamepadsAttack = false;
    // 手柄检测
    if (navigator.getGamepads() && navigator.getGamepads()[0] !== null) {
        GamepadsAttack = !Input.drill_isPadPressed('LT') && (
            Input.drill_isPadPressed('右摇杆上') || 
            Input.drill_isPadPressed('右摇杆下') || 
            Input.drill_isPadPressed('右摇杆左') || 
            Input.drill_isPadPressed('右摇杆右')
        );
        if (GamepadsAttack) QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
    }

 let Triggered = false;
 if (Utils.isMobileDevice()) {
	 Triggered = $gameSwitches.value(201);
 } else {
	 Triggered = TouchInput.drill_isLeftPressed();
 }    

    if (Triggered || GamepadsAttack) {
		if (!$gameParty.leader().equips()[0]) return;
        let weaponType = $gameParty.leader().equips()[0].wtypeId;
        let swordType = [1, 2];
        if (!swordType.includes(weaponType)) return;

        if (QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack")) return;
        if ($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
        if (SceneManager._scene.drill_GBu_isOnGaugeButton()) return;
        if ($gameSwitches.value(181)) return;

        $gameMap.steupCEQJ(160, 1);
        let level = $gameParty.leader().skillMasteryLevel(26);

        if (level > 8) {
            this._coolDown = 2;
        } else if (level > 6) {
            this._coolDown = 5;
        } else if (level > 4) {
            this._coolDown = 9;
        } else if (level > 2) {
            this._coolDown = 12;
        } else {
            this._coolDown = 14;
        }
        
        // 攻速修正
        this._coolDown = Math.round(this._coolDown * (1 - $gameParty.leader().cnt));
        this._coolDown = Math.max(this._coolDown, 1);
    }
};

// 近战特殊攻击行为检测
QJ.MPMZ.tl.ex_playerSpecialAttackTrigger = function() {
    var GamepadsAttack = false;
	
	if (this._isMobile) {
	   if (Input.getPressTime('ok') > 30)	GamepadsAttack = true;
	}
	
    // 手柄检测
    if (navigator.getGamepads() && navigator.getGamepads()[0] !== null) {
        GamepadsAttack = Input.drill_isPadPressed('LT') && (
            Input.drill_isPadPressed('右摇杆上') || 
            Input.drill_isPadPressed('右摇杆下') || 
            Input.drill_isPadPressed('右摇杆左') || 
            Input.drill_isPadPressed('右摇杆右')
        );
        if (GamepadsAttack) {
			QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
			GamepadsAttack = 'Gamepad';
		}
    }

    if (TouchInput.drill_isRightPressed() || GamepadsAttack) {
        if (QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack")) return;
        if ($gameSwitches.value(181)) return;
        if ($gameMap.getGroupBulletListQJ('Senpo').length > 0) return;
        if (!$gameParty.leader().equips()[0]) return;
        let weaponType = $gameParty.leader().equips()[0].wtypeId;
        let swordType = [1, 2];
        if (!swordType.includes(weaponType)) return;
        // 旋风斩
        QJ.MPMZ.tl.ex_senpuuGiri(GamepadsAttack);
    }
};

	
//近战普通攻击
QJ.MPMZ.tl.meleeAttack = function() {

	if($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
	if(!$gameParty.leader().equips()[0]) return;
    
	let wid = $gameParty.leader().equips()[0].baseItemId;
	 
    var weaponImage = "weapon/weapon" + wid;
	var weaponTrail = "weapon/weaponTrail" + wid;
    var weaponScale = $gameParty.leader().pdr;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
	// 剑术修行加成
    if ( $gameParty.leader().hasSkill(26) ) {
        weaponDamage *= (100 + (1.8**$gameActors.actor(1).skillMasteryLevel(26))) / 100;
	}
    let level = $gameParty.leader().skillMasteryLevel(26);
	var rotation,angle,time,trailRotation,skillTime,zz,Talpha;

    if (level > 4) {
      angle = 25;
	  time = 6;
	  skillTime = 4;
    } else if (level > 2) {
      angle = 16.7;
	  time = 9;
	  skillTime = 6;
    } else {
      angle = 12.5;
	  time = 12;
	  skillTime = 8;
    }
	
	if (!$gameSwitches.value(17)) {
	rotation = -135;
	trailRotation = -90;
	scaleXY = [-weaponScale,weaponScale];
	var Anchor = [1,1];
	} else {
	rotation = 135;	
	trailRotation = 90;
	angle = -angle; 
	scaleXY = [weaponScale,weaponScale];
	var Anchor = [1,1];
	}
	
    if ($gameParty.leader().hasSkill(55)) {
		zz = "MF_BR";
		Talpha = 0.1;
	} else {
		zz = "E";
		Talpha = 0.75;
	}
		
	// 展示武器演出
    QJ.MPMZ.Shoot({
        img:weaponImage,
		groupName:['meleeAttack','playerSkill'],
        position:[['P'],['P']],
        initialRotation:['PD',rotation],
        scale:scaleXY,
        moveType:['D',true],
        imgRotation:['R',angle,true],
        anchor:Anchor,
        existData:[
            {t:['Time',time],d:[0,10]}           
        ],
        z:zz,
		collisionBox:['C',1],
    });

	// 安卓版刀光会报错
	let TrailEffect = [];

    if (!Utils.isMobileDevice()) {
        TrailEffect = [{
            img:['L',0.5,1,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:6,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true,
        }];
    }

	//武器伤害判定宽度
	let hitBoxWidth = 8;
	if (wid === 42)  hitBoxWidth = 30;
	
	// 实际武器碰撞体判定
    var realBullet = QJ.MPMZ.Shoot({
		groupName:['meleeAttack','playerSkill'],
        img:weaponTrail,
        position:[['P'],['P']],
        initialRotation:['PD',trailRotation],
        scale:[weaponScale,weaponScale],
        moveType:['D',true],
		opacity:0,
        imgRotation:['R',angle,true],
        anchor:[0.5,0.95],
        existData:[
            {t:['Time',time],a:['F',QJ.MPMZ.tl.meleeAttackSettlement]},
			{t:['G',['"enemy"','"object"']],a:['S',"this._effectiveHit = true"],p:[-1,false,true]},
            {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[Math.floor(weaponDamage),{allowAssassination:true}]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
        z:"E",
		collisionBox:['R',hitBoxWidth,64],
        judgeAccuracyRotation:5,		
        trailEffect:TrailEffect,		
    });	

	//日轮-陨石术
	if ($gameParty.leader().hasSkill(57)) {
        let baseValue = 300;
        let luk = $gameParty.leader().luk;
        luk = Math.max(0, Math.min(600, luk));
        let adjustedValue = baseValue + (luk / 660) * 660;
        if (Math.randomInt(1001) < adjustedValue) {
	    $gameParty.leader().equips()[0].durability -= 40;	
		realBullet.addMoveData("JS",[skillTime,999,'QJ.MPMZ.tl.ex_meteorStrike.call(this)']);
		}
	}

	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		realBullet.addMoveData("JS",[skillTime,999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this)']);
	}

	//暴风兽人斧-剑刃风暴
	if ($gameParty.leader().hasSkill(56)) {
		realBullet.addMoveData("JS",[skillTime,999,'QJ.MPMZ.tl.ex_skillBladestorm.call($gamePlayer)']);
	}

	//柳叶剑特效
	if (wid === 80) {
		realBullet.addMoveData("F",[skillTime,999,QJ.MPMZ.tl.ex_willowLeafEffects,["meleeAttack"]]);
	}
	
	//多次攻击次数-燕返斩
	if ($gameParty.leader().hasSkill(99)) {
		var tsubameGaeshi = $gameParty.leader().skillMasteryLevel(99);
		 var tsubameGaeshiTime = time;
		  for (var i = 1; i <= tsubameGaeshi; i++) {
			tsubameGaeshiTime = Math.round(tsubameGaeshiTime / 2);
		    realBullet.addMoveData("JS",[tsubameGaeshiTime,999,'QJ.MPMZ.tl.meleeAttackTsubameGaeshi.call(this)']);
	    }
	}
	
};

//普通攻击结束结算
QJ.MPMZ.tl.meleeAttackSettlement = function() {
    
	// 剑术修行: 空挥
     if (!this._effectiveHit && $gameParty.leader().hasSkill(26)) {
		 
	  let value = Math.floor(1 * $gameParty.leader().pdr); 
	  $gameParty.leader().gainSkillMasteryUses(26, value);
     const uses = $gameParty.leader().skillMasteryUses(26);
     const masteryTable = [4, 15, 50, 150, 500, 1600, 4800, 12000, 24000, 36000];
     let newLevel = 0; 
     for (let i = 0; i < masteryTable.length; i++) {
       if (uses >= masteryTable[i]) {
           newLevel = i + 1;
         } else {
           break;
         }
     }
        $gameParty.leader().setSkillMasteryLevel(26, newLevel);
		$gameParty.leader().setSkillMasteryUses(26, uses);
		$gamePlayer._directionFix = false;
   }
};

// 忍者技能-背刺熟练度变化
QJ.MPMZ.tl.backstabProficiencyChange = function() {
	
	$gameParty.leader().gainSkillMasteryUses(11, 1);
	const uses = $gameParty.leader().skillMasteryUses(11);
	const masteryTable = [5, 27, 60, 120, 256, 530, 960, 1587, 2452, 3600];
    let newLevel = 1; 
     for (let i = 0; i < masteryTable.length; i++) {
       if (uses >= masteryTable[i]) {
           newLevel = i + 2;
         } else {
           break;
         }
     }
        $gameParty.leader().setSkillMasteryLevel(11, newLevel);
		$gameParty.leader().setSkillMasteryUses(11, uses);
};

// 玩家技能等级显示
QJ.MPMZ.tl.playerSkillLevelDisplay = function(skillId) {
	
	let level = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][
    $gameActors.actor(1).skillMasteryLevel(skillId).clamp(0,11)
    ];
    return level
};

//闪步太刀-准备动作
QJ.MPMZ.tl.ex_senpoTachi = function() {
	//$gameScreen._particle.particleSet(0,'aura_bp2','player');
	//$gameScreen._particle.particleGroupSet(0,'weapon_b1','player');
	
	if($gameParty.leader()._characterName !== "$player") return;
	if($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
	if(!$gameParty.leader().equips()[0]) return;
	let weaponType = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].wtypeId;
	let staffType = [1,2];
	if (!staffType.includes(weaponType)) return;
		
	var se = { name: "剣を鞘にしまう", volume: 60, pitch: 100, pan: 0 };
    AudioManager.playSe(se);		
	
	$gameSystem._drill_PAlM_enabled = false;
	$gamePlayer.drill_EASe_stopAct();
	$gamePlayer.drill_EASe_setSimpleStateNode( ["闪步太刀准备"] );
	
	var zz;
    if ($gameParty.leader().hasSkill(55)) {
		zz = "MF_BR";
	} else {
		zz = "E";

	}
	
    var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
	var weaponScale = $gameParty.leader().pdr;
	var Tachi = QJ.MPMZ.Shoot({
        img:weaponImage,
		groupName:['playerSkill','senpoTachi'],
        position:[['P'],['P']],
        initialRotation:['S',45],
        moveType:['D',true],
		opacity:1,
		scale:weaponScale,
        imgRotation:['F'],
        anchor:[0.5,0.7],
        existData:[
            {t:['S','!TouchInput.drill_isRightPressed()',true],a:['F',QJ.MPMZ.tl.ex_senpoTachiRelease],c:['S','this.time > 30']},  
            //{t:['P'],a:['C',269,[weaponDamage,0,0,0]],p:[-1,false,true]}
        ],
        z:zz,
		collisionBox:['R',8,64],
		moveF:[
		[60,60,QJ.MPMZ.tl.ex_senpoTachiCharge],
		],	
		deadF:[[QJ.MPMZ.tl.ex_senpoTachiEffects]]
    });	
};
//闪步太刀-蓄力中
QJ.MPMZ.tl.ex_senpoTachiCharge = function() {
	
	this._chargeCounter = this._chargeCounter || 0; 
	
	if(this._chargeCounter < 999 ) {
	$gameScreen._particle.particleGroupSet(0,'weapon_b1','player');	
	var se = { name: "Up4", volume: 20, pitch: 120, pan: 0 };
    AudioManager.playSe(se);	
	this._chargeCounter = this._chargeCounter || 0;
	this._chargeCounter += 150;
	this._chargeCounter = Math.min(1000,this._chargeCounter);	
	this._chargeTone = Math.floor(Math.min(250,this._chargeCounter/4));
    this.changeAttribute("tone",[this._chargeTone,0,0,0]);		
	} else if (!this._charged && this._chargeCounter > 999){		
	var se = { name: "Skill2", volume: 60, pitch: 100, pan: 0 };
    AudioManager.playSe(se);			
	this._charged = true;	
	this._chargeCounter = 1000;
	var data = $gameScreen._particle.particleSet(0,'aura_bp2','player');
	$gameScreen._particle.particleUpdate(['aura_bp2','pos','0','-12']);
	$gameScreen._particle.particleUpdate(['aura_bp2','color','#ff4665']);
	data.clear = true;
	}
	
	
};
//闪步太刀-释放
QJ.MPMZ.tl.ex_senpoTachiRelease = function() {
	
	if($gameParty.leader()._characterName !== "$player") return;
	if(!$gameParty.leader().equips()[0]) return;
	let weaponType = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].wtypeId;
	let staffType = [1,2];
	if (!staffType.includes(weaponType)) return;	
	
	$gameSystem._drill_PAlM_enabled = true;
	$gameParty.leader().addState(80);
	
	var se = { name: "剣を抜く", volume: 80, pitch: 100, pan: 0 };
    AudioManager.playSe(se);	
	
	var character = $gamePlayer;
	if (!$gameSwitches.value(191)) {
    var r = 255;
    var g = 150;
    var b = 0;
    var color = [r, g, b, 255];
	} else {
    var r = 50;
    var g = 140;
    var b = 200;
    var color = [r, g, b, 255];
	}
	
    //检测移动方向
	let mouseX = TouchInput.x / $gameScreen.zoomScale();
	let mouseY = TouchInput.y / $gameScreen.zoomScale();
	let ax = character.centerRealX();
    let ay = character.centerRealY();
    let bx = (mouseX / 48) + $gameMap.displayX();
    let by = (mouseY / 48) + $gameMap.displayY();
	let deg = QJ.calculateAngleByTwoPointAngle(ax, ay, bx, by);
	
	character.drill_EASe_stopAct();
	let direction;
	let angle;
	let speed;
	if (deg > 180) {
	character.drill_EASe_setAct( ["闪步太刀-左"] );
	direction = 1;
	angle = 60;
	speed = 28.3;
	} else {
	character.drill_EASe_setAct( ["闪步太刀-右"] );
	direction = 2;
	angle = 300;
	speed = -28.3;
	}
	character.drill_EASA_setEnabled( true );
	var posX = "$gamePlayer.screenBoxXShowQJ() - 10";
	var posY = "$gamePlayer.screenBoxYShowQJ() + 8";	
	var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
	var weaponScale = $gameParty.leader().pdr;
	var knockUp = 0;
	var knockUpHight = 0;
	//蓄力的情况
	if (this && this._chargeCounter) {
	var extraDamage = $gameParty.leader().equips()[0].params[2];
	extraDamage *= (1.02 ** (this._chargeCounter / 10)) - 1;
	weaponDamage += Math.floor(extraDamage);
	knockUp = 20;
	knockUpHight = Math.floor(this._chargeCounter / 2);
	}
	
    var zz,Talpha;
    if ($gameParty.leader().hasSkill(55)) {
		zz = "MF_UR";
		Talpha = 0.1;
	} else {
		zz = "W";
		Talpha = 0.75;
	}
    // 安卓版刀光会报错
	let TrailEffect = [];
    if (!Utils.isMobileDevice()) {
        TrailEffect = [{
            img:['L',0.5,72,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:20,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }];
    }
	
 	var Tachi = QJ.MPMZ.Shoot({
		groupName:['senpoTach','playerSkill'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',angle],
        moveType:['D',true],
		opacity:'0|1~10|1~14/0',
		scale:weaponScale,
		extra:direction,
        imgRotation:['R',speed,true],
		judgeAccuracyAnchor:0.04,
        anchor:[0.5,0.8],
        existData:[
            {t:['Time',24]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{fullPower:true}]],p:[-1,false,true]},
            {t:['G',['"enemy"','"object"']],a:['C',148,[0,knockUp,knockUpHight,0]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
        z:zz,
		collisionBox:['R',8,64],
        trailEffect:TrailEffect,
		moveF:[
		   [1,0,QJ.MPMZ.tl.ex_senpoTachiFix],
		   [0,2,QJ.MPMZ.tl.ex_senpoResidualEffect,[-1,color]]
		],
        deadJS:["$gameParty.leader().removeState(80);$gameSystem._drill_PAlM_enabled = true;"]		
    });	
	
			//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		Tachi.addMoveData("F",[5,5,QJ.MPMZ.tl.ex_willowLeafEffects,["meleeAttack"]]);
	}

	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		let swordEnergyAttackScale = 0.75 * $gameParty.leader().pdr;
		if (this && this._chargeCounter && this._chargeCounter > 0) {
			swordEnergyAttackScale += this._chargeCounter / 500;
		}
		let swordEnergyAttackCode = 'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this,' + swordEnergyAttackScale + ')';
		Tachi.addMoveData("JS",[5,999,swordEnergyAttackCode]);
	}	

	//日轮-陨石术
	if ($gameParty.leader().hasSkill(57)) {
	    const playerX = $gamePlayer.screenBoxXShowQJ();
	    const playerY = $gamePlayer.screenBoxYShowQJ();
	    $gameParty.leader().equips()[0].durability -= 40;	
        Tachi.addMoveData("JS",[20,999,`QJ.MPMZ.tl.ex_meteorStrike.call(this,${playerX},${playerY})`]);		
	}
	
	//剑圣-免许皆传
	if ($gameParty.leader().hasSkill(100)) {	
    QJ.MPMZ.Shoot({
		groupName:['senpoTach','playerSkill'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',angle],
        moveType:['D',true],
		opacity:0,
		scale:weaponScale*3,
        imgRotation:['R',speed,true],
		judgeAccuracyAnchor:0.04,
        anchor:[0.5,0.8],
        existData:[
            {t:['Time',24]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{fullPower:true}]],p:[-1,false,true]},
            {t:['G',['"enemy"','"object"']],a:['C',148,[0,knockUp,knockUpHight,0]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
        z:"MF_UR",
		collisionBox:['R',8,64],
        trailEffect:TrailEffect,	
		moveF:[
		[1,0,QJ.MPMZ.tl.ex_senpoTachiFix],
		],		
    });	
   }	

};

//闪步太刀特效
QJ.MPMZ.tl.ex_senpoTachiEffects = function() {
	if(this.time < 30){
		return;
	}
	QJ.MPMZ.deleteProjectile('senpoTachEffects');
	 var extraCount = 0;
	 
	 if(!this._charged) {
		extraCount += Math.floor(this.time / 90);
	 } else {
		extraCount += 3; 
	 }
      extraCount += $gameMap.getAttackExtraCount();

	 if (extraCount > 0) {
	  var time = extraCount * 40;
	  var effects = QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['senpoTachEffects'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',1],
        moveType:['D',false],
        existData:[	
		  {t:['Time',time]},
        ],
		moveF:[
		[37,30,QJ.MPMZ.tl.ex_senpoTachiEffectsCheck],
		],
    });
  }
	
};
//闪步太刀特效检查
QJ.MPMZ.tl.ex_senpoTachiEffectsCheck = function() {

	if( TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered()){
		QJ.MPMZ.deleteProjectile('senpoTach');
		QJ.MPMZ.deleteProjectile('meleeAttack');
		QJ.MPMZ.tl.ex_senpoTachiRelease();
	   }
	
}
//闪步太刀演出矫正
QJ.MPMZ.tl.ex_senpoTachiFix = function() {

	let newAnchorX = this.anchorX;
	let newAnchorY = this.anchorY;
	if (this.data.extra && this.data.extra < 2) {
	    
    if(this.anchorY <1.0) {
		newAnchorX = this.anchorX - 0.03;
	    newAnchorY = this.anchorY + 0.022;
	}
	if (this.rotationImg > 270 || this.rotationImg <= 40) {
		    if ($gameParty.leader().hasSkill(55)) {
			this.changeAttribute("z","MF_BR");
		} else {
			this.changeAttribute("z","E");
		}
	} else {
		    if ($gameParty.leader().hasSkill(55)) {
			this.changeAttribute("z","MF_UR");
		} else {
			this.changeAttribute("z","W");
		}
	}

    if (this.rotationImg > 390) {
		this.changeAttribute("imgRotation",['S',40]);
	}	
	
	} else { //分歧

	     
    if(this.anchorY <1.1) {
		 newAnchorX = this.anchorX - 0.03;	
		 newAnchorY = this.anchorY + 0.022;
	}
	if (this.rotationImg > 90) {
		    if ($gameParty.leader().hasSkill(55)) {
			this.changeAttribute("z","MF_UR");
		} else {
			this.changeAttribute("z","W");
		}
	} else {
		    if ($gameParty.leader().hasSkill(55)) {
			this.changeAttribute("z","MF_BR");
		} else {
			this.changeAttribute("z","E");
		}
	}

    if (this.rotationImg < -30) {
		this.changeAttribute("imgRotation",['S',-40]);
	}		
	
	}
	this.changeAttribute("anchor",[newAnchorX,newAnchorY]);
   
    this.y = $gamePlayer.centerRealY() * 48;
	if (this.data.extra && this.data.extra < 2) {
	this.x = $gamePlayer.centerRealX() * 48 - 10;
	} else {
	this.x = $gamePlayer.centerRealX() * 48;	
	}


    if (this.time > 14) {
		$gameParty.leader().removeState(80);
		//$gameSystem._drill_PAlM_enabled = false;
	}	
};	


//旋风斩演出
QJ.MPMZ.tl.ex_senpuuGiri = function(GamepadsAttack,Tsubame = false) {
	
	let weapon = $gameParty.leader().equips()[0];
	
	if (!weapon) return;
	if (!Tsubame) {
    if ($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
    $gameSwitches.setValue(14, true);
    $gameSwitches.setValue(181, true);
    $gameParty.leader().addState(62);
    $dataMap.disableDashing = true;
	
	if ($gamePlayer._drill_EASe_controller !== undefined) {
	  var curSpeed = 1 + $gameParty.leader().cnt;
      $gamePlayer.drill_EASe_setStateNode("旋风斩");
	  $gamePlayer._drill_EASe_controller._drill_curSpeed = Math.round(curSpeed);
	  }
	} else {
	  var curSpeed = 1 + $gameParty.leader().cnt;
	}
	var wid = weapon.baseItemId;
    var weaponImage = "weapon/weapon" + wid;
    var weaponScale = $gameParty.leader().pdr;

    var Phase1 = Math.round(64 / curSpeed);
    var Phase2 = Math.round(120 / curSpeed);
	var Phase3 = Math.round(168 / curSpeed);
	var Phase4 = Math.round(200 / curSpeed);
	var Phase5 = Math.round(224 / curSpeed);
	var PhaseMax = Phase5 - Phase4;

    var rotationTrajectory = `${Phase1}|${5.625*curSpeed}~${Phase2-Phase1}|${6.428*curSpeed}~${Phase3-Phase2}|${7.5*curSpeed}~${Phase4-Phase3}|${9*curSpeed}~${Phase5-Phase4}|${11.25*curSpeed}~99999|${15*curSpeed}`;

    var hueValue,Opacity,SubBullet,zz;
	if (Tsubame) {
		hueValue = 180;
		Opacity = 0.25;
		zz = "MF_BG";
		SubBullet:true;
	} else {
		hueValue = 0;
		Opacity = 1;
		zz = "E";
		SubBullet:false;
	}

    var senpuuGiri = QJ.MPMZ.Shoot({
        groupName: ['playerSkill', 'senpuuGiri'],
        img: weaponImage,
        position: [['P'], ['P']],
        initialRotation: ['S', -225],
        scale: [-weaponScale, weaponScale], // 动态缩放
        moveType: ['D', false],
        imgRotation: ['R', rotationTrajectory, true],
        anchor: [1.05, 1.05],
		opacity:Opacity,
		hue:hueValue,
		subBullet:SubBullet,
        existData: [
            { t: ['S', 'Fuku_Plugins.EventTremble.getRemainingCycles(-1) == 0', false] },
            { t: ['S', '$gameParty.leader().equips()[0] && $gameParty.leader().equips()[0].baseItemId == 4', true] },
            { t: ['S', '$gameMap.regionId(Math.floor($gamePlayer.centerRealX()), Math.floor($gamePlayer.centerRealY())) === 8', true] },
			{ t: ['B', 'throwImmediately'],a: ['F', QJ.MPMZ.tl.ex_senpuuGiriThrow, [GamepadsAttack,Tsubame,{throwImmediately:true}]]  }
        ],
        z: zz,
        collisionBox: ['C', 1],
        moveF: [
		    [2, 2, QJ.MPMZ.tl.ex_checkSenpuuGiriAlignment,[GamepadsAttack,Tsubame]],
            [Phase1, 99999, QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect,[1,Tsubame]],
            [Phase2, 99999, QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect,[2,Tsubame]],
            [Phase3, 99999, QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect,[3,Tsubame]],
            [Phase4, 99999, QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect,[4,Tsubame]],
            [Phase5, PhaseMax, QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect,[5,Tsubame]]
        ],
        deadF: [
            [QJ.MPMZ.tl.ex_senpuuGiriFinishAction, [GamepadsAttack,Tsubame]]
        ]
    });

    // 读取操作模式
    if (GamepadsAttack && GamepadsAttack === 'Gamepad') {
        var AnyPadReleased =
            "Input.drill_isPadPressed('右摇杆上') || " +
            "Input.drill_isPadPressed('右摇杆下') || " +
            "Input.drill_isPadPressed('右摇杆左') || " +
            "Input.drill_isPadPressed('右摇杆右')";
        senpuuGiri.addExistData({
            t: ['S', AnyPadReleased, false],
            a: ['F', QJ.MPMZ.tl.ex_senpuuGiriThrow, [GamepadsAttack,Tsubame]]
        });
    } else {
		if (!Utils.isMobileDevice()) {
        senpuuGiri.addExistData({
            t: ['S', '!TouchInput.drill_isRightPressed() || !$gameParty.leader().equips()[0]', true],
            a: ['F', QJ.MPMZ.tl.ex_senpuuGiriThrow, [false,Tsubame]]
        });
	  } else {
        senpuuGiri.addExistData({
            t: ['S', '!TouchInput.drill_isLeftPressed() || !$gameParty.leader().equips()[0]', true],
            a: ['F', QJ.MPMZ.tl.ex_senpuuGiriThrow, [GamepadsAttack,Tsubame]]
        });		  
	  }
    }

	// 接住回旋镖的场合，立即投掷
    if ($gameParty.leader().hasSkill(70)) {
	  if ($gameMap.getGroupBulletListQJ('throwImmediately').length > 0) {
		senpuuGiri._throwImmediately = true;  
		senpuuGiri.addExistData({
		   t: ['Time', 1],
           a: ['F', QJ.MPMZ.tl.ex_senpuuGiriThrow, [GamepadsAttack,Tsubame,{throwImmediately:true}]]		   
		 });
	   }
	}

    // 柳叶剑特效
    if (weapon.baseItemId === 80) {
        senpuuGiri.addMoveData("F", [10, 10, QJ.MPMZ.tl.ex_willowLeafEffects, ["senpuuGiri",Tsubame]]);
    }
    // 香蕉大剑特效
    if (!Tsubame && weapon.baseItemId === 60) {
        senpuuGiri.addMoveData("F", [Phase4, 60, QJ.MPMZ.tl.ex_activateBananaGrenade, ["senpuuGiri"]]);
    }
    // 多次攻击次数 - 燕返斩
    if (!Tsubame && $gameParty.leader().hasSkill(99)) {
        var tsubameGaeshi = $gameParty.leader().skillMasteryLevel(99);
        var tsubameGaeshiTime = 2;
        for (var i = 1; i <= tsubameGaeshi; i++) {
            tsubameGaeshiTime += 4;
            senpuuGiri.addMoveData("F", [tsubameGaeshiTime, 99999, QJ.MPMZ.tl.ex_senpuuGiri, [GamepadsAttack,true]]);
        }
    }
	
	// hitbox生成
    weaponImage = "weapon/weaponTrail" + wid;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
    var Talpha,TrailEffect;
	
    if ($gameParty.leader().hasSkill(55)) {
		Talpha = 0.1;
	} else {
		Talpha = 0.75;
	}
	
	if (!Tsubame && !Utils.isMobileDevice()) {
		TrailEffect = [{
            img:['L',0.5,1,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }];
	} else {
	    TrailEffect = [];
	}
	
	// 安卓版刀光会报错
    if (Utils.isMobileDevice()) {
        TrailEffect = [];
    }
	
	//武器伤害判定宽度
	let hitBoxWidth = 8;
	if (wid === 42)  hitBoxWidth = 30;
	
    QJ.MPMZ.Shoot({
		groupName:['playerSkill','senpuuGiriTrail'],
        img:weaponImage,
        position:[['P'],['P']],
        initialRotation:['S',-180],
        scale:weaponScale,//动态缩放
        moveType: ['D', false],
		opacity:0,
        imgRotation:['R',rotationTrajectory,true],//剑的旋转，速度是动态的
        anchor:[0.5,1],
        existData:[
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{}]],p:[-1,false,true]},
            {t:['BE',senpuuGiri.index]},      
            {t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}			
        ],
        z:"E",
		collisionBox:['R',hitBoxWidth,64],
        judgeAccuracyRotation:10,
        trailEffect:TrailEffect,
    });	
};

//旋风斩加速过程效果
QJ.MPMZ.tl.ex_senpuuGiriAccelerationEffect = function(Phase,Tsubame) {
	
	if (!Tsubame) {
	   if (!$gameParty.leader().equips()[0]) return;
	   var wid = $gameParty.leader().equips()[0].baseItemId;
       var weapon = $dataWeapons[wid];

       var seNames = '剣の素振り（大剣を振る）'
       var randomPitch = Math.randomInt(40) + 110;
       AudioManager.playSe( { name: seNames, volume: 60, pitch: randomPitch, pan: 0 } );

      var speed = 1;	  
	  if (Phase) {
		  speed += 0.15 * Phase;	
      // 怪鸟的羽毛
      if (weapon.note && weapon.note.includes("<旋风斩加速>")) {
         speed += 0.35 * Phase;
	   }			  
	  }	    
     // 额外受到旋风斩攻速影响
	  if ($gamePlayer._drill_EASe_controller !== undefined) {
	    speed *= 1 + $gameParty.leader().cnt;
	  }
	   
	  speed = Math.round(speed * 35) / 100;
	  $dataStates[62].rateXParams[1] = speed;
	  $gameParty.refreshMembers();
	}
	  // 斩裂剑 - 斩剑波
	  if ($gameParty.leader().hasSkill(44)) {
		  QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1);
	  }
	  
	//日轮-陨石术
	if ($gameParty.leader().hasSkill(57)) {
        let baseValue = 450;
        let luk = $gameParty.leader().luk;
        luk = Math.max(0, Math.min(600, luk));
        let adjustedValue = baseValue + (luk / 550) * 550;
        if (Math.randomInt(1001) < adjustedValue) {
	    $gameParty.leader().equips()[0].durability -= 40;	
		QJ.MPMZ.tl.ex_meteorStrike.call(this);
	  }
	}
};

//旋风斩结束动作
QJ.MPMZ.tl.ex_senpuuGiriFinishAction = function(GamepadsAttack,Tsubame) {

    if (Tsubame) return;

	if ($gamePlayer._drill_EASe_controller !== undefined) {
	  $gamePlayer._drill_EASe_controller._drill_curSpeed = 1;
	}
   
   $gameSystem.addGameTimeEvent({ key: 'state11', delayMinutes: 10 });
   $gameParty.leader().addState(11);
   $gameParty.leader().removeState(62);
   $dataMap.disableDashing = false;
   let rotationSpeed = this.data.imgRotation[1].get();
   
   if (this._throwImmediately) {
	   rotationSpeed = Math.max(rotationSpeed,9);
   }
   
   $gameMap.steupCEQJ(163,1,{rotation:rotationSpeed});
         
};

//旋风斩Z轴适配
QJ.MPMZ.tl.ex_checkSenpuuGiriAlignment = function(GamepadsAttack,Tsubame) {
	
	if (Tsubame) return;
	
    var fullPower = 240;
	    fullPower = Math.round(fullPower / (1 + $gameParty.leader().cnt));

	if (this.time > fullPower && !this._fullPower) {
		this._fullPower = true;
		$gamePlayer.drill_EASe_setSimpleStateNode( ["旋转中(全速)"] );
	}
	
	var adjustedRotation = (this.rotationImg + 405) % 360;
	if (adjustedRotation <= 90 || adjustedRotation >= 270) {
		if ($gameParty.leader().hasSkill(55)) {
	      this.changeAttribute("z","MF_BR");
		} else {
		  this.changeAttribute("z","E");	
		}
	} else {
		if ($gameParty.leader().hasSkill(55)) {
	      this.changeAttribute("z","MF_UR");
		} else {
		  this.changeAttribute("z","W");
		}
	}	
};

//投掷出去的旋风斩
QJ.MPMZ.tl.ex_senpuuGiriThrow = function(GamepadsAttack,Tsubame,extraData = {}) {
	
	if (Tsubame) return;
	if(!$gameParty.leader().equips()[0]) return;
	let rotationSpeed = this.data.imgRotation[1].get();
	
	if (extraData.throwImmediately) {
	    rotationSpeed = 12;
	}
    if (rotationSpeed < 9) return;
	var BulletImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
	if (this.data.img != BulletImage ) return;
	
    let posX = this.inheritX();
    let posY = this.inheritY();
	rotationSpeed = Math.max(30,rotationSpeed*3);
	let throwSpeed = 4 + (rotationSpeed / 8);
    let zz,Talpha;
	
	$gameSystem.setBgsLine(9);
    AudioManager.playBgs({ name: "繰り返し風を切るほどの回転音", volume: 60, pitch: 100, pan: 0 });
    var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = this.scaleX;
	var weaponDamage = Math.floor(0.75 * chahuiUtil.getVarianceDamage(1));
	if ($gameParty.leader().hasSkill(38)) {
		weaponDamage = Math.floor(1.5 * weaponDamage);
	}

    if ($gameParty.leader().hasSkill(55)) {
		zz = "MF_BR";
		Talpha = 0.1;
	} else {
		zz = "E";
		Talpha = 0.75;
	}
	
	var iniRotation = ['M'];
	
    if (GamepadsAttack) {
		if (GamepadsAttack === 'Gamepad') {
	    iniRotation = ['S','QJ.MPMZ.tl.ex_gamepadsCheckDirection(true)'];
	  } else {
		iniRotation = ['S',"Input._pressAngle['ok']?Input._pressAngle['ok']:0"];
	  }
	} 
 	
    let time = 60 + this.time;
	time = Math.min(time,180);


	// 安卓版刀光会报错
	let TrailEffect = [];
    if (!Utils.isMobileDevice()) {
        TrailEffect = [{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
            hOrV:true
        }];
    }
	
    var senpuuGiriThrow = QJ.MPMZ.Shoot({
		groupName:['playerBullet','SenpuuGiri','weaponMarker'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:iniRotation,
        scale:weaponScale,
        imgRotation:['R',rotationSpeed,true],
        anchor:[0.5,0.5],
        existData:[
            {t:['R',[255]],a:['F',QJ.MPMZ.tl.ex_senpuuGiriHold,[this.time]],c:['S','this.time>10']},	
			{t:['Time',time],a:['S','AudioManager.fadeOutBgsByLine(1,9);$gameSwitches.setValue(182, false)']},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_senpuuGiriHold,[this.time]]},		
           // {t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_SSSSSS.call(this,target)'],p:[-1,true,true],c:['T',0,1,true]},				
        ],
		moveType:['S',throwSpeed],
		moveF:[
		],
        z:zz,
		collisionBox:['R',8,64],
        judgeAccuracyRotation:0,//判定精度，防止挥剑速度太快导致无法攻击到敌人
		judgeAccuracyMove:8,
		particles:[
            {img:weaponImage,
			scaleXMin:1,scaleXMax:1,
			intervalTime:-4,
			synScale:true,
			existTime:0,
			offsetMin:[0,0,0],
			offsetMax:[0,0,0],
			offset:[0,0,0],
			disappearScale:1,disappearTime:30,
			opacityMax:0.4,
			opacityMin:0.4,
			moveType:['0','0']}
          ],
        trailEffect:TrailEffect,
		deadJS:[
		  "if (this._destroyed) {AudioManager.stopBgsByLine(9)}"
		]
    });
	
	//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		senpuuGiriThrow.addMoveData("F",[5,5,QJ.MPMZ.tl.ex_willowLeafEffects,["senpuuGiriThrow",false]]);
	}

	//追踪效果
	if ($gameParty.leader().hasSkill(41)) {
		senpuuGiriThrow.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	}

	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		senpuuGiriThrow.addMoveData("JS",[10,10,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 2)']);
	}	
	
};

//旋风斩三段效果
QJ.MPMZ.tl.ex_senpuuGiriHold = function(chargeTime,args) {
	
	if(!$gameParty.leader().equips()[0]) {
	AudioManager.fadeOutBgsByLine(1,9);
	$gameSwitches.setValue(182, false);	
	return;
	}
	
	// 回旋镖
    if ($gameParty.leader().hasSkill(70)) {
    QJ.MPMZ.tl.ex_senpuuGiriReturnToPlayer.call(this,args);
	return;
	}
    // 巨大蟹钳	
	if ($gameParty.leader().equips()[0].baseItemId === 14) {
	   AudioManager.fadeOutBgsByLine(1,9);
	   $gameSwitches.setValue(182, false);	
	   QJ.MPMZ.tl.ex_giantCrabClawGrabsEnemy.call(this,args);
	   return;
	}
	
    let posX = this.inheritX();
    let posY = this.inheritY();
    let angle = this.inheritRotation();
	let zz,Talpha;
    let weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
    let weaponScale = this.scaleX;
	let weaponDamage = Math.round(0.5 * chahuiUtil.getVarianceDamage(1));	
	if ($gameParty.leader().hasSkill(38)) {
		weaponDamage = Math.floor(1.5 * weaponDamage);
	}
	let time = 30;
	if (chargeTime && chargeTime > 30) {
	    time += Math.min(Math.round(chargeTime/6),150);
	}
	if ($gameParty.leader().hasSkill(41)) {
		time += 120;
	}
	$gameSwitches.setValue(182, true);
	
    if ($gameParty.leader().hasSkill(55)) {
		zz = "MF_BR";
		Talpha = 0.1;
	} else {
		zz = "E";
		Talpha = 0.75;
	}	

	// 安卓版刀光会报错
	let TrailEffect = [];
    if (!Utils.isMobileDevice()) {
        TrailEffect = [{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
            hOrV:true
        }];
    }
	
    var senpuuGiriHold = QJ.MPMZ.Shoot({
		groupName:['playerBullet','SenpuuGiri','weaponMarker'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['M'],
		imgRotation:['S',angle],
        scale:weaponScale,
        imgRotation:['R',36,true],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',time]},
			{t:['S',"!$gameParty.leader().equips()[0]",true]},
			//{t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]],p:[-1,true,true]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{}]],p:[-1,false,true]},
        ],
		moveType:['S',0],
        z:zz,
		collisionBox:['R',8,64],
        judgeAccuracyRotation:12,//判定精度，防止挥剑速度太快导致无法攻击到敌人
		moveF:[
		],
        trailEffect:TrailEffect,
		deadJS:["AudioManager.fadeOutBgsByLine(1,9);$gameSwitches.setValue(182, false);"]
    });

	//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		senpuuGiriHold.addMoveData("F",[5,5,QJ.MPMZ.tl.ex_willowLeafEffects,["senpuuGiriHold"]]);
	}

	//追踪效果
	if ($gameParty.leader().hasSkill(41)) {
		senpuuGiriHold.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	}
	
};

//旋风斩结束效果
QJ.MPMZ.tl.ex_senpuuGiriFinishEffect = function() {
	AudioManager.fadeOutBgsByLine(1,9);
	$gameSwitches.setValue(182, false);
};

//=============================================================================
//玩家异常状态
//=============================================================================


//玩家中毒
QJ.MPMZ.tl.ex_playerPoison = function(damage,time) {
    if (!damage) var damage = 1;
    if (!time) var time = 4;

  if ($gameSystem.hasGameTimeEvent("state5")) {
	  $gameParty.leader().addState(5);
	  time = Math.floor(time / 2);
      $gameSystem.adjustGameTimeEventDelay('state5', time, true);
    } else {
	  $gameParty.leader().addState(5);
      $gameSystem.addGameTimeEvent({
        key: 'state5',
        command: 'remove',
        delayMinutes: time,
        target: 5, 
        condition: 'true' 
      });		  
  }

    if($gameMap.getGroupBulletListQJ('playerPoison').length > 0){
       let BID = $gameMap.getGroupBulletListQJ('playerPoison')[0];
	   let bullet = $gameMap._mapBulletsQJ[BID];
	      if(!bullet) return;
	       bullet._extraDamage = bullet._extraDamage || 0;
		   bullet._extraDamage += damage;
    } else {	
       var Poison = QJ.MPMZ.Shoot({
         groupName:['playerPoison','poison','Status'],
         img:"poison[6,10,1]",
         position:[['P'],['P']],
         initialRotation:['S',0],
         imgRotation:['F'],
         blendMode:1,
         scale:[0.4,0.4],
         moveType:['B',-1],
         collisionBox:['C',1],
         existData:[ 
              {t:['S','!$gameParty.leader().isStateAffected(5)',true],d:[0,30],c:['S','this.time>30']},
            ],
		 moveF:[
		      [60,60,QJ.MPMZ.tl.ex_playerPoisonEffect,[damage]]
		    ],
        });	
		
		//中毒时的全屏幕演出
		if (!Utils.isMobileDevice()) {
		let index = Poison.index;
        QJ.MPMZ.Shoot({
            groupName: ['playerPoisonEffect', ],
            img: "pipofm-fullscreeneffect_020[5,4,5]",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 3,
			immuneTimeStop:true,
            opacity: 1,
            scale: 0.75,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });
	   }		
		
     }
	 //获取异常状态的演出
	 QJ.MPMZ.tl.ex_effectFonts("zhongdu",-1);
};

//玩家中毒效果
QJ.MPMZ.tl.ex_playerPoisonEffect = function(damage) {
	
	if ($gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding) return;
	
    let randomPitch = Math.randomInt(30) + 91;
    AudioManager.playSe({ name: "Poison", volume: 40, pitch: randomPitch, pan: 0 });	
    if (!Utils.isMobileDevice())  $gamePlayer.requestAnimation(187);
    let finalDamage = damage;
	if (this._extraDamage) {
		finalDamage += this._extraDamage;
	 }
	    finalDamage *= 1 + (this.time / 600);
		finalDamage = Math.max(1,Math.floor(finalDamage));
	SimpleMapDamageQJ.put(3,-1,finalDamage,0,-72);	 
    $gameParty.leader().gainHp(-finalDamage);
   //重伤判定
    if( $gameParty.leader().hpRate() <= 0.2 ) {
	 $gameScreen.startShake(1, 8, 30);	
	 QJ.MPMZ.tl.ex_playerDamageFlash();
        }	
};

//打雷
QJ.MPMZ.tl.ex_playerElectrified = function(time) {

    $gameSwitches.setValue(14, true);
    if (!time) var time = 1;

    if ($gameSystem.hasGameTimeEvent("state7")) {
       // $gameParty.leader().addState(7);
       // $gameSystem.adjustGameTimeEventDelay('state7', time, true);
    } else {
        $gameParty.leader().addState(7);
        $gameSystem.addGameTimeEvent({
            key: 'state7',
            command: 'remove',
            delayMinutes: time,
            target: 7,
            condition: 'true'
        });
    }
	
    if ($gameMap.getGroupBulletListQJ('playerElectrified').length === 0) {

      // 电流音效
      var se = { name: "バチバチ（感電したような音）", volume: 70, pitch: 100, pan: 0 };
      AudioManager.playSe(se);	

    $gamePlayer.drill_EASe_stopAct();
	if (!$gameParty.leader().isStateAffected(9) && !$gameParty.leader().isStateAffected(67)) {
    $gamePlayer.drill_EASe_setSimpleStateNode(["被雷劈"]);
	}
	Fuku_Plugins.EventTremble.start(-1,1,8);
	
        var Electrified = QJ.MPMZ.Shoot({
            groupName: ['playerElectrified', 'electrified'],
            img: "paralysis[6,10,1]",
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 1,
            scale: 0.5,
            anchor: [0.5, 0.5],
            moveType: ['D', true],
            collisionBox: ['C', 48],
            existData: [
                { t: ['S', '!$gameParty.leader().isStateAffected(7)', true], a: [], c: ['S', 'this.time > 30'] },
                //{ t: ['B', ['enemyBullet']], a: ['F', QJ.MPMZ.tl.ex_FreezeBreak, [damage]], c: ['S', 'this.time > 30 && Math.random() > 0.8'] },
				//{t:['S','$gameParty.leader().isStateAffected(67)',true],a:[],p: [-1, false, true],c:['T',15,15,true]},	
            ],
            moveF: [
			  [20,20,QJ.MPMZ.tl.ex_playerElectrifiedEffect]
            ],
			deadJS:["$gamePlayer.drill_EASA_setEnabled(true);$gameSwitches.setValue(14, false);Fuku_Plugins.EventTremble.stop(-1)"]
        });
 		//打雷时的全屏幕演出
		if (!Utils.isMobileDevice()) {
		let index = Electrified.index;
        QJ.MPMZ.Shoot({
            groupName: ['playerElectrifiedEffect', ],
            img: "pipofm-fullscreeneffect_019[5,4,5]",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 3,
            opacity: 1,
            scale: 0.75,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });  
	  }		
    }	
	
};

//打雷中效果判定
QJ.MPMZ.tl.ex_playerElectrifiedEffect = function() {
	 this._count = this._count || 0;
	 this._count += 1;
	 if (this._count >= 5) { 
      // 电流音效
      var se = { name: "バチバチ（感電したような音）", volume: 70, pitch: 100, pan: 0 };
      AudioManager.playSe(se);	
	  this._count = 0;
	 }
	 
	  if ($gameParty.leader().isStateAffected(9) || $gameParty.leader().isStateAffected(67)) {
	  QJ.MPMZ.tl.ex_conductiveEffectOnWater.call(this);
	  }
};

//冰结
QJ.MPMZ.tl.ex_playerFreeze = function(time) {
    $gameSwitches.setValue(14, true);
    if (!time) var time = 5;

    if ($gameSystem.hasGameTimeEvent("state9")) {
        $gameParty.leader().addState(9);
        time = Math.floor(time / 2);
        $gameSystem.adjustGameTimeEventDelay('state9', time, true);
    } else {
        $gameParty.leader().addState(9);
        $gameSystem.addGameTimeEvent({
            key: 'state9',
            command: 'remove',
            delayMinutes: time,
            target: 9,
            condition: 'true'
        });
    }

    // 冻结音效
    var se = { name: "凍りつく時の効果音「キーーーン」", volume: 60, pitch: 100, pan: 0 };
    AudioManager.playSe(se);

    $gamePlayer.drill_EASe_stopAct();
	if (!$gameParty.leader().isStateAffected(67) && $gameParty.leader()._characterName !== "$player_swim") {
    $gamePlayer.drill_EASe_setSimpleStateNode(["被冻结"]);
	}
	
    if ($gameMap.getGroupBulletListQJ('playerFreeze').length > 0) {
        let index = $gameMap.getGroupBulletListQJ('playerFreeze')[0];
        QJ.MPMZ.Shoot({
            groupName: ['playerFreezeExa', 'freeze'],
            img: "Ice[8,6]",
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 3,
            opacity: 0.4,
            scale: 0.5,
            anchor: [0.45, 0.55],
            moveType: ['D', true],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });
    } else {
        let damage = Math.floor($gameParty.leader().mhp * 0.15);

        var Frozen = QJ.MPMZ.Shoot({
            groupName: ['playerFreeze', 'freeze'],
            img: "Ice[8,6]",
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 1,
            scale: [0.5, 0.5],
            anchor: [0.45, 0.55],
            moveType: ['B', -1],
            collisionBox: ['C', 48],
            existData: [
                { t: ['S', '!$gameParty.leader().isStateAffected(9)', true], a: ['F', QJ.MPMZ.tl.ex_playFreezeBreak, [0]], c: ['S', 'this.time > 30'] },
                { t: ['B', ['enemyBullet']], a: ['F', QJ.MPMZ.tl.ex_playFreezeBreak, [damage]], c: ['S', 'this.time > 30 && Math.random() > 0.8'] }
            ],
            moveF: [
                [30, 3, QJ.MPMZ.tl.ex_playerFrozenStruggle]
            ]
        });
		//冻结时的全屏幕演出
		if (!Utils.isMobileDevice()) {
		let index = Frozen.index;
        QJ.MPMZ.Shoot({
            groupName: ['playerFreezeEffect', ],
            img: "pipofm-fullscreeneffect_017[5,6,5]",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 3,
            opacity: 1,
            scale: 0.75,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });
	  }		
		
    }

    // 效果字演出
    QJ.MPMZ.tl.ex_effectFonts("bingjie", -1);
};

//被冻结时的挣扎行动
QJ.MPMZ.tl.ex_playerFrozenStruggle = function() {
	
    let triggered = Input.drill_isKeyTriggered('w') || 
                    Input.drill_isKeyTriggered('s') || 
                    Input.drill_isKeyTriggered('a') || 
                    Input.drill_isKeyTriggered('d');

    if (triggered && Math.random() > 0.3) {
        if (Fuku_Plugins.EventTremble.getRemainingCycles(-1) === 0) {
            Fuku_Plugins.EventTremble.start(-1, 2, 1, 4);

        if ($gameSystem.hasGameTimeEvent("state9")) {
            $gameSystem.adjustGameTimeEventDelay('state9', -1, true);
         }
       }
	}	
};

QJ.MPMZ.tl.ex_playFreezeBreak = function(damage,args) {
	 var se = { name: "氷系魔法を発動した効果音", volume: 65, pitch: 100, pan: 0 };
     AudioManager.playSe(se);	

    let posX = this.inheritX();
    let posY = this.inheritY();
	var magicScale = this.scaleX;
	
    QJ.MPMZ.Shoot({
        img:'IceBreak[8,4]',
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:magicScale,
        moveType:['S',0],
        imgRotation:['F'],
        anchor:[0.5,0.5],
		opacity:0.8,
		blendMode:1,
        existData:[	
		{t:['Time',31]},
        ],
        collisionBox:['C',1],
    });
	$gamePlayer.drill_EASA_setEnabled(true);
    if ($gameParty.leader()._characterName !== "$player_swim") {
	  let character = $gamePlayer;
      character._drill_JSp['enabled'] = true;
      character._drill_JSp['height'] = 64;
      character._drill_JSp['time'] = 45;
      character._drill_JSp['speed'] = -1;	
      $gamePlayer.jump(0,0);
	 }
	$gameSwitches.setValue(14, false);
  
	if (damage && typeof damage === 'number' && damage > 0) {
		QJ.MPMZ.tl.ex_playerDamageCheck(damage,2);
	}
	
};

//玩家出血
QJ.MPMZ.tl.ex_playerBleeding = function(damage,time) {

    if (!damage) var damage = 1;
    if (!time) var time = 4;

  if ($gameSystem.hasGameTimeEvent("state6")) {
	  $gameParty.leader().addState(6);
	  time = Math.floor(time / 2);
      $gameSystem.adjustGameTimeEventDelay('state6', time, true);
    } else {
	  $gameParty.leader().addState(6);
      $gameSystem.addGameTimeEvent({
        key: 'state6',
        command: 'remove',
        delayMinutes: time,
        target: 6, 
        condition: 'true' 
      });		  
  }
  


    if($gameMap.getGroupBulletListQJ('playerBleeding').length > 0){
       let BID = $gameMap.getGroupBulletListQJ('playerBleeding')[0];
	   let bullet = $gameMap._mapBulletsQJ[BID];
	      if(!bullet) return;
	       bullet._extraDamage = bullet._extraDamage || 0;
		   bullet._extraDamage += damage;
    } else {	
      var Bleeding = QJ.MPMZ.Shoot({
         groupName:['playerBleeding','bleeding','Status'],
         img:"Bleeding[6,10,1]",
         position:[['P'],['P']],
         initialRotation:['S',0],
         imgRotation:['F'],
         blendMode:1,
         scale:[0.4,0.4],
         moveType:['B',-1],
         collisionBox:['C',1],
         existData:[ 
              {t:['S','!$gameParty.leader().isStateAffected(6)',true],d:[0,30],c:['S','this.time>30']},
            ],
		 moveF:[
		      [60,60,QJ.MPMZ.tl.ex_playerBleedingEffect,[damage]]
		    ],
        });	
		
		//出血时的全屏幕演出
		if (!Utils.isMobileDevice()) {
		let index = Bleeding.index;
        QJ.MPMZ.Shoot({
            groupName: ['playerBleedingEffect', ],
            img: "pipofm-fullscreeneffect_024[5,6,5]",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 0,
            opacity: 0.8,
            scale: 0.75,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });				
	   }
     }
	 //获取异常状态的演出
	 QJ.MPMZ.tl.ex_effectFonts("xueyan", -1);
};

//玩家出血效果
QJ.MPMZ.tl.ex_playerBleedingEffect = function(damage) {
	
	if ($gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding) return;
	if (!Utils.isMobileDevice())  $gamePlayer.requestAnimation(186);
    let randomPitch = Math.randomInt(30) + 91;
    AudioManager.playSe({ name: "血がたれる1", volume: 90, pitch: randomPitch, pan: 0 });	

    let finalDamage = damage;
	if (this._extraDamage) {
		finalDamage += this._extraDamage;
	 }
	    finalDamage += 0.005 * $gameParty.leader().mhp;
		// 结算玩家的出血抵抗
		if ($gameParty.leader().hasSkill(53)) {
		    finalDamage *= 0.7 ** $gameParty.leader().skillMasteryLevel(53);
	     }	
		
	finalDamage = Math.max(1,Math.floor(finalDamage));
	SimpleMapDamageQJ.put(2,-1,finalDamage,0,-64);	 
    $gameParty.leader().gainHp(-finalDamage);
   //重伤判定
    if( $gameParty.leader().hpRate() <= 0.2 ) {
	 $gameScreen.startShake(1, 8, 30);	
	 QJ.MPMZ.tl.ex_playerDamageFlash();
        }	
};

//玩家炎上
QJ.MPMZ.tl.ex_playerBurning = function(damage,time) {

    if (!damage) var damage = 1;
    if (!time) var time = 4;

  if ($gameSystem.hasGameTimeEvent("state8")) {
	  $gameParty.leader().addState(8);
	  time = Math.floor(time / 2);
      $gameSystem.adjustGameTimeEventDelay('state8', time, true);
    } else {
	  $gameParty.leader().addState(8);
      $gameSystem.addGameTimeEvent({
        key: 'state8',
        command: 'remove',
        delayMinutes: time,
        target: 8, 
        condition: 'true' 
      });		  
  }
  


    if($gameMap.getGroupBulletListQJ('playerBurning').length > 0){
       let BID = $gameMap.getGroupBulletListQJ('playerBurning')[0];
	   let bullet = $gameMap._mapBulletsQJ[BID];
	      if(!bullet) return;
	       bullet._extraDamage = bullet._extraDamage || 0;
		   bullet._extraDamage += damage;
    } else {	
       var Burning = QJ.MPMZ.Shoot({
         groupName:['playerBurning','burning','Status'],
         img:"burn[6,10,1]",
         position:[['P'],['P']],
         initialRotation:['S',0],
         imgRotation:['F'],
         blendMode:1,
         scale:[0.4,0.4],
         moveType:['D',true],
         collisionBox:['C',80],
         existData:[ 
              {t:['S','!$gameParty.leader().isStateAffected(8)',true],d:[0,30],c:['S','this.time>30']},
			  {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_burningEffect,[damage]],p:[-1,true,true],c:['T',15,15,true]},
			  {t:['P'],a:['F',QJ.MPMZ.tl.ex_burningEffect,[damage]],p:[-1,true,true],c:['T',15,15,true]},		
              {t:['B',['freeze']],a:['S',"$gameSystem.triggerGameTimeEventNow('state8')"],d:[0,30],an:181,cb:['C',1]},
              {t:['S','$gameParty.leader().isStateAffected(67)',true],a:['S',"$gameSystem.triggerGameTimeEventNow('state8')"],d:[0,30],an:181},			  
            ],
		 deadF:[[QJ.MPMZ.tl.ex_playerBurningEndEffect]]
        });	
		
		//炎上时的全屏幕演出
		if (!Utils.isMobileDevice()) {
		let index = Burning.index;
        QJ.MPMZ.Shoot({
            groupName: ['playerBurningEffect', ],
            img: "pipofm-fullscreeneffect_016[5,4,5]",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 3,
            opacity: 1,
            scale: 0.75,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [{ t: ['BE', index] }]
        });			
	   }
     }
	 //获取异常状态的演出
	 	 QJ.MPMZ.tl.ex_effectFonts("yanshang", -1);
};

//玩家炎上结束效果
QJ.MPMZ.tl.ex_playerBurningEndEffect = function() {
	if (!$gameParty.leader().isStateAffected(8)) {
			//$gamePlayer.drill_EASe_stopAct();
	//$gamePlayer.drill_EASe_setSimpleStateNode( ["被烧焦"] );
var id = "Scorched";
var filterTarget = 3999;
$gameMap.createFilter(id, "adjustment", filterTarget);
$gameMap.setFilter( id ,[1,1,1,0.8,0.4,0.4,0.4,1]);
$gameMap.moveFilter(id, [1,1,1,1,1,1,1,1], 120);
$gameMap.eraseFilterAfterMove(id);		
$gameScreen._particle.particleSet(0,'smoke_c-P','player','smoke_c');	
$gameScreen._particle.particleUpdate(['smoke_c-P','pos',0,-20]);
$gameScreen._particle.reservePluginCommand(120,{},['clear', 'smoke_c-P'],0);
	}
};


//炎上效果
QJ.MPMZ.tl.ex_burningEffect = function(damage, args) {

    if (args.target && args.target instanceof Game_Player) {
        if (!Utils.isMobileDevice())  $gamePlayer.requestAnimation(188);
        let randomPitch = Math.randomInt(30) + 91;
        AudioManager.playSe({ name: "Fire2", volume: 30, pitch: randomPitch, pan: 0 });

        let finalDamage = damage;
        if (this._extraDamage) {
            finalDamage += this._extraDamage;
        }
        finalDamage = Math.max(1, Math.floor(finalDamage));
        SimpleMapDamageQJ.put(2, -1, finalDamage, 0, -64);
        $gameParty.leader().gainHp(-finalDamage);

        // 重伤判定
        if ($gameParty.leader().hpRate() <= 0.2) {
            $gameScreen.startShake(1, 8, 30);
            QJ.MPMZ.tl.ex_playerDamageFlash();
        }
        return;
    }

    if (args.target && args.target instanceof Game_Event) {
        let eventId = args.target._eventId;
        if (!Utils.isMobileDevice())  args.target.requestAnimation(188);
        let randomPitch = Math.randomInt(30) + 91;
        AudioManager.playSe({ name: "Fire2", volume: 30, pitch: randomPitch, pan: 0 });

        let finalDamage = damage;
        if (this._extraDamage) {
            finalDamage += this._extraDamage;
        }

        // 伤害计算
        let enemyDEF = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'DEF']);
        let enemyHP = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);

        finalDamage -= enemyDEF;
        finalDamage = Math.max(1, finalDamage);
        finalDamage = Math.min(99999999, finalDamage);
        finalDamage = Math.max(1, Math.floor(finalDamage));
        SimpleMapDamageQJ.put(2, eventId, finalDamage, 0, -64);

        // 伤害结算
        $gameSelfVariables.setValue([$gameMap.mapId(), eventId, 'HP'], enemyHP - finalDamage);

        // 显示血条变化
        args.target.showHpBar();

        // 死亡判断
        enemyHP = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);
        if (enemyHP <= 0) {
            $gameSelfSwitches.setValue([$gameMap.mapId(), eventId, 'D'], true);
            return;
        }
    }
};

//麻痹
QJ.MPMZ.tl.ex_playerParalysis = function(time) {

    $gameSwitches.setValue(14, true);
    if (!time) var time = 1;

    if ($gameSystem.hasGameTimeEvent("state11")) {
       // $gameParty.leader().addState(7);
       // $gameSystem.adjustGameTimeEventDelay('state7', time, true);
    } else {
        $gameParty.leader().addState(11);
        $gameSystem.addGameTimeEvent({
            key: 'state11',
            command: 'remove',
            delayMinutes: time,
            target: 11,
            condition: 'true'
        });
    }
	
    if ($gameMap.getGroupBulletListQJ('playerParalysis').length > 0) return;

    // 眩晕音效
    var seNames = "ヒヨコが頭の上を回る";
    var se = { name: seNames, volume: 100, pitch: 100, pan: 0 };
    AudioManager.playSe(se);

    $gamePlayer.drill_EASe_stopAct();
	if (!$gameParty.leader()._drill_EASA_enabled && !$gameParty.leader().isStateAffected(67)) {
    $gamePlayer.drill_EASe_setSimpleStateNode(["虚弱"]);
	}
        var paralysis = QJ.MPMZ.Shoot({
            groupName: ['playerParalysis', 'paralysis'],
            img: "dizzy[5,3,4]",
            position: [['P'], ['P']],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 1,
            scale: 0.5,
            anchor: [0.5, 0.7],
            moveType: ['D', true],
            collisionBox: ['C', 48],
            existData: [
                { t: ['S', '!$gameParty.leader().isStateAffected(11)', true], a: [], c: ['S', 'this.time > 30'] },
            ],
			deadJS:["$gamePlayer.drill_EASA_setEnabled(true);$gameSwitches.setValue(14, false)"]
        });	
};


//玩家穿越星之门
QJ.MPMZ.tl.ex_playerTravelsthroughStarGate = function() {
	
	//Zzy.TWF.ToTheWorld(true);
	
	
    var angle;
    switch ($gamePlayer.direction()) {
        case 2:  // 下
            angle = 90;
            break;
        case 4:  // 左
            angle = 180;
            break;
        case 6:  // 右
            angle = 0;
            break;
        case 8:  // 上
            angle = 270;
            break;
        default: 
            angle = 270;
            break;
    }
    $gamePlayer.drill_EFOE_playHidingMoveDisappear( 45,angle,24 );
		
	if (!this) return;
	let MHP = $gameSelfVariables.get(this, 'MHP');
	let HP = $gameSelfVariables.get(this, 'HP');
	let rate = HP / MHP;
	 if ( rate < 0.5 ) {
		$gameVariables.setValue(13, 3);
	 } else {
		$gameVariables.setValue(13, 3); 
	 }
	 
};

/*
var data = $gameSystem._drill_GFPT_dataTank[ 10 ];
var text = "\\str[41]妹 \n";
text += "\\{\\i[2]\\} ??? \n";
text += "\\py[-8]" + $dataStates[$gameActors.actor(2)._states[0]].description;
text += "\n\\fs[16]\\py[20]✦ドロップアイテム:  \n";
text += "\\fs[14]\\py[-10]" + $dataArmors[$gameActors.actor(2)._equips[1]._itemId].infoTextTop;
data['context'] = text;
$gameTemp._drill_GFPT_windowTank[ 10 ].drill_initMessage();
*/


//=============================================================================
//妹妹场景相关
//=============================================================================

//妹妹状态hud
QJ.MPMZ.tl._imoutoUtilStatesHud = function() {
	if ($gameSystem._drill_GFPT_dataTank[ 10 ]) {
var data = $gameSystem._drill_GFPT_dataTank[ 10 ];

   var text = "\\str[41]妹 \n";
   text += "\\fs[28]\\i[2]\\fr ??? ";
var stateList = $gameActors.actor(2).getStateCategoryAffectedList('imoutoState');
if (stateList.length > 0) {
    stateList.forEach(function(stateId) {
        text += "\n${$dataStates[" + stateId + "].description}";
		//text += "\n"+$dataStates[ stateId ].description;
    });
}

  text += "\n\\fs[16]\\py[20]✦ドロップアイテム:  \n";
  if ( $gameActors.actor(2).equips()[1] ) {
      text += "\\fs[14]\\py[-10]" + $dataArmors[$gameActors.actor(2)._equips[1]._itemId].infoTextTop;
  } else {
	  text += "\\fs[14]\\py[-10]" + $dataArmors[159].infoTextTop;
  }
//data['context'] = text;
$gameTemp._drill_GFPT_windowTank[ 10 ].drill_refreshMessage(text);
    }
};

//拳头武器攻击行为监听
QJ.MPMZ.tl.ex_punchAttackListener = function() {
	
	if(!$gameParty.leader().equips()[0]) return;
	if($gameMap.getGroupBulletListQJ('attackMonitoring').length > 0) return;
	
	let time = 10;
    if ($gameMap.getGroupBulletListQJ('weaponBroken').length > 0) {
		time = 70;
	}
	
	let type = "PC";
	if (Utils.isMobileDevice()) type = "Mobile";	
	
       QJ.MPMZ.Shoot({
            groupName: ['playerPunch','attackMonitoring'],
            img: "null1",
            position: [['P'], ['P']],
            initialRotation: ['S',0],
            moveType: ['B',-1],
			opacity:0,
			collisionBox:['C',1],
            existData: [
            ],          
            moveF: [
			  [time,0,QJ.MPMZ.tl.ex_playerLeftPunchAttack,[type]],
			  [time,120,QJ.MPMZ.tl.ex_PunchAttackEffectRefresh],
            ],
        });
	
};

QJ.MPMZ.tl.ex_PunchAttackEffectRefresh = function() {
	
    if(!$gameParty.leader().equips()[0]) return;	
	let weapon = $gameParty.leader().equips()[0];
	if(weapon.baseItemId !== 4) return;
	
	let bonus = Math.floor($gameParty.leader().mhp * 0.01);
	weapon.flatParams[2] = bonus;
	
};

//左拳普通攻击连打
QJ.MPMZ.tl.ex_playerLeftPunchAttack = function(type) {

	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 100;
	   return;
	}
   
  let triggered = false; 
  
  if (type && type === "Mobile") {
	  triggered = $gameSwitches.value(201);
  } else {
	  triggered = TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered();
  }
    if( triggered ) {
	  
    if (QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack")) return;
	if ($gameSystem.isMapSelectEquipOpen()) return;
	if ($gameParty.leader()._characterName !== "$player") return;
    
	// 忍杀动作
    if ( !ConfigManager.alwaysDash ) {
		if ( $gameParty.leader().hasSkill(10) && $gameSystem._drill_PAlM_enabled ) {
		  $gameMap.steupCEQJ(164,1);
		  this._coolDown += 10000;
          return;       	
		}
	}
	
    if ($gamePlayer._drill_EASA_enabled) {
		$gamePlayer.drill_EASe_setSimpleStateNode( ["普通拳连打"] );
	}
	
	$gameSystem._drill_PAlM_enabled = false;
	let type;
	let posX = $gamePlayer.screenBoxXShowQJ();
	let posY = $gamePlayer.screenBoxYShowQJ();	
	// 发射拳头数，会影响攻击范围面积
    let PunchCount = 1;
      PunchCount += $gameParty.leader().skillMasteryLevel(99);  
	let baseangle = 10 + PunchCount * 2;
	let startAngle = -baseangle;
	let endAngle = baseangle;	  
    switch ($gamePlayer.direction()) {
        case 2:  // 下
            type = "W";
			posX += 10;
			startAngle += baseangle + 15;
			endAngle += baseangle + 15;			
            break;
        case 4:  // 左
            type = "W";
			posY += 6;
			startAngle += 8;
			endAngle += 8;				
            break;
        case 6:  // 右
            type = "W";
			posY += 8;
            break;
        case 8:  // 上
            type = "E";
			posX -= 5;
			posY += 2;
			startAngle += baseangle + 5;
			endAngle += baseangle + 5;				
            break;
        default: 
            type = "W";
            break;
    }

  let time = 3 + Math.randomInt(3);  
      //time *= $gameParty.leader().pdr;
  let speed = 7 + Math.randomInt(4);
      speed *= $gameParty.leader().pdr;   
      speed = '0|'+speed+'~10/0~10|0';

  let coolDown = Math.round( 2000 * (1 - $gameParty.leader().cnt) );
	  coolDown = Math.max(coolDown,50);  
	  
  let randomSeArray = ["キックの素振り1","パンチの素振り2","パンチの素振り3"];
  let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
  let randomPitch = 95 + Math.randomInt(40);
  AudioManager.playSe({ name: randomSe, volume: 80, pitch: randomPitch, pan: 0 });

  let minScale = $gameParty.leader().pdr * 0.5;
  let maxScale = $gameParty.leader().pdr * 0.7;

  var leftPunch = QJ.MPMZ.Shooter_ArcRange(["PD"],{
	groupName: ['leftPunch','playerBullet'],
    position:[["S",posX],["S",posY]],
    img:'weapon/player_fist[5,4]',
    blendMode:0,
	//tone:[134,53,150,0],
    opacity:1,
    moveType:['S',speed],
	anchor:[0.5,0.3],
	collisionBox:['C',6],
	z:type,
    existData:[
        {t:['Time',time],d:[0,10]},
    	{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyPunchAttack,[1,{}]],p:[2,false,true]},
    ],
},startAngle,endAngle,PunchCount,baseangle*3,minScale,maxScale);

    time *= 2;
       QJ.MPMZ.Shoot({
            img: "null1",
            position: [['P'], ['P']],
            initialRotation: ['S',0],
            moveType: ['B',-1],
			opacity:0,
			collisionBox:['C',1],
            existData: [
			  {t:['Time',time]},
            ],          
            deadF: [
			  [QJ.MPMZ.tl.ex_playerRightPunchAttack]
            ],
        });

   this._coolDown = coolDown;	
  } else {
	  if (!$gamePlayer._drill_EASA_enabled && $gamePlayer._drill_EASe_controller && $gamePlayer._drill_EASe_controller._drill_curBitmapName.includes("boxing")) {
	    $gamePlayer.drill_EASA_setEnabled(true);
	    $gameSystem._drill_PAlM_enabled = true;
	  }
  }
};

//右拳普通攻击连打
QJ.MPMZ.tl.ex_playerRightPunchAttack = function() {

	let posX = $gamePlayer.screenBoxXShowQJ();
	let posY = $gamePlayer.screenBoxYShowQJ();
	// 发射拳头数，会影响攻击范围面积
    let PunchCount = 1;
        PunchCount += $gameParty.leader().skillMasteryLevel(99);  
	let baseangle = 10 + PunchCount * 2;
	let startAngle = -baseangle;
	let endAngle = baseangle;
    switch ($gamePlayer.direction()) {
        case 2:  // 下
            type = "W";
			posX -= 10;
			startAngle -= baseangle;
			endAngle -= baseangle;
            break;
        case 4:  // 左
            type = "W";
			posY += 6;
			startAngle += 8;
			endAngle += 8;				
            break;
        case 6:  // 右
            type = "W";
			posY += 8;
            break;
        case 8:  // 上
            type = "E";
			posX += 10;
			posY += 2;
			startAngle -= baseangle;
			endAngle -= baseangle;
            break;
        default: 
            type = "W";
            break;
    }

  let time = 3 + Math.randomInt(3);  
      time *= $gameParty.leader().pdr;  
  let speed = 7 + Math.randomInt(4);
      speed *= $gameParty.leader().pdr;   
      speed = '0|'+speed+'~10/0~10|0';
  let coolDown = Math.round( 2000 * (1 - $gameParty.leader().cnt) );
	  coolDown = Math.max(coolDown,50); 

  let randomSeArray = ["キックの素振り1","パンチの素振り2","パンチの素振り3"];
  let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
  let randomPitch = 95 + Math.randomInt(40);
  AudioManager.playSe({ name: randomSe, volume: 80, pitch: randomPitch, pan: 0 });

  let minScale = $gameParty.leader().pdr * 0.5;
  let maxScale = $gameParty.leader().pdr * 0.7;
  var RightPunch = QJ.MPMZ.Shooter_ArcRange(["PD"],{
	groupName: ['rightPunch','playerBullet'],
    position:[["S",posX],["S",posY]],
    img:'weapon/player_fist[5,4]',
    blendMode:0,
	//tone:[134,53,150,0],
    opacity:1,
    moveType:['S',speed],
	anchor:[0.5,0.3],
	collisionBox:['C',6],
	z:type,
    existData:[
        {t:['Time',time],d:[0,10]},
    	{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyPunchAttack,[1,{}]],p:[2,false,true]},
    ]
},startAngle,endAngle,PunchCount,baseangle*3,minScale,maxScale);

};

//对敌人格斗攻击反馈
QJ.MPMZ.tl.ex_toEnemyPunchAttack = function(Damage, attackData={},args) {
	
    // 若主角无武器则直接返回
    if (!$gameParty.leader().equips()[0]) return;
	
	if (!args || !args.target || !args.target instanceof Game_Event) return;
	
	let UjoHagan = false;
    // 受击动画参数
    let angle = Math.randomInt(360);
    let posX = this.inheritX();
    let posY = this.inheritY();
	let fixValue = 20 * this.scaleX;
    posX +=  fixValue * Math.sin(this.rotationMove*Math.PI/180);
    posY += -fixValue * Math.cos(this.rotationMove*Math.PI/180);		
	
    let effectScale = this.scaleX;
    // 暴击的情形
	if ($gameParty.leader().hasSkill(69)) {
	  let chance = 4 + $gameParty.leader().skillMasteryLevel(69) * 4;
	  if ( Math.randomInt(101) < chance ) {
		  UjoHagan = true;
		  effectScale *= 3;
	  }
	}
    // 受击音效
    let randomSeArray = ["軽いパンチ1","軽いパンチ2"];
    let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
    let randomPitch = 80 + Math.randomInt(40);
	if (UjoHagan) randomSe = "Damage3";
    AudioManager.playSe({ name: randomSe, volume: 80, pitch: randomPitch, pan: 0 });
	// 受击演出
    QJ.MPMZ.Shoot({
      img: "animehit[5,4]",
      initialRotation: ['S', angle],
      position: [['S', posX], ['S', posY]],
      scale: effectScale,
      moveType: ['S', 0],
      opacity: 1,
      blendMode: 0,
      z: "MF_UG",
      existData: [
	  { t: ['Time', 19] }
	  ]
    });	
	
    // 伤害计算
    let eventId = args.target._eventId;
	var Damage = chahuiUtil.getVarianceDamage(1);
	// 破颜拳适配
	if (UjoHagan) {
		let MHP = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'MHP']);
		let extraDamage = Math.round(MHP * 0.01);
		    extraDamage = Math.max(Damage*3, Math.min(extraDamage, 999999));
		Damage += extraDamage;
	}
	let realDamage = QJ.MPMZ.tl.getEnemyRaceDamageFactor(Damage,args.target);	
    
    // 敌人的 DEF、HP
	let enemy = $dataEnemies[$gameSelfVariables.value([$gameMap.mapId(), eventId, 'enemyId'])];
	if (!enemy) enemy = $dataEnemies[3];
    let enemyDEF = enemy.params[3];
    let enemyHP  = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);	
    realDamage -= enemyDEF;
    realDamage = Math.max(1, realDamage);
    realDamage = Math.min(99999999, realDamage);

    // 显示伤害数字
    SimpleMapDamageQJ.put(2, eventId, realDamage, 0, -72);

    // 魔法混合伤害
    let ID = $gameParty.leader().equips()[0].baseItemId;
    if ($dataWeapons[ID].traits[0].dataId === 2 || $gameParty.leader().hasSkill(45)) {
      let mixDamage = Math.round(chahuiUtil.getVarianceDamage(2));
	  if (!$gameParty.leader().hasSkill(55)) {
	  let enemyMDF = enemy.params[5];
		let damageReduction = 0.01 * chahuiUtil.magicDefenseDamageReduction(enemyMDF);
		mixDamage -= mixDamage * damageReduction;
		mixDamage = Math.floor(Math.max(1, Math.min(mixDamage, 99999)));	
	  }		
      let posX2 = 15 - Math.randomInt(30); // 让伤害数字稍微偏移
      SimpleMapDamageQJ.put(3, eventId, mixDamage, posX2, -64);
      let newHP = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);
      $gameSelfVariables.setValue([$gameMap.mapId(), eventId, 'HP'], newHP - mixDamage);
    }

    // 伤害结算
    $gameSelfVariables.setValue([$gameMap.mapId(), eventId, 'HP'], enemyHP - realDamage);	
    // 刷新血条
    args.target.showHpBar();
    // 死亡判断
    enemyHP = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);
    if (enemyHP <= 0) {
      $gameSelfSwitches.setValue([$gameMap.mapId(), eventId, 'D'], true);
	  QJ.MPMZ.tl.ex_enemyDeathEffectResolution.call(this,args.target);
      return;
    }	
};

// 兄杀演出
QJ.MPMZ.tl.ex_oniichanExecutionAnimation = function() {
	
    // 临时措施，优化玩家未捡取掉落物就被杀死
    $gameParty.leader().removeStateCategory('ijou', 1);

    $gameSwitches.setValue(14, true);
	// 演出期间禁止玩家移动
    $gameSystem._drill_PAlM_enabled = false;	
	
    QJ.MPMZ.Shoot({
            groupName: [ 'oniichanExecution' ],
            img: "object_name/OniichanExecution",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            blendMode: 0,
            opacity: "0|0~120/1~999|1",
            scale: 0.5,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
			z:'A',
            existData: [
			  { t: ['Time', 330], d: [0, 60] }
			],
			moveJS: [
			  [10,999,"AudioManager.playSe({ name: 'Collapse2', volume: 90, pitch: 50, pan: 0 })"]
			],
			deadJS:[
			  "$gameMap.moveFilter('mapBlur', [0], 60);" +
			  "$gameMap.eraseFilterAfterMove('mapBlur');" +
			  "AudioManager.fadeInBgm(4);" +
			  "$gameSwitches.setValue(14, false);" +
			  "$gameSystem._drill_PAlM_enabled = true;"
			]
    });
	// 地图模糊滤镜
    var id = "mapBlur" ;
    var filterTarget = 21;
    $gameMap.createFilter(id, "blur", filterTarget);
    $gameMap.setFilter( id ,[0]);
    $gameMap.moveFilter(id, [2], 90);
	
};		


// 检测玩家是否应该死亡，适配各种特殊生存手段
QJ.MPMZ.tl.ex_shouldPlayerDieCheck = function() {
	
	if (!this) return;
	// 防止死亡事件重复触发
	if ( $gameTemp._eventReserved ) {
		this._index = this._list.length;
		return;
	}
	
	// 特殊死亡方式无法激活保命手段
	if ( $gameStrings.value(20).trim() !== "" )  return;
    let player = $gameParty.leader();
	
	//  稻草人之心适配
	if ( player.isStateAffected(115) ) {
		if ( $gameSystem.hasGameTimeEvent('scarecrowHeart') ) {
			  this._index = this._list.length;
			  return;			
		}
	}
	
	//  毅力头巾-毅力效果
	if ( player.hasSkill(42) ) {
		let chance = 5 + player.skillMasteryLevel(42) * 10;
		if (chance > Math.randomInt(101)) {
			// 受到致命伤锁血
			player.setHp(1);
			AudioManager.playSe({ name: "Skill3", volume: 60, pitch: 85, pan: 0 });
            QJ.MPMZ.tl.ex_effectFonts("buqu", -1);
			this._index = this._list.length;
			return;
		}			
	}
	
};

// 玩家死亡清理多余演出效果
QJ.MPMZ.tl.ex_cleanupDeathExtraEffects = function() {
	
	// 清除掉存在的选项和对话框以及正在执行的事件
	resetMessageWindow();
	
	$gamePlayer.mppHidPasZ = 0;
	// 死亡事件锁
	$gameTemp._eventReserved = true;
	$gameSystem._drill_COI_map_mouse = false;
	TouchInput._mousePressed = false;
	$gameScreen._pictureCidArray = [];
    $gamePlayer.drill_PT_clearLifting();
    ctb.useTurnPlayer = false;
	// 强制恢复鼠标权限
    $gameSystem._drill_COI_map_mouse = true;
    $gameSwitches.setValue(3, false);
	// 禁止玩家移动
	$gameSystem._drill_PAlM_enabled = false;	
	Zzy.TWF.ToTheWorld(true) 
};

// 玩家复活跳跃演出
QJ.MPMZ.tl.ex_oniichanExecutionAnimation = function() {
	
	if (!this) return;
	
	let player = $gamePlayer;
	// 玩家当前坐标区域
	let regionId = $gameMap.regionId(player._realX + player.offsetX(), player._realY - 0.3);
	let noPassable = !$gameMap.checkPlayerIsPassable();
	// 玩家处于无法移动的状态
	if ( $gameNumberArray.value(5).includes(regionId) || noPassable ) {
  	    player._drill_JSp['enabled'] = true;
 	    player._drill_JSp['height'] = -1;
        player._drill_JSp['time'] = 35;
        player._drill_JSp['speed'] = 10;
        
        let XX = Math.round(player.centerRealX());  
		let YY = Math.round(player.centerRealY());	
        let condition = DrillUp.g_COFA_condition_list[ 10 ];
        let c_area = $gameMap.drill_COFA_getShapePointsWithCondition( XX, YY, "圆形区域", 12, condition );
	// 跳出不可通行区域		
        if(c_area.length > 0) {
           let p = c_area[ Math.floor( Math.random()*c_area.length ) ];
           let xPlus = p.x - XX;  
		   let yPlus = p.y - YY;
           player.jump(xPlus, yPlus);
        } else {
           player.jump(0, 0);
        }		
	}
};