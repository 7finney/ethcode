interface ISource {
    content: string | undefined
}
interface ISources {
    [key: string]: ISource
}