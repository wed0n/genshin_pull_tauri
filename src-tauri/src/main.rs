/*
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
*/
mod genshin;
mod disk_cache;
mod commands;

use commands::{GenshinState, prepare,get_wishes,count_wishes,statistic_wishes};

fn main() {
    tauri::Builder::default()
        .manage(GenshinState { db: Default::default(), raw_url: Default::default() })
        .invoke_handler(tauri::generate_handler![prepare,get_wishes,count_wishes,statistic_wishes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}