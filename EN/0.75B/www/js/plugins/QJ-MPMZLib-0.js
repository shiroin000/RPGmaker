//=============================================================================
//
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc [弹幕模板库][放在QJ-MapProjectileMZ.js下][您可自由修改]
 * @author 仇九
 *
 * @help 
 * 1.需要装有QJ-MapProjectileMZ.js时才能使用此插件，否则报错。
 * 2.此插件需要放在放在QJ-MapProjectileMZ.js下。
 * 3.您可以按照此插件中的说明（请打开此插件文件查看）来修改此插件。
 * 4.插件详细教程：
 *https://qiujiu-9.github.io
 *
 */
//=============================================================================
//
//=============================================================================

var shiroin_Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
	
    shiroin_Scene_Boot_start.call(this);

    var titleText = $dataSystem.gameTitle || "";
    var langKey   = titleText.includes("和存在感薄弱妹妹一起的简单生活")
                  ? "CN"
                  : titleText.includes("存在感薄い妹との簡単生活")
                  ? "JP"
                  : "EN";

    DataManager.loadDataFile(
      'mapCommonEventDialogue',
      `MapCommonEventDialogue${langKey}.json`
    );
};


// 修复新版本NWjs关闭程序的写法问题
SceneManager.exit = function() {
  if (window.nw && nw.App && nw.App.quit) {
    nw.App.quit();
  } else {
    window.close();
  }
};


QJ.MPMZ.tl.ex_LabyrinthScenePreload = function() {

    var regionArray1 = [];
    var regionArray2 = [];
    for (var y = 0; y < $dataMap.height; y++) {
        for (var x = 0; x < $dataMap.width; x++) {
            if ($gameMap.regionId(x, y) === 214) {
                regionArray1.push({ x: x, y: y });
            }
            if ($gameMap.regionId(x, y) === 215) {
                regionArray2.push({ x: x, y: y });
            }
        }
    }

    for (var i = 0; i < regionArray1.length; i++) {
        var pos = regionArray1[i];
        var name = "window_lay_c" + i;
        var xx = pos.x; 
        var yy = pos.y + 0.3; 
        $gameScreen._particle.particleSet(0, name, 'tilemap', 'window_lay_c', 'above', xx, yy);
    }


    for (var i = 0; i < regionArray2.length; i++) {
        var pos = regionArray2[i];
        var name = "light_orange_c" + i;
        var xx = pos.x;
        var yy = pos.y + 0.4;
        $gameScreen._particle.particleSet(0, name, 'tilemap', 'light_orange_c', 'below', xx, yy);
    }


    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 10], ['Map', 55]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.4, 1.5],
        collisionBox: ['R', 248, 40],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true], c: ['T', 0, 4, true] },
            { t: ['P'], a: ['C', 133, [28, 7, 30]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 8], ['Map', 28]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.5, 0.7],
        collisionBox: ['R', 96, 96],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true], c: ['T', 0, 4, true] },
            { t: ['P'], a: ['C', 133, [28, 4, 10]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 7], ['Map', 29]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.3, 0.75],
        collisionBox: ['R', 75, 120],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true], c: ['T', 0, 4, true] },
            { t: ['P'], a: ['C', 133, [28, 4, 10]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 11], ['Map', 28]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.5, 3.2],
        collisionBox: ['R', 200, 8],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true], c: ['T', 0, 4, true] },
            { t: ['P'], a: ['C', 133, [28, 4, 10]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 12], ['Map', 30]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.05, 14],
        collisionBox: ['R', 54, 1],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true], c: ['T', 0, 4, true] },
            { t: ['P'], a: ['C', 133, [28, 4, 10]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 59], ['Map', 45]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.05, 0.5],
        collisionBox: ['R', 54, 118],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [4, 0, 0]], p: [-1, false, true] },
            { t: ['P'], a: ['C', 133, [5, 40, 23]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });

    QJ.MPMZ.Shoot({
        img: "null1",
        position: [['Map', 56], ['Map', 35]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        collisionBox: ['R', 600, 500],
        existData: [
            { t: ['G', ['"enemy"', '"object"']], a: ['C', 133, [5, 40, 23]], p: [-1, false, true], c: ['T', 0, 15, true] },
            { t: ['P'], a: ['C', 133, [5, 40, 23]], p: [-1, false, true], c: ['T', 0, 15, true] }
        ]
    });
};


