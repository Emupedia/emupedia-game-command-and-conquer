;(function() {
	require.config({
		shim: {
			cnc: {
				exports: 'game'
			}
		},
		paths: {
			jquery: 'library/jquery-2.2.0.min',
			image: 'library/require-image-0.2.2.min',
			text: 'library/require-text-2.0.14.min',
			json: 'library/require-json-0.4.0.min'
		}
	});

	require([
		'jquery',
		'text!../templates/cnc.html'
	], function ($, template) {
		$(function() {
			$('html').removeClass('no-js').addClass('js');
			var $body = $('body');
			$body.html(template).promise().done(function() {
				require([
					'cnc'
				], function (game) {
					game.init();
				});
			});
		});
	});

})();