use crate::commands::{Error, GenshinState, Serialize, State};

use super::{make_union_sql, GenshinTableItem, WishType};

#[derive(Serialize)]
pub struct GenshinStatisticItem {
    name: String,
    count: i64,
    rank: i64,
}
#[tauri::command]
pub async fn type_wishes(
    state: State<'_, GenshinState>,
    item_type: i64,
    rank_condition: i64,
) -> Result<Vec<GenshinStatisticItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let rank_condition = match rank_condition {
        0 => "and `rank`=0",
        1 => "and `rank`=5",
        2 => "and `rank`=4",
        3 => "and `rank`!=3",
        4 => "and `rank`=3",
        5 => "and `rank`!=4",
        6 => "and `rank`!=5",
        _ => "",
    };

    let sql = make_union_sql(
        "select name,`rank`,count(item_id) from( ",
        &|wish_type: &WishType| {
            format!("select name,`type`,`rank`,item_list.item_id from {} join item_list on {}.item_id=item_list.item_id",wish_type.table_name,wish_type.table_name)
        },
        &format!(
            " ) where `type`={} {} group by(item_id) order by count(item_id) desc,rank desc;",
            item_type, rank_condition
        ),
    );
    let mut statement = connection.prepare(sql)?;
    let mut items: Vec<GenshinStatisticItem> = vec![];
    while let Ok(sqlite::State::Row) = statement.next() {
        let name = statement.read::<String, _>("name")?;
        let count = statement.read::<i64, _>("count(item_id)")?;
        let rank = statement.read::<i64, _>("rank")?;
        let item = GenshinStatisticItem { name, count, rank };
        items.push(item);
    }
    Ok(items)
}

#[tauri::command]
pub async fn item_wishes(
    state: State<'_, GenshinState>,
    name: String,
) -> Result<Vec<GenshinTableItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();

    let sql = make_union_sql(
        "select name,`type`,`rank`,time,gacha_type from( ",
        &|wish_type: &WishType| {
            format!("select name,`type`,`rank`,time,id,{} gacha_type from {} join item_list on {}.item_id=item_list.item_id",wish_type.gacha_type,wish_type.table_name,wish_type.table_name)
        },
        &format!(" ) where name=\"{}\" order by id desc;", name),
    );
    let mut statement = connection.prepare(sql)?;
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
