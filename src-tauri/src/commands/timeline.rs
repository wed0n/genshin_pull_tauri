use sqlite::Connection;
use time::{Date, Time};
use crate::commands::{State, GenshinState, GenshinResult, Error, Serialize, CHARACTER_WISH, WEAPON_WISH, STANDARD_WISH, WishType};
use time::macros::{date, format_description};

#[derive(Serialize)]
pub struct GenshinTimeline {
    total: i64,
    begin_time: String,
    end_time: String,
    items: Vec<GenshinTimeLineItem>,
}

#[derive(Serialize)]
pub struct GenshinTimeLineItem {
    time: String,
    star5: i64,
    star4: i64,
    star3: i64,
}

#[derive(Serialize)]
pub struct GenshinDayItem {
    name: String,
    time: String,
    item_type: i64,
    rank: i64,
    gacha_type: i64,
}

#[tauri::command]
pub async fn time_line(state: State<'_, GenshinState>) -> Result<GenshinTimeline, Error> {
    let formatter = format_description!("[year]-[month]-[day]");
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let mut statement = connection.prepare("select * from (SELECT time,rank,id FROM item_list,character_wish where item_list.item_id=character_wish.item_id union all SELECT time,rank,id FROM item_list,weapon_wish where item_list.item_id=weapon_wish.item_id union all SELECT time,rank,id FROM item_list,standard_wish where item_list.item_id=standard_wish.item_id) order by id;")?;
    let mut items: Vec<GenshinTimeLineItem> = vec![];
    match statement.next()? {
        sqlite::State::Row => {
            let time = statement.read::<String, _>("time")?;
            let mut total: i64 = 1;
            let mut current_star5: i64 = 0;
            let mut current_star4: i64 = 0;
            let mut current_star3: i64 = 0;
            let mut current_date = Date::parse(&time[0..10], formatter).unwrap();
            let begin_time = current_date.format(formatter).unwrap();
            let rank = statement.read::<i64, _>("rank")?;
            if rank == 3 { current_star3 += 1; } else if rank == 4 { current_star4 += 1; } else { current_star5 += 1; }
            while let sqlite::State::Row = statement.next()? {
                let time = statement.read::<String, _>("time")?;
                let date = Date::parse(&time[0..10], formatter).unwrap();
                if current_date.lt(&date) {
                    let item = GenshinTimeLineItem {
                        time: current_date.format(formatter).unwrap(),
                        star5: current_star5,
                        star4: current_star4,
                        star3: current_star3,
                    };
                    items.push(item);
                    current_date = date;
                    current_star5 = 0;
                    current_star4 = 0;
                    current_star3 = 0;
                }
                let rank = statement.read::<i64, _>("rank")?;
                if rank == 3 { current_star3 += 1; } else if rank == 4 { current_star4 += 1; } else { current_star5 += 1; }
                total += 1;
            }
            let end_time = current_date.format(formatter).unwrap();
            let item = GenshinTimeLineItem {
                time: current_date.format(formatter).unwrap(),
                star5: current_star5,
                star4: current_star4,
                star3: current_star3,
            };
            items.push(item);
            Ok(GenshinTimeline {
                total,
                begin_time,
                end_time,
                items,
            })
        }
        sqlite::State::Done => {
            Ok(GenshinTimeline {
                total: 0,
                begin_time: "".to_string(),
                end_time: "".to_string(),
                items,
            })
        }
    }
}

#[tauri::command]
pub async fn time_line_day_pulls(state: State<'_, GenshinState>, start_day: String, end_day: String) -> Result<Vec<GenshinDayItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let mut statement = connection.prepare(format!("select * from (SELECT name,time,type,rank,301 gacha_type,id FROM item_list,character_wish where item_list.item_id=character_wish.item_id union all SELECT name,time,type,rank,302 gacha_type,id FROM item_list,weapon_wish where item_list.item_id=weapon_wish.item_id union all SELECT name,time,type,rank,200 gacha_type,id FROM item_list,standard_wish where item_list.item_id=standard_wish.item_id) where time>'{}' and time<'{}' order by id desc;", start_day, end_day))?;
    let mut items: Vec<GenshinDayItem> = vec![];
    while let sqlite::State::Row = statement.next()? {
        let item = GenshinDayItem {
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
pub async fn get_pulls_by_group(state: State<'_, GenshinState>, gacha_type: i64, table_name: String, item_type: i64,rank:i64) -> Result<Vec<GenshinDayItem>, Error> {
    let connection = state.db.lock().await;
    let connection = connection.as_ref().unwrap();
    let mut statement = connection.prepare(format!("SELECT name,time,type,rank,{} gacha_type,id FROM item_list,{} where item_list.item_id={}.item_id and type={} and rank={} order by id DESC", gacha_type, table_name, table_name, item_type,rank))?;
    let mut items: Vec<GenshinDayItem> = vec![];
    while let sqlite::State::Row = statement.next()? {
        let item = GenshinDayItem {
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