export interface GenshinResult<T> {
  character: T
  weapon: T
  chronicle: T
  standard: T
}
export interface GroupData {
  name: string
  character5: number
  weapon5: number
  character4: number
  weapon4: number
  weapon3: number
}
export interface GenshinStatistic {
  name: string
  rank: number
  count: number
}
export interface GenshinCount {
  name: string
  count: number
  time: string
}
export interface GenshinCount {
  current: number
  items: Array<GenshinCountItem>
}
export interface GenshinCountItem {
  name: string
  count: number
  time: string
}
export interface GenshinTimeLine {
  total: number
  begin_time: string
  end_time: string
  items: Array<GenshinTimeLineItem>
}
export interface GenshinTimeLineItem {
  time: string
  star5: number
  star4: number
  star3: number
}
export interface GenshinPullsTableItem {
  name: string
  time: string
  item_type: number
  rank: number
  gacha_type: number
}

export interface GenshinCloudData {
  name: string
  rank: number
  count: number
  scale: number
  x: number
  y: number
  rx: number
  ry: number
  size: number
}
