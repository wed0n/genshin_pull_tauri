mod request;
mod statistic;
mod count;

use std::sync::{Arc};
use serde::{Deserialize, Serialize};
use sqlite::Connection;
use tauri::async_runtime::{Mutex};
use tauri::State;

pub use count::*;
pub use statistic::*;
pub use request::*;

#[derive(Serialize)]
pub struct GenshinResult<T> {
    character:T,
    weapon:T,
    standard:T
}
pub struct GenshinState {
    pub db:Arc<Mutex<Option<Connection>>>,
    pub raw_url: Mutex<String>,
}

