//=============================================================================
 /*:
 * @plugindesc 动画脚本
 * @author shiroin
 */
//=============================================================================

// 妹妹挂机打瞌睡
QJ.MPMZ.tl._imoutoUtilImoutoBlinking = function () {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}

	this._frames = this._frames || 1;

	if ( !$gameScreen.picture(5) || !$gameScreen.picture(5).name().includes("dozingOff") ) {
		this.setDead({t:['Time',0]});
		return;		
	}
	if ( $gameScreen.picture(5)._opacity < 250 ) {
		this._coolDown = 60;	
		return;		
	}
	
	let IMG = "sis_room/sis_room_dozingOff" + this._frames;
    $gameScreen.changePictureName(5, IMG);
	
	if (this._frames >= 4) {
		this._coolDown = 6;
		this._frames -= 1;
		this._upend = true;
		return;
	}

	if (this._upend && this._frames <= 1) {
		this._coolDown = Math.randomInt(120) + 180;
		this._frames += 1;
		this._upend = false;
		return;
	}
	
	if (this._upend) {
		this._frames -= 1;
	} else {
		this._frames += 1;
	}
    this._coolDown = 2;	
	
};

// 妹妹一个人玩游戏手柄动画
QJ.MPMZ.tl._imoutoUtilImoutoSoloPlay = function () {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}

	this._frames = this._frames || 0;
	
	let IMG = "alt_sister_normal_hand" + this._frames;
	$gameScreen.showPictureFromPath(8, "game_itazura", IMG, 0, 0, 0, 100, 100, 255, 0);	
	
	if (this._frames >= 6) {
		this._coolDown = Math.randomInt(4) + 2;
		this._frames -= 1;
		this._upend = true;
		return;
	}

	if (this._upend && this._frames <= 0) {
		this._coolDown = Math.randomInt(4) + 2;
		this._frames += 1;
		this._upend = false;
		return;
	}
	
	if (this._upend) {
		this._frames -= 1;
	} else {
		this._frames += 1;
	}
    this._coolDown = Math.randomInt(4) + 2;	
};

// 洗面所偷窥妹妹脱衣服拉门监听
QJ.MPMZ.tl._imoutoUtilDragToOpenWashroomDoorDetection = function (Reverse) {

    const pic = $gameScreen.picture(50);
    if (!pic) return;

    let type  = 0;
    const dx  = pic.drill_PDr_getDraggingXOffset_Private();
	
	// 被妹妹发现关上门的情形
	if (Reverse) {
		if ( (pic.drill_PDr_isDraging() && dx >= 660) ) {
			type  = 1;
		}
	}	
	
    if (pic.drill_PDr_isDraging()) {
        if      (dx < -1000) type = 1;          //  对应开门闯入
        else if (dx < -800) type = 2;          //  对应慢慢拉开门但触发了妹妹警觉
    } else if (dx < -200) {
        type = 3;                //  最低限度触发偷窥的距离
    }
    if (type === 0) return;                         

    // 锁定拖拽 
    pic.drill_PDr_setCanDrag(false);
    pic.drill_PDr_mergeDragPosition();

	// 被妹妹发现关上门的情形
	if (Reverse) {
		pic.drill_PCE_playSustainingShakeLR( 18,6,1 );		
		AudioManager.playSe({ name: "窓を閉める", volume: 70, pitch: 100, pan: 0 });
		$gameSelfSwitches.setValue([$gameMap.mapId(), 23, 'B'], false);
		$gameSelfSwitches.setValue([$gameMap.mapId(), 23, 'D'], true);
		this.setDead({t:['Time',0]});
		return;
	}
	
	let RushIn = false;
	
	if (type == 1 || pic._x < -1800) {
		RushIn = true;
        $gameSelfSwitches.setValue([$gameMap.mapId(), 23, 'B'], true);
        // 门贴图淡出 
        [49, 50].forEach(id => {
          const data = { type: 'opacity', value: -255, time: 60 };
          $gameScreen.picture(id)?._drill_PSh_commandChangeTank.push(data);
      });
        AudioManager.playSe({ name: "ふすまを開ける2", volume: 70, pitch: 100, pan: 0 });	   
    } else if (type == 2) {
        $gameSelfSwitches.setValue([$gameMap.mapId(), 23, 'B'], true);
        AudioManager.playSe({ name: "窓を閉める", volume: 70, pitch: 100, pan: 0 });	 
        pic.drill_PCE_playSustainingShakeLR( 18,6,1 );		
    } 

    // 移除模糊滤镜 
    [1, 10, 12, 13].forEach(id => {
        const p = $gameScreen.picture(id);
        if (p) {
            const filterId = `blur${id}`;
            $gameMap.moveFilter(filterId, [0], 30);
            $gameMap.eraseFilterAfterMove(filterId);
        }
    });
    // 计算偷窥成功的概率
	let result = false;
    let distance = pic._x + 920;
        distance = Math.min(Math.abs(distance), 800); 
    let adjustment = ((distance - 200) / 600) * 900;
    let probability = Math.round(100 + adjustment);
    if ( Math.randomInt(1000) > probability ) {
       result = true;
	   // 未被妹妹发现，成功偷窥
	   let pName = $gameScreen.picture(10).name();
	   if (!pName.includes("ura")) {
	   if ($gameActors.actor(2).equips()[1]) {		   
           pName = pName.replace(/_bareta$/, "_successful");
	   } else {
		   pName = "washroom_Imouto_datsui_nude_successful";
	   }
       $gameScreen.setVideoPictureName(pName, true, false);
	   $gameScreen.showPicture(10, '', 0, 960, 180, 50, 50, 255, 0);
       $gameScreen.picture(10).setVideoPause(true);		
	  }	   
    } else {
		// 背后视角被妹妹察觉时，存在特殊分歧
		let pName = $gameScreen.picture(10).name();
		if (pName.includes("ura") && $gameVariables.value(18) > 3) {
		  pName = pName.replace(/normal$/, "seduction");
		  $gameScreen.setVideoPictureName(pName, true, false);
		  $gameScreen.showPicture(10, '', 0, 1100, 180, 50, 50, 255, 0);
		  $gameScreen.picture(10).setVideoPause(true);
		}
	}
	
	$gameMap.event(23).steupCEQJ(2,{peekResult:result,isRushIn:RushIn});
	this.setDead({t:['Time',0]});
	this._end = true;
};

//妹妹胖次款式检查
QJ.MPMZ.tl._imoutoUtilPantiesTpyeCheck = function(noPrefix) {
	var type = "whitePanties";
	if ($gameScreen.picture(5)) {
	  var pic = $gameScreen.picture(5).name();
	   if (pic.includes("bluePanties")) {
		   type = "bluePanties";
	   }
	   if (pic.includes("pinkPanties")) {
		   type = "pinkPanties";
	   }	   
	   if (pic.includes("whitePanties")) {
		   type = "whitePanties";
	   }	   
	} else {
		if (!$gameActors.actor(2).equips()[1]) return type;
		let itemId = $gameActors.actor(2).equips()[1].baseItemId;
		switch (itemId) {
                case 154: 
				type = "bluePanties";
                break;
                case 155: 
				type = "pinkPanties";			
                break;	         
		}
	}
     if (!noPrefix)	type = "washroom_sis_" + type;
	 return type;
};

//浴室花洒动画
QJ.MPMZ.tl.bathroomShowerheadAnimationPlayer = function() {

    if($gameMap.getGroupBulletListQJ('showerhead').length > 0) return;
	
    QJ.MPMZ.Shoot({
        img:"null1",
		groupName:['showerhead'],
        position:[['P'],['P']],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',1],
        moveType:['D',false],
		immuneTimeStop:true,
        existData:[	
        ],
		moveF:[
			[6,6,QJ.MPMZ.tl.bathroomShowerheadAnimation], 
		],
		deadJS:["$gameScreen.erasePicture(45)"]
    });
	
};

