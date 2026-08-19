@echo off
title CityMap - laat dit venster open staan
cd /d "%~dp0"
echo.
echo   CityMap start op http://localhost:8800/citymap.html
echo   Laat dit venster open zolang je de tool gebruikt.
echo   Sluiten: dit venster dichtdoen of Ctrl+C.
echo.
start "" http://localhost:8800/citymap.html
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/citymap.html';f.readFile(p.join(process.cwd(),u),(e,d)=>{if(e){r.writeHead(404);r.end('niet gevonden');return}r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(d)})}).listen(8800,()=>console.log('Server draait. Wacht op de browser...'))"
if errorlevel 1 (
  echo.
  echo   Node.js niet gevonden of poort 8800 al bezet.
  pause
)
