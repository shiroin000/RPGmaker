//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][武器特效模板]
 * @author 仇九
 *
 * @help 
 * 
 *
 */
//=============================================================================
//近战武器特效
//=============================================================================

// 斩断、击飞子弹
QJ.MPMZ.tl.ex_weaponParry = function(target) {
    if (!target) return;

    let posX = target.inheritX();
    let posY = target.inheritY();
    
    if (!$gameParty.leader().equips()[0]) return;
    
    let weapon = $gameParty.leader().equips()[0];
    let wtype = weapon.wtypeId;

    if (wtype === 1) {
        // 剑类武器 - 斩断
        target.setDead({ t: ['Time', 0], d: [0, 15] });

        // 斩断音效
        let se = {
            name: "剣の必殺技発動",
            volume: 100,
            pitch: Math.randomInt(60) + 70,
            pan: 0
        };
        AudioManager.playSe(se);

        // 斩击特效
        QJ.MPMZ.Shoot({
            img: '01_斬撃[3,5,2]',
            initialRotation: ['S', Math.randomInt(360)],
            position: [['S', posX], ['S', posY]],
            scale: [1, 1],
            moveType: ['S', 0],
            alpha: 0.6,
            blendMode: 1,
            z: "W",
            existData: [{ t: ['Time', 29] }],
        });

        return;
    }

    if (wtype === 2) {
        // 棍棒类武器 - 击飞
        let parryRotation = (target.rotationMove + 180) % 360;
        target.rotationMove = parryRotation;
        target._countered = true;

        // 击飞特效
        QJ.MPMZ.Shoot({
            img: 'animehit[5,4]',
            position: [['S', posX], ['S', posY]],
            scale: [1.5, 1.5],
            moveType: ['S', 0],
            alpha: 1,
            z: "W",
            existData: [{ t: ['Time', 18] }],
        });

        // 击飞音效
        let se = {
            name: "金属バットで打つ（至近距離から録音）",
            volume: 60,
            pitch: Math.randomInt(60) + 70,
            pan: 0
        };
        AudioManager.playSe(se);
    }
};

//击退效果
QJ.MPMZ.tl.attackKnockbackEffect = function(power,args) {

	let posX = this.inheritX(); 
    let posY = this.inheritY();
	let tarX = 0;
	let tarY = 0;
    let angle = 0;
	if (!power) power = this.scaleX;
	if (!args.target) return;	
	
	tarX = args.target.screenShootXQJ();
	tarY = args.target.screenShootYQJ();
	angle = QJ.calculateAngleByTwoPointAngle(posX, posY, tarX, tarY);
	
    if ( args.target instanceof Game_Player ) {	
	
	QJ.MPMZ.tl.ex_jumpWithAngle(-1,angle,power);
	
	} else if ( args.target instanceof Game_Event ) {
		
	let eventId = args.target._eventId;
	QJ.MPMZ.tl.ex_jumpWithAngle(eventId,angle,power);
	
	}	
};


//飞行物追踪效果
QJ.MPMZ.tl.ex_projectileTrackingEffect = function() {
	

	let enabled = this._Tracking || false;
	let posX = this.inheritX();
    let posY = this.inheritY();	  
	let range = 120;
	let angle = 10;
	let skillLevel = $gameParty.leader().skillMasteryLevel(41);
	range += 20 * skillLevel;
	angle += 4 * skillLevel;
	if (QJ.MPMZ.rangeAtk([['S',posX],['S',posY]],['G','"enemy"'],['C',3,1],['C',range]).length > 0) {
		if (enabled) return;
		this.remMoveType = this.data.moveType;
		this.changeAttribute("moveType",['TG','"enemy"',10,angle,Math.floor(angle/2)]);
		this.changeAttribute("tone",['20|0~70/134~20/0','20|0~70/61~20/0','20|0~70/255~20/0',0]);
		this._Tracking = true;
	} else {
		if (enabled) {
		this.changeAttribute("moveType",this.remMoveType);	
		this.changeAttribute("tone",[0,0,0,0]);
		this._Tracking = false;
		}
	}

};

