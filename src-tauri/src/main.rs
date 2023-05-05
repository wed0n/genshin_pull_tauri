#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod disk_cache;
mod genshin;

use commands::{
    count_wishes, get_pulls_by_group, get_wishes, group_count, prepare, statistic_wishes,
    time_line, time_line_day_pulls, GenshinState,
};

fn main() {
    tauri::Builder::default()
        .manage(GenshinState {
            db: Default::default(),
            raw_url: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            prepare,
            get_wishes,
            count_wishes,
            statistic_wishes,
            group_count,
            time_line,
            time_line_day_pulls,
            get_pulls_by_group
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
