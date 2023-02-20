use crate::commands::{State, GenshinState, GenshinResult, Serialize, Error};

#[derive(Serialize)]
pub struct GenshinStatisticItem{
    name:String,
    count:i64
}
#[tauri::command]
pub async fn statistic_wishes(state: State<'_,GenshinState>) -> Result<GenshinResult<Vec<GenshinStatisticItem>>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let closure=|table:&str|->Result<Vec<GenshinStatisticItem>,Error>{
        let mut statement=connection.prepare(format!("SELECT name,type,rank,count(id) from item_list,{} WHERE item_list.item_id={}.item_id group by item_list.item_id ORDER by count(id) DESC,rank DESC,type DESC;",table,table))?;
        let mut items:Vec<GenshinStatisticItem>=vec![];
        while let Ok(sqlite::State::Row) = statement.next() {
            let name = statement.read::<String, _>("name")?;
            let count= statement.read::<i64, _>("count(id)")?;
            let item=GenshinStatisticItem{ name, count };
            items.push(item);
        }
        Ok(items)
    };
    let character_wish=closure("character_wish")?;
    let weapon_wish=closure("weapon_wish")?;
    let standard_wish=closure("standard_wish")?;
    Ok(GenshinResult {
        character: character_wish,
        weapon: weapon_wish,
        standard: standard_wish
    })
}