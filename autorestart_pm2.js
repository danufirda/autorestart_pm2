const pm2 = require('pm2');
const { history } = require('./helper');

function cekPm2() {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      pm2.list((err, processes) => {
        if (err) {
          console.error(err);
          pm2.disconnect();
          reject(err);
          return;
        }
        pm2.disconnect();
        resolve(processes);
      });
    });
  });
}

async function restart(proses){
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        // process.exit(2);
      }
      const processId = proses.pm_id;
      // Restart the process by ID
      pm2.restart(processId, (err, proc) => {
        if (err) {
          console.error(err);
          pm2.disconnect();
          return;
        }
        console.log(`Process ${proses.pm_id} | ${proses.name} restarted`);
        pm2.disconnect();
      });
    });
}

async function autoRestart(){
    let cekData = await cekPm2();
    let offlineCount = 0;
    for(let em of cekData){
        if(em?.pm2_env?.status!='online'){
            console.log('Warning not online ',em.pm_id, em.name, em.pm2_env.status);
            restart({name: em.name, pm_id: em.pm_id});
            offlineCount = offlineCount+1;
            history({name: em.name});
        }
    }
    if(offlineCount==0){
        console.log('Tidak ada pm2 offline!');
    }
}

autoRestart();

setInterval(()=>{
    autoRestart();
}, 10000)