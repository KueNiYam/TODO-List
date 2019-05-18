from flask import Flask, jsonify, request, current_app, render_template
from sqlalchemy import create_engine
from todo_dao import TodoDao

def create_app(db_config = None):
    app = Flask(__name__)

    if db_config is None:
        app.config.from_pyfile("config.py")
    else:
        app.config.update(db_config)

    database = create_engine(app.config['DB_URL'], encoding = 'utf-8', max_overflow = 0)
    app.database = database

    todoDao = TodoDao(database)

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/ping', methods=['GET'])
    def ping():
        todoDao.select_one()
        return 'pong'

    @app.route('/todo/all', methods=['GET'])
    def get_todo_all():
        """
        모든 todo에 대한 데이터 전송
        """

        return jsonify({
            'todo_all': todoDao.select_todo_all()
        })

    @app.route('/todo', methods=['POST'])
    def post_todo_item():
        """
        요청 받은 데이터를 todo 항목 추가

        :request.json: 'title', 'content', ('deadline')
        :return: 추가한 데이터('id', 'title', 'content', 'deadline', 'priority')
        """
        new_item = request.json
        if not new_item:
            return 'Error: required key - "title", "content", ("deadline")', 400

        required = ['title', 'content']
        if not all(key in new_item for key in required):
            return 'Error: required key - "title", "content", ("deadline")', 400

        if 'deadline' not in new_item:
            new_item['deadline'] = None

        rowcount, lastrowid = todoDao.insert_todo_item(new_item)

        if rowcount == 1:
            return jsonify(todoDao.select_todo_item(lastrowid))
        elif rowcount == 0:
            return 'Error: Insert fail', 400
        else:
            return 'Error: Many tuple inserted', 500

    @app.route('/todo/<int:id>', methods=['PUT'])
    def put_todo_item(id):
        """
        요청 받은 todo 항목을 수정(완료 포함)

        :request.json: 'title', 'content', 'priority', ('deadline')
        """
        new_item = request.json

        if not new_item:
            return 'Error: required key - "title", "content", "priority",("deadline")', 400


        required = ['title', 'content', 'priority']
        if not all(key in new_item for key in required):
            return 'Error: required key - "title", "content", "priority", ("deadline")', 400

        new_item['id'] = id

        if 'deadline' not in new_item:
            new_item['deadline'] = None

        rowcount = todoDao.update_todo_item(new_item)
        if rowcount == 1:
            return jsonify(todoDao.select_todo_item(id))
        elif rowcount == 0:
            return 'Error: Update fail', 400
        else:
            return 'Error: Many tuple updated', 500

    @app.route('/todo/<int:id>', methods=['DELETE'])
    def delete_todo_item(id):
        """
        요청 받은 todo 항목을 제거
        """

        rowcount = todoDao.delete_todo_item(id)
        if rowcount == 1:
            return '삭제되었습니다.', 200
        elif rowcount == 0:
            return 'Error: Delete fail', 400
        else:
            return 'Error: Many tuple deleted', 500

    @app.route('/todo/priority', methods=['POST'])
    def change_todo_priority():
        """
        요청 받은 두 todo 항목의 priority를 swap

        request.json = {
            "item_1": { "id":value, "priority":value },
            "item_2": { "id":value, "priority":value }
        }

         - 이 로직은 무결성이 침해될 여지가 있다. 나중에 더 좋은 로직을 알아보아야 겠다.
        """
        item_1 = request.json['item_1']
        item_2 = request.json['item_2']

        if item_1['priority'] < 0 or item_2['priority'] < 0:
            return '완료된 항목은 변경할 수 없습니다.', 400

        rowcount = todoDao.swap_todo_priority(item_1, item_2)
        if rowcount == 2:
            return '우선순위가 조정되었습니다.', 200
        elif rowcount == 0:
            return 'Error: Swap fail', 400
        else:
            return 'Error: only one value modified', 500

    return app

