from flask import Flask, jsonify, request, current_app
from sqlalchemy import create_engine, text

def select_todo_all():
    todo_all = current_app.database.execute(text("""
        SELECT
            id,
            title,
            content,
            deadline,
            is_completed,
            priority
        FROM todo_list
    """), {}).fetchall()

    return [{
            'id': item['id'],
            'title': item['title'],
            'content': item['content'],
            'deadline': item['deadline'],
            'is_completed': item['is_completed'],
            'priority': item['priority']
        } for item in todo_all]

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
    def get_todo_all():
        """
        모든 todo에 대한 데이터 전송
        """

        return jsonify({
            'todo_all':select_todo_all()
        })

    @app.route('/todo', methods=['POST'])
    def post_todo_item():
        """
        요청 받은 데이터를todo 항목 추가
        """
        # 구현 예정
        pass

    @app.route('/todo/<int:id>', methods=['PUT'])
    def put_todo_item(id):
        """
        요청 받은 todo 항목을 수정(완료 포함)
        """
        # 구현 예정
        pass

    @app.route('/todo/<int:id>', methods=['DELETE'])
    def delete_todo_item(id):
        """
        요청 받은 todo 항목을 제거
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