//柳叶剑-飞镖
QJ.MPMZ.tl.ex_willowLeafEffects = function(type) {
  if(!type) return;
  //旋风斩蓄力中时点
  if (type === "senpuuGiri" && this.time >= 90) {
	  
        let seNames = "Wind7";
        let randomPitch = Math.randomInt(40) + 81;
        let se = { name: seNames, volume: 60, pitch: randomPitch, pan: 0 };
        AudioManager.playSe(se);	  
	    let id = this.index;
        let weaponScale = $gameParty.leader().pdr;
	  	let weaponDamage = 10 + Math.floor(0.2 * chahuiUtil.getVarianceDamage(1));
	    let time = 240;
	    if ($gameParty.leader().hasSkill(41)) {
		  time += 120;
	     }
    var bullet = QJ.MPMZ.Shoot({
        groupName:['playerBullet'],
		collisionBox:['auto'],
		img:"weapon/weaponBullet80",
		moveType:['S',9],
        position:[['B',id],['B',id]],
		initialRotation:['S','Math.randomInt(360)'],
        imgRotation:['F'],
		imgRotation:['R',36,true], 
		scale:weaponScale,
		trailEffect:[{
			img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
			existTime:0,
			blendMode:1,
			alpha:0.75,
			disappearTime:10,
			imgStretchMode:0,
			ifProjctileWait:true,hOrV:true 
			}],
        existData:[  
		{t:['Time',time]},	
		{t:['NP'],rb:[1,false,true]},	
        {t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]]} 
		],		
		});
        //追踪效果
	    if ($gameParty.leader().hasSkill(41)) {
		    bullet.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	     }	
        return true;		 
     }

  
  //旋风斩投掷后
  if (type === "senpuuGiriHold" || type === "senpuuGiriThrow") {
	  
  let baseValue = 300;
  let luk = $gameParty.leader().luk;
      luk = Math.max(0, Math.min(600, luk)); 
  let adjustedValue = baseValue + (luk / 600) * 700;
  if (Math.randomInt(1001) > adjustedValue) return;   
  
  var seNames = "Wind7";
  var randomPitch = Math.randomInt(40) + 81;
  var se = { name: seNames, volume: 60, pitch: randomPitch, pan: 0 };
  AudioManager.playSe(se);
	  
    let posX = this.inheritX();
    let posY = this.inheritY();	  
    let weaponScale = $gameParty.leader().pdr;
	let weaponDamage = 10 + Math.floor(0.2 * chahuiUtil.getVarianceDamage(1));
	let time = 240;
	if ($gameParty.leader().hasSkill(41)) {
		time += 120;
	}
    var bullet = QJ.MPMZ.Shoot({
        groupName:['playerBullet'],
		collisionBox:['auto'],
        img:"weapon/weaponBullet80",
		moveType:['S',9],
        position:[['S',posX],['S',posY]],
		initialRotation:['S',Math.randomInt(360)],
		imgRotation:['R',36,true],
        scale:weaponScale,
		trailEffect:[{
			img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
			existTime:0,
			blendMode:1,
			alpha:0.75,
			disappearTime:10,
			imgStretchMode:0,
			ifProjctileWait:true,
			hOrV:true 
			}],
        existData:[  
		{t:['Time',time]},	
		{t:['NP'],rb:[1,false,true]},	
        {t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]]} 
		],
        //moveF:[[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]],		
    });

	//追踪效果
	if ($gameParty.leader().hasSkill(41)) {
		bullet.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	}
	return true;
  }
};