// 地图转场演出
QJ.MPMZ.tl.ex_mapThemeNameFadeIn = function() {

    const mapId = $gameMap.mapId();
    const mapInfo = $dataMapInfos[mapId];
    const mapName = mapInfo.name;

    if (mapName.includes($gameVariables.value(88))) {
        QJ.MPMZ.tl.ex_mapThemeNameDisplay();
        return;
    }

    // 每天最多播放一次特殊转场CG
    let transitionCG = false;
    if ($gameSelfVariables.value([mapId, 1, 'day']) < $gameSystem.day()) {
        transitionCG = true;
    }

    // 语言索引
    const lang = $gameVariables.value(1);

    const MAP_IMAGE_MAP = [
        { key: '冒険の遊歩道', img: 'bōkennoyūhodō' },
        { key: '遗迹迷宫',      img: 'sensouisekimeikyuu' },
        { key: '遗忘的墓穴',    img: 'boukyakunokatakonbe' },
        { key: '遺跡の森',      img: 'isekinomori' },
        { key: '迷いの森',      img: 'suteraretamori' },
        { key: '開発中エリア',   img: 'kaihatsuchūeria' },
        { key: '堕落の聖堂',    img: 'darakunoseidou' },
        { key: '不思議な隙間',  img: 'fushiginasukima' },
        { key: '大焦熱溶岩帯',  img: 'daiShonetsuYōganTai' },
        { key: '星之门',        img: 'HoshinoMon' }
    ];

    let imgName = null;
    for (const entry of MAP_IMAGE_MAP) {
        if (mapName.includes(entry.key)) {
            imgName = entry.img;
            break;
        }
    }

    // 尼伯龙根特殊处理
    if (mapName.includes('尼伯龙根')) {
        const sw = $gameSelfVariables.value([mapId, 14, 'switch']);
        imgName = sw > 0 ? 'suteraretamori' : 'Nibelungen';
    }

    if (!imgName) {
        return;
    }

    // 检查是否存在CG图像来决定演出风格
    const fileName = `${imgName}CGtext${lang}.rpgmvp`;
    const exists = QJ.MPMZ.tl.checkPictureExists(
        ['img', 'projectiles', 'map_name'],
        fileName
    );

    let finalImgPath;

    if (exists) {
		// 仿DNF风格地图名演出
        finalImgPath = `map_name/${imgName}CG`;

        const opacity = transitionCG
            ? '0|1~180|1~60/0'
            : 0;

        // 播放转场CG
        const CG = QJ.MPMZ.Shoot({
            groupName: ['mapThemeCG'],
            img: finalImgPath,
            position: [['S', 0], ['S', 0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: 0.5,
            opacity: opacity,
            onScreen: true,
            anchor: [0, 0],
            moveType: ['S', 0],
            existData: [
                { t: ['Time', 240], a: ['F', QJ.MPMZ.tl.ex_mapThemeNameDisplay] }
            ],
            moveF: [
                [60, 2, QJ.MPMZ.tl.ex_mapThemeNameCheckIfNeedSkipped]
            ],
            z: 'A'
        });

        // 播放地图名
        const index = CG.index;
        finalImgPath = `map_name/${imgName}CGtext${lang}`;
        QJ.MPMZ.Shoot({
            groupName: ['mapThemeName'],
            img: finalImgPath,
            position: [['S', 0], ['S', 0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: 0.5,
            opacity: '0|1~180|1~60/0',
            onScreen: true,
            anchor: [0, 0],
            moveType: ['S', 0],
            existData: [
                { t: ['BE', index] }
            ],
            z: 'A'
        });

    } else {
        // 仿塞尔达风格地图名演出
        finalImgPath = `map_name/${imgName}${lang}`;
        QJ.MPMZ.Shoot({
            groupName: ['mapThemeName'],
            img: finalImgPath,
            position: [['S', 0], ['S', 0]],
            initialRotation: ['S', 0],
            imgRotation: ['F'],
            scale: 0.5,
            opacity: '0|0~120/1~60|1~120/0',
            onScreen: true,
            anchor: [0, 0],
            moveType: ['S', 0],
            existData: [
                { t: ['Time', 300], a: ['F', QJ.MPMZ.tl.ex_mapThemeNameDisplay] }
            ],
            z: 'A'
        });
    }

    // 播放音效
    AudioManager.playSe({
        name: 'サウンドロゴ　クール系　ファーン',
        volume: 90,
        pitch: 100,
        pan: 0
    });
};

// 检测是否需要跳过转场CG演出
QJ.MPMZ.tl.ex_mapThemeNameCheckIfNeedSkipped = function() {

   if ( TouchInput.drill_isLeftPressed() || TouchInput.drill_isLeftTriggered() ) {
	   
	   if ($gameMap.getGroupBulletListQJ('mapThemeName').length > 0) {
		  let bid = $gameMap.getGroupBulletListQJ('mapThemeName')[0];
          let bullet = $gameMap._mapBulletsQJ[bid];
		  bullet.setDead({ t: ["Time", 0], d: [0, 30] });
	   }
	   
	   this.setDead({ t: ["Time", 0], d: [0, 30] , a:['F',QJ.MPMZ.tl.ex_mapThemeNameDisplay] });
   }
	
};

// 右上角显示地图名
QJ.MPMZ.tl.ex_mapThemeNameDisplay = function() {
  let mapId = $gameMap.mapId();
  if (!mapId || !($dataMapInfos[mapId])) return;
  const lang = $gameVariables.value(1);

  const MAP_NAME_DATA = [
  {
    mapId: 5,
    cn: "忘却的墓穴 下層",
    jp: "忘却のカタコンベ 下層",
    en: "Forgotten Catacombe:Lower Layer"
  },
  {
    mapId: 9,
    cn: "沈眠之所…",
    jp: "眠りの地…",
    en: "Land of Slumber…"
  },  
  {
    mapId: 10,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },
  {
    mapId: 13,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },
  {
    mapId: 16,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },
  {
    mapId: 18,
    cn: "冒險者小道 集結地",
    jp: "冒険の遊歩道 集結地",
    en: "Adventurer's Path: Gathering Point"
  },
  {
    mapId: 26,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },  
  {
    mapId: 27,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },
  {
    mapId: 28,
    cn: "忘却的墓穴 上層",
    jp: "忘却のカタコンベ 上層",
    en: "Forgotten Catacombe:Upper Layer"
  },
  {
    mapId: 37,
    cn: "浅層遺跡迷宮",
    jp: "浅層遺跡迷宮", 
    en: "Shallow Ruins Labyrinth"
  },
  {
    mapId: 40,
    cn: "开发中区域",
    jp: "開発中エリア",
    en: "Excavation Site"
  },  
  {
    mapId: 46,
    cn: "开发中区域",
    jp: "開発中エリア",
    en: "Excavation Site"
  },
  {
    mapId: 47,
    cn: "遺跡之森",
    jp: "遺跡の森",
    en: "Forest of Ruins"
  },
  {
    mapId: 48,
    cn: "冒險者小道:記念碑",
    jp: "冒険の遊歩道:記念碑",
    en: "Adventurer's Path:Monument"
  },
  {
    mapId: 49,
    cn: "冒險者小道:林間",
    jp: "冒険の遊歩道:林間",
    en: "Adventurer's Path:Grove"
  },
  {
    mapId: 50,
    cn: "？？？墓穴",
    jp: "？？？の墓穴",
    en: "??? Tomb"
  }, 
  {  
    mapId: 51,
    cn: "星之門",
    jp: "星の門",
    en: "Star Door"
  },   
  {
    mapId: 52,
    cn: "忘却的墓穴:藏身處",
    jp: "忘却のカタコンベ:隠れ家",
    en: "Forgotten Catacombe:Hideout"
  },
  {
    mapId: 53,
    cn: "堕落的聖堂",
    jp: "堕落の聖堂",
    en: "The Fallen Church"
  }, 
  {
    mapId: 55,
    cn: "大焦熱熔岩帯",
    jp: "大焦熱溶岩帯",
    en: "Scorching Lava Zone"
  },   
];
  const entry = MAP_NAME_DATA.find(e => e.mapId === mapId);
  if (!entry)  return 
  // 选择语言
  let text = "";
  switch (lang) {
    case 0: text = entry.cn; break;
    case 1: text = entry.jp; break;
    case 2: text = entry.en; break;
    default:
      text = entry.jp;
      break;
  }    
  
  QJ.MPMZ.tl._imoutoUtilSceneNameDisplay(text);
  
};

//=============================================================================
//增益状态
//=============================================================================


QJ.MPMZ.tl.ex_playerRegenerationBullet = function() {
	
QJ.MPMZ.Shoot({
groupName:['playerRegeneration'],
img:"回復γ[6,10,1]",
position:[['P'],['P']],
initialRotation:['S',0],
imgRotation:['F'],
blendMode:1,
scale:[0.75,0.75],
anchor:[0.55,0.6],
moveType:['B',-1],
collisionBox:['C',1],
existData:[ 
{t:['SW',105,false],d:[0,30]},
],
moveF:[[60,60,QJ.MPMZ.tl.ex_playerRegeneration]],
});	

}

QJ.MPMZ.tl.ex_playerRegeneration = function() {	

let heal = Math.round(100 * $gameParty.leader().hrg);
$gameParty.leader().gainHp(heal);

heal = heal.toString();
    QJ.MPMZ.Shoot({
     img:['T',heal,0,'#06ff00',12],
     position:[['P'],['P']],initialRotation:['S',0],
     imgRotation:['F'],opacity:'0|1~90/0',
     moveType:['S','0|1~90/0.1~999/0.1'],
     existData:[	
     {t:['Time',90]},
        ],       
    });
}


// 子弹抛物线轨迹运动参数方程运算
QJ.MPMZ.tl.BulletTrajectoryFormula = function(oriX, oriY, tarX, tarY, peakRate,extra = 10) {
  if (!peakRate) peakRate = 1.0;
  const dx = tarX - oriX;
  const dy = tarY - oriY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const time = Math.floor(extra + (distance / 15));
  const peak = distance * peakRate;  // 抛物线顶点可调

  const Xexp = `${dx}*(t/${time})`;
  const Yexp = `${dy}*(t/${time}) - ${peak}*(t/${time})*(1 - t/${time})`;

  const xExp = `- ( ${Yexp} )`;
  const yExp = `(${Xexp})`;

  return { time, xExp, yExp };
};

// 丢垃圾演出
QJ.MPMZ.tl.playerThrowsTrash = function(type, itemId) {
	
  if (!itemId) return;
  if (!this) return;

  let icon;
    switch(type) {
    case 0:
        icon = $dataItems[itemId].iconIndex;
        break;
    case 1:
        icon = $dataWeapons[itemId].iconIndex; 
        break;
    case 2:
        icon = $dataArmors[itemId].iconIndex; 
        break;
    default:
        return;
        break;
    }  
  let posX = $gamePlayer.screenShootXQJ();
  let posY = $gamePlayer.screenShootYQJ() - 24;
  let tarX = this.screenShootXQJ();
  let tarY = this.screenShootYQJ() - 40;  	  
  let peakRate = 1 + (1.5 * Math.random());
  let { time, xExp, yExp } = QJ.MPMZ.tl.BulletTrajectoryFormula(posX, posY, tarX, tarY, peakRate);
  let pitch = 100+Math.randomInt(50);
   QJ.MPMZ.Shoot({
        img:['I',icon], 
		position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
		scale:0.5,
        imgRotation:['S',0],
		moveType:["F", xExp, yExp],
        existData:[ 
		    {t: ['Time', time], d:[1,15,1.2]}  
		],
		deadJS:["AudioManager.playSe({ name: 'ドゥン。衝突・転ぶ・尻餅の音（シンプル）', volume: 50, pitch:"+pitch+", pan: 0 })"]
    });
};

//=============================================================================
//近战动作
//=============================================================================


//跳跃
QJ.MPMZ.tl.ex_jumpWithAngle = function(character, angle, distance) {
     let fudou;
     if (character === -1) {
      character = $gamePlayer;
       } else if (character > 0) {
      character = $gameMap.event(character);
	   fudou = $gameSelfVariables.value([$gameMap.mapId(), character._eventId, 'fudou']);

	   if (fudou > 20) return;
     }
   if (!character) return;	 
   var height = Math.round(60 + (distance * 8));
   var time = Math.round(30 + (distance * 2));
   character._drill_JSp['enabled'] = true;
   character._drill_JSp['height'] = height;
   character._drill_JSp['time'] = time;
   character._drill_JSp['speed'] = -1;	 
	 
  var radian = angle * Math.PI / 180; // 将角度转换为弧度
  var xPlus = distance * Math.sin(radian); // 计算 x 方向增量
  var yPlus = -distance * Math.cos(radian); // 计算 y 方向增量（取反）
  character.jump(xPlus, yPlus); // 执行跳跃
}

//崩山击范围检查
QJ.MPMZ.tl.ex_rocketJumpCheck = function() {
	QJ.MPMZ.Shoot({
        img:"Circle",
        position:[['P'],['P']],
        initialRotation:['S',0],
        scale:'0|0.01~900/3~9999|3',
        moveType:['S',0],
		opacity:0.6,
		blendMode:2,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[
            {t:['S','!TouchInput.drill_isLeftPressed()',true],d:[1,10,0.01]},  
        ],
        z:"E",collisionBox:['C',1],
	deadF:[[QJ.MPMZ.tl.ex_rocketJump]]
    });
}

//火箭跳
QJ.MPMZ.tl.ex_rocketJump = function() {	
    if(this.time < 20) return;
	var range = (this.scaleX * 400) / 48;
	var character = $gamePlayer;
    var r = 255;
    var g = 150;
    var b = 0;
    var color = [r, g, b, 255];
    character.residual().setPeriod(4);
    character.residual().setDuration(60);
    character.residual().setOpacity(128);
    character.residual().setColorTone(color);
    character.residual().setValid(true);
    Fuku_Plugins.EventTremble.stop(-1);
	character.drill_EASA_setEnabled( true );
    // 内部函数: 计算两个点之间的角度
    function calculateAngleByTwoPoint(x, y, ex, ey) {
        let ro;
        if (ex > x && ey < y) ro = (-Math.atan((x - ex) / (y - ey)));
        if (ex > x && ey > y) ro = (Math.PI - Math.atan((x - ex) / (y - ey)));
        if (ex < x && ey > y) ro = (Math.PI - Math.atan((x - ex) / (y - ey)));
        if (ex < x && ey < y) ro = (2 * Math.PI - Math.atan((x - ex) / (y - ey)));
        if (ex == x && ey > y) ro = Math.PI;
        if (ex == x && ey < y) ro = 0;
        if (ex > x && ey == y) ro = Math.PI / 2;
        if (ex < x && ey == y) ro = Math.PI * 3 / 2;
        if (ex == x && ey == y) ro = null; // 说明在同一点
        return ro;
    }
	let mouseX = TouchInput.x / $gameScreen.zoomScale();
	let mouseY = TouchInput.y / $gameScreen.zoomScale();
	let ax = $gamePlayer.centerRealX();
    let ay = $gamePlayer.centerRealY();
    let bx = (mouseX / 48) + $gameMap.displayX();
    let by = (mouseY / 48) + $gameMap.displayY();
    //计算距离
    let xDiff = $gameMap.deltaX(ax, bx);
    let yDiff = $gameMap.deltaY(ay, by);
    var distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
	distance = Math.min(distance, range);
	let deg = calculateAngleByTwoPoint(ax, ay, bx, by);
    deg = Math.round((deg * 180) / Math.PI);
	
	QJ.MPMZ.Shoot({
        img:"Updraft[5,4,2]",
        position:[['P'],['P']],
        initialRotation:['S',0],
        scale:[0.5,0.5],
        moveType:['S',0],
		opacity:1,
		blendMode:1,
        imgRotation:['F'],
        anchor:[0.5,0.8],
        existData:[
            {t:['Time',38]},
        ],
    });	
	QJ.MPMZ.tl.ex_jumpWithAngle(-1,deg,distance);

    var se = { name: "Jump1", volume: 70, pitch: 100, pan: 0 };
    AudioManager.playSe(se);
	   
    var Duration = $gamePlayer._drill_JSp['time'];
	QJ.MPMZ.Shoot({
        img:"null1",
        position:[['P'],['P']],
        initialRotation:['PD'],
        scale:[1,1],
        moveType:['S',0],
		opacity:0,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',Duration]},
        ],
        z:"E",collisionBox:['C',1],
	deadF:[[QJ.MPMZ.tl.ex_rocketJumpImpact,[distance]]]
    });
	
};

QJ.MPMZ.tl.ex_rocketJumpImpact = function(distance) {
	$gamePlayer.residual().setValid(false);
	
	//跳进了水里的情况
	var playerX = Math.floor($gamePlayer.centerRealX());
    var playerY = Math.floor($gamePlayer.centerRealY());
	var regionId = $gameMap.regionId( playerX, playerY );
    if ( regionId === 8 ) {

    var se = { name: "Water1", volume: 70, pitch: 100, pan: 0 };
    AudioManager.playSe(se);
     QJ.MPMZ.Shoot({
        img:"60FPS_ASWater_04_Geyser[5,6,1]",
        position:[['P'],['P']],
        initialRotation:['S',0],
		scale:[0.8,0.8],
        imgRotation:['F'],
		anchor:[0.5,0.65],
        collisionBox:['C',1],
		opacity:0.8,
        moveType:['S',0],
		blendMode:3,
        existData:[	
           {t:['Time',29]},
          ],
		moveF:[[15,999,QJ.MPMZ.tl.ex_playerSwimmingCheck]]
       });	
       return false;	   
	} else if ( regionId === 254 || regionId === 255 ) {
	//跳进了墙里的情况
       QJ.MPMZ.tl.ex_playerStuckCheck();
	   return false;
	}	
	
	var weaponDamage = chahuiUtil.getVarianceDamage(1);	 
	var power = Math.round(60 + (distance * 50));
	
    var se = { name: "Fire3", volume: 70, pitch: 110, pan: 0 };
    AudioManager.playSe(se);
	
	QJ.MPMZ.Shoot({
        img:"EVFX03_01_MightySmash[5,3,3]",
        position:[['P'],['P']],
        initialRotation:['S',0],
        scale:[1,1],
        moveType:['S',0],
		opacity:1,
        imgRotation:['F'],
        anchor:[0.5,0.6],
		blendMode:1,
        existData:[
            {t:['Time',44]},
            {t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,distance,power,0]],p:[-1,false,true],c:['S','this.time>15']},
        ],
        z:"E",
		collisionBox:['C',50],
	   moveF:[
	   [28,999,QJ.MPMZ.tl.ex_rocketJumpTrace]
	   ]
    });
}

QJ.MPMZ.tl.ex_rocketJumpTrace = function() {
	
   var posX = this.inheritX();	
   var posY = this.inheritY();	
   var Mscale = this.scaleX;
	QJ.MPMZ.Shoot({
        img:"EVFX03_01_MightySmash",
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:Mscale,
        moveType:['S',0],
		opacity:1,
		blendMode:1,
        imgRotation:['F'],
        anchor:[0.5,0.6],
        existData:[
            {t:['Time',60],d:[0,90]},
        ],
        z:"E",collisionBox:['C',1],
    });
}


QJ.MPMZ.tl.ex_dashIai = function() {
	
	if($gameParty.leader().equips()[0].baseItemId === 2) return;	  
	  var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
      var weaponScale = $gameParty.leader().pdr * 1.5;
	  var weaponDamage = chahuiUtil.getVarianceDamage(1);		
		
		QJ.MPMZ.Shoot({
        img:weaponImage,
        position:[['P'],['P']],
        initialRotation:['PD',235],
        scale:[weaponScale,weaponScale],//动态缩放
        moveType:['B',-1],
		opacity:0,
        imgRotation:['R',8,true],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',20]},
            {t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,20,0,0]],p:[-1,false,true]},
			{t:['B','enemyBullet'],p:[-1,false,true,QJ.MPMZ.tl.ex_weaponParry]}
        ],
        z:"E",collisionBox:['R',8,64],
        trailEffect:[{
            img:['L',0.5,72,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:0.75,
            disappearTime:20,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],
	deadJS:["$gameParty.leader().removeState(63);"]
    });
	
}

