use crate::commands::{State, GenshinState, Arc, Mutex, Connection, Deserialize};
use crate::genshin::{find_game_data_dir, find_recent_gacha_url};
use tokio::time::{sleep, Duration};

#[derive(Deserialize)]
struct GenshinResponse<T> {
    retcode: i8,
    message: String,
    data: T,
}

#[derive(Deserialize)]
struct GenshinData {
    page: String,
    size: String,
    total: String,
    list: Vec<GenshinItem>,
    region: String,
}

#[derive(Deserialize)]
struct GenshinItem {
    uid: String,
    gacha_type: String,
    item_id: String,
    count: String,
    time: String,
    name: String,
    lang: String,
    item_type: String,
    rank_type: String,
    id: String,
}
#[tauri::command]
pub async fn prepare(state: State<'_, GenshinState>) -> Result<String, ()> {
    let tmp = match find_game_data_dir() {
        None => { return Ok("无法找到原神目录".to_string()); }
        Some(data) => { data }
    };
    let path = tmp.as_path();
    let url = match find_recent_gacha_url(path) {
        None => { return Ok("无法找到祈愿链接".to_string()); }
        Some(data) => { data.url }
    };
    // println!("{}",url);
    let response = reqwest::get(&url).await.unwrap().text().await.unwrap();
    let result: serde_json::error::Result<GenshinResponse<GenshinData>> = serde_json::from_str(&response);
    let uid: String = match result {
        Ok(mut data) => {
            println!("{}", response);
            data.data.list.pop().unwrap().uid
        }
        Err(_) => { return Ok("祈愿链接已过期".to_string()); }
    };
    let raw_url = url.split("&gacha_type").next().unwrap().to_owned();
    let mut path = std::env::current_exe().unwrap();
    path.pop();
    path.push(uid.clone());
    let db = sqlite::open(path).unwrap();
    db.execute("PRAGMA foreign_keys=ON;CREATE TABLE IF NOT EXISTS item_list (item_id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,'type' INTEGER NOT NULL,'rank' INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS character_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));CREATE TABLE IF NOT EXISTS weapon_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));CREATE TABLE IF NOT EXISTS standard_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));").unwrap();
    *state.db.lock().await = Some(db);
    *state.raw_url.lock().await = raw_url;
    Ok(uid)
}

#[tauri::command]
pub async fn get_wishes(state: State<'_, GenshinState>) -> Result<String, ()> {
    let mut end_id_character = 0;
    let mut end_id_weapon = 0;
    let mut end_id_standard = 0;
    {
        let connection = state.db.lock().await;
        let connection = connection.as_ref().unwrap();
        let get_end_id = |str: &str| {
            let mut statement = connection.prepare(format!("SELECT id from {} order by id DESC LIMIT 1;", str)).unwrap();
            statement.next().unwrap();
            statement.read::<i64, _>("id").unwrap()
        };
        end_id_character = get_end_id("character_wish");
        end_id_weapon = get_end_id("weapon_wish");
        end_id_standard = get_end_id("standard_wish");
    }
    let tmp = state.raw_url.lock().await.clone();
    let string = String::from(&tmp);
    let strl = Arc::new(string);
    let strlc1 = Arc::clone(&strl);
    let strlc2 = Arc::clone(&strl);
    let dbl1 = Arc::clone(&state.db);
    let dbl2 = Arc::clone(&state.db);
    let dbl3 = Arc::clone(&state.db);
    get_wish(dbl1,strl,"301","character_wish",end_id_character).await;
    get_wish(dbl2,strlc1,"302","weapon_wish",end_id_weapon).await;
    get_wish(dbl3,strlc2,"200","standard_wish",end_id_standard).await;
    Ok("".to_string())
}

async fn get_wish(
    locker: Arc<Mutex<Option<Connection>>>,
    raw_url: Arc<String>,
    gacha_type: &str,
    table_name: &str,
    last: i64) {
    let mut page = 1;
    let mut end_id = String::from("0");
    let mut data: Vec<GenshinItem> = vec![];
    'outer: loop {
        sleep(Duration::from_millis(200)).await;
        let url = format!("{}&gacha_type={}&page={}&size=20&end_id={}", raw_url, gacha_type, page, end_id);
        let result = reqwest::get(url).await.unwrap().text().await.unwrap();
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
    let connection=locker.lock().await;
    let connection=connection.as_ref().unwrap();
    write_database(connection,data,table_name);
    println!("{} ok",table_name);
}

fn write_database(connection: &Connection, items: Vec<GenshinItem>, table_name: &str) {
    for item in items.iter().rev() {
        let mut statement = connection.prepare(format!("select item_id,name from item_list where name='{}';", &item.name)).unwrap();
        statement.next().unwrap();
        let mut item_id = statement.read::<i64, _>("item_id").unwrap();
        if item_id == 0 {
            let mut item_type = 0;//0代表武器,1代表角色
            if &item.item_type == "角色" {
                item_type = 1;
            }
            connection.execute(format!("INSERT INTO item_list(name,'type','rank') VALUES('{}',{},{});", &item.name, item_type, &item.rank_type)).unwrap();
            statement = connection.prepare(format!("select item_id,name from item_list where name='{}';", &item.name)).unwrap();
            statement.next().unwrap();
            item_id = statement.read::<i64, _>("item_id").unwrap();
        }
        connection.execute(format!("INSERT INTO {} VALUES({},'{}',{})", table_name, item_id, &item.time, &item.id)).unwrap();
    }
}
