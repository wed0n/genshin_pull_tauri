use crate::commands::{
    Error, GenshinResult, GenshinState, Serialize, State, CHARACTER_WISH, STANDARD_WISH,
    WEAPON_WISH,
};

#[derive(Serialize)]
pub struct GenshinCountItem {
    name: String,
    count: i64,
    time: String,
}
#[derive(Serialize)]
pub struct GenshinCount {
    current: i64,
    items: Vec<GenshinCountItem>,
}

#[tauri::command]
pub async fn count_wishes(
    state: State<'_, GenshinState>,
) -> Result<GenshinResult<GenshinCount>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let closure = |table: &str| -> Result<GenshinCount, Error> {
        let mut current: i64 = 0;
        let mut items: Vec<GenshinCountItem> = Vec::new();
        let mut statement=connection.prepare(format!("SELECT name,time,type,rank FROM item_list,{} where item_list.item_id={}.item_id  order by id;",table,table))?;
        while let Ok(sqlite::State::Row) = statement.next() {
            let rank = statement.read::<i64, _>("rank")?;
            if rank == 5 {
                current += 1;
                let name = statement.read::<String, _>("name")?;
                let time = statement.read::<String, _>("time")?;
                //let item_type=statement.read::<i64, _>("type").unwrap();
                let genshin_item = GenshinCountItem {
                    name,
                    count: current,
                    time,
                };
                items.insert(0, genshin_item);
                current = 0;
                continue;
            }
            current += 1;
        }
        Ok(GenshinCount { current, items })
    };
    Ok(GenshinResult {
        character: closure(CHARACTER_WISH.table_name)?,
        weapon: closure(WEAPON_WISH.table_name)?,
        standard: closure(STANDARD_WISH.table_name)?,
    })
}
