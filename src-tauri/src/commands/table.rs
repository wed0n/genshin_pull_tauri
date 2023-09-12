use crate::commands::{Error, GenshinState, State};

use super::GenshinTableItem;

#[tauri::command]
pub async fn time_line_day_pulls(
    state: State<'_, GenshinState>,
    start_day: String,
    end_day: String,
) -> Result<Vec<GenshinTableItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let mut statement = connection.prepare(format!("select * from (SELECT name,time,type,rank,301 gacha_type,id FROM item_list,character_wish where item_list.item_id=character_wish.item_id union all SELECT name,time,type,rank,302 gacha_type,id FROM item_list,weapon_wish where item_list.item_id=weapon_wish.item_id union all SELECT name,time,type,rank,200 gacha_type,id FROM item_list,standard_wish where item_list.item_id=standard_wish.item_id) where time>'{}' and time<'{}' order by id desc;", start_day, end_day))?;
    let mut items: Vec<GenshinTableItem> = vec![];
    while let sqlite::State::Row = statement.next()? {
        let item = GenshinTableItem {
            name: statement.read::<String, _>("name")?,
            time: statement.read::<String, _>("time")?,
            item_type: statement.read::<i64, _>("type")?,
            rank: statement.read::<i64, _>("rank")?,
            gacha_type: statement.read::<i64, _>("gacha_type")?,
        };
        items.push(item);
    }
    Ok(items)
}

#[tauri::command]
pub async fn get_pulls_by_group(
    state: State<'_, GenshinState>,
    gacha_type: i64,
    table_name: String,
    item_type: i64,
    rank: i64,
) -> Result<Vec<GenshinTableItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let mut statement = connection.prepare(format!("SELECT name,time,type,rank,{} gacha_type,id FROM item_list,{} where item_list.item_id={}.item_id and type={} and rank={} order by id DESC", gacha_type, table_name, table_name, item_type, rank))?;
    let mut items: Vec<GenshinTableItem> = vec![];
    while let sqlite::State::Row = statement.next()? {
        let item = GenshinTableItem {
            name: statement.read::<String, _>("name")?,
            time: statement.read::<String, _>("time")?,
            item_type: statement.read::<i64, _>("type")?,
            rank: statement.read::<i64, _>("rank")?,
            gacha_type: statement.read::<i64, _>("gacha_type")?,
        };
        items.push(item);
    }
    Ok(items)
}
