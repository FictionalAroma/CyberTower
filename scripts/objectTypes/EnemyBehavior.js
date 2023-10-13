export default class EnemyBehaviour extends ISpriteInstance
{
    constructor()
    {
        super();

        this.behaviors.MoveTo.addEventListener("arrived", e =>{
            if(this.behaviors.MoveTo.getWaypointCount() <= 0)
            {
                if(this.OnArrive != null)
                {
                    this.OnArrive(e);
                }
                this.destroy();
            }
        });
    }

    setup(levelControl)
    {
        this.OnArrive = levelControl.OnEnemyArrive;
        this.OnKilled = levelControl.OnEnemyKilled;
    }

    onTick()
    {
        if(this.getHP() <= 0)
        {
            OnKilled(this);
            destroy();
        }

    }

    getHP = () => this.instVars.HP;
    
    getRewardValue = () => this.instVars.RewardValue;
    

    getDamageAmount = () => this.instVars.getDamageAmount;
}