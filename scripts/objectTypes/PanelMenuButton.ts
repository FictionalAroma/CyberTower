export default class PanelMenuButton extends InstanceType.PanelButtons {
    private enableEffect: IEffectInstance | null = null;
    public enabledTest: (() => boolean) | undefined;
    public onClick: (() => void) | undefined;

    constructor()
    {
        super();

    }
    setup = (enabledTest: (() => boolean), onClick: (() => void)) => {
        
        this.enabledTest = enabledTest;
        this.onClick = onClick;
        this.enableEffect = this.effects["AdjustHSL"];
    }
    updateEnabed() {
        const enable = this.isVisible && (this.enabledTest == null || this.enabledTest());
        this.setEnabled(enable);
    }

    setEnabled(state: boolean) {
        this.isCollisionEnabled = state;
        //this.effects["AdjustHSL"].isActive = !state;
    }
}