use crate::commands::{
    Arc, Connection, Deserialize, Error, Error::Other, GenshinState, Mutex, State, WishType,
};
use crate::genshin::{find_game_data_dir, find_recent_gacha_url};
use regex::Regex;
use tauri::Window;
use tokio::time::{sleep, Duration};

use super::WISHES;

#[derive(Deserialize)]
struct GenshinResponse<T> {
    // retcode: i8,
    // message: String,
    data: T,
}

#[derive(Deserialize)]
struct GenshinData {
    // page: String,
    // size: String,
    // total: String,
    list: Vec<GenshinItem>,
    // region: String,
}

#[derive(Deserialize)]
struct GenshinItem {
    uid: String,
    // gacha_type: String,
    // item_id: String,
    // count: String,
    time: String,
    name: String,
    // lang: String,
    item_type: String,
    rank_type: String,
    id: String,
}
#[tauri::command]
pub async fn prepare(state: State<'_, GenshinState>) -> Result<String, Error> {
    let tmp = match find_game_data_dir() {
        None => {
            return Err(Other("无法找到游戏目录".to_string()));
        }
        Some(data) => data,
    };
    let path = tmp.as_path();
    let url = match find_recent_gacha_url(path) {
        None => {
            return Err(Other("无法找到祈愿链接".to_string()));
        }
        Some(data) => data.url,
    };
    // println!("{}",url);
    let response = reqwest::get(&url).await?.text().await?;
    let result: serde_json::error::Result<GenshinResponse<GenshinData>> =
        serde_json::from_str(&response);
    let uid: String = match result {
        Ok(mut data) => {
            //println!("{}", response);
            data.data.list.pop().unwrap().uid
        }
        Err(_) => {
            return Err(Other("祈愿链接已过期".to_string()));
        }
    };
    let raw_url = url.split("&gacha_type").next().unwrap().to_owned();
    let re = Regex::new("&lang=.*?&").unwrap();
    let raw_url = re.replace(&raw_url, "&lang=zh-cn&").to_string();
    let mut path = std::env::current_exe().unwrap();
    path.pop();
    path.push(uid.clone());
    let db = sqlite::open(path)?;
    let mut init_sql=String::from("PRAGMA foreign_keys=ON;CREATE TABLE IF NOT EXISTS item_list (item_id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,'type' INTEGER NOT NULL,'rank' INTEGER NOT NULL);");
    for item in WISHES {
        init_sql.push_str(&format!("CREATE TABLE IF NOT EXISTS {} (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));",item.table_name));
    }
    db.execute(init_sql).unwrap();
    *state.db.lock().await = Some(db);
    *state.raw_url.lock().await = raw_url;
    Ok(uid)
}

#[tauri::command]
pub async fn get_wishes(window: Window, state: State<'_, GenshinState>) -> Result<(), Error> {
    let mut ends = [0i64; 4];
    {
        let connection = state.db.lock().await;
        let connection = connection.as_ref().unwrap();
        let get_end_id = |str: &str| {
            let mut statement = connection
                .prepare(format!("SELECT id from {} order by id DESC LIMIT 1;", str))
                .unwrap();
            statement.next().unwrap();
            statement.read::<i64, _>("id").unwrap()
        };
        for (index, item) in WISHES.iter().enumerate() {
            ends[index] = get_end_id(&item.table_name);
        }
    }
    let string = state.raw_url.lock().await.clone();
    let str = Arc::new(string);
    let window = Arc::new(window);
    for (index, item) in WISHES.iter().enumerate() {
        let db = Arc::clone(&state.db);
        let window = Arc::clone(&window);
        let strlc = Arc::clone(&str);
        get_wish(db, strlc, window, item, ends[index]).await?;
    }
    Ok(())
}

async fn get_wish(
    locker: Arc<Mutex<Option<Connection>>>,
    raw_url: Arc<String>,
    window: Arc<Window>,
    wish_type: &WishType,
    last: i64,
) -> Result<(), Error> {
    let gacha_type = wish_type.gacha_type;
    let table_name = wish_type.table_name;
    let mut page = 1;
    let mut end_id = String::from("0");
    let mut data: Vec<GenshinItem> = vec![];
    let gacha_name = wish_type.gacha_name;
    'outer: loop {
        sleep(Duration::from_millis(100)).await;
        window.emit("wish", format!("正在获取 {} 第{}页", gacha_name, page))?;
        let url = format!(
            "{}&gacha_type={}&page={}&size=20&end_id={}",
            raw_url, gacha_type, page, end_id
        );
        let result = reqwest::get(url).await?.text().await?;
        //println!("{}\n", result);
        let result: GenshinResponse<GenshinData> = serde_json::from_str(&result).unwrap();
        let list = result.data.list;
        let total = list.len();
        if total == 0 {
            break;
        }
        end_id = list.last().unwrap().id.clone();
        for item in list {
            if item.id.parse::<i64>().unwrap() > last {
                data.push(item);
            } else {
                break 'outer;
            }
        }
        page += 1;
        if total < 20 {
            break;
        }
    }
    let connection = locker.lock().await;
    let connection = connection.as_ref().unwrap();
    write_database(connection, data, table_name)?;
    println!("{} ok", table_name);
    Ok(())
}

fn write_database(
    connection: &Connection,
    items: Vec<GenshinItem>,
    table_name: &str,
) -> Result<(), Error> {
    connection.execute("BEGIN TRANSACTION;")?;
    for item in items.iter().rev() {
        let mut statement = connection.prepare(format!(
            "select item_id,name from item_list where name='{}';",
            &item.name
        ))?;
        statement.next().unwrap();
        let mut item_id = statement.read::<i64, _>("item_id")?;
        if item_id == 0 {
            let mut item_type = 0; //0代表武器,1代表角色
            if &item.item_type == "角色" {
                item_type = 1;
            }
            connection.execute(format!(
                "INSERT INTO item_list(name,'type','rank') VALUES('{}',{},{});",
                &item.name, item_type, &item.rank_type
            ))?;
            statement = connection.prepare(format!(
                "select item_id,name from item_list where name='{}';",
                &item.name
            ))?;
            statement.next()?;
            item_id = statement.read::<i64, _>("item_id")?;
        }
        connection.execute(format!(
            "INSERT INTO {} VALUES({},'{}',{})",
            table_name, item_id, &item.time, &item.id
        ))?;
    }
    connection.execute("END TRANSACTION;")?;
    Ok(())
}
