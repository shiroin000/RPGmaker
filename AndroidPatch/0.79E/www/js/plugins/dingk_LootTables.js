/*******************************************************************************
 * Loot Tables v1.0.1 by dingk
 * For use in RMMV 1.6.2
 ******************************************************************************/
var Imported = Imported || {};
Imported.dingk_LootTables = true;

var dingk = dingk || {};
dingk.Loot = dingk.Loot || {};
dingk.Loot.version = '1.0.1';
dingk.Loot.filename = document.currentScript.src.match(/([^\/]+)\.js/)[1];

/*:
 * @plugindesc [v1.0.1] Create randomized tier-based loot drops within the editor.
 * @author dingk
 *
 * @param Global Loot Tables
 * @desc Pre-define some loot tables if desired, so you don't have to remake them in the Enemies editor.
 * @type struct<DropTable>[]
 * @default ["{\"Name\":\"Sample\",\"Drop Pools\":\"[\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Common\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"55\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Rare\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"30\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Epic\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"12\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Pool Name\\\\\\\":\\\\\\\"Legendary\\\\\\\",\\\\\\\"Weight\\\\\\\":\\\\\\\"3\\\\\\\",\\\\\\\"Min Amount\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"Max Amount\\\\\\\":\\\\\\\"1\\\\\\\"}\\\"]\"}"]
 *
 * @param Plugin Command Settings
 *
 * @param Display Message
 * @parent Plugin Command Settings
 * @desc Allow the game to display the message of the item drop via plugin commands.
 * @on Yes
 * @off No
 * @default true
 *
 * @param Single Item Format
 * @parent Display Message
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name
 * @default %1%2 found!
 *
 * @param Multiple Items Format
 * @parent Display Message
 * @desc The text to display when using the plugin command. Leave blank for none. %1 - Icon, %2 - Name, %3 - Count
 * @default %1%2 ×%3 found!
 *
 * @help
 * -----------------------------------------------------------------------------
 *   Introduction
 * -----------------------------------------------------------------------------
 *
 * Do you need your enemies to drop more loot or change how the game drops
 * items?
 *
 * This plugin adds a randomized tier-based loot drop mechanic to your game. 
 * You can customize loot tables in the plugin manager and set up various item 
 * pools. You can assign these loot tables to enemies or use plugin commands on
 * the map.
 *
 * Loot tables consist of different item pools, which are assigned different
 * weights. A pool with a higher weight has a higher chance of being selected.
 * A selected item pool will drop a random item that has been assigned to it.
 *
 * -----------------------------------------------------------------------------
 *   Notetags
 * -----------------------------------------------------------------------------
 *
 * In the notetags below, the keywords Item / Drop / Loot are interchangeable.
 * For example, you can use <Item Table>, <Drop Table>, or <Loot Table>.
 *
 * Item, Weapon, and Armor Notetags:
 *
 * <Loot Pool: name>
 *  - Put this item in the specified item pool.
 *  - Replace 'name' with the name of the item pool.
 *
 * Actor, Class, Weapon, Armor, and State Notetags:
 *
 * <name Weight: +n>
 * <name Weight: -n>
 * <name Weight: *n>
 *  - Adjust the weight at which an item pool is selected.
 *  - Replace 'name' with the name of the item pool.
 *  - Replace 'n' with a number (can be floating point). 
 *
 * Enemy Notetags:
 *
 * <Loot Table: name[, name, name, ...]>
 *  - Assign one or more loot tables in a comma-separated list to this enemy.
 *  - Replace 'name' with the name of the loot table.
 *
 * <Loot Table [rate]>
 * name
 * name: weight
 * name x[amount]: weight
 * name x[minAmount]-[maxAmount]: weight
 * ...
 * </Loot Table>
 *  - Create a local loot table for this enemy. Replace the following variables:
 *    - [Optional] rate : The probability that this table will drop items.
 *      Default is 100%. Replace with a decimal or percent value.
 *    - name : Name of the item or item pool. For items, you can use the names
 *      of the items or use 'Item [id]', 'Weapon [id]', or 'Armor [id]',
 *      replacing [id] with the item ID.
 *    - [amount] : Number of items to drop. Default is 1.
 *    - minAmount-maxAmount : Random range of items to drop (inclusive).
 *    - weight : Weight of the item or item pool. Default is 1.
 *  - Insert multiple of this notetag to allow multiple drops.
 * EXAMPLE:
 * <Loot Table 75%>
 * Item 3
 * Potion x2: 5
 * Common: 5
 * Common x3-5: 4
 * Rare: 1
 * </Loot Table>
 *  - There is a 75% chance that this enemy will drop an item with an ID of 3, 
 *    2 Potions, a random Common item, 3 to 5 of the same random Common item, or
 *    a random Rare item.
 *  - The total weight adds up to 16, so the Rare item has a 1/16 chance to drop,
 *    whereas the two Potions have a 5/16 chance.
 *
 * -----------------------------------------------------------------------------
 *   Plugin Commands
 * -----------------------------------------------------------------------------
 *
 * In the plugin commands below, the keywords Item / Drop / Loot are
 * interchangeable. Customize the message displayed in the plugin manager.
 *
 * GiveLootPool name [minAmount] [maxAmount]
 *  - Give the player an item from this item pool. Replace 'name' with the name
 *    of the item pool.
 *  - [Optional] Replace 'minAmount' and 'maxAmount' with the amount to give
 *    the player. Default is 1.
 *
 * GiveLootTable name
 *  - Give the player an item from this item table. Replace 'name' with the name
 *    of the item table.
 *
 * EnableLootMessage
 * DisableLootMessage
 *  - Toggle the message displayed after using the commands above on or off.
 *
 * SingleLootMessageFormat string
 * MultipleLootMessageFormat string
 *  - Change the message format. Replace 'string' with the new format.
 *    %1 - Icon, %2 - Name, %3 - Count
 *
 * ResetLootMessage
 *  - Return all loot message settings to default.
 *
 * -----------------------------------------------------------------------------
 *   Compatibility
 * -----------------------------------------------------------------------------
 * No issues found
 *
 * -----------------------------------------------------------------------------
 *   Terms of Use
 * -----------------------------------------------------------------------------
 * Free and commercial use and redistribution (under MIT License).
 *
 * -----------------------------------------------------------------------------
 *   Changelog
 * -----------------------------------------------------------------------------
 * v1.0.1 - Compatibility patch for Moghunter's Treasure Popup
 * v1.0.0 - Initial release
 */
