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

struct WishType {
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
static STANDARD_WISH: WishType = WishType {
    gacha_type: "200",
    table_name: "standard_wish",
    gacha_name: "常驻祈愿",
};

#[derive(Serialize)]
pub struct GenshinResult<T> {
    character: T,
    weapon: T,
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