/*
QJ.MPMZ.tl.ex_senpuuGiriThrow = function() {
	
	if(!$gameParty.leader().equips()[0]) return;
    if (this.time <= 180) return;
    let posX = this.inheritX();
    let posY = this.inheritY();
    let angle = this.inheritRotation();

    var weaponImage = "weapon/weaponTrail" + $gameParty.leader().equips()[0].baseItemId;
    var weaponScale = this.scaleX;
	var weaponDamage = chahuiUtil.getVarianceDamage(1);
	
	$gameSwitches.setValue(182, true);
    QJ.MPMZ.Shoot({
		groupName:['playerBullet','playerSenpuuGiri','meleeAttack'],
        img:weaponImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['M'],
		imgRotation:['F',180],
        scale:[weaponScale,weaponScale],//动态缩放
        anchor:[0.5,0.5],
        existData:[
            {t:['R',[255]]},	
			 {t:['time',90]},
			{t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]],p:[-1,true,true]},		
            {t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_spiralThrust.call(this,target)'],p:[-1,true,true],c:['T',0,1,true]},			
        ],
		moveType:['S','0|12~90/0~999/0'],
        z:"E",collisionBox:['R',8,64],
        judgeAccuracyRotation:0,//判定精度，防止挥剑速度太快导致无法攻击到敌人
		judgeAccuracyMove:8,
        trailEffect:[{
            img:['L',0.5,1,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:0.75,
            disappearTime:30,
            imgStretchMode:0,
            hOrV:true
        }],
		//deadJS:["QJ.MPMZ.tl.ex_senpuuGiriHold.call(this);"]
    });
};
*/
QJ.MPMZ.tl.ex_spiralThrust = function(target) { 

  if (target instanceof Game_Event) {
	  let fudou = $gameSelfVariables.value([$gameMap.mapId(), target.eventId(), 'fudou']);
	  if (fudou > 40) return;
	let posX = (this.x / 48);
	let posY = (this.y / 48);
	target.locate(posX, posY);
  }
};