/*~struct~DropTable:
 * @param Name
 * @desc Name of the loot table. Use <Loot Pool: name> in enemy notetags.
 *
 * @param Drop Pools
 * @desc Define one or more pools.
 * @type struct<DropPool>[]
 */
/*~struct~DropPool:
 * @param Pool Name
 * @desc Name of this loot pool. Use an item name to drop that item only.
 *
 * @param Weight
 * @desc The weight of this loot pool.
 * @type number
 * @min 1
 * @default 1
 *
 * @param Min Amount
 * @desc The minimum number of items this loot pool will drop.
 * @type number
 * @min 0
 * @default 1
 *
 * @param Max Amount
 * @desc The maximum number of items this loot pool will drop.
 * @min 0
 * @default 1
 */

//--------------------------------------------------------------------------------------------------
// Classes
//--------------------------------------------------------------------------------------------------

/** Class for item drop object */
class ItemDrop {
	/**
	 * Create item drop
	 * @param {Number} kind - Item, weapon, or armor
	 * @param {Number} dataId - ID of item
	 */
	constructor(kind, dataId) {
		this.kind = kind;
		this.dataId = dataId;
	}
	
	/**
	 * Return database object
	 * @return {Object} Database object
	 */
	getDataItem() {
		switch(this.kind) {
			case 1:
				return $dataItems[this.dataId];
			case 2: {
				let item = $dataWeapons[this.dataId];
				if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
					return DataManager.registerNewItem(item);
				}
				return item;
			}
			case 3: {
				let item = $dataArmors[this.dataId];
				if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels) {
					return DataManager.registerNewItem(item);
				}
				return item;
			}
		}

	}
};

/** Class for the item drop pool */
class DropPool {
	/**
	 * Create drop pool
	 * @param {String} name - Name of pool
	 * @param {Number} minAmount - Minimum number of items dropped
	 * @param {Number} maxAmound - Maximum number of items dropped
	 * @param {Number} level - Level of item
	 * @param {Number} tier - Tier of item
	 */
	constructor(name, weight = 1, minAmount = 0, maxAmount = 0, level = 0, tier = 0) {
		this.name = name;
		this._weight = Math.max(0, Number(weight) || 0);
		this.minAmount = Number(minAmount) || 0;
		this.maxAmount = Number(maxAmount) || 0;
		if (this.minAmount > this.maxAmount) {
			[this.minAmount, this.maxAmount] = [this.maxAmount, this.minAmount];
		}
		this.level = level;
		this.tier = tier;
	}
	/**
	 * Set weight of pool.
	 * @param {Number} weight - Desired weight
	 */
	set weight(weight) {
		if (!weight || weight < 0) weight = 0;
		this._weight = Number(weight) || 0;
	}
	/**
	 * Get weight of pool.
	 * @return {Number} Weight of the pool.
	 */
	get weight() {
		if (this._weight < 0) this._weight = 0;
		return this._weight;
	}
	/**
	 * Return random number of items to drop
	 * @return {Number} Number between minAmount and maxAmount (inclusive)
	 */
	getAmount() {
		return dingk.Loot.randomInt(this.minAmount, this.maxAmount);
	}
};

/** Class for loot table */
class DropTable {
	/**
	 * Create loot table
	 * @param {String} name - Name of table
	 * @param {Array} pools - Array of drop pools
	 * @param {Number} minLevel - Minimum level of items in this table
	 * @param {Number} maxLevel - Maximum level of items in this table
	 * @param {Number} rate - Drop rate of items (0.0 - 1.0)
	 */
	constructor(name = '', pools = [], minLevel = 0, maxLevel = 0, rate = 1.0) {
		this.pools = pools;
		this.name = name;
		this.minLevel = minLevel;
		this.maxLevel = maxLevel;
		this.rate = rate;
	}
	/**
	 * Insert pools in this loot table
	 * @param {Object} pool - DropPool object
	 */
	insert(pool) {
		this.pools = this.pools.concat(pool);
	}
	clear() {
		this.pools = [];
	}
};

//--------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------
dingk.Loot.Pools = {};
dingk.Loot.Tables = {};

dingk.Loot.params = PluginManager.parameters(dingk.Loot.filename);
dingk.Loot.tablesJson = dingk.Loot.params['Global Loot Tables'];
dingk.Loot.displayMsg = dingk.Loot.params['Display Message'];
dingk.Loot.displaySingle = dingk.Loot.params['Single Item Format'];
dingk.Loot.displayMultiple = dingk.Loot.params['Multiple Items Format'];
dingk.Loot.allowStack = true;

//--------------------------------------------------------------------------------------------------
// DataManager
//--------------------------------------------------------------------------------------------------

/**
 * Check if database is loaded, then process notetags
 * @return {bool} Whether database has loaded
 */
dingk.Loot.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dingk.Loot.DataManager_isDatabaseLoaded.call(this)) return false;
	if (!dingk.Loot._loaded) {
		this.process_dingk_Loot_lootTables();
		dingk.Loot.getItemNames();
		dingk.Loot.getWeaponNames();
		dingk.Loot.getArmorNames();
		this.process_dingk_Loot_items($dataItems);
		this.process_dingk_Loot_items($dataWeapons);
		this.process_dingk_Loot_items($dataArmors);
		this.process_dingk_Loot_enemies();
		this.process_dingk_Loot_weights($dataActors);
		this.process_dingk_Loot_weights($dataClasses);
		this.process_dingk_Loot_weights($dataWeapons);
		this.process_dingk_Loot_weights($dataArmors);
		this.process_dingk_Loot_weights($dataStates);
		dingk.Loot._loaded = true;
	}
	return true;
};

/** Parse json */
DataManager.process_dingk_Loot_lootTables = function() {
	let jsonTables = JSON.parse(dingk.Loot.tablesJson);
	for (let jsonTable of jsonTables) {
		let table = JSON.parse(jsonTable);
		let name = table['Name'];
		let pools = JSON.parse(table['Drop Pools']);
		let dropTable = new DropTable(name);
		for (let pool of pools) {
			let obj = JSON.parse(pool);
			dropTable.insert(new DropPool(obj['Pool Name'], obj['Weight'],
				obj['Min Amount'], obj['Max Amount'], 0, obj['Tier']));
		}
		dingk.Loot.Tables[name] = dropTable;
	}
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_Loot_items = function(group) {
	const alias = '(?:drop|loot|item)';
	const regex = new RegExp('<' + alias + ' pool: (.*)>', 'i');
	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		let notedata = obj.note.split(/[\r\n]+/);

		for (let note of notedata) {
			let result;
			if ([, result] = note.match(regex) || '') {
				let kind = dingk.Loot.getItemType(obj);
				if (!dingk.Loot.Pools[result]) dingk.Loot.Pools[result] = [];
				dingk.Loot.Pools[result].push(new ItemDrop(kind, n));
			}
		}
	}
};