// 妹妹一个人泡澡的泡泡动画
QJ.MPMZ.tl._imoutoUtilBathRoomSoloOfuroBubble = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	
	if (!$gameScreen.picture(10) || !$gameScreen.picture(10).name().includes("solo_bubble")) {
	var IMG = 'bathroom_sis_solo_bubble1';
	$gameScreen.showPictureFromPath(10, "bathroom_event", IMG, 0, 0, 540, 50, 50, 255, 0);
	} else {
    var IMG = "bathroom_event/bathroom_sis_solo_bubble" + this._frames;
    $gameScreen.changePictureName(10, IMG);
    $gameScreen.picture(10)._opacity = 255;	
	}
	
	this._frames += 1;
	this._coolDown = 4;
	
	if (this._frames >= 8) {
	  $gameScreen.picture(10)._opacity = 0;
	  this._frames = 1;	
      this._coolDown = 30 + Math.randomInt(20);
	}	
	
};

// 妹妹一个人泡澡的摇头哼歌动画
QJ.MPMZ.tl._imoutoUtilBathRoomSoloHumming = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}

    if (this._startSmile) {
	 this._startSmile = false;
	 this._eyesOpened = true;
	 var IMG = "bathroom_sis_solo_smile";
	 $gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 540, 50, 50, 255, 0);
	 this._coolDown = 60;
	 return;
	}
	
	this._frames = this._frames || 4;
	
	if (!this._backwards && this._switchSmile && this._frames == 5) {
	  this._switchSmile = false;	
	  this._coolDown = 6;
	  this._frames = 4;
      this._startSmile = true;
	  return;
	}
	
	var action;
	  if (this._eyesOpened) {
          action = 'bathroom_sis_solo_shake_eyesOpened';
	  } else {
          action = 'bathroom_sis_solo_shake_eyesClosed';
	  }		
	if (!$gameScreen.picture(8) || !$gameScreen.picture(8).name().includes("solo_shake")) {	  		
	var IMG = action + this._frames;
	$gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 540, 50, 50, 255, 0);
	} else {
    var IMG = "bathroom_event/" + action + this._frames;
    $gameScreen.changePictureName(8, IMG);
	}
	
	if (this._backwards) {
	this._frames -= 1;
	} else {
	this._frames += 1;	
	}
	this._coolDown = 2;

	if (this._backwards && this._frames <= 0 ) {
	  this._frames += 1;	
	  this._backwards = false;
      this._coolDown = 3 + Math.randomInt(3);	  
	}
	
	if (this._frames >= 8 ) {
	  this._frames -= 1;
	  this._backwards = true;	
      this._coolDown = 3 + Math.randomInt(3);	  
	}	
	
};

// 妹妹一个人泡澡的笑眯眯动画
QJ.MPMZ.tl._imoutoUtilBathRoomSoloSmile = function() {
	
	if (!$gameScreen.picture(8) || !$gameScreen.picture(8).name().includes("solo_smile")) {
	var IMG = 'bathroom_sis_solo_smile' + this._frames;
	$gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 540, 50, 50, 255, 0);
	} else {
    var IMG = "bathroom_event/bathroom_sis_solo_smile" + this._frames;
    $gameScreen.changePictureName(8, IMG);
	}	
	
	
};

// 妹妹一个人泡澡玩小黄鸭动画
QJ.MPMZ.tl._imoutoUtilBathRoomSoloPlayingRubberDuck = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 2;
	
	if (!$gameScreen.picture(5) || !$gameScreen.picture(5).name().includes("playWithRubberDuck")) {
	var IMG = 'bathroom_sis_solo_playWithRubberDuck' + this._frames;
	$gameScreen.showPictureFromPath(5, "bathroom_event", IMG, 0, 0, 540, 50, 50, 255, 0);
	} else {
    var IMG = "bathroom_event/bathroom_sis_solo_playWithRubberDuck" + this._frames;
    $gameScreen.changePictureName(5, IMG);
	}
	
	if (this._backwards) {
	this._frames -= 1;
	} else {
	this._frames += 1;	
	}
	this._coolDown = 2;

	if (this._backwards && this._frames <= 1 ) {
	  this._frames += 1;	
	  this._backwards = false;
      this._coolDown = 2 + Math.randomInt(3);	  
	}
	
	if (this._frames >= 7 ) {
	  this._frames -= 1;
	  this._backwards = true;	
      this._coolDown = 2 + Math.randomInt(3);	  
	}	
	
};


// 妹妹喝可乐
QJ.MPMZ.tl._imoutoUtilImoutoDrinksCola = function() {
	//console.log(this._coolDown);
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	var lang = $gameVariables.value(1);
	var text = "";
	
	if (this._fizzingUp) {
		QJ.MPMZ.tl._imoutoUtilImoutoDrinksColaFizzingUp.call(this);
		return;
	}
	

    // 喝可乐
	//var IMG = "sis_room_hotWeather_cola" + this._frames;
	//$gameScreen.showPictureFromPath(6, "sis_room_drinkCola", IMG, 0, 0, 50, 50, 50, 255, 0);
	var IMG = "sis_room_drinkCola/sis_room_hotWeather_cola" + this._frames;
	$gameScreen.showPicture(6, IMG, 0, 0, 50, 50, 50, 255, 0);
    // 拿到可乐停顿
	if ( this._frames == 4 || this._frames == 11 || this._frames == 14 || this._frames == 15 ) {
		this._coolDown += 10;
	}	

	if ( this._frames == 13 ) {
		this._coolDown += 90;
			switch (lang) {
                case 0: 
                text = "我开动了|";
                break;
                case 1: 
                text = "いただきます|";
                break;	
                case 2: 
                text = "Itadakimasu!";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var voice = { name: "hotWeatherEvent_31", volume: 90, pitch: 100, pan: 0 };
          AudioManager.playVoice(voice, false, 2);  
		
	}

    // 旋瓶盖，循环动作
	if (this._frames == 8) {
		this._loopType1 = this._loopType1 || 3;
		if (this._loopType1 > 1) {
			this._loopType1 -= 1;
			this._frames = 6;
			this._coolDown += 35;
			    // 旋瓶盖音效
			if (!this._loopType1Voice) {
			   var voice = { name: "hotWeatherEvent_32", volume: 90, pitch: 100, pan: 0 };
               AudioManager.playVoice(voice, false, 2);
			   this._loopType1Voice = true;
			}
					
		}
		// 摇可乐导致喷发
		if (this.data.fizzingUp && this._loopType1 && this._loopType1 == 1 ) {
		   this._fizzingUp = true;
	   }
		
	}

    // 喝可乐第一阶段
	if (this._frames == 17) {
		this._loopType2 = this._loopType2 || 4;
		if (this._loopType2 > 1) {
			this._loopType2 -= 1;
			this._frames = 15;
			this._coolDown += 15;
			this._moodText = true;
		}
	}

    // 喝可乐第二阶段
	if (this._frames == 19) {
		this._loopType3 = this._loopType3 || 4;
		if (this._loopType3 > 1) {
			this._loopType3 -= 1;
			this._frames = 17;
			this._coolDown += 15;
			this._moodText = true;
		}
	}

    // 喝可乐第三阶段
	if (this._frames == 21) {
		this._loopType4 = this._loopType4 || 4;
		if (this._loopType4 > 1) {
			this._loopType4 -= 1;
			this._frames = 19;
			this._coolDown += 15;
			this._moodText = true;
		}
	}

    // 喝可乐第四阶段
	if (this._frames == 23) {
		this._loopType5 = this._loopType5 || 4;
		if (this._loopType5 > 1) {
			this._loopType5 -= 1;
			this._frames = 21;
			this._coolDown += 15;
			this._moodText = true;
		}
	}
	
    // 喝可乐第五阶段
	if (this._frames == 25) {
		this._loopType6 = this._loopType6 || 4;
		if (this._loopType6 > 1) {
			this._loopType6 -= 1;
			this._frames = 23;
			this._coolDown += 15;
			this._moodText = true;
		}
	}

		if ( this._moodText && Math.random() > 0.3 )	{
			switch (lang) {
                case 0: 
                text = "咕咚|";
                break;
                case 1: 
                text = "ゴクン|";
                break;	
                case 2: 
                text = "Gulp~";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var sname = "hotWeatherEvent_33_" + Math.randomInt(5);
		  var voice = { name: sname, volume: 90, pitch: 100, pan: 0 };
          AudioManager.playVoice(voice, false, 2); 		  
          this._moodText = undefined;		  
		}

	if ( this._frames == 27 ) {
		this._coolDown += 60;
			switch (lang) {
                case 0: 
                text = "噗哈|";
                break;
                case 1: 
                text = "ぷはぁ|";
                break;	
                case 2: 
                text = "Puhah—";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var sname = "hotWeatherEvent_34_" + Math.randomInt(2);
		  var voice = { name: sname, volume: 90, pitch: 100, pan: 0 };
          AudioManager.playVoice(voice, false, 2); 			  
		
	}


   // 喝饱了
	if (this._frames >= 28) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), 50, 'C'], false);	
	    this._coolDown += 120;		
			switch (lang) {
                case 0: 
                text = "嗝|";
                break;
                case 1: 
                text = " ゲップ|";
                break;	
                case 2: 
                text = "Burp~";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var sname = "hotWeatherEvent_35_" + Math.randomInt(2);
		  var voice = { name: sname, volume: 90, pitch: 100, pan: 0 };		  
		  AudioManager.playVoice(voice, false, 2); 
	      this.setDead({t:['Time',0]});		
	}

    if (this._frames >= 16) {
	this._coolDown += 5;	
	}
	
   	this._frames += 1;
	this._coolDown += 5;	
	
};

