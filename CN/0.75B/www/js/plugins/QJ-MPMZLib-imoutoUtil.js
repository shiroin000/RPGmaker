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

// 料理界面指令内容读取
QJ.MPMZ.tl._imoutoUtilCookingSceneCommandText = function() {
	
          if (!this) return;	
          let pid = 22;
		  
          if ($gameScreen.isPointerInnerPicture(22)) pid = 22;
          if ($gameScreen.isPointerInnerPicture(23)) pid = 23;
          if ($gameScreen.isPointerInnerPicture(24)) pid = 24;
		  
          var itemId = pid + 53;
          this.count = itemId;
		  
            var text1,text2,text3
            var lang = $gameVariables.value(1);
            switch (lang) {
                case 0:
                    text1 = `\\ii[\\v[${itemId}]]已经准备好了、要做些什么？`;
					text2 = "换其他食材";
					text3 = "还是不要了";
                    break;
                case 1:
                    text1 = `\\ii[\\v[${itemId}]]の準備はできた、さて何を作ろう？`;
					text2 = "別の食材に替える";
					text3 = "やっぱりやめる";
                    break;
                case 2:
                    text1 = `\\ii[\\v[${itemId}]]is ready. What should I do?`;
					text2 = "Change ingredients";
					text3 = "Discard this";
                    break;
                default:
                    text1 = `\\ii[\\v[${itemId}]]已经准备好了、要做些什么？`;
					text2 = "换其他食材";
					text3 = "还是不要了";
                    break;
            }
			
		$gameStrings.setValue(5,text1);
		$gameStrings.setValue(6,text2);
		$gameStrings.setValue(7,text3);		
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
QJ.MPMZ.tl._playerOldSaveVersionCheck = function(specifyVersion = "70") {

    const gameTitle = $dataSystem.gameTitle;
    const match = gameTitle.match(/ver([\d\.A-Za-z]+)/i);
    let versionA,versionB; 
	
    if (match) {
        versionA = match[1];
    } else {
        versionA = "0.72"; // 默认备用值
    }
	
    versionB = $gameStrings.value(2).trim();
    if (versionB === "" || versionB === "<現在装備中>") {
        // 如果存档中没有记录版本号，则视为旧版本存档
        // 重置字符串变量
        $gameStrings.clear();
        $gameStrings.drill_COSt_init();	
        // 重置地图按钮
        $gameSystem.drill_GBu_initSysData();		
        $gameStrings.setValue(2, match[1]);
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

// 妹妹状态描述文本
QJ.MPMZ.tl._imoutoUtilStateText = {
        34: { // 刷牙状态
            setValue: {
                0: "刷牙中的",
                1: "歯磨き中",
                2: "Brushing "
            },
            description: {
                0: "\\fs[14]✦\\fi\\c[110]懒散地刷牙中、\n还一副没睡醒的模样……",
                1: "\\fs[14]✦\\fi\\c[110]だらだらと歯を磨いて、\nまだ完全に目が覚めていない様子……",
                2: "\\fs[14]✦\\fi\\c[110]Lazily brushing her teeth, \nstill looking half-asleep…"
            }
        },
        33: { // 乘凉状态
            setValue: {
                0: "乘凉中的",
                1: "涼んでいる",
                2: "Relaxing "
            },
            description: {
                0: "\\fs[14]✦\\fi\\c[110]妹妹正在惬意地舔着冰棒、\n但有点太没防备的样子了……",
                1: "\\fs[14]✦\\fi\\c[110]妹はアイスキャンディーを楽しんでいるが、\n少し油断している様子……",
                2: "\\fs[14]✦\\fi\\c[110]She’s lazily licking a popsicle,\nbut she looks too unguarded…"
            }
        },
        28: { // 玩游戏状态
            setValue: {
                0: "在玩游戏的",
                1: "ゲーム中",
                2: "Gaming "
            },
            // description为数组，随机选择其中一条显示
            description: {
                0: [
                    "\\fs[14]✦\\fi\\c[110]妹妹正集中精神玩游戏、\n还是不要太打搅吧…",
                    "\\fs[14]✦\\fi\\c[110]还在玩游戏的样子…\n要捉弄下妹妹看看吗？"
                ],
                1: [
                    "\\fs[14]✦\\fi\\c[110]妹は一心不乱にゲーム中、\n邪魔しない方がいいかも…",
                    "\\fs[14]✦\\fi\\c[110]まだゲーム中…\nからかってみる？"
                ],
                2: [
                    "\\fs[14]✦\\fi\\c[110]She’s really focused on the game, \nso it’s better not to disturb her too much…",
                    "\\fs[14]✦\\fi\\c[110]She’s still playing... \nShould I tease her a bit?"
                ]
            }
        },
        29: { // 洗澡状态
            setValue: {
                0: "洗澡中的",
                1: "入浴中",
                2: "Bathing "
            },
            // 卧室、浴室都可能出现洗澡中状态
            description: {
                0: {
                    4: "\\fs[14]✦\\fi\\c[110]妹妹正在用毛巾擦干头发",
                    default: "\\fs[14]✦\\fi\\c[110]正在洗澡的妹妹、\n依稀能看见身影"
                },
                1: {
                    4: "\\fs[14]✦\\fi\\c[110]妹はタオルで髪を乾かしている",
                    default: "\\fs[14]✦\\fi\\c[110]入浴中の妹、\nかすかに姿が見える"
                },
                2: {
                    4: "\\fs[14]✦\\fi\\c[110]Sister is drying her hair \nwith a towel",
                    default: "\\fs[14]✦\\fi\\c[110]Sister is bathing,\nher figure barely visible"
                }
            }
        },
        32: { // 肚子饿状态
            setValue: {
                0: "肚子饿了的",
                1: "お腹が空いている",
                2: "Hungry "
            },
            description: {
                0: [
                    "\\fs[14]✦\\fi\\c[110]妹妹在静静地等着晚饭。",
                    "\\fs[14]✦\\fi\\c[110]妹妹好像有点担心晚饭的味道…",
                    "\\fs[14]✦\\fi\\c[110]妹妹似乎想要帮忙的样子。"
                ],
                1: [
                    "\\fs[14]✦\\fi\\c[110]妹は静かに夕食を待っている。",
                    "\\fs[14]✦\\fi\\c[110]妹は夕食の味を少し心配しているようだ…",
                    "\\fs[14]✦\\fi\\c[110]妹は手伝いたそうな様子だ。"
                ],
                2: [
                    "\\fs[14]✦\\fi\\c[110]Sister is quietly waiting \nfor dinner",
                    "\\fs[14]✦\\fi\\c[110]Sister seems a bit worried \nabout the dinner taste…",
                    "\\fs[14]✦\\fi\\c[110]Sister appears like she \nwants to help"
                ]
            }
        }
};

    // 辅助函数：根据心情值获取休息状态的描述文本
    function getRestingDescription(lang, mood) {
        var texts = {
            0: {
                high: [
                    "\\fs[14]✦\\fi\\c[110]妹妹看起来很开心、\n遇到了什么有趣的事情吗？",
                    "\\fs[14]✦\\fi\\c[110]越来越可爱的妹妹\n去摸摸她的头吧!"
                ],
                mid: "\\fs[14]✦\\fi\\c[110]妹妹只是呆呆地坐在那。\n去试试找她搭话吧…",
                low: [
                    "\\fs[14]✦\\fi\\c[110]妹妹看起来有点难过、\n去安慰看看吧？",
                    "\\fs[14]✦\\fi\\c[110]妹妹看起来有点不舒服、\n该做点什么好呢…"
                ],
                sleep: "\\fs[14]✦\\fi\\c[110]妹妹看起来已经困了、\n差不多该去睡觉了吧？"
            },
            1: {
                high: [
                    "\\fs[14]✦\\fi\\c[110]楽しそうな顔をしている妹、\n何か面白いものでも見たのかな？",
                    "\\fs[14]✦\\fi\\c[110]どんどん可愛くなる妹\n頭を撫でてあげよう!"
                ],
                mid: "\\fs[14]✦\\fi\\c[110]妹がただぼんやり座ってるな。\n話しかけた方がいいかな…",
                low: [
                    "\\fs[14]✦\\fi\\c[110]妹がちょっと悲しそうだな、\n慰めてみるか？",
                    "\\fs[14]✦\\fi\\c[110]妹が元気なさそうだけど、\nどうしたらいいかな…"
                ],
                sleep: "\\fs[14]✦\\fi\\c[110]妹はすでに眠そう、\nそろそろ寝る時間かも？"
            },
            2: {
                high: [
                    "\\fs[14]✦\\fi\\c[110]Sister looks very happy,\nDid something interesting happen?",
                    "\\fs[14]✦\\fi\\c[110]Sister is getting cuter,\nMaybe give her a pat on the head!"
                ],
                mid: "\\fs[14]✦\\fi\\c[110]Sister is just sitting \nthere. Try talking to her…",
                low: [
                    "\\fs[14]✦\\fi\\c[110]Sister looks a bit sad,\nMaybe try comforting her?",
                    "\\fs[14]✦\\fi\\c[110]Sister seems a bit off,\nWonder what could be done…"
                ],
                sleep: "\\fs[14]✦\\fi\\c[110]Sister looks sleepy,\nMaybe it's time for bed?"
            }
        };
        // 优先判断是否存在“揉眼睛”的贴图，满足则直接返回“睡意”文本
        if ($gameScreen.picture(5) && $gameScreen.picture(5).name().includes("rubEyes")) {
            return texts[lang].sleep;
        }
        if (mood >= 75) {
            return (Math.random() > 0.5) ? texts[lang].high[0] : texts[lang].high[1];
        } else if (mood >= 50) {
            return texts[lang].mid;
        } else if (mood >= 30) {
            return (Math.random() > 0.5) ? texts[lang].low[0] : texts[lang].low[1];
        } else {
            return (Math.random() > 0.5) ? texts[lang].low[0] : texts[lang].low[1];
        }
    }

    // 辅助函数：根据睡眠需求获取睡眠状态的描述文本
    function getSleepDescription(lang, sleepDesire) {
        var texts = {
            0: {
                high: "\\fs[14]✦\\fi\\c[110]妹妹快要醒过来了、\n但意识还有些模糊。",
                mid: "\\fs[14]✦\\fi\\c[110]看起来半梦半醒着、\n无意识地发出呢喃。",
                low: "\\fs[14]✦\\fi\\c[110]睫毛抖动着、\n隐约能听到在说什么梦话。",
                lower: "\\fs[14]✦\\fi\\c[110]睡得很安稳、\n完全沉浸在睡梦中…",
                veryLow: "\\fs[14]✦\\fi\\c[110]爆睡中…\n看起来是很难醒过来了。",
                default: "\\fs[14]✦\\fi\\c[110]像植物一样陷入了沉睡…\n怎么都叫不起来了…"
            },
            1: {
                high: "\\fs[14]✦\\fi\\c[110]妹はもうすぐ目を覚ます、\nでも意識はまだ朦朧としている。",
                mid: "\\fs[14]✦\\fi\\c[110]半分夢の中、\n何かを呟いている。",
                low: "\\fs[14]✦\\fi\\c[110]まぶたが震え、\n夢の中の囁きが聞こえる。",
                lower: "\\fs[14]✦\\fi\\c[110]ぐっすり眠っている、\n夢の世界に浸っている…",
                veryLow: "\\fs[14]✦\\fi\\c[110]ぐっすり寝て、\n起こすのが難しそう。",
                default: "\\fs[14]✦\\fi\\c[110]植物のように眠り続け…\n起こせそうにない。"
            },
            2: {
                high: "\\fs[14]✦\\fi\\c[110]Sister is almost awake,\nbut her senses are still hazy.",
                mid: "\\fs[14]✦\\fi\\c[110]She seems half-awake,\nmurmuring unintentionally.",
                low: "\\fs[14]✦\\fi\\c[110]Her eyelashes twitch,\nas if murmuring in a dream.",
                lower: "\\fs[14]✦\\fi\\c[110]Sleeping soundly,\ncompletely immersed in her dreams…",
                veryLow: "\\fs[14]✦\\fi\\c[110]Deep asleep…\nIt seems hard to wake her.",
                default: "\\fs[14]✦\\fi\\c[110]Asleep like a plant…\nunable to be roused."
            }
        };
        if (sleepDesire >= 70) {
            return texts[lang].high;
        } else if (sleepDesire >= 50) {
            return texts[lang].mid;
        } else if (sleepDesire >= 30) {
            return texts[lang].low;
        } else if (sleepDesire >= 10) {
            return texts[lang].lower;
        } else if (sleepDesire >= 0) {
            return texts[lang].veryLow;
        } else {
            return texts[lang].default;
        }
    }

// 妹妹状态描述刷新
QJ.MPMZ.tl._imoutoUtilStateDescriptionRefresh = function() {
	
        var actor = $gameActors.actor(2);
        var lang = $gameVariables.value(1); // 0:中文, 1:日语, 2:英语
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
            $gameStrings.setValue(41, imoutoText[28].setValue[lang]);
            // 移除立绘标记
            for (let i = 29; i <= 32; i++) {
                actor.removeState(i);
            }
            var descOptions = imoutoText[28].description[lang];
            var randomIndex = Math.floor(Math.random() * descOptions.length);
            $dataStates[28].description = descOptions[randomIndex];
            return;
        }
        // 妹妹洗澡中
        if (actor.isStateAffected(29)) {
            $gameStrings.setValue(41, imoutoText[29].setValue[lang]);
            var mapId = $gameMap.mapId();
            var descObj = imoutoText[29].description[lang];
            $dataStates[29].description = (mapId === 4) ? (descObj[4] || descObj.default) : descObj.default;
            return;
        }
        // 妹妹休息中
        if (actor.isStateAffected(30)) {
            $gameStrings.setValue(41, (lang === 0) ? "休息中的" : (lang === 1 ? "休憩中の" : "Resting "));
            var mood = $gameVariables.value(20);
            $dataStates[30].description = getRestingDescription(lang, mood);
            return;
        }		
        // 妹妹睡眠中(根据睡眠欲变化文本)
        if (actor.isStateAffected(31)) {
			$gameStrings.setValue(41, (lang === 0) ? "睡得正香的" : (lang === 1 ? "ぐっすり寝てる" : "Sleeping  "));
            var sleepDesire = $gameVariables.value(19);
            $dataStates[31].description = getSleepDescription(lang, sleepDesire);
            return;
        }
        // 妹妹肚子饿
        if (actor.isStateAffected(32)) {
            $gameStrings.setValue(41, imoutoText[32].setValue[lang]);
            var descOptions = imoutoText[32].description[lang];
            var randomIndex = Math.floor(Math.random() * descOptions.length);
            $dataStates[32].description = descOptions[randomIndex];
            return;
        }
        // 妹妹乘凉中
        if (actor.isStateAffected(33)) {
            $gameStrings.setValue(41, imoutoText[33].setValue[lang]);
            $dataStates[33].description = imoutoText[33].description[lang];
            return;
        }		
        // 妹妹刷牙中
        if (actor.isStateAffected(34)) {
            $gameStrings.setValue(41, imoutoText[34].setValue[lang]);
            $dataStates[34].description = imoutoText[34].description[lang];
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
            $gameMap.event(38).start(); // 触发夜袭流程
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
    if (imouto.isStateAffected(40) && $gameMap.mapId() === 4) {
        $gameScreen._pictureCidArray = [];
        $gameMap.event(45).steupCEQJ(2);
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
        // 初始化描述窗口
        $gameSystem.drill_GFPT_create(10, 29);
        const data = $gameSystem._drill_GFPT_dataTank[10];
        
        const lang = $gameVariables.value(1);
        const imouto = $gameActors.actor(2);
        
        let state1 = " ";
        let state2 = " ";
        let panties = " ";
        let description = " ";
        let sisName = " ";
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
            panties = "${$dataArmors[" + imouto._equips[1]._itemId + "].infoTextTop}";
        } else {
            panties = "${$dataArmors[159].infoTextTop}";
        }
        
        // 适配多语言
        switch (lang) {
            case 0:
                sisName = "妹妹";
                dropsName = "可能掉落";
                break;
            case 1:
                sisName = "妹";
                dropsName = "ドロップアイテム";
                break;
            case 2:
                sisName = "Imouto";
                dropsName = "Possible drops";
                break;
            default:
                sisName = "妹妹";
                dropsName = "可能掉落";
                break;
        }
        
        description = "\\str[41]" + sisName +
                      "\n\\fs[30]\\i[2]\\fr ???" +
                      "\n\\py[-5]" + state1 +
                      "\n\\py[16]" + state2 +
                      "\n\\fs[16]\\py[16]✦" + dropsName + ":" +
                      "\n\\fs[16]\\py[-4]" + panties;
                      
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
QJ.MPMZ.tl._imoutoUtilCheckInitialization = function() {
    
	// 快捷互动按钮
	let condition = $gameScreen.picture(5) && $gameScreen.picture(5).name().includes("sis_chibi_normal");
	if (condition) chahuiUtil.quickInteractionIconInitialize();

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
		  [60,7200,QJ.MPMZ.tl._imoutoUtilautoUpdataCheck]  // 自动更新检测
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
		// 哥哥的战力显示
		$gameSystem._drill_GFV_bindTank[ 3 ]['visible'] = false;
		$gameTemp._drill_GFV_needRefresh = true;
		// 金钱显示框
		$gameSystem._ghud_visible = false;
		
	}
	
	// 重置系统语言标记
   var titleText = $dataSystem.gameTitle;
   if (titleText.includes("和存在感薄弱妹妹一起的简单生活")) {
        $gameVariables.setValue(1, 0);
    } else if (titleText.includes("存在感薄い妹との簡単生活")) {
        $gameVariables.setValue(1, 1);
    } else if (titleText.includes("A Simple Life with My Unobtrusive Sister")) {
        $gameVariables.setValue(1, 2);
    }
    // 重置鼠标指针
    $gameStrings.setValue(36, '');	

};

// 自动更新检测
QJ.MPMZ.tl._imoutoUtilautoUpdataCheck = function() {

    if ($gameSwitches.value(99)) return;
		
	if ($gameStrings.value(1).trim() !== "") {		
		QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
	}
	
	if ($gameMap.mapId() === 4) {
	  chahuiUtil.getGameUpdateLog();
	}
	
    var versionB = "0.1";
	$gameStrings.setValue(1,"");
    var title = $dataSystem.gameTitle;
    var match = title.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        var versionA = match[1];
    } else {
        return false;
    }
	var userLang = $gameVariables.value(1);
	if (![0,1,2].includes(userLang)) userLang = 0;
	
    var url = "https://script.google.com/macros/s/AKfycbyAOCAFafhItnPc_l_gJk0i6nCPqUTPP-RuSESS4ATr3IDmmJMS63DBOcXIbA_JTzOO/exec"
            + "?mode=LatestVersion"
			+ "&lang=" + userLang
			+ "&version=75";				

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
		  $gameStrings.setValue(1,versionB); 
		  $gameVariables.setValue(2, versionB);
          QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
		  }
		return true;
    }

        // 如果数值部分相同，比较字母部分（A < B < C...）
        var result = letterA.localeCompare(letterB);
        if (result < 0) {
		  $gameStrings.setValue(1,versionB);
          $gameVariables.setValue(2, versionB);		  
          QJ.MPMZ.tl._imoutoUtilautoUpdataIcon();
		  }
		return true;
    };		
};

