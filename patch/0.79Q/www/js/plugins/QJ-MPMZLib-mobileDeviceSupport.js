//=============================================================================
 /*:
 * @plugindesc 移动设备适配用脚本
 * @author shiroin
 */
//=============================================================================
var QJ = QJ || {};
QJ.VB = QJ.VB || {};

// 根据条件切换虚拟按键
QJ.MPMZ.tl._setDirButtonMode = function() { 
   
   if (QJ && QJ.VB && QJ.VB.readyVirtualButton) {
     const dirBtn = QJ.VB.findDirButton();
     if (dirBtn) {
       const targetMode = $gameMessage.isChoice() ? 0 : 2;
       if (dirBtn._dirMode !== targetMode) {
         ConfigManager.VBData.dirMode = targetMode;
         // 强制自身重建一次
         dirBtn.changeDirMode(targetMode);
       }
     }
   }
};


// 根据条件切换虚拟按键
QJ.VB.showFastForwardButton = function() { 
   var messageWindow = SceneManager._scene && SceneManager._scene._messageWindow && SceneManager._scene._messageWindow.isOpen() && !$gameMessage.isChoice();
   return messageWindow;
};


/*
// 移动端专用-快进键
QJ.MPMZ.tl._imoutoUtilFastForwardButton = function() {
	
	window._forceMsgSkip = false;
    var fastForward = QJ.MPMZ.Shoot({
        img:"imoutoUtil/icon_fastForward",
		groupName:['mobileDevice','fastForwardButton'],
        position:[['S',110],['S',990]],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',55],
        moveType:['D',false],
		opacity:0,
		z:"A",
        existData:[	
        ],
		moveJS:[
		   [12,12,"let value = 0;if($gameMessage.hasText()&&!$gameMessage.isChoice()){value = 1;}this.changeAttribute('opacity',value)"],
		   [12,12,"if(TouchInput.isPressed()&&!this._activated){QJ.MPMZ.rangeAtk([['M'],['M']],['B','fastForwardButton'],['S','bulletTarget._activated=true'],['C',2])}"]
		],		
		moveF:[
		   [12,12,QJ.MPMZ.tl._imoutoUtilFastForwardButtonEffect]
		],
    });		
};

// 移动端专用-返回键
QJ.MPMZ.tl._imoutoUtilReturnButton = function() {
	
    var returnIcon = QJ.MPMZ.Shoot({
        img:"imoutoUtil/icon_return",
		groupName:['mobileDevice','returnButton'],
        position:[['S',110],['S',990]],
        initialRotation:['S',0],
        imgRotation:['F'],
        collisionBox:['C',55],
        moveType:['D',false],
		opacity:0,
		z:"A",
        existData:[	
        ],
		moveJS:[
		   [40,12,"let value = 0;if($gameMessage.isChoice()||$gameMessage.isItemChoice()){value = 1;}this.changeAttribute('opacity',value)"]		   
		],		
		moveF:[
		   [12,12,QJ.MPMZ.tl._imoutoUtilReturnButtonEffect]
		],
    });		
};

QJ.MPMZ.tl._imoutoUtilReturnButtonEffect = function() {

    if (this._returned) {
		this._returned = false;
		Input._currentState['cancel'] = false;
	}
	
	if (this.opacity > 0.9) {
      if(TouchInput.isPressed()) {
		  let triggered = QJ.MPMZ.rangeAtk([['M'],['M']],['B','returnButton'],['S',"Input._currentState['cancel'] = true"],['C',2]).length;
		  if (triggered > 0) {
            //SoundManager.playCancel();
            this._returned = true;			
		  }
	   }		
	}
};

QJ.MPMZ.tl._imoutoUtilFastForwardButtonEffect = function() {
  if (this.opacity > 0.9) {
    if (TouchInput.isPressed()) {
      if (!this._activated) {
        QJ.MPMZ.rangeAtk(
          [['M'], ['M']],
          ['B', 'fastForwardButton'],
          ['S', 'bulletTarget._activated=true;TouchInput._screenPressed=false'],
          ['C', 2]
        );
      } else {
        QJ.MPMZ.rangeAtk(
          [['M'], ['M']],
          ['B', 'fastForwardButton'],
          ['S', 'bulletTarget._activated=false;TouchInput._screenPressed=false'],
          ['C', 2]
        );
      }

      if (!this._activated) {
        window._forceMsgSkip = false;
        this._activated = false;
        if (this._iconChange) {
          this._iconChange = false;
          this.changeAttribute("img", "imoutoUtil/icon_fastForward");
          SoundManager.playCancel();
        }
        return;
      }

      if (this._activated) {
        if (!this._iconChange) {
          this._iconChange = true;
          this.changeAttribute("img", "imoutoUtil/icon_fastForward_active");
          SoundManager.playOk();
          window._forceMsgSkip = true;
        }
      }
    }
  } else {
    window._forceMsgSkip = false;
    this._activated = false;
    if (this._iconChange) {
      this._iconChange = false;
      this.changeAttribute("img", "imoutoUtil/icon_fastForward");
    }
  }
};
*/

