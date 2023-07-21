extern crate chrono;
extern crate serde;

use std::fs::read_dir;
use std::io::Result;
use std::path::Path;

use chrono::{DateTime, Duration, Local, NaiveDateTime, SecondsFormat, Utc};
use serde::Serialize;

use crate::disk_cache::{BlockFile, CacheAddr, EntryStore, IndexFile};

pub const GACHA_URL_ENDPOINT: &str = "/event/gacha_info/api/getGachaLog?";

#[derive(Debug, Clone)]
pub struct GachaUrl {
    pub addr: CacheAddr,
    pub creation_time: DateTime<Utc>,
    pub url: String,
}

#[derive(Debug, Serialize)]
pub struct SerializedGachaUrl {
    pub addr: u32,
    pub creation_time: String,
    pub url: String,
}

impl GachaUrl {
    pub fn is_expired(&self, current_time: &DateTime<Local>) -> bool {
        let expired_time = (self.creation_time + Duration::days(1)).with_timezone(&Local);
        *current_time >= expired_time
    }
}

impl From<GachaUrl> for SerializedGachaUrl {
    fn from(value: GachaUrl) -> Self {
        Self {
            addr: value.addr.into(),
            creation_time: value
                .creation_time
                .to_rfc3339_opts(SecondsFormat::Millis, true),
            url: value.url,
        }
    }
}

pub fn find_gacha_urls(genshin_data_dir: &Path) -> Result<Vec<GachaUrl>> {
    let mut versions: [u8; 4] = [0, 0, 0, 0];
    let mut tmp_versions: [u8; 4] = [0, 0, 0, 0];
    let mut i = 0;
    let web_caches_dir = genshin_data_dir.join("webCaches/");
    for entry in read_dir(&web_caches_dir)? {
        let entry = entry?;
        let entry_path = entry.path();
        if !entry_path.is_dir() {
            continue;
        }
        let entry_name = entry_path.file_name().unwrap().to_string_lossy();
        let mut nums = entry_name.split(".");

        i = 0;
        while i < 4 {
            let tmp = nums.next();
            match tmp {
                Some(value) => {
                    let tmp = value.parse::<u8>();
                    match tmp {
                        Ok(value) => {
                            tmp_versions[i] = value;
                        }
                        Err(_) => {
                            break;
                        }
                    }
                }
                None => {
                    break;
                }
            }
            i += 1;
        }

        //If new version is greater than old one, then replace.
        i = 0;
        while i < 4 {
            if versions[i] < tmp_versions[i] {
                break;
            }
            i += 1;
        }
        if i < 4 {
            versions = tmp_versions
        }
    }
    let result = format!(
        "{}.{}.{}.{}",
        versions[0], versions[1], versions[2], versions[3]
    );
    // Join the path to the web cache data directory
    let cache_dir = web_caches_dir.join(result + "/Cache/Cache_Data");

    // Read index file and data_1, data_2 block files
    let index_file = IndexFile::from_file(cache_dir.join("index"))?;
    let block_file1 = BlockFile::from_file(cache_dir.join("data_1"))?;
    let block_file2 = BlockFile::from_file(cache_dir.join("data_2"))?;

    let mut result = Vec::new();

    // Foreach the cache address table of the index file
    for addr in index_file.table {
        // Read the entry store from the data_1 block file by cache address
        let entry = EntryStore::from_block_file(&block_file1, &addr)?;

        // Gacha url must be a long key and stored in the data_2 block file,
        // So the long key of entry must not be zero.
        if !entry.is_long_url() {
            continue;
        }

        // Read the long url of entry store from the data_2 block file
        let url = entry.read_long_url(&block_file2)?;

        // Get only valid gacha url
        if !url.contains(GACHA_URL_ENDPOINT) {
            continue;
        }

        let mut url = url.to_string();

        // These url start with '1/0/', only get the later part
        if url.starts_with("1/0/") {
            url = url[4..].to_string();
        }

        // Convert creation time
        let creation_time = creation_time_as_utc(&entry.creation_time);

        result.push(GachaUrl {
            addr,
            creation_time,
            url,
        })
    }

    Ok(result)
}

pub fn find_recent_gacha_url(genshin_data_dir: &Path) -> Option<GachaUrl> {
    // Find all gacha urls
    let mut gacha_urls = match find_gacha_urls(genshin_data_dir) {
        Ok(result) => result,
        Err(_) => return None,
    };

    // Sort DESC by creation time
    gacha_urls.sort_by(|a, b| b.creation_time.cmp(&a.creation_time));

    // First one is the latest
    gacha_urls.first().cloned()
}

fn windows_ticks_to_unix_timestamps(ticks: u64) -> (i64, u32) {
    let seconds = ticks / 10_000_000 - 11_644_473_600;
    let nano_seconds = ticks % 10_000_000;
    (seconds as i64, nano_seconds as u32)
}

fn creation_time_as_utc(creation_time: &u64) -> DateTime<Utc> {
    let (seconds, nano_seconds) = windows_ticks_to_unix_timestamps(
        // The creation time of the entry store must be multiplied by 10 for correct windows ticks
        *creation_time * 10,
    );
    NaiveDateTime::from_timestamp_opt(seconds, nano_seconds)
        .expect("Invalid creation time")
        .and_local_timezone(Utc)
        .unwrap()
}
