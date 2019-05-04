var mode = 'normal'; // 콘텐츠 모드
// normal : 일반

var isMobile; // 모바일 기기인지의 여부
var currentPage = jQuery(location).attr('pathname').slice(-10); // 형태 :: 00_00.html;
var htmlChasi = parseInt(currentPage.substr(0,2)); // 형태 :: 0, 차시 번호
var htmlPage = parseInt(currentPage.substr(3,2)); // 형태 :: 0, 현재 페이지 번호
var prevPageURL = './' + pagingURL(htmlChasi, false, true) + '_' + pagingURL(htmlPage, false, false) + '.html'; // 형태 :: ./00_00.html, 이전 페이지의 파일명
var nextPageURL = './' + pagingURL(htmlChasi, true, true) + '_' + pagingURL(htmlPage, true, false) + '.html'; // 형태 :: ./00_00.html, 다음 페이지의 파일명
var intervalMs = 30; // 인터벌의 실행 간격
var volSave; // 음소거 이전의 볼륨값 저장
var con_w = 1000; // 콘텐츠의 기준 가로 사이즈 (scale 조절에 쓰임)
var con_h = 660; // 콘텐츠의 기준 세로 사이즈 (scale 조절에 쓰임)
var con_scale = 1; // 콘텐츠의 scale
var mediaURL; // 메인 미디어의 경로

// 컨트롤 변수 
var mainInterval; // 실시간 메인 인터벌
var mediaCondition = ''; // 메인 미디어의 재생 상태 pause or play
var curTime; // 메인 미디어의 현재 재생 시간
var totalTime; // 메인 미디어의 총 재생 시간
var l1 = '00'; // 현재 분
var l2 = '00'; // 현재 초
var l3 = '00'; // 총 분
var l4 = '00'; // 총 초
var isPopup = false; // 팝업창을 띄웠는지의 여부(돌발 팝업퀴즈, 학습 안내 등등...)

// DOMS
var body = document.getElementsByTagName('body');
var media; // 메인 미디어
var $medias; // 모든 오디오, 비디오
var $content_html;
var $content_video;

var $cTime; // media의 현재 시간
var $tTime; // media의 총 시간

var $btn_play; // 재생 버튼
var $btn_pause; // 일시정지 버튼
var $script; // 스크립트 자막 창

var $bar_event; // 재생바 클릭 및 드래그 인식
var $bar_pointer; // 재생바 포인터
var $bar_mask; // 재생바 색깔 채우기

var $sound_wave; // 사운드바
var $sound_event; // 사운드바 클릭 및 드래그 인식
var $sound_pointer; // 사운드바 포인터
var $sound_mask; // 사운드바 색깔 채우기

var $display_speed; // 배속 조절

var $menu; // 메뉴

// 로딩 관련
var loaded_interval; // 실시간 로딩 판단 인터벌
var window_loaded = false; // window 로딩 여부
var header_loaded = false; // (상단)헤더 로딩 여부
var controls_loaded = false; // (하단)컨트롤바 로딩 여부
var menu_loaded = false; // (하단)메뉴 로딩 여부
var map_loaded = false; // 러닝맵 로딩 여부
var media_canPlay = false; // video/audio 실행 가능 여부

loaded_interval = setInterval( loadComplete, intervalMs ); // 로딩이 다 완료되었는지 계속 체크

window.onload = function(){
	if( !$('#mainMedia').attr('src') ){
		if( $('#mainMedia').is('video') ){
	        mediaURL = './vod/' + replaceZero(htmlChasi) + '_' + replaceZero(htmlPage) + '.mp4';
	        console.log('비디오 경로 설정 완료');
	    } else {
	        mediaURL = './sounds/' + replaceZero(htmlChasi) + '_' + replaceZero(htmlPage) + '.mp3';
	        console.log('오디오 경로 설정 완료');
	    }
	    $('#mainMedia').attr('src', mediaURL);
    }else{
    	mediaURL = $('#mainMedia').attr('src');
    }
	window_loaded = true;
}

