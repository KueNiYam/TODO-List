from sqlalchemy import text

class TodoDao:
    def __init__(self, database):
        self.db = database

    def select_todo_all(self):
        todo_all = self.db.execute(text("""
            SELECT
                id,
                title,
                content,
                deadline,
                priority
            FROM todo_list
        """)).fetchall()

        return [{
                'id': item['id'],
                'title': item['title'],
                'content': item['content'],
                'deadline': item['deadline'],
                'priority': item['priority']
        } for item in todo_all]

    def select_todo_item(self, item_id):
        item = self.db.execute(text("""
        SELECT
            id,
            title,
            content,
            deadline,
            priority
        FROM todo_list
        WHERE id = :id
        """), {'id': item_id}).fetchone()

        return {
            'id': item['id'],
            'title': item['title'],
            'content': item['content'],
            'deadline': item['deadline'],
            'priority': item['priority']
        } if item else None

    def insert_todo_item(self, new_item):
        result = self.db.execute(text("""
            INSERT INTO todo_list(
                title,
                content,
                deadline,
                priority
            ) VALUES(
                :title,
                :content,
                :deadline,
                (
                SELECT IFNULL(MAX(priority)+1, 0)
                FROM todo_list t
                )
            )
        """), new_item)

        return result.rowcount, result.lastrowid

    def update_todo_item(self, new_item):
        result = self.db.execute(text("""
            UPDATE todo_list
            SET
                title = :title,
                content = :content,
                deadline = :deadline,
                priority = :priority
            WHERE
                id = :id
            """), new_item)

        return result.rowcount

    def delete_todo_item(self, item_id):
        result = self.db.execute(text("""
            DELETE FROM todo_list
            WHERE id = :id
            """), {'id': item_id})

        return result.rowcount

    def swap_todo_priority(self, item_1, item_2):
        param = {
           'id_1': item_1['id'],
           'id_2': item_2['id'],
           'priority_1': item_1['priority'],
           'priority_2': item_2['priority']
        }

        # THEN 절 뒤에 서브 쿼리를 이용하여 SELECT 하는 방법도 생각해 보았지만 오류가 발생한다.
        result = self.db.execute(text("""
            UPDATE todo_list t
            SET
                t.priority = CASE
                    WHEN t.id = :id_1 THEN :priority_2
                    WHEN t.id = :id_2 THEN :priority_1
                END
            WHERE t.id in (:id_1, :id_2)
        """), param)

        return result.rowcount
