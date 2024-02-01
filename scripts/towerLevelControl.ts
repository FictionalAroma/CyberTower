import type { Level } from "./Data/levelData.js";
import EnemyControl from './objectTypes/EnemyBehavior.js';

export default class TowerLevelControl {
    runtime: IRuntime;
    layout: ILayout;
    level: Level;
    towerLayer: IAnyProjectLayer | null;
    gridLayer: IAnyProjectLayer | null;
    tilemap: ITilemapInstance | null = null;
    spawnPoint: InstanceType.SpawnPoint | null = null;
    TowerMap: boolean[][] | null = null;
    livesDisplay: InstanceType.LivesValue | null = null;
    moneyDisplay: InstanceType.LivesValue | null = null;
    currentMoney: number = 0;
    currentLives: number = 0;
    gameOverHit: boolean = false;
    TowerUpgradePanel: any | null;
    currentTapDelay: number = 0;
    constructor(runtime: IRuntime, layout: ILayout, level: Level) {
        this.runtime = runtime;
        this.layout = layout;
        this.level = level;
        this.towerLayer = layout.getLayer(2);
        this.gridLayer = layout.getLayer(0);
    }

    SetupLevel = () => {
        this.tilemap = this.runtime.objects.Tilemap.getFirstInstance();
        this.spawnPoint = this.runtime.objects.SpawnPoint.getFirstInstance();
        this.TowerMap = makeArray(this.tilemap!.mapDisplayWidth, this.tilemap!.mapDisplayHeight, false);

        this.livesDisplay = this.runtime.objects.LivesValue.getFirstInstance();
        this.moneyDisplay = this.runtime.objects.MoneyValue.getFirstInstance();

        this.runtime.objects.Enemy.addEventListener("instancecreate", this.SetupEnemy);

        this.currentMoney = this.level.startMoney;
        this.currentLives = this.level.startLives;
        this.gameOverHit = false;

        this.TowerUpgradePanel = this.runtime.objects.TowerUpgradePanel.getFirstInstance();

        this.UpdateInfoDisplay();
    };

    Teardown = () => {
        this.runtime.objects.Enemy.removeEventListener("instancecreate", this.SetupEnemy);
    };

    SetupEnemy = (e: ObjectClassInstanceCreateEvent<InstanceType.Enemy>) => {
        const realInstance = e.instance as EnemyControl;
        realInstance?.setup(this);
    }


    OnTap = (pointerEvent: PointerEvent) => {
        if (this.gameOverHit || this.runtime.globalVars.Paused) return;
 
        let mouseXYAr = this.towerLayer!.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);

        // go through each family of objects to ignore
        // if we find we are clicking on litterally any, return out do nothing
        const familiesToIgnoreIfClick = [
            this.runtime.objects.UITextButtons,
            this.runtime.objects.UIButtons,
            this.runtime.objects.UIOverlays,
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

        const foundTower = towers.find((s) => s.containsPoint(mouseXYAr[0], mouseXYAr[1]));
        if (foundTower == null) {
            const tilemap = this.tilemap!;
            mouseXYAr = this.gridLayer!.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
            if (tilemap.containsPoint(mouseXYAr[0], mouseXYAr[1])) {
                const tileSizeX = tilemap.tileWidth;
                const tileSizeY = tilemap.tileHeight;

                const cellCoords = [Math.floor(mouseXYAr[0] / tileSizeX), Math.floor(mouseXYAr[1] / tileSizeY)];
                const towerMapResult = this.TowerMap![cellCoords[0]][cellCoords[1]];
                if (towerMapResult != true) {
                    if (this.currentMoney >= 10) {
                        this.UpdateMoney(-10);
                        this.runtime.objects.basicTower.createInstance(
                            2,
                            cellCoords[0] * tileSizeX + tileSizeX / 2,
                            cellCoords[1] * tileSizeY + tileSizeY / 2,
                            true,
                            ""
                        );
                        this.TowerMap![cellCoords[0]][cellCoords[1]] = true;
                    }
                }
            }
        } 
        else {

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

    UpdateMoney(amountToAdd: number) {
        this.currentMoney += amountToAdd;
        this.UpdateInfoDisplay();
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