//=============================================================================
//物理远程
//=============================================================================




/*QJ.MPMZ.tl.ex_explosiveArrows = function() {

     var seNames = "Fire3";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 80, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	

    var weaponImage = "flame_01[7,4]";
	var Ratio = Math.min($gameVariables.value(129), 300);
	    Ratio = 1 + (Ratio / 100);
	var weaponDamage = Math.round(chahuiUtil.getVarianceDamage(1) * Ratio);		 

    QJ.MPMZ.Shoot({
        groupName:['playerBullet'],collisionBox:['R',9,48],
        img:weaponImage,
		scale:[Ratio,Ratio],//动态缩放
		anchor:[0.5,0.3],
		moveType:['S','0|12~0/6~999/6'],
        position:[['P'],['P']],initialRotation:['M'],
        imgRotation:['F'],imgRotation:['F'],
        existData:[  
		 {t:['R',[255]],c:['S','this.time > 30']},	
         {t:['G',['"enemy"','"object"']],a:['C',155,[weaponDamage,0,0,0]],an:2,p:[-1,true,true]}
		 ],	
		 //deadJS:["QJ.MPMZ.tl.ex_stickMagicExplode.call(this)"]
    });
}
*/

//=============================================================================
//魔法
//=============================================================================



//茶会支援：2号机
QJ.MPMZ.tl.ex_chahuiUnitII = function() {

let deadCode = '$gameSystem._drill_PAlM_enabled=true;$gameSwitches.setValue(14, false);$gamePlayer.drill_EASA_setEnabled( true );'

    QJ.MPMZ.Shoot({
		groupName:['chahuiUnit','chahuiUnitII'],
        img:'telescopicSight',
        position:[['M'],['M']],
        initialRotation:['S',0],
        moveType:['D',true],
        imgRotation:['F'],
		z:"A",
        existData:[	
		{t:['S','TouchInput.drill_isRightPressed()',true],d:[1,30,1.5]}
        ],
		moveF:[[30,30,QJ.MPMZ.tl.ex_chahuiUnitSniping]],
		timeline:[['B',0,480,[1.1,240]]],
		deadJS:[deadCode]
    });

}
//茶会支援：2号机攻击效果
QJ.MPMZ.tl.ex_chahuiUnitSniping = function() {

	if (TouchInput.drill_isLeftPressed() && !$gameSwitches.value(277)) {
	var cost = 400;
	if ($gameParty.gold() >= cost) {
	$gameParty.gainGold(-cost);
	} else {
     var se = { name: "012myuu_YumeSE_SystemBuzzer01", volume: 70, pitch: 100, pan: 0 };
     AudioManager.playSe(se);		
		var posX = $gamePlayer.screenShootXQJ();
		var posY = $gamePlayer.screenShootYQJ();
		var text = "\\c[2]\\dDCOG[11:2:2:2]\\fs[14]通話料不足！!";
         $gameTemp.drill_GFTT_createSimple( [posX,posY], text, 2, 9, 90 );	
	return;
	}
		
     var seNames = "ライフル銃の銃声（バーン）";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 55, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);			
		
        $gameSwitches.setValue(277, true);
        var args = ['off', '1', '100', '277'];
        $gameSystem.addTimeEvent(args);

    let imgName = 'brokenGlass' + Math.randomInt(3);
    QJ.MPMZ.Shoot({
		groupName:['chahuiUnitIIBullet'],
        img:imgName,
        position:[['M'],['M']],
        initialRotation:['S',Math.randomInt(360)],
        moveType:['S',0],
        imgRotation:['F'],
        existData:[	
		{t:['S','this.time>10',true],d:[0,60]},
		{t:['G',['"enemy"','"object"']],a:['C',149,[233,0,0]],p:[-1,true,true]},
		{t:['P'],a:['C',149,[20,0,0]],p:[-1,true,true]}
        ],
		collisionBox:['C',24],
		blendMode:2,
    });
		
        // this.addTimelineEffect([['R',60,-1,360]]);
         this.addTimelineEffect('B',[1.5,10]);
		
	}
}



QJ.MPMZ.tl.ex_static = function() {
        QJ.MPMZ.Laser({
			imgPoint:'',img:"MSE/lightning_1[9,1,2]",
			rotation:['G','enemy'],
			judgeWidth:10,
			blendMode:1,
			length:['D',['M'],['M'],['P'],['P']],
            existData:[{t:['Time',17]},{t:['G','"enemy"'],a:['C',152,7],p:[-1,false,true]},],position:[['P'],['P']],
        });
}




//校准法杖Z轴
QJ.MPMZ.tl.ex_checkStickAlignment = function() {

	if (this.rotationImg <= 90 || this.rotationImg >= 270) {
	this.changeAttribute("z","E");
	} else {
	this.changeAttribute("z","W");
	}
	
}

