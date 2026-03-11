import sqlite3
import datetime

def create_database():
    # Connect to SQLite (this will create the file if it doesn't exist)
    conn = sqlite3.connect('train_delays.db')
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute('PRAGMA foreign_keys = ON')

    # 1. Create Stations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stations (
        station_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        line_name TEXT NOT NULL,
        prefecture TEXT NOT NULL
    )
    ''')

    # 2. Create Delay Causes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS delay_causes (
        cause_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        description TEXT NOT NULL
    )
    ''')

    # 3. Create Delay Incidents table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS delay_incidents (
        incident_id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id INTEGER NOT NULL,
        cause_id INTEGER NOT NULL,
        occurred_at DATETIME NOT NULL,
        delay_minutes INTEGER NOT NULL,
        details TEXT,
        FOREIGN KEY (station_id) REFERENCES stations(station_id),
        FOREIGN KEY (cause_id) REFERENCES delay_causes(cause_id)
    )
    ''')
    
    # Insert sample data for Stations
    stations_data = [
        ('Shinjuku', 'Yamanote Line', 'Tokyo'),
        ('Tokyo', 'Chuo Line', 'Tokyo'),
        ('Yokohama', 'Tokaido Line', 'Kanagawa'),
        ('Omiya', 'Saikyo Line', 'Saitama'),
        ('Shinagawa', 'Keihin-Tohoku Line', 'Tokyo')
    ]
    cursor.executemany('INSERT INTO stations (name, line_name, prefecture) VALUES (?, ?, ?)', stations_data)

    # Insert sample data for Causes
    causes_data = [
        ('Human', 'Passenger injury / illness'),    # 急病人
        ('Human', 'Trespassing on tracks'),          # 線路立ち入り
        ('Technical', 'Signal failure'),             # 信号トラブル
        ('Technical', 'Vehicle breakdown'),          # 車両故障
        ('Weather', 'Heavy rain / Typhoon'),         # 大雨・台風
        ('Animal', 'Deer collision')                 # 鹿との衝突
    ]
    cursor.executemany('INSERT INTO delay_causes (category, description) VALUES (?, ?)', causes_data)

    # Insert sample data for Incidents
    now = datetime.datetime.now()
    incidents_data = [
        (1, 1, now - datetime.timedelta(days=1, hours=2), 15, 'Medical emergency on platform 2'),
        (2, 3, now - datetime.timedelta(days=2, hours=5), 45, 'Signal system malfunction near station'),
        (4, 2, now - datetime.timedelta(days=3), 20, 'Person entered tracks'),
        (3, 4, now - datetime.timedelta(hours=12), 30, 'Train car door issue'),
        (5, 5, now - datetime.timedelta(days=5), 120, 'Suspended due to heavy rain'),
    ]
    cursor.executemany('''
    INSERT INTO delay_incidents (station_id, cause_id, occurred_at, delay_minutes, details) 
    VALUES (?, ?, ?, ?, ?)
    ''', incidents_data)

    conn.commit()
    conn.close()
    
    print("Database 'train_delays.db' has been created successfully with sample data!")

if __name__ == '__main__':
    create_database()
