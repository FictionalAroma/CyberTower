import type TowerLevelControl from "../towerLevelControl.js";

export type EnemyControlEvent = ((en: EnemyControl) => void);

export default class EnemyControl extends InstanceType.Enemy {
    OnArrive: EnemyControlEvent | undefined;
    OnKilled: EnemyControlEvent | undefined;
    constructor() {
        super();
        this.behaviors.MoveTo.addEventListener("arrived", this.onMoveToArrive);
    }

    onMoveToArrive = (e: BehaviorInstanceEvent<this, IMoveToBehaviorInstance<this>>) => {
       
        if (e.behaviorInstance.getWaypointCount() <= 0) {
            this.OnArrive!(this);
            this.destroy();
        }
    };

    setup(levelControl: TowerLevelControl) {
        this.OnArrive = levelControl.OnEnemyArrive;
        this.OnKilled = levelControl.OnEnemyKilled;
    }

    onTick() {
        if (this.getHP() <= 0) {
            this.OnKilled!(this);
            this.destroy();
        }
    }

    getHP = () => this.instVars.HP;

    getRewardValue = () => this.instVars.RewardValue;

    getDamageAmount = () => this.instVars.DamageAmount;
}