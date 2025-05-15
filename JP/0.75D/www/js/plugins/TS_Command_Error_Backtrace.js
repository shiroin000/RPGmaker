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
        if (errorPrinter && e.stack) {
            let p = document.createElement("p");
            p.style.color = "white";
            // 只显示简单的堆栈来源信息
            p.innerHTML = "<b>Stack Trace:</b><br>" + (""+e.stack).replace(/\n/g, "<br>");
            errorPrinter.appendChild(p);
        }
        // 延时 600ms 提示玩家报告 BUG（多语言支持）
        setTimeout(function(){
            const lang = ConfigManager.language;
			let textArray = window.systemFeatureText['ErrorReport'][String(lang)];
			let text = textArray.join('\n');
            const ask = confirm(text);
            if (ask) {
                require('nw.gui').Shell.openExternal('https://discord.gg/9dPrpYwsM9');
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
})();