/** Parse enemy notetags */
DataManager.process_dingk_Loot_enemies = function() {
	const group = $dataEnemies;
	const alias = '(?:drop|loot|item) table';
	const longLine = '\\s*(\\d*\\.?\\d+?)?(%)?(?: level)?\\s*(\\d+)?-?(\\d+)?';
	const regex = [
		new RegExp('<' + alias + longLine + '>', 'i'),
		new RegExp('<' + alias + longLine + ': (.*)>', 'i'),
		new RegExp('</' + alias + '(.*)?>', 'i')
	];

	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		const notedata = obj.note.split(/[\r\n]+/);

		let mode = '';
		let table = [];
		obj.dropTables = [];

		for (const note of notedata) {
			let result;
			// <drop table> <drop table rate> <drop table rate level x-y>
			if ([, ...result] = note.match(regex[0]) || '') {
				mode = 'drop table';
				table = new DropTable();
				// drop rate
				if (result[0]) {
					let rate = Number(result[0]);
					// %
					if (result[1]) rate /= 100;
					table.rate = rate;
				}
				// level
				if (result[2]) {
					let minLevel = Number(result[2]);
					let maxLevel = result[3] ? Number(result[3]) : minLevel;
					if (minLevel > maxLevel) {
						[minLevel, maxLevel] = [maxLevel, minLevel];
					}
					table.minLevel = minLevel;
					table.maxLevel = maxLevel;
				}
			}
			// <drop table: name> <drop table rate: name> <drop table rate level x-y: name>
			else if ([, ...result] = note.match(regex[1]) || '') {
				let rate, minLevel, maxLevel;
				// rate
				if (result[0]) {
					rate = Number(result[0]);
					// %
					if (result[1]) rate /= 100;
				}
				// level
				if (result[2]) {
					minLevel = Number(result[2]);
					maxLevel = result[3] ? Number(result[3]) : minLevel;
					if (minLevel > maxLevel) {
						[minLevel, maxLevel] = [maxLevel, minLevel];
					}
				}
				let names = result[4].split(',').map(a => a.trim());
				for (let name of names) {
					let dropTable = dingk.Loot.Tables[name];
					if (dropTable) {
						if (rate) dropTable.rate = rate;
						if (minLevel) dropTable.minLevel = minLevel;
						if (maxLevel) dropTable.maxLevel = maxLevel;
						obj.dropTables.push(dropTable);
					}
				}
			}
			// </drop table>
			else if (note.match(regex[2])) {
				mode = '';
				obj.dropTables.push(table);
				table = [];
			} else if (mode === 'drop table') {
				// name xmin // name xmin-max // name xmin-max: weight
				if ([, ...result] = note.match(/(.*) x(\d+)-?(\d+)?:?\s*(\d+)?/i) || '') {
					let name = result[0];
					let min = Number(result[1]);
					let max = result[2] ? Number(result[2]) : min;
					let weight = result[3] ? Number(result[3]) : 1;
					table.insert(new DropPool(name, weight, min, max));
				}
				// name: weight
				else if ([, ...result] = note.match(/(.*):\s*(\d+)/) || '') {
					let name = result[0];
					let weight = Number(result[1]);
					table.insert(new DropPool(name, weight, 1, 1));
				}
				// name
				else if ([, result] = note.match(/(.*)/) || '') {
					table.insert(new DropPool(result, 1, 1, 1));
				}
			}
		}
	}
};

/** 
 * Parse notetags
 * @param {Array} group - List of database objects
 */
DataManager.process_dingk_Loot_weights = function(group) {
	const regex = /<(.*) weight:\s*([*+-])?(\d*.?\d+?)>/i;
	for (let n = 1; n < group.length; n++) {
		let obj = group[n];
		const notedata = obj.note.split(/[\r\n]+/);
		
		obj.lootBuffs = {};
		
		for (const note of notedata) {
			let result;
			// <poolName weight: +n> <poolName weight: -n> <poolName weight: *n>
			if ([, ...result] = note.match(regex) || '') {
				if (result[1] === undefined) result[1] = '+';
				let rateAdj = {operation: result[1], rate: Number(result[2])};
				obj.lootBuffs[result[0]] = rateAdj;
			}
		}
	}
}

//--------------------------------------------------------------------------------------------------
// Game_Actor
//--------------------------------------------------------------------------------------------------

/**
 * Return list of weight adjustments of the actor, class, states, and equipment
 * @param {String} name - Name of drop pool
 * @return {Array} List of weight adjustments
 */
Game_Actor.prototype.getWeightAdjustments = function(name) {
	let buff = [this.actor().lootBuffs[name]];
	buff.push(this.currentClass().lootBuffs[name]);
	
	let states = this.states();
	for (let state of states) {
		if (!state) continue;
		buff.push(state.lootBuffs[name]);
	}
	
	let equips = this.equips();
	for (let equip of equips) {
		if (!equip) continue;
		buff.push(equip.lootBuffs[name]);
	}
	
	return buff;
};

//--------------------------------------------------------------------------------------------------
// Game_Enemy
//--------------------------------------------------------------------------------------------------

/**
 * Get drops from loot table
 * @return {Array} List of drops
 */
dingk.Loot.Game_Enemy_makeDropItems = Game_Enemy.prototype.makeDropItems;
Game_Enemy.prototype.makeDropItems = function() {
	// MOG_TrPopUpBattle compatibility patch
	if (Imported.MOG_TrPopUpBattle && this._treasure.checked) {
		return this._treasure.item;
	}
	let drops = dingk.Loot.Game_Enemy_makeDropItems.call(this);
	if (this.enemy().dropTables) {
		let pools = this.getDropCategory();
		if (pools && pools.length) {
			drops = drops.concat(this.getItemsFromPool(pools));
		}
	}
	return drops;
};

/**
 * Get pools from table
 * @return {Array} List of pools
 */
