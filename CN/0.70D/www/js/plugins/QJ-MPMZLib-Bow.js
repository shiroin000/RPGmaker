//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][远程武器-弓]
 * @author 仇九
 *
 * @help 
 * 
 *
 */
//=============================================================================
//
//=============================================================================

//=============================================================================
//弓箭
//=============================================================================

QJ.MPMZ.tl.ex_playerBowAttackCheck = function() {
	

	 if(!$gameParty.leader().equips()[0]) return;
	 let weaponType = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].wtypeId;
	 if (weaponType !== 3) return;	 
	 
	 if($gameMap.getGroupBulletListQJ('playerBow').length > 0) return;
     $gameParty.leader().removeState(62);
	 destroyTemporaryBar(-1);	   
       QJ.MPMZ.Shoot({
            groupName: ['playerBow','attackMonitoring'],
            img: "null1",
            position: [['P'], ['P']],
            initialRotation: ['S',0],
            moveType: ['B',-1],
			opacity:0,
			collisionBox:['C',1],
            existData: [
            ],          
            moveF: [
			[2,2,QJ.MPMZ.tl.ex_playerBowAttackTypeCheck],
            //[2,2,QJ.MPMZ.tl.ex_playerSpecialAttackTrigger],
            ],
        });
	
};

//弓攻击行为检测
QJ.MPMZ.tl.ex_playerBowAttackTypeCheck = function() {

 var GamepadsAttack = false;
 // 手柄检测
 if ( navigator.getGamepads() && navigator.getGamepads()[0] !== null ) {
	 $gamePlayer._directionFix = false;
	 GamepadsAttack = Input.drill_isPadPressed('右摇杆上') || Input.drill_isPadPressed('右摇杆下') || Input.drill_isPadPressed('右摇杆左') || Input.drill_isPadPressed('右摇杆右');
     QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
 }

 if ( TouchInput.drill_isLeftPressed() || GamepadsAttack) {

	 if(!$gameParty.leader().equips()[0]) return;
     if ( QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack") )  return;

     if (SceneManager._scene.drill_GBu_isOnGaugeButton()) return;
	 
	 $dataMap.disableDashing = true;
	 if ($gamePlayer && $gamePlayer._drill_EASe_controller !== undefined) {
	    $gamePlayer.drill_EASe_setSimpleStateNode( ["弓箭蓄力"] );
	 }
	 QJ.MPMZ.tl.ex_bowReady(GamepadsAttack);
     this.setDead({t:['Time',0]});	
   }
   
 if ( TouchInput.drill_isRightPressed() ) {
	 if(!$gameParty.leader().equips()[0]) return;
     if ( QJ.MPMZ.tl.ex_playerAntiClickDetection("normalAttack") )  return;
	 $gameParty.leader().addState(62);
	 $gameVariables.setValue(129, 0);
	 $dataMap.disableDashing = true;
	 if ($gamePlayer && $gamePlayer._drill_EASe_controller !== undefined) {
	    $gamePlayer.drill_EASe_setSimpleStateNode( ["弓箭蓄力"] );
	 }	 
	 QJ.MPMZ.tl.ex_chargedBowDraw();
	 createTemporaryBar(-1,129,300);
     this.setDead({t:['Time',0]});	
   }	 
   
};	
	

//左键拉弓
QJ.MPMZ.tl.ex_bowReady = function(GamepadsAttack) {

		 var seNames = "弓を引き絞る1";
		 var randomPitch = Math.randomInt(20) + 90;
		 var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
		 AudioManager.playSe(se);	

	     var intervalTime = Math.round( 90 * (1 - $gameParty.leader().cnt) );
		     intervalTime = Math.max(intervalTime,5);

        if (GamepadsAttack) {
		  var iniRotation = ['S','QJ.MPMZ.tl.ex_gamepadsCheckDirection()'];
		} else {
		  var iniRotation = ['M'];
		}
		
		$gameSwitches.setValue(14, true);
		var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
		var bowReady = QJ.MPMZ.Shoot({
			groupName:['playerBullet','playerSkill','weaponMarker'],
			img:weaponImage,
			scale:1,
			position:[['P'],['P']],
			initialRotation:iniRotation,
			imgRotation:['F'],
			moveType:['D',true],
			anchor:[0.5,1],
			blendMode:0,
			z:"W",
			collisionBox:['C',5],
			existData:[
				{t:['S','$gameParty.leader().equips()[0]&&$gameParty.leader().equips()[0].baseItemId==4',true]},			
			],
			moveF:[
			   [90,intervalTime,QJ.MPMZ.tl.ex_shootArrows,[GamepadsAttack]]
			],
			deadJS:["$gameSwitches.setValue(14,false);$gamePlayer.drill_EASA_setEnabled(true);$dataMap.disableDashing=false;"]
		});
		
		if (TouchInput.drill_isLeftPressed()) {
			bowReady.addExistData({t:['S','!TouchInput.drill_isLeftPressed()',true],a:['F',QJ.MPMZ.tl.ex_playerBowAttackCheck]});
			bowReady.addMoveData('F',[4,4,QJ.MPMZ.tl.ex_checkBowAlignment]);
		}
		
		if (GamepadsAttack) {
			var AnyPadReleased = "Input.drill_isPadPressed('右摇杆上')||Input.drill_isPadPressed('右摇杆下')||Input.drill_isPadPressed('右摇杆左')||Input.drill_isPadPressed('右摇杆右')";
			bowReady.addExistData({t:['S',AnyPadReleased,false],a:['F',QJ.MPMZ.tl.ex_playerBowAttackCheck]});
			bowReady.addMoveData('F',[4,4,QJ.MPMZ.tl.ex_checkBowAlignment],[GamepadsAttack]);
		}		
};

//手柄状态校准弓箭Z轴
QJ.MPMZ.tl.ex_gamepadsCheckDirection = function(change) {
   if (change) {
    var up    = Input.drill_isPadPressed('左摇杆上');
    var down  = Input.drill_isPadPressed('左摇杆下');
    var left  = Input.drill_isPadPressed('左摇杆左');
    var right = Input.drill_isPadPressed('左摇杆右');	   
   } else {
    var up    = Input.drill_isPadPressed('右摇杆上');
    var down  = Input.drill_isPadPressed('右摇杆下');
    var left  = Input.drill_isPadPressed('右摇杆左');
    var right = Input.drill_isPadPressed('右摇杆右');
   }
    var isPadPressed = up || down || left || right;
    if (isPadPressed) {
        // 上下优先判断
        if (up) {
            if (left) {
                return 315;	  // ↖(上左)
            } else if (right) {
                return 45;	// ↗(上右)
            } else {
                return 0;	// ↑(上)
            }
        } else if (down) {
            if (left) {
                return 225;	// ↙(下左)
            } else if (right) {
                return 135;	// ↘(下右)
            } else {
                return 180;	// ↓(下)
            }
        } else {
            // 这里说明既没上也没下，但检测到左右
            if (left) {
                return 270;	// ←(左)
            } else if (right) {
                return 90;	// →(右)
            }
        }
    } else {
		return 0;
	}
};

//校准弓箭Z轴
QJ.MPMZ.tl.ex_checkBowAlignment = function(GamepadsAttack) {

    if (GamepadsAttack) {
		QJ.MPMZ.tl.ex_GamepadsChangePlayerDirection();
	}

	if (this.rotationImg <= 90 || this.rotationImg >= 270) {
	this.changeAttribute("z","E");
	} else {
	this.changeAttribute("z","W");
	}
	
	if ($gameVariables.value(129) >= 60 && TouchInput.drill_isRightPressed()){ 
	var red = $gameVariables.value(129) - 45;
	this.changeAttribute("tone",[red,0,0,0]);
	}
	
}

//箭矢发射
QJ.MPMZ.tl.ex_shootArrows = function(GamepadsAttack) {
	 if(!$gameParty.leader().equips()[0]) return;
     $gamePlayer.drill_EASe_setAct( "弓箭射击" );
     var seNames = "弓矢を放つ";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	 
    var weaponImage = "weapon/weaponBullet" + $gameParty.leader().equips()[0].baseItemId;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);	
	
        if (GamepadsAttack) {
		  var iniRotation = ['S','QJ.MPMZ.tl.ex_gamepadsCheckBowAlignment()'];
		} else {
		  var iniRotation = ['M'];
		}	
    var Arrows = QJ.MPMZ.Shoot({
        groupName:['playerBullet'],
		collisionBox:['auto'],
        img:weaponImage,
		moveType:['S','0|10~60/6~999/6'],
        position:[['P'],['P']],
		initialRotation:iniRotation,
        imgRotation:['F'],
        existData:[  
			 {t:['Time',180]},
			 {t:['R',[255]],c:['S','this.time > 10']},	
      	     {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{noDurLoss:true}]]},
		 ],		
    });

        //追踪效果
	    if ($gameParty.leader().hasSkill(41)) {
		    Arrows.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	     }	
		 //连发箭
		var extraCount = $gameParty.leader().skillMasteryLevel(99);
	    if (extraCount > 0) {
		
	QJ.MPMZ.Shooter_ArcRange(
		['M'],{
        groupName:['playerBullet'],
		collisionBox:['auto'],
        img:weaponImage,
		moveType:['S','0|10~60/6~999/6'],
        position:[['P'],['P']],
		initialRotation:['M'],
        imgRotation:['F'],
		subBullet:true,
        moveF:Arrows.data.moveF,
        existData:[  
		 {t:['Time',180]},
		 {t:['R',[255]],c:['S','this.time > 10']},	
         {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{noDurLoss:true}]]},
		 ],		
       },-30,30,extraCount,30,1,1);
	}
	// 射箭直接消耗耐久度，并根据箭矢数量增加消耗
 if ($gameParty.leader().equips()[0]) {
   var durabilityDamage = weaponDamage;
       weaponDamage += extraCount * weaponDamage;
	 if ($gameParty.leader().hasSkill(30)) {
		durabilityDamage *= Math.max(0,(100 - $gameParty.leader().skillMasteryLevel(30)) / 100);
	 }	   
	$gameParty.leader().equips()[0].durability -= Math.floor(durabilityDamage);
	// 弓因耐久度归零破损
	if ($gameParty.leader().equips()[0].durability <= 0) {
        if ($gameMap.getGroupBulletListQJ('playerWeaponImg').length > 0) {
          let bulletId = $gameMap.getGroupBulletListQJ('playerWeaponImg')[0];
           $gameMap._mapBulletsQJ[bulletId]._broken = true;
         }
	   }		
     }		
};

