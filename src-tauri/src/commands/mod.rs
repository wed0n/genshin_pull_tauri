use std::fmt;
use std::fmt::Formatter;
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use sqlite::Connection;
use tauri::async_runtime::Mutex;
use tauri::State;

pub use count::*;
pub use request::*;
pub use statistic::*;
pub use group_count::*;

mod request;
mod statistic;
mod count;
mod group_count;

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

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Network(#[from] reqwest::Error),
    #[error(transparent)]
    Sql(#[from]sqlite::Error),
    #[error(transparent)]
    Tauri(#[from]tauri::Error),
    #[error("{0}")]
    Other(String)
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: serde::ser::Serializer
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

fn get_wish_name(gacha_type:&str)->&str{
    if gacha_type=="301"{
        "角色活动祈愿"
    }
    else if gacha_type=="302"{
        "武器活动祈愿"
    }
    else{
        "常驻祈愿"
    }
}

fn get_wish_name_table(gacha_type:&str)->&str{
    if gacha_type=="character_wish"{
        "角色活动祈愿"
    }
    else if gacha_type=="weapon_wish"{
        "武器活动祈愿"
    }
    else{
        "常驻祈愿"
    }
}