$(document).ready(function(){
	// 드래그 방지
	body[0].onselectstart = function(){return false};
	// 우클릭 메뉴 방지
	body[0].oncontextmenu = function(){return false};

	$medias = $('video, audio');
	media = document.getElementById('mainMedia');
	media.oncanplaythrough = function(){
		console.log('비디오/오디오 실행 가능');
		media_canPlay = true;
		media.oncanplaythrough = null;
	}
	$('#header').append(headerStr).promise().done(function(){
		console.log('헤더 로딩 완료');
		header_loaded = true;
	});
    $('.controls').append(controlStr).promise().done(function(){
    	console.log('컨트롤바 로딩 완료');
		controls_loaded = true;
	});
    $('#menu').append(menuStr).promise().done(function(){
    	console.log('메뉴 로딩 완료');
		menu_loaded = true;
	});
    $('#content').append(learningMapStr).promise().done(function(){
    	console.log('러닝맵 로딩 완료');
		map_loaded = true;
	});
	
	if(navigator.userAgent.match(/Android|Mobile|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/)){
		isMobile = true;
	}else{
		isMobile = false;
	}

	$(window).resize(function(){
		response();
	});
	$(window).resize();
});

// 로딩 완료시 실행
function loadComplete(){
	if( !window_loaded || !header_loaded || !controls_loaded || !menu_loaded || !map_loaded || !media_canPlay ){
		console.log(window_loaded + '::' + header_loaded + '::' + controls_loaded + '::' + menu_loaded + '::' + map_loaded + '::' + media_canPlay);
		return;
	}else{
		console.log('콘텐츠 실행 준비 완료');
		clearInterval(loaded_interval);
	}

	document.title = subject_name;
	setJQueryDOMS();
	setPageTitle();
    setEvents();
    setCookieVolume();

    $('.btn_wrap.play').hide();

    if(htmlPage === 1 || htmlPage === maxPage){
    	$('#menu_open').hide();
    	if(htmlPage === maxPage){
    		$('#next_bubble').addClass('last');
    	}
    }

    if(isMobile){ // 모바일일 때 자동재생이 안되므로
    	$('#content').append('<div id="mobile_play"><img src="./images/mobile_play.png"/></div>'); // 재생유도버튼 추가
    	$('#mobile_play').click(function(){
    		media.play();
    		$(this).hide();
    	});
		$('#btn-sound, #sound_wave').hide();
	}else{ // pc일 때
   		media.play(); // 영상, 음성 자동재생
	}

    mainInterval = setInterval( realTimeFunc, intervalMs );
    setIndexCurrent();
    setLearningMapCurrent();
    setIndexURL();

    $('#script_text').html(scriptValue[htmlPage - 1]);
    $('#currentPage').text(replaceZero(htmlPage));
	$('#totalPage').text(replaceZero(maxPage));

    $('.loading_wrap').detach(); // 로딩 화면 제거
    loadSuccess(); // 각 html 페이지에 로딩 완료 시에 실행되는 함수
}

// 실시간 실행 함수
function realTimeFunc(){
	var mediaPercent;
	curTime = media.currentTime;
	totalTime = media.duration;
	if(isNaN(totalTime)){
		totalTime = 0;
	}
	l1 = replaceZero(parseInt(curTime/60));
	l2 = replaceZero(parseInt(curTime%60));
	l3 = replaceZero(parseInt(totalTime/60));
	l4 = replaceZero(parseInt(totalTime%60));
	if(l1 == l3 && l2 > l4){
		l2 = l4;
	}
	$cTime.text(l1 + ':' + l2);
	$tTime.text(l3 + ':' + l4);

	mediaPercent = (curTime/totalTime)*100;
	$bar_mask.css('width', num_to_percent(mediaPercent));
	$bar_pointer.css('margin-left', mediaPercent + '%');
	if (media.paused) {
		$('.btn_wrap.play').show();
		$('.btn_wrap.pause').hide();
	} else {
		$('.btn_wrap.play').hide();
		$('.btn_wrap.pause').show();
	}
}

// jquery DOMS 객체를 변수에 저장
function setJQueryDOMS(){
	$content_html = $('.content_html');
	$content_video = $('.content_video');

	$cTime = $('#cTime');
	$tTime = $('#tTime');

	$btn_play = $('#btn_play');
	$btn_pause = $('#btn_pause');
	$bar_event = $('#bar_event');
    $bar_pointer = $('#bar_pointer');
    $bar_mask = $('#bar_display_mask');

    $sound_wave = $('#sound_wave');
    $sound_event = $('#sound_event');
    $sound_mask = $('#sound_display_mask');
    $sound_pointer = $('#sound_pointer');

    $script = $('#script_wrap');

    $display_speed = $('#display_speed');
}