//右键蓄力拉弓
QJ.MPMZ.tl.ex_chargedBowDraw = function() {

		 var seNames = "弓を引き絞る1";
		 var randomPitch = Math.randomInt(20) + 90;
		 var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
		 AudioManager.playSe(se);	
		 
		$gameSwitches.setValue(14, true);
		var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
			QJ.MPMZ.Shoot({
			groupName:['playerBullet','playerSkill'],
			img:weaponImage,
			scale:[1,1],
			position:[['P'],['P']],
			initialRotation:['M'],
			imgRotation:['F'],
			moveType:['D',-1,0,0,0,0,0,0,0,0],
			anchor:[0.5,1],
			imgRotation:['F'],
			blendMode:0,
			z:"W",collisionBox:['C',5],
			existData:[
			    {t:['S','$gameParty.leader().equips()[0]&&$gameParty.leader().equips()[0].baseItemId==4',true]},	
				{t:['S','!TouchInput.drill_isRightPressed()',true],a:['F',QJ.MPMZ.tl.ex_playerBowAttackCheck]},   
			],
			moveF:[[4,4,QJ.MPMZ.tl.ex_checkBowAlignment]],
			moveJS:[[60,10,'var number = Math.round( 10 * (1 + $gameParty.leader().cnt));$gameVariables.setValue(129, $gameVariables.value(129)+number)']],
			deadJS:["$dataMap.disableDashing=false;$gameSwitches.setValue(14, false);$gamePlayer.drill_EASA_setEnabled( true );if(this.time>90){QJ.MPMZ.tl.ex_shootChargedArrows.call(this)}"]
		});
	}