//法术准备中
QJ.MPMZ.tl.ex_stickMagicSpell = function() {
 
 
         QJ.MPMZ.Laser({
                imgPoint:'null1',
                img:"fireBall[60,2]",
                rotation:['M'],
                positionStatic:false,
                rotationStatic:false,
                z:"W",
                position:[['P'],['P']],
                judgeWidth:21,length:['S',42,0,[]],
                existData:[
                {t:['S','!TouchInput.drill_isLeftPressed()',true],a:['S','QJ.MPMZ.tl.ex_stickMagic.call(this)']}, 
				{t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_stickMagicFaultyExplode.call(this)']}
                ],
                positionSpread:64,
                moveJS:[10,3,'if(this.time < 600){this.data.length[1][1].d[0]+=0.84;this.data.scaleX.d[0]+=0.0198}'],
				deadJS:['QJ.MPMZ.tl.ex_stickMagic.call(this)']
            })



 /*QJ.MPMZ.Shoot({
        img:'fireBall[60,2]',
        scale:[1,1],
        position:[['P'],['P']],
        initialRotation:['M'],
        moveType:['D',-1,0,0,0,0,0,0,0,0],
        anchor:[0.5,1.8],
		imgRotation:['F'],
		blendMode:1,
        existData:[],
        z:"W",collisionBox:['C',5],
        existData:[
			{t:['S','!TouchInput.drill_isLeftPressed()',true]},   
			{t:['G',['"enemy"','"object"']],a:['S','QJ.MPMZ.tl.ex_stickMagicExplode.call(this)']}
        ],
        moveF:[[0,0,QJ.MPMZ.tl.ex_stickMagicSpellChange]],
		deadJS:["{QJ.MPMZ.tl.ex_stickMagic.call(this)}"]
    });*/
}

//法术准备中的蓄力演出
QJ.MPMZ.tl.ex_stickMagicSpellChange = function() {

    if (this.time >= 600) return;
	if (!this) return;
	var newAnchorX = this.anchorX;
	var newAnchorY = this.anchorY - 0.0015;
	var newScale = this.scaleX + 0.0066;
	this.changeAttribute('anchor',[newAnchorX,newAnchorY]);
	this.changeAttribute('scale',[newScale,newScale]);
}


//成功发射后的法术弹幕
QJ.MPMZ.tl.ex_stickMagic = function() {
    let posX = this.x - $gameMap.displayX() * 48;  //this.inheritX();
    let posY = this.y - $gameMap.displayY() * 48;  //this.inheritY();
    let angle = this.rotation; //this.inheritRotation();
    var magicImage = "fireBall[60,2]";
    var magicScale = 1;//this.data.scaleX.d[0];  //this.scaleX;

    var speed = 9;
	
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:magicImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['M'],
		imgRotation:['S',angle],
        scale:[magicScale,magicScale],//动态缩放
        moveType:['S',speed],
		blendMode:1,
        imgRotation:['F'],
        anchor:[0.5,0.5],
        existData:[	
		{t:['R',255],c:['S','this.anchorY <= 0.6']}
        ],
        z:"W",collisionBox:['C',10],
		moveF:[[0,0,QJ.MPMZ.tl.ex_bulletTrajectoryCorrection]],
		deadJS:["QJ.MPMZ.tl.ex_stickMagicExplode.call(this);QJ.MPMZ.tl.ex_conductiveEffectOnWater.call(this)"]
    });
}

// 毒蛇之拥(已废弃)
QJ.MPMZ.tl.ex_serpentEmbrace = function(numBullets) {
    if (numBullets <= 0) return; 

    var rotationSpeed = 3;            
    var angleIncrement = 360 / numBullets; 

    for (var i = 0; i < numBullets; i++) {

        var initialRotationValue = i * angleIncrement;
        var surroundName = 'serpentEmbrace' + i;

        QJ.MPMZ.Shoot({
            groupName: ['serpentEmbrace', 'surrounds', surroundName],
            img: 'armor/armor45',
            position: [['P'], ['P']],

            // 初始角度 = i * angleIncrement
            initialRotation: ['S',initialRotationValue],
            moveType: ['C', -1, [64, 21], rotationSpeed],
            existData: [
                { t: ['G', '"enemy"'], a: ['C', 292, [1, 0, 0, 0]], p: [-1, false, true] }
            ],
            trailEffect: [{
                img: ['L', 0.5, 1, 0, 0.999999999, 0.4, 0, 0, 0],
                existTime: 0,
                blendMode: 1,
                alpha: 0.75,
				scale:2,
                disappearTime: 20,
                imgStretchMode: 0,
                hOrV: true,
                aboveProjectile: true
            }],
            z: "E",
            moveJS: [
              [2, 2, "var angle = ((this.rotationMove % 360) + 360) % 360;if (angle >= 60 && angle <= 100) {this.changeAttribute('z','E');} else {this.changeAttribute('z','W')}"]
            ]

        });
    }
};


// 破颜拳(已废弃)
QJ.MPMZ.tl.ex_FacePunchGloves = function(numBullets) {
    if (numBullets <= 0) return; 

    var rotationSpeed = 3;             
    var angleIncrement = 360 / numBullets; 

    for (var i = 0; i < numBullets; i++) {

        var initialRotationValue = i * angleIncrement;
        var surroundName = 'FacePunchGloves' + i;

        QJ.MPMZ.Shoot({
            groupName: ['FacePunchGloves', 'surrounds', surroundName],
            img: 'armor/armor46',
            position: [['P'], ['P']],
            initialRotation: ['S', initialRotationValue],
            moveType: ['C', -1, [72, 32], rotationSpeed],
            scale: 0.7,
            collisionBox: ['C', 16],
            existData: [
                { t: ['G', '"enemy"'], a: ['C', 326, [11, 2, 0, 0]], p: [-1, false, true] }
            ],
            z: "E",
            moveJS: [
              [2, 2, "var angle = ((this.rotationMove % 360) + 360) % 360;if (angle >= 60 && angle <= 100) {this.changeAttribute('z','E');} else {this.changeAttribute('z','W')}"]
            ]
        });
    }
};



QJ.MPMZ.tl.ex_stickMagicFaultyExplode = function() {

    let posX = this.x - $gameMap.displayX() * 48;  //this.inheritX();
    let posY = this.y - $gameMap.displayY() * 48;  //this.inheritY();
    var magicImage = "Fire2[5,2,4]";
    var magicScale = this.data.scaleX.d[0] * 0.5;  //this.scaleX;
	var magicDamage = Math.round(chahuiUtil.getVarianceDamage(2) * magicScale * 2);
	
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:magicImage,
        position:[['S',posX],['S',posY]],
        initialRotation:['S',0],
        scale:[magicScale,magicScale],//动态缩放
        moveType:['S',0],
        imgRotation:['F'],
        anchor:[0.5,0.65],
		blendMode:1,
        existData:[	
		{t:['Time',28]},
		{t:['G',['"enemy"','"object"']],a:['C',152,[magicDamage,0,0,0]],p:[-1,true,true]}
        ],
        z:"W",collisionBox:['C',40],
    });
	
     var seNames = "Fire3";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 80, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	
}

QJ.MPMZ.tl.ex_bulletTrajectoryCorrection = function() {

    if (this.anchorY <= 0.4) return;
	var magicScale = this.scaleX;
	var speed = 0.08 - ((magicScale - 1) / 4) * 0.04;
	var newAnchorY = this.anchorY - speed;
	this.changeAttribute('anchor',[0.5,newAnchorY]);
	if (this.anchorY <= 0.5 && !this.oneTimeEffect){
	this.oneTimeEffect = true;
	var magicDamage = Math.round(chahuiUtil.getVarianceDamage(2) * magicScale);	
	var newExistData = {t:['G',['"enemy"','"object"']]};
	this.addExistData(newExistData);
    }	


}