Game_Enemy.prototype.getDropCategory = function() {
	let poolsToDrop = [];
	for (let table of this.enemy().dropTables) {
		if (table.rate * this.dropItemRate() < Math.random()) continue;
		let pool = dingk.Loot.getDropCategory(table);
		if (pool) poolsToDrop.push(pool);
	}
	return poolsToDrop;
};

/**
 * Get items from pools
 * @param {Array} pools - List of pools
 * @return {Array} List of items to be dropped
 */
Game_Enemy.prototype.getItemsFromPool = function(pools) {
	if (Imported.dingk_EquipLevels && dingk.EL.enableEnemyLevels) {
		// Yanfly's Enemy Levels
		if (Imported.YEP_EnemyLevels) {
			return dingk.Loot.getItemsFromPool(pools, this.level);
		}
		// Tsukihime's Enemy Levels
		if (Imported.EnemyLevels) {
			return dingk.Loot.getItemsFromPool(pools, this.level());
		}
	}
	return dingk.Loot.getItemsFromPool(pools);
};

//--------------------------------------------------------------------------------------------------
// Game_Interpreter
//--------------------------------------------------------------------------------------------------

/**
 * Add plugin commands to drop items from pools/tables
 * @param {String} command
 * @param {Array} args
 */
dingk.Loot.GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	dingk.Loot.GI_pluginCommand.call(this, command, args);
	let cmd = command.toUpperCase();
	let alias = '(?:drop|loot|item)';
	let rx1 = new RegExp('give' + alias + 'pool', 'i');
	let rx2 = new RegExp('give' + alias + 'table', 'i');
	dingk.Loot._event = $gameMap.event(this._eventId);
	if (cmd.match(rx1)) {
		let amountLo = Number(args[1]) || 1;
		let amountHi = Number(args[2]) || amountLo;
		let pool = new DropPool(args[0], 1, amountLo, amountHi)
		let drops = dingk.Loot.getItemsFromPool([pool]);
        drops.forEach(function(drop) {
		   if (DataManager.isItem(drop)) {
        $gameNumberArray.value(12).push(drop.id);
		  }else if (DataManager.isWeapon(drop)) {
	    $gameNumberArray.value(13).push(drop.id);
		  }else if (DataManager.isArmor(drop)) {
	    $gameNumberArray.value(14).push(drop.id);
		  }
     })
		//dingk.Loot.giveDrops(drops);
	} else if (cmd.match(rx2)) {
		let name = args[0];
		let table = dingk.Loot.Tables[name];
		let pool = dingk.Loot.getDropCategory(table);
		let drops = dingk.Loot.getItemsFromPool([pool]);		
        drops.forEach(function(drop) {
		   if (DataManager.isItem(drop)) {
        $gameNumberArray.value(12).push(drop.id);
		  }else if (DataManager.isWeapon(drop)) {
	    $gameNumberArray.value(13).push(drop.id);
		  }else if (DataManager.isArmor(drop)) {
	    $gameNumberArray.value(14).push(drop.id);
		  }
     })				
		//dingk.Loot.giveDrops(drops);
	} else if (cmd.match(/EnableLootMessage/i)) {
		dingk.Loot.displayMsg = true;
	} else if (cmd.match(/DisableLootMessage/i)) {
		dingk.Loot.displayMsg = false;
	} else if (cmd.match(/SingleLootMessageFormat/i)) {
		dingk.Loot.displaySingle = args.join(' ');
	} else if (cmd.match(/MultipleLootMessageFormat/i)) {
		dingk.Loot.displayMultiple = args.join(' ');
	} else if (cmd.match(/ResetLootMessage/i)) {
		dingk.Loot.displayMsg = dingk.Loot.params['Display Message'];
		dingk.Loot.displaySingle = dingk.Loot.params['Single Item Format'];
		dingk.Loot.displayMultiple = dingk.Loot.params['Multiple Items Format'];
	}
	dingk.Loot._event = undefined;
};

//--------------------------------------------------------------------------------------------------
// Game_Party
//--------------------------------------------------------------------------------------------------

/**
 * Adjust the weights of the loot table based on buffs on actors in party
 * @param {Object} table - Loot table
 * @return {Object} New loot table with adjusted weights
 */
Game_Party.prototype.getWeightAdjustments = function(table) {
	let dropTable = Object.assign(new DropTable(), table);
	dropTable.clear();
	for (let pool of table.pools) {
		let newPool = Object.assign(new DropPool(), pool);
		let [add, multiply] = [0, 1];
		for (let member of this.battleMembers()) {
			let buffs = member.getWeightAdjustments(pool.name);
			for (let buff of buffs) {
				if (!buff) continue;
				if (buff.operation.includes('*')) {
					multiply *= buff.rate;
				} else if (buff.operation.includes('-')) {
					add -= buff.rate;
				} else {
					add += buff.rate;
				}
			}
		}
		newPool.weight = newPool.weight * multiply + add;
		dropTable.insert(newPool);
	}
	return dropTable;
};

//--------------------------------------------------------------------------------------------------
//  dingk.Loot and Utils
//--------------------------------------------------------------------------------------------------

/** Make associative arrays of items with their IDs */
dingk.Loot.getItemNames = function() {
	if (dingk.ItemIds) return;
	dingk.ItemIds = {};
	let group = $dataItems;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.ItemIds[group[n].name] = n;
		}
	}
};

/** Make associative arrays of weapons with their IDs */
dingk.Loot.getWeaponNames = function() {
	if (dingk.WeaponIds) return;
	dingk.WeaponIds = {};
	let group = $dataWeapons;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.WeaponIds[group[n].name] = n;
		}
	}
};

/** Make associative arrays of armors with their IDs */
dingk.Loot.getArmorNames = function() {
	if (dingk.ArmorIds) return;
	dingk.ArmorIds = {};
	let group = $dataArmors;
	for (let n = 1; n < group.length; n++) {
		if (group[n].name) {
			dingk.ArmorIds[group[n].name] = n;
		}
	}
};

/**
 * Return item type as a number
 * @param {Object} item
 * @return {Number} Item type
 */
dingk.Loot.getItemType = function(item) {
	if (DataManager.isItem(item)) return 1;
	if (DataManager.isWeapon(item)) return 2;
	if (DataManager.isArmor(item)) return 3;
};

/**
 * Get items from pools
 * @param {Array} pools - List of pools
 * @param {Number} level - Level of items
 * @return {Array} List of items to be dropped
 */