//香蕉大剑：香蕉榴弹炮
QJ.MPMZ.tl.ex_activateBananaGrenade = function(type) {
	
  if(!type) return;	
  if (type === "senpuuGiri" && Math.random() > 0.5) {	
  
     if ( this.data.img.includes("alt") ) return;  
     if ($gameParty.leader().equips()[0]) {
		 $gameParty.leader().equips()[0].durability -= 300;
	 }
     var seNames = "Explosion1" ;
     var se = { name: seNames, volume: 80, pitch: 150, pan: 0 };
     AudioManager.playSe(se);  
	 this.changeAttribute("img","weapon/weapon60_alt");
	 QJ.MPMZ.deleteProjectile('senpuuGiriTrail');
	 
     let posX = this.inheritX();
     let posY = this.inheritY();
     let angle = this.inheritRotation();	 
     var weaponScale = this.scaleX;
     QJ.MPMZ.Shoot({
		groupName:['playerBullet','bananaGrenade'],
        img:"weapon/weaponTrail60_alt",
        position:[['S',posX],['S',posY]],
        initialRotation:['M'],
		imgRotation:['F',180],
        scale:weaponScale,
        anchor:[0.5,0.5],
        existData:[
           // {t:['R',[255]],a:['F',QJ.MPMZ.tl.ex_senpuuGiriHold]},	
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_bananaGrenadeExplosive]},					
        ],
		moveType:['S',7],
		moveF:[
		],
        z:"E",collisionBox:['R',8,64],
        judgeAccuracyRotation:0,//判定精度，防止挥剑速度太快导致无法攻击到敌人
		judgeAccuracyMove:8,
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:0.75,
            disappearTime:10,
            imgStretchMode:0,
            hOrV:true
        }],
    });	 
  }
  
};

//香蕉榴弹炮爆炸
QJ.MPMZ.tl.ex_bananaGrenadeExplosive = function() {
	
	let posX = this.inheritX(); 
    let posY = this.inheritY();
	
     var se = { name: "Explosion2", volume: 60, pitch: 100, pan: 0 };
     AudioManager.playSe(se);
	
    QJ.MPMZ.Shoot({
		groupName: ['JackBomb'],
        img:'MGC_W2_Explosion_V4_Lv1[5,10,2]',
        position:[['S',posX],['S',posY]],
		scale:[3,3],
        initialRotation:['S',0],
        imgRotation:['F'],
		collisionBox:['C',60],
		opacity:1,
        moveType:['S',0],
        blendMode:1,
        existData:[	
		{t:['Time',98]},
		{t:['P'],a:['F',QJ.MPMZ.tl.ex_JackBombExplode,[1]],p:[-1,true,true],c:['S','this.time > 16 && this.time < 24']},
		{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_JackBombExplode,[1]],p:[-1,true,true],c:['S','this.time > 16 && this.time < 24']},
        ],       
    });
	
};

