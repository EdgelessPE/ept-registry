import axios from 'axios';
import fs from 'fs-extra';
import type Http from 'http';
import path from 'path';
import {

  Worker, isMainThread, workerData
} from 'worker_threads';
let pp = "https://zfile.edgeless.top/api/list/2?path=";
if (!fs.pathExistsSync("./mirrors")) fs.mkdirSync("./mirrors");
async function er(e) {
  
     if (e.type == "FILE") {
       if (!fs.pathExistsSync(`./mirrors/${e.path}`)) fs.mkdirSync(`./mirrors/${e.path}`);
       new Worker(__filename, {
        workerData: ["", e]
      })
     } else if (e.type == "FOLDER") {
       
       if (!fs.pathExistsSync("./mirrors/"+e.path+e.name)) fs.mkdirSync("./mirrors/"+e.path+e.name);
       await Sleep(1000)
        let indexe = await axios.get(pp+encodeURIComponent(e.path+e.name));
        if (indexe.data.code != 0) throw "Err";
        let cure = indexe.data.data.files;
        cure.forEach(er);
     }
    }

(async()=> {
  if (isMainThread) {
    //https://zfile.edgeless.top/api/list/2?path=%2F&password=&orderBy=&orderDirection=
    
  let index = await axios.get(pp+encodeURIComponent("/"), {
    headers: {
      referer: "https://zfile.edgeless.top/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36 Edg/90.0.818.62"
    }
  });
  //console.log(pp+encodeURIComponent("/"), );
  //fs.writeFile("./out.txt", JSON.stringify(index.data, null, 4));
  if (index.data.code != 0) throw "Err";
  let cont = index.data.data.files;
  cont.forEach(er)
  } else {
    const data: any[] = workerData;
    worker(data[0], data[1]);
  }
  
})();

export async function worker(cur: any, uu: any) {
  
  if (!fs.pathExistsSync(`./mirrors/${uu.path}`)) fs.mkdirSync(`./mirrors/${uu.path}`);
      console.log("worker",uu, "start");
      console.log(!fs.pathExistsSync(`./mirrors/${uu.path}`))
      let ccc;
      try { ccc = await axios.get(encodeURI(uu.url), {
        responseType: 'stream',
        proxy: {
          host: "localhost",
          port: 10089,
          protocol: "http"
        }
      }); } catch {};
      let ccd = ccc.data as Http.IncomingMessage;
      let length = Math.max();
      if (ccd.headers['content-length'] != undefined) {
        length = parseInt(ccd.headers['content-length'], 10);
      };
      let ate = 0;
      console.log("worker","Current: ",uu);
      console.log("worker","Length: ", length);
      let stream = fs.createWriteStream(path.resolve('./mirrors',uu.path,uu.name));
      ccd.on("data", (chunk) => {
        ate += chunk.length;
        stream.write(chunk);
        console.log("worker",uu.name,", ",(ate/1024/1024).toFixed(2),"/",(length/1024/1024).toFixed(2), "MiB, Speed: ", (chunk.length).toFixed(2),"MiB/chunk");
      });
      await (new Promise(r => ccd.on("close", r)));
      stream.close();
      console.log(uu.name, "ok");
    }


function Sleep(ms: number): Promise<void> {
  return new Promise(r => {
    setTimeout(r, ms);
  })
}