dingk.Loot.getItemsFromPool = function(pools, level) {
	let drops = [];
	let item, result;
	for (let pool of pools) {
		let amount = dingk.Loot.randomInt(pool.minAmount, pool.maxAmount);
		if (dingk.ItemIds[pool.name]) {
			item = $dataItems[dingk.ItemIds[pool.name]];
		} else if (dingk.WeaponIds[pool.name]) {
			item = $dataWeapons[dingk.WeaponIds[pool.name]];
		} else if (dingk.ArmorIds[pool.name]) {
			item = $dataArmors[dingk.ArmorIds[pool.name]];
		} else if ([, ...result] = pool.name.match(/(ITEM|WEAPON|ARMOR)\s*(\d+)/i) || '') {
			if (result[0].match(/ITEM/i)) {
				item = $dataItems[result[1]];
			} else if (result[0].match(/WEAPON/i)) {
				item = $dataWeapons[result[1]];
			} else if (result[0].match(/ARMOR/i)) {
				item = $dataArmors[result[1]];
			}
		} else {
			let iPool = dingk.Loot.Pools[pool.name];
			if (!iPool) continue;
			item = iPool[Math.randomInt(iPool.length)].getDataItem();
		}
		
		// dingk_EquipLevels compatibility patch
		if (Imported.YEP_ItemCore && Imported.dingk_EquipLevels && !DataManager.isItem(item)) {
			let newItem = ItemManager.registerEquipLevel(item, level);
			for (let i = 0; newItem && i < amount; i++) drops.push(newItem);
		} else {
			for (let i = 0; item && i < amount; i++) drops.push(item);
		}
	}
	return drops;
};

/**
 * Return a random pool
 * @param {Object} table - Loot table
 * @return {Object} Drop pool
 */
dingk.Loot.getDropCategory = function(table) {
	if (!table) return;
	let newTable = $gameParty.getWeightAdjustments(table);
	let pools = newTable.pools;
	let totalWeight = pools.reduce((a, dp) => a + dp.weight, 0);
	let randWeight = Math.random() * totalWeight;
	let accWeight = 0;
	for (let pool of pools) {
		accWeight += pool.weight;
		if (randWeight < accWeight) {
			return pool;
		}
	}
};

/**
 * Give the party items from a list and display the message
 * @param {Array} drops - List of items to be given
 */
dingk.Loot.giveDrops = function(drops) {
	let itemCount = {}, weaponCount = {}, armorCount = {};

	for (let item of drops) {
		if (DataManager.isItem(item)) {
			itemCount[item.id] = itemCount[item.id] + 1 || 1;
		} else if (DataManager.isWeapon(item)) {
			weaponCount[item.id] = weaponCount[item.id] + 1 || 1;
		} else if (DataManager.isArmor(item)) {
			armorCount[item.id] = armorCount[item.id] + 1 || 1;
		}
	}
	for (let item of drops) {
		if (!item) continue;
		let icon = '\x1bI[' + item.iconIndex + ']';
		let name = item.textColor ?
			'\x1bC[' + item.textColor + ']' + item.name + '\x1bC[0]':
			item.name;

		if (DataManager.isItem(item)) {
			var amount = itemCount[item.id];
			if (amount > 1) itemCount[item.id] = 0;
		} else if (DataManager.isWeapon(item)) {
			var amount = weaponCount[item.id];
			if (amount > 1) weaponCount[item.id] = 0;
		} else if (DataManager.isArmor(item)) {
			var amount = armorCount[item.id];
			if (amount > 1) armorCount[item.id] = 0;
		} else {
			continue;
		}
		if (dingk.Loot.displayMsg && amount > 0) {
			if (amount === 1) {
				let fmt = dingk.Loot.displaySingle;
				if (fmt) $gameMessage.add(fmt.format(icon, name));
			} else {
				let fmt = dingk.Loot.displayMultiple;
				if (fmt) $gameMessage.add(fmt.format(icon, name, amount));
			}
		}
		$gameParty.gainItem(item, 1);
		
		// Moghunter Treasure Popup compatibility patch
		if (Imported.MOG_TreasurePopup && $gameSystem._trspupVisible) {
			if (amount > 0 && SceneManager._scene instanceof Scene_Map) {
				let [x, y] = [this._event.screenX(), this._event.screenY()];
				$gameSystem._trspupData.push([item, amount, x, y]);
			}
		}
	}
};

/**
 * Return random integer between two numbers (inclusive)
 * @param {Number} min
 * @param {Number} max
 * @return {Number} Random integer between min and max (inclusive)
 */
dingk.Loot.randomInt = function(min, max) {
	if (max < min) [min, max] = [max, min];
	return Math.floor(Math.random() * (max + 1 - min)) + min;
};

//直接计算随机物品ID
dingk.Loot.calculateRandomItemIndex = function(enemyId) {
    const enemy = new Game_Enemy(enemyId, 0, 0);
    let drops = [];

    // 确保每个敌人只处理一次掉落表
    if (enemy.enemy().dropTables) {
        for (let table of enemy.enemy().dropTables) {
            // 根据掉落概率和权重调整来确定是否进行掉落
            if (table.rate * enemy.dropItemRate() >= Math.random()) {
                let adjustedTable = dingk.Loot.adjustTableWeights(table);
                let pool = dingk.Loot.getDropCategory(adjustedTable);
                if (pool) {
                    // 合并调整后的掉落池中获取的物品
                    drops = drops.concat(dingk.Loot.getItemsFromPool([pool]));
                }
            }
        }
    }

    if (drops.length > 0) {
         return drops[0].id;
    } else {
		 return 0;
	}
};