//臭鱼骨-恶臭
QJ.MPMZ.tl.ex_stenchWeaponEffect = function() {
	
	if ($gameMap.getGroupBulletListQJ('stenchWeapon').length > 0) return;
      QJ.MPMZ.Shoot({
        img:"Absorb0002[5,4,4]",
		groupName: ['stenchWeapon'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        scale:[2,2],
        opacity:0.6,
        moveType:['D',true],
        collisionBox:['C',24],
        blendMode:0,
        existData:[
		  {t:['SW',151,false],d:[1,20,0.1]},
          {t:['G',['"enemy"','"NPC"']],a:[],p:[-1,true,true,QJ.MPMZ.tl.ex_enemyInFear],d:['T',15,15,true]}	
        ],
        z:"W"
    });
};

//远程剑气斩击
QJ.MPMZ.tl.ex_swordEnergyAttack = function(rate,randomAngle) {

	if(!rate) var rate = 0.75;
	let weaponDamage = 10 + Math.round( rate * chahuiUtil.getVarianceDamage(1) * 0.6 );
	rate = "0|0~10/" + rate + "~999/" + rate;
	rate = [rate,rate];
	let posX = this.inheritX(); 
    let posY = this.inheritY();	
	let rotation;

    if (randomAngle && typeof randomAngle === 'number' ) {
		if (randomAngle == 1) {
		rotation = ['M'];   
	   } else if (randomAngle == 2) {
		rotation = ['S',Math.randomInt(360)];
	  }
	} else {
		rotation = ['PD'];
	}
	
    var swordEnergy = QJ.MPMZ.Shoot({
        img:"swordEnergyAttack",
		groupName: ['playerBullet'],
        position:[['S',posX],['S',posY]],
        initialRotation:rotation,
        imgRotation:['F'],
        scale:rate,
        moveType:['S','0|0~10/10~360/16~999|16'],
		opacity:0.75,
		collisionBox:['R',192,8],
		anchor:[0.5,0.65],
        existData:[
		  {t:['R',[255]]},
          {t:['Time',120]},
          {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{}]],p:[4,false,true]},		  
        ],
        particles:[
        {img:'swordEnergyAttack',
		scaleXMin:rate,
		scaleXMax:rate,
		intervalTime:-4,
		synScale:true,
		existTime:0,
		offsetMin:[0,0,0],
		offsetMax:[0,0,0],
		offset:[0,0,0],
		disappearScale:1,
		disappearTime:8,
		opacityMax:0.4,
		opacityMin:0.1,
		moveType:['0','0']}
        ]
    });
	
		//追踪效果
	if ($gameParty.leader().hasSkill(41)) {
		swordEnergy.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_projectileTrackingEffect]);
	}
	 let random = 80 + Math.randomInt(40);
     let se = { name: "剣で斬る2", volume: 70, pitch: random, pan: 0 };
     AudioManager.playSe(se);
	
};

// 忍者系技能-天诛触发检查
QJ.MPMZ.tl.ex_skillTenchuuCheck = function() {
	$gamePlayer.drill_EASe_stopAct();
	$gamePlayer.drill_EASe_setSimpleStateNode( ["技能动作1"] );
	QJ.MPMZ.Shoot({
		groupName:['tenchuuCheck'],
        img:"null1",
        position:[['M'],['M']],
        initialRotation:['S',0],
        scale:1,
        moveType:['S',0],
        opacity:1,
        blendMode:0,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',60],a:['F',QJ.MPMZ.tl.ex_skillTenchuu,[{result:"fail"}]]},
			{t:['G',['"enemy"']],a:['F',QJ.MPMZ.tl.ex_skillTenchuu,[{result:"succeed"}]],c:['S','this.time > 30']},
        ],
		collisionBox:['C',24],
    });
	
    //$gameScreen._particle.particleClear('warp')
};

// 忍者系技能-天诛
QJ.MPMZ.tl.ex_skillTenchuu = function(extraData,args) {
	
	if (extraData.result && extraData.result == "fail") {
		$gameScreen._particle.particleSet(0,'warp','player','warp_hole_c');
	}
	
	
	 if (args && args.target && args.target instanceof Game_Event) {
		 
		 if (extraData.result && extraData.result == "succeed") {
			$gameScreen._particle.particleSet(0,'warp','player','warp_hole_c');
	QJ.MPMZ.Shoot({
		groupName:['tenchuuCheck'],
        img:"null1",
        moveType:['S',0],
		moveJS:[
		     [20,999,"$gameScreen._particle.particleClear('warp');$gamePlayer.drill_EFOE_playHidingVerticalFlat( 10,2, false );"]
		],
        existData:[
            {t:['Time',40],a:['F',QJ.MPMZ.tl.ex_skillTenchuuTeleportation,[args.target]]},
        ],
      });			

		 }
		 
	 }
};