//在鼠标指向处定向释放AOE法术
QJ.MPMZ.tl.ex_designatedAreaMagic = function() {
	
    var magicImage = "EE10+1_ThunderOne3[5,6,3]";
    var magicScale = 1;  //this.scaleX;

    var speed = 0;
	
    QJ.MPMZ.Shoot({
		groupName:['playerBullet'],
        img:magicImage,
        position:[['M'],['M']],
        initialRotation:['S',0],
		imgRotation:['F'],
        scale:[magicScale,magicScale],//动态缩放
        moveType:['S',speed],
		blendMode:1,
        anchor:[0.5,0.7],
        existData:[	
		{t:['Time',88]},
		{c:['S','this.time>21'],t:['R',8],a:['S','QJ.MPMZ.tl.ex_conductiveEffectOnWater.call(this)'],p:[-1,false,true]}
        ],
        z:"W",collisionBox:['C',20],
    });
}




//电系法术在水面的传导
QJ.MPMZ.tl.ex_conductiveEffectOnWater = function() {
    let posX = this.inheritX();
    let posY = this.inheritY();
	let index = this.index;
	let limit = Math.randomInt(4) + 4;
	let laserLength = ['S',480,0,[['B',['LightningReflection']],['R',[0,254,255]]]];
	//闪电音效
	 
	let seNames = "Thunder10";
    let randomPitch = Math.randomInt(60) + 70;
    let se = { name: seNames, volume: 60, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);		

    if ($gameParty.leader().isStateAffected(9)) laserLength = ['S',60,0,[['B',['LightningReflection']],['R',[254,255]]]];
	if ($gameParty.leader().isStateAffected(67)) laserLength = ['S',480,0,[['B',['LightningReflection']],['R',[0,254,255]]]];
	
    for (let i=0;i<limit;i++) {
        QJ.MPMZ.Laser({
			imgPoint:'',img:"MSE/lightning_1[9,1,2]",
			rotation:i*60+60*Math.random()-30,
			judgeWidth:10,
			judgeMode:['W',15],
			blendMode:1,
			length:laserLength,
            existData:[
			{ t: ['Time', 18] },
			{t:['G','"enemy"'],a:['F',QJ.MPMZ.tl.ex_toEnemyAttack,[2,{}]],p:[-1,false,true]},
			{t:['P'],a:['F',QJ.MPMZ.tl.ex_playerDamageCheck,[2,2,0,0]],p:[-1,false,true]},
			],
			position:[posX,posY]
        });
    }
};





//旧版闪步太刀
QJ.MPMZ.tl.APC_dashIai = function(target,damage) {
	
	  var weaponImage = "weapon/weaponTrail30";
	  var weaponDamage = damage;	
          weaponDamage += Math.randomInt(15);	  
	  
	var ttt = QJ.MPMZ.Shoot({
        img:weaponImage,
        position:[['E',target],['E',target]],
        initialRotation:['ED',target,235],
        moveType:['D',false],
		opacity:0,
		scale:3,
        imgRotation:['R',8,true],
        anchor:[0.5,0.5],
        existData:[
            {t:['Time',20]},
            {t:['P'],a:['F',QJ.MPMZ.tl.ex_playerDamageCheck,[weaponDamage,1,0,0]],p:[-1,false,true],c:['S','!QJ.MPMZ.tl.ex_playerBulletPhasing()']}
        ],
        z:"E",
		collisionBox:['R',8,64],
        trailEffect:[{
            img:['L',0.5,72,0,0.999999999,0.4,0,0,0],
            existTime:0,
			blendMode:1,
			alpha:0.75,
            disappearTime:20,
            imgStretchMode:0,
			ifProjctileWait:true,
            hOrV:true
        }],
	
    });
	
}


//=============================================================================
//异常状态
//=============================================================================

//恐惧
QJ.MPMZ.tl.ex_enemyInFear = function(target) {

	  if (target instanceof Game_Event) {
	  var eventID = target._eventId;
	  if($gameMap.event(eventID)._canBeAlerted){
	 $gameMap.event(eventID).requestBalloon(7);
	 $gameMap.event(eventID)._alertTimer = 0; 
	 $gameMap.event(eventID)._enemyState = 3;
	 $gameMap.event(eventID)._fleeSpeed = 28;
	 
     var seNames = "034myuu_YumeSE_MassageGag01";
     var randomPitch = Math.randomInt(50) + 81;
     var se = { name: seNames, volume: 40, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);		 
	    }
     }
}

//饱腹感
QJ.MPMZ.tl.ex_enemyFullness = function(target) {
	
	if (!target) return;
	target._fullness = target._fullness || 0;
	
     let srandomSeName = ["リンゴをかじる", "お菓子を食べる1", "お菓子を食べる2"];
         seNames = srandomSeName[Math.floor(Math.random() * srandomSeName.length)];	
     var randomPitch = Math.randomInt(80) + 41;
     var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	

    let eid = target._eventId;
	if ($gameParty.leader().equips()[0]) {
	  let value = $gameParty.leader().equips()[0].params[1];
	  target._fullness += value;
    }
    let stateName = 'enemyFullness' + eid;
    var list = $gameMap.getGroupBulletListQJ(stateName);
    if (list.length > 0) {
     return;
	}
	
let posX = "if($gameMap.event("+eid+")){$gameMap.event("+eid+").screenBoxXShowQJ();}else{$gameMap.displayX()}";
let posY = "if($gameMap.event("+eid+")){$gameMap.event("+eid+").screenBoxYShowQJ()-48;}else{$gameMap.displayX()}";
let deadCode = '!$gameMap.event('+ eid + ')';
 QJ.MPMZ.Shoot({
groupName:['enemyFullness','fullness',stateName],
img:"fullness_1",
position:[['S',posX],['S',posY]],
initialRotation:['S',0],
anchor:[0.5,0.5],
extra:eid,
imgRotation:['S',0],
moveType: ['D',true],
collisionBox:['C',1],
existData:[ 
 {t:['S',deadCode,true]},
],
moveF:[
[5,15,QJ.MPMZ.tl.ex_enemyFullnessUpdate]
],
timeline:[['B',0,120,[0.9,60]]],
});	

};

QJ.MPMZ.tl.ex_enemyFullnessUpdate = function() {
	
	var target = this.data.extra;
	if (!$gameMap.event(target)) return;
	var fullness = $gameMap.event(target)._fullness || 0;

	if (fullness > 1000) {
	QJ.MPMZ.tl.ex_enemyFullnessExplode.call(this,target);		
    this.setDead();
    } else if (fullness > 950) {
    this.changeAttribute("img","fullness_5");
	} else if (fullness > 700) {
    this.changeAttribute("img","fullness_4");
	} else if (fullness > 450) {
    this.changeAttribute("img","fullness_3");
	} else if (fullness > 200) {
    this.changeAttribute("img","fullness_2");
	} else if (fullness > 50) {
    this.changeAttribute("img","fullness_1");
	} else if (fullness <= 0) {
    this.setDead();
	} 
	$gameMap.event(target)._fullness -= 10;
}

QJ.MPMZ.tl.ex_enemyFullnessExplode = function(target) {
	if (!$gameMap.event(target)) return;
	let posY = this.inheritY() + 48;
	let realDamage = 99999999;

     var seNames = "ゲップ音02(ミドル)";
     var randomPitch = Math.randomInt(40) + 81;
     var se = { name: seNames, volume: 90, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);	
	
    QJ.MPMZ.Shoot({
		groupName: ['Bomb'],
        img:'MGC_W2_Explosion_V4_Lv1[5,10,2]',
        position:[['S',this.inheritX()],['S',posY]],
		scale:1,
        initialRotation:['S',0],
        imgRotation:['F'],
		opacity:1,
		hue:0,
        moveType:['S',0],
        blendMode:1,
        existData:[	
		{t:['Time',98]},
        ],       
    });	
	
    let enemyHP = $gameSelfVariables.value([$gameMap.mapId(), target, 'HP']);
    SimpleMapDamageQJ.put(2,target,realDamage,0,-72);
	//伤害结算
	$gameSelfVariables.setValue([$gameMap.mapId(), target, 'HP'], enemyHP - realDamage);
	 //死亡判断
	 enemyHP = $gameSelfVariables.value([$gameMap.mapId(), target, 'HP']);
	 if (enemyHP <= 0) {
		 $gameSelfSwitches.setValue([$gameMap.mapId(), target, 'D'], true);
		 return;
	 }

};


