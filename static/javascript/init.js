 (function(){
    jQuery(function($) {
       $('#dashboard').split({orientation:'vertical', position: '30%',limit:10});
       $('#navLeft').split({orientation:'horizontal', limit:10});
    });

    var initHTML = ['<h1>Testing <span> Qube </span></h1><br>',
                '<h2>(university of waterlooppp)</h2>'].join('\n');

    var initCSS = ['body {',
                '  padding-top: 80px;',
                '  text-align: center;',
                '  font-family: monaco, monospace;',
                '}',
                'h1 {',
                  '  font-size: 30px',
                '}',
                'h2 {',
                '  font-size: 20px;',
                '}',
                'span {',
                '  background: #fd0;',
                '}'].join('\n');
                  
    function getPrevContent(){
        return '<html>' + '<style>' + cssEditor.getValue() + '</style>' + htmlEditor.getValue() + '</html>';
    }              

    var htmlEditor = ace.edit("htmlEditor");
    var cssEditor = ace.edit("cssEditor");

    htmlEditor.setTheme("ace/theme/tomorrow_night_eighties");
    cssEditor.setTheme("ace/theme/github");
    htmlEditor.getSession().setMode("ace/mode/html");
    cssEditor.getSession().setMode("ace/mode/css");
    htmlEditor.setValue(initHTML,1);
    cssEditor.setValue(initCSS,1);
    
    var iframe = document.getElementById('preview'),
    iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.setAttribute('tabindex', 0);
    iframedoc.body.innerHTML = getPrevContent();
    
    htmlEditor.getSession().on('change', function(e) {
        iframedoc.body.innerHTML = getPrevContent();
    });

	cssEditor.getSession().on('change', function(e) {
		iframedoc.body.innerHTML = getPrevContent();
	});

})();
