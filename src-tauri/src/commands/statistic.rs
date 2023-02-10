use crate::commands::{State,GenshinState,GenshinResult,Serialize};

#[derive(Serialize)]
pub struct GenshinStatisticItem{
    name:String,
    count:i64
}
#[tauri::command]
pub async fn statistic_wishes(state: State<'_,GenshinState>) -> Result<GenshinResult<Vec<GenshinStatisticItem>>, ()> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let closure=|table:&str|{
        let mut statement=connection.prepare(format!("SELECT name,type,rank,count(id) from item_list,{} WHERE item_list.item_id={}.item_id group by item_list.item_id ORDER by count(id) DESC,rank DESC,type DESC;",table,table)).unwrap();
        let mut items:Vec<GenshinStatisticItem>=vec![];
        while let Ok(sqlite::State::Row) = statement.next() {
            let name = statement.read::<String, _>("name").unwrap();
            let count= statement.read::<i64, _>("count(id)").unwrap();
            let item=GenshinStatisticItem{ name, count };
            items.push(item);
        }
        items
    };
    let character_wish=closure("character_wish");
    let weapon_wish=closure("weapon_wish");
    let standard_wish=closure("standard_wish");
    Ok(GenshinResult {
        character: character_wish,
        weapon: weapon_wish,
        standard: standard_wish
    })
}