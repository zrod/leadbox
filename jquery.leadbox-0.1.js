/*
 * LeadBox for jQuery (v1.4+)
 * A simple modal plugin for lead capture purposes.
 * For more details, please visit: http://blog.arthuso.com
 * 
 * Author: Rodrigo Z. Arthuso | arthuso.com
 * 
 * Version: 0.1 (04/25/2011)
 * - First version
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
			
			var el_c = $('#leadbox_container'), el = this;
			
			if (el_c.length != 1 && $(el).length == 1 && $.leadbox.readCookie($.leadbox.settings.cookie) === false) {
				$(el).css({'width': $.leadbox.settings.width, 'height': $.leadbox.settings.height}).wrap($('<div id="leadbox_container"></div>'));
				el_c = $(el).parent();
				
				// Load external content
				if ($.leadbox.settings.remote && $.leadbox.settings.remote.indexOf('http://') != -1) {
					$(el).html('<iframe src="' + $.leadbox.settings.remote + '" width="100%" height="100%" frameborder="0" scrolling="auto">Your browser does not support iframes</iframe>');
				}
				
				// Prepend close button
				if ($.leadbox.settings.closeButton != '') {
					$(el).prepend('<div class="leadbox_close"><a href="javascript:$.leadbox.close();">' + $.leadbox.settings.closeButton + '</a></div>');
				}
				
				// IE6 Fix
				if ($.browser.msie && $.browser.version == '6.0') {
					$(document.body).css({width: '100%', height: '100%'});
					el_c.css('position', 'absolute');
				}

				var t = window.setTimeout(function() {
					// Retrieve element's position
					var pos = $.leadbox.calcPosition(el);
					
					// Center and display element
					$(el_c).fadeIn();
					$(el).css({left: pos.left, top: pos.top}).fadeIn('slow').click(function(e){ e.stopPropagation(); });
					
					// Set a cookie so it won't show up on every single request
					$.leadbox.setCookie($.leadbox.settings.cookie, '1', $.leadbox.settings.cookie_time, $.leadbox.settings.cookie_path);
					
					// Run callback
					if (typeof($.leadbox.settings.onLoad) === 'function') $.leadbox.settings.onLoad();
				}, $.leadbox.settings.interval);
				
				// Center element after a resize event
				$(window).resize(function() {
					var pos = $.leadbox.calcPosition(el);
					$(el).css({left: pos.left, top: pos.top});
				});
				
				// Run callback after an action is taken (forms and anchors)
				if ($.leadbox.settings.actionClass != '' && typeof($.leadbox.settings.onAction) === 'function') {
					// Scan for elements containing the class defined in the settings
					var actionClassElements = $('#leadbox_container .' + $.leadbox.settings.actionClass);
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
			var winWidth = $(window).width(), winHeight = $(window).height();
			var elWidth = $(el).outerWidth(), elHeight = $(el).outerHeight();
			var pos_left = Math.abs((winWidth / 2) - (elWidth / 2));
			var pos_top = Math.abs((winHeight / 2) - (elHeight / 2));
			
			return new Object({left: pos_left, top: pos_top});
		},
		
		readCookie: function(n) {
			if (document.cookie.length > 0) {
				cstrt = document.cookie.indexOf(n + '=');
				if (cstrt != -1) {
					cstrt = cstrt + n.length + 1;
					cend = document.cookie.indexOf(';', cstrt);
					if (cend == -1) cend = document.cookie.length;
					return unescape(document.cookie.substring(cstrt, cend));
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
	
		setCookie: function(n, v, ed, path) {
			var vdate = new Date();
			vdate.setDate(vdate.getDate() + ed);
			document.cookie = n + '=' + v + ((ed == '' || ed == 0) ? '' : ';expires=' + vdate.toUTCString()) + ';path=' + path;
		},
	
		close: function () {
			// IE6 Fix - unsets the width and height value of 100%
			if ($.browser.msie && $.browser.version == '6.0') {
				$(document.body).css({width: "auto", height: "auto"});
			}
			
			var el = $('#leadbox_container');
			var child = el.find(':first-child').attr('id');
			
			el.hide();
			$('body').not(child).unbind('click');
			
			// Run callback
			if (typeof($.leadbox.settings.onClose) === 'function') $.leadbox.settings.onClose();
		}
	};
})(jQuery);