//出血
QJ.MPMZ.tl.ex_enemyBleeding = function(damage) {
	
         if (!this || !(this instanceof Game_Event)) return;			
		 if (this.drill_COET_hasTag("免疫异常") || this.drill_COET_hasTag("免疫出血")) return;	

this.drill_COET_addTag('出血标记');
let target = this._eventId;
let Dcode = "if($gameMap.event(" + target + ")){"+"$gameMap.event(" + target + ").drill_COET_removeTag('出血标记')}";

if (!damage) {
 var damage = chahuiUtil.checkWeaponQuality("出血");
}

let time = 320 + Math.randomInt(160);
var stateName = 'enemyBleeding' + target;

        let posX = "if($gameMap.event("+target+")){$gameMap.event("+target+").screenBoxXShowQJ();}else{$gameMap.displayX()}";
        let posY = "if($gameMap.event("+target+")){$gameMap.event("+target+").screenBoxYShowQJ();}else{$gameMap.displayX()}";	

 QJ.MPMZ.Shoot({
groupName:['enemyBleeding','bleeding',stateName],
img:"Bleeding[6,10,1]",
position:[['S',posX],['S',posY]],
initialRotation:['S',0],
imgRotation:['F'],
blendMode:1,
scale:0.4,
moveType:['D',true],
collisionBox:['C',1],
existData:[ 
{t:['Time',time],d:[0,30],a:['S',Dcode]},
 {t:['G',['"enemy"','"object"']],a:['C',203,[damage,0,0,0]],p:[-1,false,true],c:['T',0,60,true],d:[0,30]},
],
});	

QJ.MPMZ.tl.ex_effectFonts("xueyan",target);

}

//冰电反应
QJ.MPMZ.tl.ex_iceElectricReaction = function(target) {
    
	if (target) {
    var events = $gameMap.event(target.data.extra);
	  if (!events) {
		  return;
	  }
	events._IsDisabledCounter += 120;
	let times = Math.round(events._IsDisabledCounter / 6.28);
    Fuku_Plugins.EventTremble.start(target.data.extra, 1, 1, times);
	target.changeAttribute('scale',[1,1]);

    let posX = target.inheritX();
    let posY = target.inheritY();
	var limit = Math.randomInt(4) + 8;
	
	//闪电音效
	 var seNames = "Thunder10";
     var randomPitch = Math.randomInt(60) + 70;
     var se = { name: seNames, volume: 60, pitch: randomPitch, pan: 0 };
     AudioManager.playSe(se);		
	
    for (let i=0;i<limit;i++) {
        QJ.MPMZ.Laser({
			imgPoint:'',img:"MSE/lightning_1[9,1,2]",
			rotation:i*60+60*Math.random()-30,
			judgeWidth:10,	
			scaleX:0.2,
			blendMode:1,
			judgeMode:['W',30],
			length:['S',96,0,[['B',['LightningReflection']],['R',[254,255]]]],
            existData:[{t:['BE',target.index]},{t:['G','"enemy"'],a:['C',152,[7,0,0,0]],p:[-1,false,true]},],position:[posX,posY]
        });
    }	
	
	}
}
	


/*
//玩家炎上
QJ.MPMZ.tl.ex_playerBurn = function(damage) {

$gameParty.leader().addState(8);

if (!damage) {
 var damage = 1;
}

if(!$gameMap.getGroupBulletListQJ('playerBurn').length > 0){

QJ.MPMZ.Shoot({
groupName:['playerBurn','burn'],
img:"burn[6,10,1]",
position:[['P'],['P']],
initialRotation:['S',0],
imgRotation:['F'],
blendMode:1,
scale:[0.4,0.4],
anchor:[0.5,0.5],
moveType:['B',-1],
collisionBox:['C',72],
existData:[ 
{t:['S','!$gameParty.leader().isStateAffected(8)',true],d:[0,30],c:['S','this.time>20']},
{t:['P'],a:['C',202,[damage,0,0,0]],p:[-1,false,true],c:['T',0,30,true],d:[0,30]},
 {t:['G',['"enemy"','"object"']],a:['C',202,[damage,0,0,0]],p:[-1,false,true],c:['T',0,30,true],d:[0,30]},
 {t:['B',['freeze']],a:['S','$gameParty.leader().removeState(8)'],d:[0,30],an:181},
 {t:['R',8],a:['S','$gameParty.leader().removeState(8)'],d:[0,30],an:181},
],

});	

   }
}
*/

//=============================================================================
//第三方模板
//=============================================================================





//效果字
QJ.MPMZ.tl.ex_effectFonts = function(type, target) {
    let language = navigator.language || navigator.userLanguage
	let path;
	if (language === "ja") {
      path = "RPG_effectFonts/" + type;			
	} else {
      path = "RPG_effectFonts\\" + type;		
	}
     if (target === -1) {
      target = $gamePlayer;
       } else if (target > 0) {
      target = $gameMap.event(target);
     } 
	if (!target) return;
	
    QJ.MPMZ.Shoot({
        img:path,
        position:[['S',target.screenShootXQJ()],['S',target.screenShootYQJ()]],
		scale:[0.5,0.5],
        initialRotation:['S',0],
        imgRotation:['F'],
		opacity:'0|1~90/0',
        moveType:['S','0|1~90/0.1~999/0.1'],
        blendMode:0,
        existData:[	
		{t:['Time',90]},
        ],       
    });
}

//坠落杀
QJ.MPMZ.tl.ex_fallingDeath = function(XX,YY) {
    let posX = this.inheritX();
    let posY = this.inheritY();
	let action = ['C',134,[4,0,0]];
	let collisionBox = ['R',XX,YY];
	
	QJ.MPMZ.rangeAtk([['S',posX],['S',posY]],['G',['"enemy"','"object"']],action,collisionBox);
	QJ.MPMZ.rangeAtk([['S',posX],['S',posY]],['P'],action,collisionBox);
	
}

QJ.MPMZ.tl.ex_stealPlayerChips = function() {
	
    var actor = $gameParty.leader();  
	var armorId = 50;
    var equips = actor.equips();  
	var found = false;
	
    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item && item.etypeId === 2 && item.baseItemId === armorId) {       
		found = true;
        //偷掉薯条的演出
	    var name_str = $dataItems[170].name;
		var color_code = $gameTemp.drill_ITC_getColorCode_Item( 170 );
		if( color_code != "" ){ name_str = "\\cc[" + color_code + "]" + name_str + "\\c[0]"; }
		var context = "\\fs[32]\\i[" + $dataItems[170].iconIndex + "]\\fr";
		    context += name_str;
			$gameSystem._drill_GFTH_styleId = 4;
			$gameTemp.drill_GFTH_pushNewText( context );
		    //减少薯条耐久度
            $dataArmors[item.id].durability -= 1;
			$gameVariables.setValue(290, $gameVariables.value(290) + 1);
            if ($dataArmors[item.id].durability <= 0) {
	         actor.changeEquipById(i+1, null);
             $gameParty.loseItem($dataArmors[item.id], 1);		
			 $gameTemp.reserveCommonEvent(100);
			}
            break;
        }
    }	
     //玩家不再拥有薯条后海鸥退场
     if (!found) {
       this.changeAttribute("moveType",['S',5]);
	   var fadeOut = this.time + 120;
	   var deadJS = 'this.time>' + fadeOut;
	   this.addExistData({t:['S',deadJS,true],d:[0,30]});
	   var se = { name: 'Seagull Cry', volume: 80, pitch: 100, pan: 0 };
       AudioManager.playSe(se);
    }
    
	
};

QJ.MPMZ.tl.ex_additionalDamageBonus = function() {
var stateName = 'enemyBurn' + this.targetId;
if($gameMap.getGroupBulletListQJ(stateName).length > 0){
this.sendValue[0] *= 1.2;
this.sendValue[0] = Math.round(this.sendValue[0]);
  }
}


