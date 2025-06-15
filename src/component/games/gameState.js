// 定义矿石数据
export const ores = {
  coal: {
    name: '煤炭',
    value: 15,
    difficulty: 1,
    color: '#333333',
    spawnChance: 0.3,
    miningTime: 10
  },
  iron: {
    name: '铁矿',
    value: 40,
    difficulty: 2,
    color: '#b87333',
    spawnChance: 0.15,
    miningTime: 20
  },
  gold: {
    name: '金矿',
    value: 100,
    difficulty: 3,
    color: '#ffd700',
    spawnChance: 0.05,
    miningTime: 30
  }
};

// 定义作物数据
export const crops = {
  carrot: {
    name: '胡萝卜',
    stages: 4,
    growthTime: 20,
    seedPrice: 10,
    price: 25,
    color: '#ff6b6b'  // 添加颜色属性
  },
  tomato: {
    name: '番茄',
    stages: 4,
    growthTime: 30,
    seedPrice: 20,
    price: 45,
    color: '#ff4757'  // 添加颜色属性
  },
  corn: {
    name: '玉米',
    stages: 4,
    growthTime: 40,
    seedPrice: 30,
    price: 70,
    color: '#ffd32a'  // 添加颜色属性
  }
};

// 定义动作类型
export const ACTIONS = {
  PLANT: 'plant',
  HARVEST: 'harvest',
  SELL: 'sell',
  BUY_SEED: 'buy_seed',
  SELECT_CROP: 'select_crop',
  TICK: 'tick',
  HARVEST_ALL: 'harvest_all',  // 一键收获
  PLANT_ALL: 'plant_all',      // 一键种植
  BUY_LAND: 'buy_land',        // 购买土地
  SELL_ALL: 'sell_all',        // 一键贩卖
  MINE: 'mine',                // 挖掘矿石
  HARVEST_ORE: 'harvest_ore',  // 收获矿石
  SELL_ORE: 'sell_ore',        // 出售矿石
  SELECT_ORE: 'select_ore',    // 选择矿石类型
  GENERATE_ORE: 'generate_ore', // 生成新矿石
  GENERATE_ALL_ORES: 'generate_all_ores', // 一键生成所有矿石
  MINE_ALL: 'mine_all',        // 一键挖矿
  COLLECT_ALL_MINED: 'collect_all_mined' // 一键收取已挖矿石
};

// 初始游戏状态
export const initialGameState = {
  grid: Array(16).fill(null),
  miningGrid: Array(16).fill(null),
  money: 100,
  inventory: {},
  miningInventory: {},
  selectedCrop: 'carrot',
  selectedOre: 'coal',
  gameTime: 0,
  landPrice: 100,
  maxLand: 25,
  miningLevel: 1
};