// 可乐喷射
QJ.MPMZ.tl._imoutoUtilImoutoDrinksColaFizzingUp = function() {

	var lang = $gameVariables.value(1);
	var text = "";
	
    // 喝可乐
	var IMG = "sis_room_hotWeather_colaFizzingUp" + this._frames;
	$gameScreen.showPictureFromPath(6, "sis_room_drinkCola", IMG, 0, 0, 50, 50, 50, 255, 0);
	
    // 拿到可乐停顿
	if ( this._frames == 7 ) {
		this._coolDown += 30;
    // 可乐冒气
	var IMG1 = "sis_room_hotWeather_colaFizzingUp_bubbles";
	$gameScreen.showPictureFromPath(7, "sis_room_drinkCola", IMG1, 0, 834, 511, 50, 50, 0, 0);
	   var pic = $gameScreen.picture(7);
      if (pic) {
		  $gameScreen.movePicture(7, pic.origin(), pic.x(), pic.y(), pic.scaleX(), pic.scaleY(), 255, 0, 60);
	  }
	  
		  var voice = { name: "hotWeatherEvent_37_0", volume: 90, pitch: 100, pan: 0 };		  
		  AudioManager.playVoice(voice, false, 2); 	  
	  
	}
	if ( this._frames == 8 ) {
		this._coolDown += 40;
		
		if (!this._switchFrames) {
			switch (lang) {
                case 0: 
                text = "...呼诶？";
                break;
                case 1: 
                text = "...ふえっ？";
                break;	
                case 2: 
                text = "...Huh?";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var voice = { name: "hotWeatherEvent_36", volume: 90, pitch: 100, pan: 0 };		  
		  AudioManager.playVoice(voice, false, 3); 		  


      // 用嘴堵住可乐
	    var condition = $gameSelfVariables.value([1, 2, 'colaSpray']) > 1;
        if ( condition && Math.random() > 0.25 ) {
			$gameMap.event(50).steupCEQJ(5);
			this.setDead({t:['Time',0]});
		}
		  
	}		
		
		
		if (this._switchFrames) {
			this._coolDown += 20;
			this._frames = 14;
	        return;			
		}
	}	

    // 可乐喷射动画
	if (this._frames == 13) {
		this._loopType2 = this._loopType2 || 24;
		if (this._loopType2 > 1) {
			this._loopType2 -= 1;
			this._frames = 10;
			this._coolDown -= 2;
		}

			    // 可乐喷射音效
			if (!this._loopType2Voice) {
			   var voice = { name: "hotWeatherEvent_37_1", volume: 90, pitch: 100, pan: 0 };
               AudioManager.playVoice(voice, false, 2);
			   this._loopType2Voice = true;
			}
		
		if (this._loopType2 == 6) {
       // 弄湿衣服的演出
	   var IMG1 = "sis_room_hotWeather_colaFizzingUp_wet";
	   $gameScreen.showPictureFromPath(8, "sis_room_drinkCola", IMG1, 0, 810, 481, 50, 50, 0, 0);
	      var pic = $gameScreen.picture(8);
         if (pic) {
		  $gameScreen.movePicture(8, pic.origin(), pic.x(), pic.y(), pic.scaleX(), pic.scaleY(), 255, 0, 60);
	      }
		}		
		
		if (this._loopType2 == 1) {
			this._frames = 7;
			this._switchFrames = true;
		}
	}

	if ( this._frames == 14 ) {
		
			switch (lang) {
                case 0: 
                text = "...哥哥";
                break;
                case 1: 
                text = "...お兄ちゃん";
                break;	
                case 2: 
                text = "...Onii-chan";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var voice = { name: "hotWeatherEvent_38", volume: 90, pitch: 100, pan: 0 };
          AudioManager.playVoice(voice, false, 2);		  
		
		this._coolDown += 120;
	}

	if ( this._frames == 15 ) {
		this._frames = 0;
		this._coolDown += 180;	
		$gameSelfSwitches.setValue([$gameMap.mapId(), 50, 'C'], false);	
					
	    this.setDead({t:['Time',0]});	
		
			switch (lang) {
                case 0: 
                text = "是哥哥搞得恶作剧吧！？";
                break;
                case 1: 
                text = "お兄ちゃんのイタズラでしょ！？";
                break;	
                case 2: 
                text = "This was your prank, wasn’t it!?";
                break;	            
			}
          let posX = 850 + Math.randomInt(180);
		  let posY = 400 + Math.randomInt(80);
          QJ.MPMZ.tl._imoutoUtilCustomMoodText(posX,posY,text);	
		  var voice = { name: "hotWeatherEvent_39", volume: 90, pitch: 100, pan: 0 };
          AudioManager.playVoice(voice, false, 2);			  
		  this.setDead({t:['Time',0]});	
	}

   	this._frames += 1;
	this._coolDown += 5;	
};

/*
// 哥哥胖次自慰动画
QJ.MPMZ.tl._imoutoUtilOniichanPantiesOnanii = function() {

	this._coolDown = this._coolDown || 0;
    this._passedTime = this._passedTime || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   this._passedTime += 1;
	   return;
	}
	
	this._frames = this._frames || 0;
	this._speed = this._speed || 4;
	var value;
	var bareta = $gameSelfSwitches.value([$gameMap.mapId(), 6, 'D']);
	
	if (!$gameScreen.picture(22) || !$gameScreen.picture(22).name().includes("playWithRubberDuck")) {
	var IMG = 'washroom_onichann_onani' + this._frames;
	$gameScreen.showPictureFromPath(22, "washroom_event", IMG, 0, 0, 20, 100, 100, 255, 0);
	} else {
    var IMG = "washroom_event/washroom_onichann_onani" + this._frames;
    $gameScreen.changePictureName(22, IMG);
	}
	
    // 时间流逝和妹妹警戒度变化
	if (!bareta && !this._zetchou && this._passedTime > 180) {
        this._passedTime = 0;
		chahuiUtil.systemTimeProgression(1);
		$gameMap.steupCEQJ(8,1);
		value = $gameVariables.value(19);
		let skillFix = 100 - (15 * $gameParty.leader().skillMasteryLevel(10));
		let boost = (4 + Math.randomInt(6)) * skillFix;
		value += Math.max(1,boost);
		$gameVariables.setValue(19, value);	
		if (value >= 9500) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 6, 'D'], true);
			$gameMap.event(16).steupCEQJ(1);
		}
	}
    // 哥哥快感计量条结算
    if (!bareta && !this._zetchou && this._frames == 0 && Math.random() > 0.5 ) {
		value = $gameVariables.value(25);
		value += 1;
        $gameVariables.setValue(25, value);	
       if (value > 120) {
          this._speed = 1;
		  this._zetchou = true;
		  $gameMap.event(18).steupCEQJ(1);
	   }		   
	}

    // 切换射精演出
    if ( !bareta && this._shasei && this._frames == 0 ) {
		$gameMap.event(18).steupCEQJ(2);
		this.setDead({t:['Time',0]});
	}
	
	if (this._backwards) {
	this._frames -= 1;
	} else {
	this._frames += 1;	
	}
	this._coolDown = this._speed;

	if ( this._backwards && this._frames <= -1 ) {
	  this._frames = 0;	
	  this._backwards = false;
      this._coolDown = this._speed + Math.randomInt(2);	  
	}
    // 变速播放分歧
    if (this._backwards && this._frames <= 3 && Math.random() > 0.8 ) {
	  this._frames = 0;  
	  this._coolDown = this._speed;
      return;	  
	}
	
	if ( this._frames >= 6 ) {
	  this._frames -= 1;
	  this._backwards = true;	
      this._coolDown = this._speed + Math.randomInt(2);	
	}	
};
*/

// 侧视角懵懂妹妹手交
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiSideviewAction = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 4;

	var IMG = "washroom_tekoki/washroom_tekoki_sideview_action" + this._frames;
	$gameScreen.showPicture(25, IMG, 0, 0, 540, 100, 100, 255, 0);

    if (!$gameScreen.picture(24)) {	
		// 腮红		
        QJ.MPMZ.Shoot({
            groupName: ['blush'],
            img: "imoutoUtil/washroom_tekoki_sideview_blush",
            position: [['S',989], ['S',384]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: 1,
            scale: 1,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [
			
			],
			timeline:['S',0,12,[-1,1,6]],
			z:"A",
        }); 		
		$gameScreen.showPicture(24, "washroom_tekoki/washroom_tekoki_sideview_back", 0, 920, 0, 100, 100, 255, 0);
		// 初始需要保持静止帧状态
		this._coolDown = 99999;
		return;
	}

    if (this._frames == 2 && this._shasei) {   
		  // 满足条件切入射精动画
		  $gameSwitches.setValue(125, false);
		  let pid = 23;
		  $gameScreen.setVideoPictureName("washroom_tekoki_shasei_sideview", true, false);
		  $gameScreen.showPicture(pid, '', 0, 0, 0, 100, 100, 255, 0);
		  
          if ($gameScreen.picture(pid)) {
            $gameScreen.picture(pid).setVideoLoop(false);
            $gameScreen.picture(pid).setVideoPause(true);
          }		  
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['sideview'],
             existData: [ 
			   {t:['SW',125,true],a:['S',`$gameScreen.picture(${pid}).setVideoPause(false);$gameScreen.erasePicture(24);$gameScreen.erasePicture(25);QJ.MPMZ.deleteProjectile('blush')`],c:['T',0,6,true]}
			 ],
          });
		  $gameMap.event(13).steupCEQJ(3);
          this.setDead({t:['Time',0]}); 		  	   
	}

	if (this._frames == 2) {
		this._coolDown += 4 + Math.randomInt(4);
	}
	if (this._frames == 6) {
		this._coolDown += Math.randomInt(8);
	}


	if (this._frames >= 8) {
		this._coolDown += this._speed;
		this._frames = 2;
		return;
	}	

   	this._frames += 1;
	this._coolDown += this._speed;	
	
};


