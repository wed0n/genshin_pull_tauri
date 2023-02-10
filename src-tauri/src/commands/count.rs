use crate::commands::{State,GenshinState,GenshinResult,Serialize};

#[derive(Serialize)]
pub struct GenshinCountItem{
    name:String,
    count:i64,
    time:String
}
#[derive(Serialize)]
pub struct GenshinCount{
    current:i64,
    items:Vec<GenshinCountItem>
}

#[tauri::command]
pub async fn count_wishes(state: State<'_,GenshinState>) -> Result<GenshinResult<GenshinCount>, ()> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let closure=|table:&str|{
        let mut current:i64=0;
        let mut items:Vec<GenshinCountItem>=Vec::new();
        let mut statement=connection.prepare(format!("SELECT name,time,type,rank FROM item_list,{} where item_list.item_id={}.item_id  order by id;",table,table)).unwrap();
        while let Ok(sqlite::State::Row) = statement.next() {
            let rank=statement.read::<i64, _>("rank").unwrap();
            if rank==5 {
                current+=1;
                let name=statement.read::<String, _>("name").unwrap();
                let time=statement.read::<String, _>("time").unwrap();
                //let item_type=statement.read::<i64, _>("type").unwrap();
                let genshin_item=GenshinCountItem{
                    name:name,
                    count: current,
                    time:time,
                };
                items.insert(0,genshin_item);
                current=0;
                continue;
            }
            current+=1;
        }
        GenshinCount{ current, items }
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