//备用方法

/*

修改子弹的持续时间：
for (var i = 0; i < xxx.data.existData.length; i++) {
    var element = xxx.data.existData[i];
    if (element.t && Array.isArray(element.t) && element.t[0] === "Time") {
        element.t[1] += 999;  
        break;  
    }
}



*/

//有害地形
QJ.MPMZ.tl.ex_hazardousTerrainDamage = function(baseDamage,terrainType,args) {
     let damageType;
	 let effectId;
     let realDamage = baseDamage || 1;
     let randomPitch = Math.randomInt(30) + 91;
     AudioManager.playSe({ name: "Damage5", volume: 70, pitch: randomPitch, pan: 0 });
          switch (terrainType) {
    case "poison": // 毒沼泽
        damageType = 3;       
        effectId = 5;     
        break;
    case "lava": // 熔浆
        damageType = 2;       
        effectId = 8;      
        break;
    case "ice": // 冰地板
        damageType = 3;       
        effectId = 9;    
        break;
      }	
	 
     if (args.target && args.target instanceof Game_Event) {
		 args.target.requestAnimation(141);	
		 let eventId = args.target._eventId;	
		 let currentHp = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);	
		 SimpleMapDamageQJ.put(damageType,eventId,realDamage,0,-72);
	     //伤害结算
	     $gameSelfVariables.setValue([$gameMap.mapId(), eventId, 'HP'], currentHp - realDamage);
		 currentHp = $gameSelfVariables.value([$gameMap.mapId(), eventId, 'HP']);	
		 if (currentHp <= 0){
			 $gameSelfSwitches.setValue([$gameMap.mapId(), eventId, 'D'], true);
		 }
		 let chance = 0.1 * QJ.MPMZ.tl.ex_getEnemyStateEffectiveness(eventId,effectId);
		 if (chance > Math.random()){

          switch (terrainType) {
    case "poison": // 毒沼泽
        QJ.MPMZ.tl.ex_enemyPoison.call(args.target,10,360);    
        break;
    case "lava": // 熔浆
        QJ.MPMZ.tl.ex_enemyBurn(eventId,6);       
        break;
    case "ice": // 冰地板
        QJ.MPMZ.tl.ex_enemyFreeze(eventId,120);    
        break;
      }				 
			 
		 }
		 return true;
	 }
	
    if (args.target && args.target instanceof Game_Player) {
		$gamePlayer.requestAnimation(141);	
		SimpleMapDamageQJ.put(damageType,-1,realDamage,0,-72);	 
	    $gameParty.leader().gainHp(-realDamage);
	   //重伤判定
 	   if( $gameParty.leader().hpRate() <= 0.2 ) {
		 $gameScreen.startShake(1, 8, 30);	
		 QJ.MPMZ.tl.ex_playerDamageFlash();
 	       }		
		let chance = 0.1 * $gameParty.leader().stateRate(effectId);
		if (chance > Math.random()){
          switch (terrainType) {
    case "poison": // 毒沼泽
        QJ.MPMZ.tl.ex_playerPoison(4,3);   
        break;
    case "lava": // 熔浆
        QJ.MPMZ.tl.ex_enemyBurn(eventId,6);       
        break;
    case "ice": // 冰地板
        QJ.MPMZ.tl.ex_enemyFreeze(eventId,120);    
        break;
      }				
		}			
	}

};


QJ.MPMZ.tl.ex_spaceTimeRiftActivate = function() {

    let posX = 400;
    let posY = 300;
    QJ.MPMZ.Shoot({
        img:'30FPS_AC2Q011_Delete[5,10,4]',
        position:[['S',posX],['S',posY]],
		scale:[0.5,0.5],
        initialRotation:['S',0],
        imgRotation:['F'],
		opacity:1,
        moveType:['S',0],
        blendMode:0,
        existData:[	
		{t:['Time',199]},
        ],       
		moveF:[
		[190,999,QJ.MPMZ.tl.ex_spaceTimeRift]
		]
    });
	
};

QJ.MPMZ.tl.ex_spaceTimeRift = function() {
	
    let posX = this.inheritX();
    let posY = this.inheritY();
    QJ.MPMZ.Shoot({
        img:'30FPS_AC2Q011_Delete',
        position:[['S',posX],['S',posY]],
		scale:[0.5,0.5],
        initialRotation:['S',0],
        imgRotation:['F'],
		opacity:1,
        moveType:['S',0],
        blendMode:0,
        existData:[	
		//{t:['Time',199]},
        ],       
		deadF:[[]]
    });
}




/*
    var _DataManager_loadDataFile = DataManager.loadDataFile;
    DataManager.loadDataFile = function(name, src) {

		var lang = 2;
        var langFolder = "";
        if (lang === 0) {
            langFolder = "cn/";
        } else if (lang === 1) {
            langFolder = "jp/";
        } else if (lang === 2) {
            langFolder = "en/";
        }
        _DataManager_loadDataFile.call(this, name, langFolder + src);
    };
*/

QJ.MPMZ.tl.ex_ropeCollisionBox = function() {
	
    QJ.MPMZ.Shoot({
        img: "null1",
		groupName: ['rope'],
        position: [['Map', 2], ['Map', 6]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.65, 0.5],
        collisionBox: ['R', 192, 6],
        existData: [
        ],
		moveF:[
		  [15,10,QJ.MPMZ.tl.ex_checkPlayerIsOnRope,[]]
		]
    });
	
    QJ.MPMZ.Shoot({
        img: "null1",
		groupName: ['rope'],
        position: [['Map', 29], ['Map', 8]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.5, 0.5],
        collisionBox: ['R', 144, 6],
        existData: [
        ],
    });

    QJ.MPMZ.Shoot({
        img: "null1",
		groupName: ['rope'],
        position: [['Map', 32], ['Map', 9]],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        moveType: ['S', 0],
        anchor: [0.5, 0.5],
        collisionBox: ['R', 144, 6],
        existData: [
        ],
    });
	
};

QJ.MPMZ.tl.ex_checkPlayerIsOnRope = function() {
	
	    if (!this) return;
		
		if ( $gameMap.regionId( Math.floor($gamePlayer.centerRealX()), Math.floor($gamePlayer.centerRealY()) ) !== 250 || $gamePlayer.isJumping() )  return;
	
		let xx = $gamePlayer.screenShootXQJ();
		let yy = $gamePlayer.screenShootYQJ() + 18;
	
	if ( QJ.MPMZ.rangeAtk([['S', xx],['S', yy]],['B','rope'],[],['R',20,4],{anchorX:0.5,anchorY:0.86}).length == 0 ) {
		
		if ($gameStrings.value(20).trim() == "") {
		$gameMap.steupCEQJ(135,1,{skipFall:true});
		
	   }	   
	}
};

Game_Map.prototype.isAnyEventStartingQJ = function() {
    return this.events().some(function(event) {
        //return event.isStarting() || (event._interpreter&&event._interpreter.isRunning()) || event._commonEventQJ.length > 0;
		return event.isStarting() || event._commonEventQJ.length > 0;
    });
};

Game_Map.prototype.isEventRunningQJ = function() {
    return this._commonEventQJ.length > 0 || this._interpreter.isRunning() || this.isAnyEventStartingQJ();
};


Game_Interpreter.prototype.command352 = function() {
	
    // 1. 先清空子弹数据
    QJ.MPMZ.ClearAll();

    // 2. 确认清空成功
    const lengthOk = $gameMap._mapBulletsQJLength === 0;
    const objOk    = Object.keys($gameMap._mapBulletsQJ  || {}).length === 0;
    const nameOk   = Object.keys($gameMap._mapBulletsNameQJ|| {}).length === 0;

    if (lengthOk && objOk && nameOk) {
      if (!$gameParty.inBattle()) {
        SceneManager.push(Scene_Save);
      }
	}
    return true;
};