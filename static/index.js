$(document).ready(function () {
	var system_log = 'Hello, Summer Coding 2019'; // ajax 결과 시스템 로그

	// 모든 Todo_List의 정보 가져오기
	var init = function(data) {
			var todo_all = data["todo_all"];

			todo_all.sort(function(a, b) { // 내림차순 정렬
    			return b["priority"] - a["priority"];
			});

			var todo_all_html = ''; // complete된 것 제외
			var all_alarm = '';

			var count = 0;
			for (var index in todo_all) {
				// 여기는 todo 항목 처리
				if (todo_all[index]["deadline"] == null)
					todo_all[index]["deadline"] = "";
				
				var datetime = new Date(todo_all[index]["deadline"]);
				var date_format = pad(datetime.getFullYear(), 4) + '-' + pad((datetime.getMonth()+1), 2) + '-' + pad(datetime.getDate(), 2) + 'T' + pad(datetime.getHours(), 2) + ':' + pad(datetime.getMinutes(), 2) + ':' + pad(datetime.getSeconds(), 2);

				item_html = '<li class="todo_item" id="' + todo_all[index]["id"] + '" value ="'+ todo_all[index]["priority"] + '" ';
				if (todo_all[index]['priority'] < 0)
					item_html += 'style="opacity:0.4"';

				item_html += '>'
					+ '<div class="todo_item_top">'
					+ '<div class="priority_btn">'
					+ '<input type="button" class="up" name="up">'
					+ '<input type="button" class="down" name="down">'
					+ '</div>'
					+ '<input type="text" class="title" name="title" value="' + todo_all[index]["title"]  + '" placeholder="( 제목 )" maxlength="255">'
					+ '<div class="todo_item_right">'
					+ '<input type="datetime-local" class="deadline" name="deadline" value= "' + date_format + '">'
					+ '<div class="right_btn">'
					+ '<input type="button" class="complete" name="complete">'
					+ '<input type="button" class="delete" name="delete">'
					+ '</div>' + '</div>' + '</div>'
					+ '<div class="content_box">'
					+ '<textarea class="content" name="content" placeholder="( 내용 )" maxlength="2000">' + todo_all[index]['content'] + '</textarea>'
					+ '</li>';

					todo_all_html += item_html;

				// 여기는 알람 처리
				var alarm_item_html = '';

				if (todo_all[index]["deadline"])
				{
					if (datetime < new Date() && todo_all[index]['priority'] >= 0 )
					{
						alarm_item_html = '<li class="alarm_item" id="' 
							+ todo_all[index]['id'] + '">! '
							+ todo_all[index]['title'] + '</li>';
					}
				}

				all_alarm += alarm_item_html;

				alarm_item_html ='';
			}

			$("#todo_list").html(todo_all_html);
			$("#alarm_list").html(all_alarm);		
			$("#log").text(system_log)
				
/*---------------------------------------------------------------------------*/
			// DELETE
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

/*---------------------------------------------------------------------------*/
			// UPDATE & MOUSEEVENT
			var update_item = function() {
				var item_id = Number($(this).attr('id'));			
	
				$.ajax({
					url:'/todo/' + item_id,
					type: 'PUT',
					datatype: 'json',
					contentType:"application/json; charset=UTF-8",
					data: JSON.stringify({
						'title': $(this).find('.title').val(),
						'content': $(this).find('.content').val(),
						'deadline': new Date($(this).find('.deadline').val()),
						'priority': $(this).val()
					}),
					success: function() {
						system_log = '변경사항이 성공적으로 저장되었습니다.';
						$("#log").text(system_log)
					},
				});
			};

			$('.todo_item').on({
				mouseenter: function() {
					$(this).children('.content_box').css('display', 'block');
				},
				mouseleave: function() {
					$(this).children('.content_box').css('display', 'none');
				},
				focusout: update_item
			});

			$('.content').on({
				focusin: function() {
					$(this).parents('.todo_item').off('mouseleave');
				},
				focusout: function(){
					$(this).parents('.content_box').css('display', 'none');
					$(this).parents('.todo_item').on({
						mouseleave: function() {
							$(this).children('.content_box').css('display', 'none');
						}
					})
				}
			});
/*---------------------------------------------------------------------------*/
			// COMPLETE
			$('.complete').on('click', function() {
				var item = $(this).parents('.todo_item');
				
				// 완료된 경우 제외	
				if (item.val() < 0)
					return;
				
				$.ajax({
					url:'/todo/' + item.attr('id'),
					type: 'PUT',
					datatype: 'json',
					contentType:"application/json; charset=UTF-8",
					data: JSON.stringify({
						'title': item.find('.title').val(),
						'content': item.find('.content').val(),
						'deadline': new Date(item.find('.deadline').val()),
						'priority': -1
					}),
					success: function() {
						system_log = '성공적으로 "할 일 완료" 처리 되었습니다.';
					},
					complete: ajax_init
				});
			});
/*---------------------------------------------------------------------------*/
			// SWAP

			var swap_ajax = function() {
				$.ajax({
					url: '/todo/priority',
					type: 'POST',
					contentType:"application/json; charset=UTF-8",
					data: JSON.stringify({"item_1": item_1, "item_2": item_2}),
					success: function() {
						system_log = "우선순위가 조정되었습니다.";
					},
					complete: ajax_init
				}); 
			};

			$('.up').off();
			$('.down').off();

			$('.up').on('click', function() {
				var item = $(this).parents('.todo_item');

				// 완료된 경우 제외
				if (item.val() < 0)
					return;

				var item_id = item.attr('id');
				var todo_list = $('#todo_list');

				var items = todo_list.find('.todo_item');
				var index = 0;

				for (var i in items) {
					if (items.eq(i).attr('id') == item_id)
					{
						index = i;
						break;
					}
				}

				if (index == 0)
					return;

				if (items.eq(index).attr('id') != item_id)
					return;

				item_1 = {"id": item_id, "priority": item.val()};
				item_2 = {"id": items.eq(index-1).attr('id'), "priority": items.eq(index-1).val()};

				swap_ajax();
			});

			$('.down').on('click', function() {
				var item = $(this).parents('.todo_item');

				// 완료된 경우 제외
				if (item.val() < 0)
					return;

				var item_id = item.attr('id');
				var todo_list = $('#todo_list');

				var items = todo_list.find('.todo_item');
				var index = 0;

				for (var i in items) {
					if (items.eq(i).attr('id') == item_id)
					{
						index = i;
						break;
					}
				}

				if (index == items.length - 1)
					return;

				if (items.eq(index).attr('id') != item_id)
					return;

				if (items.eq(Number(index)+1).val() < 0)
					return;

				item_1 = {"id": item_id, "priority": item.val()};
				item_2 = {"id": items.eq(Number(index)+1).attr('id'), "priority": items.eq(Number(index)+1).val()};

				swap_ajax();
			});


	};


	// Init webpage function
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

// return yyyy-MM-ddThh:mm
function pad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}
