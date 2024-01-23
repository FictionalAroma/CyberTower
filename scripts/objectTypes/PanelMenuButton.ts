export default class PanelMenuButton extends ISpriteInstance
{
    enabledTest: () => boolean;
    constructor(enabledTest: () => boolean)
    {
        super();
        this.enabledTest = enabledTest;

    }

    updateEnabed()
    {
        const enable = this.isVisible && this.enabledTest();
    }
}