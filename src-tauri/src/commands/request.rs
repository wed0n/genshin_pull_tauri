use crate::commands::{State, GenshinState, Error, Error::Other, Arc, Mutex, Connection, Deserialize, WishType, CHARACTER_WISH, WEAPON_WISH, STANDARD_WISH};
use crate::genshin::{find_game_data_dir, find_recent_gacha_url};
use tokio::time::{sleep, Duration};
use regex::Regex;
use tauri::Window;

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
pub async fn prepare(state: State<'_, GenshinState>) -> Result<String, Error> {
    let tmp = match find_game_data_dir() {
        None => { return Err(Other("无法找到游戏目录".to_string())); }
        Some(data) => { data }
    };
    let path = tmp.as_path();
    let url = match find_recent_gacha_url(path) {
        None => { return Err(Other("无法找到祈愿链接".to_string())); }
        Some(data) => { data.url }
    };
    // println!("{}",url);
    let response = reqwest::get(&url).await?.text().await?;
    let result: serde_json::error::Result<GenshinResponse<GenshinData>> = serde_json::from_str(&response);
    let uid: String = match result {
        Ok(mut data) => {
            //println!("{}", response);
            data.data.list.pop().unwrap().uid
        }
        Err(_) => { return Err(Other("祈愿链接已过期".to_string())); }
    };
    let raw_url = url.split("&gacha_type").next().unwrap().to_owned();
    let re=Regex::new("&lang=.*?&").unwrap();
    let raw_url=re.replace(&raw_url,"&lang=zh-cn&").to_string();
    let mut path = std::env::current_exe().unwrap();
    path.pop();
    path.push(uid.clone());
    let db = sqlite::open(path)?;
    db.execute("PRAGMA foreign_keys=ON;CREATE TABLE IF NOT EXISTS item_list (item_id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,'type' INTEGER NOT NULL,'rank' INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS character_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));CREATE TABLE IF NOT EXISTS weapon_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));CREATE TABLE IF NOT EXISTS standard_wish (item_id INTEGER NOT NULL,time TEXT(19) NOT NULL,id INTEGER PRIMARY KEY NOT NULL,CONSTRAINT FK FOREIGN KEY (item_id) REFERENCES item_list(item_id));").unwrap();
    *state.db.lock().await = Some(db);
    *state.raw_url.lock().await = raw_url;
    Ok(uid)
}

#[tauri::command]
pub async fn get_wishes(window: Window, state: State<'_, GenshinState>) -> Result<(), Error> {
    let end_id_character:i64;
    let end_id_weapon:i64;
    let end_id_standard:i64;
    {
        let connection = state.db.lock().await;
        let connection = connection.as_ref().unwrap();
        let get_end_id = |str: &str|{
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
    let window1=Arc::new(window);
    let window2=Arc::clone(&window1);
    let window3=Arc::clone(&window1);
    get_wish(dbl1,strl,window1,&CHARACTER_WISH,end_id_character).await?;
    get_wish(dbl2,strlc1,window2,&WEAPON_WISH,end_id_weapon).await?;
    get_wish(dbl3,strlc2,window3,&STANDARD_WISH,end_id_standard).await?;
    Ok(())
}

async fn get_wish(
    locker: Arc<Mutex<Option<Connection>>>,
    raw_url: Arc<String>,
    window: Arc<Window>,
    wish_type:&WishType,
    last: i64)->Result<(),Error>{
    let gacha_type=wish_type.gacha_type;
    let table_name=wish_type.table_name;
    let mut page = 1;
    let mut end_id = String::from("0");
    let mut data: Vec<GenshinItem> = vec![];
    let gacha_name =wish_type.gacha_name;
    'outer: loop {
        sleep(Duration::from_millis(100)).await;
        window.emit("wish",format!("正在获取 {} 第{}页", gacha_name, page))?;
        let url = format!("{}&gacha_type={}&page={}&size=20&end_id={}", raw_url, gacha_type, page, end_id);
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
    let connection=locker.lock().await;
    let connection=connection.as_ref().unwrap();
    write_database(connection,data,table_name)?;
    println!("{} ok",table_name);
    Ok(())
}

fn write_database(connection: &Connection, items: Vec<GenshinItem>, table_name: &str)->Result<(),Error> {
    for item in items.iter().rev() {
        let mut statement = connection.prepare(format!("select item_id,name from item_list where name='{}';", &item.name))?;
        statement.next().unwrap();
        let mut item_id = statement.read::<i64, _>("item_id")?;
        if item_id == 0 {
            let mut item_type = 0;//0代表武器,1代表角色
            if &item.item_type == "角色" {
                item_type = 1;
            }
            connection.execute(format!("INSERT INTO item_list(name,'type','rank') VALUES('{}',{},{});", &item.name, item_type, &item.rank_type))?;
            statement = connection.prepare(format!("select item_id,name from item_list where name='{}';", &item.name))?;
            statement.next()?;
            item_id = statement.read::<i64, _>("item_id")?;
        }
        connection.execute(format!("INSERT INTO {} VALUES({},'{}',{})", table_name, item_id, &item.time, &item.id))?;
    }
    Ok(())
}