// 游戏状态更新函数
export const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.PLANT: {
      const { index } = action.payload;
      const selectedCrop = state.selectedCrop;
      
      // 检查是否有足够的金钱购买种子
      if (state.money < crops[selectedCrop].seedPrice) {
        return state;
      }
      
      // 检查地块是否为空
      if (state.grid[index] !== null) {
        return state;
      }
      
      // 创建新的网格和更新金钱
      const newGrid = [...state.grid];
      newGrid[index] = {
        type: selectedCrop,
        stage: 0,
        plantedAt: state.gameTime
      };
      
      return {
        ...state,
        grid: newGrid,
        money: state.money - crops[selectedCrop].seedPrice
      };
    }
    
    case ACTIONS.HARVEST: {
      const { index } = action.payload;
      const cell = state.grid[index];
      
      // 检查地块是否有作物且已成熟
      if (!cell || cell.stage < crops[cell.type].stages - 1) {
        return state;
      }
      
      // 创建新的网格和更新库存
      const newGrid = [...state.grid];
      newGrid[index] = null;
      
      const newInventory = { ...state.inventory };
      newInventory[cell.type] = (newInventory[cell.type] || 0) + 1;
      
      return {
        ...state,
        grid: newGrid,
        inventory: newInventory
      };
    }
    
    case ACTIONS.SELL: {
      const { cropType } = action.payload;
      
      // 检查库存中是否有该作物
      if (!state.inventory[cropType] || state.inventory[cropType] <= 0) {
        return state;
      }
      
      // 更新库存和金钱
      const newInventory = { ...state.inventory };
      newInventory[cropType] -= 1;
      
      return {
        ...state,
        inventory: newInventory,
        money: state.money + crops[cropType].price
      };
    }
    
    case ACTIONS.SELECT_CROP: {
      return {
        ...state,
        selectedCrop: action.payload.cropType
      };
    }
    
    case ACTIONS.TICK: {
      // 更新游戏时间
      const newGameTime = state.gameTime + 1;
      
      // 更新作物生长
      const newGrid = state.grid.map(cell => {
        if (!cell) return null;
        
        const crop = crops[cell.type];
        const growthTime = crop.growthTime;
        const elapsedTime = newGameTime - cell.plantedAt;
        const newStage = Math.min(
          Math.floor((elapsedTime / growthTime) * crop.stages),
          crop.stages - 1
        );
        
        return {
          ...cell,
          stage: newStage
        };
      });
      
      return {
        ...state,
        gameTime: newGameTime,
        grid: newGrid
      };
    }

    case ACTIONS.HARVEST_ALL: {
      // 收获所有成熟的作物
      const newGrid = [...state.grid];
      const newInventory = { ...state.inventory };
      
      state.grid.forEach((cell, index) => {
        if (cell && cell.stage >= crops[cell.type].stages - 1) {
          // 收获成熟的作物
          newGrid[index] = null;
          newInventory[cell.type] = (newInventory[cell.type] || 0) + 1;
        }
      });
      
      return {
        ...state,
        grid: newGrid,
        inventory: newInventory
      };
    }
    
    case ACTIONS.PLANT_ALL: {
      const selectedCrop = state.selectedCrop;
      const cropPrice = crops[selectedCrop].seedPrice;
      
      // 计算空地数量
      const emptySlots = state.grid.filter(cell => cell === null).length;
      
      // 计算可以种植的最大数量（基于金钱和空地）
      const maxAffordable = Math.floor(state.money / cropPrice);
      const plantCount = Math.min(emptySlots, maxAffordable);
      
      if (plantCount <= 0) {
        return state;
      }
      
      // 创建新的网格
      const newGrid = [...state.grid];
      let planted = 0;
      
      for (let i = 0; i < newGrid.length && planted < plantCount; i++) {
        if (newGrid[i] === null) {
          newGrid[i] = {
            type: selectedCrop,
            stage: 0,
            plantedAt: state.gameTime
          };
          planted++;
        }
      }
      
      return {
        ...state,
        grid: newGrid,
        money: state.money - (planted * cropPrice)
      };
    }
    
    case ACTIONS.BUY_LAND: {
      // 检查是否有足够的金钱和是否达到最大土地限制
      if (state.money >= state.landPrice && state.grid.length < state.maxLand) {
        return {
          ...state,
          grid: [...state.grid, null],  // 添加一块新土地
          money: state.money - state.landPrice
        };
      }
      return state;
    }

    case ACTIONS.SELL_ALL: {
      let totalMoney = 0;
      const newInventory = {};
      
      // 计算所有库存作物的总价值
      for (const [cropType, quantity] of Object.entries(state.inventory)) {
        totalMoney += crops[cropType].price * quantity;
      }
      
      return {
        ...state,
        inventory: newInventory,  // 清空库存
        money: state.money + totalMoney
      };
    }

    case ACTIONS.MINE: {
      const { index } = action.payload;
      const selectedOre = state.selectedOre;
      const cell = state.miningGrid[index];
      
      // 检查地块是否有矿石且未被挖掘
      if (!cell || cell.isMining) {
        return state;
      }
      
      // 更新挖矿进度
      const newMiningGrid = [...state.miningGrid];
      newMiningGrid[index] = {
        ...cell,
        isMining: true,
        miningProgress: 0,
        minedAt: state.gameTime
      };
      
      return {
        ...state,
        miningGrid: newMiningGrid
      };
    }
    
    case ACTIONS.HARVEST_ORE: {
      const { index } = action.payload;
      const cell = state.miningGrid[index];
      
      // 检查矿石是否已完全挖掘
      if (!cell || !cell.isMining || 
          state.gameTime - cell.minedAt < ores[cell.type].miningTime) {
        return state;
      }
      
      // 创建新的网格和更新库存
      const newMiningGrid = [...state.miningGrid];
      newMiningGrid[index] = null;
      
      const newInventory = { ...state.miningInventory };
      newInventory[cell.type] = (newInventory[cell.type] || 0) + 1;
      
      return {
        ...state,
        miningGrid: newMiningGrid,
        miningInventory: newInventory
      };
    }
    
    case ACTIONS.SELECT_ORE: {
      return {
        ...state,
        selectedOre: action.payload.oreType
      };
    }
    
    case ACTIONS.GENERATE_ORE: {
      // 随机生成新矿石
      const newMiningGrid = [...state.miningGrid];
      const emptyIndices = newMiningGrid
        .map((cell, index) => cell === null ? index : null)
        .filter(val => val !== null);
      
      if (emptyIndices.length === 0) {
        return state;
      }
      
      // 随机选择一个空地块
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      
      // 根据概率随机选择矿石类型
      let oreType = null;
      const rand = Math.random();
      if (rand < 0.05) {
        oreType = 'gold';
      } else if (rand < 0.2) {
        oreType = 'iron';
      } else {
        oreType = 'coal';
      }
      
      newMiningGrid[randomIndex] = {
        type: oreType,
        isMining: false,
        miningProgress: 0
      };
      
      return {
        ...state,
        miningGrid: newMiningGrid
      };
    }
    
    case ACTIONS.SELL_ORE: {
      const { oreType } = action.payload;
      
      // 检查库存中是否有该矿石
      if (!state.miningInventory[oreType] || state.miningInventory[oreType] <= 0) {
        return state;
      }
      
      // 更新库存和金钱
      const newInventory = { ...state.miningInventory };
      newInventory[oreType] -= 1;
      
      return {
        ...state,
        miningInventory: newInventory,
        money: state.money + ores[oreType].value
      };
    }
    
    case ACTIONS.GENERATE_ALL_ORES: {
      // 在所有空地块生成矿石
      const newMiningGrid = [...state.miningGrid];
      newMiningGrid.forEach((cell, index) => {
        if (cell === null) {
          // 根据概率随机选择矿石类型
          let oreType = null;
          const rand = Math.random();
          if (rand < 0.05) {
            oreType = 'gold';
          } else if (rand < 0.2) {
            oreType = 'iron';
          } else {
            oreType = 'coal';
          }
          
          newMiningGrid[index] = {
            type: oreType,
            isMining: false,
            miningProgress: 0
          };
        }
      });
      
      return {
        ...state,
        miningGrid: newMiningGrid
      };
    }
    
    case ACTIONS.MINE_ALL: {
      // 开始挖掘所有未挖掘的矿石
      const newMiningGrid = [...state.miningGrid];
      newMiningGrid.forEach((cell, index) => {
        if (cell && !cell.isMining) {
          newMiningGrid[index] = {
            ...cell,
            isMining: true,
            miningProgress: 0,
            minedAt: state.gameTime
          };
        }
      });
      
      return {
        ...state,
        miningGrid: newMiningGrid
      };
    }
    
    case ACTIONS.COLLECT_ALL_MINED: {
      // 收集所有已完成的矿石
      const newMiningGrid = [...state.miningGrid];
      const newInventory = { ...state.miningInventory };
      
      newMiningGrid.forEach((cell, index) => {
        if (cell && cell.isMining && 
            state.gameTime - cell.minedAt >= ores[cell.type].miningTime) {
          newMiningGrid[index] = null;
          newInventory[cell.type] = (newInventory[cell.type] || 0) + 1;
        }
      });
      
      return {
        ...state,
        miningGrid: newMiningGrid,
        miningInventory: newInventory
      };
    }
    
    default:
      return state;
  }
};