// 哥哥胖次自慰动画
QJ.MPMZ.tl._imoutoUtilOniichanPantiesOnanii = function() {

	this._coolDown = this._coolDown || 0;
    this._passedTime = this._passedTime || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   this._passedTime += 1;
	   return;
	}
	
	this._frames = this._frames || 0;
	this._speed = this._speed || 4;
	var value;
	var bareta = $gameSelfSwitches.value([$gameMap.mapId(), 6, 'D']);
	var type = QJ.MPMZ.tl._imoutoUtilPantiesTpyeCheck(true);
	    type = "washroom_onichann_" + type + "_onani";
	var IMG = type + this._frames;
	$gameScreen.showPictureFromPath(22, "washroom_event", IMG, 0, 0, 0, 100, 100, 255, 0);

	
    // 时间流逝和妹妹警戒度变化
	if (!bareta && !this._zetchou && this._passedTime > 180) {
        this._passedTime = 0;
		chahuiUtil.systemTimeProgression(1);
		$gameMap.steupCEQJ(8,1);
		value = $gameVariables.value(19);
		let skillFix = 100 - (15 * $gameParty.leader().skillMasteryLevel(10));
		let boost = (4 + Math.randomInt(6)) * skillFix;
		value += Math.max(1,boost);
		$gameVariables.setValue(19, value);	
		if ($gameSelfSwitches.value([4, 14, 'B']))  value += 7000;
		if (value >= 9500) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 6, 'D'], true);
			$gameMap.event(16).steupCEQJ(1);
		}
	}
    // 哥哥快感计量条结算
    if (!bareta && !this._zetchou && this._frames == 0 && Math.random() > 0.5 ) {
		value = $gameVariables.value(25);
		value += 1;
        $gameVariables.setValue(25, value);	
       if (value > 120 && !$gameSelfSwitches.value([$gameMap.mapId(), 7, 'D'])) {
          this._speed = 1;
		  this._zetchou = true;
		  $gameMap.event(18).steupCEQJ(1);
	   }		   
	}

    // 切换射精演出
    if ( !bareta && this._shasei && this._frames == 5 ) {
		$gameMap.event(18).steupCEQJ(2);
		this.setDead({t:['Time',0]});
	}
	
	if (this._backwards) {
	this._frames -= 1;
	} else {
	this._frames += 1;	
	}
	this._coolDown = this._speed;

	if ( this._backwards && this._frames <= -1 ) {
	  this._frames = 0;	
	  this._backwards = false;
      this._coolDown = this._speed + Math.randomInt(2);	  
	}
    // 变速播放分歧
    if (this._backwards && this._frames <= 3 && Math.random() > 0.8 ) {
	  this._frames = 0;  
	  this._coolDown = this._speed;
      return;	  
	}
	
	if ( this._frames >= 6 ) {
	  this._frames -= 1;
	  this._backwards = true;	
      this._coolDown = this._speed + Math.randomInt(2);	
	}	
};