// 콘텐츠 상단의 대제목, 소제목 설정
function setPageTitle(){
	if(page_title_list[htmlPage - 1][0] === ''){
		$('.main_title, .main_title_tail').detach();
	}else{
		$('.main_title p').html(page_title_list[htmlPage - 1][0]);
	}
	if(page_title_list[htmlPage - 1][1] === ''){
		$('.sub_title').detach();
	}else{
		$('.sub_title').html(page_title_list[htmlPage - 1][1]);
	}
}

// 컨트롤바 버튼들, media, 키보드 이벤트 지정
function setEvents(){
	/*document.onkeydown = function(e){
		var inputKey = e.keyCode;
		switch(inputKey){
			case 32 :
				if(mediaCondition === 'play'){
					media.pause();
				}else{
					media.play();
				}
				break;
			case 37 :
				if( htmlPage != 1 ){
					self.location.href = prevPageURL;
				}
				break;
			case 39 :
				if( htmlPage != maxPage ){
					self.location.href = nextPageURL;
				}
				break;
			case 38 :
				setVolume( (media.volume + 0.1).toFixed(2) );
				break;
			case 40 :
				setVolume( (media.volume - 0.1).toFixed(2) );
				break;
		}
	}*/

	for(var i = 0; i < $medias.length; i++){
		if($medias[i].id.indexOf('se') < 0){
			$medias[i].onplay = function(){
				if(this.id === 'mainMedia'){
					mediaCondition = 'play';
				}
				setCookieSpeed();
			}
		}
	}

	media.onpause = function(){
		if(!isPopup){
			mediaCondition = 'pause';
		}
	}

	media.onended = function(){
		if(endType === 'videoEnd'){
			$('#next_bubble').fadeIn();
		}
		media.pause();
		mediaCondition = 'pause';
	}

	$bar_event[0].onmousedown = function(e){
		media_move(e);
		document.onmousemove = media_move; 
	}
    $bar_pointer[0].onmousedown = function(e){
        document.onmousemove = media_move; 
    }

    $sound_event[0].onmousedown = function(e){
    	sound_move(e);
    	document.onmousemove = sound_move;
    }
    $sound_pointer[0].onmousedown = function(e){
        document.onmousemove = sound_move;
    }
    document.onmouseup = function(e){
        document.onmousemove = null; 
    }

	$('#menu_open').click(function(){
		if($('#menu').hasClass('on')){
			$('#menu').removeClass('on');
		}else{
			$('#menu').addClass('on');
		}
    });

	$('#btn_learningmap').click(function(){
		isPopup = true;
		media.pause();
		$('#learning_map_wrap').addClass('on').show();
	});

	$('#learning_map_close').click(function(){
		if(mediaCondition === 'play'){
			media.play();
		}
		isPopup = false;

		$('#learning_map_wrap').hide();
	});

	$('#btn_download').click(function(){
		var file = "./down/" + down_file;
		window.open(file,'','');
	});

	$btn_play.click(function() {
		media.play();
	});

	$btn_pause.click(function() {
		media.pause();
	});

	$('#btn_replay').click(function() {
		media.currentTime = 0;
		$('#next_bubble').fadeOut();
		if (media.paused) {
			media.play();
		}
	});

	$('#btn_script').click(function() {
		if( $script.hasClass('on') ){
			$script.removeClass('on');
		}else{
			$script.addClass('on');
		}
	});

	$('.btn_wrap.sound').on('mouseover', function(){
		$(this).addClass('on');
		$('#area_speed').addClass('move');
	});

	$('.btn_wrap.sound').on('mouseout', function(){
		$(this).removeClass('on');
		$('#area_speed').removeClass('move');
	});

	$('#btn_sound').click(function() {
		if(!volSave){
			volSave = 1;
		}
		if (media.muted) {
			for(var i = 0; i < $medias.length; i++){
				$medias[i].muted = false;
			}
			setVolume(volSave);
			$(this).removeClass('mute');
		} else {
			volSave = media.volume;
			for(var i = 0; i < $medias.length; i++){
				$medias[i].muted = true;
			}
			setVolume(0);
			$(this).addClass('mute');
		}
	});

	$('.btn_speed').click(function(){
		var $this = $(this);
		var $speed = $this.attr('data-speed');

		$display_speed.html('×' + $speed);
		for(var i = 0; i < $medias.length; i++){
			if($medias[i].id.indexOf('se') < 0){
				$medias[i].playbackRate = Number($speed);
			}
		}
		setCookie('speed_' + subject_code + '_' + chasi_num, $speed, 1);
		$('#speed_list').removeClass('on');
	});

	if( htmlPage != 1 ){
		$('#btn_prev').click(function() {
			$(this).data('url', prevPageURL);
			self.location.href = $(this).data('url');
		});
	}
	
	if( htmlPage != maxPage ){
		$('#btn_next').click(function() {
			$(this).data('url', nextPageURL);
			self.location.href = $(this).data('url');
		});
	}
}