//蓄力箭矢发射
QJ.MPMZ.tl.ex_shootChargedArrows = function() {
	 if(!$gameParty.leader().equips()[0]) return;
     $gamePlayer.drill_EASe_setAct( "弓箭射击" );
     var seNames = "弓矢を放つ";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	
    var weaponImage = "weapon/weaponBullet" + $gameParty.leader().equips()[0].baseItemId;
	var damageRatio = Math.min($gameVariables.value(129), 300);
	    damageRatio = 1.5 * (1 + (damageRatio / 100));
	var weaponDamage = Math.round(chahuiUtil.getVarianceDamage(1) * damageRatio);	


    var specialSkill = null;
	var skillMatch = $dataWeapons[$gameParty.leader().equips()[0].baseItemId].note.match(/<specialSkill:([^>]+)>/i);
	if (skillMatch) {
		specialSkill = skillMatch[1];
		specialSkill = eval("QJ.MPMZ.tl.ex_" + specialSkill);
	}
	
    var ChargedArrows = QJ.MPMZ.Shoot({
        groupName:['playerBullet'],
		collisionBox:['auto'],
        img:weaponImage,
		moveType:['S','0|20~120/6~999/6'],
        position:[['P'],['P']],
		initialRotation:['M'],
        imgRotation:['F'],
        afterImage:[['P',weaponImage],'0|1~16/0',16,2],
        existData:[  
		 {t:['Time',120]},
		 {t:['R',[255]],c:['S','this.time > 10']},	
         //{t:['G',['"enemy"','"object"']],a:['C',174,[weaponDamage,0,0,0]],p:[3,false,true]}
		 {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{noDurLoss:true,attackFallOff:true,specifyAddedStatus:true,addedStatusType:true}]],p:[3,false,true,specialSkill]},
		 ],		
    });
        //追踪效果
	    if ($gameParty.leader().hasSkill(41)) {
		    ChargedArrows.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	     }	
		 //连发箭
	var extraCount = $gameParty.leader().skillMasteryLevel(99);
	if (extraCount > 0) {
		
	  QJ.MPMZ.Shooter_ArcRange(
		['M'],{
        groupName:['playerBullet'],collisionBox:['auto'],
        img:weaponImage,
		moveType:['S','0|20~60/6~999/6'],
        position:[['P'],['P']],initialRotation:['M'],
        imgRotation:['F'],
		subBullet:true,
		moveF:ChargedArrows.data.moveF,
        afterImage:[['P',weaponImage],'0|1~16/0',16,2],
        existData:[ 		
		 {t:['Time',360]},
		 {t:['R',[255]],c:['S','this.time > 10']},	
         //{t:['G',['"enemy"','"object"']],a:['C',174,[weaponDamage,0,0,0]],p:[3,false,true]}
		 {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{noDurLoss:true,attackFallOff:true}]],p:[3,false,true,specialSkill]},
		 ],		
       },-5,5,extraCount,2,1,1);
	   	   
	}

	// 射箭直接消耗耐久度，并根据箭矢数量增加消耗
 if ($gameParty.leader().equips()[0]) {
   var durabilityDamage = weaponDamage * 2;
   
    if (specialSkill) durabilityDamage *= 2;
   
       weaponDamage += extraCount * weaponDamage;
	 if ($gameParty.leader().hasSkill(30)) {
		durabilityDamage *= Math.max(0,(100 - $gameParty.leader().skillMasteryLevel(30)) / 100);
	 }	   
	$gameParty.leader().equips()[0].durability -= Math.floor(durabilityDamage);
	// 弓因耐久度归零破损
	if ($gameParty.leader().equips()[0].durability <= 0) {
        if ($gameMap.getGroupBulletListQJ('playerWeaponImg').length > 0) {
          let bulletId = $gameMap.getGroupBulletListQJ('playerWeaponImg')[0];
           $gameMap._mapBulletsQJ[bulletId]._broken = true;
         }
	   }		
     }	
	
}

