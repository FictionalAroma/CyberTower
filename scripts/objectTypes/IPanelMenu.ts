export default interface IPanelMenu extends InstanceType.GamePanels
{
    show(item: ISpriteInstance): void
    
    hide(): void

    onClickHandler(point: number[]): void
}