// 음량 쿠키 불러오기
function setCookieVolume(){
	var tmpVol = getCookie('volume_' + subject_code + '_' + chasi_num);

    if(tmpVol){
    	setVolume(tmpVol);
    }else{
    	setVolume(1);
    }
    if(media.volume <= 0.01){
		for(var i = 0; i < $medias.length; i++){
			$medias[i].muted = true;
		}
		$('#btn_sound').addClass('mute');
	}else{
		for(var i = 0; i < $medias.length; i++){
			$medias[i].muted = false;
		}
		$('#btn_sound').removeClass('mute');
	}
    $sound_pointer.css('left', num_to_percent(media.volume * 100));
}

// 배속 쿠키 불러오기
function setCookieSpeed(){
	var tmpSpeed = Number(getCookie('speed_' + subject_code + '_' + chasi_num));

    if(tmpSpeed){
    	for(var i = 0; i < $medias.length; i++){
    		if($medias[i].id.indexOf('se') < 0){
				$medias[i].playbackRate = tmpSpeed;
			}
		}
    	if(tmpSpeed == 0.8){
    		$display_speed.html('×0.8');
    	}else if(tmpSpeed == 1.0){
    		$display_speed.html('×1.0');
    	}else if(tmpSpeed == 1.5){
    		$display_speed.html('×1.5');
    	}else if(tmpSpeed == 2.0){
    		$display_speed.html('×2.0');
    	}
    }else{
    	$display_speed.html('×1.0');
    }
}

// 메뉴에서 현재페이지 활성화
function setIndexCurrent(){
	for(var i = 0; i < move_value.length; i++){
		if(htmlPage >= move_value[i]){
			$('.current').removeClass('current');
			$('.p_current').removeClass('p_current');
			$('#index-move' + (i + 1)).addClass('current');
			$('#index-move' + (i + 1)).parent().parent().find('.title').addClass('p_current');
		}
	}
}

// 러닝맵에서 현재 차시 활성화
function setLearningMapCurrent(){
	var chasiNum = replaceZero(htmlChasi);
	var $target = $('#learning_map_wrap #chasi' + chasiNum);
	var $target_dt = $target.siblings('dt');
	$target.addClass('on');
	$target_dt.addClass('on');
}

// 메뉴 클릭시 url 설정
function setIndexURL(){
	var total_id = move_value.length;
	var total_box = $('#menu .box').length;
	
	for(var i = 1; i <= total_id; i++){
		var index_id = '#index-move' + i;
		var location_html = replaceZero(htmlChasi) + '_' + replaceZero(move_value[i - 1]) + '.html';
		
		$(index_id).data('url', location_html);
		$(index_id).click(function(){
			self.location.href = $(this).data('url');
		});
	}

	for(var i = 1; i <= total_box; i++){
		var $target = $('#menu .box' + i + ' .items li:first-child');
		var $title_btn = $('#menu .box' + i + ' .title');
		$title_btn.data('url', $target.data('url'));
		$title_btn.click(function(){
			self.location.href = $(this).data('url');
		});
	}
}

// 창 사이즈 조절 시 실행
function response(){
	var win_w = $(window).width();
	var win_h = $(window).height();
	if(win_w < con_w){
		con_scale = win_w/con_w;
	}else{
		con_scale = 1;
	}
	$('#content_wrap').css('transform', 'scale(' + con_scale + ')');
}