// 洗面所手交事件-妹妹的红晕
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiBlush = function() {
	
        QJ.MPMZ.Shoot({
            groupName: ['blush'],
            img: "imoutoUtil/washroom_tekoki_blush",
            position: [['S',0], ['S',0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            opacity: 1,
            scale: 1,
			onScreen:true,
            anchor: [0, 0],
            moveType: ['S', 0],
            collisionBox: ['C', 1],
            existData: [
			
			],
			timeline:['S',0,12,[-1,1,6]],
			z:"A",
        });  
		
};


// 洗面所手交事件-妹妹的呼吸气雾
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiVisibleBreath = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 0;
	
	var IMG = "washroom_tekoki/washroom_tekoki_visibleBreath" + this._frames;
	var index = 11;	
	$gameScreen.showPicture(index, IMG, 0, 0, 0, 100, 100, 255, 0);
	
	this._frames += 1;
	this._coolDown = 4;
	// 执行不透明度淡出指令
	if (this._frames >= 8) {
		var pic = $gameScreen.picture(index);
		if (pic) $gameScreen.movePicture(index, pic.origin(), pic.x(), pic.y(), pic.scaleX(), pic.scaleY(), 0, 0, 60);
	    this._frames = 0;	
        this._coolDown = 32;
	}	
	
};

// 洗面所手交事件-妹妹的撸撸动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction = function(type) {
	
	if (!type) return;
	var index = 18;
	
	let noPanties = $gameVariables.value(18) >= 4;
	
	if (noPanties) {
	    index = 15;
		type = "washroom_tekoki_penis";
	} else {
    switch (type) {
        case "bluePanties":  
            type = "washroom_tekoki_bluePanties";
            break;
        case "pinkPanties":  
            type = "washroom_tekoki_pinkPanties";
            break;
        case "whitePanties":  
            type = "washroom_tekoki_whitePanties";
            break;
        default: 
            type = "washroom_tekoki_whitePanties";
            break;
        }
	}
		
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 0;
	this._speed = this._speed || 5;
    
	if (!noPanties) {
	  let panties = type + this._frames;
	  $gameScreen.showPictureFromPath(19, "washroom_tekoki", panties, 0, 360, 0, 100, 100, 255, 0);
	}

	var IMG2 = "washroom_tekoki_hand" + this._frames;
	$gameScreen.showPictureFromPath(16, "washroom_tekoki", IMG2, 0, 360, 0, 100, 100, 255, 0);
	//$gameScreen.picture(12).drill_PLAZ_setLayer( "最顶层" );
	
	var IMG1 = type + this._frames;
	$gameScreen.showPictureFromPath(index, "washroom_tekoki", IMG1, 0, 360, 0, 100, 100, 255, 0);
	//$gameScreen.picture(index).drill_PLAZ_setLayer( "最顶层" );

    if (this._frames == 5) {   
       if ( $gameVariables.value(25) > 40 ) {
		  // 满足条件后切换到第二个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction2'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction2,[noPanties,type]]
             ],
          });
          this.setDead({t:['Time',0]}); 		  
	   }
	}

	if (this._frames >= 9) {
		this._speed = 3 + Math.randomInt(5);
		this._coolDown = this._speed;
		this._frames = 0;
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;

    // 后续动作关键帧的预加载
	if (!this._preload && !noPanties) {
		this._preload = true;
		// 动作音效
		let	voice = { name: "washroom_event_sis_tekoki_panties1", volume: 90, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, true, 3);
		let action = type.replace(/(tekoki_)/, '$1action2_');
		for (let i = 1; i <= 26; i++) {
           ImageManager.reservePicture(`washroom_tekoki/${action}_` + i);
		   ImageManager.reservePicture("washroom_tekoki/washroom_tekoki_action2_" + i);
        }
	}
	
    // 和白手套冲突的临时对策
	if (!this._conflict) {	
	this._conflict = true;    
    let actor = $gameActors.actor(1); 
    let equips = actor.equips(); 
    for (let index = 1; index < equips.length; index++) {
        let equip = equips[index];
        if (!equip) continue; // 跳过空装备
        if ( equip.baseItemId === 56 ) {
			actor.changeEquipById(index+1, null);	
            $gameVariables.setValue(25, 30);			
        }
	  }
    }	
	
};

// 洗面所手交事件-妹妹第二动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction2 = function(noPanties,type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	$gameScreen.erasePicture(16);
	$gameScreen.erasePicture(18);
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;


	if (!noPanties) {
	  let action = type.replace(/(tekoki_)/, '$1action2_');
	  let panties = action + "_" + this._frames; 
	  $gameScreen.showPictureFromPath(19, "washroom_tekoki", panties, 0, 360, 0, 100, 100, 255, 0);
	}
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action2_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 360, 0, 100, 100, 255, 0);

    if (this._frames == 23) {   
       if ( $gameVariables.value(25) > 50) {
		  // 满足条件后切换到第三个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction3'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction3,[noPanties,type]]
             ],
          });
          this.setDead({t:['Time',0]}); 		  
	   }
	}

	if (this._frames >= 26) {
		this._coolDown = 5;
		this._frames = 8;
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;

    // 后续动作关键帧的预加载
	if (!this._preload && !noPanties) {
		this._preload = true;
        AudioManager.stopVoice(null, 3);		
		let action = type.replace(/(tekoki_)/, '$1action3_');
		for (let i = 1; i <= 44; i++) {
           ImageManager.reservePicture(`washroom_tekoki/${action}_` + i);
		   ImageManager.reservePicture("washroom_tekoki/washroom_tekoki_action3_" + i);
        }
	}
	
	if (!this._preVoice && !noPanties && this._frames > 7) {
		// 动作音效
		this._preVoice = true;
		let	voice = { name: "washroom_event_sis_tekoki_panties2", volume: 70, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, true, 3);		
	}	
};

// 洗面所手交事件-妹妹第三动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction3 = function(noPanties,type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;

	if (!noPanties) {
	  let action = type.replace(/(tekoki_)/, '$1action3_');
	  let panties = action + "_" + this._frames; 
	  $gameScreen.showPictureFromPath(19, "washroom_tekoki", panties, 0, 360, 0, 100, 100, 255, 0);
	}
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action3_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 360, 0, 100, 100, 255, 0);

	if (this._frames >= 44) {
		
       if ( $gameVariables.value(25) > 70) {
		  // 满足条件后切换到第四个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction4'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction4,[noPanties,type]]
             ],
          });
          this.setDead({t:['Time',0]}); 		  
	   }
	   
		this._coolDown = 5;
		this._frames = 16;
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;

    // 后续动作关键帧的预加载
	if (!this._preload && !noPanties) {
		this._preload = true;
        AudioManager.stopVoice(null, 3);			
		let action = type.replace(/(tekoki_)/, '$1action4_');
		for (let i = 1; i <= 28; i++) {
           ImageManager.reservePicture(`washroom_tekoki/${action}_` + i);
		   ImageManager.reservePicture("washroom_tekoki/washroom_tekoki_action4_" + i);
        }
	}
	
	if (!this._preVoice && !noPanties && this._frames > 15) {
		// 动作音效
		this._preVoice = true;
		let	voice = { name: "washroom_event_sis_tekoki_panties3", volume: 70, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, true, 3);		
	}	
};

// 洗面所手交事件-妹妹第四动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction4 = function(noPanties,type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;
	this._times = this._frames || 1;
	
	if (!noPanties) {
	  let action = type.replace(/(tekoki_)/, '$1action4_');
	  let panties = action + "_" + this._frames; 
	  $gameScreen.showPictureFromPath(19, "washroom_tekoki", panties, 0, 360, 0, 100, 100, 255, 0);
	}
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action4_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 360, 0, 100, 100, 255, 0);

	if (this._frames == 19) {
		
       if ( $gameVariables.value(25) > 80 && noPanties) {
		  // 满足条件后哥哥射爆
          AudioManager.stopVoice(null, 3);			  
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiActionShasei'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei,[noPanties,type]]
             ],
          });
		  if (!$gameScreen.picture(14)) {
             $gameScreen.showPicture(14, "washroom_tekoki/washroom_tekoki_kao2", 0, 0, 0, 100, 100, 255, 0);
             $gameScreen.showPicture(55, "washroom_tekoki/washroom_tekoki_blush", 0, 0, 0, 100, 100, 255, 0);	
             $gameScreen.picture(55).drill_PLAZ_setZIndex( 13 );			 
		  }
		  
          this.setDead({t:['Time',0]}); 		  
	   }
	}

	if (this._frames >= 28) {
        this._times += 1;	
        if (this._times > 4) this._speed = 3;		
		this._coolDown = 6;
		this._frames = 15;
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;

	if (!this._preload && !noPanties && this._frames > 14) {
		this._preload = true;
		// 动作音效
		let	voice = { name: "washroom_event_sis_tekoki_panties4", volume: 70, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, true, 3);		
	}	
	
};

// 洗面所手交事件-哥哥射爆
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei = function(noPanties,type) {
	
	if (!noPanties) return;		
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 6;
	this._speed = this._speed || 5;
	
    // 射精
	var IMG2 = "washroom_tekoki_shasei" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 360, 0, 100, 100, 255, 0);
	
    // 射在妹妹头上的精液
	if (this._frames >= 14 && this._frames <= 52) {
	var duplicateArray = [21,22,23,24,26,27,28,30,31,32,38,40,41,42,43,45,46];
	if (!duplicateArray.includes(this._frames)) {
	var IMG1 = "washroom_tekoki_shasei_hairSeieki" + this._frames;
	$gameScreen.showPictureFromPath(12, "washroom_tekoki", IMG1, 0, 360, 0, 100, 100, 255, 0);
	  }
    } else if (this._frames > 51 && !$gameScreen.picture(12)) {
	$gameScreen.showPictureFromPath(12, "washroom_tekoki", "washroom_tekoki_shasei_hairSeieki51", 0, 360, 0, 100, 100, 255, 0);	
	}

    // 妹妹眨眼动作
	if (this._frames >= 6 && this._frames <= 14) {		
	var duplicateArray = [8,9,12];	
	if (!duplicateArray.includes(this._frames)) {
	var IMG0 = "washroom_tekoki_shasei_back" + this._frames;
	$gameScreen.showPictureFromPath(10, "washroom_tekoki", IMG0, 0, 0, 0, 100, 100, 255, 0);
	  }
	}

	if (this._frames >= 67) {
		
		this.setDead({t:['Time',0]}); 
		//this._speed = 3 + Math.randomInt(5);
		//this._coolDown = 150;
		//this._frames = 0;
		//return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;	
};

