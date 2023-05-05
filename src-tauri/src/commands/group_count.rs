use crate::commands::{
    Error, GenshinResult, GenshinState, Serialize, State, WishType, CHARACTER_WISH, STANDARD_WISH,
    WEAPON_WISH,
};

#[derive(Serialize)]
pub struct GenshinPie {
    name: String,
    character5: i64,
    weapon5: i64,
    character4: i64,
    weapon4: i64,
    weapon3: i64,
}

#[tauri::command]
pub async fn group_count(
    state: State<'_, GenshinState>,
) -> Result<GenshinResult<GenshinPie>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let closure = |wish_type: &WishType| -> Result<GenshinPie, Error> {
        let mut character5: i64 = 0;
        let mut weapon5: i64 = 0;
        let mut character4: i64 = 0;
        let mut weapon4: i64 = 0;
        let mut weapon3: i64 = 0;
        let mut statement = connection.prepare(format!("SELECT type,rank,count(id) FROM item_list,{} where item_list.item_id={}.item_id GROUP BY type,rank;", wish_type.table_name, wish_type.table_name))?;
        while let Ok(sqlite::State::Row) = statement.next() {
            let item_type = statement.read::<i64, _>("type")?;
            let item_rank = statement.read::<i64, _>("rank")?;
            let count = statement.read::<i64, _>("count(id)")?;
            if item_type == 0 {
                if item_rank == 5 {
                    weapon5 = count;
                } else if item_rank == 4 {
                    weapon4 = count;
                } else {
                    weapon3 = count
                }
            } else {
                if item_rank == 5 {
                    character5 = count;
                } else {
                    character4 = count;
                }
            }
        }
        Ok(GenshinPie {
            name: wish_type.gacha_name.to_string(),
            character5,
            weapon5,
            character4,
            weapon4,
            weapon3,
        })
    };
    Ok(GenshinResult {
        character: closure(&CHARACTER_WISH)?,
        weapon: closure(&WEAPON_WISH)?,
        standard: closure(&STANDARD_WISH)?,
    })
}