// 북마크 생성
function createMark(markArr){
	var markInterval = setInterval(function(){
		for(var i = 0; i < markArr.length; i++){
			if(media.duration === 0){
				return;
			}
			var $target;
			var $tmp = $('#quickBubble');
			$('#quickMark').append('<div class="mark mark' + (i+1) + '"><div class="displayMark"></div><div class="text">' + markArr[i].text + '</div></div>');
			$tmp.append('<div class="text text' + i + '">' + markArr[i].text + '</div>');
			$target = $('.mark' + (i+1));
			$target.find('.text').css('width', $tmp.find('.text' + i).width() + 20);
			$target.find('.text').css('margin-left', -( ($target.find('.text').width() + (px_to_num($target.find('.text').css('padding-left'))*2))/2 - ($target.width()/2)) );
			$target.css('left', (markArr[i].time / media.duration) * $bar_event.width());
			(function(currentI){
				$target.click(function(){
					media.currentTime = markArr[currentI].time;
				});
			}(i));
		}
		clearInterval(markInterval);
	}, 100);
}

// 재생바 조절시
function media_move(event) {
	var offset = $bar_event.offset();
	var pos = px_to_num(event.pageX - offset.left);
	var movePer = pos/$bar_event.width() * 100;
	var clickTime;
	movePer = movePer.toFixed(2);
	if(movePer >= 99){
		movePer = 99;
	}else if(movePer < 0){
		movePer = 0;
	}
	$bar_mask.css('width', num_to_percent(movePer));
	$bar_pointer.css('margin-left', movePer + '%');
	movePer = (movePer/100).toFixed(2);
	clickTime = (totalTime * movePer).toFixed(2);
	media.currentTime = clickTime;
}

// 사운드바 조절시
function sound_move(event){
	var offset = $sound_wave.offset();
	var pos = px_to_num(event.pageX - offset.left);
	var resultVolume = (pos / $sound_wave.width()).toFixed(2);
	
	setVolume(resultVolume);
}

// 볼륨 조절
function setVolume(vol){
	if(vol < 0){
		vol = 0;
	}else if(vol > 1){
		vol = 1;
	}
	for(var i = 0; i < $medias.length; i++){
		$medias[i].volume = vol;
	}
	$sound_mask.css('width', num_to_percent(vol * 100));
	$sound_pointer.css('left', num_to_percent(vol * 100));
	if(media.volume <= 0.01){
		for(var i = 0; i < $medias.length; i++){
			$medias[i].muted = true;
		}
		setCookie('volume_' + subject_code + '_' + chasi_num, 0, 1);
		$('#btn_sound').addClass('mute');
		$('.btn_wrap.sound .btn_bubble').html('소리 켬');
	}else{
		for(var i = 0; i < $medias.length; i++){
			$medias[i].muted = false;
		}
		setCookie('volume_' + subject_code + '_' + chasi_num, vol, 1);
		$('#btn_sound').removeClass('mute');
		$('.btn_wrap.sound .btn_bubble').html('소리 끔');
	}
}

//  돌발퀴즈 초기화
function sudden_quiz_reset(){
	$('.select_o .user_chk, .select_x .user_chk').hide();
	$('.display_result').css('background', 'none').hide();
	$('.explain_wrap').hide();
	$('.select_o .display_answer, .select_x .display_answer').hide();;
	$('.select_o, .select_x').removeClass('answer').removeClass('end');
}

// 드래그 퀴즈 정답확인 함수
function drag_ansChk(){
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		if($drop.attr('data-hasItem') === ''){
			console.log('문제를 푸시오;');
			return;
		}
	}
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		var $drag = $($drop.attr('data-hasItem'));

		if(chance > 0 && $drop.attr('data-answer') != $drag.attr('data-answer')){
			chance--;
			$('#se_quiz_wrong')[0].play();
			call_alert('re');
			return;
		}else if(chance === 0){
			$('#se_quiz_wrong')[0].play();
			call_alert('wrong');
			$btnCheck.hide();
			$btnRetry.show();
			drag_marking()
			return;
		}
	}
	$('#se_quiz_correct')[0].play();
	call_alert('correct');
	$btnCheck.hide();
	$btnRetry.show();
	drag_marking();
}

