(()=>{
  if(window.parent===window) return;
  const sendHeight=()=>{
    const height=Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    window.parent.postMessage({type:'stotenCompareHeight',height},'*');
  };
  window.addEventListener('load',sendHeight);
  window.addEventListener('resize',sendHeight);
  if('ResizeObserver' in window){
    new ResizeObserver(sendHeight).observe(document.documentElement);
  }else{
    setInterval(sendHeight,1000);
  }
  setTimeout(sendHeight,100);
  setTimeout(sendHeight,700);
})();