//火烧云：爆炸箭
QJ.MPMZ.tl.ex_explosiveArrows = function() {

    let posX = this.inheritX();
    let posY = this.inheritY();
        posX +=  24 * Math.sin(this.rotationMove*Math.PI/180);
        posY += -24 * Math.cos(this.rotationMove*Math.PI/180);		
    var magicImage = "Magic/GoVFX_Fire1[4,3,4]";
    var magicScale = 0.5 + ($gameVariables.value(129) / 300);
	magicScale = Math.min(magicScale, 5);
	var magicDamage = 80 + chahuiUtil.getVarianceDamage(3) * 4;
	    magicDamage = Math.round(magicDamage * magicScale);
	
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:magicImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:magicScale,
        moveType:['S',0],
        imgRotation:['F'],
        anchor:[0.5,0.5],
		blendMode:1,
        existData:[	
			{t:['Time',47]},
			{t:['G',['"enemy"','"object"']],a:['C',152,[magicDamage,0,0,0]],p:[-1,true,true],c:['S','this.time > 3 && this.time < 24']},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.attackKnockbackEffect,[null]],p:[-1,false,true],c:['S','this.time > 3 && this.time < 24']},
			{t:['P'],a:['F',QJ.MPMZ.tl.ex_playerDamageCheck,[magicDamage,2]],p:[-1,false,true],c:['S','this.time > 3 && this.time < 24']},
			{t:['P'],a:['F',QJ.MPMZ.tl.attackKnockbackEffect,[null]],p:[-1,false,true],c:['S','this.time > 3 && this.time < 24']},
        ],
        z:"W",
		collisionBox:['C',70],
    });
	
     var seNames = "Fire3";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 80, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	this.setDead({t:['Time',0]});
};