// 드래그 퀴즈 채점
function drag_marking(){
	$drags.draggable('disable');
	$('#next_bubble').fadeIn();
	for(var i = 1; i <= $drops.length; i++){
		var $drop = $('#drop_obj' + i);
		var $drag = $($drop.attr('data-hasItem'));

		if($drop.attr('data-answer') === $drag.attr('data-answer')){
			$drag.addClass('correct');
			$drop.find('.drag_result').css('background', 'url(./images/drag_o.png)');
		}else{
			$drag.addClass('wrong');
			$drop.find('.drag_result').css('background', 'url(./images/drag_x.png)');
		}
	}
}

// 드래그 퀴즈 초기화
function drag_quiz_reset(){
	chance = 1;
	$btnRetry.hide();
	$('.drag_result').css('background', 'none');
	$drops.each(function(idx){
		var $drop = $(this);
		$drop.attr('data-hasItem', '');
	});
	$drags.each(function(){
		var $drag = $(this);
		$drag.stop().animate({
			'top' : $drag.attr('data-top'),
			'left' : $drag.attr('data-left')
		}, 200);
		$drag.removeClass('wrong').removeClass('correct');
		$drag.draggable('enable');
	});
}

// 평가하기 정답확인
function ansChk(qNum){
	var correct = false;
	var clickNum = 0;
	change_reTest -= 1;

	for(var i = 1; i <= 4; i++){
		if( $('.quiz_wrap.q' + qNum + ' .quiz' + i).hasClass('click') ){
			clickNum = i;
			break;
		}
	}
	if(clickNum === 0){
		call_alert('re');
		return;
	}
	if( ans_num[qNum-1] == clickNum ){ // 정답
		$('#se_quiz_correct')[0].play();
		select_ans[qNum-1] = true;
		call_alert('correct');
		ans_ani(qNum, clickNum);
		$('.quiz_wrap.q' + qNum + ' .select').unbind('click');
		change_reTest = reTest;

		$('.q' + qNum + ' .display_correct').css('background', 'url(./images/q_o.png)');
		$('.q' + qNum + ' .display_correct').css('visibility', 'visible');
		$('.q' + qNum + ' .viewCon').show();
		$('#review' + qNum + ' .re_correct').css('background', 'url(./images/q_rev_o.png)');
		return;
	} else {
		if( change_reTest == 0 ){ // 2번 모두 틀림
			$('#se_quiz_wrong')[0].play();
			select_ans[qNum-1] = false;
			call_alert('wrong');
			ans_ani(qNum, clickNum);
			$('.quiz_wrap.q' + qNum + ' .select').unbind('click');
			change_reTest = reTest;

			$('.q' + qNum + ' .display_correct').css('background', 'url(./images/q_x.png)');
			$('.q' + qNum + ' .display_correct').css('visibility', 'visible');
			$('.q' + qNum + ' .viewCon').show();
			$('#review' + qNum + ' .re_correct').css('background', 'url(./images/q_rev_x.png)');
			rewrong.push(qNum);
			return;
		} else { // 1번틀림
			$('#se_quiz_wrong')[0].play();
			$('.q' + qNum + ' .select').removeClass('click');
			$('.q' + qNum + ' .btnCheck').fadeOut();
			call_alert('re');
		}
	}
}

// 평가하기 문제 교체
function page_visible(num){
	$('.review').removeClass('on');
	$('#review' + num).addClass('on');
	$('.quiz_wrap').hide();
	$('.quiz_wrap.q' + num).show();
}

// 평가하기 정답 및 해설
function ans_ani(qNum, clickNum){
	var $target = $('.quiz_wrap.q' + qNum);
	$target.find('.btnCheck').hide();
	$target.find('.btnNext').show();
	$target.find('.explain_wrap').show();
	$target.find('.select').addClass('end');
	$target.find('.select.quiz' + ans_num[qNum-1]).addClass('answer');
	$target.find('.select.quiz' + clickNum).addClass('click');
}