// 忍者系技能-天诛瞬移
QJ.MPMZ.tl.ex_skillTenchuuTeleportation = function(target) {
	
	        if (!target) return;
            var direction = target.direction();
			var posX = target.centerRealX();
			var posY = target.centerRealY();
			
	        switch (direction) {
              case 2: // 下
              posY -= 1; 
              break;
              case 4: // 左
              posX += 1;     
              break;
              case 6: // 右
              posX -= 1;        
              break;
              case 8: // 上
              posY += 1;      
              break;
           }		
			 $gamePlayer.locate(posX, posY);	
			 $gamePlayer.startOpacity(20, 255);
			 $gameScreen._particle.particleGroupSet(0,'weapon_b6','player');
			 $gamePlayer.drill_EASA_setEnabled( true );
	
};

// 古树残骸生长效果
QJ.MPMZ.tl.ex_AncientTreeRemnantEffect = function(killed) {
	    
		if (!$gameParty.leader().equips()[0]) return;
	
	    let weapon = $gameParty.leader().equips()[0];
		
		if (killed) {
		let heal = 3 * $gameParty.leader().equips()[0].params[2];	
            heal += $gameParty.leader().paramFlat(2);		
		    $gameParty.leader().equips()[0].durability += heal;	
			$gameParty.leader().equips()[0].durability = Math.min($gameParty.leader().equips()[0].durability, 114514);
		}	
		
		let durMax = weapon.durMax;
        let durability = weapon.durability;
		let durRate = Math.floor(100 * (durability / durMax));
		
		if (durRate > 100) {
		let bonus = durRate - 100;
		    weapon.flatParams[2] = bonus;
		}
		
};

// 普通攻击燕返
QJ.MPMZ.tl.meleeAttackTsubameGaeshi = function() {
	
	if(!$gameParty.leader().equips()[0]) return;

    var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = $gameParty.leader().pdr;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
	// 剑术修行加成
    if ( $gameParty.leader().hasSkill(26) ) {
        weaponDamage *= (100 + (1.8**$gameActors.actor(1).skillMasteryLevel(26))) / 100;
	}
    let level = $gameParty.leader().skillMasteryLevel(26);
	var rotation,angle,time,trailRotation,skillTime,zz;
	
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
	
	if ($gameSwitches.value(17)) {
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
	} else {
		zz = "MF_BG";
	}
	
	// 展示武器演出
    QJ.MPMZ.Shoot({
        img:weaponImage,
		groupName:['meleeAttack','playerSkill'],
        position:[['P'],['P']],
        initialRotation:['PD',rotation],
        scale:scaleXY,
		opacity:0.25,
		hue:180,
        moveType:['D',true],
        imgRotation:['R',angle,true],
        anchor:Anchor,
        existData:[
            {t:['Time',time],d:[0,10]}           
        ],
        z:zz,
		collisionBox:['C',1],
    });	
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
            {t:['Time',time]},
            {t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[Math.floor(weaponDamage),{extraAttack:true}]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
		collisionBox:['R',8,64],
        judgeAccuracyRotation:5,				
    });	
	
};

