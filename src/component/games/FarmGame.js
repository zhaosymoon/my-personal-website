import React, { useReducer, useEffect } from 'react';
import { initialGameState, gameReducer, ACTIONS, crops } from './gameState';
import './FarmGame.css';

const STORAGE_KEY = 'farm_game_data';

// 从localStorage加载保存的游戏状态
const loadGameState = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return null;
};

// 保存游戏状态到localStorage
const saveGameState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

// 矿石类型定义
const ores = {
  coal: {
    name: '煤矿',
    color: '#222',
    value: 50,
    miningTime: 10,
    probability: 0.6
  },
  iron: {
    name: '铁矿',
    color: '#a0a0a0',
    value: 100,
    miningTime: 20,
    probability: 0.3
  },
  gold: {
    name: '金矿',
    color: '#ffd700',
    value: 200,
    miningTime: 30,
    probability: 0.1
  }
};

const FarmGame = () => {
  const [state, dispatch] = useReducer(gameReducer, loadGameState() || initialGameState);

  // 状态变化时自动保存
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // 设置游戏计时器
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: ACTIONS.TICK });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 处理种植操作
  const handlePlant = (index) => {
    dispatch({
      type: ACTIONS.PLANT,
      payload: { index }
    });
  };

  // 处理收获操作
  const handleHarvest = (index) => {
    dispatch({
      type: ACTIONS.HARVEST,
      payload: { index }
    });
  };

  // 处理出售操作
  const handleSell = (cropType) => {
    dispatch({
      type: ACTIONS.SELL,
      payload: { cropType }
    });
  };

  // 处理作物选择
  const handleSelectCrop = (cropType) => {
    dispatch({
      type: ACTIONS.SELECT_CROP,
      payload: { cropType }
    });
  };

  // 处理一键收获
  const handleHarvestAll = () => {
    dispatch({ type: ACTIONS.HARVEST_ALL });
  };

  // 处理一键种植
  const handlePlantAll = () => {
    dispatch({ type: ACTIONS.PLANT_ALL });
  };

  // 处理购买土地
  const handleBuyLand = () => {
    dispatch({ type: ACTIONS.BUY_LAND });
  };

  // 处理一键贩卖
  const handleSellAll = () => {
    dispatch({ type: ACTIONS.SELL_ALL });
  };

  // 计算成熟作物数量
  const getMatureCropsCount = () => {
    return state.grid.filter(cell => 
      cell && cell.stage === crops[cell.type].stages - 1
    ).length;
  };

  // 计算可种植数量
  const getPlantInfo = () => {
    const maxAffordable = Math.floor(state.money / crops[state.selectedCrop].seedPrice);
    return Math.min(state.grid.filter(cell => cell === null).length, maxAffordable);
  };

  // 渲染单个地块
  const renderMiningCell = (cell, index) => {
    if (!cell) {
      return (
        <div 
          key={index} 
          className="mining-cell empty"
          onClick={() => {}}
        />
      );
    }
    
    const ore = ores[cell.type];
    const progress = cell.isMining 
      ? Math.min(100, (state.gameTime - cell.minedAt) / ore.miningTime * 100)
      : 0;
    
    return (
      <div 
        key={index} 
        className={`mining-cell ${cell.type}`}
        onClick={() => {
          if (!cell.isMining) {
            dispatch({ type: ACTIONS.MINE, payload: { index } });
          } else if (progress >= 100) {
            dispatch({ type: ACTIONS.HARVEST_ORE, payload: { index } });
          }
        }}
      >
        {cell.isMining && (
          <div 
            className="mining-progress" 
            style={{ width: `${progress}%` }}
          />
        )}
        <div className="ore-icon" style={{ backgroundColor: ore.color }} />
        <span className="ore-name">{ore.name}</span>
      </div>
    );
  };

  const handleGenerateAllOres = () => {
    dispatch({ type: ACTIONS.GENERATE_ALL_ORES });
  };

  const handleMineAll = () => {
    dispatch({ type: ACTIONS.MINE_ALL });
  };

  const handleCollectAllMined = () => {
    dispatch({ type: ACTIONS.COLLECT_ALL_MINED });
  };

  const mineableCells = state.miningGrid?.filter(cell => 
    cell && !cell.isMining
  ).length || 0;

  const collectableCells = state.miningGrid?.filter(cell => 
    cell && cell.isMining && (state.gameTime - cell.minedAt) >= ores[cell.type].miningTime
  ).length || 0;

  const renderCell = (cell, index) => {
    if (!cell) {
      return (
        <div 
          key={index}
          className="farm-cell empty"
          onClick={() => handlePlant(index)}
        >
          <span className="cell-content">空地</span>
        </div>
      );
    }

    const crop = crops[cell.type];
    const isReady = cell.stage === crop.stages - 1;

    return (
      <div
        key={index}
        className={`farm-cell planted ${isReady ? 'ready' : ''}`}
        onClick={() => isReady ? handleHarvest(index) : null}
        style={{
          '--crop-color': crop.color,
          '--growth-percent': `${(cell.stage + 1) * (100 / crop.stages)}%`
        }}
      >
        <span className="cell-content">
          {crop.name}<br />
          {Math.min(100, Math.round((cell.stage + 1) * (100 / crop.stages)))}%<br />
          {!isReady && cell.time !== undefined && `${crop.growthTime - cell.time}秒`}
        </span>
      </div>
    );
  };

  // 渲染库存项
  const renderInventoryItem = (cropType) => {
    const crop = crops[cropType];
    const count = state.inventory[cropType] || 0;
    if (count <= 0) return null;

    return (
      <div key={cropType} className="inventory-item">
        <span>{crop.name}: {count}</span>
        <button onClick={() => handleSell(cropType)}>
          出售 (${crop.price})
        </button>
      </div>
    );
  };
  // eslint-disable-next-line
  const { emptySlots, plantable } = getPlantInfo();
  const matureCrops = getMatureCropsCount();

  return (
    <div className="farm-game-container">
      <div className="farm-area">
        <h1>农场</h1>
        <div className="farm-controls">
          <div className="crop-selector">
            <h3>选择作物:</h3>
            <div className="crop-buttons">
              {Object.entries(crops).map(([cropType, crop]) => (
                <button
                  key={cropType}
                  className={`crop-button ${state.selectedCrop === cropType ? 'selected' : ''}`}
                  onClick={() => handleSelectCrop(cropType)}
                  style={{ '--crop-color': crop.color }}
                >
                  {crop.name} (${crop.seedPrice}, {crop.growthTime}秒)
                </button>
              ))}
            </div>
          </div>
          <div className="farm-batch-actions">
            <button 
              onClick={handleHarvestAll}
              disabled={matureCrops === 0}
              className="batch-button harvest-all"
            >
              一键收获 ({matureCrops})
            </button>
            <button 
              onClick={handlePlantAll}
              disabled={plantable === 0}
              className="batch-button plant-all"
            >
              一键种植 ({plantable})
            </button>
          </div>
        </div>
        <div className="farm-grid">
          {state.grid.map((cell, index) => renderCell(cell, index))}
        </div>
      </div>

      <div className="mining-area">
        <h1>矿场</h1>
        <div className="mining-controls">
          <div className="ore-probabilities">
            <h3>矿石生成几率:</h3>
            <div className="probability-list">
              {Object.entries(ores).map(([oreType, ore]) => (
                <div key={oreType} className="probability-item">
                  <span 
                    className="ore-color" 
                    style={{ backgroundColor: ore.color }}
                  />
                  <span>{ore.name}: {Math.round(ore.probability * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mining-batch-actions">
            <button
              onClick={handleGenerateAllOres}
              className="batch-button generate-all"
            >
              一键生成
            </button>
            <button
              onClick={handleMineAll}
              disabled={mineableCells === 0}
              className="batch-button mine-all"
            >
              一键挖矿 ({mineableCells})
            </button>
            <button
              onClick={handleCollectAllMined}
              disabled={collectableCells === 0}
              className="batch-button collect-all"
            >
              一键收取 ({collectableCells})
            </button>
          </div>
        </div>
        <div className="mining-grid">
          {(state.miningGrid || []).map((cell, index) => renderMiningCell(cell, index))}
        </div>
      </div>

      <div className="control-panel">
        <div className="game-info">
          <div className="money">金币: ${state.money}</div>
          <div className="land-info">
            土地: {state.grid.length}/{state.maxLand} 块
            <button 
              onClick={handleBuyLand}
              disabled={state.money < state.landPrice || state.grid.length >= state.maxLand}
              className="buy-land-button"
            >
              购买土地 (${state.landPrice})
            </button>
          </div>
        </div>

        <div className="batch-actions">
          <button 
            onClick={handleSellAll}
            disabled={Object.keys(state.inventory).length === 0}
            className="batch-button sell-all"
          >
            一键贩卖
          </button>
        </div>

        <div className="inventory">
          <h3>库存:</h3>
          <div className="inventory-items">
            <div className="crop-inventory">
              <h4>作物:</h4>
              {Object.keys(crops).map(cropType => renderInventoryItem(cropType))}
            </div>
            <div className="ore-inventory">
              <h4>矿石:</h4>
              {Object.entries(ores).map(([oreType, ore]) => {
                const count = state.miningInventory[oreType] || 0;
                if (count <= 0) return null;
                
                return (
                  <div key={oreType} className="inventory-item">
                    <span>{ore.name}: {count}</span>
                    <button onClick={() => dispatch({ 
                      type: ACTIONS.SELL_ORE, 
                      payload: { oreType } 
                    })}>
                      出售 (${ore.value})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="game-instructions">
          <h3>游戏说明:</h3>
          <ul>
            <li>选择作物并点击空地进行种植</li>
            <li>等待作物生长完成（100%）后点击收获</li>
            <li>在库存中出售收获的作物赚取金币</li>
            <li>用赚取的金币购买更多种子</li>
            <li>使用一键收获快速收获所有成熟作物</li>
            <li>使用一键种植快速种植所有空地（受金币限制）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FarmGame;