/*
// 洗面所手交事件-妹妹的撸撸动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei = function(type) {
	
	//if (!type) return;		
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 5;
	this._speed = this._speed || 5;
	this._max = this._max || 65;
	
    // 喷射的精液
	var IMG5 = "washroom_tekoki_shasei_seieki" + this._frames;
	$gameScreen.showPictureFromPath(19, "washroom_tekoki", IMG5, 0, 0, 0, 100, 100, 255, 0);

    // 手和肉棒动作
    if (this._frames <= 59) {
		
	var IMG3 = "washroom_tekoki_shasei_hand" + this._frames;
	$gameScreen.showPictureFromPath(16, "washroom_tekoki", IMG3, 0, 0, 0, 100, 100, 255, 0);
	
	var IMG2 = "washroom_tekoki_shasei_penis" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);
	
	}

    // 射在妹妹头上的精液
	if (this._frames >= 13 && this._frames <= 51) {
	var duplicateArray = [20,21,22,23,25,26,27,29,30,31,37,39,40,41,42,44,45];
	if (!duplicateArray.includes(this._frames)) {
	var IMG1 = "washroom_tekoki_shasei_hairSeieki" + this._frames;
	$gameScreen.showPictureFromPath(11, "washroom_tekoki", IMG1, 0, 0, 0, 100, 100, 255, 0);
	  }
    }

    // 妹妹眨眼动作
	if (this._frames >= 5 && this._frames <= 13) {		
	var duplicateArray = [7,8,11];	
	if (!duplicateArray.includes(this._frames)) {
	var IMG0 = "washroom_tekoki_shasei_back" + this._frames;
	$gameScreen.showPictureFromPath(10, "washroom_tekoki", IMG0, 0, 0, 0, 100, 100, 255, 0);
	  }
	}

	if (this._frames >= 65) {
		//this._speed = 3 + Math.randomInt(5);
		this._coolDown = this._speed;
		this._frames = 5;
		this._max -= 15;
		this._max = Math.max(10,this._max);
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;	
};
*/

// 洗面所妹妹胖次结算
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoPantiesSelect = function() {
	
	//var chest = $gameNumberArray.value(44);
	var panties;
	var imageName = "";
	
	if (!$gameActors.actor(2).equips()[1]) {
		$gameScreen.erasePicture(5);
		$gameSelfSwitches.setValue([$gameMap.mapId(), 18, 'D'], true);
		return;
	} else {
		panties = $gameActors.actor(2).equips()[1].baseItemId;
	}
	
      switch (panties) {
        case 154:  
            imageName = "washroom_sis_clothes_bluePanties";
            break;
        case 155:  
            imageName = "washroom_sis_clothes_pinkPanties";
            break;
        case 156:  
            imageName = "washroom_sis_clothes_whitePanties";
            break;
        default: 
            imageName = "washroom_sis_clothes_whitePanties";
            break;
     }	
    $gameScreen.showPictureFromPath(5, "washroom_event", imageName, 0, 0, 0, 50, 50, 255, 0)		
		
}; 

// 厕所口交事件-妹妹隔着胖次自慰
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraPantsuOnanii = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 0;
	this._speed = this._speed || 3;
	
    const pic = $gameScreen.picture(1);	
	if (!pic) return;
	if (pic._drill_PSh_commandChangeTank.length > 0) return;
	
	let xx = pic._x;
	let yy = pic._y;
	let scale = pic._scaleX;
    let xxx =  xx + (1000 * (scale / 100));
	let yyy =  yy + (800 * (scale / 100));	
	
    // 自慰动作
	var IMG1 = "toilet_sister_onanii0_back" + this._frames;
	$gameScreen.showPictureFromPath(6, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);	

    if (!this._playback) {
   	  this._frames += 1;
	} else {
	  this._frames -= 1;
	}
	
	if (!this._playback && this._frames >= 5) {	  
	    this._coolDown += 10 + Math.randomInt(15);
		this._frames -= 1;
		this._playback = true;
		return;
	}

	if (this._playback && this._frames <= -1) {	  
	    this._coolDown += 10 + Math.randomInt(15);
		this._frames = 0;
		this._playback = false;
		return;
	}
    this._coolDown += 7;		
};

// 厕所口交事件-妹妹自慰
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraNoopanOnanii = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 3;
	
    const pic = $gameScreen.picture(1);	
    if (!pic) return;
	if (pic._drill_PSh_commandChangeTank.length > 0) return;
	
	let xx = pic._x;
	let yy = pic._y;
	let scale = pic._scaleX;
    let xxx =  xx + (1000 * (scale / 100));
	let yyy =  yy + (800 * (scale / 100));
	
    // 绝顶结束
	if (this._zetchou) {
		var IMG1 = "toilet_sister_onanii_back10_aieki";
		$gameScreen.showPictureFromPath(8, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);
		if ($gameScreen.picture(10) && $gameScreen.picture(10).name().includes("onanii")) {
		$gameScreen.showPictureFromPath(10, "toilet_nozoku", "toilet_sister_onanii_head3", 0, xx, yy, scale, scale, 255, 0);
		}
        this.setDead();
        return;		
	}
	
    // 自慰动作
	if (this._aieki && [7,8,9,10].includes(this._frames)) {
		var IMG1 = "toilet_sister_onanii_back" + this._frames + "_aieki";
		$gameScreen.showPictureFromPath(8, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);		
	} else {
		var IMG1 = "toilet_sister_onanii_back" + this._frames;
		$gameScreen.showPictureFromPath(8, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);
	}	

   	this._frames += 1;
	this._coolDown = this._speed;	

	if (this._frames === 11) {	   
		this._coolDown += 2 * this._speed;
	}	
	if (this._frames === 15 && Math.random() > 0.9) {	   
		this._coolDown += this._speed;
		this._frames = 7;
		return;
	}
	if (this._frames === 16 && Math.random() > 0.85) {	   
		this._coolDown += this._speed;
		this._frames = 6;
		return;
	}	
	if (this._frames >= 18) {	  
	    this._coolDown += 2 * this._speed;
		this._frames = 1;
	}	
};

// 厕所口交事件-舔肉棒
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraAction1 = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}

    const pic = $gameScreen.picture(1);		
	if (!pic) return;
	if (pic._drill_PSh_commandChangeTank.length > 0) return;

	if (this._shasei) {
	   QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraShasei.call(this);
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 3;
	let xx = pic._x;
	let yy = pic._y;
	let scale = pic._scaleX;
    let xxx =  xx + (1400 * (scale / 100));
	let yyy =  yy + (1000 * (scale / 100));
	
    // 肉棒动作	
	var IMG1 = "toilet_sister_fera_action" + this._frames;
	$gameScreen.showPictureFromPath(12, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);

   	this._frames += 1;
	this._coolDown = 3;	
    
	if (this._shaseiJumbi ) {
		this._count = this._count || 0;
		this._count++;
		if (this._count > 20) {
		  this._shasei = true;
		  let name = 'NoopanOnanii';
		  if ($gameMap.getGroupBulletListQJ(name).length > 0) {
    		  let id = $gameMap.getGroupBulletListQJ(name)[0];
    		  let bullet = $gameMap.bulletQJ(Number(id)); 
    		  bullet._zetchou = true;
		    }		  
		}
	}

    
	if (this._frames >= 10) {		  
	    this._coolDown += 3;
		this._frames = 1;
	}	
};