//雪见：冰封箭
QJ.MPMZ.tl.ex_iceboundArrows = function() {

    let posX = this.inheritX();
    let posY = this.inheritY();
        posX +=  24 * Math.sin(this.rotationMove*Math.PI/180);
        posY += -24 * Math.cos(this.rotationMove*Math.PI/180);		
    var magicImage = "Magic/PapoyCore_IceEffect2[6,4]";
    var magicScale = 1 + ($gameVariables.value(129) / 200);
	magicScale = Math.min(magicScale, 3);
	var magicDamage = 20 + chahuiUtil.getVarianceDamage(3) * 0.5;
	    magicDamage = Math.round(magicDamage * magicScale);

    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:magicImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:[magicScale,magicScale],//动态缩放
        moveType:['S',0],
        imgRotation:['F'],
        anchor:[0.5,0.8],
		blendMode:0,
        existData:[	
			{t:['Time',23]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[magicDamage,{noHitEffect:true,magicAttack:true,specifyAddedStatus:true,addedStatusType:9,addedStatusChance:15000}]],p:[-1,true,true],c:['S','this.time > 10']},
        ],
        z:"MF_UG",
		collisionBox:['R',20,60],
		deadF:[[QJ.MPMZ.tl.ex_iceboundArrowsEffect,[magicDamage]]]
    });
	
     var seNames = "氷が砕ける音・氷系の魔法SE（中レベル）";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 70, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	 this.setDead({t:['Time',0]});
	
};

