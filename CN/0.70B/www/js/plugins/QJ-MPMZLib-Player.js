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

Spriteset_Map.prototype.findTargetSprite = function(target) {
    return this._characterSprites.find(sprite => sprite._character === target);
};

//玩家异常状态检查
QJ.MPMZ.tl.ex_playerConditionCheck = function() {

    QJ.MPMZ.deleteProjectile('system');
	
    QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['system'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',1],
        moveType:['D',false],
		immuneTimeStop:true,
        existData:[	
        ],
		moveF:[
			[90,150,QJ.MPMZ.tl.ex_abyssTimeFlow], // 在深渊时间自动流逝
			[20,20,QJ.MPMZ.tl.ex_PlayerHitCheck], // 受击检测和无敌帧重置
			[60,60,QJ.MPMZ.tl.ex_playerStuckCheck], // 玩家卡墙检测
			[60,60,QJ.MPMZ.tl.ex_playerAttributeRefresh], // 玩家属性框刷新
		    [60,60,QJ.MPMZ.tl.ex_playerAttackModeDetection],  // 玩家攻击模式检测
			[60,20,QJ.MPMZ.tl.ex_senPoListener]  // 闪步触发判断
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
};

// 从者重置-生成
QJ.MPMZ.tl.ServantResetAndRegeneration = function() { 
      
    let actor = $gameActors.actor(1); 
    
    // 自动环绕型从者
    if ($gameNumberArray.value(22).length > 0) {
        let bulletTypes = $gameNumberArray.value(22);
        QJ.MPMZ.tl.ex_orbitingBulletInitialization(bulletTypes);    
    }

    // 猪猪存钱罐
    if ($gameParty.leader().hasSkill(32)) {
        let XX = $gamePlayer._x;
        let YY = $gamePlayer._y;
        let piggyBankCount = actor.equips().filter(equip => 
            equip && DataManager.isArmor(equip) && equip.baseItemId === 37
        ).length;

        // 生成多个存钱罐
        for (let i = 0; i < piggyBankCount; i++) {
            $gameMap.spawnEventQJ(1, 111, XX, YY, false);
        }

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
};

//额外的闪步监听器
QJ.MPMZ.tl.ex_senPoListener = function() { 

    if (Input.drill_isKeyPressed('空格')) {
	   if (!$gameSwitches.value(203)) {
		   QJ.MPMZ.tl.ex_senpo.call(this);
	   }
   }
};

//玩家攻击模式检测
QJ.MPMZ.tl.ex_playerAttackModeDetection = function() { 

        if(!$gameParty.leader().equips()[0]) return;
		if ($gamePlayer.isStealthMode()) return;

		if($gameMap.getGroupBulletListQJ('attackMonitoring').length > 0) return;
        let weaponType = $gameParty.leader().equips()[0].wtypeId;
        let swordType = [1,2];
		let bowType = [3];
		let staffType = [5,6,7];
		// 剑攻击监听
        if (swordType.includes(weaponType)) {
          if($gameMap.getGroupBulletListQJ('playerWeapon').length > 0) return;
		  QJ.MPMZ.tl.ex_playermeleeAttackCheck();
		  return;
		}
		if (bowType.includes(weaponType)) {
		  if($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
          if($gameMap.getGroupBulletListQJ('playerBow').length > 0) return;
		  QJ.MPMZ.tl.ex_playerBowAttackCheck();
		  return;
		}
        // 法杖攻击监听
        if (staffType.includes(weaponType)) {
          if($gameMap.getGroupBulletListQJ('playerStaff').length > 0) return;
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

QJ.MPMZ.tl.ex_playerSetItemDescription = function(item) {

    // 如果有物品/技能
    if (item) {

        let lines = [];

		let itemName = "\\fs[28]";
		if (DataManager.isItem(item)) itemName += "\\si[" + item.id + "]";
		if (DataManager.isWeapon(item)) itemName += "\\sw[" + item.id + "]";
        if (DataManager.isArmor(item)) itemName += "\\sa[" + item.id + "]";
		itemName += "\\py[12]";
        lines.push(itemName);

        let top    = item.infoTextTop    || "";
        let bottom = item.infoTextBottom || "";
        if (bottom && top) {
            lines.push(bottom);
            lines.push(top);
        } else if (bottom) {
            lines.push(bottom);
        } else if (top) {
            lines.push(top);
        }

        // （C）如果是武器或护甲，则额外显示其 params 信息
        if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
            // 例如只显示 [atk, def, mat, mdf, luk] 这几项
            const paramIndices = [2, 3, 4, 5, 7]; 
            const paramIcons   = ["\\i[17]", "\\i[19]", "\\i[18]", "\\i[20]", "\\i[22]"];
            // 注：这里第一个 icon[17] 对应的是 atk 图标，你可以根据自己图标表进行微调
            let statsArray = [];

            for (let i = 0; i < paramIndices.length; i++) {
                let idx = paramIndices[i];
                let val = item.params[idx] + item.flatParams[idx];
                if (val > 0) {
                    // 只显示大于 0 的属性
					if (item.flatParams[idx] > 0) {
					statsArray.push("\\c[10]" + paramIcons[i] + val + "\\c[0]");	
					} else {
                    statsArray.push(paramIcons[i] + val);
					}
                }
            }

            // 如果收集到属性不为空，拼在最后
            if (statsArray.length > 0) {
                // 用 “  ”（两个空格）分隔
                let statsLine = statsArray.join("  ");
                // 用 “•” 或其它符号标识一下
                lines.push("•" + statsLine);
            }
        }

        // 3. 最终把行数组合并成字符串，使用换行符连接
        let combinedText = lines.join("\n");

        return combinedText;

    } else {
        // item 不存在，直接清空
       return "";
    }
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

        var playerWeaponImg = QJ.MPMZ.Shoot({
            groupName: ['playerWeaponImg','playerEquipment'],
            img: ['I', index],
            position: [['S', posX], ['S', posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: '0|0~10/1~5/0.5~999999999|0.5',		
            opacity: 1,
			immuneTimeStop:true,
            onScreen: true,
            moveType: ['S', 0],
            existData: [
			  {t:['S','this._broken',true],a:['F',QJ.MPMZ.tl.ex_playerWeaponBroken],d:[0,20]}
			],
			moveF:[
			  [4,30,QJ.MPMZ.tl.ex_playerWeaponDurabilityMonitoring],
			  [4,30,QJ.MPMZ.tl.ex_playerWeaponDurabilityReminder],
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
        let index = $gameParty.leader().equips()[0].id;
		// 武器描述
		let text = QJ.MPMZ.tl.ex_playerSetItemDescription($dataWeapons[index]);
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


let randomSeArray = ["剣で打ち合う3"];
let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
let randomPitch = 85 + Math.randomInt(40);
AudioManager.playSe({ name: randomSe, volume: 100, pitch: randomPitch, pan: 0 });

QJ.MPMZ.deleteProjectile('attackMonitoring');
let obj = $gameParty.leader().equips()[0];

let posX,posY;

if ($gameMap.getGroupBulletListQJ('weaponMarker').length > 0) {
let bulletId = $gameMap.getGroupBulletListQJ('weaponMarker')[0];
posX = $gameMap._mapBulletsQJ[bulletId].inheritX();
posY = $gameMap._mapBulletsQJ[bulletId].inheritY();
} else {
posX = $gamePlayer.screenBoxXShowQJ();
posY = $gamePlayer.screenBoxYShowQJ();	
}

//武器破损闪光演出
$gameScreen.showPicture(66, "", 0, posX, posY, 100, 100, 0, 0);
var data = $gameScreen._particle.particleSet(0,'aura_bp','picture:66');
$gameScreen._particle.particleUpdate(['aura_bp','pos','0','-12']);
//$gameScreen._particle.particleUpdate(['aura_bp','color','#ff4665']);
data.clear = true;

//武器碎片破损粒子演出
QJ.MPMZ.Shoot({
img:"null",
initialRotation:90,
existData:[{t:['Time',6]}],
moveType:['S',0],
position:[['S',posX],['S',posY]],
particles:[
{img:"weapon/weaponChips[6]",
intervalTime:1,
bundleNumber:5,
synScale:true,
offsetMin:[-36,-24,-10],
offsetMax:[0,24,10],
existTime:80,
disappearTime:20,
disappearScale:0.5,
scaleXMin:1,
scaleXMax:1,
moveType:['(()=>{let a = this.remA =  this.remA ? this.remA : (Math.random()*3-1.5);return a*t;})()',
'(()=>{let a = t<30?t:(30+(t-30)/2);return 8/60*a*(60-a);})()']
}]
});
// 清理耐久度文本
QJ.MPMZ.deleteProjectile('weaponDurabilityReminder');
$gameParty.leader().durabilityBreakItem(obj);

$gameParty.leader().removeState(62);
QJ.MPMZ.tl.ex_playerWeaponImage(true);
     // 武器破坏后效果
        QJ.MPMZ.Shoot({
            img:"null1",
            position: [['P'], ['P']],
            existData: [
			   {t:['Time',60]}
			],
			deadJS:["Zzy.TWF.ToTheWorld(true);$gameMap.steupCEQJ(101,1)"]
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

  let durRate = durability / durMax; // 比例
  this._broken = (durability <= 0);

  let aboutToBreak = false;
  let power = 0;    

  if (durRate < 0.05) {
    aboutToBreak = true;
    power = 250;  // 第三阶段
	// 最终攻击需要特殊提醒	
	  if (!this._brokenWarning) {
		  this._brokenWarning = true;
        QJ.MPMZ.Shoot({
            groupName: ['durabilityLow'],
            img: 'durabilityLow',
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

  // 仅当 aboutToBreak 或 power 发生**变化**时，才调用一次 changeAttribute
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
        let icon = $dataArmors[index].iconIndex;

    var Gear = QJ.MPMZ.Shoot({
            groupName: [bullet,'playerEquipment'],
            img: ['I', icon],
            position: [['S', posX], ['S', posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: '0|0~10/1~5/0.5~999999999|0.5',	
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
QJ.MPMZ.tl.ex_unequipPlayerSpecifiedEquipment = function(item, effect) {

    if (effect != null) return; 

    let actor = $gameActors.actor(1); 
    let equips = actor.equips(); 
    let isWeapon = DataManager.isWeapon(item); 
    let isArmor = DataManager.isArmor(item); 

    for (let index = 1; index < equips.length; index++) {
        let equip = equips[index];

        if (!equip) continue; // 跳过空装备
        if ( isArmor && equip.id === item.id ) {
			actor.changeEquipById(index+1, null, effect);			 
            $gameMap.steupCEQJ(100, index, { equipFadeOut: true, equipChange: true, equipIndex: index });
			$gameParty.loseItem(equip, 1);
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
    if (!QJ.MPMZ.tl.ex_playerAntiClickDetection("timeFlow")) {
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
                 
	$gamePlayer.requestAnimation(141);	
				 
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
   QJ.MPMZ.Shoot({
        img:"imoutoUtil/feelsExcited",
        groupName:['feelsExcited'],
        position:[['S',0],['S',0]],
		scale:1,
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
		condition = !$gameSwitches.value(3) || $gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding;
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
   if ( $gameActors.actor(1).isStateAffected(1) || $gameActors.actor(1).hp <= 0 ) {
	   // 稻草人发动
	   if (!$gameSystem.hasGameTimeEvent('scarecrowHeart') && $gameActors.actor(1).isStateAffected(115)) {
	      if (!$gameSystem.hasGameTimeEvent('scarecrowHeart') && !$gameSystem.hasGameTimeEvent('scarecrowHeartActivated')) {
		      $gameSystem.addGameTimeEvent({ key: 'scarecrowHeart', delayMinutes: 3 });
			  $gameSystem.addGameTimeEvent({ key: 'scarecrowHeartActivated', delayMinutes: 60 });
		  }
	   }
	   $gameMap.steupCEQJ(4,1);
	  
   }

   if ($gamePlayer._drill_PT_is_lifting) {
	   $gameSwitches.setValue(195,true);
      } 
  

};

// 玩家自动回复能力
QJ.MPMZ.tl.ex_playerAutoRecovery = function() { 
    if ($gameMap.getGroupBulletListQJ('playerAutoRecovery').length > 0) {
        let heal = 100 * $gameParty.leader().hrg * $gameParty.leader().pha;
        heal = Math.floor(heal);
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

    // 异常状态未清除的防范
	if ( !$gameSystem.hasGameTimeEvent('state7') && $gameParty.leader().isStateAffected(7)) {
		$gameParty.leader().removeState(7);
	}
	if ( !$gameSystem.hasGameTimeEvent('state9') && $gameParty.leader().isStateAffected(9)) {
		$gameParty.leader().removeState(9);
	}
}; 

//玩家水中检查
QJ.MPMZ.tl.ex_playerSwimmingCheck = function() {  

    if (!$gamePlayer._drill_EASA_enabled) return;

	var playerX = Math.floor($gamePlayer.centerRealX());
	var playerY = Math.floor($gamePlayer.centerRealY());
	if ( $gameMap.regionId( playerX, playerY ) == 8 && !$gamePlayer.isJumping()) {
	if ($gameParty.leader()._characterName !== "$player_swim"){
	$gameScreen._particle.particleGroupSet(0,'splash_cp','player');
	$gamePlayer.drill_EASe_stopAct();
	$gameParty.leader()._characterName = "$player_swim";
    $gamePlayer.refresh();
	$gamePlayer.drill_EASA_setEnabled( true );
	$gameParty.leader().addState(67);
	$gameSwitches.setValue(14, true);
	    }
   } else {
	   if ($gameParty.leader().isStateAffected(67)) {
		   $gameParty.leader().removeState(67);
		   $gameSwitches.setValue(14, false);
	   }
   }

};

//玩家卡墙检查
QJ.MPMZ.tl.ex_playerStuckCheck = function() {  

var playerX = Math.floor($gamePlayer.centerRealX());
var playerY = Math.floor($gamePlayer.centerRealY());
//水中检查
QJ.MPMZ.tl.ex_playerSwimmingCheck();

var noPass = false;
var region = $gameMap.regionId(playerX,playerY);
   if ($gameNumberArray.value(5).includes(region)) {
	   noPass = true;
    }
	
var canThrough = $gamePlayer._through || $gamePlayer.isJumping() || $gameSwitches.value(100);
var canMoveUp = $gamePlayer.canPass(playerX, playerY, 8);    // 上
var canMoveDown = $gamePlayer.canPass(playerX, playerY, 2);  // 下
var canMoveLeft = $gamePlayer.canPass(playerX, playerY, 4);  // 左
var canMoveRight = $gamePlayer.canPass(playerX, playerY, 6); // 右

// 如果四个方向都不可通行，或者玩家处于标记的区域ID内，则玩家处于一个无法移动的位置
if ((noPass && !canThrough) || (!canThrough && !canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight)) {
   // 卡墙的碰撞伤害
	QJ.MPMZ.tl.ex_playerStuckCollisionDamage();
    var XX = $gamePlayer.centerRealX();  var YY = $gamePlayer.centerRealY();
    var condition = DrillUp.g_COFA_condition_list[ 10 ];
    var c_area = $gameMap.drill_COFA_getShapePointsWithCondition( XX,YY,"圆形区域",8, condition );
	   
    if(c_area.length > 0) {
       var p = c_area[ Math.floor( Math.random()*c_area.length ) ];
       var xPlus = p.x - XX;  var yPlus = p.y - YY;	
       $gamePlayer.jump(xPlus, yPlus);
      } else {
	   $gamePlayer.jump(0, 0);  
	  }
   }

};

// 卡墙的碰撞伤害
QJ.MPMZ.tl.ex_playerStuckCollisionDamage = function() {
	
	$gamePlayer.requestAnimation(140);
	var realDamage = Math.floor($gameParty.leader().mhp * 0.15);
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
}

//检查玩家背包中武器容量
QJ.MPMZ.tl.checkplayerWeaponWeight = function() {
	if ($gameParty.leader()._weaponAmountLimit === undefined) $gameParty.leader()._weaponAmountLimit = 10;
	const limit = $gameParty.leader()._weaponAmountLimit;
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

	let posX = $gamePlayer.screenBoxXShowQJ();
    let posY = $gamePlayer.screenBoxYShowQJ();
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#ffffff",
    fontSize:14,
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
    shadowBlur:0,
    shadowColor:"#270000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: '0|1~30|1~90/0',
            moveType: ['S','0|0.5~120/0.01~999/0.01'],
            z:"W",
			scale:1,		
			anchor:[0.5,0.5],
            existData: [
			   {t:['Time',90]}
			],
        });		

};


//检查玩家背包中装备容量
QJ.MPMZ.tl.checkplayerGearWeight = function() {
	if ($gameParty.leader()._armorAmountLimit === undefined) $gameParty.leader()._armorAmountLimit = 20;
	const limit = $gameParty.leader()._armorAmountLimit;
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

	let posX = $gamePlayer.screenBoxXShowQJ();
    let posY = $gamePlayer.screenBoxYShowQJ();
	
        QJ.MPMZ.Shoot({
            img:['T',{
    text:BulletText,
    arrangementMode:0,
    textColor:"#ffffff",
    fontSize:14,
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
    shadowBlur:0,
    shadowColor:"#270000",
    shadowOffsetX:0,
    shadowOffsetY:0
}],
            position: [['S',posX], ['S',posY]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: '0|1~30|1~90/0',
            moveType: ['S','0|0.5~120/0.01~999/0.01'],
            z:"W",
			scale:1,		
			anchor:[0.5,0.5],
            existData: [
			   {t:['Time',90]}
			],
        });		

};

//检查玩家背包中装备容量
QJ.MPMZ.tl.upgradeWeaponArmorLimit = function(type) {
    // 1. 判断是武器还是防具
    const isWeapon = (type === 'weapon');
    const isArmor  = (type === 'armor');
    if (!isWeapon && !isArmor) {
        return false;  // 类型不符合，直接返回
    }

    // 2. 获取玩家角色
    const actor = $gameParty.leader();  
    if (!actor) return false;

    // 3. 设定自定义字段名字，并判断/初始化其值
    //    （如果要放在 Game_Actor.prototype 初始化，也可，但简单的话直接判空赋值）
    if (actor._weaponAmountLimit === undefined) actor._weaponAmountLimit = 10; // 例如默认10
    if (actor._armorAmountLimit === undefined)  actor._armorAmountLimit  = 20; // 例如默认20

    const limitKey = isWeapon ? '_weaponAmountLimit' : '_armorAmountLimit';
    let currentLimit = actor[limitKey];   // 读出当前容量
    const maxLimit   = 50;               // 设定本例中武器/防具最高可扩充至 50

    // 4. 判断是否达上限
    if (currentLimit >= maxLimit) {
        return false;
    }

    // 5. 计算本次升级所需的【物品/金钱/…】代价
    //    这里示例以“物品312”的数量为代价
    //    你自行根据设计来改写
    const base = isWeapon ? 10 : 20;             // 默认初始的容量
    const upgrades = currentLimit - base;        // 已经扩容过多少次
    const cost = Math.min(128, Math.pow(2, upgrades));
    // ↑ 示例：第一次需要2个物品、第二次4个、第三次8个… 最高 128

    // 6. 判断是否足够物品 312
    if ($gameParty.numItems($dataItems[312]) < cost) {
        return false;
    }

    // 7. 消耗物品
    $gameParty.loseItem($dataItems[312], cost);

    // 8. 扩大容量
    actor[limitKey] = currentLimit + 1;  
    return true; 
};


//=============================================================================
//体术
//=============================================================================

//闪步
QJ.MPMZ.tl.ex_senpo = function() {

    if($gameMap.getGroupBulletListQJ('senpoTachi').length > 0) return;
	if($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
	
	var skillDuration = 15;
	    skillDuration += $gameParty.leader().skillMasteryLevel(39);
	
	if (!$gameParty.leader().isStateAffected(67)) {
	$gameScreen._particle.particlePlay(0,"fuss_startdash","player","def","0.9");

  } else {
    $gameScreen._particle.particleGroupSet(0,"splash_cp","player");
  }
   var seNames = "Wind1";
   var se = { name: seNames, volume: 60, pitch: 140, pan: 0 };
   AudioManager.playSe(se);

	$gameMap.setFilter( "モーションブラー" ,[30,0]);
	$gameMap.moveFilter( "モーションブラー" ,[0,0], skillDuration);	
	$gameSwitches.setValue(95, false);
	$gameSwitches.setValue(100, true);	
	$gameSwitches.setValue(203, true);	
	$gameParty.leader().addState(63);
    
	// 保证走路时触发闪步也有最低限度的位移
	if ( $gamePlayer.realMoveSpeed() < 25 ) {
		$gamePlayer._moveSpeed = 20;
	}
		
	
	var character = $gamePlayer;
	if (!$gameParty.leader().isStateAffected(67)) {
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
    
	// 幽灵闪步
    if ($gameParty.leader().hasSkill(92)) {
     r = 144;
     g = 0;
     b = 255;
     color = [r, g, b, 255];
     character._opacity = 128;
	 character._through = true;
	}

    // 计算残影的间隔时间	
    var baseSpeed = 48; 
	var moveSpeed = $gamePlayer.realMoveSpeed();
    const minPeriod = 2; 
    const maxPeriod = 6;	
    var period = Math.max(minPeriod, maxPeriod - Math.floor(moveSpeed / baseSpeed));	
    character.residual().setPeriod(period);		
	
    character.residual().setDuration(60);
    character.residual().setOpacity(128);
    character.residual().setColorTone(color);
    character.residual().setValid(true);

	var senPo = QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['senPo'],
        position:[['P'],['P']],
        initialRotation:['PD'],
        scale:[1,1],
        moveType:['B',-1],
		opacity:0,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',skillDuration]},
            //{t:['G',['"enemy"','"object"']],a:['C',155,[1,20,0,0]],p:[-1,false,true]}
        ],
        z:"E",collisionBox:['C',1],
	deadF:[[QJ.MPMZ.tl.ex_senpoFinish]]
    });
	
	if($gamePlayer.isStealthMode()) return;
	
	//闪步太刀
	if ($gameParty.leader().hasSkill(3)) {
		QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['senpoTachiListener'],
        position:[['P'],['P']],
        initialRotation:['PD'],
        moveType:['B',-1],
		opacity:0,
        existData:[
            {t:['Time',60]},
        ],
		moveF:[
		 [0,0,QJ.MPMZ.tl.ex_senpoTachiListener]
		]
    });
  }
	// 适配接近攻击能力
	if ($gameParty.leader().hasSkill(91)) {  
	   let damage = 5 + $gameParty.leader().skillMasteryLevel(91);
	       damage += Math.floor(damage * ($gamePlayer.realMoveSpeed() / 20));
		QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['2'],
        position:[['P'],['P']],
        initialRotation:['PD'],
		collisionBox:['C',30],
        moveType:['B',-1],
		opacity:0,
        existData:[
            {t:['Time',skillDuration]},
			{t:['G',['"enemy"']],a:['F',QJ.MPMZ.tl.customEnemyDamageCalculation,[damage,false]],p:[-1,false,true]}
        ],
     });
	}
}

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
	character.residual().setValid(false);
	$gameSwitches.setValue(95, false);
	$gameSwitches.setValue(100, false);
	$gameParty.leader().removeState(63);

   if(!$gameSwitches.value(191)){
    var coolDown = 60;  
   } else {
	var coolDown = 120;   
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
        collisionBox:['C',1],
        moveType:['D',false],
        existData:[
            {t:['Time',coolDown]}, 		
        ],
		moveF:[
		],
		deadJS:["$gameParty.leader().removeState(64);$gameSwitches.setValue(203, false);"]
    });		
	
}

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
	 
       QJ.MPMZ.Shoot({
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

    if (TouchInput.drill_isLeftPressed() || GamepadsAttack) {
        let weaponType = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].wtypeId;
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
    // 手柄检测
    if (navigator.getGamepads() && navigator.getGamepads()[0] !== null) {
        GamepadsAttack = Input.drill_isPadPressed('LT') && (
            Input.drill_isPadPressed('右摇杆上') || 
            Input.drill_isPadPressed('右摇杆下') || 
            Input.drill_isPadPressed('右摇杆左') || 
            Input.drill_isPadPressed('右摇杆右')
        );
        if (GamepadsAttack) QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
    }

    if (TouchInput.drill_isRightPressed() || GamepadsAttack) {
        if (QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack")) return;
        if ($gameSwitches.value(181)) return;
        if ($gameMap.getGroupBulletListQJ('Senpo').length > 0) return;

        let weaponType = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].wtypeId;
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

    var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
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
	//this.meleeAttackTrail();
	
	// 实际武器碰撞体判定
   var realBullet = QJ.MPMZ.Shoot({
		groupName:['meleeAttack','playerSkill'],
        img:weaponImage,
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
            {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[Math.floor(weaponDamage),{}]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
        z:"E",
		collisionBox:['R',8,64],
        judgeAccuracyRotation:5,		
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:time,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true,
        }],		
    });	

	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		realBullet.addMoveData("JS",[skillTime,999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this)']);
	}

	//暴风兽人斧-剑刃风暴
	if ($gameParty.leader().hasSkill(56)) {
		realBullet.addMoveData("JS",[skillTime,999,'QJ.MPMZ.tl.ex_skillBladestorm.call($gamePlayer)']);
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
	  $gameParty.leader().gainSkillMasteryUses(26, 1);
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

//闪步太刀-准备动作
QJ.MPMZ.tl.ex_senpoTachi = function() {
	//$gameScreen._particle.particleSet(0,'aura_bp2','player');
	//$gameScreen._particle.particleGroupSet(0,'weapon_b1','player');
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
    character.residual().setPeriod(4);
	} else {
    var r = 50;
    var g = 140;
    var b = 200;
    var color = [r, g, b, 255];
    character.residual().setPeriod(6);		
	}
    character.residual().setDuration(60);
    character.residual().setOpacity(128);
    character.residual().setColorTone(color);
    character.residual().setValid(true);	
    //检测移动方向
	let mouseX = TouchInput.x / $gameScreen.zoomScale();
	let mouseY = TouchInput.y / $gameScreen.zoomScale();
	let ax = $gamePlayer.centerRealX();
    let ay = $gamePlayer.centerRealY();
    let bx = (mouseX / 48) + $gameMap.displayX();
    let by = (mouseY / 48) + $gameMap.displayY();
	let deg = QJ.calculateAngleByTwoPointAngle(ax, ay, bx, by);
	
	$gamePlayer.drill_EASe_stopAct();
	let direction;
	let angle;
	let speed;
	if (deg > 180) {
	$gamePlayer.drill_EASe_setAct( ["闪步太刀-左"] );
	direction = 1;
	angle = 60;
	speed = 28.3;
	} else {
	$gamePlayer.drill_EASe_setAct( ["闪步太刀-右"] );
	direction = 2;
	angle = 300;
	speed = -28.3;
	}
	$gamePlayer.drill_EASA_setEnabled( true );
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
        trailEffect:[{
            img:['L',0.5,72,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:20,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],
		moveF:[
		[1,0,QJ.MPMZ.tl.ex_senpoTachiFix],
		],
        deadJS:["$gameParty.leader().removeState(80);$gamePlayer.residual().setValid(false);$gameSystem._drill_PAlM_enabled = true;"]		
    });	
	
			//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		Tachi.addMoveData("F",[5,5,QJ.MPMZ.tl.ex_willowLeafEffects]);
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
        trailEffect:[{
            img:['L',0.5,72,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:0.75,
            disappearTime:20,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],	
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
QJ.MPMZ.tl.ex_senpuuGiri = function(GamepadsAttack) {
	if($gameMap.getGroupBulletListQJ('playerSkill').length > 0) return;
	if(!$gameParty.leader().equips()[0]) return;
	
	 $gameSwitches.setValue(14, true);
	 $gameSwitches.setValue(181, true);
	 $gameParty.leader().addState(62);
	 $dataMap.disableDashing = true;
	 $gamePlayer.drill_EASe_setStateNode( "旋风斩" );
		
	
    var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = $gameParty.leader().pdr;
    var weaponSE = "var seNames = '剣の素振り（大剣を振る）';var randomPitch = Math.randomInt(40) + 110;var se = { name: seNames, volume: 60, pitch: randomPitch, pan: 0 };AudioManager.playSe(se);";
	var weapon = $dataWeapons[$gameParty.leader().equips()[0].baseItemId];
	
	//装备协同效应
	if (weapon.note && weapon.note.includes("<旋风斩加速>")) {
		weaponSE += "if($gamePlayer._moveSpeed<36){$gamePlayer._moveSpeed+=3}";
	}
	
    var senpuuGiri = QJ.MPMZ.Shoot({
		groupName:['playerSkill','senpuuGiri'],
        img:weaponImage,
        position:[['P'],['P']],
        initialRotation:['S',-225],
        scale:[-weaponScale,weaponScale],//动态缩放
        moveType:['D',false],
        imgRotation:['R','64|5.625~56|6.428~48|7.5~40|9~32|11.25~99999|15',true],//剑的旋转，速度是动态的
        anchor:[1.05,1.05],
        existData:[
			{t:['S','Fuku_Plugins.EventTremble.getRemainingCycles(-1) == 0',false]},	
			{t:['S','$gameParty.leader().equips()[0]&&$gameParty.leader().equips()[0].baseItemId==4',true]},
            {t:['S','$gameMap.regionId( Math.floor($gamePlayer.centerRealX()), Math.floor($gamePlayer.centerRealY()) ) === 8',true]},				
        ],
        z:"E",
		collisionBox:['C',1],
	moveJS:[[64,99999,weaponSE],[120,99999,weaponSE],[168,99999,weaponSE],[200,99999,weaponSE],[224,24,weaponSE]],
	moveF:[[2,2,QJ.MPMZ.tl.ex_checkSenpuuGiriAlignment]],
	deadF:[[QJ.MPMZ.tl.ex_senpuuGiriFinishAction,[GamepadsAttack]]]
    });
	
	QJ.MPMZ.tl.ex_senpuuGiriTrail.call(senpuuGiri);
		//读取操作模式
    if (GamepadsAttack) {
		var AnyPadReleased = "Input.drill_isPadPressed('右摇杆上')||Input.drill_isPadPressed('右摇杆下')||Input.drill_isPadPressed('右摇杆左')||Input.drill_isPadPressed('右摇杆右')";
		senpuuGiri.addExistData({t:['S',AnyPadReleased,false],a:['F',QJ.MPMZ.tl.ex_senpuuGiriThrow,[GamepadsAttack]]});
	} else {
		senpuuGiri.addExistData({t:['S','!TouchInput.drill_isRightPressed()||!$gameParty.leader().equips()[0]',true],a:['F',QJ.MPMZ.tl.ex_senpuuGiriThrow,[false]]});
	}
	
		//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		senpuuGiri.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_willowLeafEffects,["senpuuGiri"]]);
	}
		//香蕉大剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 60) {
		senpuuGiri.addMoveData("F",[200,60,QJ.MPMZ.tl.ex_activateBananaGrenade,["senpuuGiri"]]);
	}
	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		senpuuGiri.addMoveData("JS",[64,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[120,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[168,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[208,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[240,24,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
	}	
	//多次攻击次数-燕返斩
	if ($gameParty.leader().hasSkill(99)) {
		var tsubameGaeshi = $gameParty.leader().skillMasteryLevel(99);
		 var tsubameGaeshiTime = 2;
		  for (var i = 1; i <= tsubameGaeshi; i++) {
			tsubameGaeshiTime = tsubameGaeshiTime + 4;
		    senpuuGiri.addMoveData("F",[tsubameGaeshiTime,99999,QJ.MPMZ.tl.ex_senpuuGiriTsubameGaeshi,[GamepadsAttack]]);
	    }
	}
	
};

//旋风斩结束动作
QJ.MPMZ.tl.ex_senpuuGiriFinishAction = function() {

   let chargeTime = this.time;
   $gameMap.steupCEQJ(163,1,{chargeTime:chargeTime});
      
};

//旋风斩Z轴适配
QJ.MPMZ.tl.ex_checkSenpuuGiriAlignment = function() {

	if (this.time > 240 && !this._fullPower) {
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

//旋风斩判定
QJ.MPMZ.tl.ex_senpuuGiriTrail = function() {
	
    var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = $gameParty.leader().pdr;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
    let Talpha;
	
    if ($gameParty.leader().hasSkill(55)) {
		Talpha = 0.1;
	} else {
		Talpha = 0.75;
	}
	
    QJ.MPMZ.Shoot({
		groupName:['playerSkill','senpuuGiriTrail'],
        img:weaponImage,
        position:[['P'],['P']],
        initialRotation:['S',-180],
        scale:weaponScale,//动态缩放
        moveType:['B',-1,0,0,0,0,0,0,0,0],
		opacity:0,
        imgRotation:['R','64|5.625~56|6.428~48|7.5~40|9~32|11.25~99999|15',true],//剑的旋转，速度是动态的
        anchor:[0.5,1],
        existData:[
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{}]],p:[-1,false,true]},
            {t:['BE',this.index]},      
            {t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}			
        ],
        z:"E",
		collisionBox:['R',8,64],
        judgeAccuracyRotation:10,
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.2,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],
    });
};

//投掷出去的旋风斩
QJ.MPMZ.tl.ex_senpuuGiriThrow = function(GamepadsAttack) {
	
	if(!$gameParty.leader().equips()[0]) return;
    if (this.time <= 180) return;
	var BulletImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
	if (this.data.img != BulletImage ) return;
	
    let posX = this.inheritX();
    let posY = this.inheritY();
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
        if (GamepadsAttack) {
		  var iniRotation = ['S','QJ.MPMZ.tl.ex_gamepadsCheckDirection(true)'];
		} else {
		  var iniRotation = ['M'];
		}
		
    var senpuuGiriThrow = QJ.MPMZ.Shoot({
		groupName:['playerBullet','SenpuuGiri','weaponMarker'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:iniRotation,
        scale:weaponScale,
        imgRotation:['R',36,true],
        anchor:[0.5,0.5],
        existData:[
            {t:['R',[255]],a:['F',QJ.MPMZ.tl.ex_senpuuGiriHold,[this.time]],c:['S','this.time>10']},	
			{t:['Time',180],a:['S','AudioManager.fadeOutBgsByLine(1,9);$gameSwitches.setValue(182, false)']},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_senpuuGiriHold,[this.time]]},		
           // {t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_SSSSSS.call(this,target)'],p:[-1,true,true],c:['T',0,1,true]},				
        ],
		moveType:['S',6],
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
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
            hOrV:true
        }],
    });
	
	//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		senpuuGiriThrow.addMoveData("F",[5,5,QJ.MPMZ.tl.ex_willowLeafEffects,["senpuuGiriThrow"]]);
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
	if (chargeTime && chargeTime > 0) {
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

    /*
    var senpuuGiriHold = QJ.MPMZ.Laser({
			imgPoint:'',img:weaponImage,
			rotation:['M'],
			position:[['S',posX],['S',posY]],
			groupName:['playerBullet','SenpuuGiri','weaponMarker'],
			judgeWidth:14,
			length:['S',72],
			positionStatic:false,
			//rotationStatic:false,
			rotationAdd:['R',36],
			positionSpread:-36,
            existData:[
                {t:['Time',time]},
	    		{t:['S',"!$gameParty.leader().equips()[0]",true]},
	    		{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{}]],p:[-1,false,true]},
            ],
			deadF:[[QJ.MPMZ.tl.ex_senpuuGiriFinishEffect]]
        });
		console.log(senpuuGiriHold.data);
	*/
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
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:Talpha,
            disappearTime:10,
            imgStretchMode:0,
            hOrV:true
        }],
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

//旋风斩三段效果
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
	 //获取异常状态的演出
	 QJ.MPMZ.tl.ex_effectFonts("zhongdu",-1);
};

//玩家中毒效果
QJ.MPMZ.tl.ex_playerPoisonEffect = function(damage) {
	
	if ($gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding) return;
	
    let randomPitch = Math.randomInt(30) + 91;
    AudioManager.playSe({ name: "Poison", volume: 40, pitch: randomPitch, pan: 0 });	
    $gamePlayer.requestAnimation(187);
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
                { t: ['S', '!$gameParty.leader().isStateAffected(9)', true], a: ['F', QJ.MPMZ.tl.ex_playFreezeBreak], c: ['S', 'this.time > 30'] },
                { t: ['B', ['enemyBullet']], a: ['F', QJ.MPMZ.tl.ex_FreezeBreak, [damage]], c: ['S', 'this.time > 30 && Math.random() > 0.8'] }
            ],
            moveF: [
                [30, 3, QJ.MPMZ.tl.ex_playerFrozenStruggle]
            ]
        });
		//冻结时的全屏幕演出
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
  
	if (damage && typeof damage === 'number') {
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
	 //获取异常状态的演出
	 QJ.MPMZ.tl.ex_effectFonts("xueyan", -1);
};

//玩家出血效果
QJ.MPMZ.tl.ex_playerBleedingEffect = function(damage) {
	
	if ($gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding) return;
	$gamePlayer.requestAnimation(186);
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
			  {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_playerBurningEffect,[damage]],p:[-1,true,true],c:['T',15,15,true]},
			  {t:['P'],a:['F',QJ.MPMZ.tl.ex_playerBurningEffect,[damage]],p:[-1,true,true],c:['T',15,15,true]},		
              {t:['B',['freeze']],a:['S',"$gameSystem.triggerGameTimeEventNow('state8')"],d:[0,30],an:181,cb:['C',1]},
              {t:['S','$gameParty.leader().isStateAffected(67)',true],a:['S',"$gameSystem.triggerGameTimeEventNow('state8')"],d:[0,30],an:181},			  
            ],
		 deadF:[[QJ.MPMZ.tl.ex_playerBurningEndEffect]]
        });	
		
		//炎上时的全屏幕演出
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


//玩家炎上效果
QJ.MPMZ.tl.ex_playerBurningEffect = function(damage, args) {

    if ($gameMessage.isBusy() || $gameMap.isEventRunning() || $gameSystem._ZzyTWFTheWorlding) return;

    if (args.target && args.target instanceof Game_Player) {
        $gamePlayer.requestAnimation(188);
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
        args.target.requestAnimation(188);
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
			  [10,0,QJ.MPMZ.tl.ex_playerLeftPunchAttack],
			  [10,120,QJ.MPMZ.tl.ex_PunchAttackEffectRefresh],
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
QJ.MPMZ.tl.ex_playerLeftPunchAttack = function() {

	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 100;
	   return;
	}
   
  if( TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered() ) {
    if (QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack")) return;
	if ($gameParty.leader()._characterName !== "$player") return;
	
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
	
    // 受击音效
    let randomSeArray = ["軽いパンチ1","軽いパンチ2"];
    let randomSe = randomSeArray[Math.floor(Math.random() * randomSeArray.length)];	
    let randomPitch = 80 + Math.randomInt(40);
    AudioManager.playSe({ name: randomSe, volume: 80, pitch: randomPitch, pan: 0 });
	
    // 受击动画
    let angle = Math.randomInt(360);
    let posX = this.inheritX();
    let posY = this.inheritY();
	let fixValue = 20 * this.scaleX;
    posX +=  fixValue * Math.sin(this.rotationMove*Math.PI/180);
    posY += -fixValue * Math.cos(this.rotationMove*Math.PI/180);		
	
    let effectScale = this.scaleX;

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