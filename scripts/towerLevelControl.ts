import type { Level } from "./Data/levelData.js";
import type IMoneySubscriber from "./Interfaces/IMoneySubscriber.js";
import EnemyControl from './objectTypes/EnemyBehavior.js';
import type IPanelMenu from "./objectTypes/IPanelMenu.js";
import type TowerController from "./objectTypes/TowerController.js";
import type TowerUpgradePanel from "./objectTypes/TowerUpgradePanel.js";
import {getProperty}from "./helpers/reflectionHelper.js"

export default class TowerLevelControl {
    runtime: IRuntime;
    layout: ILayout;
    level: Level;
    towerLayer: IAnyProjectLayer | null;
    gridLayer: IAnyProjectLayer | null;
    tilemap: ITilemapInstance | null = null;
    spawnPoint: InstanceType.SpawnPoint | null = null;
    TowerMap: InstanceType.Towers[][] | null[][] | undefined = undefined;
    livesDisplay: InstanceType.LivesValue | null = null;
    moneyDisplay: InstanceType.LivesValue | null = null;
    currentMoney: number = 0;
    currentLives: number = 0;
    gameOverHit: boolean = false;
    TowerUpgradePanel: TowerUpgradePanel | null = null;
    currentOpenPanel: IPanelMenu | null = null;
    currentTapDelay: number = 0;
    moneyNotifers: IMoneySubscriber[];
    constructor(runtime: IRuntime, layout: ILayout, level: Level) {
        this.runtime = runtime;
        this.layout = layout;
        this.level = level;
        this.towerLayer = layout.getLayer(2);
        this.gridLayer = layout.getLayer(0);
        this.moneyNotifers = [];
    }

    SetupLevel = () => {
        this.tilemap = this.runtime.objects.Tilemap.getFirstInstance();
        this.spawnPoint = this.runtime.objects.SpawnPoint.getFirstInstance();
        this.TowerMap = makeArray(this.tilemap!.mapDisplayWidth, this.tilemap!.mapDisplayHeight, null);

        this.livesDisplay = this.runtime.objects.LivesValue.getFirstInstance();
        this.moneyDisplay = this.runtime.objects.MoneyValue.getFirstInstance();

        this.runtime.objects.Enemy.addEventListener("instancecreate", this.SetupEnemy);

        this.currentMoney = this.level.startMoney;
        this.currentLives = this.level.startLives;
        this.gameOverHit = false;

        this.TowerUpgradePanel = this.runtime.objects.TowerUpgradePanel.getFirstInstance();
        this.TowerUpgradePanel?.setup(this.TowerUpgrade, this.TowerSell);
        this.moneyNotifers = [this.TowerUpgradePanel!];

        this.UpdateInfoDisplay();
    };
    TowerUpgrade = (tower: TowerController) => {
        if(tower.instVars.UpgradeCost <= this.currentMoney)
        {
            const key = tower.instVars.UpgradeTemplateName as keyof IConstructProjectObjects;

            const obj = getProperty(this.runtime.objects, key) as IObjectType<IWorldInstance>;
            obj.createInstance(this.towerLayer!.name, tower.x, tower.y, true, tower.instVars.UpgradeTemplateName);
            this.UpdateMoney(-tower.instVars.UpgradeCost)
            tower.destroy();
        }
        this.hideCurrentPanel();
        
    };


    TowerSell = (tower: TowerController) => {
        this.UpdateMoney(10);
        tower.destroy();
        this.hideCurrentPanel();
    };

    Teardown = () => {
        this.runtime.objects.Enemy.removeEventListener("instancecreate", this.SetupEnemy);
    };

    SetupEnemy = (e: ObjectClassInstanceCreateEvent<InstanceType.Enemy>) => {
        const realInstance = e.instance as EnemyControl;
        realInstance?.setup(this);
    };

    OnTap = (pointerEvent: PointerEvent) => {
        if (this.gameOverHit || this.runtime.globalVars.Paused) return;

        let mouseXYAr = this.towerLayer!.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);