//冰封箭效果
QJ.MPMZ.tl.ex_iceboundArrowsEffect = function(damage) {
	
    let posX = this.inheritX();
    let posY = this.inheritY();
    let magicScale = this.scaleX;
    let	time = Math.floor(60 + 150 * magicScale);
	let endTime = time - 1;
	if (damage && damage > 0) {
		damage = Math.floor(damage * 0.15);
	} else {
		damage = 1;
	}
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:"Magic/PapoyCore_IceEffect2",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:magicScale,
        moveType:['S',0],
		opacity:0.75,
        imgRotation:['F'],
        anchor:[0.5,0.8],
		blendMode:0,
        existData:[	
			{t:['Time',time]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[damage,{noHitEffect:true,magicAttack:true,specifyAddedStatus:true,addedStatusType:9,addedStatusChance:5000}]],p:[-1,true,true],c:['T',0,40,true]},
			//{t:['G',['"enemy"','"object"']],a:['C',152,[magicDamage,0,0,0]],p:[-1,true,true],c:['S','this.time > 20']},
        ],
		moveF:[
		  [endTime,9999,QJ.MPMZ.tl.ex_iceboundArrowsEnd]
		],
        z:"MF_UG",
		collisionBox:['R',20,60],
		//dead:[[QJ.MPMZ.tl.ex_iceboundArrowsEnd]]
    });
};

//冰封箭消失
QJ.MPMZ.tl.ex_iceboundArrowsEnd = function() {
	
    let posX = this.inheritX();
    let posY = this.inheritY();
    let magicScale = this.scaleX; 
	
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:"Magic/PapoyCore_IceEffect2_end[6,2,4]",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:magicScale,
        moveType:['S',0],
		opacity:0.75,
        imgRotation:['F'],
        anchor:[0.5,0.8],
		blendMode:0,
        existData:[	
			{t:['Time',47]},
			//{t:['G',['"enemy"','"object"']],a:['C',152,[magicDamage,0,0,0]],p:[-1,true,true],c:['S','this.time > 20']},
        ],
        z:"MF_UG",
		collisionBox:['R',20,60],
		//dead:[[QJ.MPMZ.tl.ex_iceboundArrowsEnd]]
    });
};

//千鸟-雷击箭
QJ.MPMZ.tl.ex_lightningBolt = function() {


    let posX = this.inheritX();
    let posY = this.inheritY();
    var magicScale = 0.2 + ($gameVariables.value(129) / 200);
	magicScale = Math.min(magicScale, 1.5);
	let magicScaleX = magicScale;
	let magicScaleY = magicScale;
	if(Math.random() > 0.5) magicScaleX = -magicScale;
	var magicDamage = Math.round(chahuiUtil.getVarianceDamage(2) * magicScale);	
	
    let bullet = QJ.MPMZ.Shoot({
        img:"ef01_54_MagicAll_Thunder[6,5,2]",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        imgRotation:['F'],
        scale:[magicScaleX,magicScaleY],
        opacity:1,
		anchor:[0.5,0.75],
        moveType:['S',0],
		collisionBox:['R',160,160],
        blendMode:1,
        existData:[	
		    {t:['Time',59]},
        ],
        z:"W",
		moveJS:[[1,9999,'$gamePlayer.requestAnimation(184)']],
    });
	
	if(Math.random() > 0.5){
	bullet.addMoveData("F",[30,9999,QJ.MPMZ.tl.ex_electricTrap]);
	}
}

//电击陷阱
QJ.MPMZ.tl.ex_electricTrap = function() {
    let posX = this.inheritX();
    let posY = this.inheritY();
	let magicScaleX = this.scaleY;
	let magicScaleY = magicScaleX * 0.6;
	
	   QJ.MPMZ.Shoot({
        img:"electricTrap[22,2,2]",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        imgRotation:['F'],
        scale:[magicScaleX,magicScaleY],
        opacity:1,
        moveType:['S',0],
        blendMode:3,
		collisionBox:['R',160,160],
        existData:[	
		    {t:['Time',300]},
			{t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_enemyparalysis.call(target,20)'],p:[-1,true,true],c:['T',0,30,true]},
			{t:['P'],a:['S','QJ.MPMZ.tl.ex_playerElectrified(1)'],p:[-1,true,true],c:['T',0,120,true]},
        ],
        z:"E",
        moveF: [ 
        ]
    });
}