//直接获取掉落物
dingk.Loot.directlyAcquireDrops = function(enemyId, display = false) {
    const interpreter = new Game_Interpreter();
    const enemy = new Game_Enemy(enemyId, 0, 0);
    let drops = [];

    // 确保每个敌人只处理一次掉落表
    if (enemy.enemy().dropTables) {
        for (let table of enemy.enemy().dropTables) {
            // 根据掉落概率和权重调整来确定是否进行掉落
            if (table.rate * enemy.dropItemRate() >= Math.random()) {
                let adjustedTable = dingk.Loot.adjustTableWeights(table);
                let pool = dingk.Loot.getDropCategory(adjustedTable);
                if (pool) {
                    // 合并调整后的掉落池中获取的物品
                    drops = drops.concat(dingk.Loot.getItemsFromPool([pool]));
                }
            }
        }
    }

    const languageTexts = {
        0: "找到了",  // 中文
        1: "見つけた", // 日语
        2: "Found",   // 英语
    };

    const language = $gameVariables.value(1) || 0;
    const foundText = languageTexts[language] || "Found";

    drops.forEach(function(drop) {
        if (DataManager.isItem(drop)) { // 物品
            if ($gameNumberArray.value(9).includes(drop.id)) {
                $gameSystem._drill_GFTH_styleId = 3;
            } else {
                $gameNumberArray.value(9).push(drop.id);
                $gameSystem._drill_GFTH_styleId = 2;
            }
            var context = interpreter.drill_GFTH_getText_item(drop.id, 1);
            $gameTemp.drill_GFTH_pushNewText(context);
            $gameParty.gainItem(drop, 1);
        } else if (DataManager.isWeapon(drop)) { // 武器
            if (!QJ.MPMZ.tl.checkplayerWeaponWeight()) {
				dingk.Loot.getMapDrops($gamePlayer,drop);				
                return; // 背包超重
            }
            if ($gameNumberArray.value(10).includes(drop.id)) {
                $gameSystem._drill_GFTH_styleId = 3;
            } else {
                $gameNumberArray.value(10).push(drop.id);
                $gameSystem._drill_GFTH_styleId = 2;
            }
            var context = interpreter.drill_GFTH_getText_weapon(drop.id, 1);
            $gameTemp.drill_GFTH_pushNewText(context);
            $gameParty.gainItem(drop, 1);
        } else if (DataManager.isArmor(drop)) { // 护甲
            if (!QJ.MPMZ.tl.checkplayerGearWeight()) {
				dingk.Loot.getMapDrops($gamePlayer,drop);					
                return; // 背包超重
            }
            if ($gameNumberArray.value(11).includes(drop.id)) {
                $gameSystem._drill_GFTH_styleId = 3;
            } else {
                $gameNumberArray.value(11).push(drop.id);
                $gameSystem._drill_GFTH_styleId = 2;
            }
            var context = interpreter.drill_GFTH_getText_armor(drop.id, 1);
            $gameTemp.drill_GFTH_pushNewText(context);
            $gameParty.gainItem(drop, 1);
        }

        if (display) { // 只有在有效掉落后才显示文本
            let itemTypeTag = DataManager.isItem(drop) ? "\\ii" : DataManager.isWeapon(drop) ? "\\iw" : "\\ia";
            let text = `${foundText} ${itemTypeTag}[${drop.id}]！`;
            $gameMessage.setBackground(0);
            $gameMessage.setPositionType(2);
            $gameMessage.add(text);
        }
    });
};



// 自定义地点生成掉落物
dingk.Loot.specifiedLocationGenerateDrops = function (enemyId, XX, YY) {
    const enemy = new Game_Enemy(enemyId, 0, 0);
    let drops = [];

    // 确保每个敌人只处理一次掉落表
    if (enemy.enemy().dropTables) {
        for (let table of enemy.enemy().dropTables) {
            // 根据掉落概率和权重调整来确定是否进行掉落
            if (table.rate * enemy.dropItemRate() >= Math.random()) {
                let adjustedTable = dingk.Loot.adjustTableWeights(table);
                let pool = dingk.Loot.getDropCategory(adjustedTable);
                if (pool) {
                    // 合并调整后的掉落池中获取的物品
                    drops = drops.concat(dingk.Loot.getItemsFromPool([pool]));
                }
            }
        }
    }

    drops.forEach(function (drop) {

            let text;
            //var e = $gameMap.drill_COEM_offspring_createEvent(1, 82, XX, YY);
			var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
			var e = $gameMap.event(eid);
			if (!e) return;
            e._opacity = 0;
            $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);

            if (DataManager.isItem(drop)) {
                $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
                text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
            } else if (DataManager.isWeapon(drop)) {
                $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
                text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
            } else if (DataManager.isArmor(drop)) {
                $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
                text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
            }

            $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
            var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
            e.setImage(iconIndex, e._characterIndex);
            e._opacity = 255;
            // 事件的头顶文本
            var sprite = SceneManager._scene._spriteset.findCharacterSprite(e);
            if (sprite && sprite._miniLabel) {
                sprite._miniLabel._noFresh = true;
                sprite._miniLabel._bufferY = 20;
                sprite._miniLabel.setGoodsText(text);
            }

            var condition = DrillUp.g_COFA_condition_list[10];
            var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(XX, YY, "圆形区域", 6, condition);
            if (c_area.length > 0) {
                var p = c_area[Math.floor(Math.random() * c_area.length)];
                var xPlus = p.x - XX;
                var yPlus = p.y - YY;
                e.jump(xPlus, yPlus);
            } else {
                e.jump(0, 0);
            }
          if (enemyId == 110) {
			var se = { name: "魚を釣り上げる", volume: 100, pitch: 100, pan: 0 }; 
		  } else {
            var se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
		  }
		    AudioManager.playSe(se); 
        
    });

    return drops;
};

dingk.Loot.loopGenerateGoods = function (XX,YY,times,Oid) {
      
	   if (!times) times = 4;
	   this._loopTimes = this._loopTimes || 0;
	   this._loopTimes += 1;

            if (this._loopTimes >= times) {
				if ($gameMap.event(Oid) && $gameMap.event(Oid)._drill_EASe_controller !== undefined) {
					$gameMap.event(Oid).drill_EASe_setSimpleStateNode( ["微笑"] );
				}
                this.setDead({t:['Time',0]});
                return; 
            }	   

    let randomIndex = Math.floor(Math.random() * this.data.dropsArray.length);
    let drop = this.data.dropsArray.splice(randomIndex, 1)[0]; 

            if (this.data.dropsArray.length == 0) {
				if ($gameMap.event(Oid) && $gameMap.event(Oid)._drill_EASe_controller !== undefined) {
					$gameMap.event(Oid).drill_EASe_setSimpleStateNode( ["微笑"] );
				}				
                this.setDead({t:['Time',0]});
                return; 
            }	

    let eid = $gameMap.spawnEventQJ(1, 100, XX, YY, true);
    let e = $gameMap.event(eid);
    if (!e) return;

    e._opacity = 0;
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, "dropsId"], drop.id);

    let text;
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, "dropsType"], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, "dropsType"], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, "dropsType"], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }

    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, "A"], true);

    let iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
    e._opacity = 255;

    let sprite = SceneManager._scene._spriteset.findCharacterSprite(e);
    if (sprite && sprite._miniLabel) {
        sprite._miniLabel._noFresh = true;
        sprite._miniLabel._bufferY = 20;
        sprite._miniLabel.setGoodsText(text);
    }

    var condition = DrillUp.g_COFA_condition_list[6];
    var c_area = $gameMap.drill_COFA_getCustomPointsByIdWithCondition(Oid, 8, condition);
	
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }

    let se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
    AudioManager.playSe(se);

};

