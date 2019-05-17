$(document).ready(function () {
	alert('Hello, Summer Coding 2019!!!');
	var system_log = 'Hello, Summer Coding 2019'; // ajax 결과 시스템 로그

	// 모든 Todo_List의 정보 가져오기
	var init = function(data) {
			var todo_all = data["todo_all"];

			todo_all.sort(function(a, b) { // 내림차순 정렬
    			return b["priority"] - a["priority"];
			});

			var todo_all_html = '';
			var all_alarm = '';

			var count = 0;
			for (var index in todo_all) {
				// 여기는 todo 항목 처리
				if (todo_all[index]["deadline"] == null)
					todo_all[index]["deadline"] = "";

				item_html = '<li class="todo_item" id="' + todo_all[index]["id"] + '">'
					+ '<div class="todo_item_top">'
					+ '<div class="priority_btn">'
					+ '<input type="button" class="up" name="up">'
					+ '<input type="button" class="down" name="down">'
					+ '</div>'
					+ '<input type="text" class="title" name="title" value="' + todo_all[index]["title"]  + '" placeholder="( 제목 )">'
					+ '<div class="todo_item_right">'
					+ '<input type="text" class="deadline" name="deadline" value= "' + todo_all[index]["deadline"] + '" placeholder = "날짜 없음">'
					+ '<div class="right_btn">'
					+ '<input type="button" class="complete" name="complete">'
					+ '<input type="button" class="delete" name="delete">'
					+ '</div>' + '</div>' + '</div>'
					+ '<div class="content_box">'
					+ '<textarea class="content" name="content" value="' + todo_all[index]["content"] + '" placeholder="( 내용 )" maxlength="2000"></textarea>'
					+ '</li>';

				todo_all_html += item_html;

				// 여기는 알람 처리
				if (todo_all[index]["deadline"])
				{
					var datetime = new Date(todo_all[index]["deadline"]);
					if (datetime < new Date())
					{
						alarm_item_html = '<li class="alarm_item" id="' 
							+ todo_all[index]['id'] + '">! '
							+ todo_all[index]['title'] + '</li>';
					}
				}
				else
					alarm_item_html ='';

				all_alarm += alarm_item_html;
			}

			$("#todo_list").html(todo_all_html);
			$("#alarm_list").html(all_alarm);
			
			$("#log").text(system_log)
			
/*---------------------------------------------------------------------------*/
			// 여기부터는 함수 정의
			$('.delete').click(function (){
				var item_id = Number($(this).parents('.todo_item').attr('id'));
				$.ajax({
					url: '/todo/' + item_id,
					type: 'DELETE',
					dataType: 'text',
					success: function(){
						system_log = '성공적으로 삭제되었습니다.';
					},
					complete: ajax_init
				});

			});

			$('.todo_item').on({
				focusin: function() {
					
				}
			});

	};


	// Init webpage
	var ajax_init = function() {
		$.ajax({
			url: '/todo/all',
			type: 'GET',
			dataType:'json',
			success: init,
		});
	};

	$.ajaxSetup({
		error: function(request) {
			system_log = "처리 도중 오류가 발생하였습니다.";
			$("#log").text(system_log);
			alert('Error!! \n'
				+ 'code: ' + request.status
				+ '\nmessage: ' + request.responseText);
		}
	});

	// Init webpage
	$.ajax({
		url: '/todo/all',
		type: 'GET',
		dataType:'json',
		success: init,
		complete: function(){
			$("#post_title").focus();
		}
	});

	$("#update").click(function() {
		system_log = '갱신되었습니다.';
		ajax_init();
	});

	$("#post_btn").click(function() {
		var new_title = $("#post_title").val();

		$.ajax({
			url: '/todo',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({
				"title": new_title,
				"content": ''
			}),
			contentType:"application/json; charset=UTF-8",
			success: function() {
				system_log = '성공적으로 추가되었습니다.';
				$("#post_title").val('');
			},
			complete: ajax_init
		});
	});

});
