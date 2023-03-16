export interface GenshinResult<T> {
    character: T,
    weapon: T,
    standard: T
}
export interface GroupData {
    name: string,
    character5: number,
    weapon5: number,
    character4: number,
    weapon4: number,
    weapon3: number
}
export interface GenshinStatistic {
    name: string,
    count: number,
}
export interface GenshinCount {
    name: string,
    count: number,
    time: string
}
export interface GenshinCount {
    current: number,
    items: Array<GenshinCountItem>
}
export interface GenshinCountItem {
    name: string,
    count: number,
    time: string
}
export interface GenshinTimeLine {
    total: number,
    begin_time: string,
    end_time: string,
    items: Array<GenshinTimeLineItem>
}
export interface GenshinTimeLineItem {
    time: string,
    star5: number,
    star4: number,
    star3: number
}