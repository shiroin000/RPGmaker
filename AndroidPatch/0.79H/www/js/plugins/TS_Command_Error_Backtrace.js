/*:
 * @pluginname Command Error Backtrace
 * @plugindesc Adds an RPG Maker-native stack trace to error messages. (Version 1.0.1)
 *
 * @author Tamschi (tamschi.itch.io)
 *
 * @help
 *
 * ==========
 * Load Order
 * ==========
 *
 * This plugin functions most accurately when placed very late in the load order.
 *
 * ==============
 * Command Syntax
 * ==============
 *
 * This plugin does not add any Plugin Commands.
 *
 * ==============
 * JavaScript API
 * ==============
 *
 * You can set the property TSCommandErrorBacktrace_listName on either the
 * executing Game_Interpreter instance or on the Command list data array
 * itself to provide a custom Command list name for the stack trace.
 * If both are present, the latter takes precedence.
 *
 * When generating, the list name, you can use this snippet to decide whether to
 * include development information in the name:
 *
 * const showNames = ($gameTemp.isPlaytest() ||
 *     PluginManager.parameters('TS_Command_Error_Backtrace')
 *         .showNamesInDeployedGame === "true");
 *
 * ======================
 * Resolved Command Lists
 * ======================
 *
 * Common Event n (<name>)
 * Map n (<name>), Event m (<name>), Page o
 * Troop n (<name>), Page m
 *
 * ===================
 * Compatibility Notes
 * ===================
 *
 * The custom error screen option modifies private RPG Maker functions. As such,
 * the feature may be brittle regarding engine upgrades.
 *
 * Please use caution when upgrading (and please be sure to report any issues, so
 * that I can fix them!).
 *
 * =============
 * License Grant
 * =============
 *
 * This plugin can be downloaded free of charge at
 * https://tamschi.itch.io/command-error-backtrace .
 *
 * Once you have downloaded it from there, you may redistribute and sublicense
 * this plugin file as part of a game. You may not redistribute nor sublicense it
 * separately or as part of an asset- or resource-collection.
 *
 * You may modify this plugin when including it with your game, as long as the
 * attribution above and this license grant stay intact. If you do so, you must
 * add comments to indicate which changes you made from the original.
 *
 * =========
 * Changelog
 * =========
 *
 * -----
 * 1.0.1
 * -----
 *
 * 2022-05-06
 *
 * Fixes:
 * - Added support for Battle Test mode.
 *   (This previously failed due to $dataMap being null.)
 *
 * Revisions:
 * - Log the ignored error as warning when one occurs resolving a Command list.
 *
 * @param customErrorScreen
 * @text Custom Error Screen
 * @type boolean
 * @default true
 * @desc Adjusts the 'Error' screen for easier reading of stack traces, and adds a way to copy the error message.
 * @on ON
 * @off OFF
 *
 * @param showNamesInDeployedGame
 * @text Show names in deployed game?
 * @type boolean
 * @default false
 * @desc Shows (Map, (Common) Event, Troop) names also outside of testing.
 * @on Show names.
 * @off Hide names in deployed game.
*/

