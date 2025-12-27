document.addEventListener('DOMContentLoaded', function() {
    window.reverseSearch = {
        active: false,
        query: '',
        index: null,
        matchedCommands: []
    };

    if (document.getElementById('customTerminal')) return;

    var link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    var style = document.createElement('style');
    style.textContent =
        "#customTerminal { position:fixed; width:300px; height:300px; min-width:300px; min-height:300px; z-index:99999; transform:scale(0); opacity:0; transition:transform 0.3s ease, opacity 0.3s ease; font-family:'Inter', sans-serif; }" +
        "#customTerminal.show { transform:scale(1); opacity:1; }" +
        ".terminal_toolbar { display:flex; align-items:center; justify-content:space-between; height:39px; padding:0 10px; box-sizing:border-box; border-top-left-radius:5px; border-top-right-radius:5px; background:#212121; cursor:grab; font-family:'Inter', sans-serif; }" +
        ".butt { display:flex; align-items:center; gap:6px; }" +
        ".btn { display:flex; justify-content:center; align-items:center; padding:0; font-size:10px; height:16px; width:16px; border:none; border-radius:100%; background:linear-gradient(#7d7871 0%,#595953 100%); text-shadow:0px 1px 0px rgba(255,255,255,0.2); box-shadow:0px 0px 1px 0px #41403A,0px 1px 1px 0px #474642; }" +
        ".btn-color { background:#ee411a; cursor:pointer; }" +
        ".btn:hover { cursor:pointer; }" +
        ".user { color:#d5d0ce; font-size:14px; line-height:17px; white-space: nowrap; }" +
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
            '</div>' +
        '</div>';
    document.body.appendChild(term);

    var resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.right = '2px';
    resizeHandle.style.bottom = '2px';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.background = 'rgba(255,255,255,0.1)';
    resizeHandle.style.borderRadius = '3px';
    term.appendChild(resizeHandle);

    var isResizing = false, startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(term).width, 10);
        startHeight = parseInt(window.getComputedStyle(term).height, 10);
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        term.style.width = startWidth + (e.clientX - startX) + 'px';
        term.style.height = startHeight + (e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', function() {
        isResizing = false;
        document.body.style.userSelect = 'auto';
    });

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

        // Initialize history
        if (!window.commandHistory) window.commandHistory = [];
        if (typeof window.historyIndex === 'undefined') window.historyIndex = window.commandHistory.length;

        // Arrow Up / Down
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (e.key === 'ArrowUp') {
                if (window.historyIndex > 0) window.historyIndex--;
            } else if (e.key === 'ArrowDown') {
                if (window.historyIndex < window.commandHistory.length - 1) window.historyIndex++;
                else { window.historyIndex = window.commandHistory.length; input.innerText = ''; e.preventDefault(); return; }
            }

            if (window.commandHistory[window.historyIndex] !== undefined) {
                input.innerText = window.commandHistory[window.historyIndex];
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(input);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            e.preventDefault();
            return;
        }

        // Enter key
        if (e.key === 'Enter') {
            e.preventDefault();
            var cmd = input.innerText.trim();
            if (!cmd) return;

            // Add command to history
            window.commandHistory.push(cmd);
            window.historyIndex = window.commandHistory.length;

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
                } else if (cmd.startsWith('theme ')) {
                    let theme = cmd.split(' ')[1];
                    if(theme === 'dark') document.querySelector('#customTerminal .terminal_body').style.background = 'rgba(0,0,0,0.6)';
                    else if(theme === 'light') document.querySelector('#customTerminal .terminal_body').style.background = 'rgba(255,255,255,0.9)';
                    else response.textContent = 'Unknown theme';
                    response.textContent = 'Theme set to ' + theme;
                } else if (cmd.startsWith('opacity ')) {
                    let val = parseFloat(cmd.split(' ')[1]);
                    if(isNaN(val) || val < 0 || val > 1) { response.textContent = 'Enter value 0-1'; }
                    else { term.style.opacity = val; response.textContent = `Opacity set to ${val}`; }
                } else if (cmd.startsWith('draglock ')) {
                    let state = cmd.split(' ')[1];
                    if(state === 'on') term.querySelector('.terminal_toolbar').style.pointerEvents = 'none';
                    else term.querySelector('.terminal_toolbar').style.pointerEvents = 'auto';
                    response.textContent = 'Draglock ' + state;
                } else if (cmd.startsWith('copy ')) {
                    let sel = cmd.slice(5).trim();
                    let el = document.querySelector(sel);
                    if(el){ navigator.clipboard.writeText(el.textContent); response.textContent='Copied to clipboard.'; }
                    else response.textContent='Element not found.';
                } else if (cmd.startsWith('highlight ')) {
                    let parts = cmd.split(' ');
                    let color = parts[parts.length-1]; // last word is color
                    let sel = cmd.slice(10, cmd.length - color.length).trim(); // everything before color
                    if(!sel){ response.style.color='#ff5555'; response.textContent='Usage: highlight <selector> <color>'; }
                    else {
                        document.querySelectorAll(sel).forEach(el=>el.style.outline=`2px solid ${color}`);
                        response.textContent=`Highlighted "${sel}" with ${color}`;
                    }
                } else if(cmd === 'clearStorage') {
                    localStorage.clear(); response.textContent='localStorage cleared.';
                } else if(cmd.startsWith('cookies set ')) {
                    let parts=cmd.split(' '); document.cookie=`${parts[2]}=${parts[3]};path=/`; response.textContent='Cookie set.';
                } else if(cmd.startsWith('cookies delete ')) {
                    let parts=cmd.split(' '); document.cookie=`${parts[2]}=;expires=${new Date(0).toUTCString()};path=/`; response.textContent='Cookie deleted.';
                } else if(cmd.startsWith('wrap ')) {
                    let parts = cmd.split(' '); let tag = parts[parts.length-1]; 
                    let sel = cmd.slice(5, cmd.length - tag.length).trim();
                    document.querySelectorAll(sel).forEach(el=>{
                        let wrapper=document.createElement(tag); el.parentNode.insertBefore(wrapper, el); wrapper.appendChild(el);
                    }); response.textContent='Elements wrapped.';
                } else if(cmd.startsWith('unwrap ')) {
                    let sel = cmd.slice(7).trim();
                    document.querySelectorAll(sel).forEach(el=>{
                        let parent = el.parentNode;
                        if(parent && parent.parentNode){
                            parent.parentNode.insertBefore(el, parent);
                            if(parent.childNodes.length===0) parent.remove();
                        }
                    }); response.textContent='Elements unwrapped.';
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

    // Create or show debug overlay
    let debugOverlay = document.getElementById('debugOverlay');
    if (!debugOverlay) {
        debugOverlay = document.createElement('div');
        debugOverlay.id = 'debugOverlay';
        debugOverlay.style.position = 'fixed';
        debugOverlay.style.top = '10px';
        debugOverlay.style.right = '10px';
        debugOverlay.style.zIndex = '100000';
        debugOverlay.style.background = 'rgba(0,0,0,0.8)';
        debugOverlay.style.color = '#00ff99';
        debugOverlay.style.fontFamily = 'monospace';
        debugOverlay.style.fontSize = '12px';
        debugOverlay.style.padding = '5px';
        debugOverlay.style.borderRadius = '5px';
        debugOverlay.style.maxWidth = '300px';
        debugOverlay.style.maxHeight = '400px';
        debugOverlay.style.overflow = 'auto';
        debugOverlay.style.pointerEvents = 'none';
        document.body.appendChild(debugOverlay);
    }
    debugOverlay.style.display = 'block';

    // Show element info on mouse move
    document.addEventListener('mousemove', function debugMouseMove(e) {
        let el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;

        let info = `
Tag: ${el.tagName.toLowerCase()}
ID: ${el.id || 'none'}
Class: ${el.className || 'none'}
Size: ${el.offsetWidth}x${el.offsetHeight}
Text: ${el.textContent.trim().slice(0,50)}
`;
        if(el.tagName.toLowerCase() === 'img') info += `Src: ${el.src}\n`;

        debugOverlay.textContent = info;
    });

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
                } else if (cmd.startsWith('font ')) {
                    let parts = cmd.split(' ');
                    if (parts.length < 3) {
                        response.style.color = '#ff5555';
                        response.textContent = 'Usage: font <selector> <google fonts link>';
                    } else {
                        let fontLink = parts[parts.length - 1];
                        let sel = cmd.slice(5, cmd.length - fontLink.length).trim();
                        let link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = fontLink;
                        document.head.appendChild(link);
                        let fontName = decodeURIComponent((new URL(fontLink)).searchParams.get('family') || '').split(':')[0].replace(/\+/g, ' ');
                        document.querySelectorAll(sel).forEach(el => el.style.fontFamily = `'${fontName}', sans-serif`);
                        response.textContent = `Applied Google Font "${fontName}" to "${sel}".`;
                    }
                } else if (cmd.startsWith('bold ')) {
                    let sel = cmd.slice(5).trim();
                    if (!sel) {
                        response.style.color = '#ff5555';
                        response.textContent = 'Usage: bold <selector>';
                    } else {
                        document.querySelectorAll(sel).forEach(el => el.style.fontWeight = 'bold');
                        response.textContent = `Made text bold for "${sel}".`;
                    }
                    } else if (cmd.startsWith('italic ')) {
                    let sel = cmd.slice(7).trim();
                    if (!sel) {
                        response.style.color = '#ff5555';
                        response.textContent = 'Usage: italic <selector>';
                    } else {
                        document.querySelectorAll(sel).forEach(el => el.style.fontStyle = 'italic');
                        response.textContent = `Made text italic for "${sel}".`;
                    }
                } else if (cmd.startsWith('normal ')) {
                    let sel = cmd.slice(7).trim();
                    if (!sel) {
                        response.style.color = '#ff5555';
                        response.textContent = 'Usage: normal <selector>';
                    } else {
                        document.querySelectorAll(sel).forEach(el => {
                            el.style.fontWeight = 'normal';
                            el.style.fontStyle = 'normal';
                        });
                        response.textContent = `Reset font style and weight for "${sel}".`;
                    }
                } else if (cmd.startsWith('weight ')) {
                    let parts = cmd.split(' ');
                    if (parts.length < 3) {
                        response.style.color = '#ff5555';
                        response.textContent = 'Usage: weight <selector> <value>';
                    } else {
                        let weight = parts[parts.length - 1];
                        let sel = cmd.slice(7, cmd.length - weight.length).trim();
                        document.querySelectorAll(sel).forEach(el => el.style.fontWeight = weight);
                        response.textContent = `Set font weight "${weight}" for "${sel}".`;
                    }
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
                else { response.style.color='#ff5555'; response.textContent='Unknown command.'; }
            } catch(err) { response.style.color='#ff5555'; response.textContent='Error: '+err.message; }

            terminalBody.insertBefore(response, promptLine);
            input.innerText='';
            input.focus();
            terminalBody.scrollTop=terminalBody.scrollHeight;
        }
    });
});
