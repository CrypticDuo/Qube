 (function(){
    jQuery(function($) {
       $('#widget').split({orientation:'vertical', limit:100});
    });

    var intro = ['<html>',
                '<style>',
                '  body {',
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
                '}',
                '</style>',
                '<h1>Testing <span>Editor yay </span></h1><br>',
                '<h2>(university of waterlooppp)</h2>',
                '</html>'].join('\n');
                  
                  
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night_eighties");
    editor.getSession().setMode("ace/mode/html");
    editor.setValue(intro);
    
    var iframe = document.getElementById('preview'),
    iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.setAttribute('tabindex', 0);
    
    iframedoc.body.innerHTML = editor.getValue();
    
    editor.getSession().on('change', function(e) {
        iframedoc.body.innerHTML = editor.getValue();
    });
})();