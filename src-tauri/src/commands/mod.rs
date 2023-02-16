use std::sync::Arc;

use serde::{Deserialize, Serialize};
use sqlite::Connection;
use tauri::async_runtime::Mutex;
use tauri::State;

pub use count::*;
pub use request::*;
pub use statistic::*;

mod request;
mod statistic;
mod count;

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
    Sql(#[from]sqlite::Error)
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: serde::ser::Serializer
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}