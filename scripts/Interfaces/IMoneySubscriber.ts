export default interface IMoneySubscriber
{
    currentMoney: number;
    onMoneyUpdated(update: number): void;
}