//旋风斩燕返
QJ.MPMZ.tl.ex_senpuuGiriTsubameGaeshi = function(GamepadsAttack) {
	
	if(!$gameParty.leader().equips()[0]) return;
		
    var weaponImage = "weapon/weapon" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = $gameParty.leader().pdr;
	
    var senpuuGiri = QJ.MPMZ.Shoot({
		groupName:['playerSkill','senpuuGiri'],
        img:weaponImage,
        position:[['P'],['P']],
        initialRotation:['S',-225],
        scale:[-weaponScale,weaponScale],//动态缩放
        moveType:['D',false],
		opacity:0.25,
		hue:180,
        imgRotation:['R','64|5.625~56|6.428~48|7.5~40|9~32|11.25~99999|15',true],//剑的旋转，速度是动态的
        anchor:[1.05,1.05],
        existData:[
		    {t:['S','$gameParty.leader().equips()[0]&&$gameParty.leader().equips()[0].baseItemId==4',true]},
			{t:['S','Fuku_Plugins.EventTremble.getRemainingCycles(-1) === 0',false]},	
            {t:['S','$gameMap.regionId( Math.floor($gamePlayer.centerRealX()), Math.floor($gamePlayer.centerRealY()) ) === 8',true]},				
        ],
        z:"MF_BG",
		collisionBox:['C',1],
    });
	
	QJ.MPMZ.tl.ex_senpuuGiriTrail.call(senpuuGiri);
		//读取操作模式
    if (GamepadsAttack) {
		var AnyPadReleased = "Input.drill_isPadPressed('右摇杆上')||Input.drill_isPadPressed('右摇杆下')||Input.drill_isPadPressed('右摇杆左')||Input.drill_isPadPressed('右摇杆右')";
		senpuuGiri.addExistData({t:['S',AnyPadReleased,false]});
	} else {
		senpuuGiri.addExistData({t:['S','!TouchInput.drill_isRightPressed()||!$gameParty.leader().equips()[0]',true]});
	}
	
		//柳叶剑特效
	if ($gameParty.leader().equips()[0].baseItemId === 80) {
		senpuuGiri.addMoveData("F",[10,10,QJ.MPMZ.tl.ex_willowLeafEffects,["senpuuGiri"]]);
	}
	//斩裂剑-斩剑波
	if ($gameParty.leader().hasSkill(44)) {
		senpuuGiri.addMoveData("JS",[64,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[120,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[168,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[208,99999,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
		senpuuGiri.addMoveData("JS",[240,24,'QJ.MPMZ.tl.ex_swordEnergyAttack.call(this, undefined, 1)']);
	}		
};

//旋风斩燕返判定
QJ.MPMZ.tl.ex_senpuuGiriTsubameGaeshiTrail = function() {
	
    var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = $gameParty.leader().pdr;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
	
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
			//{t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]],p:[-1,true,true]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[weaponDamage,{extraAttack:true}]],p:[-1,false,true]},
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
			alpha:0.1,
            disappearTime:4,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],
    });
};


// 巨大蟹钳-夹住目标
QJ.MPMZ.tl.ex_giantCrabClawGrabsEnemy = function(args) {

  if (args && args.target && args.target instanceof Game_Event) {

    let weaponId = $gameParty.leader().equips()[0].id;
	$gameParty.leader().changeEquipById(1, 4);
    $gameMap.steupCEQJ(100,1,{equipChange:true,equipIndex:-1});
	let diffX = this.inheritX() - args.target.screenBoxXShowQJ();
	let diffY = this.inheritY() - args.target.screenBoxYShowQJ();
	
	let target = args.target._eventId;
    let posX = `if($gameMap.event(${target})){
                    $gameMap.event(${target}).screenBoxXShowQJ()+${diffX};
                } else {
                    $gameMap.displayX();
                }`;

    let posY = `if($gameMap.event(${target})){
                    $gameMap.event(${target}).screenBoxYShowQJ()+${diffY};
                } else {
                    $gameMap.displayX();
                }`;
    let angle = this.inheritRotation()+180;
    let weaponImage = "weapon/weaponTrail14";
    let weaponScale = this.scaleX;
	let damage = Math.abs($dataWeapons[weaponId].params[2] * weaponScale);

	QJ.MPMZ.Shoot({
		groupName:['playerBullet','giantCrabClaw'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',angle],
        scale:weaponScale,
        imgRotation:['F'],
		countDown:4,
        anchor:[0.5,0.75],
        existData:[
		    {t:['Time',7200],a:['F',QJ.MPMZ.tl.ex_giantCrabClawDrops,[weaponId]]},
			{t:['S',`$gameSelfSwitches.value([${$gameMap.mapId()}, ${target}, 'D'])||$gameMap.event(${target})`,true],a:['F',QJ.MPMZ.tl.ex_giantCrabClawDrops,[weaponId]]},
			{t:['S','this.data.countDown<=0',true],a:['F',QJ.MPMZ.tl.ex_giantCrabClawDrops,[weaponId]]},
			{t:['G',['"enemy"','"object"']],a:['S','this.data.countDown+=1'],p:[-1,false,true],c:['T',0,15,true]},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[damage,{noHitEffect:true,noDurLoss:true,specifyAddedStatus:true}]],p:[-1,false,true],c:['T',0,15,true]},
        ],
		moveType:['D',true],
        z:"W",
		collisionBox:['R',6,48],
		moveJS:[
		  [0,15,'this.data.countDown-=1']
		],

    });
	
	$gameParty.loseItem($dataWeapons[weaponId], 1);
  }
};

// 蟹钳松了，返还武器
QJ.MPMZ.tl.ex_giantCrabClawDrops = function(weaponId) {
	
    let weapon = $dataWeapons[weaponId];
	let dropX = this.x / 48;
	let dropY = this.y / 48;
    dingk.Loot.specifyPositionGetMapDrops(dropX,dropY,weapon);
};


// 剑刃风暴
QJ.MPMZ.tl.ex_skillBladestorm = function() {
	
   if (!this) return;
   let user;
   if (this instanceof Game_Player) {
	   user = -1;
   }
   if (this instanceof Game_Event) {
	   user = this._eventId;	   
   }    
   
   let posX = this.screenShootXQJ();
   let posY = this.screenShootYQJ();
   
   var damage = 15;
   
   var bladestorm = QJ.MPMZ.Shoot({
		groupName:['bladestorm'],
        img:"Magic/air_start[7,3]",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:1,
        imgRotation:['S',0],
        anchor:[0.4,0.7],
		opacity:0.6,
        existData:[
		    {t:['Time',3000],a:['F',QJ.MPMZ.tl.ex_skillBladestormFinish]},
			{t:['R',[255]],a:['F',QJ.MPMZ.tl.ex_skillBladestormFinish],c:['S','this.time>22']},
			{t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[damage,{noHitEffect:true,noDurLoss:true,specifyAddedStatus:true}]],p:[-1,false,true],c:['T',0,10,true]},
        ],
		moveType:['TP',4,2,10],
        z:"MF_UG",
		collisionBox:['R',20,48],
		moveJS:[
		  [20,9999,"this.changeAttribute('img','Magic/air_loop[6,3]')"]
		],
		moveF:[
		  [6,6,QJ.MPMZ.tl.ex_skillBladestormEffect]
		]
    });  
	
	if (user > 0) {
		bladestorm.addExistData();
	} else {
		bladestorm.addExistData({t:['G',['"enemy"','"object"']],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[damage,{magicAttack:true,noHitEffect:true,noDurLoss:true,specifyAddedStatus:true}]],p:[-1,false,true],c:['T',0,10,true]});
	}
	
};

