'use strict';
let rtc=null,rtcChannel=null,rtcMedia=null,rtcAudio=null,frameTimer=null,callTimer=null,connectTimer=null,rtcEpoch=0,frameIds=[],handledTools=new Set(),toolAbort=null,callStarting=false,rtcVideoMode=true;
function rtcSend(event){if(rtcChannel?.readyState==='open')rtcChannel.send(JSON.stringify(event))}
function captureFrame(){const v=$('camera');if(!v.videoWidth||!v.videoHeight)return null;const c=document.createElement('canvas');c.width=Math.min(v.videoWidth,640);c.height=Math.round(v.videoHeight*c.width/v.videoWidth);c.getContext('2d').drawImage(v,0,0,c.width,c.height);let image=c.toDataURL('image/jpeg',.55);while(image.length>48000&&c.width>160){const copy=document.createElement('canvas');copy.width=Math.round(c.width*.75);copy.height=Math.round(c.height*.75);copy.getContext('2d').drawImage(c,0,0,copy.width,copy.height);c.width=copy.width;c.height=copy.height;c.getContext('2d').drawImage(copy,0,0);image=c.toDataURL('image/jpeg',.5)}return image.length<=48000?image:null}
function pushFrame(){if(rtcChannel?.readyState!=='open'||rtcChannel.bufferedAmount>180000)return;const data=captureFrame();if(!data)return;const id='frame_'+crypto.randomUUID().replaceAll('-','').slice(0,20);rtcSend({type:'conversation.item.create',item:{id,type:'message',role:'user',content:[{type:'input_image',image_url:data}]}});frameIds.push(id);if(frameIds.length>3)rtcSend({type:'conversation.item.delete',item_id:frameIds.shift()})}
function callControls(active){$('start-camera').hidden=active;$('start-camera').disabled=false;$('start-camera').textContent='开始实时通话';$('stop-camera').hidden=!active;$('mute-call').hidden=!active;$('capture').hidden=true;$('camera-placeholder').hidden=active;$('mic').disabled=active;$('hero-talk').disabled=false;$('hero-talk').textContent=active?'结束语音对话':'♩ 和 midea 说话';$('greet-avatar').disabled=active;$('send').disabled=active;$('question').disabled=active;document.querySelectorAll('[data-q]').forEach(b=>b.disabled=active);$('ai-settings').disabled=active;$('sound').disabled=active;$('settings').disabled=active;}
function stopRealtime(){rtcEpoch++;callStarting=false;clearInterval(frameTimer);clearTimeout(callTimer);clearTimeout(connectTimer);toolAbort?.abort();toolAbort=null;const peer=rtc;rtc=null;rtcChannel?.close();rtcChannel=null;peer?.close();rtcMedia?.getTracks().forEach(t=>t.stop());rtcMedia=null;if(rtcAudio){rtcAudio.pause();rtcAudio.srcObject=null;rtcAudio.remove();rtcAudio=null}$('camera').srcObject=null;$('resume-audio').hidden=true;frameIds=[];handledTools.clear();Avatar.reset();callControls(false);$('mute-call').textContent='关闭麦克风';document.querySelector('.camera-badge').textContent='已结束 · 不传输音频与画面';if(AI.connected)$('ai-badge').textContent='后端已连接';state('midea 在这里，随时听你说')}
window.stopRealtime=stopRealtime;window.isRealtimeActive=()=>!!rtc||callStarting;
async function handleRtc(event,epoch){if(epoch!==rtcEpoch)return;
 if(event.type==='input_audio_buffer.speech_started'){pushFrame();Avatar.speakingState(false);Avatar.caption('正在听你说…');state('正在听你说，可以随时打断我…')}
 if(event.type==='conversation.item.input_audio_transcription.completed'&&event.transcript)addMessage('user',event.transcript,[],null,'实时语音');
 if(event.type==='response.output_audio_transcript.delta'){Avatar.caption((Avatar.transcript==='正在听你说…'?'':Avatar.transcript)+(event.delta||''))}
 if(event.type==='response.created')Avatar.transcript='';
 if(event.type==='response.output_audio_transcript.done'&&event.transcript){Avatar.caption(event.transcript);addMessage('assistant',event.transcript,[],null,'实时语音')}
 if(event.type==='output_audio_buffer.started'){Avatar.speakingState(true);state('midea 正在说话…')}
 if(event.type==='output_audio_buffer.stopped'||event.type==='output_audio_buffer.cleared'){Avatar.speakingState(false);state(rtcVideoMode?'正在听你说，也在关注最新画面…':'正在听你说…')}
 if(event.type==='error'){toast('实时服务返回错误，请结束后重试');stopRealtime();return}
 if(event.type==='response.done'){
  const status=event.response?.status;if(status==='failed'){toast('本轮实时回答失败，请重试');return}
  for(const item of event.response?.output||[]){if(item.type!=='function_call'||item.name!=='lookup_support'||handledTools.has(item.call_id))continue;handledTools.add(item.call_id);state('正在查询美的支持资料…');let result;
   try{const args=JSON.parse(item.arguments);if(typeof args.question!=='string')throw new Error('查询参数无效');toolAbort=new AbortController();result=await AI.chat(args.question,captureFrame(),toolAbort.signal);if(epoch!==rtcEpoch)return;addMessage('assistant',result.text,result.sources,null,'官方资料检索');}
   catch(e){if(epoch!==rtcEpoch)return;result={error:'资料查询失败，请告知用户暂时无法验证，不能猜测具体操作。'};toast(e.message)}
   if(epoch!==rtcEpoch)return;rtcSend({type:'conversation.item.create',item:{type:'function_call_output',call_id:item.call_id,output:JSON.stringify(result)}});rtcSend({type:'response.create'});
  }
 }
}
async function startRealtime(video=true){if(callStarting||rtc)return;if(busy){toast('请等本次问答完成后再开始通话');return}if(!AI.connected){$('ai-dialog').showModal();toast('先连接后端，才能开始真实音视频通话');return}if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection){toast('当前浏览器不支持实时通话，请使用支持 WebRTC 的 HTTPS 浏览器');return}stopSpeaking();recognition?.abort();stopCamera();const epoch=++rtcEpoch;rtcVideoMode=video;callStarting=true;callControls(true);$('hero-talk').textContent='取消连接';$('start-camera').disabled=true;$('start-camera').textContent='正在连接…';state('正在连接实时音视频…');
 try{
  const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:video?{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480}}:false});if(epoch!==rtcEpoch){media.getTracks().forEach(t=>t.stop());return}rtcMedia=media;if(video){$('camera').srcObject=media;await $('camera').play()};if(epoch!==rtcEpoch){media.getTracks().forEach(t=>t.stop());return}
  const peer=new RTCPeerConnection();rtc=peer;rtcAudio=document.createElement('audio');rtcAudio.autoplay=true;rtcAudio.setAttribute('playsinline','');document.body.append(rtcAudio);
  peer.ontrack=e=>{if(epoch!==rtcEpoch)return;rtcAudio.srcObject=e.streams[0]||new MediaStream([e.track]);Avatar.attachAudio(rtcAudio.srcObject);rtcAudio.play().catch(()=>{$('resume-audio').hidden=false;toast('请点击“播放通话声音”以启用语音')})};
  for(const track of media.getAudioTracks())peer.addTrack(track,media);
  const channel=peer.createDataChannel('oai-events');rtcChannel=channel;
  channel.onmessage=e=>{try{handleRtc(JSON.parse(e.data),epoch).catch(()=>{if(epoch===rtcEpoch)toast('本轮消息处理失败，请重试')})}catch{}};
  channel.onopen=()=>{if(epoch!==rtcEpoch)return;clearTimeout(connectTimer);callStarting=false;callControls(true);$('ai-badge').textContent='OpenAI · 实时通话';Avatar.caption('已接通，直接和我说话吧。');document.querySelector('.camera-badge').textContent=rtcVideoMode?'通话中 · 实时语音 / 每 2 秒更新画面':'通话中 · 实时语音';state('已接通，直接和 midea 说话吧');pushFrame();frameTimer=setInterval(pushFrame,2000);callTimer=setTimeout(()=>{stopRealtime();toast('本次体验已达 10 分钟，已结束；可重新连接')},600000)};
  channel.onclose=()=>{if(epoch===rtcEpoch){stopRealtime();toast('实时通话已断开')}};
  peer.onconnectionstatechange=()=>{if(epoch===rtcEpoch&&['failed','disconnected'].includes(peer.connectionState)){stopRealtime();toast('连接已中断，音视频传输已停止，请重新连接')}};
  const offer=await peer.createOffer();await peer.setLocalDescription(offer);const answer=await AI.request('/realtime',{sdp:offer.sdp},AbortSignal.timeout(35000));if(epoch!==rtcEpoch)return;await peer.setRemoteDescription({type:'answer',sdp:answer.sdp});connectTimer=setTimeout(()=>{if(epoch===rtcEpoch&&channel.readyState!=='open'){stopRealtime();toast('实时连接超时，请重试')}},20000);
 }catch(e){if(epoch!==rtcEpoch)return;stopRealtime();toast(e.name==='NotAllowedError'?'请允许摄像头与麦克风权限后重试':e.message||'连接失败，请重试')}
}
$('start-camera').onclick=()=>startRealtime(true);$('hero-talk').onclick=()=>{if(rtc||callStarting){stopRealtime();return}if(AI.connected)startRealtime(false);else{$('mic').click()}};$('stop-camera').onclick=()=>stopRealtime();$('capture').hidden=true;
$('mute-call').onclick=()=>{if(!rtcMedia)return;const tracks=rtcMedia.getAudioTracks();const enabled=!tracks[0]?.enabled;tracks.forEach(t=>t.enabled=enabled);$('mute-call').textContent=enabled?'关闭麦克风':'开启麦克风';state(enabled?'麦克风已开启':rtcVideoMode?'麦克风已关闭，画面仍在更新':'麦克风已关闭')};
$('resume-audio').onclick=async()=>{try{await rtcAudio?.play();$('resume-audio').hidden=true}catch{toast('声音播放失败，请检查浏览器权限')}};
const originalSetMode=setMode;setMode=video=>{if(rtc||callStarting)stopRealtime();originalSetMode(video)};
window.addEventListener('pagehide',stopRealtime);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRealtime()});