// 自定义地点生成掉落物(商品类型)
dingk.Loot.specifiedLocationGenerateGoods = function (times) {
    const XX = this._x;
    const YY = this._y + 0.15;
    const Oid = this._eventId;

    if (!times) times = 4;

    const enemy = new Game_Enemy(188, 0, 0);
    let drops = [];

    for (let i = 0; i < times; i++) {
        // 如果没有掉落表，直接跳过
        if (!enemy.enemy().dropTables) continue;

        let drop = null;
        let attemptCount = 0;

        // 最多尝试 10 次，寻找一个不重复的掉落
        while (attemptCount < 2) {
            attemptCount++;

            // 遍历所有掉落表，一旦抽到物品就检查并决定是否使用
            for (let table of enemy.enemy().dropTables) {
                let rand = Math.random();
                // 先判断当前掉落表是否触发
                if (table.rate * enemy.dropItemRate() >= rand) {
                    let adjustedTable = dingk.Loot.adjustTableWeights(table);
                    let pool = dingk.Loot.getDropCategory(adjustedTable);
                    if (pool) {
                        let candidate = dingk.Loot.getItemsFromPool([pool])[0];
                        if (!candidate) continue;

                        // 这里假设 candidate 有 type 字段用来标识物品类型
                        let candidateType = candidate.type;

                        // 检查是否已在 drops 里
                        let isDuplicate = drops.some(d => {
                            // 同时比较 id + 物品类型，才算真正重复
                            let dType = d.type;
                            return (d.id === candidate.id && dType === candidateType);
                        });

                        if (!isDuplicate) {
                            drop = candidate;
                            break;
                        }
                    }
                }
            }

            if (drop) break;
        }

        // 如果 10 次都找不到非重复物品，则用 $dataItems[3] 作为保底物品
        if (!drop) {
            drop = $dataItems[3];
            // 如果需要在后续逻辑中使用 drop.id、drop.type 等字段，可以手动扩展：
            // drop.id = 3;
            // drop.type = 'item';
        }

        // 在这里统一 push
        drops.push(drop);
    }

    //console.log(drops);

    QJ.MPMZ.Shoot({
        img: "null1",
        groupName: ['chahuiGoods'],
        position: [['M'], ['M']],
        initialRotation: ['S', 0],
        imgRotation: ['F'],
        opacity: 0,
        moveType: ['S', 0],
        blendMode: 0,
        existData: [],
        moveF: [
            [10, 36, dingk.Loot.loopGenerateGoods, [XX, YY, times, Oid]]
        ],
        dropsArray: drops
    });
};

// 玩家丢弃装备
dingk.Loot.playerdiscardsEquipment = function ( drop ) {	

    if (!$gamePlayer) return;

	// 如果丢弃地点是星之门，标记无法删除
	if ($gameMap.mapId() === 51) {
      // 星之门内最多可丢弃200件物品		
	  if ($gameMap.drill_COET_getEventsByTag_direct("掉落物").length >= 200) {
            var lang = $gameVariables.value(1);
            switch (lang) {
                case 0:
                    lang = "不能再存放更多物品了！";
                    break;
                case 1:
                    lang = "アンスズのログインに失敗！ネット接続を確認してください！";
                    break;
                case 2:
                    lang = "Can’t store any more items!";
                    break;
                default:
                    lang = "Can’t store any more items!";
                    break;
            }
	
    var text = "\\fs[28]\\c[101]\\dDCOG[11:1:1:1]" + lang;
    var x =  $gamePlayer.screenX() * $gameScreen.zoomScale();
    var y = ($gamePlayer.screenY() * $gameScreen.zoomScale()) - 48;
    $gameTemp.drill_GFTT_createSimple( [x, y], text, 5, 0, 90 );	
	AudioManager.playSe({ name: "014myuu_YumeSE_SystemBuzzer03", volume: 90, pitch: 100, pan: 0 });
         return;		 
	  }
		
	  drop.description = "不可删除";
	} else {
	  drop.description = "";
	}
    
    var XX = $gamePlayer.centerRealX();
    var YY = $gamePlayer.centerRealY();
    var text;
	var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
	var e = $gameMap.event(eid);	
    e._opacity = 0;
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);
    
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }
    
    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
    var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
    e._opacity = 255;
	e.setMiniLabelText(text);

    var condition = DrillUp.g_COFA_condition_list[10];
    var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(Math.floor(XX), Math.floor(YY), "圆形区域", 3, condition);
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }
    var se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
    AudioManager.playSe(se);
	// 从玩家背包移除
	$gameParty.loseItem(drop, 1);
	
};
	
	
//敌人掉落物
dingk.Loot.generateEnemyDrops = function ( target ) {
	if (!target) return;
	let enemyId = $gameSelfVariables.value([$gameMap.mapId(), target._eventId, 'enemyId']);
	if (enemyId === 0) return;
    const enemy = new Game_Enemy(enemyId, 0, 0);
    let drops = [];

    // 确保每个敌人只处理一次掉落表
    if (enemy.enemy().dropTables) {
        for (let table of enemy.enemy().dropTables) {
            // 根据掉落概率和权重调整来确定是否进行掉落
            if (table.rate * enemy.dropItemRate() >= Math.random()) {
                let adjustedTable = dingk.Loot.adjustTableWeights(table);
                let pool = dingk.Loot.getDropCategory(adjustedTable);
                if (pool) {
                    // 合并调整后的掉落池中获取的物品
                    drops = drops.concat(dingk.Loot.getItemsFromPool([pool]));
                }
            }
        }
    }

    drops.forEach(function(drop) {
		QJ.MPMZ.tl.ex_getEnemyDrops(target,drop);	 		 
    });

    return drops;
};

