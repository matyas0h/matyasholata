document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('customTerminal')) return;

    var link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    var style = document.createElement('style');
    style.textContent =
        "#customTerminal { position:fixed; width:390px; height:325px; z-index:99999; transform:scale(0); opacity:0; transition:transform 0.3s ease, opacity 0.3s ease; font-family:'Inter', sans-serif; }" +
        "#customTerminal.show { transform:scale(1); opacity:1; }" +
        ".terminal_toolbar { display:flex; height:39px; align-items:center; padding:0 10px; box-sizing:border-box; border-top-left-radius:5px; border-top-right-radius:5px; background:#212121; justify-content:flex-end; cursor:grab; font-family:'Inter', sans-serif; }" +
        ".butt { display:flex; align-items:center; margin-right:130px }" +
        ".btn { display:flex; justify-content:center; align-items:center; padding:0; margin-right:6px; font-size:10px; height:16px; width:16px; border:none; border-radius:100%; background:linear-gradient(#7d7871 0%,#595953 100%); text-shadow:0px 1px 0px rgba(255,255,255,0.2); box-shadow:0px 0px 1px 0px #41403A,0px 1px 1px 0px #474642; }" +
        ".btn-color { background:#ee411a; cursor:pointer; }" +
        ".btn:hover { cursor:pointer; }" +
        ".user { color:#d5d0ce; font-size:14px; line-height:17px; margin-left:10px; white-space: nowrap; }" +
        ".terminal_body { background:rgba(0,0,0,0.6); height:calc(100% - 39px); padding:5px 8px; font-size:16px; border-bottom-left-radius:5px; border-bottom-right-radius:5px; overflow-y:auto; color:#ffffff; font-family:'Inter', monospace !important; }" +
        ".terminal_body::-webkit-scrollbar { display:none; }" +
        ".prompt_line { display:flex; align-items:center; white-space:nowrap; margin-top:2px; }" +
        ".terminal_user { color:#1eff8e; }" +
        ".terminal_location { color:#4878c0; margin-left:3px; }" +
        ".terminal_bling { color:#dddddd; margin-left:3px; }" +
        ".cmd_input { outline:none; border:none; background:transparent; color:#ffffff; font-family:'Inter', monospace !important; font-size:16px !important; line-height:18px !important; white-space:pre !important; flex:1; caret-color:#ffffff; }";
    document.head.appendChild(style);

    var term = document.createElement('div');
    term.id = 'customTerminal';
    term.innerHTML =
        '<div class="terminal_toolbar">' +
        '<div class="butt">' +
        '<button class="btn btn-color"></button>' +
        '<button class="btn"></button>' +
        '<button class="btn"></button>' +
        '</div>' +
        '<p class="user">Loading IP...</p>' +
        '</div>' +
        '<div class="terminal_body">' +
        '<div class="prompt_line">' +
        '<span class="terminal_user">Loading IP@admin:</span>' +
        '<span class="terminal_location">~</span>' +
        '<span class="terminal_bling">$</span>' +
        '<span contenteditable="true" class="cmd_input" spellcheck="false"></span>' +
        '</div></div>';
    document.body.appendChild(term);

    var termRect = term.getBoundingClientRect();
    term.style.left = (window.innerWidth / 2 - termRect.width / 2) + 'px';
    term.style.top = (window.innerHeight / 2 - termRect.height / 2) + 'px';

    var redBtn = term.querySelector('.btn-color');
    var input = term.querySelector('.cmd_input');
    var terminalBody = term.querySelector('.terminal_body');
    var promptLine = term.querySelector('.prompt_line');
    var userText = term.querySelector('.user');

    var terminalVisible = false;

    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            const ip = data.ip;
            userText.textContent = ip + "@admin: ~";
            promptLine.querySelector('.terminal_user').textContent = ip + "@admin:";
        })
        .catch(() => {
            userText.textContent = "unknown@admin: ~";
            promptLine.querySelector('.terminal_user').textContent = "unknown@admin:";
        });

    function toggleTerminal() {
        terminalVisible = !terminalVisible;
        term.classList.toggle('show');
        if (terminalVisible) input.focus();
    }

    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'p' && !e.repeat && !terminalVisible) {
            e.preventDefault();
            toggleTerminal();
        }
    });

    redBtn.addEventListener('click', toggleTerminal);

    var toolbar = term.querySelector('.terminal_toolbar');
    var isDragging = false, offsetX = 0, offsetY = 0;

    toolbar.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - term.offsetLeft;
        offsetY = e.clientY - term.offsetTop;
        toolbar.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        toolbar.style.cursor = 'grab';
        document.body.style.userSelect = 'auto';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        term.style.left = (e.clientX - offsetX) + 'px';
        term.style.top = (e.clientY - offsetY) + 'px';
    });

    input.addEventListener('keydown', function(e) {
        if (!terminalVisible) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            var cmd = input.innerText.trim();
            if (!cmd) return;

            var newLine = document.createElement('div');
            newLine.className = 'prompt_line';
            newLine.innerHTML = promptLine.querySelector('.terminal_user').outerHTML +
                '<span class="terminal_location">~</span><span class="terminal_bling">$</span> ' + cmd;
            terminalBody.insertBefore(newLine, promptLine);

            var response = document.createElement('div');
            response.style.color = '#00ff99';

            try {
                // Commands
                if(cmd === 'info') {
                    response.textContent = 'Shows page info: URL, title, window width and height.';
                } else if(cmd.startsWith('log ')) {
                    let sel = cmd.split(' ')[1];
                    console.log(document.querySelectorAll(sel));
                    response.textContent = `Logs all elements matching "${sel}" to the console.`;
                } else if(cmd.startsWith('inspect ')) {
                    let el = document.querySelector(cmd.split(' ')[1]);
                    console.log(el);
                    response.textContent = `Logs first element of selector to console.`;
                } else if(cmd === 'debug on') {
                    document.querySelectorAll('*').forEach(el => el.style.outline='1px solid rgba(255,0,0,0.3)');
                    response.textContent = 'Debug outlines enabled.';
                } else if(cmd === 'debug off') {
                    document.querySelectorAll('*').forEach(el => el.style.outline='');
                    response.textContent = 'Debug outlines disabled.';
                } else if(cmd.startsWith('hide ')) {
                    document.querySelectorAll(cmd.split(' ')[1]).forEach(el => el.style.display='none');
                    response.textContent = 'Hidden elements matching selector.';
                } else if(cmd.startsWith('show ')) {
                    document.querySelectorAll(cmd.split(' ')[1]).forEach(el => el.style.display='');
                    response.textContent = 'Shown elements matching selector.';
                } else if(cmd.startsWith('css ')) {
                    let parts=cmd.split(' '); let sel=parts[1], prop=parts[2], val=parts.slice(3).join(' ');
                    document.querySelectorAll(sel).forEach(el=>el.style[prop]=val);
                    response.textContent = `Set CSS ${prop}:${val} on "${sel}".`;
                } else if(cmd.startsWith('attr ')) {
                    let parts=cmd.split(' '); let sel=parts[1], attr=parts[2], val=parts.slice(3).join(' ');
                    document.querySelectorAll(sel).forEach(el=>el.setAttribute(attr,val));
                    response.textContent = `Set attribute ${attr}="${val}" on "${sel}".`;
                } else if(cmd.startsWith('remove ')) {
                    document.querySelectorAll(cmd.split(' ')[1]).forEach(el=>el.remove());
                    response.textContent = 'Removed matching elements.';
                } else if(cmd.startsWith('clone ')) {
                    let sel=cmd.split(' ')[1];
                    document.querySelectorAll(sel).forEach(el=>document.body.appendChild(el.cloneNode(true)));
                    response.textContent = 'Cloned matching elements.';
                } else if(cmd.startsWith('text ')) {
                    let parts=cmd.split(' '); let sel=parts[1], val=parts.slice(2).join(' ');
                    document.querySelectorAll(sel).forEach(el=>el.textContent=val);
                    response.textContent = 'Set text of matching elements.';
                } else if(cmd.startsWith('html ')) {
                    let parts=cmd.split(' '); let sel=parts[1], val=parts.slice(2).join(' ');
                    document.querySelectorAll(sel).forEach(el=>el.innerHTML=val);
                    response.textContent = 'Set HTML of matching elements.';
                } else if(cmd.startsWith('toggle ')) {
                    let sel=cmd.split(' ')[1];
                    document.querySelectorAll(sel).forEach(el=>el.style.display=(el.style.display==='none'?'':'none'));
                    response.textContent = 'Toggled visibility of matching elements.';
                } else if(cmd.startsWith('scroll ')) {
                    window.scrollBy(0,parseInt(cmd.split(' ')[1]));
                    response.textContent = 'Scrolled page by specified amount.';
                } else if(cmd.startsWith('goto ')) {
                    let el=document.querySelector(cmd.split(' ')[1]);
                    if(el){ el.scrollIntoView({behavior:'smooth'}); response.textContent='Scrolled to element.'; }
                    else response.textContent='Element not found.';
                } else if(cmd.startsWith('alert ')) { alert(cmd.slice(6)); response.textContent='Alert shown.'; }
                else if(cmd.startsWith('console ')) { console.log(eval(cmd.slice(8))); response.textContent='Result logged to console.'; }
                else if(cmd.startsWith('eval ')) { response.textContent='Result: '+eval(cmd.slice(5)); }
                else if(cmd.startsWith('time ')) { console.time(cmd.slice(5)); response.textContent='Timer started.'; }
                else if(cmd.startsWith('timeEnd ')) { console.timeEnd(cmd.slice(8)); response.textContent='Timer ended.'; }
                else if(cmd.startsWith('localStorage ')) {
                    let parts=cmd.split(' '), key=parts[1], val=parts[2];
                    if(val){ localStorage.setItem(key,val); response.textContent=`Set localStorage["${key}"]="${val}"`; }
                    else response.textContent=localStorage.getItem(key);
                } else if(cmd==='cookies') { response.textContent=document.cookie; }
                else if(cmd==='clearCookies'){ document.cookie.split(";").forEach(c=>document.cookie=c.replace(/^ +/,'').replace(/=.*/,'=;expires='+new Date().toUTCString()+';path=/')); response.textContent='All cookies cleared.'; }
                else if(cmd==='reload'){ location.reload(); }
                else if(cmd.startsWith('redirect ')){ location.href=cmd.split(' ')[1]; }
                else if(cmd.startsWith('zoom ')){ document.body.style.zoom=cmd.split(' ')[1]+'%'; response.textContent='Zoom set.'; }
                else if(cmd==='performance'){ response.textContent=JSON.stringify(window.performance.timing); }
                else if(cmd.startsWith('event ')){ 
                    let parts=cmd.split(' '), el=document.querySelector(parts[1]);
                    if(el){ el.dispatchEvent(new Event(parts[2])); response.textContent='Event triggered.'; } 
                    else response.textContent='Element not found.'; 
                } else if(cmd.startsWith('logStyles ')){ 
                    let el=document.querySelector(cmd.split(' ')[1]); 
                    if(el){ console.log(getComputedStyle(el)); response.textContent='Styles logged.'; } 
                    else response.textContent='Element not found.';
                } else if(cmd==='clear'){ terminalBody.innerHTML=''; terminalBody.appendChild(promptLine); response.textContent='Terminal cleared.'; }
                else if(cmd==='help'){ 
                    response.innerHTML = `
<b>Debug Terminal Commands:</b><br>
info - Shows page info.<br>
log [selector] - Logs matching elements to console.<br>
inspect [selector] - Logs first element of selector.<br>
debug on/off - Toggle outlines for debugging.<br>
hide [selector] / show [selector] - Hide/show elements.<br>
css [selector] [prop] [val] - Set CSS property.<br>
attr [selector] [attr] [val] - Set element attribute.<br>
remove [selector] - Remove elements.<br>
clone [selector] - Clone elements to body.<br>
text [selector] [val] - Set text content.<br>
html [selector] [val] - Set inner HTML.<br>
toggle [selector] - Toggle visibility.<br>
scroll [amount] - Scroll page.<br>
goto [selector] - Scroll to element.<br>
alert [msg] - Show alert.<br>
console [js] - Eval JS and log.<br>
eval [js] - Eval JS and return result.<br>
time [label] / timeEnd [label] - Start/end timer.<br>
localStorage [key] [val] - Get/set localStorage.<br>
cookies / clearCookies - Show/clear cookies.<br>
reload - Reload page.<br>
redirect [url] - Go to URL.<br>
zoom [percent] - Set zoom.<br>
performance - Show performance timings.<br>
event [selector] [event] - Trigger event.<br>
logStyles [selector] - Log computed styles.<br>
clear - Clear terminal.<br>
help - Show this list.
`;
                } else { response.style.color='#ff5555'; response.textContent='Unknown command.'; }
            } catch(err) { response.style.color='#ff5555'; response.textContent='Error: '+err.message; }

            terminalBody.insertBefore(response, promptLine);
            input.innerText='';
            input.focus();
            terminalBody.scrollTop=terminalBody.scrollHeight;
        }
    });
});
