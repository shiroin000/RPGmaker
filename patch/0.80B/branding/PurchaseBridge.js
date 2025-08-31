/*:
 * @plugindesc Open checkout page & receive result (PayPal → itch key)
 */
(() => {
  if (!(window.nw && typeof require === 'function')) {
    console.warn('[PurchaseBridge] NW.js only'); return;
  }
  const P = PluginManager.parameters('QJ.PurchaseBridge');
  const googleUrl = "https://script.google.com/macros/s/AKfycbxG4oZnKKGyjhGw8shXLIuFvRiM_RLrj4QSerIqJ7R3PrnKxcmxdq3oemkM8oxnEvOZ/exec";
  const CHECKOUT = googleUrl;
  const BACKEND  = googleUrl;
  const SW = 0;
  const VAR = 0;

  const http = require('http'); const https = require('https'); const {URL} = require('url');
  function getJSON(urlStr){
    const u=new URL(urlStr); const lib=u.protocol==='https:'?https:http;
    return new Promise((res,rej)=>{
      const req=lib.request({method:'GET',hostname:u.hostname,port:u.port|| (u.protocol==='https:'?443:80),path:u.pathname+u.search},r=>{
        let b=[]; r.on('data',d=>b.push(d)); r.on('end',()=>{try{
          const j=JSON.parse(Buffer.concat(b).toString('utf8'));
          (r.statusCode>=200&&r.statusCode<300)?res(j):rej(j);
        }catch(e){rej(e);}});
      }); req.on('error',rej); req.end();
    });
  }
  function rand(n=16){ return require('crypto').randomBytes(n).toString('hex'); }

  window.QJ_Purchase = {
    start(amount='15.00', currency='USD'){
      return new Promise((resolve,reject)=>{
        const state = rand(8);
        const server = http.createServer(async (req,res)=>{
          try{
            const u = new URL(req.url, 'http://127.0.0.1');
            if (u.pathname !== '/cb') { res.writeHead(404); return res.end(); }
            if (u.searchParams.get('state') !== state) { res.writeHead(400); return res.end('bad state'); }
            const ticket = u.searchParams.get('ticket') || '';
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end('<html><body>Thank you! You can close this window.<script>window.close&&window.close()</script></body></html>');
            try{ server.close(); }catch(_){}

            // 向后端查询结果（应返回 {status:'COMPLETED', itchKeyUrl:'...'}）
            const verifyUrl = `${BACKEND}?action=verify&ticket=${encodeURIComponent(ticket)}`;
            const result = await getJSON(verifyUrl);
            if (VAR) $gameVariables.setValue(VAR, JSON.stringify(result));
            if (SW)  $gameSwitches.setValue(SW, result && result.status === 'COMPLETED');
            resolve(result);
          }catch(e){ try{server.close();}catch(_){} reject(e); }
        });
        server.listen(0,'127.0.0.1',()=>{
          const port = server.address().port;
          const cb = `http://127.0.0.1:${port}/cb`;
		  console.log(cb);
          const q = new URLSearchParams({ amount, currency, state, cb }).toString();
          nw.Shell.openExternal(`${CHECKOUT}?${q}`);
        });
      });
    }
  };

  // 事件命令：Purchase_Start [amount] [currency]
  const _pc = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(c,a){
    _pc.call(this,c,a);
    if (String(c).toLowerCase()==='purchase_start'){
      QJ_Purchase.start(a?.[0]||'15.00', a?.[1]||'USD').catch(e=>console.error(e));
    }
  };
})();
