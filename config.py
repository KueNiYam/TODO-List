"""
데이터베이스 연결 정보

보안적인 측면에서는 깃허브 리포지터리에 올리지 않는 것이 좋지만, 본 프로젝트에서는 편의상 불필요한 복잡성을 줄이도록 하기 위해 올리도록 한다.
"""
import os

db = {
    'user' : 'root',
    'password': os.getenv('MYSQL_PW'), # 보안적인 이유로 환경변수를 이용한다.
    'host': 'summer-coding.cchdlqgo01pf.ap-northeast-2.rds.amazonaws.com',
    'port': 3306,
    'database': 'summercoding'
}

DB_URL = f"mysql+mysqlconnector://{db['user']}:{db['password']}@{db['host']}:{db['port']}/{db['database']}?charset=utf8"
