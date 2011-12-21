/*
 * LeadBox for jQuery (v1.4+)
 * A simple modal plugin for lead capture purposes.
 * For more details, please visit: https://github.com/zrod/leadbox
 * 
 * Author: Rodrigo Z. Arthuso | arthuso.com
 *
 * Version 0.2 (12/15/2011)
 * - Code cleanup, dropped support for IE6.
 *
 * Dual licensed under MIT and GPL.
 */

(function ($) {
	jQuery.fn.leadbox = function(options) {
		return this.each(function () {
			if (options) {
				options.interval = (isNaN(options.interval) ? $.leadbox.settings.interval : options.interval);
				options.cookie_time = (isNaN(options.cookie_time) ? $.leadbox.settings.cookie_time : options.cookie_time);
				$.extend($.leadbox.settings, options);
			}
			
			var actionClassElements,
                el_c = $('#leadbox_container'),
                el = this,
                pos,
                t;
			
			if (el_c.length != 1 && $(el).length == 1 && $.leadbox.readCookie($.leadbox.settings.cookie) === false) {
				$(el).css({'width': $.leadbox.settings.width, 'height': $.leadbox.settings.height}).wrap($('<div id="leadbox_container"></div>'));
				el_c = $(el).parent();
				
				// Load external content
				if ($.leadbox.settings.remote && $.leadbox.settings.remote.indexOf('http://') != -1) {
					$(el).html('<iframe src="' + $.leadbox.settings.remote + '" width="100%" height="100%" frameborder="0" scrolling="auto">Your browser does not support iframes</iframe>');
				}
				
				// Prepend close button
				if ($.leadbox.settings.closeButton !== '') {
					$(el).prepend('<div class="leadbox_close"><a href="javascript:$.leadbox.close();">' + $.leadbox.settings.closeButton + '</a></div>');
				}

				t = window.setTimeout(function() {
					// Retrieve element's position
					pos = $.leadbox.calcPosition(el);
					
					// Center and display element
					$(el_c).fadeIn();
					$(el).css({left: pos.left, top: pos.top}).fadeIn('slow').click(function(e){ e.stopPropagation(); });
					
					// Set a cookie so that it won't show up on every single request
					$.leadbox.setCookie($.leadbox.settings.cookie, '1', $.leadbox.settings.cookie_time, $.leadbox.settings.cookie_path);
					
					// Run callback
					if (typeof($.leadbox.settings.onLoad) === 'function') $.leadbox.settings.onLoad();
				}, $.leadbox.settings.interval);
				
				// Center element after a resize event
				$(window).resize(function() {
					pos = $.leadbox.calcPosition(el);
					$(el).css({left: pos.left, top: pos.top});
				});
				
				// Actions callback
				if ($.leadbox.settings.actionClass !== '' && typeof($.leadbox.settings.onAction) === 'function') {
					// Scan for elements containing the class defined in the settings
					actionClassElements = $('#leadbox_container .' + $.leadbox.settings.actionClass);
					if (actionClassElements.length > 0) {
						$.each(actionClassElements, function(k, v) {
							switch (v.tagName.toLowerCase()) {
								case 'form':
										$(v).submit(function() {
											$.leadbox.settings.onAction();
											return true;
										});
									break;
								case 'a':
										$(v).click(function() {
											$.leadbox.settings.onAction();
										});
									break;
							}
						});
					}
				}
				
				// Close leadbox on clicks outside its boundaries
				if ($.leadbox.settings.closeOnExternalClick) {
					$('body').not(el).bind('click', function(){
						$.leadbox.close();
					});
				}
			}
		});
	};
	
	$.leadbox = {
		settings: {
			'interval': 10000,
			'cookie': 'leadBox',
			'cookie_time': 7,
			'cookie_path': '/',
			'width': 500,
			'height': 220,
			'closeOnExternalClick': false,
			'closeButton': '',
			'remote': '',
			'actionClass': 'leadAction',
			'onLoad': '',
			'onAction': '',
			'onClose': ''
		},
			
		calcPosition: function(el) {
			var winWidth = $(window).width(),
                winHeight = $(window).height(),
			    elWidth = $(el).outerWidth(),
                elHeight = $(el).outerHeight(),
			    pos_left = Math.abs((winWidth / 2) - (elWidth / 2)),
			    pos_top = Math.abs((winHeight / 2) - (elHeight / 2));
			
			return {left: pos_left, top: pos_top};
		},
		
		readCookie: function(n) {
			if (document.cookie.length > 0) {
				var cstrt = document.cookie.indexOf(n + '='),
                    cend;
				if (cstrt != -1) {
					cstrt = cstrt + n.length + 1;
					cend = document.cookie.indexOf(';', cstrt);
					if (cend == -1) cend = document.cookie.length;
					return unescape(document.cookie.substring(cstrt, cend));
				}
			}
            
			return false;
		},
	
		setCookie: function(n, v, ed, path) {
			var vdate = new Date();
			vdate.setDate(vdate.getDate() + ed);
			document.cookie = n + '=' + v + ((ed === '' || ed === 0) ? '' : ';expires=' + vdate.toUTCString()) + ';path=' + path;
		},
	
		close: function () {
            var el = $('#leadbox_container'),
                child = el.find(':first-child').attr('id');
			
			el.hide();
			$('body').not(child).unbind('click');
			
			// Run callback
			if (typeof($.leadbox.settings.onClose) === 'function') $.leadbox.settings.onClose();
		}
	};
})(jQuery);