// 厕所口交事件-射精
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraShasei = function() {
	


	this._frames = this._frames || 1;
	//this._speed = this._speed || 4;
	this._speed = 5;

    const pic = $gameScreen.picture(1);
    if (!pic) return;	
	if (pic._drill_PSh_commandChangeTank.length > 0) return;

	let xx = pic._x;
	let yy = pic._y;
	let scale = pic._scaleX;
    let xxx =  xx + (1018 * (scale / 100));
	let yyy =  yy + (580 * (scale / 100));
	
	$gameScreen.erasePicture(10);
	var IMG1 = "toilet_sister_fera_shasei" + this._frames;
	$gameScreen.showPictureFromPath(4, "toilet_nozoku", "toilet_sister_fera_shasei_back", 0, xxx, yyy, scale, scale, 255, 0);
	$gameScreen.showPictureFromPath(12, "toilet_nozoku", IMG1, 0, xxx, yyy, scale, scale, 255, 0);

   	this._frames += 1;
	this._coolDown = this._speed;	

	if (this._frames === 2) {	  
	    AudioManager.playSe({name: "射精音1", volume: 100, pitch: 100, pan: 0});	
	}
    
	if (this._frames === 17) {	  
	    this._coolDown += 9999999;	
	}
	
	if (this._frames >= 25) {	  
	    this.setDead();
	}	
};

// 哥哥自己动手自慰
QJ.MPMZ.tl._OniichanNoopanOnanii = function() {

	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}

    if ( this._shasei && !this._shaseiStart) {
		this._shaseiStart = true;
		this._frames = 1;
		this._speed = 6;
		$gameMap.event(22).steupCEQJ(4,{shasei:true})
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 6;
	var IMG1;
	
	if (this._shasei) {
       IMG1 = "oniichan_action/toilet_oniichan_noopan_onanii_shasei" + this._frames;
	   $gameScreen.showPicture(16, IMG1, 0, 450, 80, 100, 100, 255, 0);		
	} else {
       IMG1 = "oniichan_action/toilet_oniichan_noopan_onanii" + this._frames;
	   $gameScreen.showPicture(16, IMG1, 0, 450, 620, 100, 100, 255, 0);		
	}

   	this._frames += 1;
	this._coolDown = this._speed;	
    
	if (this._shasei) {

	if (this._frames >= 19) {	  
		this.setDead();
	}
		
	} else {

	if (this._frames >= 6) {	  
		this._frames = 1;
	}
		
	}
	/*
    // 累积射精感
    if ( Math.random() > 0.5 ) {
		let value = $gameVariables.value(25);
		value += Math.randomInt(3);
		$gameVariables.setValue(25, value);
	}
	*/
};

// 妹妹立绘脱衣动画
QJ.MPMZ.tl._imoutoUtilTuggingOnTshirt = function(type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	if (this._boobShake) {
		QJ.MPMZ.tl._imoutoUtilTachieBoobShake.call(this);
		return;
	}
	
	
    let max = 4;
	if (this._frames === undefined) this._frames = 1;
	
	var IMG1 = "imoto_tachie/mio_tachie_T-shirt_dragging" + type + this._frames;	
	if (this._frames === 0) IMG1 = "mio_tachie_T-shirt1";
	$gameScreen.showPicture(14, IMG1, 0, 1000, 150, 100, 100, 255, 0);	


	if (this._upend && this._frames == 0) {
		this.setDead({ t: ['Time', 0] });
		this._coolDown += 90;
		this._upend = false;
	}

    if (type === "B") max = 5;
	
	if (!this._upend && this._frames == max) {		
		this._frames -= 1;
		if (type === "A") {
		//掀起T恤停留的时间
		this._coolDown += 10;
		}
		this._upend = true;
		if (type === "B") {
		this._frames = 1;
		this._boobShake = true;
		return;
	  }
	}
	
	if (this._upend) {
		this._frames -= 1;
	} else {
		this._frames += 1;
	}

	this._coolDown += 2;	
		
};

// 妹妹立绘乳摇
QJ.MPMZ.tl._imoutoUtilTachieBoobShake = function() {
	
	if (this._frames === undefined) this._frames = 1;

	if (this._frames >= 7) {
		//$gameScreen.showPicture(11, 'mio_tachie_nudepose1_1', 0, 1000, 150, 100, 100, 255, 0);	
		//$gameScreen.erasePicture(15);
		this.setDead({ t: ['Time', 0] });
		this._frames = 4;
		this._coolDown += 30;
		this._boobShake = false;
		return;
	}
	
	var IMG2 = "imoto_tachie/mio_tachie_boobShake" + this._frames;	

	$gameScreen.showPicture(13, IMG2, 0, 1000, 150, 100, 100, 255, 0);		
	//$gameScreen.showPicture(11, "mio_tachie_handpose1", 0, 1000, 150, 100, 100, 255, 0);
	if (!$gameScreen.picture(15)) {
		$gameScreen.showPicture(15, "imoto_tachie/mio_tachie_T-shirt_dragging_extra", 0, 1000, 150, 100, 100, 255, 0);
	}
	 $gameScreen.picture(15).drill_PLAZ_setZIndex( 12.5 );
	this._frames += 1;
	this._coolDown += 4;
	
};

// 夜袭噩梦-妹妹呆毛怪物
QJ.MPMZ.tl._nightVisitImoutoAhogeMonster = function() {
	
	this._coolDown = this._coolDown || 0;

	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	if ($gameMessage.hasText()) {
	   this._coolDown = 15;
	   return;
	}

	this._frames = this._frames || 1;
	this._speed = this._speed || 6;
	
	var IMG1 = "nightVisit_Imouto_AhogeMonster" + this._frames;
	
	if (this._frames > 42 && !this._scaring) {
		IMG1 = "nightVisit_Imouto_AhogeMonster_loop" + this._frames;
	}
	
	$gameScreen.showPictureFromPath(10, "nightmare", IMG1, 0, 0, 0, 100, 100, 255, 0);
    
	if (this._frames === 1) this._coolDown += 60;
	if (this._frames === 12) this._coolDown += 60;

	// 播放站立声
	if (this._frames === 2) {
        let	se = { name: "人がモンスターに変化", volume: 70, pitch: 150, pan: 0 };
    	AudioManager.playSe(se);
	}
	// 停止站立声
	if (this._frames === 15) {
        AudioManager.stopSe();
	}
	// 停止站立声
	if (this._frames === 25) {
        let	se = { name: "血がたれる1", volume: 70, pitch: 80, pan: 0 };
    	AudioManager.playSe(se);
	}
	
	// 开始低声哼唱
	if (this._frames === 29 && !this._startHumming) {
        let	voice = { name: "nightmare_humming", volume: 90, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, true, 1);
		this._startHumming = true;
	}
	
	// 播放脚步声
	if (this._frames >= 18 && this._frames <= 58 && this._frames % 4 === 0 && !this._stopFootSteps) {
    	let seName = "nightmare_footsteps" + Math.randomInt(4);
        let	se = { name: seName, volume: 70, pitch: 100, pan: 0 };
    	AudioManager.playSe(se);
	}


   	this._frames += 1;
	this._coolDown += 6;	
	
    // 未被惊扰时循环播放夜游动画
    if (this._frames === 58 && !this._scaring) {
	    this._coolDown += 6;
		this._frames = 30;
		if (this._startled) {
		this._scaring = true;
		} 
		return;
	}

	// 惊扰音效
	if (this._frames === 50 && this._scaring) {
		AudioManager.stopSe();
        let	voice = { name: "nightmare_noticing", volume: 90, pitch: 100, pan: 0 };
    	AudioManager.playVoice(voice, false, 1);
		this._stopFootSteps = true;
	}

	// 播放奔跑声
	if (this._frames === 60) {
        let	se = { name: "プールサイドを走る", volume: 70, pitch: 150, pan: 0 };
    	AudioManager.playSe(se);
	}
	
	// 惊吓
	if (this._frames >= 73) {	  
	    this._coolDown += 999;
		this._frames = 1;
		AudioManager.stopSe();
        $gameMap.event(7).steupCEQJ(4,{followUp:true});		
		this.setDead();
	}	
};