(function(){
    'use strict';

    const parameters = { ...PluginManager.parameters('TS_Command_Error_Backtrace') };
    parameters.showNamesInDeployedGame = parameters.showNamesInDeployedGame === "true";
    parameters.customErrorScreen = parameters.customErrorScreen === "true";

    //────────────────────────────────────────────
    // 扩展 Game_Interpreter 的错误附加堆栈信息
    //────────────────────────────────────────────

//────────────────────────────────────────────
// 在错误打印区域追加“Version: x.x.x”
//────────────────────────────────────────────
function TSCEB_appendVersion(printer){
    if (!printer || !$dataSystem) return;
	let ver = "0.79";
    // 已插入过就别重复
    if (printer.querySelector('.tsceb-version')) return;

    const p = document.createElement('p');
	let isMobile = "";
	if (Utils.isMobileDevice()) isMobile = "(Android)";
    let match = $dataSystem.gameTitle.match(/ver([\d\.A-Za-z]+)/i);
    if (match) {
        ver = match[1];
    }
	
    p.className = 'tsceb-version';
    p.style.color = '#ffffff';      
    p.style.fontSize = '32px';
    p.style.margin = '8px 0';
    p.textContent = `Current Version: ${ver} ${isMobile}`;
    // 放到第一行错误信息后面、栈追踪前面
    printer.insertBefore(p, printer.children[1] || null);
}

function getCurrentScriptForEval(interpreter, index) {
    const list = interpreter._list;
    let i = index;
    if (!list[i] || (list[i].code !== 355 && list[i].code !== 655)) return null;
    // 找到脚本段开头
    while (i > 0 && list[i].code === 655) i--;
    if (list[i].code !== 355) return null;
    // 组合整段script
    let script = list[i].parameters[0] + "\n";
    let j = i + 1;
    while (list[j] && list[j].code === 655) {
        script += list[j].parameters[0] + "\n";
        j++;
    }
    return script;
}

const oldUpdateChild = Game_Interpreter.prototype.updateChild;
Game_Interpreter.prototype.updateChild = function () {
    const index = this._index - 1;
    try {
        return oldUpdateChild.call(this, ...arguments);
    } catch (error) {
        const listId = findListId(this);
        const command = this._list[index];
        let frame = `\n  at ${listId}, line ${index + 1}`;
        
        if (command && (command.code === 355 || command.code === 655)) {
            const script = getCurrentScriptForEval(this, index);
            if (script) {
                frame += `\n Eval Script:\n${script}`;
            }
        }
        
        if (error instanceof Error) {
            error.message += frame;
        } else {
            error = new Error(`${error}${frame}`);
        }
        throw error;
    }
};

const oldExecuteCommand = Game_Interpreter.prototype.executeCommand;
Game_Interpreter.prototype.executeCommand = function () {
    const index = this._index;
    try {
        return oldExecuteCommand.call(this, ...arguments);
    } catch (error) {
        const listId = findListId(this);
        const command = this._list[index];
        let frame = `\n  at ${listId}, line ${index + 1}`;
        
        if (command && (command.code === 355 || command.code === 655)) {
            const script = getCurrentScriptForEval(this, index);
            if (script) {
                frame += `\n Eval Script:\n${script}`;
            }
        }
        
        if (error instanceof Error) {
            error.message += frame;
        } else {
            error = new Error(`${error}${frame}`);
        }
        throw error;
    }
};

    /**
     * 根据解释器当前使用的命令列表返回一个简单的来源编号，
     * 不包含地图或公共事件的名称等信息，避免剧透。
     */
    function findListId(interpreter) {
        try {
            // 尝试通过公共事件匹配
            for (const ce of $dataCommonEvents.filter(ce => ce)) {
                if (ce.list === interpreter._list) {
                    return "Common Event " + ce.id;
                }
            }
            // 如果 $dataMap 存在，则检查地图事件
            if ($dataMap) {
                for (const event of $dataMap.events.filter(ev => ev)) {
                    for (let i = 0; i < event.pages.length; i++) {
                        if (event.pages[i].list === interpreter._list) {
                            return "Map " + $gameMap.mapId() + ", Event " + event.id + ", Page " + (i + 1);
                        }
                    }
                }
            }
            return "unknown Command list";
        } catch (error) {
            console.warn("Error while resolving command list source id:", error);
            return "(failed finding source id)";
        }
    }

    //────────────────────────────────────────────
    // 扩展 SceneManager.catchException 错误显示及提示功能
    //────────────────────────────────────────────

    const _SceneManager_catchException = SceneManager.catchException;
    SceneManager.catchException = function(e) {
        _SceneManager_catchException.call(this, e);
        let errorPrinter = document.getElementById("ErrorPrinter");		
		// ② 先插入版本号
        TSCEB_appendVersion(errorPrinter);
		
        if (errorPrinter && e.stack) {
            let p = document.createElement("p");
            p.style.color = "white";
            // 只显示简单的堆栈来源信息
            p.innerHTML = "<b>Stack Trace:</b><br>" + (""+e.stack).replace(/\n/g, "<br>");
            errorPrinter.appendChild(p);
        }
        // 延时 600ms 提示玩家报告 BUG（多语言支持）
        setTimeout(function(){
			// 检测到新版本就提醒去更新
			let RemindToUpdate = $gameStrings.value(1).trim() !== "" || $gameVariables.value(2) !== 0;
			if (RemindToUpdate) {
				
            	let textArray = window.systemFeatureText && window.systemFeatureText.RemindToUpdate;
            	if (!textArray) textArray = [ "An error has occurred and the game is frozen.",
                                              "A newer patch is available—",
                                              "Please use auto-update to fix the issue!" ];
            	let text = Array.isArray(textArray) ? textArray.join("\n") : (textArray ?? "");				
				alert(text);
				location.reload();
			} 		
        }, 600);
    };

    //────────────────────────────────────────────
    // 如果未启用自定义错误屏幕，则调整旧版错误打印
    //────────────────────────────────────────────

    if (!parameters.customErrorScreen) {
        const oldPrintError = Graphics.printError;
        Graphics.printError = function(name, message, ...args) {
            message = message.replace('\n', "<BR>\n");
            return oldPrintError.call(this, name, message, ...args);
        };
    }


/** --- patch-begin: Error screen mobile optimisation -------------------- */
(function(){
    'use strict';

    /**
     * 针对手机横/竖屏做适配：
     * - 顶部对齐，让可用垂直空间最大化
     * - 文字缩小、行间紧凑
     * - 超长内容可滚
     */
    function optimiseErrorPrinter(){
        const ep = document.getElementById('ErrorPrinter');
        if (!ep) return;

        /* 1. 容器布局 */
        ep.style.position      = 'fixed';
        ep.style.top           = '20%';
        ep.style.left          = '50%';
        ep.style.transform     = 'translate(-50%,0)';   // 只水平居中
        ep.style.maxWidth      = '900vw';
        ep.style.maxHeight     = '950vh';
        ep.style.margin        = '0';
        ep.style.paddingTop    = '8px';


        /* 2. 统一文字样式 */
        const resize = el=>{
            el.style.fontSize   = '20px';
            el.style.lineHeight = '1.35';
            el.style.margin     = '4px 0';
            el.style.wordBreak  = 'break-word';
            el.style.whiteSpace = 'pre-wrap';
        };
        ep.querySelectorAll('h2, p, pre').forEach(resize);

        /* 3. 确保版本号那行也跟着变小 */
        const ver = ep.querySelector('.tsceb-version');
        if (ver) resize(ver);
    }

    /* 等 SceneManager.printError / TS_Backtrace 自己把 DOM 建好后再执行 */
    const _Graphics_printError = Graphics.printError;
    Graphics.printError = function(){
        _Graphics_printError.apply(this, arguments);
        optimiseErrorPrinter();
    };

    /* 若使用 SceneManager 自定义 catchException 也打印，则再挂一次 */
    const _SceneManager_catchException = SceneManager.catchException;
    SceneManager.catchException = function(){
        _SceneManager_catchException.apply(this, arguments);
        optimiseErrorPrinter();
    };
})();
/** --- patch-end -------------------------------------------------------- */
	
})();