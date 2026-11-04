'use strict';
let danceTimer=null,danceActive=false;
function stopDance(){clearTimeout(danceTimer);danceActive=false;$('bear').classList.remove('dancing');$('dance-stage').hidden=true;$('dance-toggle').textContent='♫ 特朗普同款摆拳';$('dance-toggle').setAttribute('aria-pressed','false');if(!window.isRealtimeActive?.()){Avatar.caption('跳完啦！继续和我聊聊吧。');state('midea 在这里，随时听你说')}}
function startDance(){if(danceActive){stopDance();return}stopSpeaking();danceActive=true;$('dance-stage').hidden=false;$('bear').classList.add('dancing');$('dance-toggle').textContent='停止跳舞';$('dance-toggle').setAttribute('aria-pressed','true');Avatar.caption('跟着节奏，左边摆一摆，右边摆一摆！');state('midea 的双拳摇摆时间 ♫');danceTimer=setTimeout(stopDance,12000)}
window.startDance=startDance;window.stopDance=stopDance;
$('dance-toggle').onclick=startDance;
const previousAsk=ask;ask=async question=>{if(/(跳.*舞|dance|特朗普)/i.test(question)&&!busy){addMessage('user',question);startDance();addMessage('assistant','好呀！看 midea 来一段双拳摇摆舞 ♫',[],null,'形象互动');return}if(danceActive)stopDance();return previousAsk(question)};
window.addEventListener('pagehide',stopDance);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopDance()});
