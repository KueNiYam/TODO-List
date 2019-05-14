from flask import Flask, jsonify, request
from sqlalchemy import create_engine, text

def create_app(db_config = None):
    app = Flask(__name__)

    if db_config is None:
        app.config.from_pyfile("config.py")
    else:
        app.config.update(db_config)

    database = create_engine(app.config['DB_URL'], encoding = 'utf-8', max_overflow = 0)
    app.database = database

    @app.route('/ping', methods=['GET'])
    def ping():
        return 'pong'

    @app.route('/')
    def index():
        """
        메인화면 렌더링
        """
        # 구현 예정
        pass

    @app.route('/todo/all', methods=['GET'])
    def get_todo():
        """
        모든 todo에 대한 데이터 전송
        """
        # 구현 예정
        pass

    @app.route('/todo', methods=['POST'])
    def post_todo():
        """
        todo 항목에 대해
        1. 추가
        2. 수정
        3. 완료
        4. 삭제
        """
        # 구현 예정
        pass

    @app.route('/todo/priority', methods=['POST'])
    def change_todo_priority():
        """
        요청 받은 두 todo 항목의 priority를 swap
        """
        # 구현 예정
        pass

    return app