QJ.MPMZ.tl._batchProcessImageZoomEffects = function (picIds, targetX, targetY, scale) {
	
    const DURATION = 30;               

    // 判断参数是否为有限数字
    const hasX     = Number.isFinite(targetX);
    const hasY     = Number.isFinite(targetY);
    const hasScale = Number.isFinite(scale);

    picIds.forEach(id => {
        const pic = $gameScreen.picture(id);
        if (!pic) return;              // 槽位为空时直接跳过

        const cmdTank = pic._drill_PSh_commandChangeTank;

        if (hasX) {
            cmdTank.push({
                type : 'posX',
                value: targetX - pic._x,
                time : DURATION,
            });
        }
        if (hasY) {
            cmdTank.push({
                type : 'posY',
                value: targetY - pic._y,
                time : DURATION,
            });
        }
        if (hasScale) {
            cmdTank.push({
                type : 'scaleX',
                value: scale - pic._scaleX,
                time : DURATION,
            });
            cmdTank.push({
                type : 'scaleY',
                value: scale - pic._scaleY,
                time : DURATION,
            });
        }
    });
};

// 洗面所偷窥事件ZOOM效果
QJ.MPMZ.tl._washroomNozokuSceneZoomEffects = function () {
	
  const P = id => $gameScreen.picture(id);
  const Z = QJ.MPMZ.tl._batchProcessImageZoomEffects;   
  
  var currentX = 0;
  if (!$gameScreen.picture(50)._currentX) {
        $gameScreen.picture(50)._currentX = $gameScreen.picture(50)._x;
	    currentX = $gameScreen.picture(50)._currentX;
  }	else {
	    currentX = $gameScreen.picture(50)._currentX;
  }
  
  const TABLE = {
    /*=========== 近景：picture(1) < 60% = 镜头推进 ============*/
    IN: {
      common: [
        { pic:[1],             x:-1800, y:-800, s:100 },
		{ pic:[10],             x:400, y:-440, s:100 },
		{ pic:[49,50],             x:null, y:null, s:150 },
		{ pic:[49],             x:-950, y:null, s:null },
		{ pic:[50],             x:-2800, y:-300, s:null }
      ]
    },

    /*=========== 远景：picture(1) ≥ 60% = 镜头拉远 ============*/
    OUT: {
      common: [
        { pic:[1],             x:0, y:0, s:50 },
		{ pic:[10],             x:1100, y:180, s:50 },
		{ pic:[49,50],             x:null, y:null, s:100 },
		{ pic:[49],             x:0, y:null, s:null },
		{ pic:[50],             x:currentX, y:0, s:null }
      ]
    }
  };

  /*—— 主流程 ——*/
  const mode  = P(1)._scaleX < 60 ? 'IN' : 'OUT';
  const block = TABLE[mode];

  /* 1) 公用步骤 */
  block.common.forEach(c => Z(c.pic, c.x, c.y, c.s));

};


// 厕所口交事件ZOOM效果
QJ.MPMZ.tl._toiLetFeraSceneZoomEffects = function () {

  const P = id => $gameScreen.picture(id);
  const Z = QJ.MPMZ.tl._batchProcessImageZoomEffects;   

  const TABLE = {
    /*=========== 近景：picture(1) < 60% = 镜头推进 ============*/
    IN: {
      common: [
        { pic:[1,2,3,4,6,8,10,11,12],             x:null, y:null, s:100 },
        { pic:[1,2,3,6,10,11],                    x:-600, y:-800, s:null }
      ],
      cases: [
        {
          cond : () => P(12)?.name().includes('fera_shasei'),
          steps: [
            { pic:[8],       x: 400, y:   0,  s:null },
            { pic:[4,12],    x: 418, y:-220, s:null }
          ]
        },
        {
          cond : () => P(12)?.name().includes('fera_action'),
          steps: [
            { pic:[4],       x:-600, y:-800, s:null },
            { pic:[8],       x: 400, y:   0, s:null },
            { pic:[12],      x: 800, y: 200, s:null }
          ]
        },
        {
          cond : () => P(12)?.name().includes('toilet_sister_fera1'),
          steps: () => {
            const dx = P(12).name().includes('shasei') ? 500 : 400;
            return [{ pic:[8,12], x:dx, y:-800, s:null }];
          }
        }
      ]
    },

    /*=========== 远景：picture(1) ≥ 60% = 镜头拉远 ============*/
    OUT: {
      common: [
        { pic:[1,2,3,4,6,8,10,11,12],             x:null, y:null, s:50 },
        { pic:[1,2,3,6,10,11],                    x:   0, y:   0, s:null }
      ],
      cases: [
        {
          cond : () => P(12)?.name().includes('fera_shasei'),
          steps: [
            { pic:[8],       x: 500, y: 400, s:null },
            { pic:[4,12],    x: 509, y: 290, s:null }
          ]
        },
        {
          cond : () => P(12)?.name().includes('fera_action'),
          steps: [
            { pic:[4],       x:   0, y:   0, s:null },
            { pic:[8],       x: 500, y: 400, s:null },
            { pic:[12],      x: 700, y: 500, s:null }
          ]
        },
        {
          cond : () => P(12)?.name().includes('toilet_sister_fera1'),
          steps: () => {
            const dx = P(12).name().includes('shasei') ? 550 : 500;
            return [{ pic:[8,12], x:dx, y:0, s:null }];
          }
        }
      ]
    }
  };

  /*—— 主流程 ——*/
  const mode  = P(1)._scaleX < 60 ? 'IN' : 'OUT';
  const block = TABLE[mode];

  /* 1) 公用步骤 */
  block.common.forEach(c => Z(c.pic, c.x, c.y, c.s));

  /* 2) 条件分支（命中一条即退出） */
  for (const branch of block.cases) {
    if (branch.cond()) {
      const steps = (typeof branch.steps === 'function') ? branch.steps() : branch.steps;
      steps.forEach(s => Z(s.pic, s.x, s.y, s.s));
      return;            // 只执行首个匹配分支
    }
  }
};



QJ.MPMZ.tl._sceneZoomInAndZoomOut = function () {

let picArray;
let targetX;
let targetY;
let scale;

if ( $gameScreen.picture(1)._scaleX < 60 )  {
	
 picArray = [1,2,3,4,6,8,10,11,12];
 targetX = null;
 targetY = null;
 scale = 100;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [1,2,3,6,10,11];
 targetX = -600;
 targetY = -800;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("fera_shasei")) {
 picArray = [8];
 targetX = 400;
 targetY = 0;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [4,12];
 targetX = 418;
 targetY = -220;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
return;
}

 picArray = [4];
 targetX = -600;
 targetY = -800;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("fera_action")) {
 picArray = [8];
 targetX = 400;
 targetY = 0;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [12];
 targetX = 800;
 targetY = 200;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
return;	
}

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("toilet_sister_fera1")) {
	if ($gameScreen.picture(12).name().includes("shasei")) {
  		 picArray = [8,12];
  		 targetX = 500;
 		 targetY = -800;
  		 scale = null;
 		 QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
         return;		 
	}
	  	 picArray = [8,12];
  		 targetX = 400;
 		 targetY = -800;
  		 scale = null;
 		 QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
		 return;
}
} else {
 picArray = [1,2,3,4,6,8,10,11,12];
 targetX = null;
 targetY = null;
 scale = 50;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [1,2,3,6,10,11];
 targetX = 0;
 targetY = 0;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("fera_shasei")) {
 picArray = [8];
 targetX = 500;
 targetY = 400;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [4,12];
 targetX = 509;
 targetY = 290;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
return;
}

 picArray = [4];
 targetX = 0;
 targetY = 0;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("fera_action")) {
 picArray = [8];
 targetX = 500;
 targetY = 400;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
 picArray = [12];
 targetX = 700;
 targetY = 500;
 scale = null;
QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
return;	
}

if ($gameScreen.picture(12) && $gameScreen.picture(12).name().includes("toilet_sister_fera1")) {
	if ($gameScreen.picture(12).name().includes("shasei")) {
  		 picArray = [8,12];
  		 targetX = 550;
 		 targetY = 0;
  		 scale = null;
 		 QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
         return;		 
	}
	  	 picArray = [8,12];
  		 targetX = 500;
 		 targetY = 0;
  		 scale = null;
 		 QJ.MPMZ.tl._batchProcessImageZoomEffects(picArray, targetX, targetY, scale);
		 return;
}	
}
};