/*
为游戏标题增加版本标记
*/
(function() {

  if (!Utils.isMobileDevice()) return;
	
  const FONT_FACE   = "MPLUS2ExtraBold";
  const FONT_SIZE   = 28;
  const PADDING_X   = 20;                // 距左侧
  const PADDING_Y   = 20;                // 距底部
  const COLOR       = "#d3d2d2";
  const OUTLINE_COL = "rgba(0,0,0,0.9)";
  const OUTLINE_W   = 3;

  const SHOW_FALLBACK  = true;          // 没匹配到是否仍显示默认文本
  const FALLBACK_TEXT  = "Wrong Version";             // 没匹配到时显示的文字（SHOW_FALLBACK=true时生效）

  function extractVersionFromTitle(title) {
    if (!title) return null;

    // 优先匹配 "ver..."
    let m = title.match(/(ver\s*\d[\w.\-]*)/i);
    if (m && m[1]) {
      // 规范化空格：去掉 ver 与数字之间的空格 → "ver0.75"
      return m[1].replace(/\s+/g, "").replace(/^VER/i, "✦Ver");
    }

    return null;
  }

  function drawVersionOnTitle(scene) {
    const bmp = scene._gameTitleSprite && scene._gameTitleSprite.bitmap;
    if (!bmp) return;

    const title = ($dataSystem && $dataSystem.gameTitle) || "";
    let text = extractVersionFromTitle(title);
    if (!text) {
      if (!SHOW_FALLBACK || !FALLBACK_TEXT) return;
      text = FALLBACK_TEXT;
    }

    const x = PADDING_X;
    const lineH = FONT_SIZE + 8;
    const y = Graphics.height - (PADDING_Y + lineH);

    // 备份
    const pf  = bmp.fontFace;
    const pz  = bmp.fontSize;
    const pc  = bmp.textColor;
    const poc = bmp.outlineColor;
    const pow = bmp.outlineWidth;

    // 设置字体与颜色
    bmp.fontFace     = FONT_FACE;
    bmp.fontSize     = FONT_SIZE;
    bmp.textColor    = COLOR;

    // 关闭描边
    bmp.outlineWidth = 0;
    bmp.outlineColor = "rgba(0,0,0,0)";

    // 关闭阴影（直接操作 Canvas2D 上下文）
    if (bmp._context) {
      const ctx = bmp._context;
      ctx.shadowColor   = "rgba(0,0,0,0)";
      ctx.shadowBlur    = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    bmp.drawText(text, x, y, Graphics.width - x * 2, lineH, "left");
    bmp._setDirty && bmp._setDirty();

    // 还原
    bmp.fontFace     = pf;
    bmp.fontSize     = pz;
    bmp.textColor    = pc;
    bmp.outlineColor = poc;
    bmp.outlineWidth = pow;
  }

  const _Title_createForeground = Scene_Title.prototype.createForeground;
  Scene_Title.prototype.createForeground = function() {
    _Title_createForeground.call(this);
    drawVersionOnTitle(this);
  };
})();