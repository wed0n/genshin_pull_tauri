mod count;
mod group_count;
mod request;
mod statistic;
mod table;
mod timeline;

use serde::{Deserialize, Serialize};
use sqlite::Connection;
use std::sync::Arc;
use tauri::async_runtime::Mutex;
use tauri::State;

pub use count::*;
pub use group_count::*;
pub use request::*;
pub use statistic::*;
pub use table::*;
pub use timeline::*;

pub struct WishType {
    gacha_type: &'static str,
    table_name: &'static str,
    gacha_name: &'static str,
}
static CHARACTER_WISH: WishType = WishType {
    gacha_type: "301",
    table_name: "character_wish",
    gacha_name: "角色活动祈愿",
};
static WEAPON_WISH: WishType = WishType {
    gacha_type: "302",
    table_name: "weapon_wish",
    gacha_name: "武器活动祈愿",
};
static CHRONICLE_WISH: WishType = WishType {
    gacha_type: "500",
    table_name: "chronicled_wish",
    gacha_name: "集录祈愿",
};
static STANDARD_WISH: WishType = WishType {
    gacha_type: "200",
    table_name: "standard_wish",
    gacha_name: "常驻祈愿",
};
static WISHES: [&WishType; 4] = [
    &CHARACTER_WISH,
    &WEAPON_WISH,
    &CHRONICLE_WISH,
    &STANDARD_WISH,
];

#[derive(Serialize)]
pub struct GenshinResult<T> {
    character: T,
    weapon: T,
    chronicle: T,
    standard: T,
}

pub struct GenshinState {
    pub db: Arc<Mutex<Option<Connection>>>,
    pub raw_url: Mutex<String>,
}

#[derive(Serialize)]
pub struct GenshinTableItem {
    name: String,
    time: String,
    item_type: i64,
    rank: i64,
    gacha_type: i64,
}

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Network(#[from] reqwest::Error),
    #[error(transparent)]
    Sql(#[from] sqlite::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("{0}")]
    Other(String),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub fn make_genshin_result<T>(
    closure: &dyn Fn(&WishType) -> Result<T, Error>,
) -> Result<GenshinResult<T>, Error> {
    Ok(GenshinResult {
        character: closure(&CHARACTER_WISH)?,
        weapon: closure(&WEAPON_WISH)?,
        chronicle: closure(&CHARACTER_WISH)?,
        standard: closure(&STANDARD_WISH)?,
    })
}

pub fn make_union_sql(begin: &str, closure: &dyn Fn(&WishType) -> String, end: &str) -> String {
    let mut sql = String::from(begin);
    sql.push_str(&closure(WISHES[0]));
    for item in &WISHES[1..] {
        sql.push_str(" union all ");
        sql.push_str(&closure(&item));
    }
    sql.push_str(end);
    sql
}
