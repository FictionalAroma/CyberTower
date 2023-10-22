export default class TowerLevelControl
{
    constructor(runtime, layout, level)
    {
        this.runtime = runtime;
        this.layout = layout;
        this.level = level;
        this.towerLayer = layout.getLayer(2);
        this.gridLayer = layout.getLayer(0);

        layout.addEventListener("beforelayoutstart", this.SetupLevel);
        layout.addEventListener("afterlayoutend", this.Teardown);

    }

     SetupLevel = () =>
    {
        this.tilemap = this.runtime.objects.Tilemap.getFirstInstance();
        this.spawnPoint = this.runtime.objects.SpawnPoint.getFirstInstance();
        this.TowerMap = makeArray(this.tilemap.mapDisplayWidth, this.tilemap.mapDisplayHeight, false)

        this.livesDisplay = this.runtime.objects.LivesValue.getFirstInstance();
        this.moneyDisplay = this.runtime.objects.MoneyValue.getFirstInstance();


        this.runtime.objects.Enemy.addEventListener("instancecreate", (e) => e.instance.setup(this))
        
        this.currentMoney = this.level.startMoney;
        this.currentLives = this.level.startLives;
        this.gameOverHit = false;

        this.UpdateInfoDisplay();


    }


    OnTap = (pointerEvent) =>
    {  
        if(this.gameOverHit || this.runtime.globalVars.Paused ) return;

     
        let mouseXYAr = this.towerLayer.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);

        // go through each family of objects to ignore
        // if we find we are clicking on litterally any, return out do nothing
        const familiesToIgnoreIfClick = ["UITextButtons", "UIButtons", "UIOverlays"];
        
        // do an any of families has any clicked items, if yes, bail method 
        if(familiesToIgnoreIfClick.some(family => 
            this.runtime.objects[family].getAllInstances().some(
                wi => 
                    wi.layer.isSelfAndParentsVisible &&
                    wi.layer.isSelfAndParentsInteractive &&
                    wi.isVisible &&
                    wi.containsPoint(mouseXYAr[0], mouseXYAr[1]))
               ))
        {
            // bail out if ANY
            return;
        }
        

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

    OnTick = (runtime) => {
        this.currentTapDelay -= runtime.dt;

        runtime.objects.Enemy.getAllInstances().forEach(en=> {
            en.onTick();
        });
    }

    Teardown = () =>
    {
        this.layout.removeEventListener("beforelayoutstart", this.SetupLevel);
        this.runtime.removeEventListener("pointerdown", this.OnPointerDown);
        this.runtime.addEventListener("pointerup", this.OnPointerUp);
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