// 剑刃风暴结束
QJ.MPMZ.tl.ex_skillBladestormEffect = function() {
	
   let posX = this.x / 48;
   let posY = this.y / 48;
   var name = "dust_walk" + this.time;
   var data = $gameScreen._particle.particleSet(0, name, 'tilemap', 'dust_walk', 'below', posX, posY);   
   $gameScreen._particle.reservePluginCommand(30,{},["clear",name],1);
   
   if ($gameMap.regionId(Math.floor(posX), Math.floor(posY)) === 5) {
      var name = "grass_walk" + this.time;
      var data = $gameScreen._particle.particleSet(0, name, 'tilemap', 'grass_walk', 'below', posX, posY);   
      $gameScreen._particle.reservePluginCommand(30,{},["clear",name],1);	   
   }
   
};

// 剑刃风暴结束
QJ.MPMZ.tl.ex_skillBladestormFinish = function() {
	
    let posX = this.inheritX();
    let posY = this.inheritY();
	let scale = this.scaleX;
   
 	QJ.MPMZ.Shoot({
		groupName:['bladestorm'],
        img:"Magic/air_dismiss[6,3]",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:scale,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[
		    {t:['Time',17]},
        ],
		moveType:['S',0],
        z:"MF_UG",
		collisionBox:['C',10],

    }); 	
};