        if (this.currentOpenPanel != null) {
            if (this.currentOpenPanel.containsPoint(mouseXYAr[0], mouseXYAr[1])) {
                this.currentOpenPanel.onClickHandler(mouseXYAr);
            } else {
                this.hideCurrentPanel();
            }
            return;
        }

        // go through each family of objects to ignore
        // if we find we are clicking on litterally any, return out do nothing
        const familiesToIgnoreIfClick = [
            this.runtime.objects.UITextButtons,
            this.runtime.objects.UIButtons,
            this.runtime.objects.GamePanels,
        ];

        // do an any of families has any clicked items, if yes, bail method
        if (
            familiesToIgnoreIfClick.some((family) =>
                family
                    .getAllInstances()
                    .some(
                        (wi) =>
                            wi.layer.isSelfAndParentsVisible &&
                            wi.layer.isSelfAndParentsInteractive &&
                            wi.isVisible &&
                            wi.containsPoint(mouseXYAr[0], mouseXYAr[1])
                    )
            )
        ) {
            // bail out if ANY
            return;
        }

        const towers = this.runtime.objects.Towers.getAllInstances();
        let foundTower: InstanceType.Towers | null | undefined = towers.find((s) =>
            s.containsPoint(mouseXYAr[0], mouseXYAr[1])
        );
        if (foundTower == null) {
            const tilemap = this.tilemap!;
            mouseXYAr = this.gridLayer!.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
            if (tilemap.containsPoint(mouseXYAr[0], mouseXYAr[1])) {
                const tileSizeX = tilemap.tileWidth;
                const tileSizeY = tilemap.tileHeight;

                const cellCoords = [Math.floor(mouseXYAr[0] / tileSizeX), Math.floor(mouseXYAr[1] / tileSizeY)];
                foundTower = this.TowerMap![cellCoords[0]][cellCoords[1]];
                if (foundTower == null) {
                    if (this.currentMoney >= 10) {
                        this.UpdateMoney(-10);
                        const createdObject = this.runtime.objects.basicTower.createInstance(
                            2,
                            cellCoords[0] * tileSizeX + tileSizeX / 2,
                            cellCoords[1] * tileSizeY + tileSizeY / 2,
                            true,
                            ""
                        );
                        this.TowerMap![cellCoords[0]][cellCoords[1]] = createdObject;
                    }
                }
            }
        }

        if (foundTower != null) {
            this.TowerUpgradePanel!.show(foundTower);
            this.currentOpenPanel = this.TowerUpgradePanel;
        }
    };

    OnTick = (runtime: IRuntime) => {
        this.currentTapDelay -= runtime.dt;

        runtime.objects.Enemy.getAllInstances<EnemyControl>().forEach((en) => {
            en.onTick();
        });
    };

    OnEnemyKilled = (en: EnemyControl) => {
        this.UpdateMoney(en.getRewardValue());
    };

    OnEnemyArrive = (en: EnemyControl) => {
        this.currentLives = Math.max(this.currentLives - en.getDamageAmount(), 0);
        this.UpdateInfoDisplay();
        if (!this.gameOverHit && this.currentLives <= 0) {
            this.gameOverHit = true;
            this.runtime.callFunction("Gameover");
        }
    };

    private hideCurrentPanel() {
        this.currentOpenPanel?.hide();
        this.currentOpenPanel = null;
    }

    UpdateMoney(amountToAdd: number) {
        this.currentMoney += amountToAdd;
        this.UpdateInfoDisplay();
        this.moneyNotifers.forEach((subscriber) => subscriber.onMoneyUpdated(this.currentMoney));
    }

    UpdateInfoDisplay() {
        this.livesDisplay!.text = this.currentLives.toString();
        this.moneyDisplay!.text = this.currentMoney.toString();
    }
}

function makeArray<T>(w: number, h: number, val: T) {
    var arr: T[][] = [];
    for(let i = 0; i < w; i++) {
        arr[i] = [];
        for(let j = 0; j < h; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}