//敌人掉落物事件模板
QJ.MPMZ.tl.ex_getEnemyDrops = function(target, drop) {
    if (!target) return;
    
    var XX = target.centerRealX();
    var YY = target.centerRealY();
    var text;
    
   // var e = $gameMap.drill_COEM_offspring_createEvent(1, 82, XX, YY);
			var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
			var e = $gameMap.event(eid);	
    e._opacity = 0;
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);
    
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
		if ([4,5,6,7,8,9,10,11,12].includes(drop.id)) {
			e.drill_COET_addTag("money");
			$gameTemp._drill_COET_needRestatistics = true;
		}

    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }
    
    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
    var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
    e._opacity = 255;
	e.setMiniLabelText(text);

    var condition = DrillUp.g_COFA_condition_list[6];
    var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(Math.floor(XX), Math.floor(YY), "圆形区域", 3, condition);
	    //c_area = $gameMap.drill_COFA_selectPoints_event(c_area,false);
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }

    var se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
    AudioManager.playSe(se);
};

//自动贩售机掉落
dingk.Loot.generateVendingMachineDrops = function ( target ) {
	if (!target) return;
	let enemyId = 5;
    const enemy = new Game_Enemy(enemyId, 0, 0);
    let drops = [];

    // 确保每个敌人只处理一次掉落表
    if (enemy.enemy().dropTables) {
        for (let table of enemy.enemy().dropTables) {
            // 根据掉落概率和权重调整来确定是否进行掉落
            if (table.rate * enemy.dropItemRate() >= Math.random()) {
                let adjustedTable = dingk.Loot.adjustTableWeights(table);
                let pool = dingk.Loot.getDropCategory(adjustedTable);
                if (pool) {
                    // 合并调整后的掉落池中获取的物品
                    drops = drops.concat(dingk.Loot.getItemsFromPool([pool]));
                }
            }
        }
    }

    drops.forEach(function(drop) {
		QJ.MPMZ.tl.ex_getVendingMachineDrops(target,drop);	 		 
    });

    return drops;
};

//自动贩售机掉落模板
QJ.MPMZ.tl.ex_getVendingMachineDrops = function(target, drop) {
    if (!target) return;
    
    var XX = target._x;
    var YY = target._y;
    var text;
    
   // var e = $gameMap.drill_COEM_offspring_createEvent(1, 82, XX, YY);
			var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
			var e = $gameMap.event(eid);	
    e._opacity = 0;
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);
    
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }
    
    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
    var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
    e._opacity = 255;
	e.setMiniLabelText(text);

    var condition = DrillUp.g_COFA_condition_list[10];
    //var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(XX, YY, "圆形区域", 6, condition);
	var c_area = $gameMap.drill_COFA_getCustomPointsByIdWithCondition( e._eventId, 7, condition );
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }

    var se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
    AudioManager.playSe(se);
};

//地图掉落物模板
dingk.Loot.getMapDrops = function(target,drop) {
    if (!target) return;
    
    var XX = target._x + target.offsetX();
    var YY = target._y + target.offsetY();
    var text;
	var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
	var e = $gameMap.event(eid);	
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);
    
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
		if ([4,5,6,7,8,9,10,11,12].includes(drop.id)) {
			e.drill_COET_addTag("money");
			$gameTemp._drill_COET_needRestatistics = true;
		}		
    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }    
    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
    var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
	e._opacity = 255;
	e.setMiniLabelText(text);

    var condition = DrillUp.g_COFA_condition_list[6];
    var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(Math.floor(XX), Math.floor(YY), "圆形区域", 5, condition);
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }
};

//指定地点地图掉落物模板
dingk.Loot.specifyPositionGetMapDrops = function(XX,YY,drop) {
	
    if (!XX || !YY) return;
  
    var text;
	var eid = $gameMap.spawnEventQJ(1,82,XX,YY,true);
	var e = $gameMap.event(eid);	
    $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsId'], drop.id);
    
    if (DataManager.isItem(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 1);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\si[" + drop.id + "]";
		if ([4,5,6,7,8,9,10,11,12].includes(drop.id)) {
			e.drill_COET_addTag("money");
			$gameTemp._drill_COET_needRestatistics = true;
		}		
    } else if (DataManager.isWeapon(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 2);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sw[" + drop.id + "]";
    } else if (DataManager.isArmor(drop)) {
        $gameSelfVariables.setValue([$gameMap.mapId(), e._eventId, 'dropsType'], 3);
        text = "\\fs[28]\\dDCOG[11:2:2:2]\\sa[" + drop.id + "]";
    }    
    $gameSelfSwitches.setValue([$gameMap.mapId(), e._eventId, 'A'], true);
    var iconIndex = "$DrillEIIconSet_" + drop.iconIndex;
    e.setImage(iconIndex, e._characterIndex);
	e._opacity = 255;
	e.setMiniLabelText(text);

    var condition = DrillUp.g_COFA_condition_list[6];
    var c_area = $gameMap.drill_COFA_getShapePointsWithCondition(Math.floor(XX), Math.floor(YY), "圆形区域", 3, condition);
    if (c_area.length > 0) {
        var p = c_area[Math.floor(Math.random() * c_area.length)];
        var xPlus = p.x - XX;
        var yPlus = p.y - YY;
        e.jump(xPlus, yPlus);
    } else {
        e.jump(0, 0);
    }
    var se = { name: "Heal1", volume: 60, pitch: 130, pan: 0 };
    AudioManager.playSe(se);	
};

// 调整权重的方法
dingk.Loot.adjustTableWeights = function (table) {
    let adjustedTable = Object.assign(new DropTable(), table);
    adjustedTable.clear();
    
    for (let pool of table.pools) {
        let newPool = Object.assign(new DropPool(), pool);
        let [add, multiply] = [0, 1];
        
        for (let member of $gameParty.battleMembers()) {
            let buffs = member.getWeightAdjustments(pool.name);
            for (let buff of buffs) {
                if (!buff) continue;
                if (buff.operation.includes('*')) {
                    multiply *= buff.rate;
                } else if (buff.operation.includes('-')) {
                    add -= buff.rate;
                } else {
                    add += buff.rate;
                }
            }
        }

        newPool.weight = newPool.weight * multiply + add;
        adjustedTable.insert(newPool);
    }

    return adjustedTable;
};



dingk.Loot.generateGoods = function (enemyId) {
	const enemy = new Game_Enemy(enemyId, 0, 0);
    const drops = enemy.makeDropItems();
	var item = [];
    drops.forEach(function(drop) {
		   if (DataManager.isItem(drop)) {
        item.push(1);
		item.push(drop.id);
		  }else if (DataManager.isWeapon(drop)) {
        item.push(2);
		item.push(drop.id);
		  }else if (DataManager.isArmor(drop)) {
        item.push(3);
		item.push(drop.id);
		  }
    })

    return item;
}

