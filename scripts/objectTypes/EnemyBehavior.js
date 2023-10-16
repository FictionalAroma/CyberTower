export default class EnemyBehaviour extends ISpriteInstance
{
    constructor()
    {
        super();

        this.behaviors.MoveTo.addEventListener("arrived", e =>{
            if(this.behaviors.MoveTo.getWaypointCount() <= 0)
            {
                this.OnArrive();
                this.destroy();
            }
        });
    }

    setup(levelControl)
    {
        this.OnArrive = () => levelControl.OnEnemyArrive(this);
        this.OnKilled = () => levelControl.OnEnemyKilled(this);
    }

    onTick()
    {
        if(this.getHP() <= 0)
        {
            this.OnKilled();
            this.destroy();
        }

    }

    getHP = () => this.instVars.HP;
    
    getRewardValue = () => this.instVars.RewardValue;
    

    getDamageAmount = () => this.instVars.DamageAmount;
}