// 평가하기 초기화
function quiz_reset(list){
	$('.quiz_wrap.q1 .btnNext').removeClass('result').hide();
	$('.quiz_wrap.q2 .btnNext').removeClass('result').hide();
	$('.quiz_wrap.q3 .btnNext').hide();
	$('.review').unbind('click');
	$('.review_wrap').removeClass('review_mode');
	$('#pageAns').hide();
	$('.quiz_wrap').hide();
	if(!list){ // 다시풀기
		$('.re_correct').css('background', 'none');
		$('.display_correct').css('visibility', 'hidden');
		$('.select').removeClass('end');
		$('.select').removeClass('click');
		$('.select').removeClass('answer');
		$('.explain_wrap').hide();
	}else{ // 틀린문제 다시풀기
		for(var i = 0; i < list.length; i++){
			$('#review' + list[i] + ' .re_correct').css('background', 'none');
			$('.q' + list[i] + ' .display_correct').css('visibility', 'hidden');
			$('.q' + list[i] + ' .select').removeClass('end');
			$('.q' + list[i] + ' .select').removeClass('click');
			$('.q' + list[i] + ' .select').removeClass('answer');
			$('.q' + list[i] + ' .explain_wrap').hide();
		}
	}
}

// 정답, 오답, 다시풀기 팝업창 출력
function call_alert(str){
	$('#content').append('<div id="alert_wrap"></div>');
	if(str === 'correct'){
		$('#alert_wrap').append('<div id="alert_correct" class="alert_content"></div>');
	}else if(str === 'wrong'){
		$('#alert_wrap').append('<div id="alert_wrong" class="alert_content"></div>');
	}else if(str === 're'){
		$('#alert_wrap').append('<div id="alert_re" class="alert_content"></div>');
	}
	$('#alert_wrap').fadeIn(200);
	setTimeout(function(){
		$('#alert_wrap').fadeOut(200, function(){
			$('#alert_wrap').detach();
		});
	}, 1000);
}

// 평가하기 관련학습보기
function call_imagePopup(url){
	var urlArray = [];
	urlArray = url.split(',');
	$('#content').append('<div id="popup_wrap"><div id="popup_close"></div></div>');
	$('#popup_wrap').append('<div id="popup"></div>');
	for(var i = 0; i < urlArray.length; i++){
		$('#popup').append('<img src="' + urlArray[i] + '"/>');
	}
	$('#popup_wrap').show();
	$('#popup_close').click(function(){
		$('#popup_wrap').hide();
		$('#popup_wrap').detach();
	});
}

// 요점정리 페이지 변경
function org_paging( next ){
	$('#page' + imgNum).hide();

	if ( next ) {
		imgNum++;
		if ( imgNum < totalPage ){
			$('#page_organize_prev').removeClass('off');
		} else {
			imgNum = totalPage;
			$('#page_organize_next').addClass('off');
			$('#page_organize_prev').removeClass('off');
		}
	} else {
		imgNum--;
		if ( imgNum > 1 ){
			$('#page_organize_next').removeClass('off');
		} else {
			imgNum = 1;
			$('#page_organize_prev').addClass('off');
			$('#page_organize_next').removeClass('off');
		}
	}
	if(imgNum == totalPage){
		$('#next_bubble').fadeIn();
	}

	$('#page' + imgNum).show();
	$('#paging_organize .front').html(imgNum);
}

// 요점정리 초기화
function org_reset(num){
	for(var i = 1; i <= num; i++){
		org_paging(false);
	}
}

// px 문자열 삽입
function num_to_px(num){
	return num + 'px';
}

// % 문자열 삽입
function num_to_percent(num){
	return num + '%';
}

// px 삭제하고 숫자로 변환
function px_to_num(px){
	return Number(px.toString().replace('px',''));
}

// 10 미만의 숫자 앞에 0을 붙임
function replaceZero(num){
	if( num < 10 ){
		return '0' + num;
	} else {
		return num;
	}
}

// 이전, 다음페이지 경로 설정 함수 ( 숫자, 다음페이지 여부, 차시인지 여부 )
function pagingURL( num, isNextPage, chasi ){
	chasi ? '' : isNextPage ? num += 1 : num -= 1;
	return replaceZero(num);
}

// 쿠키설정
function setCookie(cName, cValue, cDay){
	var expire = new Date();
	expire.setDate(expire.getDate() + cDay);
	cookies = cName + '=' + escape(cValue) + '; path=/ '; 
	if(typeof cDay != 'undefined'){
		cookies += ';expires=' + expire.toGMTString() + ';';
	}
	document.cookie = cookies;
}

// 쿠키 가져오기
function getCookie(cName){
	cName = cName + '=';
	var cookieData = document.cookie;
	var start = cookieData.indexOf(cName);
	var cValue = '';
	if(start != -1){
		start += cName.length;
		var end = cookieData.indexOf(';', start);
		if(end == -1)end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}