// 自动更新提醒图标
QJ.MPMZ.tl._imoutoUtilautoUpdataIcon = function() {
   	
	if ($gameMap.mapId() !== 4) return;
	if ($gameScreen.picture(81)) return;
	if ($gameSwitches.value(28)) return;
	
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

// 监听妹妹好感条消失
QJ.MPMZ.tl._imoutoUtilkokanBarFades = function() {
	
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
	let forbid2 = $gameScreen.picture(5) && $gameScreen.picture(5)._opacity > 250 && $gameScreen.picture(5).name().includes("sis_chibi_normal");
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
	
	if (TouchInput.drill_isLeftTriggerd() || TouchInput.drill_isLeftPressed()) {
		// 为点击判定追加图标响应器
	  if ( QJ.MPMZ.rangeAtk([['M'],['M']],['B','imoutoUtilIcon'],['S',"bulletTarget._activated=true"],['C',2]).length == 0 ) {
		$gameMap.event(15).steupCEQJ(4);
        this._coolDown = 30;
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
QJ.MPMZ.tl._imoutoUtilSelectDrinkResponse = function() {

	this._coolDown = this._coolDown || 0;
    if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
    }
	
	if (!SceneManager._scene._messageWindow._itemWindow || !SceneManager._scene._messageWindow._itemWindow.active) {
		this.setDead({t:['Time',0]});	
	}
	
    this._selected = this._selected || 0;
	let selected = SceneManager._scene._messageWindow._itemWindow.item().id;
	
	if (this._selected == selected) return;
	
	this._selected = selected;
	$gameMap.event(44).steupCEQJ(4,{selectedId:selected});	
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
	}
     if (!noPrefix)	type = "washroom_sis_" + type;
	 return type;
};

//浴室花洒动画播放
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
 
 var icon = QJ.MPMZ.Shoot({
    groupName:["button",tag],
    img:iconImg,
	initialRotation:['S',0],
    position:[['S',posX],['S',posY]],
	z:"A",
    imgRotation:['S',0],
	moveType: ['S',0],
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
	$gameScreen.showPictureFromPath(10, "bathroom_event", IMG, 0, 0, 0, 50, 50, 255, 0);
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
	 $gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 0, 50, 50, 255, 0);
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
	$gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 0, 50, 50, 255, 0);
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
	$gameScreen.showPictureFromPath(8, "bathroom_event", IMG, 0, 0, 0, 50, 50, 255, 0);
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
	$gameScreen.showPictureFromPath(5, "bathroom_event", IMG, 0, 0, 0, 50, 50, 255, 0);
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
            groupName: ['playerElectrifiedEffect'],
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
	
	var IMG = "washroom_tekoki_visibleBreath" + this._frames;
	$gameScreen.showPictureFromPath(11, "washroom_tekoki", IMG, 0, 0, 0, 100, 100, 255, 0);
	
	this._frames += 1;
	this._coolDown = 4;
	// 执行不透明度淡出指令
	if (this._frames >= 8) {
		var pic = $gameScreen.picture(11);
		if (pic) $gameScreen.movePicture(11, pic.origin(), pic.x(), pic.y(), pic.scaleX(), pic.scaleY(), 0, 0, 60);
	    this._frames = 0;	
        this._coolDown = 32;
	}	
	
};

// 洗面所手交事件-妹妹的撸撸动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction = function(type) {
	
	if (!type) return;
	var index = 18;
	
	if ($gameVariables.value(18) >= 4) {
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

	var IMG2 = "washroom_tekoki_hand" + this._frames;
	$gameScreen.showPictureFromPath(16, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);
	//$gameScreen.picture(12).drill_PLAZ_setLayer( "最顶层" );
	
	var IMG1 = type + this._frames;
	$gameScreen.showPictureFromPath(index, "washroom_tekoki", IMG1, 0, 0, 0, 100, 100, 255, 0);
	//$gameScreen.picture(index).drill_PLAZ_setLayer( "最顶层" );

    if (this._frames == 5) {   
       if ( $gameVariables.value(25) > 40 && !type.includes("Panties")) {
		  // 满足条件后切换到第二个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction2'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction2,[type]]
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
};

// 洗面所手交事件-妹妹第二动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction2 = function(type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	$gameScreen.erasePicture(16);
	$gameScreen.erasePicture(18);
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action2_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);

    if (this._frames == 23) {   
       if ( $gameVariables.value(25) > 50) {
		  // 满足条件后切换到第三个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction3'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction3,[type]]
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
	
};

// 洗面所手交事件-妹妹第三动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction3 = function(type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action3_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);

	if (this._frames >= 26) {
		
       if ( $gameVariables.value(25) > 70) {
		  // 满足条件后切换到第四个动作
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiAction4'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction4,[type]]
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
	
};

// 洗面所手交事件-妹妹第四动作
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction4 = function(type) {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 5;
	this._times = this._frames || 0;
	
    // 手的动作
	var IMG2 = "washroom_tekoki_action4_" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);

	if (this._frames == 15) {
		
       if ( $gameVariables.value(25) > 80) {
		  // 满足条件后哥哥射爆
          QJ.MPMZ.Shoot({
             img:"null1",groupName: ['tekokiActionShasei'],
             existData: [ ],
             moveF:[
               [this._speed,0,QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei,[type]]
             ],
          });
          this.setDead({t:['Time',0]}); 		  
	   }
	}

	if (this._frames >= 23) {
        this._times += 1;	
        if (this._times > 4) this._speed = 3;		
		this._coolDown = 6;
		this._frames = 11;
		return;
	}	

   	this._frames += 1;
	this._coolDown = this._speed;	
	
};

// 洗面所手交事件-哥哥射爆
QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei = function(type) {
	
	//if (!type) return;		
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 6;
	this._speed = this._speed || 5;
	
    // 射精
	var IMG2 = "washroom_tekoki_shasei" + this._frames;
	$gameScreen.showPictureFromPath(15, "washroom_tekoki", IMG2, 0, 0, 0, 100, 100, 255, 0);
	
    // 射在妹妹头上的精液
	if (this._frames >= 14 && this._frames <= 52) {
	var duplicateArray = [21,22,23,24,26,27,28,30,31,32,38,40,41,42,43,45,46];
	if (!duplicateArray.includes(this._frames)) {
	var IMG1 = "washroom_tekoki_shasei_hairSeieki" + this._frames;
	$gameScreen.showPictureFromPath(12, "washroom_tekoki", IMG1, 0, 0, 0, 100, 100, 255, 0);
	  }
    } else if (this._frames > 51 && !$gameScreen.picture(12)) {
	$gameScreen.showPictureFromPath(12, "washroom_tekoki", "washroom_tekoki_shasei_hairSeieki51", 0, 0, 0, 100, 100, 255, 0);	
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

// 厕所口交事件-妹妹自慰
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraAction0 = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 3;
	
    // 自慰动作
	var IMG1 = "toilet_sister_onanii_back" + this._frames;
	$gameScreen.showPictureFromPath(8, "toilet_nozoku", IMG1, 0, 0, 0, 50, 50, 255, 0);	

   	this._frames += 1;
	this._coolDown = 3;	

	if (this._frames === 12) {	   
		this._coolDown += 6;
	}	
	if (this._frames === 14 && Math.random() > 0.8) {	   
		this._coolDown += 3;
		this._frames = 7;
		return;
	}
	if (this._frames === 15 && Math.random() > 0.8) {	   
		this._coolDown += 3;
		this._frames = 6;
		return;
	}	
	if (this._frames >= 16) {	  
	    this._coolDown += 6;
		this._frames = 4;
	}	
};

// 厕所口交事件-舔肉棒
QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraAction1 = function() {
	
	this._coolDown = this._coolDown || 0;	
	if (this._coolDown > 0) {
	   this._coolDown -= 1;
	   return;
	}
	
	this._frames = this._frames || 1;
	this._speed = this._speed || 3;
	
    // 肉棒动作
	var IMG1 = "toilet_sister_fera_action" + this._frames;
	$gameScreen.showPictureFromPath(12, "toilet_nozoku", IMG1, 0, 0, 0, 50, 50, 255, 0);	

   	this._frames += 1;
	this._coolDown = 3;	

	if (this._frames >= 10) {	  
	    this._coolDown += 3;
		this._frames = 1;
	}	
};


// 亲密接触初始化
QJ.MPMZ.tl._imoutoUtilSkinship = function() {
	
	// 改变指针
	$gameStrings.setValue(36, 'pointer_touch');
	
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
            {
                t: ['S', "!$gameMessage.isBusy()&&TouchInput.drill_isRightPressed()", true],
                a: ["S", "$gameMap.event(4).steupCEQJ(1);$gameStrings.setValue(36, '')"]
            }
        ],
        moveF: [
            [30, 2, QJ.MPMZ.tl._imoutoUtilSkinshipAhogeDetection],
            [30, 6, QJ.MPMZ.tl._imoutoUtilSkinshipHitboxDetection]
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
		$gameMap.event(16).steupCEQJ(1,{ahogeDistance:disX});
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
  if (!TouchInput.drill_isLeftPressed() && !$gameSwitches.value(14) && !$gameMessage.isBusy()) {
	  this._idleTime += 1;
	  if (this._idleTime >= 30) {
		  this._coolDown = 5;
		  this._idleTime = 0;
		  $gameMap.event(4).steupCEQJ(2);
		  return;
	  }
  }
	
  if (TouchInput.drill_isLeftPressed()) {
	  
	  this._idleTime = 0;
	
	if ($gameScreen.isPointerInnerPicture(20)) return;
	
	// 穿着T恤
	if ($gameActors.actor(2).isStateAffected(23)) {
		
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
         $gameMap.event(30).steupCEQJ(1);
         return;		 
	}
    // 揉胸判定-左
    if ( chahuiUtil.pointInCircle('tachieLeftBreast') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(1);
         return;	
	}
    // 揉胸判定-右
    if ( chahuiUtil.pointInCircle('tachieRightBreast') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(1);
         return;		
	}
    // 摸肚脐判定
    if ( chahuiUtil.pointInCircle('tachieNavel') ) {
		 this._coolDown = 5;
		 this._suspend = true;
		 $gameVariables.setValue(10, 0);
         $gameMap.event(5).steupCEQJ(3);
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
    if ( chahuiUtil.pointInPolygo('tachieClavicle') ) {
		 this._coolDown = 5;
         var text = "\\c[10]\\dDCOG[11:2:2:2]\\fs[28]正在摸锁骨！";
         $gameTemp.drill_GFTT_createSimple( [_drill_mouse_x,_drill_mouse_y], text, 2, 9, 90 );	
         return;		 
	}
    // 右耳区域判定	
    if ( chahuiUtil.pointInPolygo('tachieRightEar') ) {
		 this._coolDown = 5;
         var text = "\\c[10]\\dDCOG[11:2:2:2]\\fs[28]正在摸右耳！";
         $gameTemp.drill_GFTT_createSimple( [_drill_mouse_x,_drill_mouse_y], text, 2, 9, 90 );	
		 return;
	}	
    // 左耳区域判定	
    if ( chahuiUtil.pointInPolygo('tachieLeftEar') ) {
		 this._coolDown = 5;
         var text = "\\c[10]\\dDCOG[11:2:2:2]\\fs[28]正在摸左耳！";
         $gameTemp.drill_GFTT_createSimple( [_drill_mouse_x,_drill_mouse_y], text, 2, 9, 90 );
		 return;
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