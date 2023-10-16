export default class TowerLevelControl
{
    tapDelay = 0.25;
    constructor(runtime, layout, level)
    {
        this.runtime = runtime;
        this.layout = layout;
        this.level = level;
        this.towerLayer = layout.getLayer(2);
        this.gridLayer = layout.getLayer(0);

        layout.addEventListener("beforelayoutstart", () => this.SetupLevel());
        layout.addEventListener("afterlayoutend", () => this.Teardown());

    }

    async SetupLevel()
    {
        this.tilemap = this.runtime.objects.Tilemap.getFirstInstance();
        this.spawnPoint = this.runtime.objects.SpawnPoint.getFirstInstance();
        this.TowerMap = makeArray(this.tilemap.mapDisplayWidth, this.tilemap.mapDisplayHeight, false)

        this.runtime.addEventListener("pointerdown", (pointerEvent) => this.OnPointerDown(pointerEvent));
        this.runtime.addEventListener("pointerup", (pointerEvent) => this.OnPointerUp(pointerEvent));

        this.livesDisplay = this.runtime.objects.LivesValue.getFirstInstance();
        this.moneyDisplay = this.runtime.objects.MoneyValue.getFirstInstance();


        this.runtime.objects.Enemy.addEventListener("instancecreate", (e) => e.instance.setup(this))
        
        this.currentMoney = this.level.startMoney;
        this.currentLives = this.level.startLives;
        this.gameOverHit = false;

        this.UpdateInfoDisplay();


    }

    OnPointerDown(pointerEvent)
    {
        if(this.gameOverHit) return;
        this.currentTapDelay = this.tapDelay;
    }

    OnPointerUp(pointerEvent)
    {
        if(this.gameOverHit) return;
        if(this.currentTapDelay > 0) 
        {
            this.OnTap(pointerEvent);
        }
    
    }

    OnTap(pointerEvent)
    {       
        let mouseXYAr = this.towerLayer.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
        const towers = this.runtime.objects.Towers.getAllInstances();
        const foundTower = towers.find(s => s.containsPoint(mouseXYAr[0], mouseXYAr[1]));
        if(foundTower == null) 
        {
            mouseXYAr = this.gridLayer.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
            if(this.tilemap.containsPoint(mouseXYAr[0], mouseXYAr[1]))
            {   
                const tileSizeX = this.tilemap.tileWidth;
                const tileSizeY = this.tilemap.tileHeight;
                
                const cellCoords = [Math.floor(mouseXYAr[0]/tileSizeX), Math.floor(mouseXYAr[1]/tileSizeY)]
                const towerMapResult = this.TowerMap[cellCoords[0]][cellCoords[1]];
                if(towerMapResult != true)
                {
                    if(this.currentMoney >= 10)
                    {
                        this.UpdateMoney(-10);
                        this.runtime.objects.basicTower.createInstance(2, cellCoords[0]*tileSizeX + tileSizeX/2, cellCoords[1]*tileSizeY + tileSizeY/2, true, "");
                        this.TowerMap[cellCoords[0]][cellCoords[1]] = true;
                    }
                }
            }
        }
    }

    OnTick(runtime) {
        this.currentTapDelay -= runtime.dt;

        runtime.objects.Enemy.getAllInstances().forEach(en=> {
            en.onTick();
        });
    }

    Teardown()
    {
        this.layout.removeEventListener("beforelayoutstart", () => this.SetupLevel());
        this.runtime.removeEventListener("pointerdown", (pointerEvent) => this.OnPointerDown(pointerEvent));
        this.runtime.addEventListener("pointerup", (pointerEvent) => this.OnPointerUp(pointerEvent));
    }

    OnEnemyKilled(en)
    {
        this.UpdateMoney(en.getRewardValue());
    }

    OnEnemyArrive(en)
    {
        this.currentLives = Math.max(this.currentLives - en.getDamageAmount(),0);
        this.UpdateInfoDisplay();
        if(!this.gameOverHit && this.currentLives <= 0)
        {
            this.gameOverHit = true;
            this.runtime.callFunction("Gameover");
        }
    }

    UpdateMoney(amountToAdd)
    {
        this.currentMoney += amountToAdd;
        this.UpdateInfoDisplay();
    }

    UpdateInfoDisplay()
    {
        this.livesDisplay.text = this.currentLives.toString();
        this.moneyDisplay.text = this.currentMoney.toString();
    }

}

function makeArray(w, h, val) {
    var arr = [];
    for(let i = 0; i < w; i++) {
        arr[i] = [];
        for(let j = 0; j < h; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}